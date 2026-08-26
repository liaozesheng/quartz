---
title: Shell 秒级和毫秒级定时任务
tags:
  - Shell
  - Linux
  - 命令速查
category: 命令速查
status: active
---

# Shell 秒级和毫秒级定时任务

## 使用场景

传统 cron 最小粒度通常是分钟。如果需要秒级甚至更细粒度的周期任务，可以使用 `sleep` 循环、systemd timer、专用调度程序或应用内部调度。

## 方案对比

| 方案 | 粒度 | 适用场景 | 注意事项 |
|---|---|---|---|
| `while + sleep` | 秒级/亚秒级 | 简单脚本、本地任务 | 需要防重入和漂移 |
| systemd timer | 秒级 | 生产服务化任务 | 配置稍多，可靠性更好 |
| cron 多行错峰 | 分钟级内拆分 | 简单兼容方案 | 不是真正秒级 |
| 应用内部调度 | 毫秒级 | 高精度业务逻辑 | 不建议用 Shell 承担 |

## while + sleep

每 5 秒执行一次：

```bash
#!/usr/bin/env bash
set -euo pipefail

while true; do
  date
  /usr/local/bin/job.sh
  sleep 5
done
```

毫秒级 sleep：

```bash
sleep 0.2
```

> [!warning]
> Shell 的毫秒级定时不适合强实时任务。进程调度、命令耗时和系统负载都会造成漂移。

## 防止任务重叠

使用 `flock`：

```bash
flock -n /tmp/job.lock /usr/local/bin/job.sh
```

循环中使用：

```bash
while true; do
  flock -n /tmp/job.lock /usr/local/bin/job.sh || true
  sleep 5
done
```

## systemd timer 示例

service：

```ini
[Unit]
Description=Run job

[Service]
Type=oneshot
ExecStart=/usr/local/bin/job.sh
```

timer：

```ini
[Unit]
Description=Run job every 10 seconds

[Timer]
OnBootSec=10s
OnUnitActiveSec=10s
AccuracySec=1s

[Install]
WantedBy=timers.target
```

启用：

```bash
systemctl daemon-reload
systemctl enable --now job.timer
systemctl list-timers
```

## 验证方法

```bash
date '+%F %T.%3N'
systemctl list-timers
journalctl -u job.service -n 50
```

确认点：

- 任务间隔符合预期。
- 任务不会重叠执行。
- 失败时有日志可查。
- 任务耗时小于调度间隔。

## 相关笔记

- [[systemd管理服务]]
- [[Shell_核心服务进程自愈守护]]

