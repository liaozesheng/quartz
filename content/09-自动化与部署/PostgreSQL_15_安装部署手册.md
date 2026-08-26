---
title: PostgreSQL 15 安装部署手册
tags:
  - PostgreSQL
  - 运维
  - 部署
category: 自动化与部署
status: active
---

# PostgreSQL 15 安装部署手册

## 目标

安装 PostgreSQL 15，完成初始化、服务管理、基础连接验证，并为后续数据库运维建立标准入口。

## 适用场景

- 新服务器安装 PostgreSQL 15。
- 搭建测试或生产数据库实例。
- 需要记录安装、启动、验证、回滚路径。

## 部署前检查

```bash
cat /etc/os-release
df -h
free -h
hostname -I
```

## 安装步骤

```bash
sudo yum install -y postgresql15 postgresql15-server
sudo /usr/pgsql-15/bin/postgresql-15-setup initdb
sudo systemctl enable --now postgresql-15
sudo systemctl status postgresql-15
```

## 基础验证

```bash
sudo -u postgres psql
```

进入 psql 后：

```sql
SELECT version();
\l
\du
```

## 常用配置

常见配置文件：

```text
postgresql.conf
pg_hba.conf
```

调整监听地址或访问规则后：

```bash
sudo systemctl reload postgresql-15
sudo systemctl restart postgresql-15
```

## 风险与回滚

| 风险 | 处理方式 |
|---|---|
| 数据目录初始化错误 | 安装前确认数据目录 |
| 远程连接暴露风险 | 限制 `listen_addresses` 和 `pg_hba.conf` |
| 配置修改后无法启动 | 修改前备份配置文件 |
| 版本混用 | 明确客户端和服务端版本 |

## 相关笔记

- [[PostgreSQL_基础命令速查]]
- [[PostgreSQL_索引]]

