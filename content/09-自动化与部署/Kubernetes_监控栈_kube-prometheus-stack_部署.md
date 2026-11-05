---
title: Kubernetes 监控栈 kube-prometheus-stack 部署
tags:
  - Kubernetes
  - 监控
  - 部署
category: 自动化与部署
status: active
---

# Kubernetes 监控栈 kube-prometheus-stack 部署

## 目标

在 kubeadm 集群（ext-215 control-plane / ext-214 worker）上部署完整的 Prometheus 监控栈，并满足：

- Prometheus、Alertmanager、Grafana 的数据持久化到 `nfs` StorageClass；
- 三个组件各有一个 Ingress，域名沿用 `*.liaozesheng.cn`；
- 镜像在国内网络下可稳定获取（docker.io、registry.k8s.io 走镜像站，ghcr 走自建 Zot）。

## 组件与版本

| 组件 | 版本 | 镜像 |
|---|---|---|
| Helm chart | kube-prometheus-stack 92.18.0 | — |
| Prometheus Operator | v0.94.2 | `quay.io/prometheus-operator/prometheus-operator` |
| Prometheus | v3.15.1 | `quay.io/prometheus/prometheus` |
| Alertmanager | v0.34.2 | `quay.io/prometheus/alertmanager` |
| Grafana | 13.3.0 | `docker.io/grafana/grafana` |
| node-exporter | v1.12.1 | `quay.io/prometheus/node-exporter` |
| kube-state-metrics | v2.20.0 | `registry.k8s.io/kube-state-metrics/kube-state-metrics` |
| webhook certgen | 1.11.0 | 原生为 `ghcr.io/jkroepke/kube-webhook-certgen`，本环境改用 Zot |

## 存储规划

| 组件 | PVC | 容量 | StorageClass |
|---|---|---|---|
| Prometheus | `prometheus-...-db` | 20Gi | `nfs` |
| Alertmanager | `alertmanager-...-db` | 2Gi | `nfs` |
| Grafana | `kube-prometheus-stack-grafana` | 5Gi | `nfs` |

Prometheus 保留期 15d，按当前 2 节点的采集量估算 20Gi 足够；如果后续接入更多 target，先看 `prometheus_tsdb_storage_blocks_bytes` 再扩。

## 步骤 1：准备 Grafana 凭据

密码不写在 values 里，先建 Secret：

```bash
kubectl create namespace monitoring
kubectl -n monitoring create secret generic grafana-admin \
  --from-literal=admin-user=admin \
  --from-literal=admin-password='<在这里填入密码>'
```

> [!warning]
> 这条笔记会随知识库发布，**不要**把真实密码写进本文件。密码保存在集群 Secret `monitoring/grafana-admin` 与密码管理器中。

## 步骤 2：获取 chart（绕开 GitHub Releases）

`helm repo add prometheus-community https://prometheus-community.github.io/helm-charts` 能成功，但真正下载 chart 包时走的是 `github.com/.../releases/download/...`，国内超时。

优先用内网 HTTP 代理（ext-212 上的 Clash）下载，实测 1 秒完成：

```bash
U="https://github.com/prometheus-community/helm-charts/releases/download/kube-prometheus-stack-92.18.0/kube-prometheus-stack-92.18.0.tgz"
curl -sSL -o /tmp/kps.tgz -x http://192.168.71.212:7890 "$U"

# 备选：代理不可用时走第三方加速
# curl -sSL -o /tmp/kps.tgz "https://gh-proxy.com/$U"

# 从仓库索引取出期望的 digest（注意 digest 字段在该条目 url 之前）
F=~/.cache/helm/repository/prometheus-community-index.yaml
L=$(grep -n "kube-prometheus-stack-92.18.0.tgz" "$F" | head -1 | cut -d: -f1)
D=$(head -n "$L" "$F" | grep "digest:" | tail -1 | awk '{print $2}')
sha256sum /tmp/kps.tgz
```

两者一致再继续，不一致说明下载被篡改或缓存坏了。

## 步骤 3：values

