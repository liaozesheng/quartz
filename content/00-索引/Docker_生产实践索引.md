---
title: Docker 生产实践索引
tags:
  - Docker
  - 运维
  - 排障手册
category: 索引
status: active
---

# Docker 生产实践索引

这个页面按生产使用场景组织 Docker 笔记。优先阅读标准化手册。

## 快速入口

| 场景 | 适合先看 |
|---|---|
| Docker 日常操作和排障 | [[Docker_基础与常用操作]] |
| 镜像、容器、containerd 占用磁盘过大 | [[containerd_占用磁盘空间过大]] |
| 微服务密钥和缓存 | [[Docker_微服务密钥与缓存优化]] |
| 多服务 Web、Nginx、HTTPS | [[Docker_多服务_Web_负载均衡与_HTTPS]], [[Nginx_安装与反向代理配置手册]] |
| 容器服务守护和自愈 | [[Shell_核心服务进程自愈守护]], [[Shell_进程守护增强版]] |
| 核心业务内存保护 | [[Shell_核心业务_OOM_保护]] |

## 基础与运维

| 场景 | 标准化笔记 | 常用命令 | 重点 |
|---|---|---|---|
| Docker 基础与常用操作 | [[Docker_基础与常用操作]] | `docker ps`, `docker logs`, `docker inspect` | 容器、镜像、日志、网络、清理 |
| Docker/containerd 占用磁盘空间过大 | [[containerd_占用磁盘空间过大]] | `docker system df`, `docker system prune -a` | 镜像、容器、overlayfs、磁盘 |

## 微服务与缓存

| 场景 | 标准化笔记 | 常用工具 | 重点 |
|---|---|---|---|
| 微服务 API 密钥与缓存优化 | [[Docker_微服务密钥与缓存优化]] | `docker compose`, `.env`, `redis` | Secret、缓存、微服务 |

## Web 入口与 HTTPS

| 场景 | 标准化笔记 | 常用工具 | 重点 |
|---|---|---|---|
| 多服务 Web 负载均衡与 HTTPS | [[Docker_多服务_Web_负载均衡与_HTTPS]] | `docker compose`, `nginx` | 负载均衡、HTTPS、反向代理 |

## 相关 Shell 手册

| 场景 | 笔记 | 说明 |
|---|---|---|
| 容器服务需要进程守护 | [[Shell_核心服务进程自愈守护]] | 服务异常退出或健康检查失败时自动恢复 |
| 进程守护增强 | [[Shell_进程守护增强版]] | 增加 healthcheck、flock 和重启限制 |
| 核心业务避免 OOM | [[Shell_核心业务_OOM_保护]] | 使用 systemd 和 OOMScoreAdjust 降低核心进程被杀风险 |
| 蓝绿部署 | [[Shell_蓝绿部署零宕机切换]] | 通过健康检查和 Nginx 切换流量 |

## 常用命令

```bash
docker ps -a
docker images
docker logs <container-name>
docker inspect <container-name>
docker stats
docker system df
docker system prune
docker system prune -a
docker compose ps
docker compose logs -f
docker network ls
docker volume ls
```

> [!warning]
> `docker system prune -a` 会删除所有未被容器使用的镜像。生产环境执行前，要确认这些镜像不需要用于快速回滚。

## 维护说明

- 新增 Docker 笔记时，优先按 [[部署手册模板]] 或 [[排障复盘模板]] 写成标准化手册。
- 涉及容器运行时磁盘问题时，优先链接 [[containerd_占用磁盘空间过大]]。
