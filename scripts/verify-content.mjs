import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { load } from 'cheerio';

const routes = JSON.parse(await fs.readFile('content/routes.json', 'utf8'));
const provenance = JSON.parse(await fs.readFile('content/provenance.json', 'utf8'));
const original = process.env.ORIGINAL_SITE;
const findings = [];
const ignore = new Set(['data-action', 'data-src', 'data-ll-status', 'data-homepage', 'aria-label', 'aria-live', 'aria-hidden', 'aria-modal', 'role', 'tabindex', 'onkeydown', 'onclick', 'onsubmit']);
function canonical(node) {
  if (node.type === 'comment' || ['script', 'link', 'meta'].includes(node.name)) return null;
  if (node.type === 'text') { const text = node.data.replace(/\s+/g, ' ').trim(); return text || null; }
  const attrs = {};
  for (let [key, value] of Object.entries(node.attribs || {}).sort()) {
    if (ignore.has(key) || key.startsWith('on') || key.startsWith('#') || key === '=' || key === '=""') continue;
    if (key === 'class') value = value.split(/\s+/).filter(v => !['loaded', 'entered'].includes(v)).sort().join(' ');
    if (key === 'src') value = value.replace(/^\/zh-cn\/(images|css|js)\//, '/$1/');
    if (key === 'style') value = value.split(';').map(v => v.trim().replace(/\s*:\s*/g, ':')).filter(Boolean).sort().join(';');
    if (key === 'alt' && !value) continue;
    attrs[key] = value;
  }
  if (node.name === 'img' && node.attribs?.['data-src']) attrs.src = node.attribs['data-src'].replace(/^\/zh-cn\/(images|css|js)\//, '/$1/');
  return { name: node.name, attrs: Object.fromEntries(Object.entries(attrs).sort()), children: (node.children || []).map(canonical).filter(v => v !== null) };
}
let posts = 0;
const formulaFragments = new Set();
for (const record of routes) {
  const filename = record.route.endsWith('.html') ? record.route.slice(1) : record.route.slice(1) + 'index.html';
  const exported = await fs.readFile(path.join('out', filename), 'utf8');
  const $ = load(exported);
  const page = JSON.parse(await fs.readFile('content/rendered/' + record.file, 'utf8'));
  assert.equal($('title').first().text(), page.title, 'Page title changed: ' + record.route);
  assert.equal($('main.content').length, 1, record.route);
  assert.equal($('header.header').length, 1, record.route);
  assert.equal($('footer.footer').length, 1, record.route);
  $('include[src]').each((i, element) => formulaFragments.add($(element).attr('src')));
  if (record.kind === 'post') {
    posts++;
    const rich = load('<div class="post__content">' + page.contentHtml + '</div>');
    assert.deepEqual(canonical($('.post__content')[0]), canonical(rich('.post__content')[0]), 'Article content changed: ' + record.route);
  }
  if (original) {
    const ref = load(await fs.readFile(path.join(original, filename), 'utf8'));
    try { assert.deepEqual(canonical($('main.content')[0]), canonical(ref('main.content')[0])); }
    catch (error) { findings.push({ route: record.route, difference: error.message.slice(0, 2800) }); }
  }
}
assert.equal(routes.length, provenance.pages);
assert.equal(posts, provenance.posts);
assert.ok(formulaFragments.size > 0, 'Formula fragment coverage is missing');
for (const fragment of formulaFragments) {
  const actual = await fs.readFile(path.join('out', fragment));
  if (original) assert.deepEqual(actual, await fs.readFile(path.join(original, fragment)), 'MathML fragment changed: ' + fragment);
}
const report = { routes: routes.length, posts, formulaFragments: formulaFragments.size, originalDomCompared: !!original, differences: findings };
await fs.mkdir('.artifacts', { recursive: true });
await fs.writeFile('.artifacts/content-verification.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, differences: findings.length }, null, 2));
if (findings.length) { console.log(JSON.stringify(findings.slice(0, 3), null, 2)); process.exitCode = 1; }
