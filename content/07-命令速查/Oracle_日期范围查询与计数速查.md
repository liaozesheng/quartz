---
title: Oracle 日期范围查询与计数速查
tags:
  - 数据库
  - Oracle
  - 命令速查
category: 命令速查
status: active
---

# Oracle 日期范围查询与计数速查

## 使用场景

在 Oracle 中按时间范围查询日志、请求记录或大表数据时使用，重点是避免日期条件写法导致全表扫描。

## 日期范围查询

推荐使用左闭右开的时间范围：

```sql
where created_time >= to_timestamp('2025-12-02 00:00:00.000000', 'YYYY-MM-DD HH24:MI:SS.FF6')
  and created_time <  to_timestamp('2025-12-10 00:00:00.000000', 'YYYY-MM-DD HH24:MI:SS.FF6')
```

含义：

| 条件 | 说明 |
|---|---|
| `>= 起始时间` | 包含起始时间 |
| `< 结束时间` | 不包含结束时间 |
| 左闭右开 | 避免边界时间重复或遗漏 |

## 不推荐写法

不建议在高数据量场景中过度依赖 `between ... and ...` 处理时间范围。

```sql
where created_time between A and B
```

原因：

- 时间边界不如左闭右开清晰。
- 某些场景下可能触发全表扫描。
- 对日志、请求记录这类大表查询不够稳定。

## 大表计数

推荐使用：

```sql
select count(*)
from srvc_request_details
where created_time >= to_timestamp('2025-12-02 00:00:00.000000', 'YYYY-MM-DD HH24:MI:SS.FF6')
  and created_time <  to_timestamp('2025-12-10 00:00:00.000000', 'YYYY-MM-DD HH24:MI:SS.FF6');
```

`count(*)` 通常比 `count(列名)` 更稳妥：

| 写法 | 说明 |
|---|---|
| `count(*)` | 统计符合条件的行数，交给优化器处理 |
| `count(列名)` | 需要考虑列值是否为 `NULL` |

目标是尽量走索引扫描，例如 `index fast full scan`，避免 `full table scan`。

## 查看表数据量

查看当前用户表的数据量：

```sql
select table_name, num_rows
from user_tables
where table_name = 'VEHICLE';
```

查看指定 owner 下的表统计信息：

```sql
select table_name, num_rows, last_analyzed
from all_tables
where owner = 'VCR';
```

## 排查要点

| 问题 | 检查方向 |
|---|---|
| 小范围查询反而很慢 | 查看执行计划是否走了全表扫描 |
| 大表计数很慢 | 优先确认时间字段索引和统计信息 |
| 查询结果边界不准 | 使用左闭右开时间范围 |
| 执行计划异常 | 检查统计信息是否过旧 |

## 相关笔记

- [[技术栈索引]]
