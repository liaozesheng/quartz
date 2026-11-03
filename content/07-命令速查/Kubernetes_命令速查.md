---
title: Kubernetes 命令速查
tags:
  - Kubernetes
  - 命令速查
category: 命令速查
status: active
---

# Kubernetes 命令速查

## 使用场景

日常操作 K3s / K8s 集群时使用：查看资源、排查 Pod、进入容器、查看日志、操作 Deployment 与节点。本库集群为 `215`(server) + `214`(worker) 的 K3s，需在对应节点用 `sudo kubectl`（zesheng 用户 `~/.kube/config` 为空，215 上 kubectl 需 sudo）。

## 通用

```bash
kubectl get all -A                      # 所有命名空间所有资源
kubectl get <resource> -n <ns>          # 指定命名空间
kubectl get <resource> -n <ns> -o wide  # 宽输出（含节点/IP）
kubectl get <resource> -n <ns> -o yaml  # YAML 详情
kubectl api-resources                   # 列出所有资源类型及简写
kubectl cluster-info                    # 集群信息
kubectl config get-contexts             # 当前上下文
```

## Pod 排查

```bash
kubectl get pods -n <ns> -o wide
kubectl describe pod <pod> -n <ns>          # 事件、调度、拉镜像失败
kubectl logs <pod> -n <ns>                  # 当前容器日志
kubectl logs <pod> -n <ns> -c <container>   # 指定多容器中的某个
kubectl logs <pod> -n <ns> --previous       # 上一次崩溃的日志
kubectl logs <pod> -n <ns> -f               # 跟踪日志
kubectl exec -it <pod> -n <ns> -- /bin/bash # 进入交互 shell
kubectl exec <pod> -n <ns> -- <cmd>         # 单条命令
kubectl top pod -n <ns>                     # 资源占用（需 metrics-server）
kubectl port-forward <pod> 8080:80 -n <ns>  # 端口转发到本地
```

## kubectl exec

```bash
kubectl exec -it <pod> -n <ns> -- /bin/bash   # 交互式进入 shell（最常用）
kubectl exec <pod> -n <ns> -- <cmd>           # 执行单条命令（非交互）
kubectl exec <pod> -n <ns> -- /bin/bash -c "cat /etc/grafana/grafana.ini"  # 单条命令带管道
```

- `-i`：保持 stdin 打开；`-t`：分配 TTY；两者组合 `-it` 才能交互。
- `--`：分隔符，左边是 kubectl 参数，右边是容器内要执行的命令，强烈建议加上。

**多容器 Pod 指定容器**（先查容器名）：

```bash
kubectl get pod <pod> -n <ns> -o jsonpath='{.spec.containers[*].name}'
kubectl exec -it <pod> -n <ns> -c <容器名> -- /bin/bash
```

**常见错误示例**：

```bash
# ❌ 错误：缺 -it 无法交互，且未用 -- 分隔
kubectl exec monitoring-grafana-9b987b9ff-q5h5v /bin/bash

# ✅ 正确
kubectl exec -it monitoring-grafana-9b987b9ff-q5h5v -- /bin/bash
```

本库监控类 Pod（Grafana / Prometheus / Alertmanager）通常用 Deployment 单容器，直接 `-- /bin/bash` 即可；多容器场景（如 istio-proxy sidecar）必须加 `-c`。

## 工作负载操作

```bash
kubectl apply -f <file>.yaml            # 创建/更新
kubectl delete -f <file>.yaml           # 删除
kubectl scale deployment <dep> -n <ns> --replicas=3
kubectl rollout status deployment <dep> -n <ns>
kubectl rollout restart deployment <dep> -n <ns>   # 触发滚动重启
kubectl rollout undo deployment <dep> -n <ns>      # 回滚上一版
kubectl rollout history deployment <dep> -n <ns>   # 版本历史
kubectl set image deployment <dep> <c>=<img> -n <ns>  # 改镜像
kubectl edit deployment <dep> -n <ns>     # 在线编辑
```

## 节点与集群

```bash
kubectl get nodes -o wide
kubectl describe node <node>            # 资源、污点、事件
kubectl cordon <node>                   # 标记不可调度
kubectl drain <node> --ignore-daemonsets --delete-emptydir-data  # 排空（维护用）
kubectl uncordon <node>                 # 恢复调度
kubectl taint nodes <node> key=value:NoSchedule   # 加污点
kubectl get ns                          # 命名空间
kubectl get events -n <ns> --sort-by=.lastTimestamp  # 事件排序
```

## 配置与密钥

```bash
kubectl get cm -n <ns>                  # ConfigMap
kubectl get secret -n <ns>              # Secret
kubectl create secret generic <name> -n <ns> --from-literal=KEY=VAL
kubectl create configmap <name> -n <ns> --from-file=./config.conf
kubectl describe secret <name> -n <ns>
```

## Service / Ingress

```bash
kubectl get svc -n <ns>
kubectl get ingress -n <ns>
kubectl describe ingress <name> -n <ns>
```

本库入口统一 Traefik，外部访问经 `213` Nginx；访问故障需联合 DNS、Nginx、Traefik、Ingress、Service、Pod 排查。

## 删除与危险操作

```bash
kubectl delete pod <pod> -n <ns>                       # 普通删除
kubectl delete pod <pod> -n <ns> --force --grace-period=0  # 强制删除（卡 Terminating）
kubectl delete all -l app=<label> -n <ns>             # 按标签批量删（危险）
```

> [!WARNING]
> 批量删除、强制删除、drain 节点属于高风险操作，生产环境先确认影响。

## 相关笔记

- [[Kubernetes_故障排查索引]]
- [[技术栈索引]]
