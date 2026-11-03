---
title: Kubernetes CronJob 调度异常排查
tags:
  - Kubernetes
  - 运维
  - 故障复盘
  - 排障手册
category: 故障复盘
status: active
---

# Kubernetes CronJob 调度异常排查

## 现象

CronJob 没有按预期时间创建 Job，或者 Job 创建了但 Pod 没有正常执行。也可能出现任务堆积、重复执行、错过调度等情况。

```bash
kubectl get cronjob -A
```

常见影响：

- 定时任务没有执行。
- 数据同步、清理、备份任务延迟。
- Job 堆积导致资源占用。
- 任务重复执行影响业务数据。

## 环境

- 集群：Kubernetes
- 对象：CronJob / Job / Pod
- 常用命令：`kubectl describe cronjob`, `kubectl get jobs`

## 排查过程

1. 查看 CronJob 状态。

```bash
kubectl get cronjob -n <namespace>
kubectl describe cronjob <cronjob-name> -n <namespace>
```

2. 查看是否生成 Job。

```bash
kubectl get jobs -n <namespace>
kubectl describe job <job-name> -n <namespace>
```

3. 查看 Job 对应 Pod。

```bash
kubectl get pods -n <namespace> --selector=job-name=<job-name>
kubectl logs <pod-name> -n <namespace>
```

4. 查看 Namespace 事件。

```bash
kubectl get events -n <namespace> --sort-by=.lastTimestamp
```

5. 检查 CronJob YAML。

```bash
kubectl get cronjob <cronjob-name> -n <namespace> -o yaml
```

## 常见根因

| 根因 | 典型表现 | 排查方向 |
|---|---|---|
| schedule 写错 | 没按预期时间触发 | 检查 cron 表达式和时区 |
| suspend 为 true | CronJob 不创建新 Job | 检查 `.spec.suspend` |
| startingDeadlineSeconds 太短 | 错过调度后不补跑 | 检查错过调度策略 |
| concurrencyPolicy 限制 | 上一个任务未结束，新任务不跑 | 检查 Allow/Forbid/Replace |
| Job Pod Pending | Job 创建但 Pod 不运行 | 查调度、配额、镜像、PVC |
| 任务自身失败 | Pod 运行后退出异常 | 查看 logs 和 exit code |

## 解决方法

### schedule 或 suspend 问题

```bash
kubectl get cronjob <cronjob-name> -n <namespace> -o yaml
```

处理方式：

- 修正 cron 表达式。
- 确认集群控制面使用的时区语义。
- 如果 `suspend: true`，改为 `false`。

### 并发策略导致不执行

```bash
kubectl describe cronjob <cronjob-name> -n <namespace>
```

处理方式：

- `Forbid`：上一个 Job 未结束时不创建新 Job。
- `Replace`：新 Job 会替换旧 Job。
- `Allow`：允许并发执行。

根据业务是否允许并发选择策略。

### Job 创建但 Pod 异常

```bash
kubectl describe job <job-name> -n <namespace>
kubectl get pods -n <namespace> --selector=job-name=<job-name>
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace>
```

处理方式：

- 修复镜像、命令、环境变量。
- 检查 Pod 是否 Pending。
- 检查任务程序退出码。

### 手动触发验证

可以从 CronJob 手动创建一次 Job，验证模板是否可运行。

```bash
kubectl create job --from=cronjob/<cronjob-name> <manual-job-name> -n <namespace>
```

## 验证结果

```bash
kubectl get cronjob <cronjob-name> -n <namespace>
kubectl get jobs -n <namespace>
kubectl get pods -n <namespace>
```

确认点：

- CronJob 的 `LAST SCHEDULE` 正常更新。
- Job 能按预期创建。
- Pod 能正常完成。
- 不再出现任务堆积或重复执行。

## 预防措施

- 关键 CronJob 上线前手动创建 Job 验证。
- 明确 concurrencyPolicy，避免任务重叠。
- 设置合理的 successfulJobsHistoryLimit 和 failedJobsHistoryLimit。
- 对关键任务的 Job 成败建立告警。
- 定期清理历史 Job，避免堆积。

## 相关笔记

- [[Kubernetes_Pod_Pending_排查]]
- [[Kubernetes_ResourceQuota_资源超限排查]]

