---
title: Loki Promtail 日志采集系统部署
tags:
  - 运维
  - K3s
  - 日志采集
  - Loki
  - Promtail
category: 部署手册
status: active
created: 2026-07-14
---

# Loki + Promtail 日志采集系统部署

## 背景

K3s 集群中没有统一的日志采集服务，各应用日志分散在不同节点，无法集中查询和分析。部署 Loki + Promtail 实现日志集中采集、存储和查询。

## 环境

- 系统：Ubuntu 24.04 (K3s v1.35.4+k3s1)
- 服务：Loki 3.6.7 + Promtail 3.5.1
- 版本：Loki Chart 7.0.0, Promtail Chart 6.17.1
- 端口：Loki 3100, Promtail 3101
- 依赖：Grafana（已部署）、K3s 集群（215 server + 214 worker）
- Namespace：monitoring
- 镜像仓库：registry.liaozesheng.cn
- 存储：filesystem（本地磁盘）
- 部署模式：SingleBinary（轻量）

## 部署步骤

### 1. 添加 Helm 仓库

```bash
export http_proxy=192.168.71.212:7890
export https_proxy=192.168.71.212:7890

helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
```

### 2. 下载 Chart 包

```bash
cd /usr/local/software/helm/
mkdir -p loki promtail

# 下载 Loki chart
cd loki
helm pull grafana/loki

# 下载 Promtail chart
cd ../promtail
helm pull grafana/promtail

# 取消代理
unset http_proxy https_proxy
```

### 3. 创建 Loki values.yaml

文件位置：`/usr/local/software/helm/loki/values.yaml`

```yaml
deploymentMode: SingleBinary

loki:
  auth_enabled: false
  image:
    registry: registry.liaozesheng.cn
    repository: grafana/loki
    tag: "3.6.7"
    pullPolicy: IfNotPresent
  server:
    http_listen_port: 3100
    grpc_listen_port: 9095
  storage:
    type: filesystem
    filesystem:
      chunks_directory: /var/loki/chunks
      rules_directory: /var/loki/rules
  commonConfig:
    path_prefix: /var/loki
    replication_factor: 1
  schemaConfig:
    configs:
      - from: "2024-04-01"
        store: tsdb
        object_store: filesystem
        schema: v13
        index:
          prefix: index_
          period: 24h
  limits_config:
    reject_old_samples: true
    reject_old_samples_max_age: 168h

singleBinary:
  replicas: 1
  persistence:
    enabled: true
    size: 10Gi
    storageClass: local-path
  resources:
    requests:
      cpu: 100m
      memory: 256Mi
    limits:
      cpu: 500m
      memory: 512Mi

gateway:
  enabled: false
read:
  replicas: 0
write:
  replicas: 0
backend:
  replicas: 0
chunksCache:
  enabled: false
resultsCache:
  enabled: false
minio:
  enabled: false
monitoring:
  dashboards:
    enabled: false
  rules:
    enabled: false
  serviceMonitor:
    enabled: false
```

### 4. 创建 Promtail values.yaml

文件位置：`/usr/local/software/helm/promtail/values.yaml`

```yaml
daemonset:
  enabled: true

image:
  registry: registry.liaozesheng.cn
  repository: grafana/promtail
  tag: "3.5.1"
  pullPolicy: IfNotPresent

resources:
  requests:
    cpu: 50m
    memory: 64Mi
  limits:
    cpu: 200m
    memory: 128Mi

tolerations:
  - key: node-role.kubernetes.io/master
    operator: Exists
    effect: NoSchedule
  - key: node-role.kubernetes.io/control-plane
    operator: Exists
    effect: NoSchedule

defaultVolumes:
  - name: run
    hostPath:
      path: /run/promtail
  - name: containers
    hostPath:
      path: /var/log/containers
  - name: pods
    hostPath:
      path: /var/log/pods

defaultVolumeMounts:
  - name: run
    mountPath: /run/promtail
  - name: containers
    mountPath: /var/log/containers
    readOnly: true
  - name: pods
    mountPath: /var/log/pods
    readOnly: true

config:
  enabled: true
  logLevel: info
  serverPort: 3101
  clients:
    - url: http://loki:3100/loki/api/v1/push
  positions:
    filename: /run/promtail/positions.yaml
  snippets:
    pipelineStages:
      - cri: {}
    common:
      - action: replace
        source_labels:
          - __meta_kubernetes_pod_node_name
        target_label: node_name
      - action: replace
        source_labels:
          - __meta_kubernetes_namespace
        target_label: namespace
      - action: replace
        replacement: $1
        separator: /
        source_labels:
          - namespace
          - app
        target_label: job
      - action: replace
        source_labels:
          - __meta_kubernetes_pod_name
        target_label: pod
      - action: replace
        source_labels:
          - __meta_kubernetes_pod_container_name
        target_label: container
      - action: replace
        replacement: /var/log/pods/*$1/*.log
        separator: /
        source_labels:
          - __meta_kubernetes_pod_uid
          - __meta_kubernetes_pod_container_name
        target_label: __path__
    scrapeConfigs: |
      - job_name: kubernetes-pods
        pipeline_stages:
          {{- toYaml .Values.config.snippets.pipelineStages | nindent 4 }}
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels:
              - __meta_kubernetes_pod_controller_name
            regex: ([0-9a-z-.]+?)(-[0-9a-f]{8,10})?
            action: replace
            target_label: __tmp_controller_name
          - source_labels:
              - __meta_kubernetes_pod_label_app_kubernetes_io_name
              - __meta_kubernetes_pod_label_app
              - __tmp_controller_name
              - __meta_kubernetes_pod_name
            regex: ^;*([^;]+)(;.*)?$
            action: replace
            target_label: app
          {{- toYaml .Values.config.snippets.common | nindent 4 }}

serviceMonitor:
  enabled: false
```

