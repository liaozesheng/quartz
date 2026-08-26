---
title: PostgreSQL 索引
tags:
  - PostgreSQL
  - 运维
  - 数据库
category: 索引
status: active
---

# PostgreSQL 索引

这个页面只作为 PostgreSQL 的入口，不做泛数据库索引。MySQL、Kafka、Oracle 等如果后续重新整理，可以单独建各自索引。

## 快速入口

| 场景 | 推荐入口 |
|---|---|
| 安装 PostgreSQL 15 | [[PostgreSQL_15_安装部署手册]] |
| 查询常用命令 | [[PostgreSQL_基础命令速查]] |

## 安装与部署

| 场景 | 标准化笔记 | 重点 |
|---|---|---|
| PostgreSQL 15 安装 | [[PostgreSQL_15_安装部署手册]] | 仓库、安装、初始化、服务管理、验证 |

## 命令速查

| 场景 | 标准化笔记 | 重点 |
|---|---|---|
| PostgreSQL 基础命令 | [[PostgreSQL_基础命令速查]] | psql、库表、用户、权限、备份 |

## 常用命令

```bash
systemctl status postgresql-15
sudo -u postgres psql
psql -U <user> -d <database> -h <host> -p 5432
pg_dump -U <user> -d <database> -f backup.sql
pg_restore -U <user> -d <database> backup.dump
```

## 维护说明

- PostgreSQL 相关内容优先挂到这个索引。
- 命令类内容放入 `07-命令速查`。
- 安装、部署、备份、恢复类内容放入 `09-自动化与部署`。
