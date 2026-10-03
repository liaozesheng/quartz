// quartz-plugins/html-card/index.js
//
// Quartz v5 pageType 插件：把 content/ 下的**原生 HTML 文件**（例如由 vault 工具
// 生成的知识卡、报告页）渲染成带完整 Quartz 外壳的页面。
//
// 为什么需要它
// ------------
// Quartz 只会把 .md 解析成页面（quartz/build.ts 里 `filter(fp => fp.endsWith(".md"))`），
// 其余文件交给 Assets 兜底复制；而 Assets 用 slugifyFilePath() 计算目标路径，
// v5 的实现会把 .html 当作“页面扩展名”剥掉，于是产物变成没有后缀的文件，
// 既不会被当成 text/html 渲染，也不会进入 explorer／搜索／sitemap。
//
// 本插件的做法（与官方 canvas-page 同一模式）
// ------------------------------------------
// 1. `fileExtensions: [".html"]` —— Assets 会把这些扩展名排除在复制之外，
//    不再产生那个无后缀的重复文件。
// 2. `generate()` —— 每个 .html 产出**一个虚拟页**，slug 直接用 Quartz 的
//    slugifyFilePath()，与 ctx.allSlugs 中的条目一致，
//    因此 `[[滑点与穿仓-知识卡]]` 这类链接能正确解析到页面。
// 3. `body` 组件 —— 卡片自身的 <style> 被加上作用域前缀后注入页面，
//    卡片的 <script> 改写成 `type="text/plain"` 惰性载体，
//    再由 afterDOMLoaded 脚本在每次 `nav`（含 SPA 跳转）后重放——
//    因为 SPA 用 micromorph 替换 DOM 时，新插入的 <script> 不会执行。
// 4. `data.text` —— 供 content-index／搜索建立全文索引。

import fs from "node:fs"
import path from "node:path"
import { h } from "preact"
import { slugifyFilePath } from "@quartz-community/utils"

export const manifest = {
  name: "html-card",
  displayName: "HTML Card",
  description:
    "Render standalone HTML files under content/ as full Quartz pages (chrome, search, dark mode, SPA-safe inline scripts)",
  version: "1.0.0",
  category: "pageType",
  quartzVersion: "4.5.0",
}

const DEFAULTS = {
  /** 只接管匹配这个正则的文件（相对 content 目录） */
  pattern: "\\.html?$",
  /** 声明给 Quartz 的扩展名：这些文件不再被 Assets 当静态资源复制 */
  fileExtensions: [".html"],
  /** 额外跳过的目录名 */
  ignoreDirs: [],
  /** CSS 作用域容器类名（卡片样式会被加上这个前缀） */
  scopeClass: "html-card",
  /** 使用的 Quartz 布局键（对应 quartz.config.yaml 的 layout.byPageType） */
  layout: "html-card",
  /** 任意整数；因为 match() 不会命中真实 md，实际影响很小 */
  priority: 60,
  /** 页面标题来源：title（<title> 标签）| filename */
  titleFrom: "title",
  /** 是否重放卡片内的内联 <script> */
  runScripts: true,
  /** 合并进虚拟页 frontmatter 的额外字段，例如 { tags: ["知识卡"] } */
  frontmatter: {},
}

// ---------------------------------------------------------------------------
// CSS 作用域化：给每条选择器加上 `.scope` 前缀，避免卡片的 :root/body/*
// 规则污染 Quartz 主题（暗色模式、侧边栏等）。
// ---------------------------------------------------------------------------

const AT_RULE_KEEP =
  /^@(?:keyframes|-webkit-keyframes|-moz-keyframes|font-face|import|charset|namespace|page|property|counter-style|font-feature-values|viewport)\b/i
const AT_RULE_NEST = /^@(?:media|supports|layer|container|scope|document)\b/i

function readBlock(css, start) {
  let depth = 0
  let quote = null
  for (let i = start; i < css.length; i++) {
    const ch = css[i]
    if (quote) {
      if (ch === quote && css[i - 1] !== "\\") quote = null
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      continue
    }
    if (ch === "{") depth++
    else if (ch === "}") {
      depth--
      if (depth === 0) return { content: css.slice(start + 1, i), end: i + 1 }
    }
  }
  return { content: css.slice(start + 1), end: css.length }
}

