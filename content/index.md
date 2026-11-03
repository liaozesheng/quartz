---
title: 首页
description: zesheng 的数字花园 — 运维实践与技术沉淀
aliases: [首页, Home]
tags:
  - 首页
---

# zesheng 的数字花园

运维工程师，专注于 Linux 服务器管理、Kubernetes 集群运维和自动化部署。这里记录日常排障复盘、部署手册和命令速查。

> [!info] 关于这个站点
> 这是我的个人知识库，基于 [Quartz](https://quartz.jzhao.xyz/) 构建，内容来自日常运维实践。笔记以实战为主，力求每次排障都能复用。

---

## 核心入口

| 主题 | 索引 | 适合查什么 |
|---|---|---|
| Linux 排障 | [[Linux 排障索引]] | 磁盘、CPU、syslog、containerd、systemd、网络 |
| Kubernetes 故障排查 | [[Kubernetes 故障排查索引]] | Pod、Node、PV、Service、Ingress、HPA、CronJob |
| Shell 自动化 | [[Shell 自动化索引]] | 日志清理、进程守护、封禁、部署切换、定时任务 |
| Docker 生产实践 | [[Docker 生产实践索引]] | 容器操作、磁盘清理、Compose、Nginx、HTTPS |
| PostgreSQL | [[PostgreSQL 索引]] | 安装部署、服务管理、基础命令、备份恢复 |
| 技术栈索引 | [[技术栈索引]] | Nginx、PostgreSQL 等技术专题入口 |

---

## 常用场景

| 我遇到的问题 | 推荐入口 |
|---|---|
| 服务器磁盘快满了 | [[Linux 磁盘空间爆满排查]], [[syslog 日志异常增长排查]] |
| Pod 起不来 | [[Kubernetes Pod Pending 排查]], [[Kubernetes Pod CrashLoopBackOff 排查]] |
| 服务访问失败 | [[Kubernetes Service 无响应排查]], [[Kubernetes Ingress 路由失效排查]] |
| Docker 排障 | [[Docker 基础与常用操作]], [[Docker 生产实践索引]] |
| Nginx 配置 | [[Nginx 安装与反向代理配置手册]] |
| PostgreSQL | [[PostgreSQL 15 安装部署手册]], [[PostgreSQL 基础命令速查]] |

---

## 命令速查

- [[Linux知识系列--命令]] — Linux 命令大全
- [[Kubernetes 命令速查]] — K8s 常用命令
- [[PostgreSQL 基础命令速查]] — PostgreSQL 常用操作
- [[Git 基本使用与常见踩坑]] — Git 常用命令
- [[Shell 安全处理恶劣文件名]] — Shell 文件名处理技巧

---

## 站点概览

| 指标 | 值 |
|---|---|
| 笔记总数 | 74 篇 |
| 故障复盘 | 16 篇 |
| 部署手册 | 36 篇 |
| 知识领域 | Linux / Kubernetes / Docker / PostgreSQL / Shell |
| 最后更新 | 2026-07-27 |

---

## 技术栈

本知识库使用 [Quartz](https://quartz.jzhao.xyz/) 构建，托管在 [GitHub Pages](https://github.com/liaozesheng/quartz)。

支持：[[双链]] · 全文搜索 · 深色模式 · 代码高亮
