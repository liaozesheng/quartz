---
title: Docker 多服务 Web 负载均衡与 HTTPS
tags:
  - Docker
  - Nginx
  - 运维
  - 部署
category: 自动化与部署
status: active
---

# Docker 多服务 Web 负载均衡与 HTTPS

## 目标

在 Docker / Docker Compose 环境中部署多个 Web 服务，通过 Nginx 做反向代理、负载均衡和 HTTPS 终止，形成可维护的生产入口。

## 适用场景

- 多个 Web/API 服务运行在 Docker 中。
- 需要统一域名入口。
- 需要 HTTPS 证书。
- 需要基础负载均衡和反向代理。

## 架构示例

```text
Client
  |
HTTPS
  |
Nginx container
  |
app1 / app2 / app3 containers
```

## Compose 示例

```yaml
services:
  nginx:
    image: nginx:1.25
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - app1
      - app2
    networks:
      - web

  app1:
    image: my-web:latest
    networks:
      - web

  app2:
    image: my-web:latest
    networks:
      - web

networks:
  web:
```

## Nginx upstream 示例

```nginx
upstream web_backend {
    server app1:8080;
    server app2:8080;
}

server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    location / {
        proxy_pass http://web_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 部署前检查

```bash
docker compose config
docker compose up -d
docker compose ps
docker compose logs nginx
```

确认点：

- Nginx 和业务容器在同一个网络。
- upstream 使用服务名，不写容器 IP。
- 证书路径挂载正确。
- 80/443 端口没有被宿主机其他进程占用。

## 验证方法

```bash
docker compose exec nginx nginx -t
curl -I http://example.com
curl -vk https://example.com
docker compose logs -f nginx
```

确认点：

- `nginx -t` 通过。
- HTTP/HTTPS 访问正常。
- 反向代理能打到后端服务。
- 证书域名匹配且未过期。

## 风险与回滚

| 风险 | 处理方式 |
|---|---|
| Nginx 配置错误 | 先 `nginx -t` 再 reload |
| 证书过期 | 设置证书过期提醒 |
| upstream 指向错误 | 使用 compose 服务名并验证 DNS |
| 单个后端异常 | 配置健康检查或临时摘除 |

回滚：

```bash
cp nginx.conf.bak nginx.conf
docker compose exec nginx nginx -t
docker compose exec nginx nginx -s reload
```

## 相关笔记

- [[Docker_基础与常用操作]]
- [[Nginx_安装与反向代理配置手册]]
- [[Shell_蓝绿部署零宕机切换]]

