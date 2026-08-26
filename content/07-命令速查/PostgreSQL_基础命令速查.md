---
title: PostgreSQL 基础命令速查
tags:
  - PostgreSQL
  - 数据库
  - 命令速查
category: 命令速查
status: active
---

# PostgreSQL 基础命令速查

## 使用场景

日常连接 PostgreSQL、查看库表、管理用户权限、备份恢复时使用。

## 连接数据库

```bash
sudo -u postgres psql
psql -U <user> -d <database> -h <host> -p 5432
```

## psql 常用元命令

| 场景 | 命令 |
|---|---|
| 查看数据库 | `\l` |
| 连接数据库 | `\c <database>` |
| 查看表 | `\dt` |
| 查看表结构 | `\d <table>` |
| 查看用户/角色 | `\du` |
| 退出 | `\q` |

## 用户与权限

```sql
CREATE USER app_user WITH PASSWORD 'password';
CREATE DATABASE app_db OWNER app_user;
GRANT ALL PRIVILEGES ON DATABASE app_db TO app_user;
```

## 备份与恢复

```bash
pg_dump -U <user> -d <database> -f backup.sql
psql -U <user> -d <database> -f backup.sql
pg_dump -U <user> -d <database> -Fc -f backup.dump
pg_restore -U <user> -d <database> backup.dump
```

## 服务管理

```bash
systemctl status postgresql-15
systemctl reload postgresql-15
systemctl restart postgresql-15
```

## 注意事项

- 生产环境不要直接使用超级用户给应用连接。
- 修改 `pg_hba.conf` 后需要 reload。
- 备份恢复前确认目标库和用户权限。
- 删除库表前先确认备份。

## 相关笔记

- [[PostgreSQL_15_安装部署手册]]
- [[PostgreSQL_索引]]

