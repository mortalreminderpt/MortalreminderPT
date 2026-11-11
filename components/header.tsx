'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import type { Language, SearchEntry } from '@/lib/types';
import { Html } from './html';
import { labelsFor } from '@/lib/i18n';

const navItems = [['/', 'home'], ['/blogs/', 'blog'], ['/categories/', 'categories'], ['/contact/', 'contact'], ['/tags/', 'tags']] as const;
function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'night' ? 'day' : 'night';
  document.documentElement.dataset.theme = next;
  try { sessionStorage.setItem('theme', next); } catch {}
  window.dispatchEvent(new Event('site-theme-change'));
}
function Icon({ className, label, children, onClick }: {
  className: string; label: string; children?: React.ReactNode; onClick: () => void;
}) {
  return <i className={className} role="button" tabIndex={0} aria-label={label} onClick={onClick}
    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}>{children}</i>;
}

export function Header({ lang, className, alternates, anchorTranslations }: { lang: Language; className: string; alternates?: Record<Language, string>; anchorTranslations?: Record<string, string> }) {
  const t = labelsFor(lang);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [searchError, setSearchError] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const prefix = lang === 'zh-cn' ? '/zh-cn' : '';
  function switchLanguage() {
    const { pathname, search, hash } = window.location;
    const targetLang = lang === 'zh-cn' ? 'en' : 'zh-cn';
    const base = pathname.replace(/^\/zh-cn(?=\/|$)/, '') || '/';
    const target = alternates?.[targetLang] || (targetLang === 'zh-cn' ? '/zh-cn' + base : base);
    let nextHash = hash;
    if (hash && anchorTranslations) {
      let id = '';
      try { id = decodeURIComponent(hash.slice(1)); } catch {}
      nextHash = anchorTranslations[id] ? '#' + encodeURIComponent(anchorTranslations[id]) : '';
    }
    window.location.assign(target + search + nextHash);
  }
  const close = () => { setMenuOpen(false); setSearchOpen(false); };
  useEffect(() => {
    document.body.classList.toggle('menu-is-open', menuOpen);
    return () => document.body.classList.remove('menu-is-open');
  }, [menuOpen]);
  useEffect(() => {
    const onScroll = () => close();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchOpen(false); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKey); };
  }, []);
  useEffect(() => {
    if (!searchOpen) return;
    const timer = window.setTimeout(() => input.current?.focus(), 300);
    if (!entries.length) fetch(`/data/search-${lang}.json`).then(r => {
      if (!r.ok) throw new Error('Search unavailable');
      return r.json();
    }).then(setEntries).catch(() => setSearchError(true));
    return () => clearTimeout(timer);
  }, [searchOpen, entries.length, lang]);
  const terms = query.toLowerCase();
  const results = terms ? entries.filter(p => [p.title, p.category, p.tags, p.url, p.date, p.content, p.article].some(s => typeof s === 'string' && s.trim().toLowerCase().includes(terms))).slice(0, 10) : [];
  const nav = <ul className="nav__list list-reset">{'\n  '}{navItems.map(([url, text]) => <Fragment key={url}><li className="nav__item">
    <a href={prefix + url} className="nav__link">{lang === 'en' ? t[text].toUpperCase() : t[text]}</a>
  </li>{'\n  '}</Fragment>)}</ul>;
  return <>
    <header className={className}><div className="container"><div className="row"><div className="header__inner col col-12">
      <div className="logo"><a className="logo__link" href={prefix + '/'}><img className="logo__image" src="/images/logos/logo.svg" alt="PT's Blog" /></a></div>
      <div className={`menu-overlay${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
        <nav className="main-nav"><div className="main-nav__box">
          <div className="nav__icon-left">
            <Icon className="child material-icons js-lang-switch" label={t.switchLanguage} onClick={switchLanguage}>translate</Icon>
            <Icon className="child material-icons js-theme-switch" label={t.switchTheme} onClick={toggleTheme}>contrast</Icon>
          </div>
          <div className="nav__icon-close" role="button" aria-label={t.closeMenu} tabIndex={0} onClick={() => setMenuOpen(false)} onKeyDown={e => { if (e.key === 'Enter') setMenuOpen(false); }}><i className="ion ion-md-close" /></div>
          <div className="nav-grid"><div className="nav-grid__item"><h2 className="nav-grid__title">{t.menu}</h2><div className="mobile-nav">{nav}</div></div></div>
        </div></nav>
      </div>
      <div className="navigation"><div className="top-nav">{nav}</div></div>
      <div className="nav-buttons">
        <Icon className="nav__icon nav__icon-menu ion ion-md-menu" label={t.openMenu} onClick={() => setMenuOpen(true)} />
        <Icon className="nav__icon material-icons nav_icon-desktop js-lang-switch" label={t.switchLanguage} onClick={switchLanguage}>translate</Icon>
        <Icon className="nav__icon material-icons nav_icon-desktop js-theme-switch" label={t.switchTheme} onClick={toggleTheme}>contrast</Icon>
        <Icon className="search-button nav__icon material-icons" label={t.search} onClick={() => { setMenuOpen(false); setSearchOpen(true); }}>search</Icon>
      </div>
    </div></div></div></header>
    <div className={`search${searchOpen ? ' is-visible' : ''}`} role="dialog" aria-label={t.searchBlog} aria-modal={searchOpen || undefined} aria-hidden={!searchOpen}
      onClick={e => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
      <div className="container"><div className="row"><div className="col col-12"><div className="search__box" onClick={e => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
        <div className="search__group">
          <div className="search__close" role="button" aria-label={t.closeSearch} tabIndex={0} onClick={() => setSearchOpen(false)} onKeyDown={e => { if (e.key === 'Enter') setSearchOpen(false); }}><i className="ion ion-md-close" /></div>
          <label htmlFor="js-search-input" className="screen-reader-text">{t.searchBlog}</label>
          <input ref={input} type="text" id="js-search-input" className="search__text" autoComplete="off" placeholder={t.searchPlaceholder} value={query} onChange={e => setQuery(e.target.value)} />
        </div>
      </div></div></div></div>
      <div className="container"><div className="row search-results-list" id="js-results-container" aria-live="polite">
        {results.map(item => <Html key={item.url} html={item.article} />)}
        {terms && !results.length && (entries.length > 0 || searchError) && <li className="no-results"><h3>{searchError ? t.searchUnavailable : t.noResults}</h3></li>}
      </div></div>
    </div>
  </>;
}

export { toggleTheme };
