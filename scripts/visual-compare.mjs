import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const original = process.env.REFERENCE_URL || 'http://localhost:3101';
const replica = process.env.REPLICA_URL || 'http://localhost:3100';
const output = '.artifacts/visual';
await fs.mkdir(output, { recursive: true });
await fs.mkdir('.artifacts/remote-cache', { recursive: true });
const browser = await chromium.launch();
const remoteRequests = new Map();
async function sharedAssets(route) {
  const url = route.request().url();
  if (/^http:\/\/(localhost|127\.0\.0\.1):/.test(url)) return route.continue();
  const key = crypto.createHash('sha256').update(url).digest('hex');
  if (!remoteRequests.has(key)) remoteRequests.set(key, (async () => {
    try {
      const headers = JSON.parse(await fs.readFile(`.artifacts/remote-cache/${key}.json`, 'utf8'));
      return { ...headers, body: await fs.readFile(`.artifacts/remote-cache/${key}.bin`) };
    } catch {}
    try {
      const response = await route.fetch({ timeout: 20000 });
      const body = await response.body();
      const publicHeaders = new Set(['content-type', 'cache-control', 'access-control-allow-origin', 'access-control-allow-credentials', 'cross-origin-resource-policy']);
      const headers = Object.fromEntries(Object.entries(response.headers()).filter(([name]) => publicHeaders.has(name)));
      const result = { status: response.status(), headers };
      await fs.writeFile(`.artifacts/remote-cache/${key}.json`, JSON.stringify(result));
      await fs.writeFile(`.artifacts/remote-cache/${key}.bin`, body);
      return { ...result, body };
    } catch {
      const result = { status: 502, headers: {} };
      await fs.writeFile(`.artifacts/remote-cache/${key}.json`, JSON.stringify(result));
      await fs.writeFile(`.artifacts/remote-cache/${key}.bin`, '');
      return { ...result, body: '' };
    }
  })());
  try { await route.fulfill(await remoteRequests.get(key)); } catch {}
}
const cases = [
  { name: 'home-desktop-night', route: '/', width: 1440, height: 1000, theme: 'night', full: true },
  { name: 'blog-desktop-night', route: '/blogs/', width: 1440, height: 1000, theme: 'night', full: true },
  { name: 'blog-desktop-day', route: '/blogs/', width: 1440, height: 1000, theme: 'day', full: true },
  { name: 'article-desktop-night', route: '/node.js/2024/12/19/Prisma-Filtering/', width: 1440, height: 1000, theme: 'night', scroll: 850 },
  { name: 'tags-desktop-day', route: '/tags/', width: 1440, height: 1000, theme: 'day', scroll: 850 },
  { name: 'archive-desktop-night', route: '/tags/prisma/', width: 1440, height: 1000, theme: 'night', full: true },
  { name: 'contact-desktop-day', route: '/contact/', width: 1440, height: 1000, theme: 'day', full: true },
  { name: 'not-found-desktop-night', route: '/404.html', width: 1440, height: 1000, theme: 'night', full: true },
  { name: 'home-mobile-night', route: '/zh-cn/', width: 390, height: 844, theme: 'night', full: true },
  { name: 'blog-mobile-night', route: '/zh-cn/blogs/', width: 390, height: 844, theme: 'night', scroll: 800 },
  { name: 'blog-mobile-day', route: '/blogs/', width: 390, height: 844, theme: 'day', scroll: 2000 },
  { name: 'article-mobile-day', route: '/zh-cn/node.js/2024/12/19/Prisma-Filtering/', width: 390, height: 844, theme: 'day', scroll: 850 },
  { name: 'categories-mobile-night', route: '/zh-cn/categories/', width: 390, height: 844, theme: 'night', scroll: 900 },
  { name: 'contact-mobile-night', route: '/zh-cn/contact/', width: 390, height: 844, theme: 'night', full: true },
  { name: 'blog-tablet-day', route: '/blogs/', width: 768, height: 1024, theme: 'day', scroll: 800 },
  { name: 'blog-small-mobile-night', route: '/blogs/', width: 320, height: 740, theme: 'night', scroll: 800 },
  { name: 'search-desktop-night', route: '/blogs/', width: 1440, height: 1000, theme: 'night', action: 'search' },
  { name: 'menu-mobile-day', route: '/blogs/', width: 390, height: 844, theme: 'day', action: 'menu' },
  { name: 'zoom-desktop-night', route: '/2021/10/09/二叉树基础-三-线段树-Segment-Tree/', width: 1440, height: 1000, theme: 'night', action: 'zoom' },
  { name: 'code-desktop-day', route: '/node.js/2024/12/19/Prisma-Filtering/', width: 1440, height: 1000, theme: 'day', action: 'code' },
  { name: 'math-desktop-day', route: '/2021/10/09/二叉树基础-三-线段树-Segment-Tree/', width: 1440, height: 1000, theme: 'day', action: 'math' },
  { name: 'math-mobile-night', route: '/zh-cn/2021/10/09/二叉树基础-三-线段树-Segment-Tree/', width: 390, height: 844, theme: 'night', action: 'math' },
];
let previousResults = [];
if (process.env.CASE_FILTER) try { previousResults = JSON.parse(await fs.readFile(path.join(output, 'report.json'), 'utf8')); } catch {}
const results = [];
async function capture(test, base, label) {
  const context = await browser.newContext({ viewport: { width: test.width, height: test.height }, deviceScaleFactor: 1, colorScheme: test.theme === 'day' ? 'light' : 'dark' });
  await context.addInitScript(theme => sessionStorage.setItem('theme', theme), test.theme);
  await context.route('**/*', sharedAssets);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + test.route, { waitUntil: 'load', timeout: 60000 });
  // Compare the fully loaded visual state, with identical third-party asset bytes.
  await page.evaluate(() => {
    for (const image of document.querySelectorAll('img[data-src]')) {
      image.src = image.dataset.src;
      image.classList.add('loaded');
    }
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.race([Promise.all([...document.images].map(image => image.decode().catch(() => {}))), new Promise(resolve => setTimeout(resolve, 22000))]);
  });
  await page.locator('body.is-in').waitFor();
  await page.waitForTimeout(800);
  if (test.action === 'search') {
    await page.locator('.nav-buttons .search-button').click();
    await page.locator('#js-search-input').fill('Prisma');
    await page.locator('#js-results-container .article').first().waitFor({ state: 'visible' });
  } else if (test.action === 'menu') {
    await page.locator('.nav__icon-menu').click();
  } else if (test.action === 'zoom') {
    const image = page.locator('.post__content img[src="/images/posts/segmenttree1.png"]');
    await image.scrollIntoViewIfNeeded();
    await image.click();
    await page.locator('.zoom-img-wrap').waitFor({ state: 'visible' });
  } else if (test.action === 'code') {
    await page.locator('.post__content pre').first().scrollIntoViewIfNeeded();
    await page.locator('.line-numbers-rows').first().waitFor({ state: 'attached' });
  } else if (test.action === 'math') {
    await page.locator('.post__content include > math').first().waitFor({ state: 'visible' });
    await page.locator('.post__content include').first().scrollIntoViewIfNeeded();
  }
  if (test.action) await page.waitForTimeout(700);
  if (test.scroll) { await page.evaluate(y => window.scrollTo(0, y), test.scroll); await page.waitForTimeout(350); }
  await page.evaluate(async () => {
    await Promise.all(document.getAnimations().filter(a => a.effect?.getTiming().iterations !== Infinity).map(a => a.finished.catch(() => {})));
  });
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, height: document.documentElement.scrollHeight, hue: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() }));
  const file = path.join(output, `${test.name}-${label}.png`);
  const buffer = await page.screenshot({ path: file, fullPage: !!test.full, animations: 'disabled' });
  await context.close();
  return { buffer, dimensions, errors };
}
try {
  // Sequential pairs keep network/resource conditions comparable.
  for (const test of cases.filter(c => !process.env.CASE_FILTER || c.name.includes(process.env.CASE_FILTER))) {
    const a = await capture(test, original, 'original');
    const b = await capture(test, replica, 'next');
    const old = PNG.sync.read(a.buffer), next = PNG.sync.read(b.buffer);
    let pixels = -1, ratio = 1, exactPixels = -1;
    if (old.width === next.width && old.height === next.height) {
      const diff = new PNG({ width: old.width, height: old.height });
      pixels = pixelmatch(old.data, next.data, diff.data, old.width, old.height, { threshold: 0.1 });
      exactPixels = 0;
      for (let i = 0; i < old.data.length; i += 4) {
        if (old.data[i] !== next.data[i] || old.data[i + 1] !== next.data[i + 1] || old.data[i + 2] !== next.data[i + 2] || old.data[i + 3] !== next.data[i + 3]) exactPixels++;
      }
      ratio = pixels / (old.width * old.height);
      if (pixels) await fs.writeFile(path.join(output, test.name + '-diff.png'), PNG.sync.write(diff));
    }
    const result = { name: test.name, route: test.route, pixels, exactPixels, ratio, original: a.dimensions, next: b.dimensions, errors: b.errors };
    results.push(result);
    console.log(JSON.stringify(result));
    const updated = [...previousResults.filter(p => !results.some(r => r.name === p.name)), ...results];
    await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(updated, null, 2));
  }
} finally { await browser.close(); }
// Raw RGBA deltas remain in the report; the visual gate ignores browser edge antialiasing.
if (results.some(r => r.pixels !== 0 || r.errors.length)) process.exitCode = 1;
