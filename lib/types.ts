export type Language = 'en' | 'zh-cn';

export interface Card {
  className: string;
  image: { href: string; src: string; alt: string } | null;
  featured: boolean;
  metaHtml: string;
  titleHtml: string;
  title: string;
  excerptHtml: string;
  bottomHtml: string;
  href?: string;
}

export interface SitePage {
  route: string;
  lang: Language;
  kind: 'post' | 'blog' | 'archive' | 'taxonomy' | 'contact' | 'redirect' | '404' | 'page';
  title: string;
  description: string;
  headerClass: string;
  heroHtml: string;
  contentHtml: string;
  source?: string;
  sourceDigest?: string;
  postTitle?: string;
  date?: string;
  dateText?: string;
  image?: string;
  tags?: string[];
  categories?: string[];
  featured?: boolean;
  navigationHtml?: string;
  relatedClass?: string;
  relatedTitle?: string;
  relatedCards?: Card[];
  featuredCards?: Card[];
  cards?: Card[];
  pageNumber?: number;
  totalPages?: number;
  loadMoreText?: string;
  sectionClass?: string;
  redirectTo?: string;
  canonicalRoute?: string;
  alternates?: Record<Language, string>;
  anchorTranslations?: Record<string, string>;
  translationId?: string;
  sourceLang?: Language;
  tagIds?: string[];
  categoryIds?: string[];
  taxonomyId?: string;
  taxonomyType?: 'tags' | 'categories';
}

export interface SearchEntry {
  title: string;
  category: string;
  tags: string;
  url: string;
  date: string;
  text: string;
  content: string;
  article: string;
}
