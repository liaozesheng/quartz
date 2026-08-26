---
title: Nginx 安装与反向代理配置手册
tags:
  - 运维
  - Nginx
  - 部署
category: 自动化与部署
status: active
---

# Nginx 安装与反向代理配置手册

## 目标

安装 Nginx，理解主配置文件结构，并使用 `conf.d` 目录维护站点配置，完成静态站点和后端 API 反向代理。

## 适用场景

- 新服务器安装 Nginx。
- 配置 Web 静态资源入口。
- 将 `/api/` 请求反向代理到后端服务。
- 修改配置后执行语法检查和热加载。
- 为 Docker、代理节点或其他 Web 服务提供统一入口。

## 安装方式

查询软件包：

```bash
dnf list nginx
```

安装 Nginx：

```bash
dnf install -y nginx
```

查看安装文件：

```bash
rpm -ql nginx
```

启动并设置开机自启：

```bash
systemctl enable --now nginx
systemctl status nginx
```

## 主配置结构

常见主配置文件：

```text
/etc/nginx/nginx.conf
```

关键配置项：

| 配置项 | 说明 |
|---|---|
| `user nginx;` | 指定 Nginx 工作进程用户 |
| `worker_processes auto;` | 自动匹配工作进程数量 |
| `error_log /var/log/nginx/error.log;` | 错误日志路径 |
| `pid /run/nginx.pid;` | 主进程 PID 文件 |
| `worker_connections 1024;` | 每个 worker 最大连接数 |
| `access_log /var/log/nginx/access.log main;` | 访问日志路径和日志格式 |
| `sendfile on;` | 启用高效文件传输 |
| `keepalive_timeout 65;` | HTTP 长连接超时时间 |
| `include /etc/nginx/conf.d/*.conf;` | 加载模块化站点配置 |

建议把具体站点放到 `conf.d` 中维护，不直接把大量业务配置堆进 `nginx.conf`。

## 站点配置示例

示例文件：

```text
/etc/nginx/conf.d/myapp.conf
```

```nginx
server {
    listen 8080;
    server_name myapp.example.com;

    location / {
        root /var/www/myapp;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

> [!warning]
> `location /api/` 的 `proxy_pass` 不要和当前 Nginx 监听端口互相指向，否则可能造成循环代理。

## 配置检查与加载

检查配置语法：

```bash
nginx -t
```

热加载配置：

```bash
nginx -s reload
```

使用 systemd 重新加载：

```bash
systemctl reload nginx
```

查看服务状态：

```bash
systemctl status nginx
```

查看监听端口：

```bash
ss -lntp | grep nginx
```

## 日志排查

访问日志：

```bash
tail -f /var/log/nginx/access.log
```

错误日志：

```bash
tail -f /var/log/nginx/error.log
```

常见检查点：

| 现象 | 检查项 |
|---|---|
| 页面打不开 | 端口、防火墙、`server_name`、站点根目录 |
| 反向代理失败 | 后端端口、`proxy_pass`、后端服务状态 |
| 静态文件 404 | `root` 路径、文件权限、`try_files` |
| 修改配置未生效 | 是否执行 `nginx -t` 和 reload |
| 502 Bad Gateway | 后端服务不可达或代理地址错误 |

## 风险与回滚

| 风险 | 处理方式 |
|---|---|
| 配置写错导致 reload 失败 | 先执行 `nginx -t`，失败时不 reload |
| 站点配置覆盖默认入口 | 修改前备份对应 `.conf` 文件 |
| 反向代理循环 | 确认 Nginx 监听端口和后端端口不同 |
| 权限不足 | 检查站点目录属主、权限和 SELinux |
| 生产流量中断 | 保留上一版配置，必要时恢复后 reload |

备份配置：

```bash
cp /etc/nginx/conf.d/myapp.conf /etc/nginx/conf.d/myapp.conf.bak
```

恢复配置：

```bash
cp /etc/nginx/conf.d/myapp.conf.bak /etc/nginx/conf.d/myapp.conf
nginx -t
systemctl reload nginx
```

## 相关笔记

- [[技术栈索引]]
- [[Docker_多服务_Web_负载均衡与_HTTPS]]
- [[Shell_监控_Nginx_高频恶意_IP_自动封禁]]
- [[Xray_VLESS_XTLS_Trojan_代理节点部署手册]]
