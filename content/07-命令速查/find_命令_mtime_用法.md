---
title: find 命令 mtime 用法
tags:
  - Linux
  - 运维
  - 命令速查
category: 命令速查
status: active
---

# find 命令 mtime 用法

## 使用场景

`find -mtime` 用于按“文件最后修改时间”筛选文件，常见于日志清理、备份清理、临时文件巡检等场景。

最容易混淆的是：

- `-mtime 1`
- `-mtime -1`
- `-mtime +1`

## 核心规则

| 写法          | 含义                | 常见理解                              |
| ----------- | ----------------- | --------------------------------- |
| `-mtime 1`  | 修改时间落在 1 到 2 天前之间 | 刚好是“昨天那一段”， -mtime 0 就是今天这一段0-24点 |
| `-mtime -1` | 修改时间小于 1 天        | 最近 24 小时内                         |
| `-mtime +1` | 修改时间大于 2 天        | 前天以前，更早的文件                        |

> [!note]
> `find` 的 `-mtime +n` 不是“超过 n 天”，而是“早于 n+1 天”。例如 `-mtime +1` 匹配的是 2 天以前的文件。

## 常用命令

| 场景 | 命令 | 说明 |
|---|---|---|
| 找最近 24 小时内修改过的日志 | `find /onstarlog/ -name "*.log4j*" -type f -mtime -1` | 最近一天 |
| 找 1 到 2 天前修改过的日志 | `find /onstarlog/ -name "*.log4j*" -type f -mtime 1` | 常被理解为昨天 |
| 找 2 天以前的日志 | `find /onstarlog/ -name "*.log4j*" -type f -mtime +1` | 更早的文件 |
| 找 7 天以前的日志并先打印 | `find /onstarlog/ -name "*.log4j*" -type f -mtime +6 -print` | 删除前确认 |
| 找 7 天以前的日志并删除 | `find /onstarlog/ -name "*.log4j*" -type f -mtime +6 -delete` | 生产执行需谨慎 |

## 示例

### 查看待清理文件

```bash
find /onstarlog/ -name "*.log4j*" -type f -mtime +6 -exec du -h {} +
```

### 确认后删除

```bash
find /onstarlog/ -name "*.log4j*" -type f -mtime +6 -delete
```

### 按大小排序查看

```bash
find /onstarlog/ -name "*.log4j*" -type f -exec du -h {} + | sort -rh
```

## 注意事项

- 生产环境先用 `-print` 或 `du -h` 确认，再执行 `-delete`。
- 清理日志前确认应用是否仍在写入这些文件。
- `-mtime` 按 24 小时为单位，不是自然日。
- 如果想按分钟筛选，可以考虑 `-mmin`。
- 如果路径里可能有特殊字符，配合 `-print0` 和 `xargs -0` 更安全。

## 相关笔记

- [[Linux_磁盘空间爆满排查]]

