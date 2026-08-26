---
title: Shell 自动全网封禁系统
tags:
  - Shell
  - 运维
  - 安全
  - 自动化
category: 自动化与部署
status: active
---

# Shell 自动全网封禁系统

## 目标

将恶意 IP 的识别和封禁动作从单机扩展到多台服务器，实现统一下发、统一记录、统一回滚的轻量级安全联动。

## 适用场景

- 多台 Web 服务器都暴露公网入口。
- 某个恶意 IP 会切换访问不同节点。
- 单机封禁不够，需要全网同步封禁。
- 暂时没有集中式 WAF 或安全编排平台。

## 参数配置

| 参数 | 示例 | 说明 |
|---|---|---|
| `SERVER_LIST` | `/etc/ban/servers.txt` | 需要同步封禁的服务器列表 |
| `BAN_LIST` | `/etc/ban/ip.list` | 待封禁 IP 列表 |
| `ALLOW_LIST` | `/etc/ban/allow.list` | 白名单 |
| `BAN_LOG` | `/var/log/global-ban.log` | 操作日志 |
| `REMOTE_CMD` | `iptables -I INPUT` | 远端执行的封禁命令 |

## 核心逻辑

1. 汇总待封禁 IP。
2. 过滤白名单、内网地址、监控地址。
3. 遍历服务器列表。
4. 通过 SSH 在远端写入 iptables 规则。
5. 记录每台服务器的执行结果。
6. 提供统一解封和回滚命令。

## 脚本示例

```bash
#!/usr/bin/env bash
set -euo pipefail

SERVER_LIST="/etc/ban/servers.txt"
BAN_LIST="/etc/ban/ip.list"
ALLOW_LIST="/etc/ban/allow.list"
BAN_LOG="/var/log/global-ban.log"
DATE="$(date '+%Y-%m-%d %H:%M:%S')"

while read -r ip; do
  [ -z "$ip" ] && continue
  grep -qx "$ip" "$ALLOW_LIST" && continue

  while read -r server; do
    [ -z "$server" ] && continue
    ssh "$server" "iptables -C INPUT -s $ip -j DROP 2>/dev/null || iptables -I INPUT -s $ip -j DROP"
    echo "[$DATE] banned $ip on $server" >> "$BAN_LOG"
  done < "$SERVER_LIST"
done < "$BAN_LIST"
```

## 部署前检查

```bash
cat /etc/ban/servers.txt
cat /etc/ban/allow.list
ssh <server> 'hostname && iptables -L INPUT -n --line-numbers'
```

确认点：

- SSH 账号权限可控。
- 白名单完整。
- 服务器列表准确。
- 有统一回滚方式。

## 验证方法

```bash
tail -50 /var/log/global-ban.log
ssh <server> 'iptables -L INPUT -n --line-numbers'
```

确认点：

- 每台服务器都写入封禁规则。
- 白名单 IP 没有被封。
- 执行失败的节点有日志记录。
- 规则可以统一删除。

## 风险与回滚

| 风险 | 处理方式 |
|---|---|
| 全网误封 | 必须维护白名单和人工确认机制 |
| SSH 执行失败 | 记录失败节点并重试 |
| 规则重复写入 | 使用 `iptables -C` 先检查 |
| 无法快速恢复 | 准备统一解封脚本 |

统一解封示例：

```bash
ssh <server> "iptables -D INPUT -s <ip> -j DROP"
```

## 相关笔记

- [[Shell_监控_Nginx_高频恶意_IP_自动封禁]]
- [[Shell_iptables_四维精准限流]]

