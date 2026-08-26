---
title: Shell 目录变化监控
tags:
  - Shell
  - Linux
  - 运维
  - 自动化
category: 自动化与部署
status: active
---

# Shell 目录变化监控

## 目标

监控指定目录下的文件创建、修改、删除、移动等事件，并在变化发生时触发记录、同步、告警或后续处理脚本。

## 适用场景

- 监控配置目录是否被修改。
- 监听上传目录，文件到达后自动处理。
- 检测日志、证书、脚本文件是否异常变化。
- 替代低效的定时轮询。

## 参数配置

| 参数 | 示例 | 说明 |
|---|---|---|
| `WATCH_DIR` | `/data/upload` | 被监控目录 |
| `EVENTS` | `create,modify,delete,move` | 监听事件 |
| `LOG_FILE` | `/var/log/dir-watch.log` | 事件记录文件 |
| `ACTION_SCRIPT` | `/usr/local/bin/on-change.sh` | 事件触发脚本 |

## 常用命令

安装工具：

```bash
apt install inotify-tools
yum install inotify-tools
```

监听目录：

```bash
inotifywait -m -r -e create,modify,delete,move /data/upload
```

记录事件：

```bash
inotifywait -m -r -e create,modify,delete,move --format '%T %w%f %e' --timefmt '%F %T' /data/upload
```

## 脚本示例

```bash
#!/usr/bin/env bash
set -euo pipefail

WATCH_DIR="/data/upload"
LOG_FILE="/var/log/dir-watch.log"

inotifywait -m -r -e create,modify,delete,move --format '%T %w%f %e' --timefmt '%F %T' "$WATCH_DIR" |
while read -r line; do
  echo "$line" >> "$LOG_FILE"
done
```

## 部署方式

建议用 systemd 管理长期监听脚本。

```bash
install -m 755 dir_watch.sh /usr/local/bin/dir_watch.sh
systemctl daemon-reload
systemctl enable --now dir-watch.service
```

## 验证方法

```bash
touch /data/upload/test.txt
echo hello >> /data/upload/test.txt
rm -f /data/upload/test.txt
tail -20 /var/log/dir-watch.log
```

确认点：

- 创建、修改、删除事件都能记录。
- 递归目录能被监听。
- 服务重启后监听恢复。

## 风险与回滚

| 风险 | 处理方式 |
|---|---|
| 监听目录过大导致事件过多 | 限定目录范围，过滤事件类型 |
| 处理脚本执行过慢 | 异步处理或写入队列 |
| 日志无限增长 | 配合 logrotate |
| 监听进程退出 | 用 systemd 管理并配置 Restart |

## 相关笔记

- [[Shell_日志目录超标监控]]
- [[systemd管理服务]]

