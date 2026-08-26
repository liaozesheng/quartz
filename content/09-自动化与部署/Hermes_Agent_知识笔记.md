---
title: Hermes Agent 知识笔记
tags:
  - hermes
  - 运维
category: 09-自动化与部署
status: active
---

# Hermes Agent 知识笔记

> **Hermes Agent** 是 Nous Research 开发的开源自进化 AI Agent，具备持久记忆、多平台消息网关、定时自动化、可扩展工具调用和技能系统。

---

## 1. 核心架构

```
┌──────────────────────────────────────────────────────────────────┐
│                        Entry Points                               │
│  CLI (cli.py)    Gateway (gateway/)    ACP (acp_adapter/)         │
│  Batch Runner    API Server            Python Library             │
└─────────┬──────────────┬──────────────────────┬──────────────────┘
          │              │                      │
          ▼              ▼                      ▼
┌──────────────────────────────────────────────────────────────────┐
│                     AIAgent (run_agent.py)                       │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Prompt       │  │ Provider     │  │ Tool         │            │
│  │ Builder      │  │ Resolution   │  │ Dispatch     │            │
│  │ (prompt_     │  │ (runtime_    │  │ (model_      │            │
│  │  builder.py) │  │  provider.py)│  │  tools.py)   │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                 │                 │                    │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐            │
│  │ Compression  │  │ 3 API Modes  │  │ Tool Registry│            │
│  │ & Caching    │  │ chat_compl.  │  │ 70+ tools    │            │
│  │              │  │ codex_resp.  │  │ 28 toolsets  │            │
│  │              │  │ anthropic    │  │              │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└────────────────────────┬─────────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
┌──────────────────┐ ┌──────────┐ ┌──────────────┐
│ Session Store    │ │ Memory   │ │ Tool Backends │
│ SQLite + FTS5    │ │ System   │ │ Terminal(6)   │
│                  │ │ User     │ │ Browser(5)    │
│                  │ │ Profile  │ │ Web(4)        │
│                  │ │          │ │ MCP(dynamic)  │
└──────────────────┘ └──────────┘ └──────────────┘
```

**核心数据流：** 用户输入 → Entry Point → AIAgent → Prompt Builder(拼接上下文) → Provider Resolution(调用LLM) → Tool Dispatch(执行工具) → 返回结果

---

## 2. 自主学习循环 (Learning Loop)

每轮对话后自动在后台审查并更新记忆和技能。

```
┌─────────┐   对话轮次计数    ┌──────────────┐
│ 用户交互 ├─────────────────►│ 后台审查线程  │
└─────────┘                  └──────┬───────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌──────────────┐ ┌──────────┐ ┌──────────────┐
            │ 记忆审查      │ │ 技能审查  │ │ 组合审查      │
            │ (每N轮触发)   │ │(每次对话  │ │ (两者同时)    │
            │              │ │ 工具调用  │ │              │
            │              │ │ 计数触发) │ │              │
            └──────┬───────┘ └────┬─────┘ └──────┬───────┘
                   │              │              │
                   ▼              ▼              ▼
            ┌─────────────────────────────────────────┐
            │   memory 工具  │  skill_manage 工具      │
            │   写入记忆      │   创建/更新技能          │
            └─────────────────────────────────────────┘
```

- **记忆审查**：每 N 轮用户交互后触发
- **技能审查**：每次对话固定工具调用次数后触发
- 审查**在响应发送给用户之后**执行，不影响对话体验

---

## 3. 持久记忆系统

| 组件 | 说明 |
|---|---|
| Session Store | SQLite + FTS5 全文搜索，存储所有历史对话 |
| Memory | 持久化"笔记"，跨会话保留，注入到系统提示 |
| User Profile | 用户事实性记录（偏好、习惯、技术栈） |
| session_search | FTS5 驱动的跨会话检索工具 |

---

## 4. Skills 技能系统

技能是 Hermes 的"过程性记忆"——可复用的工作流程模版。

