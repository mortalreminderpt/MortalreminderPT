'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { labelsFor } from '@/lib/i18n';

export function NotFoundLocale({ english, chinese }: { english: ReactNode; chinese: ReactNode }) {
  const [chinesePath, setChinesePath] = useState(false);
  useEffect(() => {
    const chinese = /^\/zh-cn(?:\/|$)/.test(window.location.pathname);
    setChinesePath(chinese);
    if (!chinese) return;
    const title = labelsFor('zh-cn').notFound;
    // GitHub Pages has one fallback file; Next may reconcile its English metadata later.
    const synchronizeTitle = () => { if (document.title !== title) document.title = title; };
    const observer = new MutationObserver(synchronizeTitle);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    synchronizeTitle();
    return () => observer.disconnect();
  }, []);
  return chinesePath ? chinese : english;
}
