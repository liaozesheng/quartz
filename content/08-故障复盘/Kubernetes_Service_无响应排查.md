---
title: Kubernetes Service 无响应排查
tags:
  - Kubernetes
  - 运维
  - 故障复盘
  - 排障手册
category: 故障复盘
status: active
---

# Kubernetes Service 无响应排查

## 现象

通过 Service 访问应用时无响应、连接失败、超时，或者返回的不是预期后端。Pod 本身可能是 Running，但服务访问链路不通。

```bash
kubectl get svc -A
```

常见影响：

- 集群内其他服务无法访问该应用。
- Ingress 或网关转发失败。
- Service 有 ClusterIP，但没有正常后端。
- 业务请求超时或返回 502/503。

## 环境

- 集群：Kubernetes
- 对象：Service / EndpointSlice / Pod
- 常用命令：`kubectl get svc`, `kubectl get endpoints`, `kubectl describe svc`

## 排查过程

1. 查看 Service 配置。

```bash
kubectl get svc <service-name> -n <namespace> -o wide
kubectl describe svc <service-name> -n <namespace>
```

2. 查看 Service 是否有后端 Endpoint。

```bash
kubectl get endpoints <service-name> -n <namespace>
kubectl get endpointslice -n <namespace> | grep <service-name>
```

3. 检查 Service selector 是否能匹配到 Pod。

```bash
kubectl get svc <service-name> -n <namespace> -o yaml
kubectl get pods -n <namespace> --show-labels
```

4. 检查 Pod 是否 Ready。

```bash
kubectl get pods -n <namespace> -o wide
kubectl describe pod <pod-name> -n <namespace>
```

5. 从集群内部测试访问。

```bash
kubectl run debug -n <namespace> --rm -it --image=busybox:1.36 -- sh
wget -S -O- http://<service-name>:<port>
```

## 常见根因

| 根因 | 典型表现 | 排查方向 |
|---|---|---|
| selector 不匹配 | Endpoints 为空 | 检查 Service selector 和 Pod labels |
| Pod 未 Ready | Endpoints 为空或不完整 | 检查 readinessProbe |
| targetPort 配错 | 有 Endpoint 但访问失败 | 检查 Service port/targetPort/containerPort |
| 应用未监听端口 | 连接拒绝 | 进入 Pod 检查监听端口 |
| NetworkPolicy 限制 | 某些来源访问失败 | 检查 NetworkPolicy |
| kube-proxy/CNI 异常 | 多个 Service 异常 | 检查 kube-proxy、CNI 状态 |

## 解决方法

### selector 不匹配

```bash
kubectl get svc <service-name> -n <namespace> -o yaml
kubectl get pods -n <namespace> --show-labels
kubectl get endpoints <service-name> -n <namespace>
```

处理方式：

- 修正 Service selector。
- 或修正 Pod labels。
- 确认 Endpoints 能自动生成。

### targetPort 配置错误

```bash
kubectl describe svc <service-name> -n <namespace>
kubectl get pod <pod-name> -n <namespace> -o yaml
```

处理方式：

- 确认 Service 的 `targetPort` 指向容器实际监听端口。
- 检查容器 `containerPort` 和应用启动参数。

### Pod 未 Ready

```bash
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace>
```

处理方式：

- 修复 readinessProbe。
- 修复应用启动失败或依赖异常。
- 确认 Pod Ready 后再测试 Service。

### 网络策略或组件异常

```bash
kubectl get networkpolicy -n <namespace>
kubectl get pods -n kube-system -o wide
```

处理方式：

- 检查 NetworkPolicy 是否限制来源。
- 检查 kube-proxy 和 CNI 插件状态。
- 如果多个 Service 同时异常，优先排查集群网络组件。

## 验证结果

```bash
kubectl get endpoints <service-name> -n <namespace>
kubectl run debug -n <namespace> --rm -it --image=busybox:1.36 -- wget -S -O- http://<service-name>:<port>
```

确认点：

- Service 有正常 Endpoint。
- Pod Ready。
- 集群内访问 Service 成功。
- Ingress 或上游网关访问恢复。

## 预防措施

- 发布前检查 Service selector 和 Pod labels。
- Service port、targetPort、应用监听端口保持一致。
- readinessProbe 不要误伤正常 Pod。
- 对 Endpoints 为空建立告警。
- 变更 NetworkPolicy 前先做连通性测试。

## 相关笔记

- [[Kubernetes_Pod_CrashLoopBackOff_排查]]
- [[Kubernetes_Ingress_路由失效排查]]
- [[Kubernetes_Pod_Pending_排查]]

