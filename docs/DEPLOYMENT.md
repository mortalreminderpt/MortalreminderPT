# 正式部署与旧版归档

迁移日期：2026-11-07（Australia/Melbourne）。

- 正式地址：<https://ptzhao.com>。
- 仓库：<https://github.com/mortalreminderpt/MortalreminderPT>。
- 活跃分支：`gh-pages`，使用 Next.js 静态导出，GitHub Actions 构建后部署到既有 GitHub Pages。
- 不需要常驻 Node.js 服务；域名、原有页面地址及 GitHub 个人主页 README 保留。
- 开发与文章编辑说明：[DEVELOPMENT.md](../DEVELOPMENT.md)。

## 旧站归档

旧版 Jekyll 的最后一个提交为 `6bf3cee258799cfe83a9e24a5c8cd6643f72aa31`。

- [归档分支 archive/jekyll-2026-11-07](https://github.com/mortalreminderpt/MortalreminderPT/tree/archive/jekyll-2026-11-07)。
- [归档标签 jekyll-archive-2026-11-07](https://github.com/mortalreminderpt/MortalreminderPT/tree/jekyll-archive-2026-11-07)。
- 本地另存完整 Git 历史 bundle、源码 tar.gz 和 SHA-256 校验清单。

归档包含原有 Markdown、主题、配置、工作流和完整 `_site` 静态站。活跃分支保留全部历史，迁移不重写旧提交。整个仓库保持可维护，以便个人主页及新版继续部署。

## 发布与核验

```bash
npm ci
npm run build
npm run typecheck
npm run test:content
npm test
git push origin gh-pages
```

查看仓库 Actions 中的 `Deploy Next.js to GitHub Pages`，确认 build 和 deploy 均成功。正式工作流会固定 `SITE_URL=https://ptzhao.com`；`out/deployment.json` 记录构建提交，访问 <https://ptzhao.com/deployment.json> 可核对实际发布版本。

## 回滚

如果需要恢复旧站，先提交或保存本地修改，在 `gh-pages` 分支撤销 Next.js 切换提交并推送：

```bash
git switch gh-pages
git pull --ff-only origin gh-pages
git log --oneline --grep='Deploy Next.js website and archive original Jekyll site'
git revert <上一步找到的切换提交>
git push origin gh-pages
```

该操作恢复旧版源码、`_site` 和旧版部署工作流，由同一个 GitHub Pages 自动重新发布。回滚保留后续历史，不需要强制推送。若之后已有其他变更，先检查并解决 revert 冲突。归档分支和标签始终保留原始版本。
