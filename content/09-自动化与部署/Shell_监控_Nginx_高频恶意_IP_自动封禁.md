---
title: Shell 监控 Nginx 高频恶意 IP 自动封禁
tags:
  - Shell
  - Nginx
  - 运维
  - 安全
category: 自动化与部署
status: active
---

# Shell 监控 Nginx 高频恶意 IP 自动封禁

## 目标

监控 Nginx 访问日志，识别短时间内请求频率异常的 IP，并通过防火墙规则临时封禁，降低恶意扫描、爆破或接口刷量的影响。

## 适用场景

- Nginx access log 中出现高频请求 IP。
- 某些接口被频繁扫描或刷请求。
- 需要轻量级自动封禁方案。
- 暂时没有 WAF 或更完整的安全平台。

## 参数配置

| 参数 | 示例 | 说明 |
|---|---|---|
| `ACCESS_LOG` | `/var/log/nginx/access.log` | Nginx 访问日志路径 |
| `THRESHOLD` | `200` | 单轮检测中超过多少次视为异常 |
| `BAN_SECONDS` | `3600` | 封禁持续时间 |
| `ALLOW_LIST` | `allowlist.txt` | 白名单 IP 列表 |
| `BAN_LOG` | `/var/log/ip-ban.log` | 封禁记录 |

## 核心逻辑

1. 从 access log 中提取客户端 IP。
2. 统计单位时间内每个 IP 的请求次数。
3. 过滤白名单 IP。
4. 对超过阈值的 IP 写入 iptables 规则。
5. 记录封禁动作，定期清理过期规则。

## 常用命令

```bash
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head
iptables -L INPUT -n --line-numbers
iptables -I INPUT -s <ip> -j DROP
iptables -D INPUT -s <ip> -j DROP
```

## 部署方式

```bash
install -m 755 nginx_ip_ban.sh /usr/local/bin/nginx_ip_ban.sh
crontab -e
```

示例：每分钟检测一次。

```cron
* * * * * /usr/local/bin/nginx_ip_ban.sh
```

## 验证方法

```bash
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head
iptables -L INPUT -n
tail -50 /var/log/ip-ban.log
```

验证点：

- 高频 IP 能被识别。
- 白名单 IP 不会被封。
- iptables 中能看到封禁规则。
- 封禁记录可追踪。

## 风险与回滚

| 风险 | 处理方式 |
|---|---|
| 误封正常用户或代理出口 | 配置白名单，阈值先保守 |
| 封禁规则过多 | 定期清理过期规则 |
| 影响办公网或监控系统 | 把内网、监控、LB IP 加入白名单 |
| iptables 规则误操作 | 保留当前规则快照 |

回滚示例：

```bash
iptables -D INPUT -s <ip> -j DROP
```

## 相关笔记

- [[Nginx_安装与反向代理配置手册]]

