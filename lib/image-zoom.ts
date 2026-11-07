/** Native DOM port of the original MIT-licensed fat/zoom.js v0.0.2 interaction. */
export function installImageZoom() {
  let active: { image: HTMLImageElement; wrap: HTMLDivElement; overlay: HTMLDivElement; scroll: number | null } | null = null;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  let touchY = 0;
  const dispose = () => {
    clearTimeout(closeTimer);
    if (!active) return;
    const { image, wrap, overlay } = active;
    image.classList.remove('zoom-img');
    image.dataset.action = 'zoom';
    image.style.transform = '';
    if (wrap.parentNode) wrap.replaceWith(image);
    overlay.remove();
    document.body.classList.remove('zoom-overlay-open', 'zoom-overlay-transitioning');
    active = null;
  };
  const close = () => {
    if (!active) return;
    document.body.classList.remove('zoom-overlay-open');
    document.body.classList.add('zoom-overlay-transitioning');
    active.image.style.transform = '';
    active.wrap.style.transform = '';
    closeTimer = setTimeout(dispose, 300);
  };
  const captureClick = (event: MouseEvent) => {
    if (!active) return;
    event.preventDefault(); event.stopPropagation(); close();
  };
  const click = (event: MouseEvent) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.action !== 'zoom' || active) return;
    if (event.ctrlKey || event.metaKey) { window.open(image.dataset.original || image.src, '_blank'); return; }
    if (image.width >= window.innerWidth - 80 || !image.naturalWidth) return;
    dispose();
    const wrap = document.createElement('div');
    wrap.className = 'zoom-img-wrap'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-label', image.alt || 'Image preview');
    image.before(wrap); wrap.appendChild(image);
    image.classList.add('zoom-img'); image.dataset.action = 'zoom-out';
    const overlay = document.createElement('div'); overlay.className = 'zoom-overlay'; document.body.appendChild(overlay);
    active = { image, wrap, overlay, scroll: null };
    const fullWidth = image.naturalWidth;
    const fullHeight = image.naturalHeight;
    const nativeScale = fullWidth / image.width;
    const availableHeight = window.innerHeight - 80;
    const availableWidth = window.innerWidth - 80;
    const scale = availableWidth > fullWidth && availableHeight > fullHeight
      ? nativeScale
      : availableWidth / availableHeight > fullWidth / fullHeight
        ? availableHeight / fullHeight * nativeScale
        : availableWidth / fullWidth * nativeScale;
    const rect = image.getBoundingClientRect();
    image.getBoundingClientRect();
    image.style.transform = `scale(${scale})`;
    wrap.style.transform = `translate(${window.innerWidth / 2 - rect.left - image.width / 2}px, ${window.innerHeight / 2 - rect.top - image.height / 2}px) translateZ(0)`;
    document.body.classList.add('zoom-overlay-open');
    event.stopPropagation();
  };
  const scroll = () => {
    if (!active) return;
    active.scroll ??= window.scrollY;
    if (Math.abs(active.scroll - window.scrollY) >= 40) close();
  };
  const key = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
  const touchStart = (event: TouchEvent) => { touchY = event.touches[0]?.pageY || 0; };
  const touchMove = (event: TouchEvent) => { if (Math.abs((event.touches[0]?.pageY || 0) - touchY) > 10) close(); };
  document.addEventListener('click', captureClick, true);
  document.addEventListener('click', click);
  document.addEventListener('keyup', key);
  document.addEventListener('touchstart', touchStart, { passive: true });
  document.addEventListener('touchmove', touchMove, { passive: true });
  window.addEventListener('scroll', scroll, { passive: true });
  return () => {
    dispose();
    document.removeEventListener('click', captureClick, true); document.removeEventListener('click', click);
    document.removeEventListener('keyup', key); document.removeEventListener('touchstart', touchStart); document.removeEventListener('touchmove', touchMove);
    window.removeEventListener('scroll', scroll);
  };
}
