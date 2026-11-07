import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const fixture = await fs.mkdtemp(path.join(os.tmpdir(), 'mortalreminderpt-authoring-'));
const digest = text => crypto.createHash('sha256').update(text).digest('hex');
const source = 'content/posts/en/2024-12-19-Prisma：Filtering.md';
const before = await fs.readFile(source, 'utf8');
try {
  await fs.cp('content', path.join(fixture, 'content'), { recursive: true });
  await fs.mkdir(path.join(fixture, 'public/css'), { recursive: true });
  await fs.appendFile(path.join(fixture, source), '\n\n## Authoring pipeline check\n\nEdited Markdown is compiled.\n');
  await fs.writeFile(path.join(fixture, 'content/posts/en/2026-10-29-authoring-check.md'), `---
layout: post
title: Authoring Check
description: A new post exercises routing, pagination, taxonomy and search.
date: 2026-10-29 12:00:00 +1100
permalink: /migration/2026/10/29/authoring-check/
image: /images/logos/avatar128.png
tags: [Next.js, 迁移测试]
category: [Migration]
featured: true
---

1. Table of Contents
{:toc}

## A new section

New **Markdown** content with $x^2 + y^2$ and a [link](https://ptzhao.com/).

\`\`\`typescript
const migration = true;
\`\`\`
`);
  const output = execFileSync(process.execPath, [path.join(root, 'scripts/build-content.mjs')], { cwd: fixture, encoding: 'utf8', timeout: 60000 });
  const routes = JSON.parse(await fs.readFile(path.join(fixture, '.generated/routes.json'), 'utf8'));
  const get = async route => {
    const entry = routes.find(r => r.route === route);
    assert.ok(entry, 'Missing authored route: ' + route);
    return JSON.parse(await fs.readFile(path.join(fixture, '.generated/pages', entry.file), 'utf8'));
  };
  const post = await get('/migration/2026/10/29/authoring-check/');
  assert.match(post.contentHtml, /<strong>Markdown<\/strong>/);
  assert.match(post.contentHtml, /katex/);
  assert.match(post.contentHtml, /id="markdown-toc"/);
  const blog = await get('/blogs/');
  assert.equal(blog.cards[0].title, 'Authoring Check');
  assert.equal(blog.totalPages, 9);
  assert.ok(blog.featuredCards.some(c => c.title === 'Authoring Check'));
  assert.equal((await get('/blogs/9/')).cards.length, 1);
  assert.equal((await get('/tags/迁移测试/')).cards[0].title, 'Authoring Check');
  assert.equal((await get('/categories/migration/')).cards[0].title, 'Authoring Check');
  assert.ok((await get('/tags/')).cards.some(c => c.title === '迁移测试'));
  const search = JSON.parse(await fs.readFile(path.join(fixture, 'public/data/search-en.json'), 'utf8'));
  assert.equal(search[0].title, 'Authoring Check');
  const shared = JSON.parse(await fs.readFile(path.join(fixture, '.generated/shared-en.json'), 'utf8'));
  assert.match(shared.footerWidgetsHtml, /Authoring Check/);
  const edited = await get('/node.js/2024/12/19/Prisma-Filtering/');
  assert.match(edited.contentHtml, /Edited Markdown is compiled/);
  assert.equal(digest(await fs.readFile(path.join(root, source), 'utf8')), digest(before));
  const report = { passed: true, pages: routes.length, articles: routes.filter(r => r.kind === 'post').length, checks: ['new Markdown', 'edited Markdown', 'code fences', 'math', 'table of contents', 'article route', 'pagination', 'featured posts', 'Unicode tags', 'categories', 'search', 'footer', 'original source unchanged'] };
  await fs.mkdir('.artifacts', { recursive: true });
  await fs.writeFile('.artifacts/authoring-verification.json', JSON.stringify(report, null, 2));
  console.log(output.trim());
  console.log(JSON.stringify(report, null, 2));
} finally {
  // Only this exact task-owned temporary fixture is removed.
  await fs.rm(fixture, { recursive: true });
}
