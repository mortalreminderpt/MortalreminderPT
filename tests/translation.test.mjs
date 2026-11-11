import test from 'node:test';
import assert from 'node:assert/strict';
import { readJson, taxonomyLookup, validateTaxonomy, sourceRoute, localizedRoute, payloadDigest, discoverSources } from '../scripts/i18n-core.mjs';
import { protectMarkdown, splitMarkdown, validateTranslatedMarkdown, callDeepSeek, translateDocument } from '../scripts/translation-provider.mjs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { prepareTranslations } from '../scripts/translate-content.mjs';
import { compile } from '../scripts/markdown.mjs';
import { load } from 'cheerio';

test('one taxonomy identity accepts either language and historic spelling variants',async()=>{
  const registry=await readJson('content/i18n/taxonomy.json');validateTaxonomy(registry);
  for(const type of ['tags','categories'])assert.equal(taxonomyLookup(registry,type,'计算机网络').id,taxonomyLookup(registry,type,'Computer Network').id);
  assert.equal(taxonomyLookup(registry,'tags','Algorithm').id,taxonomyLookup(registry,'tags','Algorithms').id);
  assert.equal(taxonomyLookup(registry,'tags','数据结构').id,taxonomyLookup(registry,'tags','Data Structure').id);
  assert.notEqual(taxonomyLookup(registry,'tags','Computer Vision').id,taxonomyLookup(registry,'tags','计算机网络').id);
  assert.equal(taxonomyLookup(registry,'tags','Computer Vision').labels['zh-cn'],'计算机视觉');
});
test('article dates/tags do not invalidate translated prose; changed prose does',()=>{
  const a='---\ntitle: Heading\ntags: [计算机网络]\ndate: 2026-11-11\n---\n\nBody.\n';
  assert.equal(payloadDigest(a),payloadDigest(a.replace('[计算机网络]','[Computer Networking]').replace('2026-11-11','2026-11-12')));
  assert.notEqual(payloadDigest(a),payloadDigest(a.replace('Body.','Changed body.')));
  assert.equal(localizedRoute('/zh-cn/node.js/2024/12/19/post/','en'),'/node.js/2024/12/19/post/');
  assert.equal(sourceRoute('content/posts/en/2026-11-11-source.md',{permalink:'/notes/new-post/' }),'/notes/new-post/');
});
test('code, mathematics, URLs, HTML and liquid survive translation; nested prose remains translatable',()=>{
  const source='## 中文标题\n\n- 中文条目\n    - 嵌套中文\n\n````js\n// 保持原样\nconst value = `原样`;\n````\n\n行内 `原样`、$x^2$、[链接](https://example.test/path?q=1) 与 <span class="test">文字</span>。\n\n$$\nx=1\n$$\n\n{{ site.baseurl }}/images/plot.png\n';
  const protectedSource=protectMarkdown(source);assert.ok(protectedSource.text.includes('嵌套中文'));assert.ok(!protectedSource.text.includes('const value'));
  assert.equal(protectedSource.restore(protectedSource.text),source);
  assert.equal(splitMarkdown(protectedSource.text,80).map(part=>'literal'in part?part.literal:part.prefix+part.text+part.suffix).join(''),protectedSource.text);
  const changed=protectedSource.text.replace('中文标题','English heading').replace('文字','Text');
  const restored=protectedSource.restore(changed);assert.ok(restored.includes('const value = `原样`;'));assert.ok(restored.includes('$x^2$'));assert.ok(restored.includes('https://example.test/path?q=1'));assert.ok(restored.includes('class="test"'));
  validateTranslatedMarkdown(source,restored);
  assert.throws(()=>protectedSource.restore(protectedSource.text.replace(/⟦MC_[^⟧]+⟧/,'')));
  assert.throws(()=>validateTranslatedMarkdown(source,restored+'\n<script>alert(1)</script>'));
});
test('provider uses the private Authorization header, structured output and no reasoning',async()=>{
  const result=await callDeepSeek([{id:'heading',text:'标题'}],{sourceLang:'zh-cn',targetLang:'en',apiKey:'private-test-value',fetchImpl:async(url,options)=>{
    assert.equal(url,'https://api.deepseek.com/chat/completions');assert.equal(options.redirect,'error');assert.equal(options.headers.Authorization,'Bearer private-test-value');
    const body=JSON.parse(options.body);assert.equal(body.thinking.type,'disabled');assert.equal(body.response_format.type,'json_object');assert.ok(!options.body.includes('private-test-value'));
    return new Response(JSON.stringify({model:'test-model',choices:[{finish_reason:'stop',message:{content:JSON.stringify({translations:[{id:'heading',text:'Heading'}]})}}]}),{status:200});
  }});
  assert.equal(result.translations.get('heading'),'Heading');
});
test('translated Markdown retains nested TOC structure and compiles legacy Liquid raw wrappers',()=>{
  const html=compile('1. Table of Contents\n{:toc}\n\n## Parent\n\n### Child\n\n{% raw %}\n```tsx\nconst value = <div>Hello</div>;\n```\n{% endraw %}\n','en');
  const $=load(html);assert.equal($('#markdown-toc > li > ol > li').length,1);assert.equal($('pre code').text(),'const value = <div>Hello</div>;\n');assert.ok(!html.includes('endraw'));assert.ok(!html.includes(' raw '));
});
test('authentication errors never log or echo provider bodies containing credentials',async()=>{
  let calls=0;
  await assert.rejects(()=>callDeepSeek([{id:'a',text:'测试'}],{sourceLang:'zh-cn',targetLang:'en',apiKey:'private-test-value',fetchImpl:async()=>{calls++;return new Response('The secret is private-test-value',{status:401});}}),error=>error.status===401&&!error.message.includes('private-test-value'));
  assert.equal(calls,1);
});
test('code and equations are also protected in titles and descriptions',async()=>{
  const previous=process.cwd(),temporary=await fs.mkdtemp(path.join(os.tmpdir(),'mortalreminderpt-metadata-'));
  try{
    process.chdir(temporary);
    const result=await translateDocument({title:'标题 `doNotRename()`',description:'描述 $x^2$',body:'正文。'},{sourceLang:'zh-cn',targetLang:'en',request:async items=>{
      assert.ok(items.every(item=>!item.text.includes('doNotRename')&&!item.text.includes('x^2')));
      return {model:'fixture',translations:new Map(items.map(item=>[item.id,item.text.replaceAll('标题','Title').replaceAll('描述','Description').replaceAll('正文','Body')]))};
    }});
    assert.equal(result.title,'Title `doNotRename()`');assert.equal(result.description,'Description $x^2$');
  }finally{process.chdir(previous);await fs.rm(temporary,{recursive:true});}
});
test('saved translations satisfy every page without an API key or another model call',async()=>{
  const result=await prepareTranslations({request:async()=>{throw new Error('A cache hit must never call the model');}});
  const count=(await discoverSources()).length;
  assert.equal(result.missingDocuments,0);assert.equal(result.completed,0);assert.equal(result.articles,count);assert.equal(result.retained,count+2);
});
