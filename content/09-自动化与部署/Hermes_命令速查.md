---
title: Hermes 命令速查
tags:
  - hermes
  - 命令速查
category: 09-自动化与部署
status: active
---

# Hermes 命令速查

> Hermes CLI 常用命令（`hermes_cli/main.py`），统一以 `hermes <cmd>` 调用。更完整内容见官方 [[Hermes_Agent_知识笔记]]。

## 安装与基础

| 命令 | 说明 |
|---|---|
| `curl -fsSL https://hermes-agent.nousresearch.com/install.sh \| bash` | 安装（uv / Python / venv / launcher）|
| `hermes` | 启动交互式对话（默认界面）|
| `hermes chat -q "..."` | 单次查询（fire-and-forget，无需 PTY）|
| `hermes setup` | 安装向导（选模型 + Provider）|
| `hermes model` | 切换/选择模型 |
| `hermes doctor` | 结构化健康检查 |

## 界面

| 命令 | 说明 |
|---|---|
| `hermes desktop`（别名 `hermes gui`）| 原生桌面 App |
| `hermes dashboard` | Web 管理面板 + 嵌入聊天 |
| `hermes proxy` | OpenAI 兼容本地代理（接 Codex/Aider/Cline）|
| `hermes --tui` | Ink TUI（或 `display.interface: tui`）|

## 配置与主题

| 命令 | 说明 |
|---|---|
| `hermes config set KEY VAL` | 设置配置项（**勿手改 config.yaml**）|
| `hermes skin set KEY HEX` | 调整当前主题某一颜色 |
| `hermes config set display.skin <name>` | 切换皮肤（各界面实时刷新）|

## 会话

| 命令 | 说明 |
|---|---|
| `hermes --continue` | 恢复最近会话 |
| `hermes --resume <session_id>` | 恢复指定会话（如 `20260225_143052_a1b2c3`）|

## 关键路径

| 路径 | 内容 |
|---|---|
| `~/.hermes/config.yaml` | 主配置（设置，非密钥）|
| `~/.hermes/.env` | API 密钥（仅密钥）|
| `$HERMES_HOME/skills/` | 已装技能 |
| `~/.hermes/profiles/<name>/` | 其他 Profile（config / .env / SOUL / skills / memory）|
| `~/.hermes/state.db` | 会话库（SQLite + FTS5）|
| `~/.hermes/logs/` | Gateway 与错误日志 |

> [!note]
> 激活某个 Profile 时，应从 `$HERMES_HOME` 解析真实家目录，不要硬编码 `~/.hermes`。

## 常用提醒

- **设置用 `hermes config set`，密钥只进 `.env`**——勿把非凭据设置写入 `.env`。
- 需要独立、长时运行的任务，用 `hermes chat -q`（后台）+ `cronjob` 定时，而非手工 spawn。

## 相关笔记

- [[Hermes_Agent_知识笔记]]
- [[Hermes_技术栈全景]]
- [[Hermes_索引]]
