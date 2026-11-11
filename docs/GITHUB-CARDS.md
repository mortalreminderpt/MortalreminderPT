# GitHub 统计卡片

GitHub 个人主页和 [ptzhao.com](https://ptzhao.com) 的两张统计图使用仓库中的 SVG 文件。访客打开页面时直接读取图片，无需调用原先经常返回 503 的公共生成接口。

## 更新与故障回退

- `.github/workflows/static.yml` 在推送、手动运行或每日 UTC 18:37 时更新图片，并发布网站。GitHub 的定时任务可能延迟。
- Actions 从 GitHub 读取公开统计，分别生成英文、中文的统计和语言分布，共四张图。
- 图片先生成到独立临时目录，四张全部通过 SVG 结构、尺寸、错误内容和凭据检查后，才替换正式文件并提交。
- 任意一张生成失败，继续使用上一组完整有效的图片，保留原来的更新时间。失败响应、错误提示图或空文件不会覆盖正式图片。
- 如果连一组有效旧图都不存在，检查会阻止发布，避免发布破图页面。

因此，上游服务故障会延迟数据刷新，已有图片仍可显示。整个 GitHub 或网站本身无法访问时，图片也无法保证可用。

## 文件与维护

正式文件位于 `public/images/github/`：`github-stats.svg`、`top-languages.svg` 及各自的 `-zh-cn.svg` 版本。`status.json` 保存最后成功更新的时间、图片摘要和生成器版本。

根目录 `README.md` 使用仓库相对路径，供 GitHub 个人主页显示；网站使用 `/images/github/`。首页构建时根据语言选择对应图片。

生成器采用 [github-readme-stats-action](https://github.com/stats-organization/github-readme-stats-action)，固定 Action 提交为 `2c498845f71017821efaad14293ebc736156ef21`，核心版本为 `2.2.0`，并启用 `fail_on_error`。使用 Actions 自带的 `GITHUB_TOKEN` 读取公开数据，不需要额外提供 PAT；令牌不会进入图片或前端。

需要立即刷新时，在 [部署工作流](https://github.com/mortalreminderpt/MortalreminderPT/actions/workflows/static.yml) 点击 **Run workflow**。查看最后成功时间可打开 [status.json](https://ptzhao.com/images/github/status.json)。

本地验证：

```bash
npm run test:cards
npm run cards:check
npm test -- tests/github-cards.spec.ts
```

单元测试覆盖正常替换、单张错误、全部不可用、保留原图片和时间、首次缺图阻止发布。浏览器测试阻断原公共接口，检查两种语言下图片加载、主题切换与刷新。
