---
title: Linux 磁盘空间爆满排查
tags:
  - Linux
  - 运维
  - 故障复盘
  - 排障手册
category: 故障复盘
status: active
---

# Linux 磁盘空间爆满排查

## 现象

服务器磁盘使用率持续升高，`df -h` 显示根分区或业务挂载目录接近满载，但从业务目录表面看不一定能直接发现大文件。

常见影响：

- 应用无法继续写日志。
- 服务启动失败或异常退出。
- 数据库、容器运行时、监控组件出现异常。
- 系统告警提示磁盘空间不足。

## 环境

- 系统：Linux / Ubuntu / CentOS
- 服务：系统日志、业务服务、容器运行时
- 相关目录：`/`, `/var`, `/var/log`, `/var/lib/containerd`

## 排查过程

1. 先看整体磁盘使用情况，确认是哪一个挂载点空间异常。

```bash
df -h
```

2. 从根目录开始逐层定位大目录。

```bash
du -xh --max-depth=1 / | sort -h
du -xh --max-depth=1 /var | sort -h
du -xh --max-depth=1 /var/log | sort -h
```

3. 如果 `df` 显示空间占用很高，但 `du` 看不到明显大文件，检查是否存在“文件已删除但仍被进程占用”的情况。

```bash
lsof | grep deleted
```

4. 如果是日志文件占用过大，查看日志末尾，确认是谁在持续输出。

```bash
tail -200 /var/log/syslog
tail -200 /var/log/messages
```

5. 如果是业务日志目录，继续找大文件。

```bash
find /var/log -type f -size +100M -exec du -h {} + | sort -rh
```

## 根因

常见根因包括：

- 某个服务开启了 debug 日志，导致 `syslog` 或业务日志暴涨。
- 容器镜像、容器层、临时缓存没有及时清理。
- 日志轮转策略缺失或配置不合理。
- 文件已经删除，但进程仍持有文件句柄，导致空间没有释放。
- 应用写入路径不符合预期，把日志或缓存写到了根分区。

## 解决方法

### 日志文件过大

先确认日志内容和来源，再调整服务日志级别，避免只清理文件、不处理根因。

```bash
tail -200 /var/log/syslog
systemctl status <service-name>
```

如果确认某个服务 debug 日志过多，可以将日志级别调整为 `info` 或更低频级别，然后重启或 reload 服务。

```bash
systemctl restart <service-name>
```

### 已删除文件仍占用空间

如果 `lsof | grep deleted` 能看到大文件仍被进程占用，通常需要重启对应进程释放句柄。

```bash
lsof | grep deleted
systemctl restart <service-name>
```

### 大文件清理

清理前先确认路径和文件类型，生产环境不要直接对不明确路径执行删除。

```bash
find /var/log -type f -name "*.log" -mtime +7 -exec du -h {} +
```

确认无误后再删除或交给日志轮转处理。

```bash
find /var/log -type f -name "*.log" -mtime +7 -delete
```

## 验证结果

```bash
df -h
du -xh --max-depth=1 /var | sort -h
systemctl status <service-name>
```

确认点：

- 磁盘使用率下降。
- 服务状态正常。
- 日志不再快速增长。
- 监控告警恢复。

## 预防措施

- 配置 `logrotate`，限制日志保留天数和单文件大小。
- 服务默认不要长期打开 debug 日志。
- 对 `/var`, `/var/log`, `/var/lib/containerd` 设置磁盘使用率监控。
- 容器环境定期检查镜像、容器、volume、build cache 占用。
- 对关键业务挂载独立数据盘，避免根分区被打满。

## 相关笔记

- [[containerd_占用磁盘空间过大]]

