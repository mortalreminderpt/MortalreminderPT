'use client';

import { useState } from 'react';
import type { Card, Language } from '@/lib/types';
import { ArticleCard } from './article-card';

export function BlogFeed({ initialCards, pageNumber, totalPages, lang, label }: {
  initialCards: Card[]; pageNumber: number; totalPages: number; lang: Language; label: string;
}) {
  const [cards, setCards] = useState(initialCards);
  const [nextPage, setNextPage] = useState(pageNumber + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  async function loadMore() {
    if (loading) return;
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(`/data/blog-${lang}-${nextPage}.json`);
      if (!response.ok) throw new Error('Unable to load the next page');
      const batch = await response.json() as Card[];
      setCards(previous => [...previous, ...batch]);
      setNextPage(value => value + 1);
    } catch { setError(true); }
    finally { setLoading(false); }
  }
  return <>
    <div className="container"><div className="row"><div className="col col-12"><div className="container__inner">
      <div className="row grid">{cards.map((card, i) => <ArticleCard key={`${card.title}-${i}`} card={card} />)}</div>
    </div></div></div></div>
    <div className="container"><div className="row"><div className="col col-12 load-more">
      {nextPage <= totalPages && <div className="load-more-section">
        <button className="load-more-posts button button--middle" onClick={loadMore} disabled={loading} aria-live="polite">
          {loading ? (lang === 'zh-cn' ? '加载中...' : 'Loading...') : error ? (lang === 'zh-cn' ? '重试' : 'Try again') : label || 'Load more'}
        </button>
      </div>}
    </div></div></div>
  </>;
}
