import { test, expect } from '@playwright/test';
import { load } from 'cheerio';
import fs from 'node:fs';

test('historic tag aliases share a translated archive and language switching preserves it', async ({ page }) => {
  await page.goto('/tags/algorithms/');
  await expect(page).toHaveURL('http://localhost:3100/tags/algorithm/');
  await expect(page.locator('.archive-title')).toHaveText('Algorithms');
  const englishCount = await page.locator('main .row.grid > .article').count();
  await page.locator('.nav-buttons .js-lang-switch').click();
  await expect(page).toHaveURL('http://localhost:3100/zh-cn/tags/algorithm/');
  await expect(page.locator('.archive-title')).toHaveText('算法');
  await expect(page.locator('main .row.grid > .article')).toHaveCount(englishCount);
  await page.goto('/zh-cn/tags/计算机网络/');
  await expect(page).toHaveURL('http://localhost:3100/zh-cn/tags/computer-networking/');
  await expect(page.locator('.archive-title')).toHaveText('计算机网络');
  await page.locator('.nav-buttons .js-lang-switch').click();
  await expect(page.locator('.archive-title')).toHaveText('Computer Networking');
});

test('category identifiers, counts and localized labels agree in both languages', async ({ page }) => {
  await page.goto('/zh-cn/categories/computer-network/');
  await expect(page).toHaveURL('http://localhost:3100/zh-cn/categories/computer-networking/');
  await expect(page.locator('.archive-title')).toHaveText('计算机网络');
  const count = await page.locator('main .row.grid > .article').count();
  await page.locator('.nav-buttons .js-lang-switch').click();
  await expect(page.locator('.archive-title')).toHaveText('Computer Networking');
  await expect(page.locator('main .row.grid > .article')).toHaveCount(count);
  await page.goto('/zh-cn/tags/');
  await expect(page.locator('main .article__title a[href="/zh-cn/tags/algorithm/"]')).toHaveCount(1);
  await expect(page.locator('main .article__title a[href="/zh-cn/tags/data-structures/"]')).toHaveCount(1);
});

test('Chinese navigation, dates, reading time, footer and exported language metadata are localized', async ({ page, request }) => {
  const response = await request.get('/zh-cn/blogs/');
  const document = load(await response.text());
  expect(document('html').attr('lang')).toBe('zh-CN');
  expect(document('link[rel="alternate"][hreflang="en"]').attr('href')).toBe('https://ptzhao.com/blogs/');
  expect(document('link[rel="alternate"][hreflang="zh-CN"]').attr('href')).toBe('https://ptzhao.com/zh-cn/blogs/');
  await page.goto('/zh-cn/blogs/');
  await expect(page.locator('.top-nav .nav__link').first()).toHaveText('首页');
  await expect(page.locator('main .article__date').first()).toHaveText(/\d{4}年\d{1,2}月\d{1,2}日/);
  await expect(page.locator('main .article__minutes').first()).toContainText(/阅读时间 \d+ 分钟/);
  await expect(page.locator('.subscribe-email')).toHaveAttribute('placeholder', '邮箱地址');
  await expect(page.locator('.subscribe-button')).toHaveText('订阅');
  await expect(page.locator('.footer .copyright a').first()).toHaveAttribute('href', '/zh-cn/');
  await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]').first()).toHaveAttribute('href', '/zh-cn/feed.xml');
});

test('homepage language switching maps translated section anchors', async ({ page }) => {
  await page.goto('/#about-me');
  await expect(page.locator('#about-me')).toBeAttached();
  await page.locator('.nav-buttons .js-lang-switch').click();
  await expect(page).toHaveURL(/\/zh-cn\/#.+$/);
  const id=decodeURIComponent(new URL(page.url()).hash.slice(1));
  await expect(page.locator(`[id="${id}"]`)).toBeAttached();
  await page.locator('.nav-buttons .js-lang-switch').click();
  await expect(page).toHaveURL('http://localhost:3100/#about-me');
});

test('articles without a cover remain accessible through their title', async ({ page }) => {
  const routes=JSON.parse(fs.readFileSync('.generated/routes.json','utf8'));
  const article=routes.filter((route:{kind:string;lang:string})=>route.kind==='post'&&route.lang==='en').map((route:{file:string})=>JSON.parse(fs.readFileSync('.generated/pages/'+route.file,'utf8'))).find((post:{image?:string})=>!post.image);
  test.skip(!article,'All current articles have a cover.');
  await page.goto('/blogs/');
  await page.locator('.nav-buttons .search-button').click();
  await page.locator('#js-search-input').fill(article.postTitle);
  await page.locator(`#js-results-container .article__title a[href="${encodeURI(article.route)}"]`).click();
  await expect(page.locator('.post__title')).toHaveText(article.postTitle);
});

test('saved translations render immediately and visitors never call a translation API', async ({ page, request }) => {
  const apiRequests: string[] = [];
  page.on('request', request => { if (/api\.deepseek\.com|api\.openai\.com/.test(request.url())) apiRequests.push(request.url()); });
  for (const route of ['/2022/04/20/操作系统-一-操作系统的概念和功能/', '/zh-cn/2022/04/20/操作系统-一-操作系统的概念和功能/']) {
    const response = await request.get(route);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('post__content');
    await page.goto(route);
    await expect(page.locator('.post__content')).toBeVisible();
    await expect(page.locator('body')).toHaveClass(/is-in/);
  }
  await page.reload();
  await expect(page.locator('body')).toHaveClass(/is-in/);
  expect(apiRequests).toEqual([]);
});
