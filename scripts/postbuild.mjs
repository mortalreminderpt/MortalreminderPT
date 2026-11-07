import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const routes = JSON.parse(await fs.readFile('.generated/routes.json', 'utf8'));
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const origin = (process.env.SITE_URL || 'https://ptzhao.com').replace(/\/$/, '');
// App Router emits trailing-slash folders; retain the original file-extension URL.
await fs.copyFile('out/zh-cn/404/index.html', 'out/zh-cn/404.html');
const notFound = await fs.readFile('out/404.html', 'utf8');
await fs.writeFile('out/404.html', notFound.replace(/<title>[^<]*<\/title>/, '<title>Page not found</title>'));
await fs.writeFile('out/.nojekyll', '');
await fs.writeFile('out/CNAME', 'ptzhao.com\n');
const revision = process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
await fs.writeFile('out/deployment.json', JSON.stringify({ framework: 'Next.js', revision, origin, builtAt: new Date().toISOString() }, null, 2) + '\n');
await fs.writeFile('out/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
await fs.writeFile('out/sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + routes.filter(r => !['404', 'redirect'].includes(r.kind)).map(r => `<url><loc>${escape(origin + encodeURI(r.route))}</loc></url>`).join('') + '</urlset>');
for (const lang of ['en', 'zh-cn']) {
  const posts = await Promise.all(routes.filter(r => r.kind === 'post' && r.lang === lang).map(r => fs.readFile('.generated/pages/' + r.file, 'utf8').then(JSON.parse)));
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  const rss = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>PT’s Blog</title><link>' + origin + '</link><description>Just coding for fun.</description>' + posts.slice(0, 20).map(p => `<item><title>${escape(p.postTitle)}</title><link>${escape(origin + encodeURI(p.route))}</link><guid>${escape(origin + encodeURI(p.route))}</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate><description><![CDATA[${p.contentHtml.replaceAll(']]>', ']]]]><![CDATA[>')}]]></description></item>`).join('') + '</channel></rss>';
  const target = lang === 'en' ? 'out/feed.xml' : 'out/zh-cn/feed.xml';
  await fs.writeFile(target, rss);
}
const missing = [];
for (const route of routes) {
  const filename = path.join('out', route.route === '/' ? 'index.html' : route.route.endsWith('.html') ? route.route.slice(1) : route.route.slice(1) + 'index.html');
  try { if (!(await fs.stat(filename)).isFile()) missing.push(filename); } catch { missing.push(filename); }
}
if (missing.length) throw new Error('Missing exported routes:\n' + missing.join('\n'));
console.log(`Verified all ${routes.length} original routes in the static export.`);
