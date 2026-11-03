# Vector 配置操作手册

> **版本:** v1.0 | **日期:** 2026-05-18 | **适用:** Kong 日志采集场景

---

## 目录

1. [概述](#1-概述)
2. [安装与部署](#2-安装与部署)
3. [配置文件详解](#3-配置文件详解)
4. [Pipeline 数据流](#4-pipeline-数据流)
5. [PostgreSQL 表结构](#5-postgresql-表结构)
6. [运维操作](#6-运维操作)
7. [故障排查](#7-故障排查)
8. [性能调优](#8-性能调优)

---

## 1. 概述

### 1.1 什么是 Vector

Vector 是一个高性能、可观测性数据管道工具，用于采集、转换和路由日志、指标等数据。在本项目中，Vector 负责：

- 采集 Docker 容器中 Kong 网关的 JSON 日志
- 解析 JSON 并提取关键字段
- 按时间窗口（10秒 / 5分钟）进行聚合计算
- 将聚合结果写入 PostgreSQL

### 1.2 架构

```
┌──────────────┐    Docker Logs     ┌─────────────────────────┐
│  Kong        │  (stdout JSON)     │  Vector (Docker)        │
│  (Docker)    │ ─────────────────▶ │                         │
│              │                    │  1. Parse JSON          │
│              │                    │  2. Aggregate 10s       │
│              │                    │  3. Aggregate 5min      │
│              │                    │  4. Write PostgreSQL    │
└──────────────┘                    └───────────┬─────────────┘
                                                ▼
                                        ┌─────────────────┐
                                        │   PostgreSQL    │
                                        │  agg_10s        │
                                        │  agg_5min       │
                                        └─────────────────┘
```

### 1.3 组件版本

| 组件 | 版本/镜像 | 说明 |
|------|-----------|------|
| Vector | `timberio/vector:nightly-distroless-libc` | 使用 nightly 构建以支持 postgres sink |
| Kong | `kong:2.8.1` | API 网关 |
| Docker | Docker Engine 20.10+ | 需支持 docker_logs API |
| PostgreSQL | 12+ | 支持 `TIMESTAMPTZ` 类型 |

### 1.4 聚合数据用途

| 数据源 | 窗口 | 用途 | 查询频率 |
|--------|------|------|---------|
| `agg_10s` | 10 秒 | 实时监控看板、告警 | 每 15 秒刷新 |
| `agg_5min` | 5 分钟 | 趋势分析、历史报表 | 每 1 分钟刷新 |

---

## 2. 安装与部署

### 2.1 环境准备

#### 系统要求

| 资源 | 最低配置 | 推荐配置 |
|------|---------|---------|
| CPU | 1C | 2C |
| 内存 | 256MB | 512MB |
| 磁盘 | 1GB（含 vector_data 卷） | 5GB |
| 网络 | 与 Kong 和 PostgreSQL 互通 | - |

#### 前置条件

1. Docker 和 Docker Compose 已安装
2. PostgreSQL 实例已就绪，可访问
3. Kong 已部署并输出 JSON 格式日志到 stdout

### 2.2 Docker Compose 部署

`docker-compose.yml` 中的 Vector 服务配置：

```yaml
  vector:
    image: timberio/vector:nightly-distroless-libc
    restart: unless-stopped
    environment:
      - PG_HOST=${PG_HOST}
      - PG_PORT=${PG_PORT}
      - PG_USER=${PG_USER}
      - PG_PASSWORD=${PG_PASSWORD}
      - PG_DB=${PG_DB:-postgres}
      - PG_SCHEMA=${PG_SCHEMA:-public}
    command: ["--config", "/etc/vector/vector.toml"]
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro   # 读取 Docker 日志
      - ./vector.toml:/etc/vector/vector.toml:ro       # 挂载配置文件
      - vector_data:/var/lib/vector                    # 持久化数据
    depends_on:
      - kong
    networks:
      - kong-net
```

#### 启动命令

```bash
# 启动所有服务（含 Vector）
docker compose up -d

# 仅重启 Vector 服务
docker compose restart vector

# 查看 Vector 日志
docker compose logs -f vector

# 查看 Vector 状态
docker compose exec vector vector top
```

### 2.3 环境变量

Vector 服务依赖以下环境变量（通过 `.env` 文件或 compose environment 传入）：

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `PG_HOST` | 是 | - | PostgreSQL 主机地址 |
| `PG_PORT` | 是 | - | PostgreSQL 端口 |
| `PG_USER` | 是 | - | 数据库用户名 |
| `PG_PASSWORD` | 是 | - | 数据库密码 |
| `PG_DB` | 否 | `postgres` | 数据库名称 |
| `PG_SCHEMA` | 否 | `public` | Schema 名称 |

这些变量在 `vector.toml` 中通过 `${VAR_NAME}` 语法引用。

### 2.4 数据卷

| 卷名 | 主机路径 | 容器路径 | 用途 |
|------|---------|---------|------|
| `vector_data` | Docker volume | `/var/lib/vector` | Vector 内部状态、缓冲数据 |
| `/var/run/docker.sock` | 宿主 socket | `/var/run/docker.sock` | 读取 Docker 容器日志（只读） |
| `./vector.toml` | 项目根目录 | `/etc/vector/vector.toml` | Vector 配置文件（只读） |

---

## 3. 配置文件详解

配置文件路径: `vector.toml`

### 3.1 文件结构概览

```
Source (docker_logs)
  └─> Transform (parse_kong: remap)
        ├─> Transform (reduce_10s: 10s 聚合)
        │     └─> Transform (events_to_pg_10s: 计算)
        │           └─> Sink (postgres_agg_10s)
        │
        └─> Transform (reduce_5min: 5min 聚合)
              └─> Transform (events_to_pg_5min: 计算)
                    └─> Sink (postgres_agg_5min)
```

### 3.2 Source: docker_logs

```toml
[sources.kong_logs]
type = "docker_logs"
include_labels = ["com.kong.service=kong"]
```

| 配置项 | 值 | 说明 |
|--------|----|------|
| `type` | `docker_logs` | 从 Docker daemon 读取容器日志 |
| `include_labels` | `com.kong.service=kong` | 只采集带有此 label 的容器日志 |

**重要行为说明:**

- Vector 通过 Docker socket API 订阅容器日志流
- 只收集标记了 `com.kong.service=kong` 的容器日志，避免采集无关容器
- Vector 容器自身日志不会被采集（distroless 镜像无日志输出）
- 容器重启后 Vector 自动重新发现并订阅

**多节点部署注意:** 如果有多个 Kong 实例（如 `kong` 和 `kong2`），需确保它们都带有相同的 label，Vector 会自动采集所有匹配容器的日志。

### 3.3 Transform: parse_kong (JSON 解析)

```toml
[transforms.parse_kong]
type = "remap"
inputs = ["kong_logs"]
source = '''
parsed, err = parse_json(.message)
if err != null {
  abort
}
# ... 字段提取
'''
```

#### 解析逻辑

1. **JSON 解析**: 尝试将 `.message` 解析为 JSON
2. **失败处理**: 解析失败时执行 `abort`，丢弃该事件（非 JSON 格式的行，如 Nginx 文本日志行）
3. **字段提取**: 从解析后的 JSON 中提取日志字段

#### 字段映射

| 目标字段 | 源路径 | 类型 | 默认值 | 说明 |
|----------|--------|------|--------|------|
| `.method` | `parsed.request.method` | string | - | HTTP 方法 |
| `.path` | `parsed.request.uri` | string | - | 请求路径 |
| `.status_code` | `parsed.response.status` | int | 0 | HTTP 状态码 |
| `.request_size` | `parsed.request.size` | int | 0 | 请求体大小(字节) |
| `.response_size` | `parsed.response.size` | int | 0 | 响应体大小(字节) |
| `.kong_latency` | `parsed.latencies.kong` | int | 0 | Kong 处理延迟(ms) |
| `.total_latency` | `parsed.latencies.request` | int | 0 | 总请求延迟(ms) |
| `.proxy_latency` | `parsed.latencies.proxy` | int | 0 | 代理延迟(ms) |
| `.component` | `.container_name` | string | - | Docker 容器名（区分多节点） |
| `.event_epoch` | `.timestamp` | int | - | 事件时间戳(秒级 epoch) |
| `.epoch_5min` | 计算值 | int | - | 5 分钟桶对齐键 |

#### 初始化聚合计数器

```vrl
.request_count = 1
.kong_latency_sum = .kong_latency
.total_latency_sum = .total_latency
.proxy_latency_sum = .proxy_latency
.request_size_sum = .request_size
.response_size_sum = .response_size
```

这些字段在 `reduce` transform 中被累加求和。

### 3.4 Transform: reduce_10s (10 秒窗口聚合)

```toml
[transforms.reduce_10s]
type = "reduce"
inputs = ["parse_kong"]
group_by = ["component", "method", "path", "status_code"]
expire_after_ms = 10000
flush_period_ms = 2000
```

| 配置项 | 值 | 说明 |
|--------|----|------|
| `group_by` | 4 个字段 | 按组件、方法、路径、状态码分组 |
| `expire_after_ms` | 10000 | 窗口过期时间：10 秒 |
| `flush_period_ms` | 2000 | 强制刷写间隔：2 秒 |

#### 合并策略 (merge_strategies)

| 字段 | 策略 | 说明 |
|------|------|------|
| `method`, `path`, `status_code`, `component` | `retain` | 保留首个值（分组键不变） |
| `request_count` | `sum` | 请求数累加 |
| `*_latency_sum`, `*_size_sum` | `sum` | 延迟/大小总和累加 |
| `event_epoch` | `min` | 取最早事件时间戳作为窗口起点 |

### 3.5 Transform: reduce_5min (5 分钟窗口聚合)

```toml
[transforms.reduce_5min]
type = "reduce"
inputs = ["parse_kong"]
group_by = ["component", "method", "path", "status_code", "epoch_5min"]
expire_after_ms = 360000
flush_period_ms = 10000
```

| 配置项 | 值 | 说明 |
|--------|----|------|
| `group_by` | 5 个字段 | 额外包含 `epoch_5min`（5 分钟桶键） |
| `expire_after_ms` | 360000 | 窗口过期时间：6 分钟 |
| `flush_period_ms` | 10000 | 强制刷写间隔：10 秒 |

### 3.6 Transform: events_to_pg_* (计算聚合值)

两个窗口的计算逻辑基本一致，仅窗口边界计算不同。

#### 核心计算

```vrl
# 安全除法：仅在 count > 0 时计算平均值
if count > 0 {
  .avg_kong_latency, _ = to_float(.kong_latency_sum) / to_float(count)
  # ... 其他平均值
} else {
  .avg_kong_latency = 0.0
  # ... 其他默认值
}
```

#### 窗口边界

| 窗口 | window_start 计算 | window_end |
|------|-------------------|------------|
| 10s | 按 10 秒对齐: `floor(epoch / 10) * 10` | `window_start + 10` |
| 5min | 直接使用 `epoch_5min`（已在 parse 中计算） | `window_start + 300` |

#### 字段清理

`events_to_pg_*` transform 会删除中间计算字段，保留数据库列名对应的字段：

**保留的字段（写入数据库）:**

- `.component`, `.method`, `.path`, `.status_code`
- `.request_count`
- `.avg_kong_latency`, `.avg_total_latency`
- `.avg_request_size`, `.avg_response_size`
- `.p99_kong_latency`, `.p99_total_latency` (实际存储的是 sum 值)
- `.sum_request_size`, `.sum_response_size`
- `.window_start`, `.window_end`
- `.created_at`

### 3.7 Sink: postgres_agg_* (写入 PostgreSQL)

```toml
[sinks.postgres_agg_10s]
type = "postgres"
inputs = ["events_to_pg_10s"]
endpoint = "postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DB}"
table = "${PG_SCHEMA}.agg_10s"

  [sinks.postgres_agg_10s.buffer]
  type = "memory"
  max_events = 1000
```

| 配置项 | 值 | 说明 |
|--------|----|------|
| `type` | `postgres` | PostgreSQL sink（需 nightly 版本） |
| `endpoint` | 环境变量拼接 | 数据库连接字符串 |
| `table` | `${PG_SCHEMA}.agg_10s` | 目标表（支持 schema 前缀） |
| `buffer.type` | `memory` | 内存缓冲（崩溃后数据丢失） |
| `buffer.max_events` | 1000 | 最大缓冲事件数 |

**连接字符串模板:**
```
postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DB}
```

---

## 4. Pipeline 数据流

### 4.1 完整数据流图

```
Kong stdout (JSON log)
    │
    ▼
┌──────────────────┐
│  docker_logs     │  Source: 读取 Docker 日志流
│  [kong_logs]     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  remap           │  Transform: JSON 解析 + 字段提取
│  [parse_kong]    │  失败 → abort (丢弃非 JSON 行)
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────┐
│ reduce  │ │ reduce   │
│ [10s]   │ │ [5min]   │
└────┬────┘ └────┬─────┘
     │           │
     ▼           ▼
┌──────────┐ ┌───────────┐
│ remap    │ │ remap     │
│ [to_pg_10s]│ │ [to_pg_5min]│
└────┬─────┘ └────┬──────┘
     │            │
     ▼            ▼
┌──────────┐ ┌───────────┐
│ postgres │ │ postgres  │
│ [agg_10s]│ │ [agg_5min]│
└──────────┘ └───────────┘
```

### 4.2 单条日志的生命周期

以一条 10 秒窗口内的请求为例：

1. **00:00.000** - Kong 输出 JSON 日志到 stdout
2. **00:00.050** - Vector 通过 docker_logs 读取到事件
3. **00:00.051** - parse_kong 解析 JSON，提取字段，初始化计数器
4. **00:00.051 - 00:09.999** - 同组的其他请求陆续到达，reduce_10s 持续累积
5. **00:10.000** - reduce_10s 窗口过期，输出聚合结果
6. **00:10.001** - events_to_pg_10s 计算平均值，清理中间字段
7. **00:10.002** - postgres sink 写入 PostgreSQL `agg_10s` 表

### 4.3 一条示例日志

**Kong 原始输出 (stdout):**
```json
{
  "started_at": 1716000000000,
  "request": {
    "method": "GET",
    "uri": "/api/users",
    "size": 0
  },
  "response": {
    "status": 200,
    "size": 1024
  },
  "latencies": {
    "kong": 5,
    "request": 150,
    "proxy": 145
  },
  "client_ip": "192.168.1.100"
}
```

**写入 agg_10s 的数据:**

| 字段 | 值 |
|------|----|
| window_start | 2024-05-18T08:00:00+00:00 |
| window_end | 2024-05-18T08:00:10+00:00 |
| method | GET |
| path | /api/users |
| status_code | 200 |
| component | kong |
| request_count | 50 |
| avg_kong_latency | 4.8 |
| avg_total_latency | 142.3 |
| p99_kong_latency | 240 |
| p99_total_latency | 7115 |
| avg_request_size | 0.0 |
| sum_request_size | 0 |
| avg_response_size | 1024.0 |
| sum_response_size | 51200 |

---

## 5. PostgreSQL 表结构

### 5.1 agg_10s (实时聚合表)

```sql
CREATE TABLE agg_10s (
    id                  BIGSERIAL PRIMARY KEY,
    window_start        TIMESTAMPTZ NOT NULL,
    window_end          TIMESTAMPTZ NOT NULL,
    method              VARCHAR(10),
    path                TEXT,
    status_code         INT,
    component           VARCHAR(255),
    request_count       INT,
    avg_kong_latency    FLOAT,
    p99_kong_latency    FLOAT,
    avg_total_latency   FLOAT,
    p99_total_latency   FLOAT,
    avg_request_size    FLOAT,
    sum_request_size    BIGINT,
    avg_response_size   FLOAT,
    sum_response_size   BIGINT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX uidx_agg10s_window ON agg_10s
    (window_start, window_end, method, path, status_code, component);

CREATE INDEX idx_agg10s_path_method ON agg_10s (path, method);
```

### 5.2 agg_5min (归档聚合表)

```sql
CREATE TABLE agg_5min (
    id                  BIGSERIAL PRIMARY KEY,
    window_start        TIMESTAMPTZ NOT NULL,
    window_end          TIMESTAMPTZ NOT NULL,
    method              VARCHAR(10),
    path                TEXT,
    status_code         INT,
    component           VARCHAR(255),
    request_count       INT,
    avg_kong_latency    FLOAT,
    p99_kong_latency    FLOAT,
    avg_total_latency   FLOAT,
    p99_total_latency   FLOAT,
    avg_request_size    FLOAT,
    sum_request_size    BIGINT,
    avg_response_size   FLOAT,
    sum_response_size   BIGINT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX uidx_agg5min_window ON agg_5min
    (window_start, window_end, method, path, status_code, component);

CREATE INDEX idx_agg5min_path_method ON agg_5min (path, method);
```

### 5.3 数据保留策略

```sql
-- agg_10s: 保留 1 天
DELETE FROM agg_10s WHERE window_end < NOW() - INTERVAL '1 day';

-- agg_5min: 保留 90 天
DELETE FROM agg_5min WHERE window_end < NOW() - INTERVAL '90 days';
```

建议通过 cron 任务定时执行清理：

```bash
# crontab 示例：每天凌晨 2 点清理过期数据
0 2 * * * docker exec -i $(docker compose ps -q postgres) psql -U $PG_USER -d $PG_DB -c "DELETE FROM agg_10s WHERE window_end < NOW() - INTERVAL '1 day'; DELETE FROM agg_5min WHERE window_end < NOW() - INTERVAL '90 days';"
```

---

## 6. 运维操作

### 6.1 日常操作

#### 启动/停止

```bash
# 启动 Vector
docker compose up -d vector

# 停止 Vector
docker compose stop vector

# 重启 Vector（加载新配置）
docker compose restart vector

# 强制重建（镜像更新等）
docker compose up -d --force-recreate vector
```

#### 日志查看

```bash
# 实时查看日志
docker compose logs -f vector

# 查看最近 100 行
docker compose logs --tail=100 vector

# 查看特定时间段
docker compose logs --since="2026-05-18T10:00:00" --until="2026-05-18T11:00:00" vector
```

#### 配置验证

```bash
# 验证配置文件语法（容器内）
docker compose exec vector vector validate /etc/vector/vector.toml

# 输出模式测试（不写入 sink，仅输出到 stdout）
docker compose exec vector vector --config /etc/vector/vector.toml --dry-run
```

#### 状态监控

```bash
# Vector 内置 API（需先启用 api 配置）
curl http://localhost:8686/health

# 查看内部指标
curl http://localhost:8686/metrics
```

### 6.2 配置更新

Vector 支持热重载配置，无需重启容器：

```bash
# 方法 1: 发送 SIGHUP 信号
docker compose kill -s HUP vector

# 方法 2: 使用 vector 命令
docker compose exec vector vector reload

# 方法 3: 重启服务（自动重新加载挂载的配置文件）
docker compose restart vector
```

**更新流程:**

1. 编辑 `vector.toml`
2. 执行 `docker compose exec vector vector validate /etc/vector/vector.toml` 验证
3. 发送热重载信号或重启服务
4. 检查日志确认配置生效

### 6.3 数据查询

```sql
-- 查询最近 10 分钟的 QPS 趋势
SELECT window_start, SUM(request_count) as qps
FROM agg_10s
WHERE window_start > NOW() - INTERVAL '10 minutes'
GROUP BY window_start
ORDER BY window_start;

-- 查询 Top 10 慢接口（按平均总延迟排序）
SELECT path, method, avg_total_latency, request_count
FROM agg_5min
WHERE window_start > NOW() - INTERVAL '1 hour'
  AND request_count > 10
ORDER BY avg_total_latency DESC
LIMIT 10;

-- 查询状态码分布
SELECT status_code, SUM(request_count) as total
FROM agg_10s
WHERE window_start > NOW() - INTERVAL '1 hour'
GROUP BY status_code
ORDER BY total DESC;

-- 查询特定接口的延迟趋势
SELECT window_start, avg_kong_latency, avg_total_latency
FROM agg_10s
WHERE path = '/api/users'
  AND method = 'GET'
  AND window_start > NOW() - INTERVAL '30 minutes'
ORDER BY window_start;
```

### 6.4 扩缩容

#### 添加 Kong 节点

1. 在新 Kong 容器上添加 label: `com.kong.service=kong`
2. Vector 自动发现并开始采集新容器日志
3. 通过 `.component` 字段区分不同节点的日志

#### Vector 资源调整

```yaml
# docker-compose.yml 中调整 Vector 资源限制
  vector:
    deploy:
      resources:
        limits:
          cpus: "2.0"    # 原 1.0
          memory: 512M   # 原 256M
        reservations:
          cpus: "0.5"    # 原 0.25
          memory: 128M   # 原 64M
```

---

## 7. 故障排查

### 7.1 常见问题

| 问题 | 症状 | 排查方法 |
|------|------|---------|
| 无数据写入 | 聚合表为空 | 检查 Vector 日志、Docker socket 权限 |
| 数据延迟 | 看板不刷新 | 检查 reduce 窗口配置、PostgreSQL 连接 |
| 日志解析失败 | 部分数据丢失 | 检查 Kong 日志格式是否为 JSON |
| PostgreSQL 连接失败 | 写入报错 | 检查环境变量、网络连通性 |
| Vector 容器启动失败 | 容器反复重启 | 检查配置文件语法、依赖服务 |

### 7.2 排查步骤

#### Step 1: 检查 Vector 容器状态

```bash
docker compose ps vector
docker compose logs --tail=50 vector
```

#### Step 2: 验证 Docker 日志源

```bash
# 确认 Kong 容器有正确的 label
docker inspect $(docker compose ps -q kong) | grep -A1 '"com.kong.service"'

# 手动查看 Kong 日志输出
docker compose logs --tail=5 kong
```

#### Step 3: 验证 PostgreSQL 连接

```bash
# 从 Vector 容器测试连接
docker compose exec vector sh -c 'PGPASSWORD=$PG_PASSWORD psql -h $PG_HOST -p $PG_PORT -U $PG_USER -d $PG_DB -c "SELECT 1"'
```

#### Step 4: 检查聚合表数据

```sql
-- 检查最近是否有数据写入
SELECT COUNT(*), MAX(window_end) as latest_window
FROM agg_10s;

-- 检查写入频率
SELECT DATE_TRUNC('minute', created_at) as minute, COUNT(*)
FROM agg_10s
WHERE created_at > NOW() - INTERVAL '10 minutes'
GROUP BY 1
ORDER BY 1;
```

### 7.3 容错机制

| 故障场景 | Vector 行为 | 恢复方式 |
|----------|------------|---------|
| Kong 容器重启 | 自动重新订阅日志流 | 自动恢复 |
| PostgreSQL 短暂不可用 | 内存缓冲（max_events=1000） | 连接恢复后自动重发 |
| PostgreSQL 长时间不可用 | 缓冲区满后丢弃事件 | 需手动补数据 |
| Vector 崩溃重启 | 聚合窗口内数据丢失 | 无法恢复（无原始日志） |
| 日志格式变更 | 解析失败，事件被 abort | 更新 remap 配置 |

### 7.4 日志级别调整

在 `vector.toml` 顶部添加全局配置：

```toml
[api]
enabled = true
address = "0.0.0.0:8686"

[log]
level = "debug"  # trace, debug, info, warn, error
```

然后通过 API 查看内部指标：

```bash
curl http://localhost:8686/metrics | grep vector
```

---

## 8. 性能调优

### 8.1 资源消耗分析

| 场景 | QPS | Vector CPU | Vector 内存 | PostgreSQL 写入频率 |
|------|-----|-----------|------------|-------------------|
| 开发/测试 | < 10 | < 0.05C | < 50MB | 每 2-10 秒 |
| 生产（低） | < 100 | < 0.2C | < 100MB | 每 2-10 秒 |
| 生产（中） | 100-500 | < 0.5C | < 150MB | 每 2-10 秒 |
| 生产（高） | 500-2000 | < 1.0C | < 256MB | 每 2-10 秒 |

> Vector 内存占用极小，主要瓶颈在 Kong 请求处理能力。

### 8.2 调优参数

#### reduce 窗口大小

```toml
# 10s 窗口 - 适合实时监控
[transforms.reduce_10s]
expire_after_ms = 10000
flush_period_ms = 2000

# 如果 QPS 很高，可以增大窗口减少写入频率
expire_after_ms = 30000    # 30 秒
flush_period_ms = 5000

# 如果 QPS 很低，可以减小窗口保证数据实时
expire_after_ms = 5000     # 5 秒
flush_period_ms = 1000
```

#### 缓冲区配置

```toml
# 当前：内存缓冲，最多 1000 个事件
[sinks.postgres_agg_10s.buffer]
type = "memory"
max_events = 1000

# 高可用场景：使用磁盘缓冲（需挂载数据卷）
[sinks.postgres_agg_10s.buffer]
type = "disk"
max_size = 104900000  # 100MB
when_full = "block"   # 或 "drop_newest"
```

#### 批量写入

PostgreSQL sink 默认批量写入，可通过以下参数调整：

```toml
[sinks.postgres_agg_10s]
# ... 其他配置

[sinks.postgres_agg_10s.buffer]
type = "memory"
max_events = 5000    # 增大批量大小，减少写入频率
```

### 8.3 PostgreSQL 端调优

```sql
-- 批量写入时使用 COPY 协议（Vector 默认支持）
-- 确保 autovacuum 正常运行
ALTER TABLE agg_10s SET (autovacuum_vacuum_threshold = 5000);
ALTER TABLE agg_5min SET (autovacuum_vacuum_threshold = 1000);

-- 如果写入压力大，可以临时关闭 WAL（不推荐生产环境）
-- ALTER TABLE agg_10s SET UNLOGGED;
```

### 8.4 监控指标

通过 Vector API 暴露的 Prometheus 指标：

| 指标 | 说明 | 告警阈值 |
|------|------|---------|
| `component_received_events_total` | 各组件接收事件数 | - |
| `component_sent_events_total` | 各组件发送事件数 | - |
| `component_received_events_total{type="sink"}` | sink 写入成功数 | 持续为 0 告警 |
| `component_sent_events_total{type="sink"}` | sink 发送事件数 | - |
| `buffer_max_events` | 缓冲区最大容量 | - |
| `buffer_events_count` | 当前缓冲事件数 | 接近 max_events 告警 |

---

## 附录

### A. VRL (Vector Remap Language) 常用函数

| 函数 | 说明 | 示例 |
|------|------|------|
| `parse_json(value)` | 解析 JSON 字符串 | `parsed, err = parse_json(.message)` |
| `to_string(value)` | 转为字符串 | `.method = to_string!(parsed.request.method)` |
| `to_int(value)` | 转为整数 | `.status_code = to_int(parsed.response.status)` |
| `to_float(value)` | 转为浮点数 | `to_float(.kong_latency_sum)` |
| `abort` | 终止事件处理（丢弃） | `if err != null { abort }` |
| `format_timestamp(dt, format)` | 格式化时间戳 | `format_timestamp!(now(), "%+")` |
| `from_unix_timestamp(ts, unit)` | epoch 转时间戳 | `from_unix_timestamp!(window_start_secs, unit: "seconds")` |
| `to_unix_timestamp(dt, unit)` | 时间戳转 epoch | `to_unix_timestamp!(.timestamp, unit: "seconds")` |
| `now()` | 当前时间 | `.created_at = format_timestamp!(now(), "%+")` |
| `del(field)` | 删除字段 | `del(.message)` |

### B. 参考链接

- Vector 官方文档: https://vector.dev/docs/
- VRL 函数参考: https://vector.dev/docs/reference/vrl/functions/
- Docker Logs Source: https://vector.dev/docs/reference/configuration/sources/docker_logs/
- Reduce Transform: https://vector.dev/docs/reference/configuration/transforms/reduce/
- PostgreSQL Sink: https://vector.dev/docs/reference/configuration/sinks/postgres/
- 配置文件参考: https://vector.dev/docs/reference/configuration/
