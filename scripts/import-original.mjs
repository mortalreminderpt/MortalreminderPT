import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { load } from 'cheerio';
import matter from 'gray-matter';

const source = path.resolve(process.argv[2] || '');
if (!process.argv[2]) throw new Error('Usage: node scripts/import-original.mjs /path/to/original');
const root = process.cwd();
const read = (file) => fs.readFile(path.join(source, file), 'utf8');
const write = async (file, data) => {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, data);
};
const json = (file, value) => write(file, JSON.stringify(value, null, 2) + '\n');
async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const all = await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
  return all.flat();
}
const hash = (text) => crypto.createHash('sha256').update(text).digest('hex');
const clean = (html = '') => html.replace(/<!--[^]*?-->/g, '').replace(/<script\b[^]*?<\/script>/gi, '').replace(/\s*#\{html_opts\}/g, '');
const site = matter('---\n' + await read('_config.yml') + '\n---').data;
const translations = {};
for (const lang of ['en', 'zh-cn']) translations[lang] = matter('---\n' + await read(`_i18n/${lang}.yml`) + '\n---').data;
await json('content/site.json', { site, translations });
await fs.cp(path.join(source, '_sass'), 'styles', { recursive: true, filter: p => !p.endsWith('.DS_Store') });
const scss = "@use 'ionicons';\n" + (await read('_includes/main.scss')).replace(/^\$color-degree:.*$/m, '');
await write('styles/main.scss', scss);
for (const dir of ['images', 'css']) await fs.cp(path.join(source, dir), path.join('public', dir), { recursive: true });
for (const file of ['prism.js', 'prism-dark.js', 'color-thief.umd.js', 'lazyload.min.js']) {
  await write(path.join('public/vendor', file), await read(`js/vendors/${file}`));
}
// T4J's XML files are public MathML fragments fetched by <include> elements.
for (const langPrefix of ['', 'zh-cn']) {
  await fs.mkdir(path.join('public', langPrefix), { recursive: true });
  for (const file of await fs.readdir(path.join(source, '_site', langPrefix))) {
    if (/^_[0-9a-f]{64}\.(xml|svg)$/.test(file)) await fs.copyFile(path.join(source, '_site', langPrefix, file), path.join('public', langPrefix, file));
  }
}
const sourcePosts = [];
for (const lang of ['en', 'zh-cn']) {
  for (const file of await walk(path.join(source, '_i18n', lang, '_posts'))) {
    if (!file.endsWith('.md')) continue;
    const raw = await fs.readFile(file, 'utf8');
    const { data, content } = matter(raw);
    const target = path.join('content/posts', lang, path.basename(file));
    await write(target, raw);
    sourcePosts.push({ lang, source: target, digest: hash(raw), data, markdown: content });
  }
}
const pages = [];
const normalize = (text) => text.replace(/\s+/g, ' ').trim();
function card($, node) {
  const el = $(node);
  const image = el.find('.article__image').first();
  const img = image.find('img').first();
  const title = el.find('.article__title').first();
  return {
    className: el.attr('class') || '',
    image: image.length ? { href: image.attr('href') || '', src: img.attr('data-src') || img.attr('src') || '', alt: img.attr('alt') || '' } : null,
    featured: !!el.find('span.featured-post').length,
    metaHtml: clean(el.find('.article__meta').first().html() || ''),
    titleHtml: clean(title.html() || ''),
    title: title.text().trim(),
    excerptHtml: clean(el.find('.article__excerpt').first().html() || ''),
    bottomHtml: clean(el.find('.article__bottom').first().html() || ''),
  };
}
for (const file of (await walk(path.join(source, '_site'))).filter(f => f.endsWith('.html')).sort()) {
  const raw = await fs.readFile(file, 'utf8');
  const $ = load(raw);
  const main = $('main.content');
  if (!main.length) throw new Error('Missing main content: ' + file);
  const relative = path.relative(path.join(source, '_site'), file).split(path.sep).join('/');
  const route = '/' + relative.replace(/index\.html$/, '');
  const lang = route.startsWith('/zh-cn/') ? 'zh-cn' : 'en';
  let kind = main.find('.post__content').length ? 'post'
    : main.find('.archive-box').length ? 'archive'
    : /^(\/zh-cn)?\/blogs\//.test(route) ? 'blog'
    : /^(\/zh-cn)?\/(tags|categories)\/$/.test(route) ? 'taxonomy'
    : /^(\/zh-cn)?\/contact\/$/.test(route) ? 'contact'
    : /^(\/zh-cn)?\/about\/$/.test(route) ? 'redirect'
    : route.endsWith('/404.html') ? '404' : 'page';
  const hero = main.find('.hero, .hero-without-image').first();
  const page = {
    route, lang, kind, title: $('title').text(),
    description: $('meta[name="description"]').attr('content') || '',
    headerClass: $('header.header').attr('class') || '',
    heroHtml: clean($.html(hero)),
    contentHtml: clean(main.find(kind === 'post' ? '.post__content' : '.page__content').first().html() || ''),
  };
  if (kind === 'post') {
    const title = normalize(main.find('.post__title').text());
    const candidates = sourcePosts.filter(p => p.lang === lang && normalize(String(p.data.title)) === title);
    if (candidates.length !== 1) throw new Error(`Cannot uniquely map ${route}: ${title} (${candidates.length})`);
    const post = candidates[0];
    page.source = post.source;
    page.sourceDigest = post.digest;
    page.postTitle = title;
    page.date = main.find('.post__date').attr('datetime');
    page.dateText = main.find('.post__date').text();
    page.tags = post.data.tags || [];
    page.categories = Array.isArray(post.data.category) ? post.data.category : [post.data.category].filter(Boolean);
    page.image = post.data.image || '';
    page.featured = post.data.featured === true;
    page.navigationHtml = clean($.html(main.find('.post__navigation')));
    const related = main.find('.related-posts');
    page.relatedClass = related.attr('class') || 'related-posts';
    page.relatedTitle = related.find('.related-title').text();
    page.relatedCards = related.find('.article').toArray().map(n => card($, n));
  } else if (kind === 'blog') {
    page.featuredCards = main.find('section.featured-post .article').toArray().map(n => card($, n));
    page.cards = main.find('.row.grid').first().children('.article').toArray().map(n => card($, n));
    page.pageNumber = Number(route.match(/\/blogs\/(\d+)\//)?.[1] || 1);
    page.totalPages = Number(raw.match(/pagination_available_pages_number\s*=\s*['"]?(\d+)/)?.[1] || (lang === 'en' ? 8 : 16));
    page.loadMoreText = main.find('.load-more-posts').text().trim();
  } else if (kind === 'taxonomy' || kind === 'archive') {
    page.cards = main.find('.article').toArray().map(n => card($, n));
    page.sectionClass = main.find('section').last().attr('class') || '';
  }
  if (kind === 'redirect') page.redirectTo = lang === 'zh-cn' ? '/zh-cn/' : '/';
  if (kind === '404') page.contentHtml = page.contentHtml.replace('id="homepage"', 'id="homepage" data-homepage="true"');
  await json(path.join('content/rendered', hash(route) + '.json'), page);
  pages.push({ route, file: hash(route) + '.json', kind, lang, source: page.source });
}
// Shared server-rendered fragments are kept separate from article bodies.
for (const lang of ['en', 'zh-cn']) {
  const prefix = lang === 'en' ? '' : 'zh-cn/';
  const $ = load(await read('_site/' + prefix + 'index.html'));
  await json(`content/shared-${lang}.json`, {
    footerWidgetsHtml: clean($.html($('.footer-widgets'))),
    footerHtml: clean($.html($('footer.footer'))),
  });
  const search = JSON.parse(await read('_site/' + prefix + 'search.json'));
  await json(`content/search-${lang}.json`, search.map(item => ({ ...item, text: load(item.content).text() })));
}
const readme = await read('README.md');
await write('content/home.md', readme);
const styleguide = await read('_pages/styleguide.md');
await write('content/styleguide.md', styleguide);
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: source, encoding: 'utf8' }).trim();
await json('content/routes.json', pages);
await json('content/provenance.json', {
  repository: 'https://github.com/mortalreminderpt/MortalreminderPT', commit,
  pages: pages.length, posts: sourcePosts.length,
  homeDigest: hash(readme), styleguideDigest: hash(styleguide),
});
console.log(JSON.stringify({ imported: pages.length, posts: sourcePosts.length, kinds: pages.reduce((a, p) => ({ ...a, [p.kind]: (a[p.kind] || 0) + 1 }), {}) }, null, 2));
