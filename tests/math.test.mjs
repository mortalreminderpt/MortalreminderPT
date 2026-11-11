import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import matter from 'gray-matter';
import { load } from 'cheerio';
import { compile, hasUnrenderedMath, repairCachedMath } from '../scripts/markdown.mjs';

const expressions=html=>{const $=load(html);return $('annotation[encoding="application/x-tex"]').map((i,element)=>$(element).text().trim()).get();};

test('the five reported fractions render with spaces inside single-dollar delimiters',()=>{
  const formulas=[String.raw`\frac{2}{3}C = 200,000`,String.raw`T\text{-delay} = \frac{5600}{56,000} \approx 0.1`,String.raw`P\text{-delay} = \frac{5}{200,000} \approx 25`,String.raw`T\text{-delay} = \frac{5600}{100,000,000} = 0.000056`,String.raw`P\text{-delay} = \frac{1000}{300,000} \approx 3.33`];
  const html=compile(formulas.map(formula=>`- $ ${formula} $ seconds.`).join('\n'),'en'),$=load(html);
  assert.deepEqual(expressions(html),formulas);assert.equal($('li .katex').length,5);assert.equal($('mfrac').length,5);assert.equal($('.katex-error').length,0);
});

test('single-dollar formulas can span lines and existing double-dollar formulas keep display mode',()=>{
  const html=compile(String.raw`- **Latency**:
  $
  \text{Latency} = T\text{-delay} + P\text{-delay}
  $

$$
x = \frac{a}{b}
$$

Inline $x^2$ and $ \text{cost \$5} $.
`,'en'),$=load(html);
  assert.equal($('.katex').length,4);assert.equal($('.katex-display').length,1);assert.equal($('.katex-error').length,0);
  assert.ok(expressions(html).includes(String.raw`\text{Latency} = T\text{-delay} + P\text{-delay}`));
  assert.ok(expressions(html).includes(String.raw`\text{cost \$5}`));
});

test('code, escaped dollars, prices and link destinations remain literal',()=>{
  const source=['Inline `$ \\frac{1}{2} $`.','','```js','const template = "$ x $";','```','','Prices $5 and $10; literal \\$ and [link](https://example.test/$path).','','Escaped pair: \\$x\\$.','','Real formula: $ x $'].join('\n');
  const html=compile(source,'en'),$=load(html);
  assert.equal($('pre code').text(),'const template = "$ x $";\n');assert.equal($('p code').text(),String.raw`$ \frac{1}{2} $`);
  assert.match($.text(),/Prices \$5 and \$10; literal \$/);assert.equal($('a').attr('href'),'https://example.test/$path');assert.deepEqual(expressions(html),['x']);
  assert.ok($.text().includes('Escaped pair: $x$.'));
});

test('cache detection ignores code and rendered math but identifies the legacy broken formula table',async()=>{
  assert.equal(hasUnrenderedMath('<pre><code>$ x $</code></pre><code>$ y $</code>'),false);
  assert.equal(hasUnrenderedMath(compile('$ x $','en')),false);
  assert.equal(hasUnrenderedMath('<include src="/formula.xml"></include>'),false);
  const intact='<p>Keep <code>$ x $</code> literal.</p>';
  assert.equal(repairCachedMath(intact,()=>{throw new Error('Valid cached blocks must not be recompiled');}),intact);
  assert.throws(()=>repairCachedMath('<p>$ x $</p>',()=>compile('$ y $\n\n$ z $','en')),/safely match/);
  const snapshot=JSON.parse(await fs.readFile('content/rendered/47ece83e84182eef9af9acb344493211141aa4509b63fbab71ea7428a7fa2baa.json','utf8'));
  assert.equal(hasUnrenderedMath(snapshot.contentHtml),true);
  const source=matter(await fs.readFile('content/translations/en/post-47ece83e84182eef9af9.md','utf8')).content,html=repairCachedMath(snapshot.contentHtml,()=>compile(source,'en')),$=load(html),original=load(snapshot.contentHtml);
  assert.equal(hasUnrenderedMath(html),false);assert.equal($('.katex-error').length,0);
  assert.ok(expressions(html).includes(String.raw`\mathbb{E}_{q(z|x)}[\log p(x|z)]`));
  assert.equal($('li').filter((i,element)=>$(element).text().includes('reconstruction loss')).find('table').length,0);
  assert.equal($('#markdown-toc').html(),original('#markdown-toc').html());
  assert.deepEqual($('h1[id],h2[id],h3[id],h4[id]').map((i,e)=>$(e).attr('id')).get(),original('h1[id],h2[id],h3[id],h4[id]').map((i,e)=>original(e).attr('id')).get());
});

test('repair restores the binary-tree paragraph swallowed by legacy math without changing its code',async()=>{
  const snapshot=JSON.parse(await fs.readFile('content/rendered/e9d4428d87c4434e126e3f72513063ae8f681f4ac032df838dcdce781953127a.json','utf8'));
  const source=matter(await fs.readFile('content/translations/en/post-e9d4428d87c4434e126e.md','utf8')).content,html=repairCachedMath(snapshot.contentHtml,()=>compile(source,'en')),$=load(html),original=load(snapshot.contentHtml);
  assert.equal(hasUnrenderedMath(html),false);assert.match($.text(),/and its right child is stored at index/);
  for(const formula of ['2*0+1','2*0+2','2*i+1','2*i+2'])assert.ok(expressions(html).includes(formula));
  assert.deepEqual($('pre').map((i,e)=>$(e).text()).get(),original('pre').map((i,e)=>original(e).text()).get());
  assert.equal($('#markdown-toc').html(),original('#markdown-toc').html());
});
