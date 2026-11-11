// One-time migration: retain existing human translations as persisted results.
import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, baseRoute, digest, payloadDigest, atomicWrite, translationFiles, exists, validateTaxonomy } from './i18n-core.mjs';

if (await exists('content/i18n/posts.json')) throw new Error('The i18n migration has already been applied.');
const routes = await readJson('content/routes.json');
const originals = await Promise.all(routes.filter(route => route.kind === 'post').map(async route => ({ ...JSON.parse(await fs.readFile('content/rendered/' + route.file, 'utf8')), snapshotFile: route.file })));
const groups = new Map();
for (const post of originals) {
  const key = baseRoute(post.route);
  if (!groups.has(key)) groups.set(key, {});
  groups.get(key)[post.lang] = post;
}
const posts = [];
let imported = 0;
for (const [key, versions] of groups) {
  const canonical = versions['zh-cn'] || versions.en;
  const sourceLang = canonical.lang;
  const sourceRaw = await fs.readFile(canonical.source, 'utf8');
  const id = 'post-' + digest(key).slice(0,20);
  const entry = { id, key, source: canonical.source, sourceLang, routes: {}, snapshots: {} };
  for (const lang of ['en','zh-cn']) {
    const page = versions[lang];
    entry.routes[lang] = page?.route || (lang === 'en' ? key : '/zh-cn' + key);
    if (!page) continue;
    const raw = await fs.readFile(page.source, 'utf8');
    entry.snapshots[lang] = { file: page.snapshotFile, rawDigest: digest(raw) };
    if (lang === sourceLang) continue;
    const target = translationFiles(id, lang);
    if (await exists(target.markdown) || await exists(target.metadata)) throw new Error('Translation target already exists: ' + id);
    await fs.mkdir(path.dirname(target.markdown), { recursive: true });
    await fs.rename(page.source, target.markdown);
    await atomicWrite(target.metadata, { version: 1, sourceDigest: payloadDigest(sourceRaw), sourceLang, targetLang: lang, provider: 'existing-human-translation', targetDigest: digest(raw) });
    imported++;
  }
  posts.push(entry);
}
posts.sort((a,b) => a.id.localeCompare(b.id));
await atomicWrite('content/i18n/posts.json', { version: 1, posts });
validateTaxonomy(await readJson('content/i18n/taxonomy.json'));
console.log(`Migrated ${posts.length} single-source articles; retained ${imported} existing human translations without changing their Markdown.`);
