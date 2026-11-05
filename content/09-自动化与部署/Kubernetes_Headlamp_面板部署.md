---
title: Kubernetes Headlamp 面板部署
tags:
  - Kubernetes
  - 运维
  - 部署
category: 自动化与部署
status: active
---

# Kubernetes Headlamp 面板部署

## 背景

Kubernetes Dashboard 已于 **2026 年 1 月归档停止维护**，官方文档与博客都指向 **Headlamp**（Kubernetes SIG-UI 子项目、CNCF Sandbox）作为接续方案。新 kubeadm 集群（ext-214/215）需要一个可视面板，选 Headlamp。

213 上的 Kuboard v3 继续用于 Docker 服务，两者互不替代。

## 部署

```bash
helm repo add headlamp https://kubernetes-sigs.github.io/headlamp/
helm repo update
```

`headlamp-values.yaml`：

```yaml
config:
  inCluster: true

ingress:
  enabled: true
  ingressClassName: traefik
  hosts:
    - host: headlamp.liaozesheng.cn
      paths:
        - path: /
          type: Prefix        # 注意：schema 要求 type，不是 pathType

service:
  type: ClusterIP
```

```bash
helm upgrade --install headlamp headlamp/headlamp \
  -n headlamp --create-namespace \
  -f headlamp-values.yaml --wait --timeout 8m
```

访问链路：浏览器 → `https://headlamp.liaozesheng.cn` → ext-213 nginx（通配符证书）→ Traefik → Headlamp Service。

## 登录

Headlamp 默认用 ServiceAccount Token 登录。生成一年期 token：

```bash
ssh ext-215 'kubectl -n headlamp create token headlamp --duration=8760h'
```

本次部署时已生成并保存在 **ext-215 的 `/home/zesheng/headlamp-token.txt`**（`chmod 600`），查看方式：

```bash
ssh ext-215 'cat ~/headlamp-token.txt'
```

> [!warning]
> token 等同 cluster-admin 凭据，不要写进笔记、Git 或聊天记录。到期前重新生成即可；如需长期使用，建议后续改 OIDC。

## 权限

Chart 默认创建：

- ServiceAccount `headlamp`
- ClusterRoleBinding `headlamp-admin` → `cluster-admin`

单用户 homelab 可以接受。如果要多人使用或只读查看，建议改成两个 SA：

| 用途 | 权限 |
|---|---|
| 只读浏览 | `get/list/watch`（自建 ClusterRole） |
| 管理操作 | `cluster-admin` |

然后用不同 token 登录。

## 验证

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  --resolve headlamp.liaozesheng.cn:443:192.168.71.213 \
  https://headlamp.liaozesheng.cn/          # 200
```

本次结果：边缘域名 200、Traefik NodePort 200、Pod `1/1 Running`、Ingress CLASS 为 `traefik`。

## 坑

- **values schema 用 `type` 而不是 `pathType`**：写 `pathType` 会直接报 `missing property 'type'`，Helm 安装失败。
- 镜像来自 `ghcr.io/headlamp-k8s/headlamp`，依赖节点 containerd 的代理配置（见 [[Kubernetes_Traefik_Ingress入口改造]] 与监控栈笔记中的代理说明）；没有代理时 ghcr 拉取会超时。

## 常用操作

```bash
helm -n headlamp list
kubectl -n headlamp get pods
kubectl -n headlamp rollout restart deploy/headlamp
helm uninstall headlamp -n headlamp
```

## 相关笔记

- [[Kubernetes_Traefik_Ingress入口改造]]
- [[Kubernetes_kubeadm_集群安装部署]]
- [[Kubernetes_监控栈_kube-prometheus-stack_部署]]
- [[Harbor_GitLab_CI_接入集群_方案]]
