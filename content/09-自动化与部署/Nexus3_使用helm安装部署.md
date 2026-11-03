---
title: Nexus3 使用 Helm 安装部署
tags:
  - Kubernetes
  - Nexus
  - 部署
category: 自动化与部署
status: active
source_url: https://artifacthub.io/packages/helm/stevehipwell/nexus3
---

# Nexus3 使用 Helm 安装部署

## 目标

在 K3s/Kubernetes 集群中使用 Helm 部署单实例 Nexus Repository 3，通过持久化卷保存制品数据，并使用 Traefik Ingress 暴露管理界面和 HTTP 仓库。

Nexus 可以集中管理 Maven、npm、PyPI、Raw 和 Docker 等制品，但不同仓库格式的访问方式并不完全相同：

- 管理界面及 Maven、npm 等 HTTP 仓库可以通过 Nexus Web 端口和普通 Ingress 访问。
- Docker Registry 需要在 Nexus 中配置独立的 Repository Connector，并额外暴露对应端口或配置专用反向代理。

## 当前部署基线

| 项目 | 当前值 |
|---|---|
| Helm Chart | `stevehipwell/nexus3` |
| Chart 版本 | `5.23.0` |
| Release | `nexus3` |
| Namespace | `nexus` |
| IngressClass | `traefik` |
| 访问域名 | `nexus.liaozesheng.cn` |
| StorageClass | `local-path` |
| PVC 容量 | `10Gi` |
| 管理员密码 Secret | `nexus-admin` |

> [!note]
> 本文固定使用 Chart `5.23.0`，确保离线包、镜像和 values 能够对应。升级前必须重新比较新版本 values 和变更说明，不能只替换版本号。

## 适用场景与限制

适合：

- 个人或小规模团队的内部制品仓库。
- K3s 单集群、单 Nexus 实例部署。
- 使用 `local-path` 或其他支持 `ReadWriteOnce` 的 StorageClass。

限制：

- `local-path` 数据卷通常绑定具体节点，Pod 不能无条件漂移到其他节点。
- 单副本 Nexus 不具备应用级高可用能力。
- `10Gi` 适合初期使用，正式保存镜像和构件时应按增长速度规划容量。
- Helm 回滚只能回滚 Kubernetes 资源，不能自动回滚 Nexus 数据库或制品数据。

## 部署前检查

检查集群、节点、存储和入口控制器：

```bash
kubectl cluster-info
kubectl get nodes -o wide
kubectl get storageclass
kubectl get ingressclass
kubectl -n kube-system get pods,svc | grep -i traefik
helm version
```

确认：

- 节点处于 `Ready`。
- `local-path` StorageClass 可用。
- Traefik Ingress Controller 正常。
- `nexus.liaozesheng.cn` 能解析到 Traefik/K3s 对外地址。
- 节点有足够的 CPU、内存和磁盘空间。

> [!warning]
> Nexus 启动和索引过程对内存比较敏感。如果出现 OOM 或探针失败，应先检查实际资源使用，不要只反复重启 Pod。

## 获取并检查 Chart

### 在线环境

```bash
export CHART_VERSION=5.23.0

helm show chart \
  oci://ghcr.io/stevehipwell/helm-charts/nexus3 \
  --version "$CHART_VERSION"

helm show values \
  oci://ghcr.io/stevehipwell/helm-charts/nexus3 \
  --version "$CHART_VERSION" > values-reference.yaml

helm pull \
  oci://ghcr.io/stevehipwell/helm-charts/nexus3 \
  --version "$CHART_VERSION"

tar -xf "nexus3-${CHART_VERSION}.tgz"
cp "nexus3/values.yaml" values-custom.yaml
```

保留以下文件作为同一部署批次：

```text
nexus3-5.23.0.tgz
values-reference.yaml
values-custom.yaml
```

### 检查 Chart 使用的镜像

先完成 `values-custom.yaml` 配置，再从最终渲染结果提取镜像：

```bash
helm template nexus3 ./nexus3-5.23.0.tgz \
  -n nexus \
  -f values-custom.yaml \
  | awk '/image:/{print $2}' \
  | tr -d '"' \
  | sort -u \
  | tee images.txt
```

逐个下载并打包：

```bash
while read -r image; do
  docker pull "$image"
done < images.txt

docker save -o nexus3-images.tar $(cat images.txt)
```

