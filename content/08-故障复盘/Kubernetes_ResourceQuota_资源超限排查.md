---
title: Kubernetes ResourceQuota 资源超限排查
tags:
  - Kubernetes
  - 运维
  - 故障复盘
  - 排障手册
category: 故障复盘
status: active
---

# Kubernetes ResourceQuota 资源超限排查

## 现象

在 Namespace 中创建 Pod、PVC、Service 或其他资源时失败，事件或命令输出提示超过 ResourceQuota 限制。

```bash
kubectl get resourcequota -n <namespace>
```

常见表现：

- Pod 创建失败。
- Deployment 副本无法扩容。
- PVC 创建失败。
- `kubectl apply` 报 `exceeded quota`。

## 环境

- 集群：Kubernetes
- 对象：ResourceQuota / LimitRange / Pod / PVC
- 常用命令：`kubectl describe quota`, `kubectl get events`

## 排查过程

1. 查看 Namespace 下的配额。

```bash
kubectl get resourcequota -n <namespace>
kubectl describe resourcequota -n <namespace>
```

2. 查看最近事件，确认具体超限项。

```bash
kubectl get events -n <namespace> --sort-by=.lastTimestamp
```

3. 查看当前资源使用情况。

```bash
kubectl get pods -n <namespace>
kubectl get pvc -n <namespace>
kubectl get all -n <namespace>
```

4. 如果涉及 requests/limits，查看 Pod 配置。

```bash
kubectl get pod <pod-name> -n <namespace> -o yaml
```

5. 如果有 LimitRange，检查默认 requests/limits。

```bash
kubectl get limitrange -n <namespace>
kubectl describe limitrange -n <namespace>
```

## 常见根因

| 根因 | 典型表现 | 排查方向 |
|---|---|---|
| CPU requests 超限 | `requests.cpu` exceeded quota | Pod requests 设置过大或副本过多 |
| 内存 requests 超限 | `requests.memory` exceeded quota | 内存申请超过 Namespace 配额 |
| Pod 数量超限 | `count/pods` exceeded quota | 副本数过多或旧 Pod 未清理 |
| PVC 数量或存储超限 | `persistentvolumeclaims` / `requests.storage` exceeded | PVC 数量或容量过大 |
| LimitRange 默认值叠加 | 未显式设置 requests 也被计算 | 检查 LimitRange 默认资源 |

## 解决方法

### 调整工作负载资源申请

```bash
kubectl describe resourcequota -n <namespace>
kubectl get deployment <deployment-name> -n <namespace> -o yaml
```

处理方式：

- 降低不合理的 `resources.requests`。
- 减少副本数。
- 清理不用的 Pod、Job、PVC。
- 按业务实际容量重新评估配额。

### 调整 ResourceQuota

如果业务确实需要更多资源，可以调整 Namespace 配额。

```bash
kubectl edit resourcequota <quota-name> -n <namespace>
```

调整前要确认：

- 集群总资源是否足够。
- 是否会影响其他 Namespace。
- 是否符合团队或租户配额策略。

### 检查 LimitRange

```bash
kubectl describe limitrange -n <namespace>
```

如果 LimitRange 自动给 Pod 加了默认 requests/limits，可能导致看起来没有设置资源，但实际仍被配额计算。

## 验证结果

```bash
kubectl describe resourcequota -n <namespace>
kubectl get events -n <namespace> --sort-by=.lastTimestamp
kubectl get pod -n <namespace>
```

确认点：

- 新资源可以创建。
- Deployment 副本恢复期望数量。
- ResourceQuota `Used` 没有超过 `Hard`。
- 不再出现新的 `exceeded quota` 事件。

## 预防措施

- 为 Namespace 设计合理的 ResourceQuota。
- Pod requests/limits 按真实负载评估。
- 对配额使用率建立告警。
- 定期清理不用的 PVC、Job、Pod。
- 记录配额调整原因，避免无限放大。

## 相关笔记

- [[Kubernetes_Pod_Pending_排查]]
- [[Kubernetes_HPA_缩放延迟排查]]

