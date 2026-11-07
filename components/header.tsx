'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import type { Language, SearchEntry } from '@/lib/types';
import { Html } from './html';

const navItems = [['/', 'HOME'], ['/blogs/', 'BLOG'], ['/categories/', 'Categories'], ['/contact/', 'Contact'], ['/tags/', 'Tags']];
function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'night' ? 'day' : 'night';
  document.documentElement.dataset.theme = next;
  try { sessionStorage.setItem('theme', next); } catch {}
  window.dispatchEvent(new Event('site-theme-change'));
}
function switchLanguage() {
  const { pathname, search, hash } = window.location;
  const segments = pathname.split('/');
  if (segments[1] === 'zh-cn') segments.splice(1, 1);
  else segments.splice(1, 0, 'zh-cn');
  const target = segments.join('/') || '/';
  window.location.assign(target + search + hash);
}

function Icon({ className, label, children, onClick }: {
  className: string; label: string; children?: React.ReactNode; onClick: () => void;
}) {
  return <i className={className} role="button" tabIndex={0} aria-label={label} onClick={onClick}
    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}>{children}</i>;
}

export function Header({ lang, className }: { lang: Language; className: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [searchError, setSearchError] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const prefix = lang === 'zh-cn' ? '/zh-cn' : '';
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
    <a href={prefix + url} className="nav__link">{text}</a>
  </li>{'\n  '}</Fragment>)}</ul>;
  return <>
    <header className={className}><div className="container"><div className="row"><div className="header__inner col col-12">
      <div className="logo"><a className="logo__link" href={prefix + '/'}><img className="logo__image" src="/images/logos/logo.svg" alt="PT's Blog" /></a></div>
      <div className={`menu-overlay${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
        <nav className="main-nav"><div className="main-nav__box">
          <div className="nav__icon-left">
            <Icon className="child material-icons js-lang-switch" label="Switch language" onClick={switchLanguage}>translate</Icon>
            <Icon className="child material-icons js-theme-switch" label="Switch theme" onClick={toggleTheme}>contrast</Icon>
          </div>
          <div className="nav__icon-close" role="button" aria-label="Close menu" tabIndex={0} onClick={() => setMenuOpen(false)} onKeyDown={e => { if (e.key === 'Enter') setMenuOpen(false); }}><i className="ion ion-md-close" /></div>
          <div className="nav-grid"><div className="nav-grid__item"><h2 className="nav-grid__title">Menu</h2><div className="mobile-nav">{nav}</div></div></div>
        </div></nav>
      </div>
      <div className="navigation"><div className="top-nav">{nav}</div></div>
      <div className="nav-buttons">
        <Icon className="nav__icon nav__icon-menu ion ion-md-menu" label="Open menu" onClick={() => setMenuOpen(true)} />
        <Icon className="nav__icon material-icons nav_icon-desktop js-lang-switch" label="Switch language" onClick={switchLanguage}>translate</Icon>
        <Icon className="nav__icon material-icons nav_icon-desktop js-theme-switch" label="Switch theme" onClick={toggleTheme}>contrast</Icon>
        <Icon className="search-button nav__icon material-icons" label="Search" onClick={() => { setMenuOpen(false); setSearchOpen(true); }}>search</Icon>
      </div>
    </div></div></div></header>
    <div className={`search${searchOpen ? ' is-visible' : ''}`} role="dialog" aria-label={lang === 'zh-cn' ? '搜索博客' : 'Search for Blog'} aria-modal={searchOpen || undefined} aria-hidden={!searchOpen}
      onClick={e => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
      <div className="container"><div className="row"><div className="col col-12"><div className="search__box" onClick={e => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
        <div className="search__group">
          <div className="search__close" role="button" aria-label="Close search" tabIndex={0} onClick={() => setSearchOpen(false)} onKeyDown={e => { if (e.key === 'Enter') setSearchOpen(false); }}><i className="ion ion-md-close" /></div>
          <label htmlFor="js-search-input" className="screen-reader-text">Search for Blog</label>
          <input ref={input} type="text" id="js-search-input" className="search__text" autoComplete="off" placeholder={lang === 'zh-cn' ? '搜索...' : 'Search...'} value={query} onChange={e => setQuery(e.target.value)} />
        </div>
      </div></div></div></div>
      <div className="container"><div className="row search-results-list" id="js-results-container" aria-live="polite">
        {results.map(item => <Html key={item.url} html={item.article} />)}
        {terms && !results.length && (entries.length > 0 || searchError) && <li className="no-results"><h3>{searchError ? (lang === 'zh-cn' ? '搜索暂时不可用' : 'Search is temporarily unavailable') : 'No results found'}</h3></li>}
      </div></div>
    </div>
  </>;
}

export { toggleTheme };