将以下文件复制到离线节点：

```text
nexus3-5.23.0.tgz
nexus3-images.tar
values-custom.yaml
images.txt
```

### 导入离线镜像到 K3s

```bash
sudo k3s ctr images import nexus3-images.tar
sudo k3s ctr images list | grep -E 'nexus|busybox|curl'
```

如果集群使用私有镜像仓库，应根据当前 Chart 的 values 修改镜像仓库地址，并确保 K3s 的 `registries.yaml` 已正确配置。

## 创建 Namespace 与管理员密码

幂等创建 Namespace：

```bash
kubectl create namespace nexus \
  --dry-run=client -o yaml \
  | kubectl apply -f -
```

交互式读取管理员密码，避免密码直接出现在命令历史中：

```bash
read -rsp 'Nexus admin password: ' NEXUS_ADMIN_PASSWORD
echo

kubectl create secret generic nexus-admin \
  -n nexus \
  --from-literal=password="$NEXUS_ADMIN_PASSWORD" \
  --dry-run=client -o yaml \
  | kubectl apply -f -

unset NEXUS_ADMIN_PASSWORD
```

检查 Secret 是否存在，但不要输出密码：

```bash
kubectl -n nexus get secret nexus-admin
```

## 自定义 values

编辑 `values-custom.yaml`，至少确认以下配置。不要在同一个 YAML 对象中重复定义 `storageClass`，否则后一个值会覆盖前一个值。

```yaml
ingress:
  enabled: true
  annotations: {}
  ingressClassName: traefik
  hosts:
    - nexus.liaozesheng.cn
  tls: []

persistence:
  enabled: true
  storageClass: local-path
  annotations: {}
  accessMode: ReadWriteOnce
  size: 10Gi
  retainDeleted: true
  retainScaled: true

# 当前 CSI/StorageClass 能正确设置卷权限时可关闭。
# 如果 Pod 因 /nexus-data 权限失败，再重新评估此项。
chownDataDir: false

rootPassword:
  secret: nexus-admin
  key: password

config:
  enabled: true
```

### 可选：配置资源

先在 `values-reference.yaml` 中确认当前版本支持的字段，再结合节点资源设置：

```yaml
resources:
  requests:
    cpu: 500m
    memory: 2Gi
  limits:
    cpu: "2"
    memory: 4Gi
```

> [!warning]
> 上述资源值只是起点，不是通用生产配置。应通过 `kubectl top pod` 和实际仓库负载调整。

### 可选：配置 HTTPS

如果集群已有 TLS Secret：

```yaml
ingress:
  enabled: true
  ingressClassName: traefik
  hosts:
    - nexus.liaozesheng.cn
  tls:
    - secretName: nexus-tls
      hosts:
        - nexus.liaozesheng.cn
```

确认 Secret 位于 `nexus` Namespace：

```bash
kubectl -n nexus get secret nexus-tls
```

## 部署前渲染检查

检查 Chart 和 values：

```bash
helm lint ./nexus3-5.23.0.tgz -f values-custom.yaml

helm template nexus3 ./nexus3-5.23.0.tgz \
  -n nexus \
  -f values-custom.yaml > nexus3-rendered.yaml
```

检查关键配置：

```bash
grep -nE 'kind: (Ingress|PersistentVolumeClaim)|storageClassName:|host:|image:' \
  nexus3-rendered.yaml
```

通过 Kubernetes API 做服务端预检：

```bash
kubectl apply --dry-run=server -n nexus -f nexus3-rendered.yaml
```

> [!note]
> 如果渲染文件包含 Helm Hook 资源，服务端预检结果只作为辅助；最终仍要结合 `helm lint`、渲染内容和安装日志判断。

## 安装 Nexus

```bash
helm upgrade --install nexus3 ./nexus3-5.23.0.tgz \
  -n nexus \
  --create-namespace \
  -f values-custom.yaml \
  --wait \
  --timeout 15m
```

首次启动需要初始化数据目录、数据库和索引，`1m` 通常不足以判断部署失败，因此这里使用 `15m`。

查看 Helm 状态：

```bash
helm list -n nexus
helm status nexus3 -n nexus
helm history nexus3 -n nexus
```

## 部署验证

### 检查工作负载和存储

