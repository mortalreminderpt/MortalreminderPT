import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { readJson, discoverSources, normalizeRoute, digest } from './i18n-core.mjs';
import { prepareTranslations } from './translate-content.mjs';

await prepareTranslations({check:true});
const routes=await readJson('.generated/routes.json');
const pages=await Promise.all(routes.map(route=>readJson('.generated/pages/'+route.file)));
const byRoute=new Map(pages.map(page=>[normalizeRoute(page.route),page]));
const sources=await discoverSources();const labels=await readJson('content/i18n/ui.json');
const ignored=new Set(['data-action','data-src','data-ll-status','data-homepage','aria-label','aria-live','aria-hidden','aria-modal','role','tabindex','onkeydown','onclick','onsubmit']);
function canonical(node){
  if(node.type==='comment'||['script','link','meta'].includes(node.name))return null;
  if(node.type==='text'){const value=node.data.replace(/\s+/g,' ').trim();return value||null;}
  const attributes={};
  for(let[key,value]of Object.entries(node.attribs||{}).sort()){
    if(ignored.has(key)||key.startsWith('on')||key.startsWith('#')||key==='='||key==='=""')continue;
    if(key==='class')value=value.split(/\s+/).filter(v=>!['loaded','entered'].includes(v)).sort().join(' ');
    if(key==='src')value=value.replace(/^\/zh-cn\/(images|css|js)\//,'/$1/');
    if(key==='style')value=value.split(';').map(v=>v.trim().replace(/\s*:\s*/g,':')).filter(Boolean).sort().join(';');
    if(key==='alt'&&!value)continue;attributes[key]=value;
  }
  if(node.name==='img'&&node.attribs?.['data-src'])attributes.src=node.attribs['data-src'].replace(/^\/zh-cn\/(images|css|js)\//,'/$1/');
  return {name:node.name,attrs:Object.fromEntries(Object.entries(attributes).sort()),children:(node.children||[]).map(canonical).filter(value=>value!==null)};
}
const fragments=new Set();let preserved=0;const counts={en:0,'zh-cn':0};let checkedAlternates=0;
for(const page of pages){
  const filename=path.join('out',page.route.endsWith('.html')?page.route.slice(1):page.route.slice(1)+'index.html');
  const html=await fs.readFile(filename,'utf8'),$=load(html);
  assert.equal($('title').first().text(),page.title,'Page title: '+page.route);
  assert.equal($('html').attr('lang'),page.lang==='zh-cn'?'zh-CN':'en','HTML language: '+page.route);
  for(const selector of ['main.content','header.header','footer.footer'])assert.equal($(selector).length,1,page.route+' '+selector);
  assert.equal($('.nav__link[href="'+(page.lang==='zh-cn'?'/zh-cn/':'/')+'"]').first().text(),page.lang==='en'?'HOME':labels[page.lang].home);
  if(page.kind!=='404'||page.route!=='/404.html'){
    assert.equal($('link[rel="canonical"]').attr('href'),'https://ptzhao.com'+(page.canonicalRoute||page.route),'Canonical: '+page.route);
    for(const[lang,target]of Object.entries(page.alternates||{})){
      assert.ok(byRoute.has(normalizeRoute(target)),'Missing alternate: '+target);
      const hreflang=lang==='zh-cn'?'zh-CN':lang;
      assert.equal($(`link[rel="alternate"][hreflang="${hreflang}"]`).attr('href'),'https://ptzhao.com'+target,page.route+' '+hreflang);checkedAlternates++;
    }
  }
  if(page.kind==='redirect'){
    assert.ok(byRoute.has(normalizeRoute(page.redirectTo)));assert.ok($('meta[http-equiv="refresh"]').attr('content')?.includes(page.redirectTo));assert.match($('meta[name=robots]').attr('content'),/noindex/);
  }
  $('include[src]').each((i,element)=>fragments.add($(element).attr('src')));
  if(page.kind==='post'){
    counts[page.lang]++;
    const expected=load('<div class="post__content">'+page.contentHtml+'</div>');
    try { assert.deepEqual(canonical($('.post__content')[0]),canonical(expected('.post__content')[0])); }
    catch(error){throw new Error('Rendered article changed: '+page.route+'\n'+error.message.slice(0,1000));}
    const source=sources.find(source=>source.id===page.translationId);assert.ok(source);
    const alternate=byRoute.get(normalizeRoute(page.alternates[page.lang==='en'?'zh-cn':'en']));assert.equal(alternate.translationId,page.translationId);assert.deepEqual(alternate.tagIds,page.tagIds);assert.deepEqual(alternate.categoryIds,page.categoryIds);
    const snapshot=source.snapshots[page.lang];
    if(snapshot){
      const original=await readJson('content/rendered/'+snapshot.file);
      const raw=page.lang===source.sourceLang?source.raw:await fs.readFile(`content/translations/${page.lang}/${source.id}.md`,'utf8');
      if(digest(raw)===snapshot.rawDigest){
        const previous=load(original.contentHtml),current=load(page.contentHtml);
        assert.equal(current.text().replace(/\s+/g,' ').trim(),previous.text().replace(/\s+/g,' ').trim(),'Original article prose changed: '+page.route);
        assert.deepEqual(current('pre').map((i,e)=>current(e).text()).get(),previous('pre').map((i,e)=>previous(e).text()).get(),'Original code changed: '+page.route);preserved++;
      }
    }
    for(const[id,target]of Object.entries(page.anchorTranslations||{}))assert.ok(load(alternate.contentHtml)(`[id="${target.replaceAll('"','\\"')}"]`).length,'Missing mapped heading: '+page.route+' #'+id);
  }
}
assert.equal(counts.en,sources.length);assert.equal(counts['zh-cn'],sources.length);
for(const lang of ['en','zh-cn']){
  const posts=pages.filter(page=>page.kind==='post'&&page.lang===lang);
  const search=await readJson(`public/data/search-${lang}.json`);assert.equal(search.length,posts.length);assert.equal(new Set(search.map(item=>item.url)).size,posts.length);
  for(const item of search){const post=byRoute.get(normalizeRoute(item.url));assert.equal(post.lang,lang);assert.equal(item.title,post.postTitle);assert.equal(item.tags,post.tags.join(', '));assert.equal(item.category,post.categories.join(', '));}
  const blogs=pages.filter(page=>page.kind==='blog'&&page.lang===lang).sort((a,b)=>a.pageNumber-b.pageNumber);
  assert.equal(blogs.length,Math.ceil(posts.length/8));assert.equal(blogs.reduce((count,page)=>count+page.cards.length,0),posts.length);
  for(const type of ['tags','categories']){
    const property=type==='tags'?'tagIds':'categoryIds';const archives=pages.filter(page=>page.kind==='archive'&&page.lang===lang&&page.taxonomyType===type);
    for(const archive of archives){const members=posts.filter(post=>post[property].includes(archive.taxonomyId));assert.equal(archive.cards.length,members.length);}
    const index=byRoute.get((lang==='zh-cn'?'/zh-cn':'')+'/'+type+'/');assert.equal(new Set(index.cards.map(card=>card.title)).size,index.cards.length,'Duplicate localized taxonomy label');
  }
  const xml=await fs.readFile(lang==='en'?'out/feed.xml':'out/zh-cn/feed.xml','utf8');assert.ok(xml.includes(`<language>${lang==='en'?'en':'zh-CN'}</language>`));
}
for(const fragment of fragments)assert.ok((await fs.stat(path.join('out',fragment))).isFile(),'Missing formula: '+fragment);
const legacy=await readJson('content/routes.json');let oldPaths=0;
for(const route of legacy){if(byRoute.has(normalizeRoute(route.route)))oldPaths++;else if(route.kind!=='post')throw new Error('Lost legacy path: '+route.route);}
const report={sourceArticles:sources.length,localizedArticles:counts,routes:pages.length,legacyPathsAvailable:oldPaths,preservedOriginalArticles:preserved,formulaFragments:fragments.size,checkedAlternates,differences:0};
await fs.mkdir('.artifacts',{recursive:true});await fs.writeFile('.artifacts/content-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
