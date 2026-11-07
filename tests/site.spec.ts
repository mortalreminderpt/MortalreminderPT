import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem('theme')) sessionStorage.setItem('theme', 'night'); });
});

for (const locale of [{ prefix: '', lang: 'en', count: 64 }, { prefix: '/zh-cn', lang: 'zh-cn', count: 127 }]) {
  test(`${locale.lang}: search, theme, article navigation and code highlighting`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(locale.prefix + '/blogs/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
    await page.locator('.nav-buttons .js-theme-switch').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'day');
    await expect(page.locator('#theme-prism-css')).toHaveAttribute('href', '/css/prism.css');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'day');
    await page.locator('.nav-buttons .search-button').click();
    await expect(page.locator('#js-search-input')).toBeFocused();
    await page.locator('#js-search-input').fill('Prisma');
    await expect(page.locator('#js-results-container .article').first()).toBeVisible();
    await expect(page.locator('#js-results-container')).toContainText('Prisma');
    await page.keyboard.press('Escape');
    await expect(page.locator('.search')).not.toHaveClass(/is-visible/);
    await page.goto(locale.prefix + '/node.js/2024/12/19/Prisma-Filtering/');
    await expect(page.locator('.post__title')).toContainText('Prisma');
    await expect(page.locator('#markdown-toc')).toBeVisible();
    await expect(page.locator('.post__content .token').first()).toBeAttached();
    await expect(page.locator('.line-numbers-rows').first()).toBeAttached();
    const anchor = page.locator('#markdown-toc a').first();
    const href = await anchor.getAttribute('href');
    await anchor.click();
    await expect.poll(() => page.evaluate(() => decodeURIComponent(window.location.hash))).toBe(decodeURIComponent(href!));
    await page.evaluate(() => window.scrollTo(0, 1800));
    await expect(page.locator('.pop')).toHaveClass(/is-active/);
    await page.locator('.top').click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    expect(errors).toEqual([]);
  });

  test(`${locale.lang}: all posts load without duplicates`, async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(locale.prefix + '/blogs/');
    const cards = page.locator('main .row.grid > .grid__post');
    await expect(cards).toHaveCount(8);
    let total = 8;
    while (total < locale.count) {
      await page.locator('.load-more-posts').click();
      total = Math.min(total + 8, locale.count);
      await expect(cards).toHaveCount(total);
    }
    await expect(page.locator('.load-more-posts')).toHaveCount(0);
    const links = await cards.locator('.article__image').evaluateAll(nodes => nodes.map(node => (node as HTMLAnchorElement).pathname));
    expect(new Set(links).size).toBe(links.length);
    await page.goto(locale.prefix + '/blogs/2/');
    await expect(cards).toHaveCount(8);
    await page.locator('.load-more-posts').click();
    await expect(cards).toHaveCount(16);
  });

  test(`${locale.lang}: contact validates and prepares the original email`, async ({ page }) => {
    await page.goto(locale.prefix + '/contact/');
    await expect(page.locator('#contact-form')).toHaveAttribute('action', 'mailto:ptzhao@hotmail.com');
    await page.evaluate(() => document.addEventListener('click', event => {
      if ((event.target as HTMLElement).closest('#contact-mail-link')) event.preventDefault();
    }, { capture: true }));
    await page.locator('#contact-mail-link').click();
    await expect(page.locator('#contact-mail-link')).toHaveAttribute('href', 'mailto:ptzhao@hotmail.com');
    await page.locator('#form-name').fill('PT Test');
    await page.locator('#form-email').fill('test@example.com');
    await page.locator('#form-text').fill('Next.js 迁移检查');
    await page.locator('#contact-mail-link').click();
    const href = decodeURIComponent((await page.locator('#contact-mail-link').getAttribute('href'))!);
    expect(href).toContain('subject=Blog Contact');
    expect(href).toContain('PT Test');
    expect(href).toContain('test@example.com');
    expect(href).toContain('Next.js 迁移检查');
  });
}

test('mobile menu, theme and language preserve the current page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/blogs/');
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await expect(page.locator('.menu-overlay')).toHaveClass(/is-open/);
  await expect(page.locator('body')).toHaveClass(/menu-is-open/);
  await page.locator('.menu-overlay .js-theme-switch').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'day');
  await page.locator('.menu-overlay .js-lang-switch').click();
  await expect(page).toHaveURL(/\/zh-cn\/blogs\/$/);
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.locator('.mobile-nav a[href="/zh-cn/categories/"]').click();
  await expect(page.locator('h1.hero__title')).toHaveText('Categories');
  await expect(page.locator('.article').first()).toBeVisible();
});

test('images zoom and close, and missing pages lead home', async ({ page }) => {
  await page.goto('/2021/10/09/二叉树基础-三-线段树-Segment-Tree/');
  const image = page.locator('.post__content img[src="/images/posts/segmenttree1.png"]');
  const formulas = page.locator('.post__content include');
  const formulaCount = await formulas.count();
  expect(formulaCount).toBeGreaterThan(0);
  await expect(page.locator('.post__content include > math')).toHaveCount(formulaCount);
  await expect(image).toBeVisible();
  await image.click();
  await expect(page.locator('.zoom-img-wrap')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.zoom-img-wrap')).toHaveCount(0);
  await page.goto('/zh-cn/2021/10/09/二叉树基础-三-线段树-Segment-Tree/');
  const chineseFormulaCount = await page.locator('.post__content include').count();
  expect(chineseFormulaCount).toBeGreaterThan(0);
  await expect(page.locator('.post__content include > math')).toHaveCount(chineseFormulaCount);
  const response = await page.goto('/a-page-that-does-not-exist/');
  expect(response!.status()).toBe(404);
  await expect(page.locator('.hero__title')).toHaveText('Page not found');
  await page.locator('#homepage').click();
  await expect(page).toHaveURL('http://localhost:3100/');
});

test('language switch on a translated article retains the article URL', async ({ page }) => {
  await page.goto('/node.js/2024/12/19/Prisma-Filtering/#equality-filter');
  await page.locator('.nav-buttons .js-lang-switch').click();
  await expect(page).toHaveURL(/\/zh-cn\/node.js\/2024\/12\/19\/Prisma-Filtering\/#equality-filter$/);
  await expect(page.locator('.post__title')).toHaveText('Prisma：Filtering');
  await expect(page.locator('.post__content')).toContainText('等于过滤');
});

test('missing translations and localized 404 navigation follow the original URLs', async ({ page }) => {
  await page.goto('/zh-cn/2022/04/20/操作系统-一-操作系统的概念和功能/');
  await page.locator('.nav-buttons .js-lang-switch').click();
  await expect.poll(() => decodeURI(new URL(page.url()).pathname)).toBe('/2022/04/20/操作系统-一-操作系统的概念和功能/');
  await expect(page.locator('.hero__title')).toHaveText('Page not found');
  const response = await page.goto('/zh-cn/a-page-that-does-not-exist/');
  expect(response!.status()).toBe(404);
  await page.locator('#homepage').click();
  await expect(page).toHaveURL('http://localhost:3100/zh-cn/');
  await page.goto('/zh-cn');
  await page.locator('.nav-buttons .js-lang-switch').click();
  await expect(page).toHaveURL('http://localhost:3100/');
});
