---
title: Kubernetes Ingress 路由失效排查
tags:
  - Kubernetes
  - 运维
  - 故障复盘
  - 排障手册
category: 故障复盘
status: active
---

# Kubernetes Ingress 路由失效排查

## 现象

通过域名或 Ingress 暴露地址访问服务失败，出现 404、502、503、超时、证书错误，或者请求没有转发到预期 Service。

```bash
kubectl get ingress -A
```

常见影响：

- 外部用户无法访问服务。
- 网关返回 404/502/503。
- HTTPS 证书异常。
- 同一个 Service 集群内可访问，但外部不可访问。

## 环境

- 集群：Kubernetes
- 对象：Ingress / Service / Pod / Ingress Controller
- 常用命令：`kubectl describe ingress`, `kubectl logs`

## 排查过程

1. 查看 Ingress 配置和地址。

```bash
kubectl get ingress -A
kubectl describe ingress <ingress-name> -n <namespace>
```

2. 检查 Ingress 规则是否指向正确 Service 和端口。

```bash
kubectl get ingress <ingress-name> -n <namespace> -o yaml
kubectl get svc <service-name> -n <namespace>
```

3. 检查 Service 是否正常。

```bash
kubectl get endpoints <service-name> -n <namespace>
kubectl describe svc <service-name> -n <namespace>
```

4. 检查 Ingress Controller。

```bash
kubectl get pods -A | grep -i ingress
kubectl logs <controller-pod> -n <controller-namespace>
```

5. 从集群内和集群外分别测试。

```bash
curl -I http://<domain>
curl -vk https://<domain>
```

## 常见根因

| 根因 | 典型表现 | 排查方向 |
|---|---|---|
| host/path 规则不匹配 | 返回 404 | 检查 Ingress rules |
| Service 端口配置错误 | 返回 502/503 | 检查 backend service port |
| Service 没有 Endpoint | 返回 503 | 检查 selector、Pod Ready |
| IngressClass 不匹配 | Ingress 不生效 | 检查 `ingressClassName` |
| Controller 异常 | 多个 Ingress 同时失败 | 检查 Controller Pod 和日志 |
| TLS Secret 错误 | HTTPS 证书错误 | 检查 tls secret、域名、证书有效期 |
| DNS 解析错误 | 请求没到集群 | 检查 DNS、LB、外部地址 |

## 解决方法

### 规则不匹配

```bash
kubectl describe ingress <ingress-name> -n <namespace>
kubectl get ingress <ingress-name> -n <namespace> -o yaml
```

处理方式：

- 修正 `host`。
- 修正 `path` 和 `pathType`。
- 确认请求域名与 Ingress 规则一致。

### Service 或 Endpoint 异常

```bash
kubectl get svc <service-name> -n <namespace>
kubectl get endpoints <service-name> -n <namespace>
```

处理方式：

- 先修复 Service selector、targetPort 或 Pod Ready。
- 确认 Service 在集群内可访问。
- 再回头验证 Ingress。

### IngressClass 不匹配

```bash
kubectl get ingressclass
kubectl get ingress <ingress-name> -n <namespace> -o yaml
```

处理方式：

- 设置正确的 `ingressClassName`。
- 或确认 Controller 是否监听默认 class。

### TLS 证书问题

```bash
kubectl get secret <tls-secret> -n <namespace>
kubectl describe secret <tls-secret> -n <namespace>
curl -vk https://<domain>
```

处理方式：

- 修正 TLS Secret。
- 确认证书域名匹配。
- 检查证书是否过期。

## 验证结果

```bash
kubectl describe ingress <ingress-name> -n <namespace>
curl -I http://<domain>
curl -vk https://<domain>
```

确认点：

- Ingress 规则正确命中。
- Service 有正常 Endpoint。
- Controller 日志没有持续报错。
- HTTP/HTTPS 访问恢复。

## 预防措施

- Ingress 变更前先确认 Service 在集群内可访问。
- 统一管理 IngressClass。
- 对 TLS 证书过期建立提醒。
- 对 Ingress Controller 状态和错误日志建立监控。
- 上线前用 curl 验证 host、path、HTTPS。

## 相关笔记

- [[Kubernetes_Service_无响应排查]]
- [[Kubernetes_Pod_CrashLoopBackOff_排查]]

