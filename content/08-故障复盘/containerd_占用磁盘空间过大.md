---
title: containerd 占用磁盘空间过大
tags:
  - Docker
  - Linux
  - 运维
  - 故障复盘
category: 故障复盘
status: active
---

# containerd 占用磁盘空间过大

## 现象

服务器磁盘空间持续升高，逐层排查后发现 `/var/lib/containerd/` 占用很大，常见于频繁拉取镜像、构建镜像、部署容器或长期没有清理的机器。

常见影响：

- 根分区空间不足。
- 容器启动失败。
- 镜像拉取失败。
- Kubernetes 节点出现资源压力，甚至触发 Pod 驱逐。

## 环境

- 系统：Linux
- 组件：Docker / containerd
- 相关目录：`/var/lib/containerd/`

## 排查过程

1. 先确认整体磁盘空间。

```bash
df -h
```

2. 逐层查找大目录。

```bash
du -xh --max-depth=1 / | sort -rh
du -xh --max-depth=1 /var | sort -rh
du -xh --max-depth=1 /var/lib | sort -rh
du -xh --max-depth=1 /var/lib/containerd | sort -rh
```

3. 重点观察 containerd 下面的两个目录。

```bash
du -xh --max-depth=1 /var/lib/containerd/io.containerd.content.v1.content | sort -rh
du -xh --max-depth=1 /var/lib/containerd/io.containerd.snapshotter.v1.overlayfs | sort -rh
```

## 目录含义

| 目录 | 含义 | 常见原因 |
|---|---|---|
| `io.containerd.content.v1.content` | 镜像下载后的原始内容层，通常在 `blobs/sha256` 下 | 镜像拉取频繁、旧镜像未清理 |
| `io.containerd.snapshotter.v1.overlayfs` | 解压后的镜像层和容器读写层 | 容器运行层、镜像层、残留快照 |

## 根因

常见根因包括：

- 长期没有清理未使用镜像。
- 旧容器、停止容器、悬空镜像残留。
- 镜像版本频繁变化，每次部署都拉取新镜像。
- 容器写入层产生大量临时文件。
- Kubernetes 节点没有设置合理的镜像垃圾回收策略。

## 解决方法

### Docker 环境

先查看 Docker 空间占用。

```bash
docker system df
docker ps -a
docker images
```

清理停止容器、未使用网络、悬空镜像和 build cache。

```bash
docker system prune
```

如果确认未使用镜像都可以清理，再执行更彻底的清理。

```bash
docker system prune -a
```

> [!warning]
> `docker system prune -a` 会删除所有未被容器使用的镜像。生产环境执行前，要确认这些镜像不需要快速回滚。

### Kubernetes / containerd 环境

优先通过运行时和 kubelet 的垃圾回收机制处理，不建议手动删除 `/var/lib/containerd` 下的内部目录。

可以先查看节点镜像和容器状态。

```bash
crictl images
crictl ps -a
```

如果使用 Kubernetes，结合节点状态观察是否已经出现资源压力。

```bash
kubectl describe node <node-name>
kubectl get events -A --sort-by=.lastTimestamp
```

## 验证结果

```bash
df -h
docker system df
du -xh --max-depth=1 /var/lib/containerd | sort -rh
```

确认点：

- `/var/lib/containerd` 占用下降。
- 容器服务运行正常。
- Kubernetes 节点没有继续触发 DiskPressure。
- 关键镜像仍可用于回滚。

## 预防措施

- 部署系统控制镜像版本数量，不要无限保留历史 tag。
- 定期执行空间检查，而不是等磁盘满了再清理。
- 对 `/var/lib/containerd` 和根分区设置磁盘告警。
- Kubernetes 节点配置合理的 image garbage collection 策略。
- 清理前先保留关键镜像和回滚镜像。

## 相关笔记

- [[Linux_磁盘空间爆满排查]]
- [[Docker_生产实践索引]]

