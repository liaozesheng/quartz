---
title: Zot 镜像代理与集群接入
tags:
  - 镜像仓库
  - Kubernetes
  - 部署
category: 自动化与部署
status: active
---

# Zot 镜像代理与集群接入

## 背景

集群在国内网络下直连 `docker.io`、`registry.k8s.io` 都会超时。此前用公共镜像站（daocloud / 1ms）兜底，但 ghcr.io、quay.io、gcr.io 上的镜像没有稳定来源。

洛杉矶机器（`172.245.71.18`，同时是 Tailscale 出口节点）上跑着 **Zot**，开启 `sync` 扩展，对以下上游做**按需同步代理**：

| 上游 | Zot 中的路径前缀 | 镜像引用写法 |
|---|---|---|
| `docker.io` | `/docker` | `zot.liaozesheng.lol/docker/<repo>:<tag>` |
| `ghcr.io` | `/ghcr` | `zot.liaozesheng.lol/ghcr/<owner>/<repo>:<tag>` |
| `gcr.io` | `/gcr` | `zot.liaozesheng.lol/gcr/<repo>:<tag>` |
| `registry.redhat.io` | `/redhat` | `zot.liaozesheng.lol/redhat/<repo>:<tag>` |
| `quay.io` | `/quay` | `zot.liaozesheng.lol/quay/<repo>:<tag>` |

其他关键信息：

- 对外入口 `https://zot.liaozesheng.lol`（443，TLS 终止在前置代理）
- Zot 自身监听明文 `30443`，`realm=zot-registry`，启用 htpasswd 认证、UI 与 search 扩展
- 存储目录 `/var/lib/zot`，每 12h 做一次 scrub
- 账号为 `admin`，**密码不入库**，单独保存在密码管理器中

> [!warning]
> 这是带写权限的私人仓库，凭据不要写进笔记、脚本或 Git。下面的配置模板里用 `<BASE64_AUTH>` 占位。

## 一、验证连通与认证

```bash
# 基础认证
curl -u admin:<密码> https://zot.liaozesheng.lol/v2/          # 200
curl -u admin:<密码> "https://zot.liaozesheng.lol/v2/_catalog?n=10"
```

已缓存仓库返回很快（<2s），首次未命中的镜像会触发**同步代理**，耗时 15–60s。

## 二、给 containerd 配置仓库凭据

把凭据放在节点本地、仅 root 可读：

```bash
sudo mkdir -p /etc/containerd/certs.d/zot.liaozesheng.lol
sudo install -m 600 /dev/null /etc/containerd/certs.d/zot.liaozesheng.lol/hosts.toml
```

`/etc/containerd/certs.d/zot.liaozesheng.lol/hosts.toml`：

```toml
server = "https://zot.liaozesheng.lol"

[host."https://zot.liaozesheng.lol"]
  capabilities = ["pull", "resolve"]

  [host."https://zot.liaozesheng.lol".header]
    authorization = "Basic <BASE64_AUTH>"   # echo -n 'admin:密码' | base64 -w0
```

```bash
sudo systemctl restart containerd
```

`config_path = '/etc/containerd/certs.d'` 在部署 Traefik 时已经在 `/etc/containerd/config.toml` 里设好，这里只新增子目录。

配置完成后，kubelet 拉 `zot.liaozesheng.lol/...` 的镜像**不需要**再写 `imagePullSecret`。

## 三、验证拉取

```bash
sudo crictl pull zot.liaozesheng.lol/docker/library/busybox:latest
sudo crictl pull zot.liaozesheng.lol/ghcr/actions/actions-runner:latest
sudo crictl pull zot.liaozesheng.lol/docker/library/redis:7-alpine
```

本次实测：

| 镜像 | 上游 | 结果 |
|---|---|---|
| `docker/library/busybox:latest` | docker.io | 已缓存，秒级 |
| `ghcr/actions/actions-runner:latest`（547MB） | ghcr.io | 首次同步后成功 |
| `docker/library/nginx:alpine` | docker.io | 首次同步 21s |
| `docker/library/redis:7-alpine` | docker.io | 首次同步 14s |

## 四、和公共镜像站的分工

Zot 的路径带前缀，**不能**当成 `docker.io` 的透明 mirror（containerd 的 mirror 只会原样转发 `/v2/<repo>/...`）。所以目前的策略是：

| 来源 | 使用方式 |
|---|---|
| `docker.io` | containerd mirror → `docker.m.daocloud.io`（镜像引用不变） |
| `registry.k8s.io` | containerd mirror → `k8s.m.daocloud.io`（镜像引用不变） |
| `ghcr.io` / `gcr.io` / `quay.io` / `registry.redhat.io` | 显式写成 `zot.liaozesheng.lol/<前缀>/...` |

在 Helm values 里就是改 `image.repository`：

```yaml
# 原：ghcr.io/actions/actions-runner
image:
  repository: zot.liaozesheng.lol/ghcr/actions/actions-runner

# 原：quay.io/prometheus/prometheus
image:
  repository: zot.liaozesheng.lol/quay/prometheus/prometheus
```

## 五、已知问题：首次同步被前置代理掐断

现象：

- 首次拉一个未缓存镜像时，`curl` 或 `crictl` 可能在 30–60s 报 `TLS handshake timeout` / `unexpected eof`
- 稍后重试就成功了，或者换明文 `http://zot.liaozesheng.lol:30443`（绕过前置代理）立即成功

原因：Zot 的按需同步是**同步阻塞**的，上游拉取耗时可能超过 443 前置代理的读超时。

规避方式，任选其一：

1. 失败后等 1 分钟重试（同步已在后台完成，第二次直接命中缓存）；
2. 先用 `curl` 预热一次：
   ```bash
   curl -m 300 -u admin:<密码> \
     -H "Accept: application/vnd.oci.image.index.v1+json,application/vnd.docker.distribution.manifest.list.v2+json" \
     https://zot.liaozesheng.lol/v2/docker/library/<repo>/manifests/<tag>
   ```
3. 根治：把洛杉矶机器上 443 前置代理的 `proxy_read_timeout` 调到 300s 以上，或对 `/v2/` 关闭响应缓冲。

## 六、安全与容量

- 明文 30443 只用于排障，集群内统一走 443。
- `admin` 是管理账号；后续可给集群单独建一个只读 htpasswd 账号，降低泄露影响面。
- 仓库在 `/var/lib/zot`，按需同步会持续增长，建议关注磁盘并定期清理不用的 tag。
- 节点侧排查上游问题时，可临时用内网代理 `http://192.168.71.212:7890` 直连对比（例如 `curl -x http://192.168.71.212:7890 https://registry-1.docker.io/v2/`）。

## 相关笔记

- [[Kubernetes_Traefik_Ingress入口改造]]
- [[Kubernetes_NFS动态存储_部署]]
- [[Kubernetes_kubeadm_集群安装部署]]
- [[Harbor_使用_Helm_安装部署]]
