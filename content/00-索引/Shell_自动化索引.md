---
title: Shell 自动化索引
tags:
  - Shell
  - 运维
  - 命令速查
category: 索引
status: active
---

# Shell 自动化索引

这个页面按使用场景组织 Shell 自动化手册。优先阅读标准化手册。

## 快速入口

| 问题/场景 | 适合先看 |
|---|---|
| 日志清理与磁盘风险 | [[Shell_自动化清理旧日志文件]], [[Shell_日志目录超标监控]] |
| 服务异常退出或假死 | [[Shell_核心服务进程自愈守护]], [[Shell_进程守护增强版]] |
| 安全封禁与限流 | [[Shell_监控_Nginx_高频恶意_IP_自动封禁]], [[Shell_iptables_四维精准限流]], [[Shell_自动全网封禁系统]] |
| 发布切换与配置管理 | [[Shell_蓝绿部署零宕机切换]], [[Shell_超轻量配置中心]] |
| 日志归档和文件监控 | [[Shell_多服务器日志采集归档]], [[Shell_目录变化监控]] |
| 数据库和路由 | [[Shell_MySQL_高可用守护进程]], [[Shell_极简分库分表动态路由系统]] |
| Linux 新机初始化 | [[Linux_系统交互式初始化脚本]] |
| Shell 命令安全能力 | [[Shell_安全处理恶劣文件名]], [[Shell_秒级和毫秒级定时任务]] |

## 日志与磁盘

| 场景 | 标准化笔记 | 常用命令/工具 | 重点 |
|---|---|---|---|
| 清理旧日志 | [[Shell_自动化清理旧日志文件]] | `find`, `cron` | 路径确认、保留天数、误删风险 |
| 日志目录超标监控 | [[Shell_日志目录超标监控]] | `du`, `cron` | 阈值、告警、清理联动 |
| 多服务器日志归档 | [[Shell_多服务器日志采集归档]] | `rsync`, `tar` | NAS、压缩、保留周期 |

## 服务守护与发布

| 场景 | 标准化笔记 | 常用命令/工具 | 重点 |
|---|---|---|---|
| 核心服务进程自愈 | [[Shell_核心服务进程自愈守护]] | `systemctl`, `curl` | 健康检查、重启限制 |
| 进程守护基础版 | [[Shell_进程守护基础版]] | `pgrep`, `nohup` | 匹配准确、防重复启动 |
| 进程守护增强版 | [[Shell_进程守护增强版]] | `flock`, `healthcheck` | 防并发、健康检查、重启限制 |
| 蓝绿部署切换 | [[Shell_蓝绿部署零宕机切换]] | `systemd`, `nginx -t` | 健康检查、reload、回滚 |
| 配置中心 | [[Shell_超轻量配置中心]] | `ln -sfn`, `rsync` | 版本目录、current 软链接、回滚 |

## 系统初始化

| 场景                  | 标准化笔记                | 常用命令/工具                                   | 重点                      |
| ------------------- | -------------------- | ----------------------------------------- | ----------------------- |
| Ubuntu 新机初始化 | [[Linux_系统交互式初始化脚本]] | `apt`, `nvm`, `node`, `npm`, `uv`, `netplan` | 固定国内源、Node.js LTS、逐项跳过、配置备份与回滚 |

## 安全与流量防护

| 场景 | 标准化笔记 | 常用命令/工具 | 重点 |
|---|---|---|---|
| 高频恶意 IP 封禁 | [[Shell_监控_Nginx_高频恶意_IP_自动封禁]] | `awk`, `iptables` | 阈值、白名单、回滚 |
| IP 精准限流 | [[Shell_iptables_四维精准限流]] | `iptables`, `connlimit` | 规则顺序、白名单、回滚 |
| 全网封禁联动 | [[Shell_自动全网封禁系统]] | `ssh`, `iptables` | 统一下发、统一解封、误封风险 |
| 核心业务 OOM 保护 | [[Shell_核心业务_OOM_保护]] | `oom_score_adj`, `systemd` | 内存优先级、MemoryMax、告警 |

## 文件与调度能力

| 场景 | 标准化笔记 | 常用命令/工具 | 重点 |
|---|---|---|---|
| 目录变化监控 | [[Shell_目录变化监控]] | `inotifywait` | 事件过滤、长期运行、日志轮转 |
| 恶劣文件名处理 | [[Shell_安全处理恶劣文件名]] | `find -print0`, `xargs -0` | 空格、换行、前导 `-` |
| 秒级/毫秒级定时 | [[Shell_秒级和毫秒级定时任务]] | `sleep`, `flock`, `systemd timer` | 防重入、漂移、可靠性 |

## 数据库与轻量系统

| 场景 | 标准化笔记 | 常用命令/工具 | 重点 |
|---|---|---|---|
| MySQL 高可用守护 | [[Shell_MySQL_高可用守护进程]] | `mysqladmin`, `systemctl` | 连接检查、重启风险、监控账号 |
| 分库分表路由 | [[Shell_极简分库分表动态路由系统]] | `bash`, `mysql` | ID 取模、库表定位、迁移风险 |

## 快速命令

```bash
find /var/log -type f -name "*.log" -mtime +7 -print
du -sh /var/log/myapp
systemctl status <service-name>
curl -fsS http://127.0.0.1:8080/health
iptables -L INPUT -n --line-numbers
inotifywait -m -r -e create,modify,delete,move /data
flock -n /tmp/job.lock /usr/local/bin/job.sh
```

## 维护说明

- 新增 Shell 自动化笔记时，优先按 [[Shell脚本说明模板]] 写成标准化手册。
- 涉及部署、切换、回滚的内容，可以按 [[部署手册模板]] 补齐验证和回滚。
- 涉及命令能力的内容，放入 `07-命令速查` 并按 [[命令速查模板]] 组织。
