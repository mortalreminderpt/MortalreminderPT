import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import attrs from 'markdown-it-attrs';
import texmath from 'markdown-it-texmath';
import katex from 'katex';
import { load } from 'cheerio';
import { deriveAuthoredPages, makeCard, cardHtml } from './content-engine.mjs';

const readJson = async p => JSON.parse(await fs.readFile(p, 'utf8'));
const writeJson = async (p, d) => { await fs.mkdir(path.dirname(p), { recursive: true }); await fs.writeFile(p, JSON.stringify(d)); };
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const routes = await readJson('content/routes.json');
const provenance = await readJson('content/provenance.json');
const slug = text => text.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s+/g, '-');
const md = new MarkdownIt({ html: true, linkify: true, breaks: false })
  .use(anchor, { slugify: slug }).use(attrs).use(texmath, { engine: katex, delimiters: 'dollars', katexOptions: { throwOnError: false } });
function compile(source, lang) {
  const prefix = lang === 'zh-cn' ? '/zh-cn' : '';
  const toc = /^.*\n\{:toc\}\s*$/m.test(source);
  let text = source.replace(/^.*\n\{:toc\}\s*$/m, '\n<!-- table-of-contents -->\n')
    .replace(/\{%\s*highlight\s+(\w+)[^]*?%\}/g, '\n```$1\n').replace(/\{%\s*endhighlight\s*%\}/g, '\n```\n')
    .replace(/\{\{\s*site\.baseurl_root\s*\}\}/g, '').replace(/\{\{\s*site\.baseurl\s*\}\}/g, prefix);
  let html = md.render(text);
  if (toc) {
    const $ = load(html, {}, false);
    const headings = $('h1,h2,h3,h4,h5,h6').toArray();
    let currentLevel = 0, contents = '<ol id="markdown-toc">';
    for (const heading of headings) {
      const level = Number(heading.tagName.slice(1));
      if (!currentLevel) currentLevel = level;
      while (level > currentLevel) { contents += '<ol>'; currentLevel++; }
      while (level < currentLevel) { contents += '</ol>'; currentLevel--; }
      const id = $(heading).attr('id');
      contents += `<li><a href="#${id}" id="markdown-toc-${id}">${$(heading).html()}</a></li>`;
    }
    while (currentLevel > (headings[0] ? Number(headings[0].tagName.slice(1)) : 0)) { contents += '</ol>'; currentLevel--; }
    contents += '</ol>';
    html = html.replace('<!-- table-of-contents -->', contents);
  }
  return html;
}

await fs.mkdir('.generated/pages', { recursive: true });
await fs.mkdir('public/data', { recursive: true });
await fs.copyFile(new URL('../node_modules/katex/dist/katex.min.css', import.meta.url), 'public/css/katex.min.css');
await fs.cp(new URL('../node_modules/katex/dist/fonts', import.meta.url), 'public/css/fonts', { recursive: true });
let changed = 0;
const pages = [];
for (const route of routes) {
  const page = await readJson('content/rendered/' + route.file);
  if (page.source) {
    const raw = await fs.readFile(page.source, 'utf8');
    if (hash(raw) !== page.sourceDigest) {
      const { data, content } = matter(raw);
      page.contentHtml = compile(content, page.lang);
      if (/\bkatex\b/.test(page.contentHtml)) page.contentHtml = '<link rel="stylesheet" href="/css/katex.min.css">' + page.contentHtml;
      if (data.title) {
        page.title = page.postTitle = String(data.title);
        const $ = load(page.heroHtml, {}, false); $('.post__title').text(page.title); page.heroHtml = $.html();
      }
      page.description = data.description || '';
      page._edited = true;
      changed++;
    }
  } else if (page.route === '/' || page.route === '/zh-cn/') {
    const raw = await fs.readFile('content/home.md', 'utf8');
    if (hash(raw) !== provenance.homeDigest) page.contentHtml = compile(raw, page.lang);
  } else if (page.route.endsWith('/test/styleguide/')) {
    const raw = await fs.readFile('content/styleguide.md', 'utf8');
    if (hash(raw) !== provenance.styleguideDigest) page.contentHtml = compile(matter(raw).content, page.lang);
  }
  pages.push(page);
}
const derived = await deriveAuthoredPages(pages, compile);
const allRoutes = [];
for (const page of derived.pages) {
  delete page._edited;
  const file = hash(page.route) + '.json';
  allRoutes.push({ route: page.route, file, kind: page.kind, lang: page.lang, ...(page.source ? { source: page.source } : {}) });
  await writeJson('.generated/pages/' + file, page);
  if (page.kind === 'blog') await writeJson(`public/data/blog-${page.lang}-${page.pageNumber}.json`, page.cards);
}
for (const lang of ['en', 'zh-cn']) await writeJson(`.generated/shared-${lang}.json`, derived.shared[lang] || await readJson(`content/shared-${lang}.json`));
const { site } = await readJson('content/site.json');
for (const lang of ['en', 'zh-cn']) {
  const search = await readJson(`content/search-${lang}.json`);
  for (const item of search) {
    const page = pages.find(p => decodeURI(p.route) === decodeURI(item.url));
    if (page) { item.title = page.postTitle; item.text = load(page.contentHtml).text(); if (derived.edited.has(page.route)) { item.content = page.contentHtml; item.article = cardHtml(makeCard(page, site)); } }
  }
  for (const page of pages.filter(p => p.kind === 'post' && p.lang === lang && !search.some(s => decodeURI(s.url) === decodeURI(p.route)))) {
    search.unshift({ title: page.postTitle, category: page.categories.join(', '), tags: page.tags.join(', '), url: page.route, date: page.dateText, text: load(page.contentHtml).text(), content: page.contentHtml, article: cardHtml(makeCard(page, site)) });
  }
  await writeJson(`public/data/search-${lang}.json`, search);
  // Preserve the public search.json URL used by existing integrations.
  const prefix = lang === 'en' ? 'public' : 'public/zh-cn';
  await writeJson(`${prefix}/search.json`, search);
}
await writeJson('.generated/routes.json', allRoutes);
await writeJson('public/data/routes.json', allRoutes.map(p => p.route));
console.log(`Prepared ${pages.length} pages and ${pages.filter(p => p.kind === 'post').length} articles (${changed} edited Markdown files compiled).`);
