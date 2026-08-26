---
title: Docker 微服务密钥与缓存优化
tags:
  - Docker
  - 运维
  - 部署
category: 自动化与部署
status: active
---

# Docker 微服务密钥与缓存优化

## 目标

在 Docker / Docker Compose 部署微服务 API 时，规范密钥管理、环境变量注入和缓存使用，降低敏感信息泄露和性能瓶颈风险。

## 适用场景

- 微服务通过 Docker Compose 部署。
- API 服务依赖数据库、Redis、第三方密钥。
- 需要把密钥从镜像和代码中剥离。
- 需要通过缓存降低数据库压力。

## 密钥管理原则

| 原则 | 推荐做法 | 避免做法 |
|---|---|---|
| 密钥不进镜像 | 运行时注入 env 或 secret | 写入 Dockerfile |
| 密钥不进代码 | 使用 `.env` 或外部 secret | 写死在源码 |
| 权限最小化 | 只给服务需要的密钥 | 所有服务共享一套密钥 |
| 分环境隔离 | dev/test/prod 分开 | 多环境复用同一密钥 |

## Compose 示例

```yaml
services:
  api:
    image: my-api:latest
    env_file:
      - .env
    depends_on:
      - redis
    networks:
      - app-net

  redis:
    image: redis:7
    volumes:
      - redis-data:/data
    networks:
      - app-net

volumes:
  redis-data:

networks:
  app-net:
```

## 缓存优化要点

| 场景 | 建议 |
|---|---|
| 热点数据读取频繁 | 使用 Redis 缓存 |
| 缓存穿透 | 对空值短暂缓存，或使用布隆过滤器 |
| 缓存击穿 | 热点 key 加互斥锁或提前刷新 |
| 缓存雪崩 | TTL 加随机抖动 |
| 数据一致性 | 写操作后删除缓存，或延迟双删 |

## 部署前检查

```bash
docker compose config
docker compose ps
docker compose logs api
docker compose exec api env
```

确认点：

- `.env` 不提交到公开仓库。
- API 容器能访问 Redis。
- 数据库和第三方密钥能正常读取。
- 缓存连接失败时有降级策略。

## 风险与回滚

| 风险 | 处理方式 |
|---|---|
| `.env` 泄露 | 加入 `.gitignore`，控制文件权限 |
| 密钥轮换影响服务 | 支持 reload 或滚动重启 |
| Redis 故障拖垮 API | 设置超时和降级 |
| 缓存不一致 | 明确缓存失效策略 |

## 验证方法

```bash
docker compose up -d
docker compose ps
docker compose logs -f api
docker compose exec redis redis-cli ping
```

确认点：

- 服务启动成功。
- Redis 返回 `PONG`。
- API 日志没有密钥或连接错误。
- 关键接口响应时间符合预期。

## 相关笔记

- [[Docker_基础与常用操作]]
- [[Shell_超轻量配置中心]]

