---
title: Shell 进程守护增强版
tags:
  - Shell
  - Linux
  - 运维
  - 自动化
category: 自动化与部署
status: active
---

# Shell 进程守护增强版

## 目标

在基础进程守护之上增加健康检查、锁、重启次数限制和告警，避免服务异常时无限重启或误判。

## 适用场景

- 进程存在但服务不可用。
- 需要健康检查接口确认业务状态。
- 需要限制重启频率。
- 需要对异常恢复动作做日志和告警。

## 参数配置

| 参数 | 示例 | 说明 |
|---|---|---|
| `SERVICE_NAME` | `my-worker` | 服务名 |
| `START_CMD` | `/opt/app/start.sh` | 启动命令 |
| `HEALTH_URL` | `http://127.0.0.1:8080/health` | 健康检查地址 |
| `LOCK_FILE` | `/tmp/my-worker.lock` | 防重入锁 |
| `MAX_RESTARTS` | `3` | 最大重启次数 |
| `LOG_FILE` | `/var/log/process-watch.log` | 日志 |

## 核心逻辑

1. 使用 `flock` 防止多个守护脚本并发执行。
2. 检查进程是否存在。
3. 检查健康接口是否可用。
4. 异常时重启服务。
5. 记录重启次数，超过阈值后停止自动重启并告警。

## 脚本片段

```bash
#!/usr/bin/env bash
set -euo pipefail

LOCK_FILE="/tmp/my-worker.lock"
SERVICE_NAME="my-worker"
HEALTH_URL="http://127.0.0.1:8080/health"
LOG_FILE="/var/log/process-watch.log"

(
  flock -n 9 || exit 0

  if ! pgrep -f "$SERVICE_NAME" >/dev/null; then
    echo "process missing, restart" >> "$LOG_FILE"
    systemctl restart "$SERVICE_NAME"
    exit 0
  fi

  if ! curl -fsS --max-time 3 "$HEALTH_URL" >/dev/null; then
    echo "health failed, restart" >> "$LOG_FILE"
    systemctl restart "$SERVICE_NAME"
  fi
) 9>"$LOCK_FILE"
```

## 验证方法

```bash
flock --version
systemctl status my-worker
curl -fsS http://127.0.0.1:8080/health
/usr/local/bin/process_watch_v2.sh
tail -50 /var/log/process-watch.log
```

确认点：

- 脚本不会并发执行。
- 进程不存在时能恢复。
- 进程存在但健康失败时能恢复。
- 重启次数可控。

## 风险与回滚

| 风险 | 处理方式 |
|---|---|
| 健康检查过于敏感 | 调整超时和失败次数 |
| 无限重启 | 设置最大重启次数 |
| 并发执行 | 使用 `flock` |
| 误重启影响业务 | 先告警观察，再启用自动重启 |

## 相关笔记

- [[Shell_进程守护基础版]]
- [[Shell_核心服务进程自愈守护]]
- [[systemd管理服务]]

