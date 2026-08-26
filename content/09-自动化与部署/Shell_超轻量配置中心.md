---
title: Shell 超轻量配置中心
tags:
  - Shell
  - 运维
  - 自动化
category: 自动化与部署
status: active
---

# Shell 超轻量配置中心

## 目标

用 Shell 和简单文件存储实现轻量级配置分发，让小规模服务可以统一读取、更新和回滚配置。

## 适用场景

- 服务规模较小，不想引入 Nacos、Apollo 等完整配置中心。
- 配置更新频率不高，但需要统一管理。
- 需要保留配置版本和回滚能力。
- 适合内部工具、脚本系统、小型服务集群。

## 参数配置

| 参数 | 示例 | 说明 |
|---|---|---|
| `CONFIG_REPO` | `/data/config-center` | 配置仓库目录 |
| `APP_NAME` | `order-service` | 应用名 |
| `ENV` | `prod` | 环境 |
| `VERSION_DIR` | `versions` | 历史版本目录 |
| `CURRENT_LINK` | `current` | 当前配置软链接 |

## 目录结构

```text
/data/config-center/
├── order-service/
│   ├── prod/
│   │   ├── current -> versions/2026-06-08-120000
│   │   └── versions/
│   │       └── 2026-06-08-120000/
│   │           └── app.env
```

## 核心逻辑

1. 按应用和环境存放配置。
2. 每次发布配置生成一个新版本目录。
3. `current` 软链接指向当前版本。
4. 服务读取 `current/app.env`。
5. 回滚时切换软链接到旧版本。

## 常用命令

发布新配置：

```bash
version="$(date '+%Y-%m-%d-%H%M%S')"
mkdir -p "/data/config-center/order-service/prod/versions/$version"
cp app.env "/data/config-center/order-service/prod/versions/$version/app.env"
ln -sfn "versions/$version" "/data/config-center/order-service/prod/current"
```

读取配置：

```bash
set -a
. /data/config-center/order-service/prod/current/app.env
set +a
```

回滚：

```bash
ln -sfn versions/<old-version> /data/config-center/order-service/prod/current
```

## 验证方法

```bash
ls -l /data/config-center/order-service/prod/current
cat /data/config-center/order-service/prod/current/app.env
systemctl restart order-service
systemctl status order-service
```

确认点：

- `current` 指向正确版本。
- 配置文件语法正确。
- 服务重启后读取新配置。
- 旧版本仍可回滚。

## 风险与回滚

| 风险 | 处理方式 |
|---|---|
| 配置语法错误 | 发布前做 shellcheck 或 source 测试 |
| 敏感信息泄露 | 控制目录权限，不把密钥写入公共仓库 |
| 多节点配置不一致 | 用 rsync 或 Git 同步 |
| 回滚版本丢失 | 保留固定数量历史版本 |

## 相关笔记

- [[Shell_蓝绿部署零宕机切换]]
- [[systemd管理服务]]

