---
title: Shell 核心服务进程自愈守护
tags:
  - Shell
  - 运维
  - 自动化
category: 自动化与部署
status: active
---

# Shell 核心服务进程自愈守护

## 目标

自动检测核心服务是否异常退出，并在服务停止或健康检查失败时自动重启，减少人工值守成本。

## 适用场景

- 核心进程偶发退出，需要快速拉起。
- 服务已纳入 systemd 管理。
- 需要记录每次检测和重启动作。
- 需要在生产环境中做轻量级自愈。

## 参数配置

| 参数 | 示例 | 说明 |
|---|---|---|
| `SERVICE_NAME` | `myapp.service` | systemd 服务名 |
| `HEALTH_URL` | `http://127.0.0.1:8080/health` | 健康检查地址 |
| `CHECK_INTERVAL` | `30` | 检测间隔，单位秒 |
| `RESTART_LIMIT` | `3` | 单个周期内最大重启次数 |
| `LOG_FILE` | `/var/log/service-watchdog.log` | 守护日志 |

## 核心逻辑

1. 检查 systemd 服务状态。
2. 访问健康检查接口。
3. 如果服务 inactive 或健康检查失败，则执行重启。
4. 记录检测结果和重启次数。
5. 如果短时间内频繁重启，停止继续拉起并告警。

## 脚本示例

```bash
#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="myapp.service"
HEALTH_URL="http://127.0.0.1:8080/health"
LOG_FILE="/var/log/service-watchdog.log"
DATE="$(date '+%Y-%m-%d %H:%M:%S')"

if ! systemctl is-active --quiet "$SERVICE_NAME"; then
  echo "[$DATE] $SERVICE_NAME inactive, restarting" >> "$LOG_FILE"
  systemctl restart "$SERVICE_NAME"
  exit 0
fi

if ! curl -fsS --max-time 3 "$HEALTH_URL" >/dev/null; then
  echo "[$DATE] healthcheck failed, restarting $SERVICE_NAME" >> "$LOG_FILE"
  systemctl restart "$SERVICE_NAME"
  exit 0
fi

echo "[$DATE] $SERVICE_NAME ok" >> "$LOG_FILE"
```

## 部署方式

```bash
install -m 755 service_watchdog.sh /usr/local/bin/service_watchdog.sh
crontab -e
```

每分钟检测一次：

```cron
* * * * * /usr/local/bin/service_watchdog.sh
```

也可以使用 systemd timer 替代 cron。

## 验证方法

```bash
systemctl status myapp.service
curl -fsS http://127.0.0.1:8080/health
/usr/local/bin/service_watchdog.sh
tail -50 /var/log/service-watchdog.log
```

确认点：

- 服务正常时不会误重启。
- 服务停止后能被拉起。
- 健康检查失败时能触发重启。
- 日志中有完整记录。

## 风险与回滚

| 风险 | 处理方式 |
|---|---|
| 健康检查接口误判 | 健康检查要覆盖核心依赖，但不要过度敏感 |
| 服务频繁重启 | 增加重启次数限制和告警 |
| 重启影响业务请求 | 配合负载均衡摘流或优雅停机 |
| 脚本误操作 | 先在测试服务验证 |

回滚：

```bash
crontab -e
rm -f /usr/local/bin/service_watchdog.sh
```

## 相关笔记

- [[systemd管理服务]]

