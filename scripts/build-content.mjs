import fs from 'node:fs/promises';
import { load } from 'cheerio';
import { compile } from './markdown.mjs';
import { buildLocalizedPages, makeCard, cardHtml } from './content-engine.mjs';
import { digest, atomicWrite, languages } from './i18n-core.mjs';

await fs.mkdir('.generated/pages',{recursive:true});await fs.mkdir('public/data',{recursive:true});await fs.mkdir('public/css',{recursive:true});
await fs.copyFile(new URL('../node_modules/katex/dist/katex.min.css',import.meta.url),'public/css/katex.min.css');
await fs.cp(new URL('../node_modules/katex/dist/fonts',import.meta.url),'public/css/fonts',{recursive:true});
const {pages,posts,sources,taxonomy,shared}=await buildLocalizedPages(compile);
const {site}=JSON.parse(await fs.readFile('content/site.json','utf8'));
const routes=[];
for(const page of pages){
  const file=digest(page.route)+'.json';delete page.snapshotFile;
  routes.push({route:page.route,file,kind:page.kind,lang:page.lang,...(page.source?{source:page.source}:{})});
  await atomicWrite('.generated/pages/'+file,page);
  if(page.kind==='blog')await atomicWrite(`public/data/blog-${page.lang}-${page.pageNumber}.json`,page.cards);
}
for(const lang of languages){
  await atomicWrite(`.generated/shared-${lang}.json`,shared[lang]);
  const search=posts.filter(post=>post.lang===lang).sort((a,b)=>new Date(b.date)-new Date(a.date)).map(post=>({title:post.postTitle,category:post.categories.join(', '),tags:post.tags.join(', '),url:post.route,date:post.dateText,text:load(post.contentHtml).text(),content:post.contentHtml,article:cardHtml(makeCard(post,site))}));
  await atomicWrite(`public/data/search-${lang}.json`,search);await atomicWrite(`${lang==='en'?'public':'public/zh-cn'}/search.json`,search);
}
await atomicWrite('.generated/routes.json',routes);await atomicWrite('public/data/routes.json',routes.map(page=>page.route));
const activePages=new Set(routes.map(route=>route.file));
for(const filename of await fs.readdir('.generated/pages'))if(/^[a-f0-9]{64}\.json$/.test(filename)&&!activePages.has(filename))await fs.unlink('.generated/pages/'+filename);
const activeBatches=new Set(pages.filter(page=>page.kind==='blog').map(page=>`blog-${page.lang}-${page.pageNumber}.json`));
for(const filename of await fs.readdir('public/data'))if(/^blog-(?:en|zh-cn)-\d+\.json$/.test(filename)&&!activeBatches.has(filename))await fs.unlink('public/data/'+filename);
await atomicWrite('.generated/i18n-summary.json',{articles:sources.length,localizedPosts:Object.fromEntries(languages.map(lang=>[lang,posts.filter(post=>post.lang===lang).length])),routes:routes.length,taxonomyIds:{tags:taxonomy.tags.map(t=>t.id),categories:taxonomy.categories.map(t=>t.id)}});
console.log(`Prepared ${routes.length} localized pages from ${sources.length} source articles; both languages contain ${sources.length} articles.`);
