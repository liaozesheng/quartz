---
title: syslog 日志异常增长排查
tags:
  - Linux
  - 运维
  - 故障复盘
  - 排障手册
category: 故障复盘
status: active
---

# syslog 日志异常增长排查

## 现象

服务器磁盘使用率持续升高，进一步查看后发现 `/var/log/syslog` 或系统日志文件占用异常大，甚至单个日志文件达到数 GB。

常见影响：

- 根分区或 `/var` 分区空间被打满。
- 服务无法继续写日志。
- 系统监控触发磁盘告警。
- 排查时容易只清理日志文件，却忽略持续写入日志的服务。

## 环境

- 系统：Linux / Ubuntu
- 日志文件：`/var/log/syslog`
- 相关组件：rsyslog、systemd-journald、业务服务

## 排查过程

1. 先确认磁盘使用率和异常挂载点。

```bash
df -h
```

2. 从根目录逐层定位大目录，确认是否集中在 `/var/log`。

```bash
du -xh --max-depth=1 / | sort -h
du -xh --max-depth=1 /var | sort -h
du -xh --max-depth=1 /var/log | sort -h
```

3. 查看系统日志文件大小。

```bash
ls -lh /var/log/syslog
ls -lh /var/log/
```

4. 查看 syslog 末尾，确认是谁在持续写入。

```bash
tail -200 /var/log/syslog
```

5. 如果日志来自某个服务，继续查看服务状态和配置。

```bash
systemctl status <service-name>
journalctl -u <service-name> -n 100
```

## syslog 与 journal 的区别

| 类型 | 常见位置 | 特点 | 查看方式 |
|---|---|---|---|
| syslog | `/var/log/syslog` | 明文文本日志，可以直接用 `cat`、`less`、`tail` 查看 | `tail -200 /var/log/syslog` |
| journal | `/var/log/journal/` 或内存中 | systemd-journald 的二进制日志 | `journalctl` |

两者可能记录相似事件，但存储格式和查看方式不同。排查磁盘占用时，需要分别看 `/var/log/syslog` 和 journal 占用。

```bash
journalctl --disk-usage
```

## 根因

常见根因包括：

- 某个服务开启 debug 日志，持续向 syslog 输出大量内容。
- 服务异常重试，短时间内反复写错误日志。
- 日志级别配置不合理，把调试信息写进系统日志。
- logrotate 配置缺失或轮转失败。
- rsyslog 或 journald 保留策略不合理。

在原始记录中，最终定位到是某个服务持续输出大量 debug 日志，调整日志级别后问题缓解。

## 解决方法

### 调整服务日志级别

先定位具体服务，再把 debug 日志调整为 `info` 或生产环境合适级别。

```bash
tail -200 /var/log/syslog
systemctl status <service-name>
```

调整配置后重启或 reload 服务。

```bash
systemctl restart <service-name>
```

### 检查日志是否停止快速增长

```bash
watch -n 2 'ls -lh /var/log/syslog'
tail -50 /var/log/syslog
```

### 临时释放空间

如果磁盘已经接近打满，先确认日志来源和保留需求，再做临时处理。

```bash
cp /var/log/syslog /var/log/syslog.bak
truncate -s 0 /var/log/syslog
```

> [!warning]
> 直接清空日志只能临时释放空间，不能解决根因。生产环境执行前要确认是否需要保留现场日志。

### 检查 logrotate

```bash
logrotate -d /etc/logrotate.conf
ls -lh /etc/logrotate.d/
```

如果 syslog 没有正常轮转，需要检查 rsyslog/logrotate 配置。

## 验证结果

```bash
df -h
ls -lh /var/log/syslog
journalctl --disk-usage
systemctl status <service-name>
```

确认点：

- `/var/log/syslog` 不再快速增长。
- 磁盘使用率下降或稳定。
- 相关服务状态正常。
- 监控告警恢复。

## 预防措施

- 生产环境默认关闭 debug 日志。
- 给 `/var/log` 设置磁盘使用率告警。
- 配置合理的 logrotate 保留周期和文件大小。
- 定期检查 journal 占用。
- 对高频错误日志建立告警，尽早发现服务异常重试。

## 相关笔记

- [[Linux_磁盘空间爆满排查]]

