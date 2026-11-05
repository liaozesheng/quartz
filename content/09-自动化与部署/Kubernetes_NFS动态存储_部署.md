---
title: Kubernetes NFS 动态存储部署
tags:
  - Kubernetes
  - 存储
  - 部署
category: 自动化与部署
status: active
---

# Kubernetes NFS 动态存储部署

## 背景与选型

kubeadm 集群（v1.35.10，ext-215 control-plane、ext-214 worker）默认没有任何 StorageClass，Grafana / Prometheus 这类需要 PVC 的服务会一直 Pending。补存储前先明确约束：

- `ext-215` 带 `node-role.kubernetes.io/control-plane:NoSchedule` 污点，业务 Pod 实际上只能落在 `ext-214`；
- 2026-11-04 刚因为重装系统丢过一次集群，节点本地盘上的卷不可靠；
- 只有两台机器，没有三副本的硬件条件。

| 方案 | 卷位置 | 跨节点漂移 | 依赖 | 结论 |
|---|---|---|---|---|
| local-path-provisioner | 节点本地目录 | 不支持，Pod 换节点会卡 Pending | 无 | 简单，但卷绑死 214 |
| **nfs-subdir-external-provisioner** | 集群外的 NFS 目录 | 支持（NFS 挂载） | 一台 NFS 服务器 | **采用** |
| Longhorn | 节点磁盘副本 | 支持 | 3 节点最佳、资源占用高 | 两节点不划算 |

选择用 `ext-212`（86G 空闲）做 NFS 服务器，卷落在集群之外：节点重装不影响数据，Pod 在 214/215 之间漂移也能挂上同一个目录。

## 架构

```
Pod ── PVC ── StorageClass(nfs) ── nfs-subdir-external-provisioner（集群内）
                                          │ 每个 PVC 建一个子目录
                                          ▼
                            ext-212:/srv/nfs/k8s/ingress-test-storage-test-pvc-<uuid>
```

## 步骤 1：准备 NFS 服务器（ext-212）

```bash
sudo apt-get update
sudo apt-get install -y nfs-kernel-server
sudo mkdir -p /srv/nfs/k8s
sudo chmod 755 /srv/nfs/k8s
```

`/etc/exports`：

```
/srv/nfs/k8s 192.168.71.0/24(rw,sync,no_subtree_check,no_root_squash)
```

```bash
sudo exportfs -ra
sudo systemctl enable --now nfs-server
sudo exportfs -v
```

本次输出：

```
/srv/nfs/k8s  192.168.71.0/24(sync,wdelay,hide,no_subtree_check,sec=sys,rw,secure,no_root_squash,no_all_squash)
```

> [!note]
> `no_root_squash` 是 provisioner 建目录、改属主所必需的；只在受信任的内网网段开放。ext-212 的 ufw 是 inactive，NFS 走 2049 端口，不需要额外放行。

## 步骤 2：节点安装 NFS 客户端

ext-214、ext-215 都要装，否则 kubelet 挂载时会报 `mount: wrong fs type`：

```bash
sudo apt-get install -y nfs-common
```

## 步骤 3：解决 registry.k8s.io 拉不动

provisioner 镜像在 `registry.k8s.io`，该域名会 302 到 `europe-west4-docker.pkg.dev`（Google），国内网络超时，表现为 `ImagePullBackOff`。

沿用 docker.io 的加速思路，给 containerd 增加一份 hosts 配置。

`/etc/containerd/certs.d/registry.k8s.io/hosts.toml`：

```toml
server = "https://registry.k8s.io"

[host."https://k8s.m.daocloud.io"]
  capabilities = ["pull", "resolve"]
```

```bash
sudo systemctl restart containerd
```

> [!tip]
> `config_path = '/etc/containerd/certs.d'` 已在部署 Traefik 时配置过，这里只需新建子目录。以后 `pause`、`sig-storage`、metrics-server 等镜像都能走同一个镜像站。

## 步骤 4：部署 provisioner

```bash
helm repo add nfs-subdir-external-provisioner \
  https://kubernetes-sigs.github.io/nfs-subdir-external-provisioner/
helm repo update

helm upgrade --install nfs-provisioner \
  nfs-subdir-external-provisioner/nfs-subdir-external-provisioner \
  -n nfs-provisioner --create-namespace \
  --set nfs.server=192.168.71.212 \
  --set nfs.path=/srv/nfs/k8s \
  --set storageClass.name=nfs \
  --set storageClass.defaultClass=true \
  --set storageClass.reclaimPolicy=Retain \
  --set storageClass.archiveOnDelete=true \
  --wait --timeout 5m
```

| 参数 | 作用 |
|---|---|
| `storageClass.name=nfs` | PVC 里写 `storageClassName: nfs`，或直接省略走默认类 |
| `defaultClass=true` | 未写 `storageClassName` 的 PVC 自动用它 |
| `reclaimPolicy=Retain` | 删除 PVC 后 PV 与数据保留，避免误删丢数据 |
| `archiveOnDelete=true` | 删除时把目录重命名为 `archived-*`，而不是直接抹掉 |

## 步骤 5：验证

```bash
kubectl get sc
kubectl -n nfs-provisioner get pods -o wide
```

本次结果：

```
NAME            PROVISIONER                                                     RECLAIMPOLICY
nfs (default)   cluster.local/nfs-provisioner-nfs-subdir-external-provisioner   Retain

nfs-provisioner-...-vzjts   1/1   Running   0   75s
```

创建 1Gi 的 RWX PVC 并写入文件：

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: storage-test
  namespace: ingress-test
spec:
  accessModes: ["ReadWriteMany"]
  resources:
    requests:
      storage: 1Gi
---
apiVersion: v1
kind: Pod
metadata:
  name: storage-test
  namespace: ingress-test
spec:
  containers:
    - name: writer
      image: busybox:1.36
      command: ["sh", "-c", "echo hello-from-k8s > /data/hello.txt && sleep 3600"]
      volumeMounts:
        - name: data
          mountPath: /data
  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: storage-test
EOF

kubectl -n ingress-test get pvc storage-test      # Bound, RWX, nfs
kubectl -n ingress-test exec storage-test -- cat /data/hello.txt
```

NFS 服务器上能看到实际目录与文件：

```
/srv/nfs/k8s/ingress-test-storage-test-pvc-1d8dfc5c-.../hello.txt
```

## 使用约定

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: grafana-data
  namespace: monitoring
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 5Gi
  # storageClassName: nfs   # 默认类，可省略
```

- 支持 `ReadWriteMany`，同一卷可被多个 Pod/节点同时挂载（NFS 语义）。
- 实际容量不受 PVC 的 `storage` 限制，是软配额；真正上限是 ext-212 的剩余空间（当前 86G）。
- 数据库类服务不建议放 NFS（延迟与锁语义），有需要时再单独规划本地盘。

## 已知限制

1. `ext-212` 是单点：它宕机时所有使用 NFS 卷的 Pod 都会挂载失败（已运行的 Pod 可能 IO 卡住）。
2. 网络性能取决于内网千兆，Prometheus 大量小文件写入会有额外延迟。
3. 卷目录权限由 provisioner 创建为 `777`，多租户场景需要额外收紧。

## 相关笔记

- [[Kubernetes_Traefik_Ingress入口改造]]
- [[Kubernetes_kubeadm_集群安装部署]]
- [[Kubernetes_PV_挂载失败排查]]
- [[Nginx_安装与反向代理配置手册]]