function splitTopLevel(css) {
  const nodes = []
  let preludeStart = 0
  let i = 0
  while (i < css.length) {
    if (css[i] === "{") {
      const prelude = css.slice(preludeStart, i).trim()
      const block = readBlock(css, i)
      nodes.push({ prelude, body: block.content })
      i = block.end
      preludeStart = i
      continue
    }
    i++
  }
  const tail = css.slice(preludeStart).trim()
  if (tail) nodes.push({ prelude: tail, body: null })
  return nodes
}

function splitSelectorList(prelude) {
  const out = []
  let depth = 0
  let start = 0
  for (let i = 0; i < prelude.length; i++) {
    const ch = prelude[i]
    if (ch === "(" || ch === "[") depth++
    else if (ch === ")" || ch === "]") depth--
    else if (ch === "," && depth === 0) {
      out.push(prelude.slice(start, i))
      start = i + 1
    }
  }
  out.push(prelude.slice(start))
  return out
}

function scopeSelector(selector, scope) {
  const sel = selector.trim()
  if (!sel) return sel
  // :root / html / body 本身就是“卡片根”，映射到作用域容器本身
  if (/^:root\b/.test(sel)) return sel.replace(/^:root/, scope)
  if (/^(html|body)\b/.test(sel)) return sel.replace(/^(html|body)/, scope)
  return `${scope} ${sel}`
}

function scopeCss(css, scope) {
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, "")
  const out = []
  for (const node of splitTopLevel(bare)) {
    if (!node.prelude) continue
    if (node.body === null) {
      out.push(node.prelude.endsWith(";") ? node.prelude : `${node.prelude};`)
      continue
    }
    if (AT_RULE_KEEP.test(node.prelude)) {
      out.push(`${node.prelude}{${node.body}}`)
      continue
    }
    if (AT_RULE_NEST.test(node.prelude)) {
      out.push(`${node.prelude}{${scopeCss(node.body, scope)}}`)
      continue
    }
    const selectors = splitSelectorList(node.prelude)
      .map((s) => scopeSelector(s, scope))
      .join(", ")
    out.push(`${selectors}{${node.body}}`)
  }
  return out.join("\n")
}

// ---------------------------------------------------------------------------
// HTML 拆解
// ---------------------------------------------------------------------------

const ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
}

function decodeEntities(s) {
  return s.replace(/&(?:amp|lt|gt|quot|#39|apos|nbsp);/gi, (m) => ENTITIES[m.toLowerCase()] ?? m)
}

/** 提取纯文本，供 content-index / 搜索使用 */
function htmlToText(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim()
}

function parseCard(raw, opts) {
  const titleMatch = raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const title = titleMatch ? decodeEntities(titleMatch[1].trim()) : null

  // 全文档范围内的 <style>（通常位于 head）
  const styles = [...raw.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1])

  // 内联脚本收集为惰性载体，外链脚本原样保留
  const inlineScripts = []
  const externalScripts = []
  for (const m of raw.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/i.test(m[1])) externalScripts.push(m[0].trim())
    else inlineScripts.push(m[2])
  }

  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  let body = bodyMatch ? bodyMatch[1] : raw
  body = body
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")

  const tail = []
  if (opts.runScripts) {
    for (const code of inlineScripts) {
      tail.push(`<script type="text/plain" data-html-card-script>${code}</script>`)
    }
  }
  for (const tag of externalScripts) tail.push(tag)

  const html = tail.length > 0 ? `${body.trim()}\n${tail.join("\n")}` : body.trim()

  return { title, css: styles.join("\n"), html, text: htmlToText(html) }
}

// ---------------------------------------------------------------------------
// 客户端脚本：在每次 nav（含首屏与 SPA 跳转）后重放卡片的内联脚本。
// 卡片脚本被改成 type="text/plain" 因此不会自动执行，只会在这里被执行一次，
// 避免“首屏原生执行 + nav 再执行一次”造成重复初始化。
// ---------------------------------------------------------------------------