```bash
kubectl -n nexus get pod,svc,ingress,pvc -o wide
kubectl -n nexus get events --sort-by=.metadata.creationTimestamp | tail -50
```

等待 Pod Ready：

```bash
kubectl -n nexus wait \
  --for=condition=Ready pod \
  --all \
  --timeout=15m
```

检查日志：

```bash
kubectl -n nexus logs -l app.kubernetes.io/instance=nexus3 \
  --all-containers=true \
  --tail=200
```

如果配置 Job 存在，单独检查：

```bash
kubectl -n nexus get jobs
kubectl -n nexus logs job/<config-job-name>
```

### 检查 Ingress 与访问

```bash
kubectl -n nexus describe ingress
kubectl -n nexus get endpoints,endpointslices
curl -I http://nexus.liaozesheng.cn
```

如果 DNS 尚未就绪，可以先使用端口转发验证应用：

```bash
kubectl -n nexus port-forward svc/<nexus-service-name> 8081:8081
```

浏览器访问：

```text
http://127.0.0.1:8081
```

使用 `nexus-admin` Secret 创建时输入的密码登录 `admin` 账号，并立即确认密码策略、匿名访问和用户权限。

## 仓库初始化建议

部署完成后建议按实际用途配置：

1. 创建 hosted、proxy 和 group 仓库。
2. Maven 客户端优先使用 group 仓库作为统一入口。
3. 为 CI/CD 创建独立账号，不使用 `admin`。
4. 关闭不需要的匿名写入权限。
5. 为代理仓库设置合理的缓存、清理策略和远端地址。
6. 配置 Blob Store 与 Cleanup Policy，避免 PVC 被无限写满。
7. 定期检查任务执行结果、磁盘空间和组件健康状态。

## Docker Registry 端口说明

当前 Ingress 只解决 Nexus Web UI 和普通 HTTP 仓库访问，不会自动暴露 Docker Registry Connector。

使用 Docker 仓库时需要：

1. 在 Nexus 中创建 Docker hosted/proxy/group 仓库。
2. 为仓库配置独立 HTTP 或 HTTPS Connector 端口，例如 `5000`。
3. 使用下面的命令查询 Chart `5.23.0` 支持的额外 Service/容器端口字段：

   ```bash
   grep -nEi 'additionalPorts|extraPorts|docker|service:' values-reference.yaml
   ```

4. 在 `values-custom.yaml` 中按该版本的字段增加容器端口和 Service 端口。
5. 使用 Traefik TCP、独立 `LoadBalancer` 或 `NodePort` 暴露 Connector。
6. Docker 客户端优先使用 HTTPS；如果只能使用 HTTP，需要在每台客户端显式配置 insecure registry。

> [!warning]
> 不要仅凭其他 Chart 的示例猜测 `additionalPorts` 或 `extraPorts` 字段。应以 `values-reference.yaml` 和 `helm template` 的最终渲染结果为准。

## 升级流程

升级前先记录当前状态：

```bash
helm list -n nexus
helm history nexus3 -n nexus
helm get values nexus3 -n nexus -a > values-current.yaml
kubectl -n nexus get pod,pvc,ingress -o wide
```

升级步骤：

1. 阅读目标 Chart 和 Nexus 应用版本的变更说明。
2. 备份 Nexus 数据库、Blob Store 和当前 values。
3. 下载目标 Chart，重新执行镜像提取和离线打包。
4. 比较新旧默认 values，迁移已变化的字段。
5. 执行 `helm lint` 和 `helm template`。
6. 先在测试环境验证。
7. 再执行正式升级并观察日志和健康状态。

```bash
helm upgrade nexus3 ./nexus3-<目标版本>.tgz \
  -n nexus \
  -f values-custom.yaml \
  --wait \
  --timeout 15m
```

## 备份与恢复

备份至少要覆盖：

- Nexus 数据库。
- Blob Store/制品文件。
- Helm values 和 Chart 包。
- Kubernetes Secret、Ingress 及其他部署配置。

检查实际工作负载类型和 PVC：

```bash
kubectl -n nexus get deploy,statefulset
kubectl -n nexus get pvc
kubectl -n nexus describe pvc
```

优先使用 Nexus 自身的备份任务配合存储快照，保证数据库和 Blob Store 的时间点一致。如果存储不支持快照，可以安排维护窗口，停止写入并关闭 Nexus 后再备份 PVC。

