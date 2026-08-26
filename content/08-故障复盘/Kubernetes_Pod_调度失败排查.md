---
title: Kubernetes Pod 调度失败排查
tags:
  - Kubernetes
  - 运维
  - 故障复盘
  - 排障手册
category: 故障复盘
status: active
---

# Kubernetes Pod 调度失败排查

## 现象

Pod 创建后无法被调度到节点，通常表现为 `Pending`，事件中出现 `FailedScheduling`。这类问题的核心是：调度器找不到满足条件的 Node。

```bash
kubectl get pods -A -o wide
```

常见影响：

- Deployment 或 StatefulSet 副本数不足。
- 新版本发布卡住。
- HPA 扩容后新 Pod 无法运行。
- 业务容量不足。

## 环境

- 集群：Kubernetes
- 对象：Pod / Node / Scheduler
- 常用命令：`kubectl describe pod`, `kubectl get events`

## 排查过程

1. 查看 Pod 是否 Pending。

```bash
kubectl get pod <pod-name> -n <namespace> -o wide
```

2. 查看 Pod 事件，重点看 `FailedScheduling` 的 message。

```bash
kubectl describe pod <pod-name> -n <namespace>
```

3. 查看 Namespace 事件。

```bash
kubectl get events -n <namespace> --sort-by=.lastTimestamp
```

4. 查看节点状态和资源。

```bash
kubectl get nodes -o wide
kubectl describe node <node-name>
kubectl top nodes
```

5. 查看 Pod 调度约束。

```bash
kubectl get pod <pod-name> -n <namespace> -o yaml
```

重点检查：

- `resources.requests`
- `nodeSelector`
- `affinity`
- `tolerations`
- `topologySpreadConstraints`
- PVC 和 StorageClass

## 常见根因

| 根因 | 事件特征 | 排查方向 |
|---|---|---|
| 节点资源不足 | `Insufficient cpu/memory` | 降低 requests 或扩容节点 |
| 节点污点不容忍 | `had untolerated taint` | 检查 taints/tolerations |
| nodeSelector 不匹配 | `didn't match Pod's node affinity/selector` | 检查节点标签 |
| 亲和性规则过严 | `node affinity` | 放宽 affinity |
| 拓扑分布约束过严 | `topology spread constraints` | 检查 zone/hostname 分布 |
| PVC 未绑定 | `unbound immediate PersistentVolumeClaims` | 检查 PVC/PV/StorageClass |
| ResourceQuota 超限 | `exceeded quota` | 检查 Namespace 配额 |

## 解决方法

### 资源不足

```bash
kubectl describe pod <pod-name> -n <namespace>
kubectl top nodes
kubectl describe node <node-name>
```

处理方式：

- 调整 Pod `resources.requests`。
- 扩容节点。
- 迁移或清理低优先级负载。
- 检查 HPA 扩容后是否受节点资源限制。

### 污点和容忍不匹配

```bash
kubectl describe node <node-name> | grep -i taints
kubectl get pod <pod-name> -n <namespace> -o yaml
```

处理方式：

- 给 Pod 添加正确的 `tolerations`。
- 或移除不必要的 Node taint。

### 节点标签或亲和性不匹配

```bash
kubectl get nodes --show-labels
kubectl get pod <pod-name> -n <namespace> -o yaml
```

处理方式：

- 修正 `nodeSelector`。
- 放宽 `nodeAffinity`。
- 给目标节点补正确标签。

### PVC 未绑定

```bash
kubectl get pvc -n <namespace>
kubectl describe pvc <pvc-name> -n <namespace>
```

处理方式：

- 修复 StorageClass。
- 创建匹配 PV。
- 检查动态供给组件。

### ResourceQuota 超限

```bash
kubectl describe resourcequota -n <namespace>
kubectl get events -n <namespace> --sort-by=.lastTimestamp
```

处理方式：

- 降低副本数或 requests。
- 清理无用资源。
- 合理调整 Namespace 配额。

## 验证结果

```bash
kubectl get pod <pod-name> -n <namespace> -o wide
kubectl describe pod <pod-name> -n <namespace>
```

确认点：

- Pod 成功绑定到 Node。
- 状态从 `Pending` 变为 `Running`。
- 不再出现新的 `FailedScheduling`。
- 关联 Deployment/StatefulSet 副本数恢复。

## 预防措施

- 统一管理节点标签、污点和调度约束。
- Pod requests 按真实负载评估，避免过大。
- 关键 Namespace 配额使用率建立告警。
- 发布前验证 PVC 是否可绑定。
- HPA 扩容链路同时评估节点资源和配额。

## 相关笔记

- [[Kubernetes_Pod_Pending_排查]]
- [[Kubernetes_ResourceQuota_资源超限排查]]
- [[Kubernetes_PV_挂载失败排查]]
- [[Kubernetes_HPA_缩放延迟排查]]

