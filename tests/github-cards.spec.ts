import { test, expect } from '@playwright/test';

for (const locale of [{ path: '/', suffix: '', language: 'en' }, { path: '/zh-cn/', suffix: '-zh-cn', language: 'zh-cn' }]) {
  test(`${locale.language}: saved GitHub cards load when the public generator is unavailable`, async ({ page }) => {
    const upstreamRequests: string[] = [];
    await page.route('https://github-readme-stats.vercel.app/**', async route => {
      upstreamRequests.push(route.request().url());
      await route.abort('failed');
    });
    await page.addInitScript(() => sessionStorage.setItem('theme', 'night'));
    await page.goto(locale.path);
    const cards = page.locator('img[data-github-card]');
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0)).toHaveAttribute('src', `/images/github/github-stats${locale.suffix}.svg`);
    await expect(cards.nth(1)).toHaveAttribute('src', `/images/github/top-languages${locale.suffix}.svg`);
    const loaded = () => cards.evaluateAll(images => images.every(image => {
      const img = image as HTMLImageElement;
      return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
    }));
    await expect.poll(loaded).toBe(true);
    await expect(page.locator('body')).toHaveClass(/is-in/);
    await page.locator('.nav-buttons .js-theme-switch').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'day');
    await expect.poll(loaded).toBe(true);
    await page.reload();
    await expect.poll(loaded).toBe(true);
    expect(upstreamRequests).toEqual([]);
  });
}
