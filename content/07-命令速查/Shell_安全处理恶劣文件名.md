---
title: Shell 安全处理恶劣文件名
tags:
  - Shell
  - Linux
  - 命令速查
category: 命令速查
status: active
---

# Shell 安全处理恶劣文件名

## 使用场景

文件名中可能包含空格、换行、引号、反斜杠、前导 `-` 等特殊字符时，普通 `for file in $(ls)`、`xargs` 或未加引号的变量展开都可能出错。

## 核心原则

| 原则 | 推荐写法 | 说明 |
|---|---|---|
| 变量加引号 | `"$file"` | 避免空格和通配符展开 |
| 使用 NUL 分隔 | `-print0` | 避免换行文件名破坏处理 |
| xargs 用 `-0` | `xargs -0` | 与 `-print0` 配套 |
| 处理前导 `-` | `rm -- "$file"` | `--` 表示选项结束 |
| 避免解析 ls | 不用 `for f in $(ls)` | `ls` 输出不适合脚本解析 |

## 常用命令

安全遍历文件：

```bash
find . -type f -print0 |
while IFS= read -r -d '' file; do
  printf '%s\n' "$file"
done
```

安全删除 `.tmp` 文件：

```bash
find . -type f -name '*.tmp' -print0 | xargs -0 rm --
```

安全统计大小：

```bash
find . -type f -print0 | xargs -0 du -h --
```

安全复制：

```bash
find . -type f -name '*.log' -print0 |
while IFS= read -r -d '' file; do
  cp -- "$file" /backup/
done
```

## 易错写法

```bash
for file in $(ls); do
  rm $file
done
```

问题：

- 文件名有空格会被拆成多个参数。
- 文件名有通配符可能被二次展开。
- 文件名以 `-` 开头可能被当成命令选项。
- 文件名有换行时更容易出错。

## 验证方法

创建测试文件：

```bash
touch 'a b.txt'
touch '--danger.txt'
touch 'quote"file.txt'
```

用安全方式处理：

```bash
find . -type f -print0 | xargs -0 ls -l --
```

## 相关笔记

- [[find_命令_mtime_用法]]
- [[Shell_自动化清理旧日志文件]]

