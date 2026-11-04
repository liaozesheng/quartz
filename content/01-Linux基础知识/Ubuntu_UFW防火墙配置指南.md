---
title: Ubuntu UFW 防火墙配置指南
tags:
  - Linux
  - 命令速查
category: 专题教程
status: active
source_url: https://www.cnblogs.com/yzking/p/ubuntu-ufw-1.html
created: 2026-11-04
---

# Ubuntu UFW 防火墙配置指南

UFW（Uncomplicated Firewall）是 Ubuntu 默认的防火墙前端，底层仍然是 iptables/nftables。它的默认策略是**拒绝所有入站、允许所有出站**，适合快速配置主机防火墙。

> 适用：Ubuntu 20.04/22.04/24.04。云服务器还要同时检查云厂商的安全组。

## 1. 安装与版本

```bash
sudo apt update
sudo apt install ufw
ufw version

# 查看系统版本
cat /etc/issue
lsb_release -a
```

Ubuntu 通常预装 UFW，未安装时再执行上面的安装命令。

## 2. 状态与启停

```bash
sudo ufw status
sudo ufw status verbose
sudo ufw status numbered

sudo ufw enable
sudo ufw disable
sudo ufw reload
```

- `enable` 会立即启用并写入开机自启；如果当前 SSH 会话没有放行 SSH 端口，会立刻断连。
- `disable` 只是停用，规则仍然保留。
- `reload` 用于重新加载规则文件，修改 `/etc/ufw/*.rules` 后使用。
- `status verbose` 会显示默认策略和日志级别。

## 3. 默认策略

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 可选：禁止转发（不是路由器时建议）
sudo ufw default deny routed
```

默认策略定义在 `/etc/default/ufw`，但建议用命令修改，避免手写出错。

## 4. 放行与拒绝

### 按端口

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

sudo ufw allow 53/tcp
sudo ufw allow 53/udp

sudo ufw deny 25/tcp
```

不写协议时 UFW 会同时处理 TCP/UDP，建议明确写 `/tcp` 或 `/udp`。

### 按服务名

服务名来自 `/etc/services`：

```bash
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow smtp
```

### 按应用配置

安装 Nginx、OpenSSH 等软件后，`/etc/ufw/applications.d/` 会提供应用配置：

```bash
sudo ufw app list
sudo ufw app info OpenSSH
sudo ufw app info 'Nginx Full'

sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
```

### 端口范围

必须指定协议：

```bash
sudo ufw allow 8000:8100/tcp
sudo ufw allow 8000:8100/udp
```

### 按来源 IP / 子网

```bash
# 允许该 IP 访问所有端口
sudo ufw allow from 192.168.1.100

# 只允许该 IP 访问 22 端口
sudo ufw allow from 192.168.1.100 to any port 22 proto tcp

# 允许整个子网访问 MySQL
sudo ufw allow from 192.168.71.0/24 to any port 3306 proto tcp

# 拒绝某个网段
sudo ufw deny from 203.0.113.0/24

# 拒绝某个 IP 访问 80 端口
sudo ufw deny from 203.0.113.50 to any port 80
```

### 按网卡

```bash
sudo ufw allow in on eth0 to any port 3306 proto tcp
```

### 限制暴力破解

```bash
sudo ufw limit ssh
```

同一 IP 在短时间内多次连接会被限速，适合暴露在公网的 SSH。

## 5. 查看与删除规则

```bash
sudo ufw status numbered
```

按编号删除：

```bash
sudo ufw delete 2
```

删除后会重新编号，建议从大编号往小删，或者删完重新 `status numbered`。

按规则内容删除：

```bash
sudo ufw delete allow 80/tcp
sudo ufw delete allow from 192.168.1.100
```

查看当前规则对应的原始命令：

```bash
sudo ufw show added
```

## 6. 日志

```bash
sudo ufw logging on
sudo ufw logging low
sudo ufw logging medium
sudo ufw logging high
sudo ufw logging full
sudo ufw logging off
```

日志默认在 `/var/log/ufw.log`，也可以看 `journalctl -k | grep UFW`。

## 7. 常用场景

### 先放行 SSH，再启用

```bash
sudo ufw allow OpenSSH
sudo ufw enable
```

如果 SSH 改过端口，例如 5522：

```bash
sudo ufw allow 5522/tcp
sudo ufw enable
```

### Web 服务器

```bash
sudo ufw allow 'Nginx Full'   # 80 + 443

# 或者
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 只允许内网访问数据库

```bash
sudo ufw allow from 192.168.71.0/24 to any port 3306 proto tcp
```

### 只允许固定 IP 访问 SSH

```bash
sudo ufw allow from 203.0.113.10 to any port 22 proto tcp
```

## 8. 重要注意事项

1. **先放行 SSH 再 enable**：远程服务器上顺序反了会把自己锁在门外。云主机可以通过 VNC/控制台登录后执行 `sudo ufw disable`。
2. **Docker 会绕过 UFW**：Docker 发布端口时会直接写 iptables NAT 规则，UFW 的 deny 不一定生效。需要额外用 `ufw-docker`，或在 Compose 中把端口绑定到 `127.0.0.1`。检查：

   ```bash
   sudo iptables -t nat -L DOCKER -n
   ```

3. **云安全组是另一层**：UFW 只管主机内部；阿里云/腾讯云/华为云的安全组还要放行对应端口。
4. **IPv6**：`/etc/default/ufw` 中 `IPV6=yes` 时，UFW 会自动生成 v6 规则，`status` 中显示 `(v6)`。
5. **规则顺序**：UFW 按顺序匹配，`status numbered` 的顺序就是生效顺序；需要插到前面时用 `sudo ufw insert 1 ...`。
6. **不要直接编辑 `/var/lib/ufw/user.rules`**：优先用 `ufw` 命令；手工修改后执行 `sudo ufw reload`。
7. **默认策略不等于删除现有规则**：`ufw default deny incoming` 只影响没有匹配规则的新连接；已有的 allow 规则仍然有效。
8. **重置**：`sudo ufw reset` 会停用防火墙并删除所有规则，恢复到安装时状态，执行前确认。

## 9. 相关文件

| 路径 | 用途 |
|---|---|
| `/etc/default/ufw` | 默认策略、IPv6 开关 |
| `/etc/ufw/before.rules` | 自定义前置规则 |
| `/etc/ufw/after.rules` | 自定义后置规则 |
| `/etc/ufw/sysctl.conf` | UFW 启用时的内核参数 |
| `/var/lib/ufw/user.rules` | 用户规则（由 ufw 命令维护） |
| `/var/log/ufw.log` | UFW 日志 |

## 10. 相关笔记

- [[iptables_三表五链_基础]]
- [[NetworkManager]]
- [[systemd管理服务]]
- [[Linux_目录体系]]
- [[Tailscale_日常使用与子网路由排障]]

## 参考

- 原文：<https://www.cnblogs.com/yzking/p/ubuntu-ufw-1.html>
- 本文按 Ubuntu 22.04/24.04 的实际命令整理，修正了原文中部分过时或错误的示例。
