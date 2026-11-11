import type { Metadata } from 'next';
import type { SitePage } from './types';
import { siteOrigin } from './site-origin';

export function metadataFor(page: SitePage): Metadata {
  const alternates = page.alternates;
  return {
    title: page.title,
    description: page.description || undefined,
    alternates: {
      canonical: siteOrigin + (page.canonicalRoute || page.route),
      languages: alternates ? { en: siteOrigin + alternates.en, 'zh-CN': siteOrigin + alternates['zh-cn'], 'x-default': siteOrigin + alternates.en } : undefined,
      types: { 'application/rss+xml': (page.lang === 'zh-cn' ? '/zh-cn' : '') + '/feed.xml' },
    },
    robots: page.kind === '404' || page.kind === 'redirect' ? { index: false, follow: true } : undefined,
    openGraph: { title: page.title, description: page.description || undefined, locale: page.lang === 'zh-cn' ? 'zh_CN' : 'en_US', alternateLocale: page.lang === 'zh-cn' ? ['en_US'] : ['zh_CN'], url: siteOrigin + (page.canonicalRoute || page.route) },
  };
}
