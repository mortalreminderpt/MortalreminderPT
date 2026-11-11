import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const routes = JSON.parse(await fs.readFile('.generated/routes.json', 'utf8'));
const pages = await Promise.all(routes.map(route => fs.readFile('.generated/pages/' + route.file, 'utf8').then(JSON.parse)));
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const origin = (process.env.SITE_URL || 'https://ptzhao.com').replace(/\/$/, '');
// App Router emits trailing-slash folders; retain the original file-extension URL.
await fs.copyFile('out/zh-cn/404/index.html', 'out/zh-cn/404.html');
const notFound = await fs.readFile('out/404.html', 'utf8');
if (!notFound.includes('<title>Page not found</title>')) throw new Error('The exported 404 must retain its original title through hydration.');
await fs.writeFile('out/.nojekyll', '');
await fs.writeFile('out/CNAME', 'ptzhao.com\n');
const revision = process.env.SOURCE_REVISION || process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
await fs.writeFile('out/deployment.json', JSON.stringify({ framework: 'Next.js', revision, origin, builtAt: new Date().toISOString() }, null, 2) + '\n');
await fs.writeFile('out/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
await fs.writeFile('out/sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' + pages.filter(page => !['404', 'redirect'].includes(page.kind)).map(page => `<url><loc>${escape(origin + encodeURI(page.route))}</loc>${Object.entries(page.alternates || {}).map(([lang,route]) => `<xhtml:link rel="alternate" hreflang="${lang === 'zh-cn' ? 'zh-CN' : lang}" href="${escape(origin + encodeURI(route))}"/>`).join('')}</url>`).join('') + '</urlset>');
for (const lang of ['en', 'zh-cn']) {
  const posts = pages.filter(page => page.kind === 'post' && page.lang === lang);
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  const labels = JSON.parse(await fs.readFile('content/i18n/ui.json','utf8'))[lang];
  const rss = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>' + escape(labels.blogTitle) + '</title><link>' + origin + (lang === 'zh-cn' ? '/zh-cn/' : '/') + '</link><language>' + (lang === 'zh-cn' ? 'zh-CN' : 'en') + '</language><description>' + escape(labels.tagline) + '</description>' + posts.slice(0, 20).map(p => `<item><title>${escape(p.postTitle)}</title><link>${escape(origin + encodeURI(p.route))}</link><guid>${escape(origin + encodeURI(p.route))}</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate><description><![CDATA[${p.contentHtml.replaceAll(']]>', ']]]]><![CDATA[>')}]]></description></item>`).join('') + '</channel></rss>';
  const target = lang === 'en' ? 'out/feed.xml' : 'out/zh-cn/feed.xml';
  await fs.writeFile(target, rss);
}
const missing = [];
for (const route of routes) {
  const filename = path.join('out', route.route === '/' ? 'index.html' : route.route.endsWith('.html') ? route.route.slice(1) : route.route.slice(1) + 'index.html');
  try {
    if (!(await fs.stat(filename)).isFile()) { missing.push(filename); continue; }
    const page = pages.find(page => page.route === route.route);
    let html = await fs.readFile(filename, 'utf8');
    // GitHub Pages serves a static export: persist locale on the actual HTML element.
    html = html.replace(/(<html\b[^>]*\blang=)"[^"]*"/, '$1"' + (route.lang === 'zh-cn' ? 'zh-CN' : 'en') + '"');
    if (page.kind === 'redirect') html = html.replace('</head>', `<meta http-equiv="refresh" content="0;url=${escape(page.redirectTo)}"></head>`);
    await fs.writeFile(filename,html);
  } catch { missing.push(filename); }
}
if (missing.length) throw new Error('Missing exported routes:\n' + missing.join('\n'));
await fs.copyFile('out/zh-cn/404.html','out/zh-cn/404/index.html');
console.log(`Verified all ${routes.length} localized routes in the static export.`);
