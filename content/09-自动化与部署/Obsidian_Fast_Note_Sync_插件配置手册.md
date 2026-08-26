---
title: Obsidian Fast Note Sync 插件配置手册
tags:
  - Obsidian
  - 运维
  - 部署
category: 自动化与部署
source_url: https://cnb.cool/haierkeys/fast-note-sync-service
status: active
---

# Obsidian Fast Note Sync 插件配置手册

## 目标

部署 Fast Note Sync Service 服务端，并将 Obsidian Fast Note Sync 插件连接到该服务，实现笔记、附件和部分配置的多端同步。

这篇笔记只保留日常部署、配置和排查会用到的信息。完整项目说明可回到项目仓库查看。

## 适用场景

- 需要自建 Obsidian 笔记同步服务。
- 需要通过 Web 面板管理 Vault、用户和 API 配置。
- 需要让 Obsidian 插件连接远端同步服务。
- 需要通过 REST API 或 MCP 客户端访问笔记库。

## 核心能力

| 能力 | 说明 |
|---|---|
| 多端同步 | 支持 Obsidian 客户端之间同步笔记、目录和附件 |
| Web 管理面板 | 用于创建用户、管理 Vault、复制插件 API 配置 |
| 附件同步 | 支持图片等非 Markdown 文件同步 |
| 配置同步 | 可同步 `.obsidian` 配置，适合多端保持一致 |
| 历史版本 | 可在 Web 页面或插件端查看笔记历史版本 |
| REST API | 可通过脚本或自动化工具访问笔记内容 |
| MCP 接入 | 可作为 MCP 服务端接入支持 MCP 的 AI 客户端 |

## 部署方式

### 一键脚本

适合首次快速部署，脚本会自动检测系统环境并注册服务。

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/haierkeys/fast-note-sync-service/master/scripts/quest_install.sh)
```

如果 GitHub 访问不稳定，可以使用 CNB 镜像源：

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/haierkeys/fast-note-sync-service/master/scripts/quest_install.sh) --cnb
```

默认安装目录：

```text
/opt/fast-note
```

全局管理命令：

```bash
fns
```

### Docker Run

适合单机部署，数据目录显式挂载到宿主机。

```bash
docker pull haierkeys/fast-note-sync-service:latest

docker run -tid --name fast-note-sync-service \
  -p 9000:9000 \
  -v /data/fast-note-sync/storage/:/fast-note-sync/storage/ \
  -v /data/fast-note-sync/config/:/fast-note-sync/config/ \
  haierkeys/fast-note-sync-service:latest
```

### Docker Compose

适合后续长期维护，推荐把 Compose 文件和数据目录一起纳入运维管理。

```yaml
services:
  fast-note-sync-service:
    image: haierkeys/fast-note-sync-service:latest
    container_name: fast-note-sync-service
    restart: unless-stopped
    ports:
      - "9000:9000"
    volumes:
      - ./storage:/fast-note-sync/storage
      - ./config:/fast-note-sync/config
```

启动服务：

```bash
docker compose up -d
```

## 初始化配置

1. 浏览器访问管理面板。

```text
http://<server-ip>:9000
```

2. 创建管理员用户。
3. 创建或导入 Vault。
4. 在 Web 管理面板中复制 API 配置。
5. 打开 Obsidian 的 Fast Note Sync 插件设置页。
6. 粘贴 API 配置并保存。
7. 执行一次同步，确认笔记和附件可以正常上传或拉取。

> [!warning]
> 初始化完成后，建议关闭公开注册能力，只保留管理员可控的用户创建流程。

## 配置文件

服务会自动查找以下配置文件：

```text
config.yaml
config/config.yaml
```

常见配置项建议：

| 配置项 | 建议 |
|---|---|
| 服务端口 | 默认使用 `9000`，反代后只暴露 HTTPS 域名 |
| 注册开关 | 初始化完成后关闭公开注册 |
| 数据库 | 个人使用可先用 SQLite，团队或长期服务再考虑 MySQL/PostgreSQL |
| 存储目录 | 必须挂载到宿主机并纳入备份 |
| API Token | 不写入公开笔记、截图和代码仓库 |
| 附件上传 | 根据实际附件大小调整分片和限制 |

## MCP 接入

Fast Note Sync Service 可以作为 MCP 服务端，让支持 MCP 的客户端读写 Obsidian 笔记。

### StreamableHTTP 模式

推荐新客户端使用。

```text
http://<server-ip>:<port>/api/mcp
```

示例配置：

```json
{
  "mcpServers": {
    "fast-note-sync": {
      "url": "http://<ServerIP>:<Port>/api/mcp",
      "headers": {
        "Authorization": "Bearer <Token>",
        "X-Default-Vault-Name": "<VaultName>",
        "X-Client": "<ClientType>",
        "X-Client-Version": "<ClientVersion>",
        "X-Client-Name": "<ClientName>"
      }
    }
  }
}
```

### SSE 模式

适合只支持 SSE 的旧版 MCP 客户端。

```text
http://<server-ip>:<port>/api/mcp/sse
```

示例配置：

```json
{
  "mcpServers": {
    "fast-note-sync": {
      "url": "http://<ServerIP>:<Port>/api/mcp/sse",
      "headers": {
        "Authorization": "Bearer <Token>",
        "X-Default-Vault-Name": "<VaultName>",
        "X-Client": "<ClientType>",
        "X-Client-Version": "<ClientVersion>",
        "X-Client-Name": "<ClientName>"
      }
    }
  }
}
```

## Nginx 反向代理

生产环境建议用 HTTPS 域名访问，不直接暴露裸 HTTP 端口。

```nginx
server {
    listen 443 ssl http2;
    server_name notes.example.com;

    location / {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 验证方法

确认容器运行：

```bash
docker compose ps
```

查看服务日志：

```bash
docker compose logs -f fast-note-sync-service
```

确认 Web 面板可访问：

```bash
curl -I http://127.0.0.1:9000
```

确认 Obsidian 插件连接：

- 插件设置中 API 地址、Token、Vault 名称一致。
- 新建测试笔记后执行同步。
- 在 Web 面板中确认测试笔记出现。
- 另一台设备登录同一 Vault 后确认可拉取。

## 风险与回滚

| 风险 | 处理方式 |
|---|---|
| API Token 泄露 | 立即在 Web 面板重新生成或替换 Token |
| 注册入口暴露 | 初始化后关闭公开注册，并限制管理入口访问来源 |
| 数据目录未挂载 | 停止服务，修正 volume，再从备份恢复 |
| 未启用 HTTPS | 使用 Nginx/Caddy 反代并配置证书 |
| 插件配置错误 | 从 Web 面板重新复制 API 配置并覆盖插件设置 |
| 升级失败 | 保留旧镜像版本和 `storage`、`config` 目录备份后再升级 |

## 相关笔记

- [[技术栈索引]]
- [[Docker_基础与常用操作]]
- [[Docker_多服务_Web_负载均衡与_HTTPS]]
- [[Nginx_安装与反向代理配置手册]]
