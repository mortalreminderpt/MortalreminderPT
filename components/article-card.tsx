import type { Card } from '@/lib/types';
import { Html, assetUrl } from './html';

export function ArticleCard({ card }: { card: Card }) {
  return <div className={card.className}>
    <div className="article__inner">
      {card.featured && <span className="featured-post ion ion-ios-star-outline" />}
      {card.image && <a className="article__image" href={card.image.href}>
        <img className="lazy" data-src={assetUrl(card.image.src)} alt={card.image.alt} />
      </a>}
      <div className="article__content">
        <div className="article__meta"><Html html={card.metaHtml} /></div>
        <h2 className="article__title"><Html html={card.titleHtml} /></h2>
        <p className="article__excerpt"><Html html={card.excerptHtml} /></p>
        <div className="article__bottom"><Html html={card.bottomHtml} /></div>
      </div>
    </div>
  </div>;
}
