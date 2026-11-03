---
title: Shell 多服务器日志采集归档
tags:
  - Shell
  - 运维
  - 自动化
category: 自动化与部署
status: active
---

# Shell 多服务器日志采集归档

## 目标

从多台服务器统一采集业务日志，压缩后归档到 NAS 或集中存储，方便审计、排障和长期留存。

## 适用场景

- 多台应用服务器需要统一归档日志。
- 日志需要定期压缩，减少磁盘占用。
- 需要将日志同步到 NAS、备份机或集中存储。
- 暂时不引入完整日志平台，但需要基础归档能力。

## 参数配置

| 参数 | 示例 | 说明 |
|---|---|---|
| `SERVER_LIST` | `servers.txt` | 服务器列表 |
| `REMOTE_LOG_DIR` | `/var/log/myapp` | 远端日志目录 |
| `LOCAL_TMP_DIR` | `/tmp/log-collect` | 本地临时目录 |
| `ARCHIVE_DIR` | `/nas/logs` | 归档目录 |
| `RETENTION_DAYS` | `30` | 本地归档保留天数 |

## 核心逻辑

1. 读取服务器列表。
2. 使用 `rsync` 或 `scp` 拉取日志。
3. 按服务器和日期组织目录。
4. 压缩日志包。
5. 移动到 NAS 归档目录。
6. 清理过期本地临时文件。

## 脚本示例

```bash
#!/usr/bin/env bash
set -euo pipefail

SERVER_LIST="./servers.txt"
REMOTE_LOG_DIR="/var/log/myapp"
LOCAL_TMP_DIR="/tmp/log-collect"
ARCHIVE_DIR="/nas/logs"
TODAY="$(date '+%Y-%m-%d')"

mkdir -p "$LOCAL_TMP_DIR" "$ARCHIVE_DIR/$TODAY"

while read -r server; do
  [ -z "$server" ] && continue
  target="$LOCAL_TMP_DIR/$server"
  mkdir -p "$target"
  rsync -az "$server:$REMOTE_LOG_DIR/" "$target/"
  tar -czf "$ARCHIVE_DIR/$TODAY/$server.tar.gz" -C "$LOCAL_TMP_DIR" "$server"
done < "$SERVER_LIST"
```

## 部署方式

```bash
install -m 755 collect_logs.sh /usr/local/bin/collect_logs.sh
install -m 600 servers.txt /etc/log-collect/servers.txt
crontab -e
```

每天凌晨 3 点归档：

```cron
0 3 * * * /usr/local/bin/collect_logs.sh
```

## 验证方法

```bash
rsync --version
ssh <server> 'ls -lh /var/log/myapp'
/usr/local/bin/collect_logs.sh
ls -lh /nas/logs/$(date '+%Y-%m-%d')
tar -tzf /nas/logs/$(date '+%Y-%m-%d')/<server>.tar.gz | head
```

确认点：

- 每台服务器都有对应归档包。
- 归档包可以正常解压或列出内容。
- 采集失败有日志记录。
- NAS 空间充足。

## 风险与回滚

| 风险 | 处理方式 |
|---|---|
| SSH 认证失败 | 使用专用只读账号和密钥 |
| 日志过大导致归档慢 | 分批采集，控制压缩窗口 |
| NAS 空间不足 | 设置容量告警和保留周期 |
| 拉取中断 | 使用 `rsync` 支持断点续传 |

回滚：

```bash
crontab -e
rm -f /usr/local/bin/collect_logs.sh
```

## 相关笔记

- [[Shell_自动化清理旧日志文件]]
- [[Linux_磁盘空间爆满排查]]

