'use client';

import { useEffect, useState } from 'react';
import { toggleTheme } from './header';
import type { Language } from '@/lib/types';
import { installImageZoom } from '@/lib/image-zoom';
import { labelsFor, htmlLanguage } from '@/lib/i18n';

declare global {
  interface Window {
    Prism?: { highlightAll: () => void };
    ColorThief?: new () => { getColor: (image: HTMLImageElement) => number[] };
    LazyLoad?: new (options: { elements_selector: string }) => { update: () => void; destroy: () => void };
  }
}

function loadScript(id: string, src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing?.dataset.loaded) return resolve();
    const script = existing || document.createElement('script');
    script.id = id; script.src = src;
    script.addEventListener('load', () => { script.dataset.loaded = 'true'; resolve(); }, { once: true });
    script.addEventListener('error', reject, { once: true });
    if (!existing) document.head.appendChild(script);
  });
}

export function SiteEffects({ lang, title, redirectTo }: { lang: Language; title: string; redirectTo?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const t = labelsFor(lang);
  useEffect(() => {
    if (redirectTo) window.location.replace(redirectTo + window.location.search + window.location.hash);
    document.documentElement.lang = htmlLanguage(lang);
    document.title = title;
    const timer = window.setTimeout(() => { document.title = title; document.body.classList.add('is-in'); }, 150);
    const onScroll = () => { setScrolled(window.scrollY > 0.2 * window.innerHeight); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const click = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('#homepage')) {
        const prefix = window.location.pathname.split('/')[1];
        window.location.assign(['en', 'zh-cn'].includes(prefix) ? `/${prefix}/` : '/');
      }
    };
    document.addEventListener('click', click);
    document.querySelectorAll<HTMLImageElement>('.page img, .post img').forEach(img => { if (!img.closest('a')) img.dataset.action = 'zoom'; });
    const removeZoom = installImageZoom();
    document.querySelectorAll<HTMLPreElement>('pre').forEach(pre => { if (pre.firstChild?.nodeName === 'CODE') pre.className = 'line-numbers'; });
    document.querySelectorAll<HTMLIFrameElement>('.post__content iframe, .page__content iframe').forEach(frame => {
      if (frame.parentElement?.classList.contains('fluid-width-video-wrapper')) return;
      const ratio = (Number(frame.getAttribute('height')) || frame.offsetHeight || 9) / (Number(frame.getAttribute('width')) || frame.offsetWidth || 16);
      const wrap = document.createElement('div');
      wrap.className = 'fluid-width-video-wrapper';
      wrap.style.cssText = `width:100%;position:relative;padding:0;padding-top:${ratio * 100}%`;
      frame.before(wrap); wrap.appendChild(frame);
      frame.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%';
      frame.removeAttribute('width'); frame.removeAttribute('height');
    });
    const highlight = () => {
      const theme = document.documentElement.dataset.theme === 'night' ? 'night' : 'day';
      let css = document.getElementById('theme-prism-css') as HTMLLinkElement | null;
      if (!css) { css = document.createElement('link'); css.id = 'theme-prism-css'; css.rel = 'stylesheet'; document.head.appendChild(css); }
      css.href = theme === 'night' ? '/css/prism-dark.css' : '/css/prism.css';
      loadScript('theme-prism-script', theme === 'night' ? '/vendor/prism-dark.js' : '/vendor/prism.js').then(() => window.Prism?.highlightAll()).catch(() => {});
    };
    highlight();
    window.addEventListener('site-theme-change', highlight);
    let alive = true;
    let lazy: { update: () => void; destroy: () => void } | undefined;
    const included = new WeakSet<Element>();
    const includesAbort = new AbortController();
    const loadIncludes = () => {
      document.querySelectorAll('include[src]').forEach(element => {
        if (included.has(element)) return;
        included.add(element);
        fetch(element.getAttribute('src')!, { signal: includesAbort.signal }).then(response => {
          if (!response.ok) throw new Error('Unable to load formula');
          return response.text();
        }).then(html => { if (alive) element.innerHTML = html; }).catch(() => {});
      });
    };
    loadIncludes();
    const imagesObserver = new MutationObserver(() => { lazy?.update(); loadIncludes(); });
    imagesObserver.observe(document.body, { childList: true, subtree: true });
    loadScript('lazyload-script', '/vendor/lazyload.min.js').then(() => {
      if (!alive || !window.LazyLoad) return;
      lazy = new window.LazyLoad({ elements_selector: '.lazy' });
    }).catch(() => {});
    loadScript('color-thief-script', '/vendor/color-thief.umd.js').then(() => {
      if (!alive || !window.ColorThief) return;
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        if (!alive || !window.ColorThief) return;
        try {
          const rgb = new window.ColorThief().getColor(image).map(value => value / 255);
          const [r, g, b] = rgb, max = Math.max(...rgb), min = Math.min(...rgb), d = max - min;
          let h = 0;
          if (d) {
            if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
            else if (max === g) h = (b - r) / d + 2;
            else h = (r - g) / d + 4;
          }
          document.documentElement.style.setProperty('--primary-color', `${60 * h}deg`);
        } catch { /* Preserve the original default accent if the image is unavailable. */ }
      };
      image.src = 'https://bing.biturl.top/?resolution=1920&format=image&index=0&mkt=en-US';
    }).catch(() => {});
    return () => {
      alive = false; clearTimeout(timer);
      imagesObserver.disconnect(); includesAbort.abort(); lazy?.destroy();
      window.removeEventListener('scroll', onScroll); removeZoom();
      document.removeEventListener('click', click); window.removeEventListener('site-theme-change', highlight);
    };
  }, [lang, title, redirectTo]);
  return <>
    <div className={`pop${scrolled ? ' is-active' : ''}`}>
      <i id="js-theme-switch-pop" className="pop-item ion ion-md-contrast" title={t.switchTheme} role="button" aria-label={t.switchTheme} tabIndex={0} onClick={toggleTheme} onKeyDown={e => { if (e.key === 'Enter') toggleTheme(); }} />
      <br />
      <i className="top pop-item ion ion-ios-arrow-up" title={t.backTop} role="button" aria-label={t.backTop} tabIndex={0} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} onKeyDown={e => { if (e.key === 'Enter') window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
    </div>
  </>;
}
