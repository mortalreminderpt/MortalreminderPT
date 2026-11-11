import fs from 'node:fs/promises';
import matter from 'gray-matter';
import { load } from 'cheerio';
import { repairCachedMath } from './markdown.mjs';
import { languages, readJson, digest, escape, prefixFor, baseRoute, localizedRoute, normalizeRoute, discoverSources, asArray, taxonomyLookup, validateTaxonomy, readTranslation, otherLanguage, payloadDigest } from './i18n-core.mjs';

const ui=await readJson('content/i18n/ui.json');
const unique=values=>[...new Set(values)];
export const formatDate=(date,lang)=>new Intl.DateTimeFormat(lang==='zh-cn'?'zh-CN':'en-US',{timeZone:'Australia/Melbourne',year:'numeric',month:lang==='zh-cn'?'long':'short',day:'numeric'}).format(new Date(date));
export function readingMinutes(html){
  const text=load(html).text();const han=(text.match(/\p{Script=Han}/gu)||[]).length;
  const words=text.replace(/\p{Script=Han}/gu,' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1,Math.ceil(han/450+words/200));
}
export const readingText=post=>ui[post.lang].reading.replace('{count}',String(readingMinutes(post.contentHtml)));
const countText=(count,lang)=>count===1?ui[lang].postFound:ui[lang].postsFound.replace('{count}',String(count));
const dateHtml=post=>`<time class="article__date" datetime="${post.date}">${formatDate(post.date,post.lang)}</time>`;
const tagLinks=post=>(post.tagIds||[]).map((id,i)=>`<a class="article__tag" href="${prefixFor(post.lang)}/tags/${id}/">${escape(post.tags[i])}</a>`).join('\n');
export function makeCard(post,site,mode='normal'){
  const prefix=prefixFor(post.lang),t=ui[post.lang];
  return {
    className:mode==='featured'?'article col col-4 col-d-6 col-t-12 animate':'article col col-4 col-d-6 col-t-12 grid__post animate',
    image:post.image?{href:post.route,src:post.image,alt:post.postTitle}:null,featured:mode==='featured',
    metaHtml:mode==='featured'?`<span class="article__minutes">${readingText(post)}</span>\n${dateHtml(post)}`:`<span class="article__minutes">${readingText(post)}\n${dateHtml(post)}</span>`,
    titleHtml:mode==='featured'||!post.image?`<a href="${encodeURI(post.route)}">${escape(post.postTitle)}</a>`:escape(post.postTitle),
    title:post.postTitle,excerptHtml:escape(post.description),
    bottomHtml:`<div class="article__author"><a href="${prefix}/about/" aria-label="${escape(site.author.name)}"><img class="article__author-image lazy" data-src="${escape(site.author.avatar)}" alt="${escape(site.author.name)}"></a></div>\n<div class="article__bottom-meta"><a href="${prefix}/about/" class="article__author-link">${escape(site.author.name)}</a>${post.tags?.length?`\n<span>${t.in}</span>\n<span class="article-tags">${tagLinks(post)}</span>`:''}</div>`,
  };
}
export function cardHtml(card){return `<div class="${card.className}"><div class="article__inner">${card.featured?'<span class="featured-post ion ion-ios-star-outline"></span>':''}${card.image?`<a class="article__image" href="${encodeURI(card.image.href)}"><img class="lazy" data-src="${escape(card.image.src)}" alt="${escape(card.image.alt)}"></a>`:''}<div class="article__content"><div class="article__meta">${card.metaHtml}</div><h2 class="article__title">${card.titleHtml}</h2><p class="article__excerpt">${card.excerptHtml}</p><div class="article__bottom">${card.bottomHtml}</div></div></div></div>`;}
function setHero(page,title,description){
  const $=load(page.heroHtml,{},false);$('.hero__title').text(title);$('.hero__image img').attr('alt',title);
  if(description!==undefined)$('.hero__content p').text(description);
  page.title=title;page.heroHtml=$.html();return page;
}
function updatePostHero(post,site){
  const $=load(post.heroHtml,{},false),t=ui[post.lang],prefix=prefixFor(post.lang);
  $('.post__title').text(post.postTitle);$('.post__minutes').html(`${readingText(post)}\n<time class="post__date" datetime="${post.date}">${formatDate(post.date,post.lang)}</time>`);
  $('.hero__image img').attr('data-src',post.image||site.hero.image).attr('alt',post.postTitle);
  $('.post-image').attr('data-src',post.image||site.hero.image).attr('alt',post.postTitle);
  $('.post__author a,.post__author-link').attr('href',prefix+'/about/');
  $('.post__bottom-meta > span:not([class])').text(t.in);
  $('.post-tags').html(post.tagIds.map((id,i)=>`<a class="post__tag" href="${prefix}/tags/${id}/">${escape(post.tags[i])}</a>`).join('\n'));
  if(!post.image){$('.image-box').closest('.col').remove();$('.post-head__box').closest('.col').attr('class','col col-12');}
  post.heroHtml=$.html();
}
const headings=html=>{const $=load(html,{},false);return $('h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]').toArray().map(el=>({id:$(el).attr('id'),level:el.tagName}));};
function anchorMappings(from,to){
  const a=headings(from.contentHtml),b=headings(to.contentHtml),mapping={};
  for(const heading of a)if(b.some(other=>other.id===heading.id))mapping[heading.id]=heading.id;
  if(a.length===b.length&&a.every((heading,i)=>heading.level===b[i].level))a.forEach((heading,i)=>mapping[heading.id]=b[i].id);
  return mapping;
}
function rewriteLinks(html,page,routeMap,ownAnchors={}){
  if(!html)return html;
  const $=load(html,{},false);
  $('a[href]').each((i,element)=>{
    const href=$(element).attr('href');
    if(href.startsWith('#')){let id;try{id=decodeURIComponent(href.slice(1));}catch{return;}if(ownAnchors[id])$(element).attr('href','#'+ownAnchors[id]);return;}
    if(!href.startsWith('/')&&!/^https?:\/\/(?:www\.)?ptzhao\.com(?:\/|$)/i.test(href))return;
    let url;try{url=new URL(href,'https://ptzhao.com');}catch{return;}
    const target=routeMap.get(normalizeRoute(url.pathname));
    if(target){
      const route=target.alternates?.[page.lang]||target.canonicalRoute||target.route;let hash=url.hash;
      if(hash&&target.lang!==page.lang&&target.anchorTranslations){let id='';try{id=decodeURIComponent(hash.slice(1));}catch{}hash=target.anchorTranslations[id]?'#'+encodeURIComponent(target.anchorTranslations[id]):'';}
      $(element).attr('href',encodeURI(route)+url.search+hash);
    }
  });
  return $.html();
}
async function buildShared(lang,posts,pages,site){
  const fragments=await readJson(`content/shared-${lang}.json`),t=ui[lang],prefix=prefixFor(lang);
  const $=load(fragments.footerWidgetsHtml,{},false);
  $('.widget-recent .widget__title').text(t.latestPosts);
  const recentTemplate=$('.recent-posts').first().clone();$('.recent-posts').remove();
  for(const post of posts.slice(0,2)){
    const recent=recentTemplate.clone();recent.find('.recent-posts__image').attr('href',post.route).find('img').attr('data-src',post.image).attr('alt',post.postTitle);
    recent.find('.recent-posts__title a').attr('href',post.route).text(post.postTitle);recent.find('.article__meta').html(makeCard(post,site).metaHtml);
    recent.find('a[href$="/about/"]').attr('href',prefix+'/about/');$('.widget-recent').append(recent);
  }
  $('.widget-tag-cloud').each((i,element)=>{
    const type=i===0?'categories':'tags';$(element).find('.widget__title').text(i===0?t.viewCategories:t.exploreTags);
    const index=pages.find(page=>page.route===`${prefix}/${type}/`);
    $(element).find('.tag__cloud').html(index.cards.map(card=>`<a href="${escape(card.image?.href||card.href)}">${escape(card.title)}</a>`).join('\n'));
  });
  $('.widget-subscribe .widget__title').text(t.subscribe);$('.subscribe-subtitle,.subscribe-description').text(t.subscribeContent);
  $('label[for="mce-EMAIL"]').text(t.email);$('#mce-EMAIL').attr('placeholder',t.emailPlaceholder);$('#membedded-subscribe').text(t.join);
  fragments.footerWidgetsHtml=$.html();
  const footer=load(fragments.footerHtml,{},false);footer('.copyright > a').first().attr('href',prefix+'/');
  const copyright=footer('.copyright');const theme=copyright.find('a').last().clone();const home=copyright.find('a').first().clone();
  copyright.empty().append(`${new Date().getFullYear()} © `).append(home).append('. '+t.copyrightCredit+' ').append(theme).append('.');
  fragments.footerHtml=footer.html();return fragments;
}
export async function buildLocalizedPages(compile){
  const {site}=await readJson('content/site.json'),taxonomy=await readJson('content/i18n/taxonomy.json');validateTaxonomy(taxonomy);
  const originalRoutes=await readJson('content/routes.json');
  const originals=await Promise.all(originalRoutes.map(async route=>({...await readJson('content/rendered/'+route.file),snapshotFile:route.file})));
  const snapshotMap=new Map(originals.map(page=>[page.snapshotFile,page]));
  const sources=await discoverSources();const posts=[];const logical=[];
  for(const source of sources){
    const versions={};
    for(const lang of languages){
      let raw=source.raw,translated;
      if(lang!==source.sourceLang){translated=await readTranslation(source.id,lang,source.digest);if(!translated)throw new Error('Missing saved translation: '+source.id+' → '+lang);raw=translated.raw;}
      const {data,content}=matter(raw);
      const snapshot=source.snapshots[lang];const cached=snapshot&&snapshotMap.get(snapshot.file);
      const template=structuredClone(cached||snapshotMap.get(source.snapshots[source.sourceLang]?.file)||originals.find(page=>page.kind==='post'&&page.lang===lang));
      const contentHtml=cached&&snapshot.rawDigest===digest(raw)?repairCachedMath(cached.contentHtml,()=>compile(content,lang)):compile(content,lang);
      const ids=type=>unique(asArray(type==='tags'?source.data.tags:source.data.category??source.data.categories).map(name=>{const term=taxonomyLookup(taxonomy,type,name);if(!term)throw new Error('Untranslated taxonomy label: '+name);return term.id;}));
      const tagIds=ids('tags'),categoryIds=ids('categories');
      const date=new Date(source.data.date||source.source.split('/').at(-1).slice(0,10));if(Number.isNaN(date.getTime()))throw new Error('Invalid article date: '+source.source);
      const post=Object.assign(template,{route:source.routes[lang],lang,kind:'post',translationId:source.id,source:source.source,sourceLang:source.sourceLang,sourceDigest:digest(source.raw),title:String(data.title||source.data.title),postTitle:String(data.title||source.data.title),description:String(data.description||''),date:date.toISOString(),dateText:formatDate(date,lang),image:String(source.data.image||''),featured:source.data.featured===true,tagIds,categoryIds,tags:tagIds.map(id=>taxonomy.tags.find(term=>term.id===id).labels[lang]),categories:categoryIds.map(id=>taxonomy.categories.find(term=>term.id===id).labels[lang]),contentHtml,relatedTitle:ui[lang].related,alternates:source.routes,canonicalRoute:source.routes[lang]});
      updatePostHero(post,site);posts.push(post);versions[lang]=post;
    }
    for(const lang of languages)versions[lang].anchorTranslations=anchorMappings(versions[lang],versions[otherLanguage(lang)]);
    logical.push({source,versions});
  }
  const pages=originals.filter(page=>['contact','404','page','redirect'].includes(page.kind)).map(page=>structuredClone(page));pages.push(...posts);
  for(const page of pages.filter(page=>page.kind!=='post')){
    const t=ui[page.lang],base=baseRoute(page.route),prefix=prefixFor(page.lang);
    page.alternates=Object.fromEntries(languages.map(lang=>[lang,localizedRoute(base,lang)]));page.canonicalRoute=page.route;
    if(page.kind==='404'){
      setHero(page,t.notFound);const $=load(page.contentHtml,{},false);$('#homepage').text(t.backHome);$('p').filter((i,e)=>$(e).text().includes('The requested page could not be found.')).text(page.lang==='zh-cn'?'请求的页面不存在。':'The requested page could not be found.');page.contentHtml=$.html();
    }else if(page.kind==='contact')setHero(page,t.contact);
    else if(base==='/'){
      setHero(page,t.homeTitle);const raw=await fs.readFile('content/home.md','utf8');
      if(page.lang==='en')page.contentHtml=compile(raw,'en');else{const saved=await readTranslation('page-home','zh-cn',payloadDigest(raw));if(!saved)throw new Error('Missing saved home-page translation');page.contentHtml=compile(saved.body,'zh-cn');}
      const home=load(page.contentHtml,{},false),suffix=page.lang==='zh-cn'?'-zh-cn':'';
      home('img[data-github-card="stats"]').attr('src',`/images/github/github-stats${suffix}.svg`).attr('alt',page.lang==='zh-cn'?'GitHub 统计':'GitHub statistics');
      home('img[data-github-card="languages"]').attr('src',`/images/github/top-languages${suffix}.svg`).attr('alt',page.lang==='zh-cn'?'常用编程语言':'Most used programming languages');
      page.contentHtml=home.html();
    }else if(base==='/test/styleguide/'){
      setHero(page,t.styleguide);const raw=await fs.readFile('content/styleguide.md','utf8');
      if(page.lang==='en')page.contentHtml=compile(matter(raw).content,'en');else{const saved=await readTranslation('page-styleguide','zh-cn',payloadDigest(raw));if(!saved)throw new Error('Missing saved style-guide translation');page.contentHtml=compile(saved.body,'zh-cn');}
    }else if(page.kind==='redirect'){page.redirectTo=prefix+'/';page.canonicalRoute=page.redirectTo;}
  }
  for(const lang of languages){
    const t=ui[lang],prefix=prefixFor(lang);const local=posts.filter(post=>post.lang===lang).sort((a,b)=>new Date(b.date)-new Date(a.date)||a.translationId.localeCompare(b.translationId));
    const blogTemplate=originals.find(page=>page.route===prefix+'/blogs/');const totalPages=Math.max(1,Math.ceil(local.length/8));
    for(let number=1;number<=totalPages;number++){
      const route=`${prefix}/blogs/${number===1?'':number+'/'}`;const page=structuredClone(blogTemplate);Object.assign(page,{route,lang,kind:'blog',pageNumber:number,totalPages,cards:local.slice((number-1)*8,number*8).map(post=>makeCard(post,site)),featuredCards:local.filter(post=>post.featured).map(post=>makeCard(post,site,'featured')),loadMoreText:t.loadMore,canonicalRoute:route,alternates:Object.fromEntries(languages.map(l=>[l,`${prefixFor(l)}/blogs/${number===1?'':number+'/'}`]))});setHero(page,t.blogTitle,t.tagline);pages.push(page);
    }
    for(let index=0;index<local.length;index++){
      const post=local[index];const navigation=(other,direction)=>other?`<a class="${direction}" href="${encodeURI(other.route)}"><img class="post__nav-image lazy" data-src="${escape(other.image)}" alt="${escape(other.postTitle)}"><div class="post__nav-box"><div class="post__nav post__nav__${direction}">${direction==='prev'?'<i class="ion ion-md-arrow-round-back"></i> '+t.previousPost:t.nextPost+' <i class="ion ion-md-arrow-round-forward"></i>'}</div><h4 class="post__nav__title">${escape(other.postTitle)}</h4></div></a>`:'';
      post.navigationHtml=`<div class="post__navigation">${navigation(local[index+1],'prev')}${navigation(local[index-1],'next')}</div>`;
      const related=local.filter(other=>other!==post&&other.tagIds.some(id=>post.tagIds.includes(id))).slice(0,3);post.relatedClass='related-posts'+(related.length?' is-related':'');post.relatedCards=related.map(other=>({...makeCard(other,site),className:'article col col-4 col-d-6 col-t-12 grid__post'}));
    }
    for(const type of ['tags','categories']){
      const property=type==='tags'?'tagIds':'categoryIds';const template=originals.find(page=>page.route===`${prefix}/${type}/`);const index=structuredClone(template);index.cards=[];setHero(index,t[type]);index.alternates=Object.fromEntries(languages.map(l=>[l,`${prefixFor(l)}/${type}/`]));index.canonicalRoute=index.route;
      const archiveTemplate=originals.find(page=>page.kind==='archive'&&page.lang===lang&&page.route.startsWith(`${prefix}/${type}/`));
      for(const term of taxonomy[type]){
        const members=local.filter(post=>post[property].includes(term.id));
        const legacy=originals.filter(page=>page.kind==='archive'&&page.route.startsWith(`${prefix}/${type}/`)&&taxonomyLookup(taxonomy,type,page.title)?.id===term.id);
        if(!members.length&&!legacy.length)continue;
        const route=`${prefix}/${type}/${term.id}/`,name=term.labels[lang];const archive=structuredClone(archiveTemplate);Object.assign(archive,{route,title:name,cards:members.map(post=>makeCard(post,site)),canonicalRoute:route,taxonomyId:term.id,taxonomyType:type,alternates:Object.fromEntries(languages.map(l=>[l,`${prefixFor(l)}/${type}/${term.id}/`]))});const $=load(archive.heroHtml,{},false);$('.archive-title').text(name);$('.archive-meta').text(countText(members.length,lang));$('.hero__image img').attr('alt',name);archive.heroHtml=$.html();pages.push(archive);
        if(members.length){const representative=members.at(-1),card=makeCard(representative,site);card.className='article col col-4 col-d-6 col-t-12 animate';card.title=name;card.titleHtml=`<a href="${route}">${escape(name)}</a>`;card.metaHtml=`<span class="article__minutes">${countText(members.length,lang)}</span>${dateHtml(representative)}`;card.bottomHtml=card.bottomHtml.replace(/<span>[^<]*<\/span>\n<span class="article-tags">[\s\S]*?<\/span>/,'');card.href=route;if(card.image)card.image.href=route;index.cards.push(card);}
        for(const old of legacy)if(normalizeRoute(old.route)!==route){const alias=structuredClone(old);Object.assign(alias,{kind:'redirect',title:name,redirectTo:route,canonicalRoute:route,alternates:archive.alternates,contentHtml:`<p><a href="${route}">${escape(name)}</a></p>`});pages.push(alias);}
      }
      pages.push(index);
    }
  }
  const routeMap=new Map(pages.map(page=>[normalizeRoute(page.route),page]));
  if(routeMap.size!==pages.length)throw new Error('Duplicate localized route');
  for(const page of pages.filter(page=>page.kind==='page')){
    const alternate=routeMap.get(normalizeRoute(page.alternates[otherLanguage(page.lang)]));
    if(alternate)page.anchorTranslations=anchorMappings(page,alternate);
  }
  for(const {source,versions}of logical)for(const lang of languages){
    const post=versions[lang];const map=lang===source.sourceLang?{}:versions[source.sourceLang].anchorTranslations;
    post.contentHtml=rewriteLinks(post.contentHtml,post,routeMap,map);
  }
  for(const page of pages.filter(page=>page.kind!=='post')){
    const source=page.kind==='page'&&page.lang==='zh-cn'?routeMap.get(normalizeRoute(page.alternates.en)):null;
    page.contentHtml=rewriteLinks(page.contentHtml,page,routeMap,source?.anchorTranslations||{});
  }
  const shared={};for(const lang of languages)shared[lang]=await buildShared(lang,posts.filter(post=>post.lang===lang).sort((a,b)=>new Date(b.date)-new Date(a.date)),pages,site);
  return {pages,posts,sources,taxonomy,shared};
}
