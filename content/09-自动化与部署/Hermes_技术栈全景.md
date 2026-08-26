---
title: Hermes 技术栈全景
tags:
  - hermes
  - 运维
category: 09-自动化与部署
status: active
---

# Hermes 技术栈全景

> Hermes Agent 是 Nous Research 开发的**开源自进化 AI Agent**。本文档从界面、引擎、记忆、技能、工具、网关、集成、配置、调度、安全十方面梳理其完整能力。深入细节见 [[Hermes_Agent_知识笔记]]。

## 1. 定位与界面

- **定位**：自主编码 + 任务执行的 Agent，任意 LLM Provider（OpenRouter / Anthropic / OpenAI / DeepSeek / xAI / 本地模型等 30+ 家）。同类有 Claude Code / Codex / OpenClaw。
- **多界面**：CLI、Ink TUI、原生桌面 App、Web Dashboard、OpenAI 兼容代理、ACP 服务端（VS Code / Zed / JetBrains）。

## 2. 核心引擎

- **AIAgent**（`run_agent.py`）：入口 → Prompt Builder（拼上下文）→ Provider Resolution（调 LLM）→ Tool Dispatch（执行工具）。
- **Provider-agnostic**：运行中可换模型/Provider；凭据池多 API Key 自动轮换。
- 上下文压缩与缓存、3 种 API 模式（`chat_completion` / `codex_response` / `anthropic`）。

## 3. 记忆系统

| 组件 | 说明 |
|---|---|
| Session Store | SQLite + FTS5，存储全部历史对话，`session_search` 跨会话检索 |
| Memory | 持久化「笔记」，跨会话保留，注入系统提示 |
| User Profile | 用户事实记录（偏好、习惯、技术栈）|
| 自主学习循环 | 每轮对话后后台审查记忆/技能，自查自更新 |

## 4. 技能系统

技能是 Hermes 的「过程性记忆」——可复用的工作流程模板。由 `skill_manage` 创建/更新（`create` / `patch` / `edit` / `delete` / `write_file` / `remove_file`）。

- 来源：Skills Hub（社区市场）、AGENTS.md（项目目录自动加载）、Agent 自主创建。

## 5. 工具与工具集

60+ 内置工具，按工具集分组：

| 工具集 | 能力 |
|---|---|
| terminal | shell 命令（6 种后端）|
| file | 文件读写搜索 |
| web | 网页搜索提取 |
| browser | 浏览器自动化（5 种后端）|
| delegation | delegate_task 子 Agent |
| skills | skill 管理 |
| cronjob | 定时任务 |
| memory | 持久记忆 |
| mcp | MCP 协议外部工具 |

## 6. 消息网关 (Gateway)

`GatewayRunner` 统一路由分发（Slash 命令 / AIAgent 会话 / 后台队列），支持 20+ 平台：

> Telegram、Discord、Slack、WhatsApp、Signal、Matrix、Email、SMS、Teams、钉钉、飞书、企业微信、QQ Bot、元宝 等。

## 7. MCP 集成

三种传输协议：**stdio**（子进程）、**SSE**（HTTP 长连接）、**Streamable HTTP**（无状态请求响应）。

## 8. 配置与 Profile

- **设置与密钥分离**：`config.yaml`（设置，非密钥）、`.env`（仅密钥）。
- **Profile 多实例**：`~/.hermes/profiles/<name>/`，各自的 config / .env / SOUL.md / skills / memory。

## 9. 定时任务 (Cron)

- 表达式：`30m`、`every 2h`、`0 9 * * *`、ISO 时间。
- 两种模式：**Agent 模式**（LLM 驱动，默认）、**无 Agent 模式**（`no_agent=true`，纯脚本执行）。

## 10. 安全模型

1. 命令审批——敏感操作需确认
2. 容器隔离——Docker 安全加固
3. 平台授权——消息平台权限控制
4. Tirith 策略引擎——可编程安全策略
5. Secret 脱敏——自动脱敏 API Key

## 参考

- 官方文档：https://hermes-agent.nousresearch.com/docs
- GitHub：https://github.com/NousResearch/hermes-agent
- 相关笔记：[[Hermes_Agent_知识笔记]]、[[Hermes_命令速查]]、[[Hermes_索引]]
