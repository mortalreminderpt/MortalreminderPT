import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { prepareTranslations } from './translate-content.mjs';
import { readJson, discoverSources, readTranslation, exists } from './i18n-core.mjs';

const root=process.cwd();const fixture=await fs.mkdtemp(path.join(os.tmpdir(),'mortalreminderpt-i18n-authoring-'));
const initialSources=await discoverSources();const originalFile=initialSources[0].source;const original=await fs.readFile(originalFile,'utf8');
const calls=[];
const request=async(items,{sourceLang,targetLang})=>{
  calls.push({sourceLang,targetLang,texts:items.map(item=>item.text)});
  const translate=text=>sourceLang==='en'?text.replaceAll('Translation Testing','翻译测试').replaceAll('Cache Topic','缓存主题').replaceAll('Authoring English','作者测试英文').replaceAll('New section','新章节').replaceAll('English description','中文描述').replaceAll('English content','中文内容'):text.replaceAll('作者测试中文','Authoring Chinese').replaceAll('新章节','New section').replaceAll('中文内容','Chinese content');
  return {translations:new Map(items.map(item=>[item.id,translate(item.text)])),model:'authoring-fixture'};
};
const build=()=>execFileSync(process.execPath,[path.join(root,'scripts/build-content.mjs')],{cwd:fixture,encoding:'utf8',timeout:120000});
const get=async route=>{const record=(await readJson('.generated/routes.json')).find(record=>decodeURI(record.route)===route);assert.ok(record,'Missing authored route: '+route);return readJson('.generated/pages/'+record.file);};
try{
  await fs.cp('content',path.join(fixture,'content'),{recursive:true});process.chdir(fixture);
  const unchanged=await prepareTranslations({request});assert.equal(unchanged.completed,0);assert.equal(calls.length,0);
  const english='content/posts/en/2026-11-11-authoring-english.md';await fs.mkdir(path.dirname(english),{recursive:true});
  await fs.writeFile(english,`---\ntitle: Authoring English\ndescription: English description\ndate: 2026-11-11 12:00:00 +1100\npermalink: /migration/i18n-authoring-en/\nimage: /images/logos/avatar128.png\ntags: [计算机网络, Cache Topic]\ncategory: [Translation Testing]\nfeatured: true\n---\n\n1. Table of Contents\n{:toc}\n\n## New section\n\nEnglish content with $x^2+y^2$ and a [link](https://ptzhao.com/).\n\n\`\`\`typescript\nconst unchanged = true;\n\`\`\`\n`);
  await prepareTranslations({request});assert.equal(calls.length,3,'One article and two unknown taxonomy labels should be translated.');build();
  const en=await get('/migration/i18n-authoring-en/'),zh=await get('/zh-cn/migration/i18n-authoring-en/');
  assert.equal(en.postTitle,'Authoring English');assert.equal(zh.postTitle,'作者测试英文');assert.deepEqual(en.tagIds,zh.tagIds);assert.deepEqual(en.categoryIds,zh.categoryIds);
  assert.match(zh.contentHtml,/中文内容/);assert.match(zh.contentHtml,/const unchanged/);assert.match(zh.contentHtml,/katex/);assert.match(zh.contentHtml,/id="markdown-toc"/);
  assert.equal((await get('/blogs/')).cards[0].title,'Authoring English');assert.equal((await get('/zh-cn/blogs/')).cards[0].title,'作者测试英文');
  assert.ok((await get('/tags/cache-topic/')).cards.some(card=>card.title==='Authoring English'));assert.equal((await get('/zh-cn/categories/translation-testing/')).title,'翻译测试');
  assert.ok((await readJson('public/data/search-zh-cn.json')).some(item=>item.title==='作者测试英文'));
  assert.match((await readJson('.generated/shared-zh-cn.json')).footerWidgetsHtml,/作者测试英文/);
  const before=calls.length;await prepareTranslations({request});assert.equal(calls.length,before,'A second build must use the saved results.');
  await fs.appendFile(english,'\n\nEnglish content changed.\n');await prepareTranslations({request});assert.equal(calls.length,before+1,'Only the changed paragraph should call the model.');
  assert.deepEqual(calls.at(-1).texts,['English content changed.']);
  await fs.writeFile(english,(await fs.readFile(english,'utf8')).replace('2026-11-11 12:00:00','2026-11-12 12:00:00').replace('[计算机网络, Cache Topic]','[Computer Networking, 缓存主题]'));
  const afterTextChange=calls.length;await prepareTranslations({request});assert.equal(calls.length,afterTextChange,'Date and taxonomy aliases must not retranslate article text.');
  const chinese='content/posts/zh-cn/2026-11-11-authoring-chinese.md';await fs.writeFile(chinese,'---\ntitle: 作者测试中文\ndate: 2026-11-11 13:00:00 +1100\npermalink: /migration/i18n-authoring-zh/\ntags: [缓存主题]\ncategory: [翻译测试, 缓存主题]\n---\n\n## 新章节\n\n中文内容。\n');
  await prepareTranslations({request});assert.equal(calls.length,afterTextChange+1);assert.equal(calls.at(-1).targetLang,'en');build();
  assert.equal((await get('/migration/i18n-authoring-zh/')).postTitle,'Authoring Chinese');assert.equal((await get('/blogs/')).totalPages,Math.ceil((initialSources.length+2)/8));assert.equal((await get('/zh-cn/blogs/')).totalPages,Math.ceil((initialSources.length+2)/8));
  assert.ok((await get('/blogs/')).cards.some(card=>card.titleHtml.includes('/migration/i18n-authoring-zh/')),'Articles without a cover must still have a clickable title.');
  await fs.unlink(english);await prepareTranslations({request});build();
  const remaining=await readJson('.generated/routes.json');assert.ok(!remaining.some(record=>record.route.includes('i18n-authoring-en')));
  assert.ok(!(await readJson('public/data/search-en.json')).some(item=>item.title==='Authoring English'));
  assert.equal((await get('/blogs/')).totalPages,Math.ceil((initialSources.length+1)/8));
  assert.equal(await exists(`public/data/blog-en-${Math.ceil((initialSources.length+2)/8)}.json`),Math.ceil((initialSources.length+2)/8)===Math.ceil((initialSources.length+1)/8));
  assert.equal(await fs.readFile(path.join(root,originalFile),'utf8'),original);
  const report={passed:true,checks:['English-only source creates Chinese article','Chinese-only source creates English article','new tag/category translations saved once','existing aliases share one identity','code/math/TOC preserved','localized blog pagination','localized taxonomy membership','search and footer updates','zero calls on repeat','only changed paragraph translated','metadata edits do not retranslate','deleted source removed in both languages','original files unchanged'],modelCalls:calls.length};
  await fs.mkdir(path.join(root,'.artifacts'),{recursive:true});await fs.writeFile(path.join(root,'.artifacts/authoring-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{process.chdir(root);await fs.rm(fixture,{recursive:true});}