### 5. 部署 Loki

```bash
cd /usr/local/software/helm/loki
sudo helm upgrade --install loki -f values.yaml loki-7.0.0.tgz -n monitoring
```

### 6. 部署 Promtail

```bash
cd /usr/local/software/helm/promtail
sudo helm upgrade --install promtail -f values.yaml promtail-6.17.1.tgz -n monitoring
```

## 配置文件

| 文件 | 路径 |
|------|------|
| Loki values.yaml | `/usr/local/software/helm/loki/values.yaml` |
| Loki Chart | `/usr/local/software/helm/loki/loki-7.0.0.tgz` |
| Promtail values.yaml | `/usr/local/software/helm/promtail/values.yaml` |
| Promtail Chart | `/usr/local/software/helm/promtail/promtail-6.17.1.tgz` |

## 验证方法

### 1. 检查 Pods 状态

```bash
kubectl get pods -n monitoring | grep -E 'loki|promtail'
```

预期输出：
```
loki-0                      1/1     Running
promtail-xxxxx              1/1     Running
promtail-yyyyy              1/1     Running
```

### 2. 检查 Services

```bash
kubectl get svc -n monitoring | grep loki
```

### 3. Loki 健康检查

```bash
kubectl port-forward -n monitoring svc/loki 3100:3100 &
curl http://localhost:3100/ready
# 预期输出：ready
```

### 4. 查询标签

```bash
curl 'http://localhost:3100/loki/api/v1/labels'
```

### 5. 查询日志

```bash
curl 'http://localhost:3100/loki/api/v1/query_range' \
  --data-urlencode 'query={namespace="default"}' \
  --data-urlencode 'limit=5'
```

### 6. 配置 Grafana 数据源

1. 打开 `https://grafana.liaozesheng.cn`
2. Configuration → Data Sources → Add
3. 选择 **Loki**
4. URL: `http://loki:3100`
5. Save & Test

### 7. Grafana 查询示例

```logql
# 查看所有日志
{namespace="default"}

# 查看 Traefik 日志
{namespace="kube-system", app="traefik"}

# 查看错误日志
{namespace="default"} |= "error"

# 查看特定应用日志
{app="lujie-careerkit"}
```

## 回滚方法

```bash
# 卸载 Promtail
sudo helm uninstall promtail -n monitoring

# 卸载 Loki
sudo helm uninstall loki -n monitoring
```

## 常见问题

| 问题 | 排查方向 | 解决方法 |
|------|----------|----------|
| Promtail 报 "timestamp too old" 错误 | Loki 默认拒绝 7 天前的日志 | 正常行为，不影响新日志采集。如需调整，修改 `reject_old_samples_max_age` |
| Helm 无法连接 K3s 集群 | http 代理干扰 | `unset http_proxy https_proxy` |
| 国内网络无法添加 Helm 仓库 | 网络限制 | 使用代理 `export http_proxy=192.168.71.212:7890` |
| Promtail 收不到某应用日志 | 检查日志路径和 Promtail targets | 检查 Promtail targets 页面确认是否发现目标 |

## 相关笔记

- [[个人局域网环境]]
- [[Harbor_使用_Helm_安装部署]]
- [[Nexus3_使用helm安装部署]]
