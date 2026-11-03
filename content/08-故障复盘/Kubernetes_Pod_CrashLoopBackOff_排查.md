---
title: Kubernetes Pod CrashLoopBackOff 排查
tags:
  - Kubernetes
  - 运维
  - 故障复盘
  - 排障手册
category: 故障复盘
status: active
---

# Kubernetes Pod CrashLoopBackOff 排查

## 现象

Pod 反复启动失败，状态显示为 `CrashLoopBackOff`。这表示容器启动后很快退出，Kubelet 按退避策略不断重启它。

```bash
kubectl get pods -A
```

常见表现：

- `RESTARTS` 持续增加。
- `kubectl logs` 能看到应用启动错误。
- 服务不可用或副本数不足。

## 环境

- 集群：Kubernetes
- 对象：Pod / Deployment / StatefulSet
- 常用命令：`kubectl logs`, `kubectl describe pod`

## 排查过程

1. 查看 Pod 状态和重启次数。

```bash
kubectl get pod <pod-name> -n <namespace> -o wide
```

2. 查看当前容器日志。

```bash
kubectl logs <pod-name> -n <namespace>
```

3. 查看上一次崩溃前的日志。

```bash
kubectl logs <pod-name> -n <namespace> --previous
```

4. 查看 Pod 事件、探针失败、镜像和资源限制。

```bash
kubectl describe pod <pod-name> -n <namespace>
```

5. 查看 YAML 配置。

```bash
kubectl get pod <pod-name> -n <namespace> -o yaml
```

## 常见根因

| 根因 | 典型表现 | 排查方向 |
|---|---|---|
| 应用启动失败 | 日志中有异常堆栈 | 检查配置、依赖、启动命令 |
| 环境变量缺失 | 报配置项不存在 | 检查 ConfigMap、Secret、env |
| 启动命令错误 | 容器立即退出 | 检查 command、args、镜像入口 |
| 依赖服务不可达 | 连接数据库、MQ、Redis 失败 | 检查 Service、DNS、网络策略 |
| 探针配置不合理 | `Liveness probe failed` | 调整 initialDelay、path、timeout |
| OOMKilled | 退出原因是 OOM | 检查 limits、内存使用 |

## 解决方法

### 查看崩溃原因

```bash
kubectl logs <pod-name> -n <namespace> --previous
kubectl describe pod <pod-name> -n <namespace>
```

重点看：

- `Last State`
- `Reason`
- `Exit Code`
- `Events`

### 修复应用配置

```bash
kubectl get configmap -n <namespace>
kubectl get secret -n <namespace>
kubectl describe configmap <name> -n <namespace>
```

处理方式：

- 补齐缺失配置。
- 修正环境变量名。
- 检查 Secret 是否挂载到正确路径。

### 修复探针问题

如果应用启动慢，但 liveness probe 太早触发，会导致容器刚启动就被杀。

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 60
  timeoutSeconds: 5
```

处理方式：

- 增大 `initialDelaySeconds`。
- 区分 readiness 和 liveness。
- 确认探针路径和端口正确。

### 修复 OOMKilled

```bash
kubectl describe pod <pod-name> -n <namespace>
kubectl top pod <pod-name> -n <namespace>
```

处理方式：

- 提高内存 limit。
- 优化应用内存占用。
- 检查是否存在内存泄漏。

## 验证结果

```bash
kubectl get pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace>
```

确认点：

- Pod 状态变为 `Running`。
- `RESTARTS` 不再增加。
- readiness probe 通过。
- 业务接口恢复。

## 预防措施

- 发布前检查 ConfigMap、Secret、启动命令。
- 对探针设置合理延迟。
- 对重启次数建立告警。
- 应用启动日志要明确输出失败原因。
- 资源 limits 按真实峰值评估。

## 相关笔记


