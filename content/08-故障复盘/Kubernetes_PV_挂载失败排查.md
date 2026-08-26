---
title: Kubernetes PV 挂载失败排查
tags:
  - Kubernetes
  - 运维
  - 故障复盘
  - 排障手册
category: 故障复盘
status: active
---

# Kubernetes PV 挂载失败排查

## 现象

Pod 无法正常启动，事件中出现 PVC 未绑定、Volume attach/mount 失败、StorageClass 不存在或存储后端不可用等信息。

```bash
kubectl get pods -A
kubectl get pvc -A
```

常见影响：

- Pod 长时间 Pending。
- StatefulSet 无法扩容或滚动更新。
- 应用数据目录无法挂载。
- 业务启动失败或数据不可写。

## 环境

- 集群：Kubernetes
- 对象：PV / PVC / Pod / StorageClass
- 常用命令：`kubectl describe pvc`, `kubectl describe pod`

## 排查过程

1. 查看 Pod 状态和事件。

```bash
kubectl get pod <pod-name> -n <namespace> -o wide
kubectl describe pod <pod-name> -n <namespace>
```

2. 查看 PVC 状态。

```bash
kubectl get pvc -n <namespace>
kubectl describe pvc <pvc-name> -n <namespace>
```

3. 查看 PV 状态。

```bash
kubectl get pv
kubectl describe pv <pv-name>
```

4. 查看 StorageClass。

```bash
kubectl get storageclass
kubectl describe storageclass <storageclass-name>
```

5. 如果使用 CSI，查看 CSI 组件状态。

```bash
kubectl get pods -A | grep -i csi
kubectl get events -A --sort-by=.lastTimestamp
```

## 常见根因

| 根因 | 典型表现 | 排查方向 |
|---|---|---|
| PVC 未绑定 | PVC 为 `Pending` | StorageClass、PV、动态供给 |
| StorageClass 不存在 | 事件提示 storageclass not found | 检查 PVC 中的 `storageClassName` |
| 容量不匹配 | PVC 请求容量大于 PV | 调整 PVC 或创建更大 PV |
| accessModes 不匹配 | 绑定失败或挂载失败 | `ReadWriteOnce`、`ReadOnlyMany`、`ReadWriteMany` |
| 节点无法访问存储 | mount timeout / attach failed | 网络、权限、存储后端 |
| CSI 插件异常 | CSI Pod CrashLoop 或事件报错 | CSI controller/node 日志 |

## 解决方法

### PVC 未绑定

```bash
kubectl describe pvc <pvc-name> -n <namespace>
kubectl get storageclass
kubectl get pv
```

处理方式：

- 确认 `storageClassName` 是否存在。
- 确认是否有满足容量和 accessModes 的 PV。
- 如果使用动态供给，检查 CSI provisioner 是否正常。

### StorageClass 配置问题

```bash
kubectl describe storageclass <storageclass-name>
```

处理方式：

- 修正 PVC 中的 `storageClassName`。
- 创建正确的 StorageClass。
- 检查默认 StorageClass 是否符合预期。

### 挂载到节点失败

```bash
kubectl describe pod <pod-name> -n <namespace>
kubectl describe node <node-name>
```

处理方式：

- 检查节点到存储后端的网络。
- 检查存储权限、账号、Secret。
- 检查 kubelet 和 CSI node 插件日志。

### CSI 组件异常

```bash
kubectl get pods -A | grep -i csi
kubectl logs <csi-pod-name> -n <namespace>
```

处理方式：

- 修复 CSI controller 或 node 组件。
- 检查 CSI 版本和 Kubernetes 版本兼容性。
- 检查存储后端是否可用。

## 验证结果

```bash
kubectl get pvc -n <namespace>
kubectl get pv
kubectl get pod <pod-name> -n <namespace> -o wide
```

确认点：

- PVC 状态变为 `Bound`。
- Pod 从 Pending/ContainerCreating 变为 Running。
- Pod 事件中不再出现新的 mount/attach 错误。
- 应用可以正常读写挂载目录。

## 预防措施

- 为常用存储类型维护清晰的 StorageClass。
- PVC 模板里显式写明 `storageClassName` 和 accessModes。
- 对 CSI 组件状态建立告警。
- 对存储后端容量、权限、网络连通性做监控。
- StatefulSet 上线前先用测试 Pod 验证 PVC 挂载。

## 相关笔记

- [[Kubernetes_Pod_Pending_排查]]
- [[Kubernetes_Node_NotReady_排查]]