const CARD_SCRIPT_RUNNER = `
function __quartzHtmlCardRun() {
  var nodes = document.querySelectorAll('script[data-html-card-script]:not([data-html-card-ran])')
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i]
    node.setAttribute('data-html-card-ran', '1')
    var script = document.createElement('script')
    script.textContent = node.textContent
    document.body.appendChild(script)
    script.remove()
  }
}
__quartzHtmlCardRun()
document.addEventListener('nav', __quartzHtmlCardRun)
`

// ---------------------------------------------------------------------------
// 插件
// ---------------------------------------------------------------------------

export default function HtmlCard(userOpts) {
  const opts = { ...DEFAULTS, ...(userOpts ?? {}) }
  const filePattern = new RegExp(opts.pattern, "i")

  /** slug -> { css, html }：卡片内容不进 fileData，避免污染索引体积 */
  const cards = new Map()
  /** 真实 md 页面的 slug，用来保证同名时优先 md */
  let mdSlugs = new Set()

  const ignoredNames = () =>
    new Set([...DEFAULTS.ignoreDirs, ...(opts.ignoreDirs ?? [])].filter(Boolean))

  return {
    name: "html-card",
    priority: opts.priority,
    fileExtensions: opts.fileExtensions,
    layout: opts.layout,

    // 虚拟页在 dispatcher 的 Phase 3 用本 pageType 的 layout 直接渲染，
    // 不经过 match()；这里只需要避免抢占真实 md 页面。
    match: ({ slug }) => cards.has(slug) && !mdSlugs.has(slug),

    generate({ content, ctx, cfg }) {
      mdSlugs = new Set((content ?? []).map(([, file]) => file?.data?.slug).filter(Boolean))

      const dir = ctx?.argv?.directory ?? "content"
      const ignores = ignoredNames()
      const configIgnores = (cfg?.configuration?.ignorePatterns ?? []).filter(
        (p) => typeof p === "string" && !/[*?[\]]/.test(p),
      )
      for (const p of configIgnores) ignores.add(p.replace(/^.*\//, ""))

      const files = (ctx?.allFiles ?? [])
        .filter((fp) => filePattern.test(fp))
        .filter((fp) => !fp.split("/").some((seg) => ignores.has(seg)))
        .sort()

      const pages = []
      for (const rel of files) {
        let raw
        try {
          raw = fs.readFileSync(path.join(dir, rel), "utf8")
        } catch {
          continue
        }

        const card = parseCard(raw, opts)
        if (!card.html) continue

        const slug = slugifyFilePath(rel)
        const fallbackTitle = path.basename(rel).replace(/\.[^.]+$/, "")
        const title = opts.titleFrom === "filename" || !card.title ? fallbackTitle : card.title

        cards.set(slug, {
          css: scopeCss(card.css, `.${opts.scopeClass}`),
          html: card.html,
        })

        pages.push({
          slug,
          title,
          data: {
            frontmatter: { title, ...(opts.frontmatter ?? {}) },
            // 供 content-index / 搜索建立全文索引
            text: card.text,
          },
        })

        if (ctx?.argv?.verbose) {
          console.log(`[html-card] ${rel} -> ${slug} (${title})`)
        }
      }

      return pages
    },

    body: () => {
      const HtmlCardBody = (props) => {
        const slug = props?.fileData?.slug
        const card = slug ? cards.get(slug) : undefined
        if (!card) return null

        return h("div", {
          class: opts.scopeClass,
          "data-html-card": "1",
          // 卡片样式已作用域化；<style> 放在 body 内是现代浏览器允许且 SPA 换页时会一起替换的写法
          dangerouslySetInnerHTML: {
            __html: `<style>${card.css}</style>\n${card.html}`,
          },
        })
      }
      HtmlCardBody.displayName = "HtmlCardBody"
      HtmlCardBody.afterDOMLoaded = CARD_SCRIPT_RUNNER
      return HtmlCardBody
    },
  }
}
