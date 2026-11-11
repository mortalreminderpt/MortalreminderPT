# 单篇源稿与自动翻译

正式网站继续使用 Next.js 静态导出和 GitHub Pages。翻译在发布前生成，译文保存进 Git 仓库；访问网站或切换语言只读取已经生成的页面。

## 日常写作

中文文章放入 `content/posts/zh-cn/`，英文文章放入 `content/posts/en/`。**同一篇文章只创建一份源稿**，另一种语言会自动生成。已有 127 篇文章以中文版为源稿，原有 64 份人工英文译文已经作为保存的翻译结果保留，缺失的 63 份英文译文已补齐。

例如新增 `content/posts/zh-cn/2026-11-11-network-notes.md`：

```markdown
---
title: 计算机网络笔记
description: 记录本次学习的重点。
date: 2026-11-11 12:00:00 +1100
permalink: /notes/2026/11/11/network-notes/
tags: [计算机网络]
category: [计算机网络]
---

1. 目录
{:toc}

## 第一节

在这里写正文。
```

推送到 `gh-pages` 后，Actions 会翻译变化的内容、保存结果、构建并部署。对应英文地址为 `/notes/2026/11/11/network-notes/`，中文地址为 `/zh-cn/notes/2026/11/11/network-notes/`。从英文源稿开始的流程相同。

已有文章继续使用原有 URL。标题、图片、日期、精选状态和分类只需在源稿中维护。`README.md` 仍是 GitHub 个人主页；网站首页源稿为 `content/home.md`，首页与样式指南也有保存的中文译文。

## 标签与分类

`计算机网络`、`Computer Network`、`Computer Networking` 和 `computer-networking` 都能指向同一个标识。前台根据语言分别显示“计算机网络”和“Computer Networking”，只生成一组成员关系。

同样统一了 Algorithm/Algorithms/算法、Data Structure/Data Structures/数据结构等历史名称。旧地址继续跳转到统一地址，例如：

```text
/zh-cn/tags/计算机网络/ → /zh-cn/tags/computer-networking/
/tags/algorithms/ → /tags/algorithm/
```

“计算机网络”和 Computer Vision 是不同概念；Computer Vision 对应“计算机视觉”，不会被合并。

新增标签或分类时，在源稿中写一次名称即可。构建任务会为未知名称生成另一种语言的标签并保存到 `content/i18n/taxonomy.json`。也可以在该文件中修订展示名称或补充别名，标识 `id` 应保持稳定。标签和分类可以复用已有名称的翻译。

## 保存与更新规则

- `content/i18n/posts.json` 保存文章标识、源稿路径、两种语言 URL 和历史排版快照引用。
- `content/translations/en/`、`content/translations/zh-cn/` 保存译文 Markdown 和源内容摘要。译文文件是生成结果，不是需要重复维护的第二篇文章。
- `content/translations/fragments/` 保存已翻译片段。源稿只修改一个段落时，其他片段继续复用。
- 已有有效结果时，构建无需 API Key，也不会发送翻译请求；修改日期、图片或已有标签别名不会重译正文。
- 修改标题、简介或正文后，变化的片段会翻译并替换对应译文，结果再次提交到仓库。成功完成的页面和片段会保留，失败后可以继续处理剩余内容。
- 如需人工润色，可以直接修改保存的译文 Markdown。源稿未变化时会保留这些修订；源稿变化后会重新生成相应译文。标签、日期等公共元数据仍以源稿为准。

代码块、行内代码、数学公式、链接目标、HTML 标签属性和模板占位符在发送到模型前被保护，返回后还会检查结构。中文日期、阅读时间、菜单、搜索提示、订阅、404、分类数量、RSS、页面 `lang` 和 `hreflang` 都按页面语言生成。

## API Key 的位置

GitHub 仓库 Actions Secret 名称为 `DEEPSEEK_API_KEY`。它只传给翻译步骤和发布产物检查步骤，Next.js 构建本身不接收该 Secret。模型默认使用 DeepSeek 的 `deepseek-flash`，按官方兼容接口调用；可通过构建环境的 `DEEPSEEK_MODEL` 选择其他支持的模型。

Key 不保存在文章、译文、前端环境变量、Git 提交或静态部署文件中。浏览器没有翻译 API 客户端。发布前还会用真实 Secret 检查整个 `out/`，发现 Key 就阻止部署；请求失败只记录状态码，不打印可能回显凭据的响应内容。

本地需要生成新译文时，可以只为翻译进程临时提供环境变量，不把 Key 写入文件：

```bash
read -rs DEEPSEEK_API_KEY
export DEEPSEEK_API_KEY
npm run translate
unset DEEPSEEK_API_KEY
npm run build
```

只有检查或预览已有译文时，无需 Key：

```bash
npm run translate:check
npm run build
npm run preview
```

## 验证

```bash
npm run test:i18n
npm run test:authoring
npm run build
npm run typecheck
npm run test:content
npm run test:secrets
npm test
```

内容检查覆盖全部导出页面和双向语言链接。独立副本中的写作测试覆盖两种源语言、新标签/分类、缓存复用、段落更新、元数据变更、搜索、翻页、页脚及删除源稿。浏览器测试检查旧标签地址、语言切换与锚点、中文页面文案、以前缺失的英文文章，以及访问时没有翻译 API 请求。

接口参考：[DeepSeek 调用说明](https://api-docs.deepseek.com/)、[JSON Output](https://api-docs.deepseek.com/guides/json_mode/)。
