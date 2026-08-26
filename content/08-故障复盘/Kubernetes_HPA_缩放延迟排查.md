---
title: Kubernetes HPA 缩放延迟排查
tags:
  - Kubernetes
  - 运维
  - 故障复盘
  - 排障手册
category: 故障复盘
status: active
---

# Kubernetes HPA 缩放延迟排查

## 现象

业务负载升高后，HPA 没有及时扩容，或者扩容后迟迟没有达到期望副本数。也可能出现指标为空、缩放不触发、扩容后 Pod Pending。

```bash
kubectl get hpa -A
```

常见影响：

- 高峰期副本数不足。
- 服务响应变慢。
- CPU 或内存持续高位。
- HPA 显示 `unknown` 或指标获取失败。

## 环境

- 集群：Kubernetes
- 对象：HPA / Deployment / Metrics Server
- 常用命令：`kubectl describe hpa`, `kubectl top pods`

## 排查过程

1. 查看 HPA 当前状态。

```bash
kubectl get hpa -n <namespace>
kubectl describe hpa <hpa-name> -n <namespace>
```

2. 查看指标是否能获取。

```bash
kubectl top nodes
kubectl top pods -n <namespace>
```

3. 查看目标 Deployment 副本状态。

```bash
kubectl get deployment <deployment-name> -n <namespace>
kubectl describe deployment <deployment-name> -n <namespace>
```

4. 查看新 Pod 是否因为调度或配额问题卡住。

```bash
kubectl get pods -n <namespace> -o wide
kubectl get events -n <namespace> --sort-by=.lastTimestamp
```

5. 检查 Metrics Server。

```bash
kubectl get pods -n kube-system | grep metrics
kubectl logs -n kube-system <metrics-server-pod>
```

## 常见根因

| 根因 | 典型表现 | 排查方向 |
|---|---|---|
| Metrics Server 异常 | HPA 指标 unknown | 检查 metrics-server Pod 和日志 |
| Pod 没有 requests | CPU 利用率无法计算 | 检查 resources.requests |
| 指标延迟 | 高峰后过一段时间才扩容 | 理解 HPA 同步周期和指标窗口 |
| min/max 副本不合理 | HPA 到达 max 后不再扩容 | 调整 minReplicas/maxReplicas |
| 扩容后 Pod Pending | HPA 已扩容但 Pod 起不来 | 继续查调度、配额、资源 |
| readiness 延迟 | 新 Pod 未及时接流量 | 检查 readinessProbe 和启动时间 |

## 解决方法

### 指标获取失败

```bash
kubectl top pods -n <namespace>
kubectl describe hpa <hpa-name> -n <namespace>
```

处理方式：

- 修复 Metrics Server。
- 确认 kubelet metrics 可访问。
- 检查 HPA 指标配置。

### Pod requests 缺失

HPA 使用 CPU 利用率时，需要 Pod 设置 CPU requests。

```yaml
resources:
  requests:
    cpu: "200m"
    memory: "256Mi"
  limits:
    cpu: "1"
    memory: "512Mi"
```

处理方式：

- 为容器补充合理 requests。
- 重新应用 Deployment。
- 观察 HPA 是否能正确计算指标。

### 扩容后 Pod Pending

```bash
kubectl get pods -n <namespace> -o wide
kubectl describe pod <pod-name> -n <namespace>
```

处理方式：

- 按 [[Kubernetes_Pod_Pending_排查]] 继续查。
- 检查 ResourceQuota。
- 检查节点资源是否足够。

### 副本范围不合理

```bash
kubectl get hpa <hpa-name> -n <namespace> -o yaml
```

处理方式：

- 提高 `maxReplicas`。
- 调整目标利用率。
- 高峰前适当提高 `minReplicas`。

## 验证结果

```bash
kubectl get hpa -n <namespace> -w
kubectl get deployment <deployment-name> -n <namespace>
kubectl top pods -n <namespace>
```

确认点：

- HPA 能看到正常指标。
- 副本数按负载扩缩。
- 新 Pod 能正常 Running 和 Ready。
- 服务响应恢复。

## 预防措施

- 所有可被 HPA 管理的 Pod 都设置合理 requests。
- 监控 Metrics Server 状态。
- 对 HPA 到达 maxReplicas 建立告警。
- 高峰业务提前设置合适的 minReplicas。
- HPA 扩容链路要同时考虑节点资源和 ResourceQuota。

## 相关笔记

- [[Kubernetes_ResourceQuota_资源超限排查]]
- [[Kubernetes_Pod_Pending_排查]]

