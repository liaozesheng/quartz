---
title: Docker 基础与常用操作
tags:
  - Docker
  - 运维
  - 命令速查
category: 自动化与部署
status: active
---

# Docker 基础与常用操作

## 目标

整理 Docker 日常运维中最常用的镜像、容器、日志、网络、卷和清理命令，作为 Docker 排障和生产操作入口。

## 适用场景

- 查看容器运行状态。
- 排查容器启动失败。
- 查看镜像、日志、端口和资源占用。
- 清理未使用镜像、容器和缓存。
- 快速理解 Docker 基础操作链路。

## 容器状态

```bash
docker ps
docker ps -a
docker inspect <container-name>
docker stats
```

重点看：

- 容器是否 Running。
- 端口映射是否正确。
- 挂载目录是否正确。
- 内存和 CPU 是否异常。

## 日志与进入容器

```bash
docker logs <container-name>
docker logs -f <container-name>
docker logs --tail 100 <container-name>
docker exec -it <container-name> sh
docker exec -it <container-name> bash
```

## 镜像操作

```bash
docker images
docker pull <image>
docker build -t <image>:<tag> .
docker rmi <image-id>
```

## 网络与端口

```bash
docker network ls
docker network inspect <network-name>
docker port <container-name>
```

排查访问失败时，优先确认：

- 容器是否监听正确端口。
- `docker run -p` 或 compose ports 是否正确。
- 容器是否加入正确网络。
- 上游 Nginx 或网关是否指向正确地址。

## 卷与挂载

```bash
docker volume ls
docker volume inspect <volume-name>
docker inspect <container-name> | grep -A 20 Mounts
```

## 清理命令

查看空间占用：

```bash
docker system df
```

清理停止容器、无用网络、悬空镜像和 build cache：

```bash
docker system prune
```

清理所有未被容器使用的镜像：

```bash
docker system prune -a
```

> [!warning]
> `docker system prune -a` 会删除所有未被容器使用的镜像。生产环境执行前，要确认这些镜像不需要用于快速回滚。

## 验证方法

```bash
docker ps -a
docker logs --tail 100 <container-name>
docker stats
docker system df
```

确认点：

- 容器状态符合预期。
- 日志没有持续错误。
- 资源占用正常。
- 清理后关键镜像和容器仍在。

## 相关笔记

- [[containerd_占用磁盘空间过大]]
- [[Docker_微服务密钥与缓存优化]]
- [[Docker_多服务_Web_负载均衡与_HTTPS]]

