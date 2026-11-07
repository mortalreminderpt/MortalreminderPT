import fs from 'node:fs';
import path from 'node:path';
import { cache } from 'react';
import baseRoutes from '@/content/routes.json';
import config from '@/content/site.json';
import en from '@/content/shared-en.json';
import zh from '@/content/shared-zh-cn.json';
import type { Language, SitePage } from './types';

export { config };
const shared = { en, 'zh-cn': zh };
export const getShared = cache((lang: Language) => {
  const generated = path.join(process.cwd(), `.generated/shared-${lang}.json`);
  return fs.existsSync(generated) ? JSON.parse(fs.readFileSync(generated, 'utf8')) as typeof en : shared[lang];
});
export const getRoutes = cache(() => {
  const generated = path.join(process.cwd(), '.generated/routes.json');
  return fs.existsSync(generated) ? JSON.parse(fs.readFileSync(generated, 'utf8')) as typeof baseRoutes : baseRoutes;
});
export function normalizeRoute(route: string) {
  let value: string;
  try { value = decodeURI(route); } catch { value = route; }
  return value.endsWith('.html') ? value : value.replace(/\/*$/, '/');
}
export const getPage = cache((route: string): SitePage | undefined => {
  const record = getRoutes().find(r => normalizeRoute(r.route) === normalizeRoute(route));
  if (!record) return undefined;
  const generated = path.join(process.cwd(), '.generated/pages', record.file);
  const file = fs.existsSync(generated) ? generated : path.join(process.cwd(), 'content/rendered', record.file);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
});
export const translationsFor = (lang: Language) => config.translations[lang];
