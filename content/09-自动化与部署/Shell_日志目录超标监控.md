---
title: Shell 日志目录超标监控
tags:
  - Shell
  - Linux
  - 运维
  - 自动化
category: 自动化与部署
status: active
---

# Shell 日志目录超标监控

## 目标

定期检查日志目录容量，超过阈值时记录告警、触发清理或通知，避免日志目录持续增长导致磁盘空间被打满。

## 适用场景

- 业务日志目录容量增长快。
- 需要提前发现磁盘风险。
- 需要和日志清理脚本配合。
- 暂时没有完整监控平台，但希望有本地兜底检查。

## 参数配置

| 参数 | 示例 | 说明 |
|---|---|---|
| `LOG_DIR` | `/var/log/myapp` | 被监控日志目录 |
| `MAX_SIZE_MB` | `10240` | 最大允许容量，单位 MB |
| `ALERT_LOG` | `/var/log/log-dir-alert.log` | 告警记录 |
| `CLEAN_SCRIPT` | `/usr/local/bin/clean_old_logs.sh` | 可选清理脚本 |

## 核心逻辑

1. 用 `du` 统计目录容量。
2. 和阈值比较。
3. 超标时写入告警日志。
4. 可选触发清理脚本。
5. 清理后再次检查容量。

## 脚本示例

```bash
#!/usr/bin/env bash
set -euo pipefail

LOG_DIR="/var/log/myapp"
MAX_SIZE_MB=10240
ALERT_LOG="/var/log/log-dir-alert.log"
DATE="$(date '+%Y-%m-%d %H:%M:%S')"

current_mb="$(du -sm "$LOG_DIR" | awk '{print $1}')"

if [ "$current_mb" -gt "$MAX_SIZE_MB" ]; then
  echo "[$DATE] WARN: $LOG_DIR is ${current_mb}MB, limit=${MAX_SIZE_MB}MB" >> "$ALERT_LOG"
fi
```

## 部署方式

```bash
install -m 755 log_dir_monitor.sh /usr/local/bin/log_dir_monitor.sh
crontab -e
```

每 10 分钟检查一次：

```cron
*/10 * * * * /usr/local/bin/log_dir_monitor.sh
```

## 验证方法

```bash
du -sh /var/log/myapp
/usr/local/bin/log_dir_monitor.sh
tail -20 /var/log/log-dir-alert.log
```

确认点：

- 目录超过阈值时能记录告警。
- 未超过阈值时不误报。
- 阈值单位清晰。
- 与清理脚本联动时不会误删。

## 风险与回滚

| 风险 | 处理方式 |
|---|---|
| 阈值设置过低 | 先观察 1-2 周再定阈值 |
| 自动清理误删 | 默认只告警，不直接删除 |
| `du` 扫描大目录耗时 | 控制检查频率 |
| 告警日志自身增长 | 给告警日志配置 logrotate |

## 相关笔记

- [[Shell_自动化清理旧日志文件]]
- [[Linux_磁盘空间爆满排查]]
- [[find_命令_mtime_用法]]

