---
title: Shell 核心业务 OOM 保护
tags:
  - Shell
  - Linux
  - 运维
  - 自动化
category: 自动化与部署
status: active
---

# Shell 核心业务 OOM 保护

## 目标

通过 systemd、`oom_score_adj`、资源限制和监控策略，降低核心业务进程在内存压力下被系统 OOM Killer 杀掉的风险。

## 适用场景

- 核心业务进程不能被随意杀掉。
- 机器上同时运行多个非核心服务。
- 需要给不同服务设置内存优先级。
- 需要在内存压力出现前告警和保护。

## 关键概念

| 配置 | 示例 | 说明 |
|---|---|---|
| `oom_score_adj` | `-900` | 越低越不容易被 OOM Killer 选中 |
| `MemoryMax` | `2G` | systemd 限制服务最大内存 |
| `MemoryHigh` | `1.5G` | 达到后触发压力控制 |
| `Restart` | `on-failure` | 异常退出后自动拉起 |

## systemd 配置示例

```ini
[Service]
OOMScoreAdjust=-900
MemoryHigh=1500M
MemoryMax=2G
Restart=on-failure
RestartSec=5
```

重载配置：

```bash
systemctl daemon-reload
systemctl restart <service-name>
```

## 排查与验证

查看进程 OOM 分数：

```bash
cat /proc/<pid>/oom_score
cat /proc/<pid>/oom_score_adj
```

查看服务资源配置：

```bash
systemctl show <service-name> | grep -E 'OOM|Memory|Restart'
systemctl status <service-name>
```

查看系统 OOM 记录：

```bash
dmesg -T | grep -i oom
journalctl -k | grep -i oom
```

## 部署前检查

```bash
free -h
systemctl status <service-name>
systemctl cat <service-name>
```

确认点：

- 核心服务明确。
- 非核心服务可以被限制或降级。
- 内存上限不会反过来压垮核心服务。
- 已有告警能覆盖内存使用率和 OOM 事件。

## 风险与回滚

| 风险 | 处理方式 |
|---|---|
| 只保护核心服务，导致系统整体无内存 | 仍需控制总内存和非核心服务 |
| `MemoryMax` 设置过低 | 根据真实峰值调整 |
| OOM 优先级配置错误 | 验证 `/proc/<pid>/oom_score_adj` |
| 掩盖内存泄漏 | 保护不是治本，还要排查泄漏 |

回滚：

```bash
systemctl edit <service-name>
systemctl daemon-reload
systemctl restart <service-name>
```

删除或调整 override 中的 OOM/Memory 配置即可。

## 相关笔记

- [[Linux_CPU_告警排查]]
- [[systemd管理服务]]
- [[Shell_核心服务进程自愈守护]]

