---
title: Kubernetes Node NotReady 排查
tags:
  - Kubernetes
  - 运维
  - 故障复盘
  - 排障手册
category: 故障复盘
status: active
---

# Kubernetes Node NotReady 排查

## 现象

Node 状态变为 `NotReady`，节点上的 Pod 可能无法正常运行，新 Pod 也可能无法调度到该节点。

```bash
kubectl get nodes -o wide
```

常见影响：

- 节点不可调度或调度异常。
- 节点上的 Pod 进入异常状态。
- Service 后端实例减少。
- 集群事件中出现 kubelet、网络、磁盘等相关告警。

## 环境

- 集群：Kubernetes
- 对象：Node / Pod
- 常用命令：`kubectl describe node`, `journalctl -u kubelet`

## 排查过程

1. 查看节点状态。

```bash
kubectl get nodes -o wide
```

2. 查看节点详细信息和 Conditions。

```bash
kubectl describe node <node-name>
```

重点关注：

- `Ready`
- `MemoryPressure`
- `DiskPressure`
- `PIDPressure`
- `NetworkUnavailable`
- `Events`

3. 查看节点上的 Pod。

```bash
kubectl get pods -A -o wide | grep <node-name>
```

4. 登录节点检查 kubelet。

```bash
systemctl status kubelet
journalctl -u kubelet -n 200 --no-pager
```

5. 检查容器运行时和网络。

```bash
systemctl status containerd
crictl ps
ip addr
ip route
```

## 常见根因

| 根因 | 典型表现 | 排查方向 |
|---|---|---|
| kubelet 异常 | Ready 为 Unknown/False，事件中有 kubelet 心跳异常 | `systemctl status kubelet` |
| 节点网络异常 | `NetworkUnavailable=True`，节点无法访问 apiserver | 网络、路由、DNS、防火墙 |
| 容器运行时异常 | kubelet 日志中连接 runtime 失败 | containerd/docker 状态 |
| 磁盘压力 | `DiskPressure=True` | 根分区、`/var/lib/containerd`、inode |
| 内存压力 | `MemoryPressure=True` | 节点内存、Pod requests/limits |
| 证书或时间异常 | kubelet 认证失败、时间漂移 | 证书、NTP、节点时间 |

## 解决方法

### kubelet 异常

```bash
systemctl status kubelet
journalctl -u kubelet -n 200 --no-pager
```

处理方式：

- 根据日志修复 kubelet 配置。
- 检查 kubelet 是否能访问 apiserver。
- 修复后重启 kubelet。

```bash
systemctl restart kubelet
```

### 容器运行时异常

```bash
systemctl status containerd
journalctl -u containerd -n 200 --no-pager
crictl info
```

处理方式：

- 修复 containerd/docker 服务。
- 检查运行时 socket 配置。
- 必要时重启运行时和 kubelet。

### 磁盘压力

```bash
df -h
df -i
du -xh --max-depth=1 /var/lib/containerd | sort -rh
```

处理方式：

- 清理异常日志。
- 清理无用镜像和容器缓存。
- 扩容节点磁盘。
- 排查是否存在持续写入的大文件。

### 网络异常

```bash
ip addr
ip route
ping <apiserver-ip>
curl -k https://<apiserver-address>:6443/healthz
```

处理方式：

- 修复节点网络、路由、DNS。
- 检查防火墙、安全组。
- 检查 CNI 插件 Pod 状态。

## 验证结果

```bash
kubectl get nodes
kubectl describe node <node-name>
kubectl get pods -A -o wide | grep <node-name>
```

确认点：

- Node 状态恢复 `Ready`。
- `DiskPressure`、`MemoryPressure` 等异常条件消失。
- 节点上的核心 Pod 正常运行。
- 新 Pod 可以正常调度。

## 预防措施

- 监控 kubelet、containerd、CNI 核心组件状态。
- 对 Node Ready 状态建立告警。
- 对磁盘、inode、内存、PID 数设置阈值告警。
- 保持节点时间同步。
- 变更节点网络、证书、运行时配置前做好回滚方案。

## 相关笔记

- [[Kubernetes_Pod_Evicted_排查]]
- [[containerd_占用磁盘空间过大]]
- [[Linux_磁盘空间爆满排查]]

