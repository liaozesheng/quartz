---
title: Shell 自动化清理旧日志文件
tags:
  - Shell
  - 运维
  - 命令速查
category: 自动化与部署
status: active
---

# Shell 自动化清理旧日志文件

## 目标

定期清理指定目录下超过保留周期的日志文件，避免日志长期堆积导致磁盘空间被打满。

## 适用场景

- 应用日志目录持续增长。
- Nginx、业务服务或自定义程序生成大量 `.log` 文件。
- 需要通过 cron 定期清理旧日志。
- 需要保留清理记录，方便审计和回溯。

## 参数配置

| 参数 | 示例 | 说明 |
|---|---|---|
| `LOG_DIR` | `/var/log/myapp` | 需要清理的日志目录 |
| `DAYS_TO_KEEP` | `30` | 保留最近多少天的日志 |
| `CLEAN_LOG` | `/var/log/cleanup.log` | 清理动作记录文件 |
| 文件匹配 | `*.log` | 需要清理的文件类型 |

## 核心逻辑

1. 检查日志目录是否存在。
2. 检查清理记录文件是否可写。
3. 使用 `find` 找出超过保留周期的日志。
4. 删除匹配文件并记录结果。
5. 通过 cron 定时执行。

## 脚本示例

```bash
#!/usr/bin/env bash
set -euo pipefail

LOG_DIR="/var/log/myapp"
DAYS_TO_KEEP=30
CLEAN_LOG="/var/log/cleanup.log"
DATE="$(date '+%Y-%m-%d %H:%M:%S')"

if [ ! -d "$LOG_DIR" ]; then
  echo "[$DATE] ERROR: $LOG_DIR does not exist" >> "$CLEAN_LOG"
  exit 1
fi

find "$LOG_DIR" -type f -name "*.log" -mtime +"$DAYS_TO_KEEP" -print -delete |
while read -r file; do
  echo "[$DATE] deleted: $file" >> "$CLEAN_LOG"
done
```

## 部署方式

```bash
install -m 755 clean_old_logs.sh /usr/local/bin/clean_old_logs.sh
crontab -e
```

每天凌晨 2 点执行：

```cron
0 2 * * * /usr/local/bin/clean_old_logs.sh
```

## 验证方法

先用 `-print` 验证匹配范围，再启用删除动作。

```bash
find /var/log/myapp -type f -name "*.log" -mtime +30 -print
/usr/local/bin/clean_old_logs.sh
tail -50 /var/log/cleanup.log
df -h
```

## 风险与回滚

| 风险 | 处理方式 |
|---|---|
| 路径写错导致误删 | 执行前先用 `find ... -print` 确认 |
| 保留天数过短 | 调整 `DAYS_TO_KEEP` |
| 应用仍在写旧日志 | 先确认日志轮转策略 |
| 删除后无法恢复 | 关键日志先备份或归档 |

## 相关笔记

- [[find_命令_mtime_用法]]
- [[Linux_磁盘空间爆满排查]]

