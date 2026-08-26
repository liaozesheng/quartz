---
title: Linux 排障索引
tags:
  - Linux
  - 运维
  - 排障手册
category: 索引
status: active
---

# Linux 排障索引

这个页面按故障现象组织 Linux 排障入口。优先阅读标准化复盘和命令速查。

## 快速入口

| 问题/场景 | 适合先看 |
|---|---|
| 磁盘空间异常升高 | [[Linux_磁盘空间爆满排查]], [[syslog_日志异常增长排查]] |
| Docker/containerd 占用过大 | [[containerd_占用磁盘空间过大]] |
| CPU 告警 | [[Linux_CPU_告警排查]] |
| 日志清理时间筛选 | [[find_命令_mtime_用法]] |
| systemd 服务问题 | [[systemd管理服务]], [[Shell_核心服务进程自愈守护]] |
| 网络管理 | [[NetworkManager]] |

## 实战复盘

| 故障现象 | 标准化笔记 | 常用命令 | 关键词 |
|---|---|---|---|
| 磁盘空间爆满 | [[Linux_磁盘空间爆满排查]] | `df -h`, `du -xh --max-depth=1` | 磁盘、日志、空间 |
| syslog 日志异常增长 | [[syslog_日志异常增长排查]] | `tail -200 /var/log/syslog`, `journalctl --disk-usage` | syslog、journal、logrotate |
| containerd 占用磁盘空间过大 | [[containerd_占用磁盘空间过大]] | `docker system df`, `du -xh --max-depth=1 /var/lib/containerd` | Docker、containerd、overlayfs |
| CPU 告警 | [[Linux_CPU_告警排查]] | `top`, `mpstat`, `mpstat -P ALL` | CPU、负载、容量 |

## 命令速查

| 场景 | 标准化笔记 | 常用命令 | 说明 |
|---|---|---|---|
| find 时间筛选 | [[find_命令_mtime_用法]] | `find -mtime` | 区分 `1`、`-1`、`+1` |
| 安全处理特殊文件名 | [[Shell_安全处理恶劣文件名]] | `find -print0`, `xargs -0` | 避免空格、换行、前导 `-` 出错 |

## 系统服务与网络

| 场景 | 笔记 | 常用命令 | 类型 | 关键词 |
|---|---|---|---|---|
| systemd 服务管理 | [[systemd管理服务]] | `systemctl status` | 专题教程 | systemd、服务、自启 |
| NetworkManager 网络管理 | [[NetworkManager]] | `nmcli` | 专题教程 | 网络、连接、网卡 |
| Linux 目录体系 | [[Linux_目录体系]] | `ls`, `tree` | 专题教程 | 目录、文件系统 |

## 常用命令

```bash
df -h
du -xh --max-depth=1 /var | sort -h
find /var -type f -size +100M -exec du -h {} +
lsof | grep deleted
tail -200 /var/log/syslog
journalctl --disk-usage
top
mpstat 2 5
mpstat -P ALL 2 5
systemctl status <service-name>
```

## 维护说明

- 新增 Linux 故障内容时，优先按 [[排障复盘模板]] 写成独立复盘。
- 命令类内容优先放入 `07-命令速查`。
