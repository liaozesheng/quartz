---
title: Shell 进程守护基础版
tags:
  - Shell
  - Linux
  - 运维
  - 自动化
category: 自动化与部署
status: active
---

# Shell 进程守护基础版

## 目标

用 Shell 实现基础进程守护：检测目标进程是否存在，不存在则自动启动，并记录动作日志。

## 适用场景

- 非 systemd 管理的临时程序。
- 内部工具、脚本服务需要简单自愈。
- 开发或测试环境需要快速守护。
- 生产环境建议优先使用 systemd。

## 参数配置

| 参数 | 示例 | 说明 |
|---|---|---|
| `PROCESS_NAME` | `my-worker` | 进程名或匹配关键字 |
| `START_CMD` | `/opt/app/start.sh` | 启动命令 |
| `LOG_FILE` | `/var/log/process-watch.log` | 守护日志 |
| `CHECK_INTERVAL` | `30` | 检测间隔 |

## 脚本示例

```bash
#!/usr/bin/env bash
set -euo pipefail

PROCESS_NAME="my-worker"
START_CMD="/opt/app/start.sh"
LOG_FILE="/var/log/process-watch.log"
DATE="$(date '+%Y-%m-%d %H:%M:%S')"

if ! pgrep -f "$PROCESS_NAME" >/dev/null; then
  echo "[$DATE] $PROCESS_NAME not running, starting" >> "$LOG_FILE"
  nohup "$START_CMD" >/dev/null 2>&1 &
else
  echo "[$DATE] $PROCESS_NAME ok" >> "$LOG_FILE"
fi
```

## 部署方式

```bash
install -m 755 process_watch.sh /usr/local/bin/process_watch.sh
crontab -e
```

每分钟检测：

```cron
* * * * * /usr/local/bin/process_watch.sh
```

## 验证方法

```bash
pgrep -af my-worker
/usr/local/bin/process_watch.sh
tail -20 /var/log/process-watch.log
```

确认点：

- 进程存在时不会重复启动。
- 进程退出后能被拉起。
- 日志记录清楚。

## 风险与回滚

| 风险 | 处理方式 |
|---|---|
| `pgrep -f` 匹配过宽 | 使用更精确的 pidfile 或 systemd |
| 重复启动多个实例 | 增加锁或 pidfile |
| 启动命令失败无人感知 | 增加退出码和告警 |
| cron 粒度有限 | 用 systemd 替代 |

## 相关笔记

- [[Shell_核心服务进程自愈守护]]
- [[systemd管理服务]]

