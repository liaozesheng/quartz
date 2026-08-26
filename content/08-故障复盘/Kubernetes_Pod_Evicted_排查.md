---
title: Kubernetes Pod Evicted 排查
tags:
  - Kubernetes
  - 运维
  - 故障复盘
  - 排障手册
category: 故障复盘
status: active
---

# Kubernetes Pod Evicted 排查

## 现象

Pod 状态显示为 `Evicted`，表示它被 Kubelet 从节点上驱逐。常见原因是节点出现内存、磁盘或 inode 等资源压力。

```bash
kubectl get pods -A | grep Evicted
```

常见影响：

- 服务副本数减少。
- 节点出现 `MemoryPressure`、`DiskPressure`、`PIDPressure`。
- 同一节点上多个 Pod 被驱逐。

## 环境

- 集群：Kubernetes
- 对象：Pod / Node
- 常用命令：`kubectl describe node`, `kubectl describe pod`

## 排查过程

1. 查看被驱逐的 Pod。

```bash
kubectl get pods -A | grep Evicted
```

2. 查看 Pod 驱逐原因。

```bash
kubectl describe pod <pod-name> -n <namespace>
```

3. 查看节点状态和压力条件。

```bash
kubectl get nodes
kubectl describe node <node-name>
```

4. 查看节点资源使用。

```bash
kubectl top nodes
kubectl top pods -A
```

5. 如果怀疑磁盘压力，登录节点检查。

```bash
df -h
df -i
du -xh --max-depth=1 /var/lib/containerd | sort -rh
```

## 常见根因

| 根因 | Node 条件 | 排查方向 |
|---|---|---|
| 内存压力 | `MemoryPressure=True` | Pod 内存使用、limits、系统内存 |
| 磁盘压力 | `DiskPressure=True` | 镜像、容器层、日志、临时文件 |
| inode 耗尽 | `DiskPressure=True` | 小文件过多、日志碎片 |
| PID 压力 | `PIDPressure=True` | 进程数异常、fork 风暴 |
| ephemeral-storage 超限 | Pod 被驱逐事件中出现存储超限 | 检查临时存储 requests/limits |

## 解决方法

### 磁盘压力

```bash
kubectl describe node <node-name>
df -h
du -xh --max-depth=1 /var | sort -rh
docker system df
```

处理方式：

- 清理无用镜像和停止容器。
- 清理异常增长日志。
- 检查 `/var/lib/containerd`。
- 给节点扩容磁盘。

### 内存压力

```bash
kubectl top pods -A
kubectl describe pod <pod-name> -n <namespace>
```

处理方式：

- 为关键 Pod 设置合理 requests/limits。
- 优化高内存 Pod。
- 扩容节点或迁移工作负载。

### 清理 Evicted Pod 记录

确认问题处理后，可以清理已经 Evicted 的 Pod 记录。

```bash
kubectl get pods -A | grep Evicted
```

按 Namespace 删除时要谨慎，先确认对象不再需要保留现场。

```bash
kubectl delete pod <pod-name> -n <namespace>
```

## 验证结果

```bash
kubectl get nodes
kubectl describe node <node-name>
kubectl get pods -A
```

确认点：

- Node 不再显示 `DiskPressure`、`MemoryPressure`。
- 新 Pod 可以正常调度和运行。
- 服务副本数恢复。
- 节点磁盘、内存使用率回到安全范围。

## 预防措施

- 为节点磁盘、inode、内存设置监控告警。
- 给 Pod 配置合理的 requests/limits。
- 控制容器日志大小和保留时间。
- 定期清理未使用镜像。
- 对临时存储使用量大的服务配置 `ephemeral-storage`。

## 相关笔记

- [[containerd_占用磁盘空间过大]]
- [[Linux_磁盘空间爆满排查]]

