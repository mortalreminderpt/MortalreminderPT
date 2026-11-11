import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import matter from 'gray-matter';

export const languages = ['en', 'zh-cn'];
export const translationVersion = 1;
export const digest = value => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
export const readJson = async file => JSON.parse(await fs.readFile(file, 'utf8'));
export const prefixFor = lang => lang === 'zh-cn' ? '/zh-cn' : '';
export const otherLanguage = lang => lang === 'en' ? 'zh-cn' : 'en';
export const escape = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
export const slug = value => String(value).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/g, '');
export const normalizedName = value => String(value).normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
export const asArray = value => value == null ? [] : Array.isArray(value) ? value.map(String) : [String(value)];
export function normalizeRoute(value) {
  let route = String(value);
  try { route = decodeURI(route); } catch {}
  if (!route.startsWith('/')) route = '/' + route;
  return route.endsWith('.html') ? route : route.replace(/\/*$/, '/');
}
export const baseRoute = value => normalizeRoute(value).replace(/^\/zh-cn(?=\/)/, '') || '/';
export const localizedRoute = (route, lang) => prefixFor(lang) + baseRoute(route);
export async function exists(file) { try { await fs.access(file); return true; } catch { return false; } }
export async function atomicWrite(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temporary = file + '.' + process.pid + '.tmp';
  await fs.writeFile(temporary, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n');
  await fs.rename(temporary, file);
}
export async function filesUnder(directory) {
  if (!await exists(directory)) return [];
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.sort((a,b) => a.name.localeCompare(b.name)).map(entry => entry.isDirectory() ? filesUnder(path.join(directory, entry.name)) : [path.join(directory, entry.name)]))).flat();
}
export function taxonomyLookup(registry, type, name) {
  const key = normalizedName(name);
  const matches = registry[type].filter(term => [term.id, ...Object.values(term.labels), ...(term.aliases || [])].some(value => normalizedName(value) === key));
  if (matches.length > 1) throw new Error(`Ambiguous ${type} entry: ${name}`);
  return matches[0];
}
export function validateTaxonomy(registry) {
  for (const type of ['tags', 'categories']) {
    const seen = new Map();
    for (const term of registry[type]) {
      if (!term.id || slug(term.id) !== term.id || !languages.every(lang => typeof term.labels[lang] === 'string' && term.labels[lang].trim())) throw new Error(`Invalid ${type} identity: ${term.id}`);
      for (const alias of [term.id, ...Object.values(term.labels), ...(term.aliases || [])]) {
        const key = normalizedName(alias);
        if (seen.has(key) && seen.get(key) !== term.id) throw new Error(`Conflicting ${type} alias: ${alias}`);
        seen.set(key, term.id);
      }
    }
  }
}
export function contentPayload(raw) {
  const { data, content } = matter(raw);
  return { title: String(data.title || ''), description: String(data.description || ''), body: content };
}
export const payloadDigest = raw => digest(contentPayload(raw));
export function sourceRoute(file, data, previous) {
  if (previous) return baseRoute(previous);
  if (data.permalink) return baseRoute(data.permalink);
  const date = new Date(data.date || path.basename(file).slice(0,10));
  if (Number.isNaN(date.getTime())) throw new Error('Invalid article date: ' + file);
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Melbourne', year:'numeric',month:'2-digit',day:'2-digit' }).formatToParts(date);
  const part = key => parts.find(p => p.type === key).value;
  const category = asArray(data.category ?? data.categories).map(value => String(value).toLowerCase()).join('/');
  const basename = path.basename(file, '.md').replace(/^\d{4}-\d{2}-\d{2}-/, '');
  return normalizeRoute('/' + (category ? category + '/' : '') + [part('year'),part('month'),part('day'),basename].join('/'));
}
export async function discoverSources() {
  const manifest = await exists('content/i18n/posts.json') ? await readJson('content/i18n/posts.json') : { version: 1, posts: [] };
  const bySource = new Map(manifest.posts.map(post => [post.source, post]));
  const posts = [];
  const identities = new Set();
  const urls = new Set();
  for (const file of (await filesUnder('content/posts')).filter(file => file.endsWith('.md'))) {
    const raw = await fs.readFile(file, 'utf8');
    const { data, content } = matter(raw);
    const sourceLang = data.lang || file.split(path.sep)[2];
    if (!languages.includes(sourceLang)) throw new Error('Unknown article language: ' + file);
    if (data.draft === true || data.published === false) continue;
    const previous = bySource.get(file);
    const route = sourceRoute(file, data, previous?.routes[sourceLang]);
    const identity = String(data.translationKey || previous?.key || route);
    const id = previous?.id || 'post-' + digest(identity).slice(0, 20);
    if (identities.has(identity)) throw new Error('Only one source is needed for each article. Duplicate translationKey/URL: ' + identity);
    identities.add(identity);
    const routes = Object.fromEntries(languages.map(lang => [lang, normalizeRoute(previous?.routes[lang] || localizedRoute(route, lang))]));
    for (const url of Object.values(routes)) { if (urls.has(url)) throw new Error('Duplicate article URL: ' + url); urls.add(url); }
    posts.push({ id, key: identity, source: file, sourceLang, routes, raw, data, body: content, digest: payloadDigest(raw), snapshots: previous?.snapshots || {} });
  }
  return posts.sort((a,b) => a.id.localeCompare(b.id));
}
export const publicPostManifest = posts => ({ version: 1, posts: posts.map(({id,key,source,sourceLang,routes,snapshots}) => ({id,key,source,sourceLang,routes,snapshots})) });
export const translationFiles = (id, lang) => ({ markdown: `content/translations/${lang}/${id}.md`, metadata: `content/translations/${lang}/${id}.json` });
export async function readTranslation(id, lang, sourceDigest) {
  const files = translationFiles(id, lang);
  if (!await exists(files.markdown) || !await exists(files.metadata)) return null;
  const metadata = await readJson(files.metadata);
  if (metadata.sourceDigest !== sourceDigest || metadata.version !== translationVersion) return null;
  const raw = await fs.readFile(files.markdown, 'utf8');
  const payload = contentPayload(raw);
  if (!payload.body.trim()) throw new Error('Empty saved translation: ' + files.markdown);
  return { ...payload, raw, metadata, files };
}
