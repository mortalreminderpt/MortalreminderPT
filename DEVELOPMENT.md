# MortalreminderPT — Next.js

将 [MortalreminderPT](https://github.com/mortalreminderpt/MortalreminderPT) 的个人主页和中英文博客迁移到 Next.js，保留原站的视觉设计、文章内容、页面路径及交互。

对照版本：[`6bf3cee258799cfe83a9e24a5c8cd6643f72aa31`](https://github.com/mortalreminderpt/MortalreminderPT/commit/6bf3cee258799cfe83a9e24a5c8cd6643f72aa31)。原有 **301 个页面、191 篇文章（英文 64、中文 127）**均已迁入。

正式网站：[ptzhao.com](https://ptzhao.com)。验证结果见 [VALIDATION.md](docs/VALIDATION.md)，部署与旧版恢复见 [DEPLOYMENT.md](docs/DEPLOYMENT.md)。根目录 `README.md` 保留 GitHub 个人主页内容。

## 运行

需要 Node.js 22 和 npm。

```bash
npm ci
npm run dev
```

生产构建和静态预览：

```bash
npm run build
npm run preview
```

预览地址为 `http://localhost:3100`。构建结果在 `out/`，可直接部署到 GitHub Pages 或其他静态服务器，无需常驻 Node.js 服务。

## 页面与交互

- 个人首页、博客列表、精选文章、文章正文、标签与分类页、归档页、联系页、样式示例及 404 页。
- 保留 `/zh-cn/` 双语前缀、原文章 URL 和分页 URL。
- 保留原有 SCSS、字体、Logo、图片、响应式断点和配色。
- 搜索弹层、移动菜单、语言切换、深浅主题及主题记忆、Bing 图片取色、文章加载更多、代码高亮与行号、图片放大、返回顶部。
- 联系表单校验后使用原有 `mailto:` 地址；订阅入口沿用原站 Mailchimp 配置。

页面通过 Next.js 生成并由 React 渲染；搜索、菜单、主题、分页和表单均为 React 交互。Prism、ColorThief 和 LazyLoad 沿用原站的独立工具库。图片放大使用原有 MIT 开源实现的原生 DOM 移植版。

## 编辑内容

`content/posts/en/` 与 `content/posts/zh-cn/` 保存原始 Markdown，`content/home.md` 是首页内容。修改后运行 `npm run content` 更新内容数据，或直接执行 `npm run build`。

旧文章的原始 Kramdown/TeX HTML 保存在 `content/rendered/`，通过源码摘要判断是否可复用，以保留现有排版。修改或新增的 Markdown 由 JavaScript 管线处理，支持代码块、目录、属性及数学公式。

新增文章文件名采用 `YYYY-MM-DD-title.md`，例如：

```yaml
---
layout: post
title: My new post
description: A short introduction.
date: 2026-10-29 12:00:00 +1100
permalink: /notes/2026/10/29/my-new-post/
image: /images/posts/my-cover.jpg
tags: [Next.js]
category: [Notes]
featured: false
---

1. Table of Contents
{:toc}

## First section

Article content.
```

新增文章会更新列表、分页、分类、标签、相关推荐、搜索与页脚。中文文章放入 `zh-cn` 目录，地址自动保留 `/zh-cn/` 前缀。双语文章使用相同的后续路径即可对应切换。

## 项目结构

```text
app/                 Next.js 路由及页面元数据
components/          页面布局和 React 交互
lib/                 内容读取、数据类型与图片放大
styles/              原始 SCSS、图标字体样式及少量交互样式
content/posts/       原始文章 Markdown
content/rendered/    原文章的渲染缓存和页面数据
public/              原站图片、字体、样式和独立工具库
scripts/             内容构建、静态导出检查和视觉验证
tests/               浏览器交互测试
docs/                验证说明
```

## 验证与部署

```bash
npm run typecheck
npm run test:content
npm run test:authoring
PLAYWRIGHT_BROWSERS_PATH=.sites-runtime/browsers npx playwright install chromium
npm test
```

视觉对照脚本为 `scripts/visual-compare.mjs`，使用相同的外部资源缓存对比原站与 Next.js 的截图。需先分别启动原站和本项目的静态预览；默认端口为 3101 与 3100，也可设置 `REFERENCE_URL`、`REPLICA_URL`。

推送到 `gh-pages` 后，`.github/workflows/static.yml` 自动构建、检查并发布 `out/` 到 GitHub Pages；也支持手动触发。canonical、RSS 和 sitemap 默认使用 `https://ptzhao.com`，可通过 `SITE_URL` 覆盖。`out/CNAME` 保留 `ptzhao.com`。

原站的每日 Bing 背景、头像、GitHub 统计卡片及部分文章图片仍使用原有外部地址。原主题作者署名、图标和第三方工具的许可证信息均予以保留。
