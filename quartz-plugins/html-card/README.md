# HTML Card — Quartz v5 pageType 插件

把 `content/` 下的**原生 HTML 文件**（例如由 vault 工具生成的知识卡）渲染成
**带完整 Quartz 外壳的正式页面**：侧边栏、搜索、暗色模式、面包屑、sitemap、RSS、
全文检索，并支持 SPA 跳转下的卡片交互脚本。

## 为什么需要它

1. Quartz 只会把 `.md` 解析成页面（`quartz/build.ts` 里的
   `filter(fp => fp.endsWith(".md"))`），其余文件交给 `Assets` 兜底复制。
2. `Assets` 用 `slugifyFilePath()` 计算目标路径，而 v5 的实现会把 `.html`
   当作“页面扩展名”剥掉：
   `const finalExt = excludeExt || [".md", ".html", undefined].includes(ext) ? "" : ext`
   → 产物变成**没有后缀**的 `public/10-交易/知识卡/滑点与穿仓-知识卡`，
   既不会被当成 `text/html` 渲染，也不会进入导航／搜索／sitemap。
3. 本插件沿用官方 `canvas-page` 的模式：声明 `fileExtensions: [".html"]`
   （让 `Assets` 不再复制这些文件）+ 用 `generate()` 把每个 `.html` 变成**虚拟页**。

## 工作方式

| 环节             | 行为                                                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fileExtensions` | `[".html"]`，`Assets` 会把这些扩展名排除在静态复制之外                                                                                                    |
| `generate()`     | 每个 `.html` 产出一个虚拟页；slug 用 `slugifyFilePath()`，与 `ctx.allSlugs` 一致，因此 `[[滑点与穿仓-知识卡]]` 之类链接能正确命中                         |
| 标题             | 取 `<title>`；缺失时回退文件名（`titleFrom: filename` 可强制用文件名）                                                                                    |
| 样式             | 卡片自身的 `<style>` 会被加上作用域前缀（默认 `.html-card`），`:root`/`html`/`body` 映射到作用域容器本身，避免污染站点主题与暗色模式                      |
| 脚本             | 卡片的 `<script>` 被改写成 `<script type="text/plain" data-html-card-script>` 惰性载体；由 `afterDOMLoaded` 脚本在每次 `nav`（首屏 + SPA 跳转）后重放一次 |
| 检索             | 从卡片 HTML 提取纯文本放入 `data.text`，`contentIndex.json` 因此可全文检索                                                                                |
| 布局             | `layout: "html-card"`，在 `quartz.config.yaml` 的 `layout.byPageType` 中定义                                                                              |

## 安装

插件以**本地 npm 依赖**方式接入（`package.json`）：

```json
"@liaozesheng/quartz-plugin-html-card": "file:quartz-plugins/html-card"
```

在 `quartz.config.yaml` 中引用包名：

```yaml
- source: "@liaozesheng/quartz-plugin-html-card"
  enabled: true
  order: 95
  options:
    pattern: "\\.html$"
    scopeClass: html-card
    titleFrom: title
```

> ⚠️ 不要写成 `source: "./quartz-plugins/html-card"`。loader 对本地路径会用
> `fs.symlinkSync(..., "dir")` 建立符号链接，而 Windows 在未开启开发者模式时
> 必然 `EPERM: operation not permitted, symlink`，插件会被**静默跳过**
> （日志里只有 `⚠ Could not load plugin ... Skipping.`）。
> 走 npm 包名分支（`parsePluginSource` 判定为 `npmPackage`）则会跳过链接安装，
> Windows / Linux / CI 行为一致。注意包名必须是 **scoped**（`@scope/name`），
> 否则 `parsePluginSource` 会把它当成 `owner/repo` 的 GitHub 简写。

新增卡片无需改任何配置：把 `.html` 放进 `content/` 任意子目录即可
（`sync-vault.sh` 同步来的卡片会自动生效）。

## 配置项

| 选项             | 默认值        | 说明                                                         |
| ---------------- | ------------- | ------------------------------------------------------------ |
| `pattern`        | `"\\.html?$"` | 只接管匹配该正则的文件（相对 `content`）                     |
| `fileExtensions` | `[".html"]`   | 声明给 Quartz，用于阻止 `Assets` 复制                        |
| `ignoreDirs`     | `[]`          | 额外跳过的目录名（会与 `configuration.ignorePatterns` 合并） |
| `scopeClass`     | `"html-card"` | CSS 作用域容器类名                                           |
| `layout`         | `"html-card"` | 对应 `layout.byPageType` 的键                                |
| `priority`       | `60`          | 匹配优先级（`match()` 不会命中真实 md，影响很小）            |
| `titleFrom`      | `"title"`     | `title` 用 `<title>`；`filename` 用文件名                    |
| `runScripts`     | `true`        | 是否重放卡片内联脚本                                         |
| `frontmatter`    | `{}`          | 追加到虚拟页 frontmatter，例如 `{ tags: ["知识卡"] }`        |

## 已知边界

- **CSS 支持范围**：作用域化基于括号配平的解析器，支持嵌套 `@media`/`@supports`/`@layer`，
  `@keyframes`/`@font-face`/`@import` 原样保留。若卡片样式使用了 `@scope`、
  CSS Modules 或依赖非作用域的全局选择器，需要自行调整。
- **脚本重放**：卡片脚本由 `document.createElement("script")` 插入执行，
  因此 `document.currentScript` 为 `null`；脚本人为依赖它时需改写。
  脚本若注册 document 级监听器，SPA 换页后不会被自动清理（Quartz 提供 `addCleanup`）。
- **面包屑**：`@quartz-community/breadcrumbs` 依赖 md 内容的 trie，虚拟页目前不会渲染它
  （`condition: not-index` 本身是满足的）。
- **`layout.byPageType.<key>.exclude` 的坑**：名字必须是**完整 source 串**，
  例如 `"@quartz-community/article-title"`。loader 的 `extractPluginName()`
  对 npm 包不做去 scope 处理，写短名不生效（仓库中 `folder`/`tag` 里的
  `exclude: [reader-mode]` 同理是空操作）。

## 自查方式

```bash
node quartz/bootstrap-cli.mjs build -d content -v
```

关注日志中：

```
PageTypes: CanvasPage, ContentPage, FolderPage, TagPage, html-card, 404
[html-card] 10-交易/知识卡/滑点与穿仓-知识卡.html -> 10-交易/知识卡/滑点与穿仓-知识卡 (滑点与穿仓 · 知识卡)
```

产物应为 `public/10-交易/知识卡/滑点与穿仓-知识卡.html`，
且**不再出现**无扩展名的同名文件。
