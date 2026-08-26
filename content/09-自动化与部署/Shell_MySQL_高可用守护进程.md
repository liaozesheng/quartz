---
title: Shell MySQL 高可用守护进程
tags:
  - Shell
  - MySQL
  - 运维
  - 自动化
category: 自动化与部署
status: active
---

# Shell MySQL 高可用守护进程

## 目标

通过 Shell 脚本定期检测 MySQL 服务和连接状态，在异常时执行重启、告警或主备切换辅助动作，提高数据库服务可用性。

## 适用场景

- MySQL 服务偶发异常退出。
- 需要轻量级守护脚本辅助 systemd。
- 需要检测端口、进程和 SQL 连接可用性。
- 小规模环境中暂时没有完整数据库高可用平台。

## 参数配置

| 参数 | 示例 | 说明 |
|---|---|---|
| `MYSQL_SERVICE` | `mysqld.service` | MySQL systemd 服务 |
| `MYSQL_HOST` | `127.0.0.1` | MySQL 地址 |
| `MYSQL_PORT` | `3306` | MySQL 端口 |
| `MYSQL_USER` | `monitor` | 监控账号 |
| `LOG_FILE` | `/var/log/mysql-watchdog.log` | 守护日志 |

## 核心逻辑

1. 检查 systemd 服务状态。
2. 检查 3306 端口是否监听。
3. 执行轻量 SQL 验证连接。
4. 异常时重启 MySQL 或触发告警。
5. 记录每次检测和处理动作。

## 脚本示例

```bash
#!/usr/bin/env bash
set -euo pipefail

MYSQL_SERVICE="mysqld.service"
MYSQL_HOST="127.0.0.1"
MYSQL_PORT="3306"
MYSQL_USER="monitor"
LOG_FILE="/var/log/mysql-watchdog.log"
DATE="$(date '+%Y-%m-%d %H:%M:%S')"

if ! systemctl is-active --quiet "$MYSQL_SERVICE"; then
  echo "[$DATE] MySQL inactive, restarting" >> "$LOG_FILE"
  systemctl restart "$MYSQL_SERVICE"
  exit 0
fi

if ! mysqladmin -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" ping >/dev/null 2>&1; then
  echo "[$DATE] MySQL ping failed, restarting" >> "$LOG_FILE"
  systemctl restart "$MYSQL_SERVICE"
  exit 0
fi

echo "[$DATE] MySQL ok" >> "$LOG_FILE"
```

## 部署方式

```bash
install -m 755 mysql_watchdog.sh /usr/local/bin/mysql_watchdog.sh
crontab -e
```

每分钟检测一次：

```cron
* * * * * /usr/local/bin/mysql_watchdog.sh
```

## 验证方法

```bash
systemctl status mysqld.service
mysqladmin -h 127.0.0.1 -P 3306 -u monitor ping
/usr/local/bin/mysql_watchdog.sh
tail -50 /var/log/mysql-watchdog.log
```

确认点：

- MySQL 正常时脚本不误重启。
- MySQL 停止后能被检测到。
- 日志记录清晰。
- 监控账号权限足够但不过度授权。

## 风险与回滚

| 风险 | 处理方式 |
|---|---|
| 数据库频繁重启影响业务 | 设置重启次数限制和告警 |
| 误判连接失败 | 同时检测服务状态、端口和 SQL |
| 监控账号权限过大 | 只授予必要权限 |
| 主从环境误操作 | 主备切换逻辑要单独设计，不要随意自动切 |

回滚：

```bash
crontab -e
rm -f /usr/local/bin/mysql_watchdog.sh
```

## 相关笔记

- [[systemd管理服务]]
- [[Shell_核心服务进程自愈守护]]
