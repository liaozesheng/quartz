---
title: Shell 极简分库分表动态路由系统
tags:
  - Shell
  - 数据库
  - 运维
  - 自动化
category: 自动化与部署
status: active
---

# Shell 极简分库分表动态路由系统

## 目标

用 Shell 维护简单的分库分表路由规则，支持根据业务 key 计算目标库表，适合作为学习、验证或轻量内部工具。

## 适用场景

- 需要理解分库分表路由基本原理。
- 小型内部工具需要根据 ID 计算目标库表。
- 需要生成 SQL、迁移脚本或排查数据位置。
- 不适合直接替代成熟数据库中间件。

## 参数配置

| 参数 | 示例 | 说明 |
|---|---|---|
| `DB_COUNT` | `4` | 分库数量 |
| `TABLE_COUNT` | `16` | 每库分表数量 |
| `ROUTE_KEY` | `user_id` | 路由字段 |
| `DB_PREFIX` | `order_db_` | 数据库名前缀 |
| `TABLE_PREFIX` | `order_` | 表名前缀 |

## 核心逻辑

1. 输入业务 ID。
2. 对 ID 做 hash 或取模。
3. 根据分库数量得到目标库。
4. 根据分表数量得到目标表。
5. 输出目标库表或生成 SQL。

## 脚本示例

```bash
#!/usr/bin/env bash
set -euo pipefail

id="$1"
DB_COUNT=4
TABLE_COUNT=16
DB_PREFIX="order_db_"
TABLE_PREFIX="order_"

db_index=$(( id % DB_COUNT ))
table_index=$(( id % TABLE_COUNT ))

printf '%s%02d.%s%02d\n' "$DB_PREFIX" "$db_index" "$TABLE_PREFIX" "$table_index"
```

## 验证方法

```bash
./route.sh 10001
./route.sh 10002
./route.sh 10003
```

确认点：

- 同一个 ID 每次路由结果一致。
- 结果落在合法库表范围。
- 分库分表数量变更前有迁移方案。

## 风险与回滚

| 风险 | 处理方式 |
|---|---|
| 路由规则变更导致数据查不到 | 变更前冻结规则并准备迁移 |
| 分布不均 | 检查 key 分布和 hash 算法 |
| 脚本误用于生产写入 | 明确只用于计算、排查、生成脚本 |
| 库表数量扩容困难 | 提前设计扩容策略 |

## 相关笔记

- [[Shell_MySQL_高可用守护进程]]
