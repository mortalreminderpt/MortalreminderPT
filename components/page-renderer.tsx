import type { SitePage, Card } from '@/lib/types';
import { getShared } from '@/lib/content';
import { Html } from './html';
import { Header } from './header';
import { SiteEffects } from './site-effects';
import { ArticleCard } from './article-card';
import { BlogFeed } from './blog-feed';
import { ContactForm } from './contact-form';
import { labelsFor } from '@/lib/i18n';

function Cards({ cards }: { cards: Card[] }) {
  return <>{cards.map((card, i) => <ArticleCard key={`${card.title}-${i}`} card={card} />)}</>;
}

function MainContent({ page }: { page: SitePage }) {
  if (page.kind === 'post') return <>
    <div className="post-head"><Html html={page.heroHtml} /></div>
    <div className="container"><article className="post animate">
      <div className="post__content"><Html html={page.contentHtml} /></div>
      <Html html={page.navigationHtml} />
    </article></div>
    <div className="container"><div className={page.relatedClass}><div className="row"><div className="col col-12"><div className="container__inner">
      <h3 className="related-title">{page.relatedTitle}</h3>
      <div className="row grid"><Cards cards={page.relatedCards || []} /></div>
    </div></div></div></div></div>
  </>;
  return <>
    <Html html={page.heroHtml} />
    {page.kind === 'blog' ? <>
      {!!page.featuredCards?.length && <section className="featured-post"><div className="container"><div className="row"><div className="col col-12"><div className="container__inner"><div className="row">
        <Cards cards={page.featuredCards} />
      </div></div></div></div></div></section>}
      <BlogFeed initialCards={page.cards || []} pageNumber={page.pageNumber || 1} totalPages={page.totalPages || 1} lang={page.lang} label={page.loadMoreText || 'Load more'} />
    </> : page.kind === 'taxonomy' ? <section className={page.sectionClass}><div className="container"><div className="row"><div className="col col-12"><div className="container__inner"><div className="row">
      <Cards cards={page.cards || []} />
    </div></div></div></div></div></section> : page.kind === 'archive' ? <div className="container"><div className="row"><div className="col col-12 col-d-10 col-m-12 push-m-0 push-d-1"><div className="container__inner"><div className="row grid">
      <Cards cards={page.cards || []} />
    </div></div></div></div></div> : <div className="container"><article className="page animate"><div className="page__content">
      {page.kind === 'contact' ? <ContactForm lang={page.lang} /> : <Html html={page.contentHtml} />}
    </div></article></div>}
  </>;
}

export function PageRenderer({ page }: { page: SitePage }) {
  const fragments = getShared(page.lang);
  return <>
    <Header lang={page.lang} className={page.headerClass} alternates={page.alternates} anchorTranslations={page.anchorTranslations} />
    <main className="content" aria-label={labelsFor(page.lang).content}><MainContent page={page} /></main>
    <SiteEffects lang={page.lang} title={page.title} redirectTo={page.redirectTo} />
    <Html html={fragments.footerWidgetsHtml} />
    <Html html={fragments.footerHtml} />
  </>;
}
