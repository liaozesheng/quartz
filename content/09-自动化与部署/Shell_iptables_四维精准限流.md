---
title: Shell iptables 四维精准限流
tags:
  - Shell
  - 运维
  - 安全
  - 网络
category: 自动化与部署
status: active
---

# Shell iptables 四维精准限流

## 目标

通过 iptables 对访问流量进行更细粒度的限流和拦截，降低恶意请求、异常流量或单 IP 高频访问对服务的影响。

## 适用场景

- 某些 IP 或网段访问频率异常。
- 暂时没有 WAF、API 网关或限流中间件。
- 需要在主机层快速限制连接数或请求频率。
- 需要配合 Nginx 日志分析做临时防护。

## 四个维度

| 维度 | 示例 | 说明 |
|---|---|---|
| 来源 IP | `1.2.3.4` | 针对单个 IP 或网段 |
| 目标端口 | `80`, `443` | 只限制指定服务端口 |
| 连接速率 | `--limit` | 控制单位时间通过速率 |
| 并发连接 | `connlimit` | 限制同源 IP 同时连接数 |

## 常用命令

查看规则：

```bash
iptables -L INPUT -n --line-numbers
```

限制单 IP 并发连接：

```bash
iptables -I INPUT -p tcp --dport 80 -s <ip> -m connlimit --connlimit-above 50 -j REJECT
```

限制新连接速率：

```bash
iptables -I INPUT -p tcp --dport 80 -m limit --limit 30/second --limit-burst 60 -j ACCEPT
```

封禁单 IP：

```bash
iptables -I INPUT -s <ip> -j DROP
```

删除规则：

```bash
iptables -D INPUT <line-number>
```

## 部署前检查

```bash
iptables -L INPUT -n --line-numbers
ss -lntp
curl -I http://127.0.0.1
```

确认点：

- 当前服务端口明确。
- 已保存当前 iptables 规则快照。
- 已确认办公网、监控、LB、健康检查 IP。
- 阈值先保守，不要直接一刀切。

## 风险与回滚

| 风险 | 处理方式 |
|---|---|
| 误封正常用户 | 配置白名单，先观察再封禁 |
| 误伤负载均衡出口 | 将 LB、网关、监控 IP 加白 |
| 规则顺序错误 | 使用 `--line-numbers` 检查顺序 |
| 重启后规则丢失或误持久化 | 明确是否需要保存规则 |

回滚：

```bash
iptables -L INPUT -n --line-numbers
iptables -D INPUT <line-number>
```

## 验证方法

```bash
iptables -L INPUT -n --line-numbers
curl -I http://<service-ip>
tail -f /var/log/nginx/access.log
```

确认点：

- 恶意 IP 请求下降。
- 正常用户访问不受影响。
- 监控和健康检查正常。
- 规则可追踪、可删除。

## 相关笔记

- [[Shell_监控_Nginx_高频恶意_IP_自动封禁]]
- [[Shell_自动全网封禁系统]]
- [[Nginx_安装与反向代理配置手册]]
- [[iptables_三表五链_基础]]

