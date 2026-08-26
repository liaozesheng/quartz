---
title: Docker Compose 部署 MySQL 8 单机版
tags:
  - MySQL
  - Docker
  - 部署
category: 自动化与部署
status: active
source_url: https://www.cnblogs.com/zhujinchong/p/19380689
---

# Docker Compose 部署 MySQL 8 单机版

## 目标

使用 Docker Compose 部署单机 MySQL 8.0.18，将数据、日志和配置持久化到宿主机，并完成基础连接验证。

## 适用场景

- 开发、测试或个人服务环境。
- 需要快速搭建单机 MySQL。
- 已安装 Docker Engine 和 Docker Compose 插件。

> [!warning]
> 单机部署不具备高可用能力。生产环境还需要补充备份、监控、容量规划和故障恢复方案。

## 环境与目录

本文使用以下示例：

| 项目 | 示例值 |
|---|---|
| MySQL 镜像 | `mysql:8.0.18` |
| 容器名称 | `mysql8` |
| 工作目录 | `/home/docker/mysql8` |
| 本机访问端口 | `127.0.0.1:3306` |

创建持久化目录：

```bash
sudo mkdir -p /home/docker/mysql8/{log,data,conf.d}
cd /home/docker/mysql8
```

确认磁盘空间和端口占用：

```bash
df -h /home/docker/mysql8
ss -lntp | grep ':3306' || true
docker version
docker compose version
```

## 配置 MySQL

创建 `/home/docker/mysql8/conf.d/my.cnf`：

```ini
[client]
default-character-set=utf8mb4

[mysql]
default-character-set=utf8mb4

[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_0900_ai_ci
default-time-zone='+08:00'
max_allowed_packet=64M
```

> [!note]
> 不要为了兼容旧客户端直接修改认证插件或 SQL 模式。确有兼容需求时，应先确认客户端版本和影响范围，再单独记录变更原因。

## 配置密码

创建 `/home/docker/mysql8/.env`：

```dotenv
MYSQL_ROOT_PASSWORD=请替换为高强度密码
```

限制文件权限：

```bash
chmod 600 /home/docker/mysql8/.env
```

不要把 `.env` 提交到 Git，也不要在共享文档中保存真实密码。

## 编写 Compose 文件

创建 `/home/docker/mysql8/compose.yaml`：

```yaml
services:
  mysql:
    image: mysql:8.0.18
    container_name: mysql8
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./log:/var/log/mysql
      - ./data:/var/lib/mysql
      - ./conf.d:/etc/mysql/conf.d:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "127.0.0.1:3306:3306"
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h 127.0.0.1 -uroot -p$${MYSQL_ROOT_PASSWORD} --silent"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s
```

先检查 Compose 配置，再启动服务：

```bash
docker compose config --quiet
docker compose pull
docker compose up -d
```

## 验证方法

查看容器状态和启动日志：

```bash
docker compose ps
docker compose logs --tail=100 mysql
docker inspect --format='{{.State.Health.Status}}' mysql8
```

进入 MySQL 客户端：

```bash
docker exec -it mysql8 mysql -uroot -p
```

输入 `.env` 中配置的密码，然后执行：

```sql
SELECT VERSION();
SHOW DATABASES;
CREATE DATABASE test CHARACTER SET utf8mb4;
USE test;
SHOW TABLES;
DROP DATABASE test;
```

确认点：

- 容器状态为 `running`，健康状态最终变为 `healthy`。
- MySQL 版本符合预期。
- 测试库可以正常创建和删除。
- 重启容器后数据目录仍然存在。

## 远程访问

默认只监听宿主机 `127.0.0.1:3306`，避免数据库直接暴露到外网。

确需远程访问时：

1. 将端口映射改为受控网卡地址，而不是直接暴露全部网络接口。
2. 在防火墙或安全组中只允许指定来源 IP。
3. 创建权限受限的业务账号，不使用 `root` 远程连接。
4. 验证连通性后保留访问控制记录。

> [!danger]
> 不要通过停止或永久关闭防火墙解决连接问题。应检查端口映射、监听地址、防火墙规则和云安全组。

## 备份

升级、迁移或重建容器前，先导出数据库：

```bash
cd /home/docker/mysql8
docker exec mysql8 sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --all-databases --single-transaction' > mysql-all.sql
test -s mysql-all.sql && ls -lh mysql-all.sql
```

备份完成后，应将文件复制到独立存储，并实际验证恢复流程。

## 停止与回滚

停止服务但保留宿主机数据：

```bash
cd /home/docker/mysql8
docker compose down
```

重新启动：

```bash
docker compose up -d
```

需要回退镜像版本时：

1. 先完成数据库备份。
2. 修改 `compose.yaml` 中的镜像标签。
3. 阅读目标版本的升级和降级限制。
4. 在测试环境验证后再操作正式数据。

> [!danger]
> 不要直接删除 `/home/docker/mysql8/data`。该目录保存数据库实际数据，删除前必须确认备份可恢复。

## 常见问题

| 问题 | 排查方向 | 常用命令 |
|---|---|---|
| 容器反复重启 | 配置语法、目录权限、数据目录兼容性 | `docker compose logs mysql` |
| 3306 无法访问 | 端口映射、监听地址、防火墙和安全组 | `ss -lntp \| grep 3306` |
| 健康检查失败 | 密码、初始化状态、MySQL 启动日志 | `docker inspect mysql8` |
| 配置未生效 | 挂载路径、文件后缀、配置项支持情况 | `docker exec mysql8 my_print_defaults mysqld` |
| 数据未持久化 | 宿主机目录和 Compose 挂载 | `docker inspect mysql8` |

## 相关笔记

- [[Docker_生产实践索引]]
- [[Docker_基础与常用操作]]
- [[Shell_MySQL_高可用守护进程]]
- [[技术栈索引]]