```
skill_manage 工具
  ├── create   → 创建新技能 (SKILL.md + 附属文件)
  ├── patch    → 局部更新 (find-and-replace)
  ├── edit     → 整体重写
  ├── delete   → 删除技能
  └── write_file / remove_file → 管理附属文件
```

技能来源：
- **Skills Hub** — 社区贡献技能市场
- **AGENTS.md** — 项目目录自动加载
- **Agent 自主创建** — 在对话中自动生成

---

## 5. Tools & Toolsets

60+ 内置工具，按工具集分组：

| 工具集 | 包含工具 |
|--------|---------|
| terminal | shell 命令 (6种后端) |
| file | 文件读写搜索 |
| web | 网页搜索提取 |
| browser | 浏览器自动化 (5种后端) |
| delegation | delegate_task 子Agent |
| skills | skill 管理 |
| cronjob | 定时任务 |
| memory | 持久记忆 |
| mcp | MCP 协议外部工具 |

---

## 6. 消息网关 (Gateway)

```
                    ┌──────────────────────┐
                    │    GatewayRunner      │
                    │  _handle_message()    │
 Telegram ─────────►│  ┌────────────────┐  │
 Discord  ─────────►│  │  路由分发:     │  │
 Slack    ─────────►│  │ • Slash命令    │  │
 WhatsApp ─────────►│  │ • AIAgent会话  │  │
 Signal   ─────────►│  │ • 后台队列     │  │
 Matrix   ─────────►│  └───────┬────────┘  │
 钉钉/飞书 ────────►│          │           │
 企业微信 ─────────►│          ▼           │
 元宝     ─────────►│  ┌────────────────┐  │
 ...                │  │ SessionStore   │  │
                    │  │ SQLite持久化   │  │
                    │  └────────────────┘  │
                    └──────────────────────┘
```

支持 20+ 平台：CLI, Telegram, Discord, Slack, WhatsApp, Signal, Matrix, Email, SMS, Teams, 钉钉, 飞书, 企业微信, QQ Bot, 元宝 等。

---

## 7. MCP 集成 (Model Context Protocol)

```yaml
mcp_servers:
  filesystem:
    command: "npx"                          # stdio 传输
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"]
  company_api:
    url: "https://api.company.com/mcp"      # HTTP 传输
    headers:
      Authorization: "Bearer sk-xxx"
```

三种传输协议：
- **stdio** — 子进程 stdin/stdout
- **SSE** — HTTP 长连接
- **Streamable HTTP** — 无状态请求响应

---

## 8. 配置文件结构

```yaml
model:
  provider: deepseek
  default: deepseek-v4-flash
providers:
  deepseek:
    model: deepseek-v4-flash
    models:
      deepseek-v4-flash:
        supports_tools: true
terminal:
  backend: local
  cwd: /home/zesheng/workspace/
display:
  language: zh
  streaming: false
mcp_servers:
  context7:
    url: https://mcp.context7.com/mcp/oauth
    auth: oauth
  fns:
    url: https://fast-note-sync.liaozesheng.cn/api/mcp
    headers:
      Authorization: "Bearer xxx"
```

### Profile 多实例

```
~/.hermes/profiles/
├── default/        # 向后兼容
├── zesheng/        # 当前使用
│   ├── config.yaml
│   ├── .env
│   └── SOUL.md
└── coder/
```

---

## 9. 定时任务 (Cron)

```bash
30m          # 每30分钟
every 2h     # 每2小时
0 9 * * *    # 每天9点
```

两种模式：
- **Agent 模式 (默认)** — LLM 驱动
- **无 Agent 模式** (no_agent=true) — 纯脚本执行

---

## 10. 安全模型

1. **命令审批** — 敏感操作需确认
2. **容器隔离** — Docker 安全加固
3. **平台授权** — 消息平台权限控制
4. **Tirith 策略引擎** — 可编程安全策略
5. **Secret 脱敏** — 自动脱敏 API Key

---

## 相关笔记

- [[Hermes_索引]]
- [[Hermes_技术栈全景]]
- [[Hermes_命令速查]]
