# 正式部署与旧版归档

迁移日期：2026-11-07（Australia/Melbourne）。

- 正式地址：<https://ptzhao.com>。
- 仓库：<https://github.com/mortalreminderpt/MortalreminderPT>。
- 活跃分支：`gh-pages`，使用 Next.js 静态导出，GitHub Actions 构建后部署到既有 GitHub Pages。
- 不需要常驻 Node.js 服务；域名、原有页面地址及 GitHub 个人主页 README 保留。
- 开发与文章编辑说明：[DEVELOPMENT.md](../DEVELOPMENT.md)。
- 单篇源稿、标签统一和保存翻译的规则：[INTERNATIONALIZATION.md](INTERNATIONALIZATION.md)。发布任务先使用 Actions Secret 翻译变化的内容并提交保存结果，再构建静态页面；访客访问不触发翻译请求。

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
npm run test:i18n
npm run test:authoring
npm run test:secrets
npm test
git push origin gh-pages
```

查看仓库 Actions 中的 `Deploy Next.js to GitHub Pages`，确认 build 和 deploy 均成功。正式工作流会固定 `SITE_URL=https://ptzhao.com`；`out/deployment.json` 记录构建提交，访问 <https://ptzhao.com/deployment.json> 可核对实际发布版本。

## 回滚

如果需要恢复归档当天的完整旧站，先提交或保存本地修改，在 `gh-pages` 分支撤销归档标签之后的变更并推送：

```bash
git switch gh-pages
git pull --ff-only origin gh-pages
git revert --no-commit jekyll-archive-2026-11-07..HEAD
git commit -m 'Restore archived Jekyll website'
git push origin gh-pages
```

该操作恢复旧版源码、`_site` 和旧版部署工作流，由同一个 GitHub Pages 自动重新发布。归档之后的提交仍保留在历史中，不需要强制推送。若之后存在合并提交或 revert 冲突，需要先检查并处理。归档分支和标签始终保留原始版本。
