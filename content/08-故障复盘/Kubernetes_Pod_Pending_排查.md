---
title: Kubernetes Pod Pending 排查
tags:
  - Kubernetes
  - 运维
  - 故障复盘
  - 排障手册
category: 故障复盘
status: active
---

# Kubernetes Pod Pending 排查

## 现象

Pod 长时间停留在 `Pending`，没有被调度到任何 Node，业务实例无法启动。

```bash
kubectl get pods -A -o wide
```

常见表现：

- `READY` 为 `0/1`。
- `STATUS` 为 `Pending`。
- `NODE` 为空。
- Deployment 副本数一直不满足期望。

## 环境

- 集群：Kubernetes
- 对象：Pod / Deployment / StatefulSet
- 常用命令：`kubectl describe pod`, `kubectl get events`

## 排查过程

1. 查看 Pod 状态和所在 Namespace。

```bash
kubectl get pods -A -o wide
```

2. 查看 Pod 事件，重点看 `FailedScheduling`。

```bash
kubectl describe pod <pod-name> -n <namespace>
```

3. 查看集群近期事件。

```bash
kubectl get events -A --sort-by=.lastTimestamp
```

4. 查看节点资源和状态。

```bash
kubectl get nodes -o wide
kubectl describe node <node-name>
kubectl top nodes
```

5. 检查 Pod 的 requests、nodeSelector、affinity、tolerations、PVC。

```bash
kubectl get pod <pod-name> -n <namespace> -o yaml
```

## 常见根因

| 根因 | 事件特征 | 排查方向 |
|---|---|---|
| CPU 或内存不足 | `Insufficient cpu`, `Insufficient memory` | 调整 requests 或扩容节点 |
| 节点污点不匹配 | `taint` / `toleration` | 检查 Node taints 和 Pod tolerations |
| nodeSelector 不匹配 | `node(s) didn't match Pod's node affinity/selector` | 检查标签和选择器 |
| 亲和性规则过严 | `node affinity` | 放宽 affinity 或补节点标签 |
| PVC 未绑定 | `pod has unbound immediate PersistentVolumeClaims` | 检查 PVC/PV/StorageClass |
| ResourceQuota 限制 | `exceeded quota` | 检查 Namespace 配额 |

## 解决方法

### 资源不足

```bash
kubectl describe pod <pod-name> -n <namespace>
kubectl top nodes
```

处理方式：

- 降低不合理的 `resources.requests`。
- 扩容节点。
- 迁移或清理低优先级工作负载。
- 检查是否需要 Cluster Autoscaler。

### 污点和容忍不匹配

```bash
kubectl describe node <node-name> | grep -i taints
kubectl get pod <pod-name> -n <namespace> -o yaml
```

处理方式：

- 给 Pod 增加合适的 `tolerations`。
- 或移除不必要的 Node taint。

### PVC 未绑定

```bash
kubectl get pvc -n <namespace>
kubectl describe pvc <pvc-name> -n <namespace>
kubectl get storageclass
```

处理方式：

- 修复 StorageClass。
- 创建匹配的 PV。
- 检查动态供给插件是否正常。

## 验证结果

```bash
kubectl get pod <pod-name> -n <namespace> -o wide
kubectl describe pod <pod-name> -n <namespace>
```

确认点：

- Pod 从 `Pending` 变为 `Running`。
- `Events` 中不再出现新的 `FailedScheduling`。
- Deployment / StatefulSet 副本数恢复期望。

## 预防措施

- 给 Namespace 设置合理的 ResourceQuota 和 LimitRange。
- 定期检查节点可分配资源。
- Pod requests 按真实负载评估，避免随手写过大。
- 对 PVC 绑定失败和调度失败事件建立告警。
- 对节点标签、污点和亲和性规则做变更记录。

## 相关笔记


