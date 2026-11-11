import fs from 'node:fs/promises';
import matter from 'gray-matter';
import { pathToFileURL } from 'node:url';
import { discoverSources, publicPostManifest, asArray, readJson, atomicWrite, digest, contentPayload, payloadDigest, translationFiles, readTranslation, otherLanguage, taxonomyLookup, validateTaxonomy, slug } from './i18n-core.mjs';
import { translateDocument, callDeepSeek } from './translation-provider.mjs';

export async function prepareTranslations({ check=false, plan=false, concurrency=3, request=callDeepSeek }={}) {
  const posts=await discoverSources();
  const taxonomy=await readJson('content/i18n/taxonomy.json');
  validateTaxonomy(taxonomy);
  const unknown=[];
  for(const post of posts) for(const type of ['tags','categories']) for(const name of asArray(type==='tags'?post.data.tags:post.data.category??post.data.categories)) {
    if(!taxonomyLookup(taxonomy,type,name)&&!unknown.some(item=>item.type===type&&item.name===name)) unknown.push({type,name,sourceLang:/\p{Script=Han}/u.test(name)?'zh-cn':'en'});
  }
  const documents=posts.map(post=>({id:post.id,source:post.source,sourceLang:post.sourceLang,targetLang:otherLanguage(post.sourceLang),raw:post.raw,sourceDigest:post.digest}));
  for(const [id,source] of [['page-home','content/home.md'],['page-styleguide','content/styleguide.md']]) {
    const raw=await fs.readFile(source,'utf8');documents.push({id,source,sourceLang:'en',targetLang:'zh-cn',raw,sourceDigest:payloadDigest(raw)});
  }
  const pending=[];
  for(const document of documents) if(!await readTranslation(document.id,document.targetLang,document.sourceDigest)) pending.push(document);
  const summary={articles:posts.length,retained:documents.length-pending.length,missingDocuments:pending.length,unknownTaxonomies:unknown.map(({type,name})=>({type,name})),sourceCharacters:pending.reduce((sum,d)=>sum+d.raw.length,0)};
  if(plan){console.log(JSON.stringify(summary,null,2));return summary;}
  if(check){if(pending.length||unknown.length)throw new Error(`Missing or stale translations: ${pending.length} documents, ${unknown.length} taxonomy labels. Run npm run translate with the build-only DEEPSEEK_API_KEY.`);return summary;}
  for(const entry of unknown){
    const targetLang=otherLanguage(entry.sourceLang);
    const result=await request([{id:'label',text:entry.name}],{sourceLang:entry.sourceLang,targetLang,glossary:[]});
    const labels={[entry.sourceLang]:entry.name,[targetLang]:result.translations.get('label')};
    const existing=taxonomyLookup(taxonomy,entry.type,labels.en)||taxonomyLookup(taxonomy,entry.type,labels['zh-cn']);
    if(existing)existing.aliases=[...new Set([...(existing.aliases||[]),entry.name])];
    else {let id=slug(labels.en);if(!id)id='term-'+digest(entry.name).slice(0,12);if(taxonomy[entry.type].some(term=>term.id===id))throw new Error('Taxonomy identity collision; add an explicit alias for '+entry.name);taxonomy[entry.type].push({id,labels,aliases:[entry.name,...Object.values(labels)]});}
    validateTaxonomy(taxonomy);await atomicWrite('content/i18n/taxonomy.json',taxonomy);
    console.log(`Saved bilingual ${entry.type} label: ${entry.name}`);
  }
  await atomicWrite('content/i18n/posts.json',publicPostManifest(posts));
  const glossary=[...taxonomy.tags,...taxonomy.categories].map(term=>term.labels);
  let next=0,completed=0,fatal=false;const failures=[];
  const worker=async()=>{
    while(next<pending.length&&!fatal){
      const document=pending[next++];
      try{
        const result=await translateDocument(contentPayload(document.raw),{sourceLang:document.sourceLang,targetLang:document.targetLang,glossary,request});
        const files=translationFiles(document.id,document.targetLang);
        const markdown=matter.stringify(result.body,{title:result.title,description:result.description});
        await atomicWrite(files.markdown,markdown);
        await atomicWrite(files.metadata,{version:1,sourceDigest:document.sourceDigest,sourceLang:document.sourceLang,targetLang:document.targetLang,provider:'deepseek',model:result.model,targetDigest:digest(markdown),translatedAt:new Date().toISOString()});
        completed++;console.log(`Saved translation ${completed}/${pending.length}: ${document.id} → ${document.targetLang}`);
      }catch(error){if([401,402,403].includes(error.status)||error.message.startsWith('Missing DEEPSEEK_API_KEY'))fatal=true;failures.push({id:document.id,message:error.message});console.error(`Translation failed for ${document.id}: ${error.message}`);}
    }
  };
  await Promise.all(Array.from({length:Math.max(1,Math.min(concurrency,5))},worker));
  if(failures.length)throw new Error(`${failures.length+pending.length-next} translations remain incomplete. Completed documents and fragments were saved; rerun to resume without retranslating them.`);
  console.log(`Translations ready: ${posts.length} articles in both languages; ${completed} new results saved, ${summary.retained} reused.`);
  return {...summary,completed};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  prepareTranslations({check:process.argv.includes('--check'),plan:process.argv.includes('--plan')}).catch(error=>{console.error(error.message);process.exitCode=1;});
}