```yaml
grafana:
  admin:
    existingSecret: grafana-admin
    userKey: admin-user
    passwordKey: admin-password
  ingress:
    enabled: true
    ingressClassName: traefik
    hosts:
      - grafana.liaozesheng.cn
    path: /
  persistence:
    enabled: true
    storageClassName: nfs
    size: 5Gi
  grafana.ini:
    server:
      domain: grafana.liaozesheng.cn
      root_url: https://grafana.liaozesheng.cn/
  resources:
    requests: { cpu: 50m, memory: 128Mi }
    limits: { cpu: 500m, memory: 512Mi }

prometheus:
  ingress:
    enabled: true
    ingressClassName: traefik
    hosts:
      - prometheus.liaozesheng.cn
    paths:
      - /
  prometheusSpec:
    externalUrl: https://prometheus.liaozesheng.cn
    retention: 15d
    replicas: 1
    storageSpec:
      volumeClaimTemplate:
        spec:
          storageClassName: nfs
          accessModes: [ReadWriteOnce]
          resources:
            requests:
              storage: 20Gi
    resources:
      requests: { cpu: 100m, memory: 512Mi }
      limits: { cpu: 1, memory: 2Gi }

alertmanager:
  ingress:
    enabled: true
    ingressClassName: traefik
    hosts:
      - alertmanager.liaozesheng.cn
    paths:
      - /
  alertmanagerSpec:
    replicas: 1
    externalUrl: https://alertmanager.liaozesheng.cn
    storage:
      volumeClaimTemplate:
        spec:
          storageClassName: nfs
          accessModes: [ReadWriteOnce]
          resources:
            requests:
              storage: 2Gi
    resources:
      requests: { cpu: 20m, memory: 64Mi }
      limits: { cpu: 200m, memory: 256Mi }

prometheusOperator:
  admissionWebhooks:
    patch:
      image:
        registry: zot.liaozesheng.lol
        repository: ghcr/jkroepke/kube-webhook-certgen
        tag: 1.11.0

prometheus-node-exporter:
  resources:
    requests: { cpu: 20m, memory: 32Mi }
    limits: { cpu: 200m, memory: 128Mi }

kube-state-metrics:
  resources:
    requests: { cpu: 20m, memory: 64Mi }
    limits: { cpu: 200m, memory: 256Mi }
```

关键点：

- `ingressClassName: traefik`：集群的默认 IngressClass，见 [[Kubernetes_Traefik_Ingress入口改造]]。
- `storageClassName: nfs`：见 [[Kubernetes_NFS动态存储_部署]]。
- `grafana.root_url` 固定为 https，避免经边缘 TLS 终止后出现重定向到 http 的循环。
- webhook certgen 原生镜像在 ghcr.io，国内拉不通，改走 Zot 的 `ghcr/` 前缀，见 [[Zot_镜像代理_集群接入]]。

## 步骤 4：安装

```bash
helm upgrade --install kube-prometheus-stack /tmp/kps.tgz \
  -n monitoring -f monitoring-values.yaml \
  --timeout 10m
```

## 步骤 5：验证

```bash
kubectl -n monitoring get pods -o wide
kubectl -n monitoring get pvc
kubectl -n monitoring get ingress
```

本次结果：

- 全部 Pod `Running`：operator、kube-state-metrics、grafana(3/3)、alertmanager(2/2)、prometheus(2/2)、node-exporter 在 214/215 各一个
- 三个 PVC 均 `Bound`，`Retain`，落在 212 的 `/srv/nfs/k8s`
- 三个 Ingress 的 `CLASS` 均为 `traefik`

链路测试（此时 213 的边缘入口尚未切换，直接打 Traefik 的 NodePort 验证）：

```bash
curl -s -o /dev/null -w "%{http_code}\n" -H "Host: grafana.liaozesheng.cn"      http://192.168.71.214:30080/   # 302 /login
curl -s -o /dev/null -w "%{http_code}\n" -H "Host: prometheus.liaozesheng.cn"   http://192.168.71.214:30080/   # 302 /query
curl -s -o /dev/null -w "%{http_code}\n" -H "Host: alertmanager.liaozesheng.cn" http://192.168.71.214:30080/   # 200

curl -s -H "Host: prometheus.liaozesheng.cn" http://192.168.71.214:30080/-/healthy
# Prometheus Server is Healthy.

curl -s -H "Host: grafana.liaozesheng.cn" http://192.168.71.214:30080/api/health
# {"database":"ok","version":"13.3.0",...}
```

NFS 侧已经产生数据：Grafana 约 55M（含插件与 dashboard 缓存），Prometheus 约 2.6M 并持续增长。

## 访问方式

- 集群内入口：Traefik NodePort `30080`，按 Host 路由
- 对外入口：仍需把 `ext-213` 的 nginx 切到通配符配置（见 Traefik 笔记的“边缘侧配套改动”），切换后直接访问 `https://grafana.liaozesheng.cn`
- Grafana 账号 `admin`，密码在 Secret `monitoring/grafana-admin` 中

## 已知限制与后续

- 三个组件都是单副本。只有 ext-214 可调度 Pod，副本数暂时没有意义；等 ext-215 去污点后再考虑 HA。
- Alertmanager 尚未配置通知渠道（邮件/飞书/Webhook），告警只能看 UI。
- Prometheus 的 `externalUrl` 写死为 https 域名；若临时用 IP 访问，重定向后的地址仍是域名。
- 默认抓取规则包含 kube-controller-manager / kube-scheduler 等 kubeadm 未暴露 metrics 的组件，相关 target 为空属正常，需要时再单独配置。

## 相关笔记

- [[Kubernetes_Traefik_Ingress入口改造]]
- [[Kubernetes_NFS动态存储_部署]]
- [[Zot_镜像代理_集群接入]]
- [[Kubernetes_kubeadm_集群安装部署]]
- [[Loki_Promtail_日志采集系统部署]]