> [!danger]
> 不要在 Nexus 持续写入时直接复制 `local-path` 底层目录并把它当作完整可恢复备份。数据库和 Blob Store 时间点不一致时，可能得到无法可靠恢复的数据。

恢复前应在隔离环境验证：

1. Chart/Nexus 版本与备份兼容。
2. PVC 数据能够挂载。
3. Nexus 可以启动并通过健康检查。
4. Maven、Docker 等关键仓库能够读取和上传制品。

## 回滚方法

查看历史版本：

```bash
helm history nexus3 -n nexus
```

回滚到指定 revision：

```bash
helm rollback nexus3 <revision> \
  -n nexus \
  --wait \
  --timeout 15m
```

检查回滚结果：

```bash
helm status nexus3 -n nexus
kubectl -n nexus get pod,svc,ingress,pvc
kubectl -n nexus get events --sort-by=.metadata.creationTimestamp | tail -50
```

> [!danger]
> 如果升级同时改变了 Nexus 数据格式，Helm 回滚不等于数据回滚。必须结合升级前备份和目标版本兼容性决定是否恢复数据。

## 卸载

```bash
helm uninstall nexus3 -n nexus
kubectl -n nexus get pvc
```

`retainDeleted: true` 的目标是避免卸载时误删持久化数据，但卸载后仍必须实际检查 PVC/PV。确认备份可恢复之前，不要手动删除 PVC、PV 或 `local-path` 底层目录。

## 常见问题

| 问题 | 排查方向 | 处理建议 |
|---|---|---|
| Pod 长时间 `Pending` | PVC、StorageClass、节点资源 | `kubectl describe pod,pvc`，确认 `local-path` 和节点容量 |
| `ImagePullBackOff` | 镜像未导入、镜像地址错误 | 对照 `images.txt`，使用 `k3s ctr images list` 检查 |
| Pod `CrashLoopBackOff` | 数据目录权限、OOM、启动参数 | 查看当前和 previous 日志，检查 `chownDataDir` 与资源限制 |
| PVC 已绑定但无法挂载 | local-path 节点绑定、目录权限 | 查看 PV node affinity 和 Pod 调度节点 |
| Ingress 返回 404 | 域名、IngressClass、路由规则 | 检查 `ingressClassName: traefik` 和 Host 请求头 |
| Ingress 返回 502/504 | Nexus 未 Ready、Service/Endpoint 错误 | 检查 Pod 探针、Service selector 和 EndpointSlice |
| 配置 Job 失败 | Secret 名称或 key 错误、Nexus 尚未就绪 | 检查 Job 日志及 `nexus-admin/password` |
| 登录密码不正确 | Secret 与实际初始化状态不一致 | 检查配置 Job；不要在不清楚数据状态时反复重建 PVC |
| Docker push 失败 | Connector 端口未暴露、HTTPS/证书问题 | 检查 Nexus Docker 仓库端口、Service 和客户端 registry 配置 |
| 磁盘快速增长 | Blob Store、代理缓存、缺少清理策略 | 配置 Cleanup Policy，监控 PVC 使用率并规划扩容 |

## 快速排查命令

```bash
helm status nexus3 -n nexus
helm get values nexus3 -n nexus -a
kubectl -n nexus get pod,svc,ingress,pvc -o wide
kubectl -n nexus describe pod <pod-name>
kubectl -n nexus logs <pod-name> --all-containers --tail=200
kubectl -n nexus logs <pod-name> --previous --all-containers --tail=200
kubectl -n nexus get events --sort-by=.metadata.creationTimestamp | tail -50
kubectl -n nexus get endpoints,endpointslices
kubectl top pod -n nexus
```

## 相关笔记

- [[技术栈索引]]
- [[Kubernetes_Pod_Pending_排查]]
- [[Kubernetes_Pod_CrashLoopBackOff_排查]]
- [[Kubernetes_PV_挂载失败排查]]
- [[Kubernetes_Ingress_路由失效排查]]
- [[部署手册模板]]

## 外部参考

- [Nexus3 Helm Chart](https://artifacthub.io/packages/helm/stevehipwell/nexus3)
- [Nexus Repository 官方帮助](https://help.sonatype.com/en/sonatype-nexus-repository.html)
