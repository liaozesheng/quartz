---
title: Xray VLESS XTLS Trojan 代理节点部署手册
tags:
  - 运维
  - 部署
  - 网络
category: 自动化与部署
source_note: 节点搭建教程.md（原文已删除）
status: active
---

# Xray VLESS XTLS Trojan 代理节点部署手册

## 目标

部署一个基于 Xray 的代理节点，使用 VLESS + XTLS 监听 443 端口，并配置 Trojan 和 Nginx fallback，用于在非代理请求到达时返回正常 Web 页面。

> [!warning]
> 仅用于个人合规网络访问和技术学习。部署前请确认服务器所在地、使用地和服务商条款允许相关用途。

## 架构

```text
Client
  |
  | 443 / VLESS + XTLS
  v
Xray
  |
  | fallback
  v
Trojan on 127.0.0.1:38388
  |
  | fallback
  v
Nginx on 127.0.0.1:80
  |
  v
正常 Web 页面
```

## 适用场景

- 单节点代理服务部署。
- 需要 TLS 证书和 443 入口。
- 需要 fallback 到正常 Web 服务。
- 需要 Nginx 提供普通 HTTP 页面。

## 参数规划

| 参数 | 示例 | 说明 |
|---|---|---|
| 域名 | `example.com` | 解析到服务器公网 IP |
| VLESS UUID | `<uuid>` | 使用 `xray uuid` 或其他工具生成 |
| Trojan 密码 | `<trojan-password>` | 不要使用弱密码 |
| Xray 配置 | `/usr/local/etc/xray/config.json` | 主配置文件 |
| TLS 证书 | `/usr/local/etc/xray/server.crt` | fullchain |
| TLS 私钥 | `/usr/local/etc/xray/server.key` | private key |
| Nginx 端口 | `80` | fallback 页面 |
| SSH 端口 | `22` | 管理入口 |

## 部署前检查

```bash
hostname -I
ss -lntp
ufw status
systemctl status nginx
systemctl status xray
```

确认点：

- 域名已解析到服务器。
- 443、80、22 端口策略清楚。
- 80 端口可用于申请证书或 Nginx fallback。
- 没有其他进程占用 443。

## 安装 Xray

```bash
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install -u root
```

配置文件路径：

```bash
vim /usr/local/etc/xray/config.json
```

生成 UUID：

```bash
xray uuid
```

## 申请 TLS 证书

安装 acme.sh：

```bash
curl https://get.acme.sh | sh
apt install -y socat
ln -s /root/.acme.sh/acme.sh /usr/local/bin/acme.sh
acme.sh --set-default-ca --server letsencrypt
```

申请证书：

```bash
acme.sh --issue -d example.com --standalone -k ec-256
```

安装证书：

```bash
acme.sh --installcert -d example.com --ecc \
  --key-file /usr/local/etc/xray/server.key \
  --fullchain-file /usr/local/etc/xray/server.crt
```

## Xray 配置示例

把 `<uuid>`、`<trojan-password>` 和证书路径替换成实际值。

```json
{
  "log": {
    "loglevel": "warning"
  },
  "inbounds": [
    {
      "port": 443,
      "protocol": "vless",
      "settings": {
        "clients": [
          {
            "id": "<uuid>",
            "flow": "xtls-rprx-direct"
          }
        ],
        "decryption": "none",
        "fallbacks": [
          {
            "dest": 38388
          }
        ]
      },
      "streamSettings": {
        "network": "tcp",
        "security": "xtls",
        "xtlsSettings": {
          "alpn": [
            "http/1.1"
          ],
          "certificates": [
            {
              "certificateFile": "/usr/local/etc/xray/server.crt",
              "keyFile": "/usr/local/etc/xray/server.key"
            }
          ]
        }
      }
    },
    {
      "port": 38388,
      "listen": "127.0.0.1",
      "protocol": "trojan",
      "settings": {
        "clients": [
          {
            "password": "<trojan-password>"
          }
        ],
        "fallbacks": [
          {
            "dest": "80"
          }
        ]
      },
      "streamSettings": {
        "network": "tcp",
        "security": "none"
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom"
    }
  ]
}
```

## 安装和配置 Nginx

```bash
apt install -y nginx
systemctl enable --now nginx
```

Nginx 用于监听 80 端口并返回正常页面，也可以反向代理到一个普通站点或静态页面。

验证：

```bash
nginx -t
systemctl reload nginx
curl -I http://127.0.0.1
```

## 防火墙

至少确认以下端口策略：

| 端口 | 用途 |
|---|---|
| `22` | SSH 管理 |
| `80` | Nginx fallback / 证书申请 |
| `443` | Xray VLESS + XTLS |

示例：

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw status
```

## 启动和验证

```bash
xray run -test -config /usr/local/etc/xray/config.json
systemctl restart xray
systemctl status xray
ss -lntp | grep -E ':80|:443|:38388'
```

确认点：

- Xray 配置测试通过。
- 443 正常监听。
- Trojan fallback 只监听 `127.0.0.1:38388`。
- Nginx 80 端口可访问。
- 客户端连接正常。

## 风险与回滚

| 风险 | 处理方式 |
|---|---|
| 证书申请失败 | 检查域名解析、80 端口占用、防火墙 |
| Xray 配置错误 | 先执行 `xray run -test` |
| 443 端口冲突 | 用 `ss -lntp` 查占用 |
| 敏感配置泄露 | UUID、密码、私钥不写入公开仓库 |
| 服务不可用 | 回滚 `config.json` 并重启 xray |

回滚示例：

```bash
cp /usr/local/etc/xray/config.json.bak /usr/local/etc/xray/config.json
xray run -test -config /usr/local/etc/xray/config.json
systemctl restart xray
```

## 相关笔记

- [[技术栈索引]]
- [[Nginx_安装与反向代理配置手册]]
- [[Docker_多服务_Web_负载均衡与_HTTPS]]
