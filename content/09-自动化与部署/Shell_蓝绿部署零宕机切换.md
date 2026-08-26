---
title: Shell 蓝绿部署零宕机切换
tags:
  - Shell
  - 运维
  - 部署
category: 自动化与部署
status: active
---

# Shell 蓝绿部署零宕机切换

## 目标

通过 Shell、systemd 和健康检查实现蓝绿环境切换，降低发布时服务中断风险，并保留快速回滚能力。

## 适用场景

- 单机或小规模服务发布。
- 服务可以同时运行蓝、绿两个实例。
- 上游通过 Nginx、网关或配置文件切换流量。
- 需要发布前健康检查和失败回滚。

## 参数配置

| 参数 | 示例 | 说明 |
|---|---|---|
| `BLUE_SERVICE` | `app-blue.service` | 蓝环境 systemd 服务 |
| `GREEN_SERVICE` | `app-green.service` | 绿环境 systemd 服务 |
| `HEALTH_URL` | `http://127.0.0.1:8081/health` | 新版本健康检查地址 |
| `UPSTREAM_CONF` | `/etc/nginx/conf.d/upstream.conf` | 流量切换配置 |
| `BACKUP_CONF` | `/etc/nginx/conf.d/upstream.conf.bak` | 回滚配置备份 |

## 核心逻辑

1. 判断当前线上环境是蓝还是绿。
2. 启动另一套环境。
3. 对新环境执行健康检查。
4. 健康检查通过后切换上游流量。
5. reload Nginx 或网关配置。
6. 验证新环境可用。
7. 如失败，恢复旧配置并回滚。

## 部署步骤

1. 准备蓝绿两个 systemd 服务。
2. 确认两个实例监听不同端口。
3. Nginx upstream 指向当前活动环境。
4. 发布脚本启动备用环境并健康检查。
5. 切换 upstream 并 reload Nginx。

## 常用命令

```bash
systemctl status app-blue.service
systemctl status app-green.service
curl -fsS http://127.0.0.1:8081/health
nginx -t
systemctl reload nginx
```

## 验证方法

```bash
curl -I http://127.0.0.1/health
systemctl status app-blue.service
systemctl status app-green.service
tail -50 /var/log/nginx/error.log
```

确认点：

- 新环境健康检查通过。
- Nginx 配置测试通过。
- reload 后服务不中断。
- 访问流量进入新环境。

## 风险与回滚

| 风险 | 处理方式 |
|---|---|
| 新版本启动失败 | 不切流量，保留旧环境 |
| 健康检查过于简单 | 健康检查应覆盖依赖和核心接口 |
| Nginx 配置错误 | 切换前执行 `nginx -t` |
| 切换后业务异常 | 恢复 upstream 备份并 reload |

回滚示例：

```bash
cp /etc/nginx/conf.d/upstream.conf.bak /etc/nginx/conf.d/upstream.conf
nginx -t
systemctl reload nginx
```

## 相关笔记

- [[systemd管理服务]]
- [[Nginx_安装与反向代理配置手册]]

