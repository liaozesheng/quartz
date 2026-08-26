---
title: iptables 基础：三表五链与常用命令
tags:
  - Linux
  - iptables
  - 命令速查
category: 命令速查
source_url: https://blog.51cto.com/u_16099231/12593673
status: active
---

# iptables 基础：三表五链与常用命令

> iptables 是 Linux 内核的数据包过滤/防火墙工具，通过**表(table)**与**链(chain)**组织规则。这里整理四表五链、常用选项、动作与常用模块。

## 四表五链

**表**（按功能划分）：

| 表 | 功能 |
|---|---|
| `filter` | 过滤（默认表，主机防火墙） |
| `nat` | 网络地址转换（NAT） |
| `mangle` | 修改数据包内容（如 TTL） |
| `raw` | 数据包跟踪（跳过 conntrack） |

> 常见「三表」指 filter / nat / mangle；「四表」把 `raw` 也计入。

**链**（按数据包流向）：

| 链 | 位置 |
|---|---|
| `PREROUTING` | 路由前（包刚进入主机） |
| `INPUT` | 进入本机用户空间 |
| `OUTPUT` | 从本机用户空间出去 |
| `FORWARD` | 经过本机转发（非本机） |
| `POSTROUTING` | 路由后（包离开前） |

**数据流**：

```text
流入本机：A --> PREROUTING --> INPUT --> B
流出本机：A --> OUTPUT --> POSTROUTING --> B
经过本机：A --> PREROUTING --> FORWARD --> POSTROUTING --> B
```

**各表可用的链**：

| 表 | 可用链 |
|---|---|
| `filter` | INPUT FORWARD OUTPUT |
| `nat` | PREROUTING INPUT OUTPUT POSTROUTING |
| `raw` | PREROUTING OUTPUT |
| `mangle` | PREROUTING INPUT FORWARD OUTPUT POSTROUTING |

## 语法与常用选项

格式：`iptables -t 表名 选项 链名称 条件 动作`

| 选项 | 说明 |
|---|---|
| `-t` | 指定表（默认 `filter`） |
| `-L` | 列出规则；配 `-v` 显示包与大小、`-n` 不反解地址、`--line-numbers` 显示行号 |
| `-A` | 追加一条规则到链尾 |
| `-I` | 插入一条规则到顶部 |
| `-D` | 删除规则；`-S` 列出所有规则 |
| `-R` | 修改规则 |
| `-F` | 清空规则；`-Z` 清空计数器 |
| `-N` | 创建自定义链；`-X` 删除自定义链 |
| `-P` | 指定链的默认策略 |

## 动作（-j）

| 动作 | 说明 |
|---|---|
| `ACCEPT` | 放行，不再比对其他规则 |
| `REJECT` | 拒绝，并通知对方 |
| `DROP` | 丢弃，不通知对方 |
| `REDIRECT` | 将包导入另一个端口 |

## 匹配条件

| 参数 | 说明 |
|---|---|
| `-s` / `-d` | 源地址 / 目标地址 |
| `--sport` / `--dport` | 源端口 / 目标端口 |
| `-p` | 协议（`tcp` / `udp` / `icmp`） |
| `-i` / `-o` | 进来的网卡 / 出去的网卡 |
| `-m` | 指定模块；`-j` 转发动作 |

## 常用模块（-m）

| 模块 | 用途 | 关键参数 |
|---|---|---|
| `multiport` | 连续匹配多端口 | `--dports 22,80,443,30000:50000`（逗号分隔，连续段用冒号） |
| `iprange` | 连续 IP 范围 | `--src-range from-to`、`--dst-range from-to` |
| `string` | 匹配字符串 | `--string pattern`、`--algo bm / kmp` |
| `time` | 按时间匹配 | `--timestart`、`--timestop`、`--monthdays`、`--weekdays` |
| `icmp` | 禁 ping | `--icmp-type echo-request(8)` / `echo-reply(0)` |
| `connlimit` | 限制并发连接 | `--connlimit-upto n`、`--connlimit-above n` |
| `limit` | 限制报速率 | `--limit rate[/second /minute /hour /day]`、`--limit-burst number`（默认 5） |

## 案例

1. **只允许 22 端口，其余拒绝**

```bash
iptables -t filter -A INPUT -p TCP --dport 22 -j ACCEPT
iptables -t filter -A INPUT -p TCP -j DROP
```

2. **只允许 192.168.15.71 通过 22 端口**

```bash
iptables -t filter -A INPUT -p TCP -s 192.168.15.71 -d 192.168.15.81 --dport 22 -j ACCEPT
iptables -t filter -A INPUT -p TCP -j DROP
```

3. **让 192.168.15.71 对外不可见**

```bash
iptables -t filter -A INPUT -p TCP -d 192.168.15.71 -j DROP
```

4. **暴露 22,80,443 及 30000-50000，其余拒绝（multiport）**

```bash
iptables -t filter -A INPUT -p TCP -m multiport --dports 22,80,443,30000:50000 -j ACCEPT
iptables -t filter -A INPUT -p TCP -j DROP
```

5. **拦截包含 `HelloWorld` 的包（string）**

```bash
iptables -t filter -A INPUT -p TCP -m string --string "HelloWorld" --algo kmp -j DROP
```

6. **限制速率约 300/s（limit）**

```bash
iptables -t filter -A OUTPUT -p TCP -m limit --limit 300/s -j ACCEPT
iptables -t filter -A OUTPUT -p TCP -j DROP
```

> [!warning]
> iptables 规则**即时生效**，写错可能直接断网。修改前先用 `iptables -L -n --line-numbers` 查看现状，建议先备份规则（`iptables-save > /etc/iptables.rules`），再操作。

## 相关笔记

- [[Shell_iptables_四维精准限流]]
- [[Shell_监控_Nginx_高频恶意_IP_自动封禁]]
- [[Shell_自动全网封禁系统]]
