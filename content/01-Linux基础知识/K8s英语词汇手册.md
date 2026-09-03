---
updated: 2026-09-02
---

# 📚 Kubernetes 实用英语词汇全集

> 小爪出品 · 累计 261 词 · 每日更新

---

## 第1期 — 核心入门词汇

### 1. Pod
- **音标**：/pɒd/
- **词义**：荚；K8s中最小的调度单元，一组容器的集合
- **例句**：Each Pod runs one or more containers that share the same network namespace.
- **🪄 记忆**：豆荚（pea pod）里包着一颗颗豆子——Pod里包着一个或多个容器。

### 2. Node
- **音标**：/nəʊd/
- **词义**：节点；集群中的工作机器（物理机或虚拟机）
- **例句**：The scheduler assigns Pods to healthy Nodes based on resource availability.
- **🪄 记忆**：Node ≈ 电脑节点，像电路上的节点一样连接着网络。

### 3. Cluster
- **音标**：/ˈklʌstər/
- **词义**：集群；一组Node组成的计算资源池
- **例句**：A Kubernetes Cluster consists of a control plane and at least one worker node.
- **🪄 记忆**：cluster（簇）——想象一串葡萄，每颗葡萄是一个Node，整串就是Cluster。

### 4. Deployment
- **音标**：/dɪˈplɔɪmənt/
- **词义**：部署；管理Pod副本的声明式更新控制器
- **例句**：Use a Deployment to declare the desired state of your application.
- **🪄 记忆**：de-（向下）+ ploy（折叠）+ ment → 把应用"铺开"到集群上。

### 5. Service
- **音标**：/ˈsɜːrvɪs/
- **词义**：服务；为Pod提供稳定的网络访问入口
- **例句**：A Service exposes a set of Pods as a single network endpoint.
- **🪄 记忆**：Pod会挂，但Service像前台电话总机——永远有一个号码能找到服务。

### 6. Ingress
- **音标**：/ˈɪnɡres/
- **词义**：入口；管理集群外部到内部Service的HTTP/HTTPS路由
- **例句**：The Ingress routes external traffic to the correct Service based on hostname.
- **🪄 记忆**：In（向内）+ gress（走）→ 从外"走进来"的路由入口，反义词是 Egress（出口）。

### 7. ConfigMap
- **音标**：/kənˈfɪɡ ˌmæp/
- **词义**：配置映射；存储非加密的键值对配置数据
- **例句**：Store your app's environment variables in a ConfigMap for easy management.
- **🪄 记忆**：Config（配置）+ Map（映射）——把配置"映射"进Pod里，改配置不用重新打镜像。

### 8. Namespace
- **音标**：/ˈneɪmspeɪs/
- **词义**：命名空间；在同一个集群中隔离资源组
- **例句**：Use separate Namespaces to isolate development and production environments.
- **🪄 记忆**：Name（名字）+ Space（空间）——给资源"划地盘"，不同Namespace的人互不干扰。

### 9. Replica
- **音标**：/ˈreplɪkə/
- **词义**：副本；Pod的冗余实例，确保高可用
- **例句**：Setting replicas: 3 ensures three Pod instances run at all times.
- **🪄 记忆**：Re-（再次）+ plica（折叠）→ 复制一份，多备几个分身，挂了一个还有别的顶上。

### 10. Volume
- **音标**：/ˈvɒljuːm/
- **词义**：卷；Pod中持久化存储的抽象
- **例句**：Attach a Volume to your Pod so data survives container restarts.
- **🪄 记忆**：Volume ≈ U盘——容器重启就清数据了，挂个Volume才能"存得住"。

### 11. Secret
- **音标**：/ˈsiːkrɪt/
- **词义**：机密；存储敏感数据的键值对（如密码、Token、证书）
- **例句**：Store database credentials in a Secret rather than in plain text in a ConfigMap.
- **🪄 记忆**：Secret = 加密版ConfigMap。ConfigMap是公开的公告栏，Secret是加了锁的保险柜。

---

## 第2期 — 进阶控制与调度

### 12. DaemonSet
- **音标**：/ˈdeɪmən ˌset/
- **词义**：守护进程集；确保每个Node上运行一个Pod副本（如日志采集、监控代理）
- **例句**：DaemonSet ensures that all (or some) Nodes run a copy of a Pod.
- **🪄 记忆**：Daemon（守护进程）想在每个Node上都留一个分身——翻垃圾桶（日志采集）的清洁工。

### 13. StatefulSet
- **音标**：/ˈsteɪtfl ˌset/
- **词义**：有状态应用集；管理有稳定网络标识和持久存储的Pod（如数据库）
- **例句**：StatefulSet is ideal for deploying databases like MySQL with stable identities.
- **🪄 记忆**：Deployment管无状态→豆子撒了重新长；StatefulSet管有状态→每个Pod有"身份证"（固定的名字和存储）。

### 14. etcd
- **音标**：/ˈɛt siː ˈdiː/
- **词义**：分布式键值存储；K8s集群控制面的"大脑"，存所有集群数据
- **例句**：etcd stores the entire cluster configuration in a consistent key-value store.
- **🪄 记忆**：etcd = /etc（配置目录）+ distributed → 集群的配置总仓库，没了它K8s就失忆了。

### 15. Controller
- **音标**：/kənˈtrəʊlər/
- **词义**：控制器；持续监控集群状态并调谐到期望状态的循环逻辑
- **例句**：The Controller continuously reconciles the current state with the desired state.
- **🪄 记忆**：Controller = 恒温器 —— 设好25度，热了降温冷了就加热，永远保持你想要的温度。

### 16. Label
- **音标**：/ˈleɪbl/
- **词义**：标签；附加在K8s对象上的键值对，用于标识和组织资源
- **例句**：Use Labels to organize Pods by environment: `env=production` or `tier=frontend`.
- **🪄 记忆**：Label ≈ 给对象贴"贴纸"——app=nginx, env=prod，想找哪个标签一搜就出来。

### 17. Annotation
- **音标**：/ˌænəʊˈteɪʃn/
- **词义**：注解；附加在K8s对象上的非标识性元数据（用于工具和库的配置）
- **例句**：Annotations can store build timestamps or contact information for debugging.
- **🪄 记忆**：Label是给K8s看的标签，Annotation是给人/工具看的"便利贴"——写备注用的，K8s不拿它做选择。

### 18. Taint
- **音标**：/teɪnt/
- **词义**：污点；标记在Node上的排斥性标识，阻止不匹配的Pod调度上来
- **例句**：Nodes with Taints will repel Pods that do not have matching Tolerations.
- **🪄 记忆**：Taint（污点）≈ Node门口挂了个"闲人免进"的牌子，没有对应"通行证"（Toleration）的Pod不准进。

### 19. Toleration
- **音标**：/ˌtɒləˈreɪʃn/
- **词义**：容忍；Pod声明自己能"忍受"某个污点，允许调度到有该污点的Node上
- **例句**：Add a Toleration to allow the Pod to be scheduled on a Tainted Node.
- **🪄 记忆**：Toleration = Taint的"反义词"——Node说"我不欢迎你"，Pod说"我忍了"，于是它就能跑上去。

### 20. Probe
- **音标**：/prəʊb/
- **词义**：探针；K8s对容器进行健康检查的机制
- **例句**：A liveness Probe checks if the container is still running; a readiness Probe checks if it can serve traffic.
- **🪄 记忆**：Probe（探针）≈ 护士给你量体温测心跳——Liveness看是否活着，Readiness看是否能接客。

### 21. Sidecar
- **音标**：/ˈsaɪdkɑr/
- **词义**：边车容器；与主容器共享同一个Pod的辅助容器（如日志转发、代理）
- **例句**：A Sidecar container handles logging alongside the main application container.
- **🪄 记忆**：Sidecar（摩托车挎斗）—— 主程序骑摩托，Sidecar坐在旁边帮忙干杂活（日志、监控、代理）。

---

---

## 第3期 — 工作负载与运维管理

### 22. Container
- **音标**：/kənˈteɪnər/
- **词义**：容器；轻量级、可移植的运行环境，打包应用及其依赖
- **例句**：Each Container in a Pod shares the same network namespace and can communicate via localhost.
- **🪄 记忆**：Container = 集装箱 —— Docker 把应用"装箱"，K8s 帮你"搬箱"，到哪都能跑。

### 23. Image
- **音标**：/ˈɪmɪdʒ/
- **词义**：镜像；Container 的只读模板，包含运行应用所需的代码、运行时、库和环境变量
- **例句**：Pull the latest Image from the registry before deploying the application.
- **🪄 记忆**：Image = 系统"快照"——像手机刷机包，拿它就能还原出完整的环境。

### 24. Job
- **音标**：/dʒɒb/
- **词义**：任务；管理一次性或批处理任务的控制器，任务完成即退出
- **例句**：A Job runs a Pod until it completes successfully, then stops.
- **🪄 记忆**：Job = 临时工 —— 干完活就走人，不像 Deployment 那样一直"当值"。

### 25. CronJob
- **音标**：/ˈkrɒn dʒɒb/
- **词义**：定时任务；按 Cron 表达式调度 Job 周期性执行
- **例句**：Use a CronJob to run database backups at 2:00 AM every day.
- **🪄 记忆**：CronJob = Job + 闹钟 —— 给 Job 加了定时器，到点自动开干，像 Linux 的 crontab。

### 26. RBAC (Role-Based Access Control)
- **音标**：/ˈɑːrˌbæk/
- **词义**：基于角色的访问控制；通过 Role/ClusterRole 和 RoleBinding 管理 K8s API 权限
- **例句**：RBAC restricts who can create, read, or delete Pods in a Namespace.
- **🪄 记忆**：R(角色) + B(基于) + AC(访问控制) —— 像公司门禁卡，前台只能进大厅，管理员能进机房。

### 27. Operator
- **音标**：/ˈɒpəreɪtər/
- **词义**：操作器；将人类运维知识编码成自动化程序的控制器，管理复杂有状态应用
- **例句**：The Prometheus Operator automates the deployment and scaling of monitoring stacks.
- **🪄 记忆**：Operator = 自动化专家 —— 把你手动运维的"操作"（Operate）写成代码，让 K8s 自己管自己。

### 28. Helm
- **音标**：/helm/
- **词义**：K8s 的包管理器；通过 Chart 简化应用的定义、安装和升级
- **例句**：Helm makes it easy to install complex applications with a single command.
- **🪄 记忆**：Helm = 船舵 —— 掌舵控制方向，Helm 帮你掌控 K8s 应用的"航向"（安装/升级/回滚）。

### 29. Rollout
- **音标**：/ˈrəʊlaʊt/
- **词义**：滚动更新；Deployment 逐步替换旧版本 Pod 为新版本的过程
- **例句**：Use `kubectl rollout status deployment/nginx` to monitor the update progress.
- **🪄 记忆**：Roll(滚动) + Out(出去) —— 像机场传送带，旧箱子（旧Pod）滚走，新箱子（新Pod）滚进来。

### 30. Rollback
- **音标**：/ˈrəʊlbæk/
- **词义**：回滚；将 Deployment 恢复到上一个正常工作版本
- **例句**：If the new version crashes, perform a Rollback to the previous revision immediately.
- **🪄 记忆**：Roll(滚动) + Back(回去) —— Rollout 往前滚，Rollback 往回滚。Ctrl+Z 的 K8s 版本。

### 31. PersistentVolume (PV)
- **音标**：/pərˈsɪstənt ˈvɒljuːm/
- **词义**：持久卷；由管理员预置或动态供应的集群级存储资源，独立于 Pod 生命周期
- **例句**：A PersistentVolume can be consumed by a Pod via a PersistentVolumeClaim.
- **🪄 记忆**：Persistent(持久的) + Volume(卷) —— Volume 是 U 盘，PV 是"集群级U盘池"，Pod 挂了数据还在。

---

## 第4期 — 服务网络与资源管理

### 32. ReplicaSet
- **音标**：/ˈreplɪkə set/
- **词义**：副本集；确保指定数量的 Pod 副本始终运行，Deployment 底层依赖它
- **例句**：A ReplicaSet ensures that a specified number of Pod replicas are running at all times.
- **🪄 记忆**：ReplicaSet = Replica（副本）+ Set（集合）→ Deployment 的"打工仔"，Deployment下指令，ReplicaSet负责数人头保证够数。

### 33. HorizontalPodAutoscaler (HPA)
- **音标**：/ˌhɒrɪˈzɒntl pɒd ˈɔːtoʊskeɪlər/
- **词义**：水平 Pod 自动扩缩器；根据 CPU/内存使用率或自定义指标自动调整 Pod 副本数
- **例句**：HPA automatically scales the number of Pod replicas when CPU utilization exceeds 80%.
- **🪄 记忆**：Horizontal（水平）= 多开/少开几个 Pod（加人），Vertical（垂直）= 加大/减小 Pod 配置（升级硬件）。HPA 是自动招人裁人的 HR。

### 34. ServiceAccount
- **音标**：/ˈsɜːrvɪs əˈkaʊnt/
- **词义**：服务账户；为 Pod 提供身份的 K8s 资源，用于 API 认证授权
- **例句**：Each Pod is associated with a ServiceAccount that determines its API access permissions.
- **🪄 记忆**：ServiceAccount = Pod 的"身份证"——人登录用 User Account，Pod 访问 API 用 ServiceAccount，没它 K8s 不认识你是谁。

### 35. NetworkPolicy
- **音标**：/ˈnetwɜːrk ˈpɒləsi/
- **词义**：网络策略；定义 Pod 之间以及 Pod 与外部网络通信规则的防火墙
- **例句**：Apply a NetworkPolicy to block all inbound traffic except from the monitoring namespace.
- **🪄 记忆**：NetworkPolicy = Pod 的"防火墙规则"——默认 K8s 所有 Pod 都能互相通信，加了这个才能"关上门"。

### 36. ResourceQuota
- **音标**：/rɪˈzɔːrs ˈkwəʊtə/
- **词义**：资源配额；限制 Namespace 中资源（CPU、内存、PVC 数量等）的总使用上限
- **例句**：Set a ResourceQuota to cap total memory usage at 16GB per namespace.
- **🪄 记忆**：Resource(资源) + Quota(配额) = "Namespace 的预算帽"——每个团队（Namespace）能用的总资源不能超过这个数。

### 37. LimitRange
- **音标**：/ˈlɪmɪt reɪndʒ/
- **词义**：限制范围；为 Namespace 中单个 Pod/Container 设置默认资源 requests/limits 和取值范围
- **例句**：A LimitRange ensures every container has at least 64Mi memory request and at most 1Gi limit.
- **🪄 记忆**：ResourceQuota 管"总共能用多少"，LimitRange 管"每个不能少于/多于多少"。一个是总量限制，一个是单量限制。

### 38. PersistentVolumeClaim (PVC)
- **音标**：/pərˈsɪstənt ˈvɒljuːm kleɪm/
- **词义**：持久卷声明；用户对存储资源（PV）的请求，按需绑定存储
- **例句**：A Pod requests storage by creating a PVC, which binds to a matching PV automatically.
- **🪄 记忆**：PV 是仓库里的"库存硬盘"，PVC 是"采购申请单"——员工（Pod）提交 PVC，仓库管理员（K8s）匹配一个 PV 给它用。

### 39. StorageClass
- **音标**：/ˈstɔːrɪdʒ klɑːs/
- **词义**：存储类；定义 PV 的动态供应策略（如 SSD、HDD、分布式存储等不同类型）
- **例句**：Use StorageClass "ssd" for high-performance databases and "standard" for backup volumes.
- **🪄 记忆**：StorageClass = "存储套餐"——像办手机套餐：SSD 是 5G 高速套餐，HDD 是普通套餐，按需选择。

### 40. NodePort
- **音标**：/nəʊd pɔːrt/
- **词义**：节点端口；Service 类型之一，在每个 Node 上开放一个固定端口供外部访问
- **例句**：NodePort exposes a Service on each Node's IP at a static port (30000-32767).
- **🪄 记忆**：NodePort = 每个 Node 门口开个小窗——外面的人通过 `NodeIP:NodePort` 就能访问到服务。测试用，生产一般不直接暴露。

### 41. LoadBalancer
- **音标**：/ˈləʊdˌbælənsər/
- **词义**：负载均衡器；Service 类型之一，调用云厂商的 LB 自动分配公网入口
- **例句**：Setting type: LoadBalancer provisions a cloud load balancer and assigns a public IP.
- **🪄 记忆**：LoadBalancer = 云上"大门"——NodePort 是自己开窗，LoadBalancer 是找物业（云厂商）装个带公网 IP 的大门，专业又省心。

---

---

## 第5期 — 集群管理与核心组件

### 42. Kubelet
- **音标**：/ˈkjuːbəˌlet/
- **词义**：节点代理；每台 Node 上运行的 K8s 联络员，管理 Pod 生命周期
- **例句**：The Kubelet registers the node with the cluster and ensures containers in Pods are running healthily.
- **🪄 记忆**：Kube(缩写K8s) + let(小/代理) → "K8s 的小弟"，每台机器上都有它，负责跟 Master 汇报、管好本机的 Pod。

### 43. Scheduler
- **音标**：/ˈʃɛdjuːlər/ 或 /ˈskɛdʒuːlər/
- **词义**：调度器；将新 Pod 分配到最合适的 Node 上运行
- **例句**：The Scheduler evaluates Node resources, taints, and affinity rules before assigning a Pod.
- **🪄 记忆**：Scheduler = "派单员" —— 来了新乘客（Pod），看看哪个司机（Node）最闲最顺路，就把单派给它。

### 44. Affinity
- **音标**：/əˈfɪnəti/
- **词义**：亲和性；Pod 调度偏好规则，控制 Pod 靠近某些 Node/Pod
- **例句**：Use nodeAffinity to ensure all database Pods run on SSD-equipped nodes.
- **🪄 记忆**：Affinity = "吸引力" —— 像磁铁一样，让 Pod "想靠近"某些 Node（同机房、同机架延迟低）。

### 45. AntiAffinity
- **音标**：/ˌænti əˈfɪnəti/
- **词义**：反亲和性；强制 Pod 分散在不同 Node，避免单点故障
- **例句**：PodAntiAffinity ensures that replicas of the same app are spread across different nodes.
- **🪄 记忆**：Anti(反) + Affinity(亲和) = "拆散CP" —— 同一个应用的 Pod 不能挤在一起，得"分居"保平安。

### 46. Manifest
- **音标**：/ˈmænɪfest/
- **词义**：清单文件；定义 K8s 资源的 YAML/JSON 配置文件
- **例句**：Write a Deployment Manifest in YAML to declare your application's desired state.
- **🪄 记忆**：Manifest = "给 K8s 看的说明书" —— 写上"我要什么"，K8s 照着执行。

### 47. Kustomize
- **音标**：/ˈkʌstəmaɪz/
- **词义**：自定义配置工具；通过 base + overlay 机制管理差异化 Manifest
- **例句**：Kustomize lets you manage dev, staging, and prod configurations without duplicating YAML files.
- **🪄 记忆**：Kustomize = Customize(自定义) 的 K8s 版 —— 基模(base) + 覆层(overlay) = 不同环境差异化配置。

### 48. CRD (CustomResourceDefinition)
- **音标**：/ˌkʌstəm rɪˈzɔːrs ˌdefɪˈnɪʃn/
- **词义**：自定义资源定义；扩展 K8s API，定义自己的资源类型
- **例句**：With CRDs, you can define a custom "Database" resource and manage it with a Controller.
- **🪄 记忆**：CRD = "自己造新资源" —— 像装了个插件，让 K8s 认识你的自定义对象。

### 49. Drain
- **音标**：/dreɪn/
- **词义**：排空节点；优雅地将 Node 上的 Pod 迁移到其他 Node
- **例句**：Before rebooting the node, run `kubectl drain` to gracefully evict all Pods.
- **🪄 记忆**：Drain = "放洗澡水" —— 把 Node 上的 Pod "排走"，Node 空了就能安心关机维护。

### 50. Cordon
- **音标**：/ˈkɔːrdn/
- **词义**：封锁节点；标记 Node 为不可调度，防止新 Pod 上来
- **例句**：Cordon the node first to prevent new Pods from being scheduled, then drain it.
- **🪄 记忆**：Cordon = "拉警戒线" —— 告诉 K8s："这个 Node 别再往里塞新 Pod 了！"

### 51. Eviction
- **音标**：/ɪˈvɪkʃən/
- **词义**：驱逐；因资源不足或节点故障强制将 Pod 从 Node 上移除
- **例句**：When memory pressure is high, the kubelet starts Pod Eviction to free up resources.
- **🪄 记忆**：Eviction = "赶人" —— 像房东赶租客。Node 说"内存不够了"，Kubelet 就开始强行赶 Pod 走。

---



---

## 第6期 — 运维排障与高级调度

### 52. InitContainer
- **音标**：/ˈɪnɪt kənˈteɪnər/
- **词义**：初始化容器；在主容器启动前运行的前置任务容器（如等待数据库就绪、初始化数据）
- **例句**：Use an InitContainer to wait for the database to be ready before the main app container starts.
- **🪄 记忆**：Init(初始化) + Container → 主菜上桌前的前菜或准备食材的工作。InitContainers 跑完就退出，不会一直运行。

### 53. OOMKilled
- **音标**：/uːm kɪld/
- **词义**：OOM 杀死；Pod 因内存超限(out-of-memory)被内核强制终止的状态
- **例句**：The Pod status shows OOMKilled — you need to increase the memory limit or fix the memory leak.
- **🪄 记忆**：OOM = Out Of Memory（内存吃光）+ Killed（被干掉）→ 像自助餐吃太撑被店员抬出去。看到 `OOMKilled`，99% 是内存 limit 设太低。

### 54. CrashLoopBackOff
- **音标**：/kræʃ luːp bæk ɔːf/
- **词义**：崩溃循环回退；Pod 反复启动→崩溃→重启的恶性循环状态，K8s 会逐渐增加重启间隔
- **例句**：If a container keeps crashing, K8s enters CrashLoopBackOff to prevent rapid restarting.
- **🪄 记忆**：Crash(崩溃) + Loop(循环) + BackOff(回退) → 像手机开机就死机、重启又死机，反复循环。BackOff 是 K8s 的好心——歇会儿再重启。

### 55. Endpoint
- **音标**：/ˈendpɔɪnt/
- **词义**：端点；Service 背后实际接收流量的 Pod IP + Port 组合，K8s 自动管理
- **例句**：When a Pod becomes ready, K8s automatically adds its IP to the Service's Endpoint list.
- **🪄 记忆**：End(终点) + Point(点) → 请求的"终点站"。用户打到 Service，Service 把请求转给背后的 Endpoint（Pod IP）。

### 56. PodDisruptionBudget (PDB)
- **音标**：/pɒd dɪsˈrʌpʃən ˈbʌdʒɪt/
- **词义**：Pod 干扰预算；保证主动干扰（如节点维护）期间至少有一定数量的 Pod 保持可用
- **例句**：Set a PDB to ensure at least 2 replicas remain available during node maintenance.
- **🪄 记忆**：Disruption(干扰) + Budget(预算) → 领导说"今天可以有人请假，但最少留 3 个人值班"。PDB 就是给 Pod 下的"最少值班人数"指令。

### 57. ClusterRole
- **音标**：/ˈklʌstər roʊl/
- **词义**：集群角色；RBAC 角色类型，权限作用于整个集群而非单个 Namespace
- **例句**：A ClusterRole can grant permissions to view Nodes across the entire cluster.
- **🪄 记忆**：普通 Role 只能在"一个房间"(Namespace)里管事，ClusterRole 是"整栋楼"(整个集群)的权限通卡。

### 58. RoleBinding
- **音标**：/roʊl ˈbaɪndɪŋ/
- **词义**：角色绑定；将 Role/ClusterRole 中定义的权限赋予特定 User/Group/ServiceAccount
- **例句**：Create a RoleBinding to grant the "pod-reader" Role to a specific ServiceAccount.
- **🪄 记忆**：Role(角色) + Binding(绑定) → 像发工牌——Role 是"权限说明书"，RoleBinding 把说明书+工牌发给你，让你拥有这些权限。

### 59. TopologySpreadConstraints
- **音标**：/təˈpɒlədʒi spred kənˈstreɪnts/
- **词义**：拓扑分布约束；控制 Pod 在不同拓扑域（区域、可用区）之间的分布策略，实现高可用
- **例句**：Use TopologySpreadConstraints to distribute Pods evenly across availability zones.
- **🪄 记忆**：Topology(拓扑=机房分布) + Spread(分散) + Constraints(约束) → 命令 Pod 必须"分开住"，别全挤在一个可用区，否则机房断电全挂。

### 60. VerticalPodAutoscaler (VPA)
- **音标**：/ˈvɜːrtɪkəl pɒd ˈɔːtoʊskeɪlər/
- **词义**：垂直 Pod 自动扩缩器；根据历史使用量自动调整 Pod 的 CPU/内存 requests 和 limits
- **例句**：VPA recommends or automatically adjusts your Pod's resource requests based on historical usage.
- **🪄 记忆**：Vertical(垂直) = 给 Pod"加配置"（加大内存/CPU），Horizontal(水平) = "加数量"（多开几个 Pod）。VPA 自动帮你"升级硬件"。

### 61. MutatingAdmissionWebhook
- **音标**：/mjuːˈteɪtɪŋ ædˈmɪʃən ˈwebhʊk/
- **词义**：变更准入 Webhook；在 API 请求持久化前拦截并修改/注入对象的准入控制插件
- **例句**：Istio uses a MutatingAdmissionWebhook to automatically inject its Sidecar proxy into every new Pod.
- **🪄 记忆**：Mutating(变更) + Admission(准入) + Webhook(钩子) → 像安检口的"自动贴纸机"——你提交 Pod 时它偷偷塞一个 Sidecar 容器进去，你在 YAML 里根本看不到。

---

## 第7期 — 网络代理、存储、安全与运行时

### 62. KubeProxy
- **音标**：/ˈkjuːb ˌprɒksi/
- **词义**：Kubernetes 网络代理；每个 Node 上运行的网络组件，维护 iptables/IPVS 规则实现 Service 流量转发
- **例句**：KubeProxy watches the API server for Service and Endpoint changes, then updates iptables rules accordingly.
- **🪄 记忆**：Kube(8s) + Proxy(代理) → Node 的"流量交警"——你访问 Service IP，它拦截并转发到正确的 Pod，默默无闻但功劳全是它的。

### 63. EmptyDir
- **音标**：/ˈempti dɜːr/
- **词义**：空目录卷；Pod 创建时生成的临时共享目录，Pod 内容器可读写，Pod 删除时数据清除
- **例句**：Use an EmptyDir volume as a shared scratch space between the main container and a sidecar log collector.
- **🪄 记忆**：Empty(空的) + Dir(目录) → Pod 内部的"共享白板"——两个同事共用，写完擦掉，Pod 销毁白板也消失。

### 64. HostPath
- **音标**：/həʊst pæθ/
- **词义**：主机路径卷；将 Node 宿主机上的文件或目录挂载到容器中（常用于采集主机日志、访问设备文件）
- **例句**：DaemonSets often mount a HostPath volume to access the host's /var/log directory for log collection.
- **🪄 记忆**：Host(宿主机) + Path(路径) → 在容器里直接访问"房东"的文件柜。权限很大，用起来要小心。

### 65. QoS (Quality of Service)
- **音标**：/kjuː əʊ es/
- **词义**：服务质量等级；Pod 基于资源 requests/limits 分为 Guaranteed、Burstable、BestEffort 三类，kubelet 按等级顺序驱逐
- **例句**：When nodes run out of memory, the kubelet evicts BestEffort Pods first, then Burstable, and finally Guaranteed.
- **🪄 记忆**：QoS 等级 = 三种机舱：Guaranteed（头等舱，不赶人），Burstable（经济舱，有弹性），BestEffort（站票，最先被赶下飞机）。

### 66. SecurityContext
- **音标**：/sɪˈkjʊərəti ˈkɒntekst/
- **词义**：安全上下文；定义 Pod/Container 的安全设置（运行用户、只读根文件系统、Linux Capabilities 等）
- **例句**：Set runAsNonRoot: true in the SecurityContext to force the container to run as a non-root user.
- **🪄 记忆**：Security(安全) + Context(上下文) → 给容器上的"安全锁"——设好这个，容器在 Linux 内核层面能做什么、不能做什么安排得明明白白。

### 67. containerd
- **音标**：/kənˈteɪnərd/
- **词义**：行业标准容器运行时；K8s 默认使用的 CRI 实现，管理容器的创建、运行和销毁
- **例句**：Kubernetes uses containerd as its default container runtime to manage container lifecycle.
- **🪄 记忆**：container(容器) + d(daemon) → Docker 的"心脏"被单独挖出来给了 K8s。Docker 是完整餐厅（前+后厨），containerd 是专业后厨团队，只管炒菜。

### 68. CoreDNS
- **音标**：/kɔːr diː en es/
- **词义**：K8s 集群默认 DNS 服务；将 Service 名称解析为 Cluster IP，支持插件扩展
- **例句**：CoreDNS resolves the Service name "my-app" to its Cluster IP, so Pods can reach it via hostname.
- **🪄 记忆**：Core(核心) + DNS(域名系统) → K8s 的"电话本"——Pod 说"找 my-app"，CoreDNS 自动查出 IP 号码。没有它，集群就是一群互相不认识的路人。

### 69. StaticPod
- **音标**：/ˈstætɪk pɒd/
- **词义**：静态 Pod；由 kubelet 直接从本地 Manifest 文件管理的 Pod，不经过 API Server
- **例句**：StaticPods are commonly used to bootstrap control plane components like etcd and the API server.
- **🪄 记忆**：Static(静态) + Pod → "自生自灭"的 Pod——不归 API Server 管，kubelet 从本地文件读取 YAML 创建。像隐士高人自立为王。

### 70. EphemeralContainer
- **音标**：/ɪˈfemərəl kənˈteɪnər/
- **词义**：临时容器；在已有 Pod 中临时创建的调试容器，不影响原 Pod 的副本计数和生命周期
- **例句**：Use kubectl debug to attach an EphemeralContainer to a running Pod for network diagnostics.
- **🪄 记忆**：Ephemeral(转瞬即逝) + Container → 运维的"降维打击工具"——Pod 出问题，直接塞一个临时"诊断箱"进去查清楚就走，不用重启。

### 71. Gateway (Gateway API)
- **音标**：/ˈɡeɪtweɪ/
- **词义**：网关 API；K8s 新一代入口/出口管理 API，比 Ingress 更强大（支持流量拆分、TLS 终止、多协议路由）
- **例句**：Gateway API provides a more expressive way to configure advanced routing policies compared to Ingress.
- **🪄 记忆**：Gateway = 大门/网关 → Ingress 是"一扇铁门"，Gateway 是"智能安检大厅"——多通道、A/B 测试（流量拆分）、证件检查（TLS），Ingress 的全面升级版。

---

> 📅 最后更新：2026-07-02 | 累计 81 词 | 持续更新中 🐾

---

## 第8期 — 集群工具、接口标准与安全机制

### 72. Kubectl
- **音标**: /ˈkjuːbəˌkətl/
- **词义**: Kubernetes 命令行工具，通过 API Server 与集群交互
- **例句**: You use `kubectl get pods` to list all Pods in the current namespace.
- **🪄 记忆**: Kube(8s) + ctl(control) = "K8s 的遥控器"——你想对 K8s 干什么，都得通过它。没有 kubectl 你就像没有键盘的电脑。

### 73. KubeConfig
- **音标**: /ˈkjuːb kənˌfɪɡ/
- **词义**: 集群配置文件（默认 `~/.kube/config`），包含集群地址、凭证信息、上下文切换
- **例句**: The KubeConfig file stores cluster credentials, CA certificates, and context definitions for `kubectl`.
- **🪄 记忆**: Kube + Config = "集群的通行证+地图"——有了它 kubectl 才知道连哪个集群、用什么身份、在哪个 Namespace 干活。换集群？改 KubeConfig 就行。

### 74. ControlPlane
- **音标**: /kənˈtrəʊl pleɪn/
- **词义**: 控制平面；K8s 集群的管理大脑，包含 API Server、Scheduler、Controller Manager 和 etcd
- **例句**: The ControlPlane runs the cluster-wide services that make scheduling and orchestration decisions.
- **🪄 记忆**: Control(控制) + Plane(平面/层面) = "集群的司令部"——里面的 API Server 是"前台接线员"，etcd 是"档案室"，Scheduler 是"派单员"。打工 Pod 跑在工作节点，发号施令在控制平面。

### 75. CNI (Container Network Interface)
- **音标**: /siː en aɪ/
- **词义**: 容器网络接口；K8s 网络插件标准，负责分配 IP、搭建 Pod 间网络连通（如 Calico、Flannel、Cilium）
- **例句**: CNI plugins handle networking so that every Pod gets a unique IP address and can communicate with all other Pods.
- **🪄 记忆**: CNI = "K8s 的网线铺设团队"——你搬进新办公室（创建 Pod），CNI 帮你拉好网线（分配 IP）、接通交换机（连通其他 Pod）。没它你的 Pod 就是断网状态。

### 76. CSI (Container Storage Interface)
- **音标**: /siː es aɪ/
- **词义**: 容器存储接口；K8s 存储插件标准，让集群接入不同存储后端（如 AWS EBS、Ceph、NFS）
- **例句**: CSI drivers enable Kubernetes to provision and attach storage volumes from any compatible storage system.
- **🪄 记忆**: CNI 管"网线"，CSI 管"硬盘柜"——CNI 是网线工，CSI 是硬盘安装师傅。想用云上 SSD 还是自建 Ceph？安装对应的 CSI driver 就行。

### 77. PriorityClass
- **音标**: /praɪˈɒrəti klɑːs/
- **词义**: 优先级类；定义 Pod 的调度和抢占优先级，高优先级 Pod 可驱逐低优先级 Pod 获取资源
- **例句**: Assign a high PriorityClass to critical system Pods so they are not evicted during resource contention.
- **🪄 记忆**: Priority(优先级) + Class(等级) = "Pod 的 VIP 等级"——头等舱（high）乘客赶来，经济舱（low）乘客就得让座。K8s 资源不够时，优先级低的 Pod 先被赶走。

### 78. RuntimeClass
- **音标**: /ˈrʌntaɪm klɑːs/
- **词义**: 运行时类；选择 Pod 使用的容器运行时配置（如 gVisor、Kata Containers 实现更强的安全隔离）
- **例句**: Use a RuntimeClass with gVisor to run untrusted workloads with an additional security sandbox layer.
- **🪄 记忆**: Runtime(运行时) + Class(分类) = "容器引擎的选择器"——默认用 containerd（普通轿车），指定 RuntimeClass 可以用 gVisor（装甲车）、Kata（防弹车），按安全需求选。

### 79. VolumeSnapshot
- **音标**: /ˈvɒljuːm ˈsnæpʃɒt/
- **词义**: 卷快照；对 PersistentVolume 的某个时间点备份，用于数据恢复或迁移
- **例句**: Take a VolumeSnapshot before upgrading your database to roll back quickly if something goes wrong.
- **🪄 记忆**: Volume(卷) + Snapshot(快照) = "硬盘的拍立得照片"——升级数据库前来一张，翻车了直接用快照恢复。比完整备份快得多，就像拍张照片而不是画幅工笔画。

### 80. Seccomp (Secure Computing Mode)
- **音标**: /ˈsiːkɒmp/
- **词义**: 安全计算模式；Linux 内核特性，限制容器可用的系统调用(syscall)种类，减少攻击面
- **例句**: Seccomp profiles restrict the syscalls a container can make, preventing exploitation of unused kernel features.
- **🪄 记忆**: Sec(secure 安全) + comp(computing 计算) = "容器的行为管制"——每个容器能做什么 syscall（系统调用）像一列清单，Seccomp 就是"白名单"，清单上没有的一律拒绝。坏人想用漏洞搞事，发现手脚早被绑住了。

### 81. AdmissionController
- **音标**: /ədˈmɪʃən kənˈtrəʊlər/
- **词义**: 准入控制器；API 请求经过认证和授权后、持久化到 etcd 前，拦截请求进行校验或修改的插件
- **例句**: The `AlwaysPullImages` AdmissionController ensures every Pod uses the latest image by forcing image pull on every creation.
- **🪄 记忆**: Admission(准入) + Controller(控制器) = "K8s 大门口的安检员"——你请求创建 Pod，它先拦住检查：镜像拉策略对吗？有资源配额吗？没问题才放行（Validating），还可以顺手帮你加东西进去（Mutating）。

---

## 第9期 — 控制面组件、Service 类型与监控生态

### 82. KubeAPIServer (kube-apiserver)
- **音标**: /ˈkjuːb eɪ piː aɪ ˈsɜːrvər/
- **词义**: K8s API 服务器；控制平面的前端，所有 REST 请求都经过它认证、授权和准入
- **例句**: The KubeAPIServer processes all RESTful API requests and stores the cluster state in etcd.
- **🪄 记忆**: API(应用程序接口) + Server(服务器) = "K8s 的总机接线员"——谁来都得先找它，它是整个集群的大门。kubectl -> APIServer -> etcd，就这条线。

### 83. KubeControllerManager (kube-controller-manager)
- **音标**: /ˈkjuːb kənˈtrəʊlər ˈmænɪdʒər/
- **词义**: K8s 控制器管理器；集群中所有控制器的集合体，持续调谐集群状态到期望状态
- **例句**: The KubeControllerManager runs controllers that watch the cluster state and make changes to reach the desired state.
- **🪄 记忆**: Controller(控制器) + Manager(管理器) = "一群打工人的包工头"——包工头不干活，但管理着一堆小弟（控制器们）。Node 挂了它派个新 Node 干活，Pod 少了就补。

### 84. CloudControllerManager (cloud-controller-manager)
- **音标**: /klaʊd kənˈtrəʊlər ˈmænɪdʒər/
- **词义**: 云控制器管理器；将 K8s 与云厂商 API 集成，管理 LB 、节点路由、存储卷等外部资源
- **例句**: The CloudControllerManager interacts with the cloud provider to provision LoadBalancer type Services.
- **🪄 记忆**: 跟 KubeControllerManager 的区别：KCM 管集群内部的事，CCM 管跟云厂商打交道的事（建 LB 、调路由）。像公司的"外联部"。

### 85. ClusterIP
- **音标**: /ˈklʌstər aɪ piː/
- **词义**: 集群 IP；Service 默认类型，为 Service 分配一个集群内部可访问的虚拟 IP
- **例句**: The default Service type ClusterIP exposes the Service on a cluster-internal IP, reachable only from within the cluster.
- **🪄 记忆**: Cluster(集群) + IP(IP地址) = "内部员工专线"——集群内 Pod 能访问，外面的人不行。像公司内网。

### 86. HeadlessService
- **音标**: /ˈhedləs ˈsɜːrvɪs/
- **词义**: 无头 Service；不分配 ClusterIP（`clusterIP: None`），DNS 直接返回所有后端 Pod IP 列表
- **例句**: A HeadlessService enables stateful applications to discover individual Pod IPs via DNS lookups.
- **🪄 记忆**: Head(头=ClusterIP) + less(没有) = "没脑袋的 Service"——不要统一入口，给你一堆 IP 自己挑。StatefulSet 的最佳搭档。

### 87. IngressController
- **音标**: /ˈɪnɡres kənˈtrəʊlər/
- **词义**: Ingress 控制器；真正实现 Ingress 资源规则的流量代理（如 Nginx Ingress Controller 、 Traefik ）
- **例句**: An IngressController watches for Ingress resources and configures the underlying proxy to route traffic accordingly.
- **🪄 记忆**: Ingress 是"蓝图"，IngressController 是"施工队"。写了 Ingress 没人干活，蓝图就是废纸。

### 88. ValidatingAdmissionWebhook
- **音标**: /ˈvælɪdeɪtɪŋ ædˈmɪʃən ˈwebhʊk/
- **词义**: 验证准入 Webhook；API 请求持久化前进行自定义验证，不符合规则则拒绝
- **例句**: A ValidatingAdmissionWebhook can reject Pod creation if the container image doesn't come from an approved registry.
- **🪄 记忆**: Mutating 是"帮你改"，Validating 是"只查不改"——你提交 Pod，它检查：镜像来源对吗？标签有吗？不符合直接退件。

### 89. DownwardAPI
- **音标**: /ˈdaʊnwərd eɪ piː aɪ/
- **词义**: 向下 API；将 Pod 自身的元数据（名字、 Namespace、标签等）通过环境变量或文件注入到容器中
- **例句**: Use the DownwardAPI to expose the Pod's name and namespace as environment variables inside the container.
- **🪄 记忆**: Downward(向下) + API = "K8s 从上往下传小纸条"——容器不用猜"我是谁"，直接读 DownwardAPI 就知道自己的名字和 IP。

### 90. SessionAffinity
- **音标**: /ˈseʃn əˈfɪnəti/
- **词义**: 会话亲和性（粘性会话）； Service 将同一客户端的请求始终转发到同一个后端 Pod
- **例句**: Enable SessionAffinity on a Service to route all requests from the same client IP to the same Pod.
- **🪄 记忆**: Session(会话/登录状态) + Affinity(亲和/粘性) = "记住你是回头客"——默认 Service 随机分配，SessionAffinity 让你回回进同一个包间。

### 91. Prometheus
- **音标**: /prəˈmiːθiəs/
- **词义**: 普罗米修斯；开源监控报警工具包，K8s 生态标配， Pull 模式采集时间序列指标
- **例句**: Prometheus scrapes metrics from kubelet and application endpoints, then stores them in a time-series database.
- **🪄 记忆**: Prometheus = 希腊神话里偷火种的"盗火者"——在 K8s 里是"偷指标的"：从每个 Pod 、 Node 拉数据，存成时间序列，让你随时知道集群的"体温"和"心率"。

---

---

## 第10期 — 资源生命周期、排障与调度机制

### 92. Finalizer
- **音标**: /ˈfaɪnəlaɪzər/
- **词义**: 终结器；K8s 资源上的预删除钩子，在删除请求提交后、实际删除前执行清理逻辑
- **例句**: The `foregroundDeletion` finalizer ensures that child resources are deleted before the parent resource is removed.
- **🪄 记忆**: Final(最终) + ize(动词后缀) + er(者) → "最后把门人"。删除 K8s 资源时，Finalizer 说"等等，我先打扫干净（清理关联资源），你再删"。删不掉某个资源？检查一下有没有 Finalizer 在捣鬼。

### 93. Event
- **音标**: /ɪˈvent/
- **词义**: 事件；K8s 中记录资源状态变更的简短消息，用于排查问题和监控集群
- **例句**: Run `kubectl describe pod <name>` to view Events that show why a Pod failed to start.
- **🪄 记忆**: Event(事件) = K8s 的"朋友圈动态"——Pod 挂了、被驱逐了、镜像拉失败了…这些事都会被 K8s 发一条 Event。`kubectl get events --sort-by=.metadata.creationTimestamp` 是排障第一神器。

### 94. Lifecycle
- **音标**: /ˈlaɪfsaɪkl/
- **词义**: 生命周期/生命周期钩子；K8s 容器的 `postStart` 和 `preStop` 钩子，在容器启动后/停止前执行自定义操作
- **例句**: Use the `preStop` Lifecycle hook to gracefully drain connections before the container is terminated.
- **🪄 记忆**: Life(生命) + Cycle(周期/循环) = "容器的一生"。postStart: 出生时办出生证明。preStop: "临终关怀"——给容器几秒钟把客户请求处理完再安然离去。

### 95. RestartPolicy
- **音标**: /rɪˈstɑːrt ˈpɒləsi/
- **词义**: 重启策略；Pod 中容器退出后的重启行为，可设为 `Always`、`OnFailure`、`Never`
- **例句**: The default RestartPolicy is `Always`, so Pods automatically restart after any container exit.
- **🪄 记忆**: Restart(重启) + Policy(策略) = "容器的循环播放模式"。Always=无限循环，OnFailure=出错了重播，Never=播完就关机——Job 必须用 Never 或 OnFailure，否则它会无限重跑。

### 96. Scale
- **音标**: /skeɪl/
- **词义**: 伸缩/扩缩容；调整 Deployment 或 StatefulSet 的 Pod 副本数，增加(scale up)或减少(scale down)
- **例句**: `kubectl scale deployment nginx --replicas=5` scales the deployment to 5 Pod replicas.
- **🪄 记忆**: Scale(天平/刻度) = "调音量"——业务量大了把音量调大（加 Pod），小了调小（减 Pod）。Horizontal Pod Autoscaler 就是自动帮你"调音量"的智能喇叭。

### 97. Audit
- **音标**: /ˈɔːdɪt/
- **词义**: 审计；K8s 审计日志功能，记录所有 API 请求的详细流水，用于安全审查和合规
- **例句**: Enable the Audit log to trace who created, modified, or deleted which resources and when.
- **🪄 记忆**: Audit(审计) ≈ "监控摄像头"。kubectl 做的每件事都被 Audit Log 拍下来——谁、什么时候、干了什么、成功了没，全部有记录。生产安全必备，出了事回来查"监控录像"。

### 98. OwnerReference
- **音标**: /ˈəʊnər ˈrefrəns/
- **词义**: 所有者引用；标记 K8s 资源之间的父子关系，父资源删除时子资源自动被垃圾回收
- **例句**: A ReplicaSet has an OwnerReference pointing to its parent Deployment, so deleting the Deployment also removes all its ReplicaSets.
- **🪄 记忆**: Owner(所有者) + Reference(引用/指向) = "亲子鉴定报告"。Pod 的 OwnerReference 指向 ReplicaSet，ReplicaSet 又指向 Deployment。父挂了所有子一起陪葬——K8s 的自动连坐机制（垃圾回收）。

### 99. PortForward
- **音标**: /pɔːrt ˈfɔːrwərd/
- **词义**: 端口转发；kubectl 命令将本地端口转发到集群中的 Pod 端口，方便调试和本地访问
- **例句**: `kubectl port-forward pod/my-pod 8080:80` forwards local port 8080 to the Pod's port 80.
- **🪄 记忆**: Port(端口) + Forward(转发) = "K8s 的 SSH 隧道"。想访问集群里的数据库但又不想暴露 Service？`port-forward` 像一根管子，把你电脑的端口和 Pod 的端口直接接通——调试利器，没有之一。

### 100. Mount
- **音标**: /maʊnt/
- **词义**: 挂载；将存储卷（Volume）附加到 Pod 容器中的指定路径，使数据在容器内可访问
- **例句**: Mount the ConfigMap as a volume so the application can read configuration from `/etc/config/`.
- **🪄 记忆**: Mount(登上/装上) ≈ 给容器"插U盘"。`volumeMounts` 就是告诉 K8s："把这个存储挂到这个目录上"。不 Mount 的话，Pod 里根本看不到存储卷，就像U盘插了但不识别。

### 101. Preemption
- **音标**: /priˈempʃən/
- **词义**: 抢占；高优先级 Pod 在资源不足时驱逐低优先级 Pod 来获取资源的过程
- **例句**: When a high-priority Pod cannot be scheduled due to insufficient resources, Preemption kicks in to evict lower-priority Pods.
- **🪄 记忆**: Pre(预先) + empt(买/拿) + ion → "高级优先插队"。坐经济舱的人被空姐请起来让座给头等舱乘客——这就是 Preemption。PriorityClass 设得越高，挤走别人抢座位的权利越大。

---

## 第11期 — 核心概念与架构理念

### 102. Reconcile
- **音标**: /ˈrekənsaɪl/
- **词义**: 协调/调谐；K8s 控制器的核心运作模式——持续将当前状态调谐为期望状态
- **例句**: The controller continuously reconciles the actual cluster state with the desired state defined in the manifest.
- **🪄 记忆**: Re(再) + concile(使一致) → K8s 像个强迫症患者，一直反复检查"现在是这样吗？不是？那我改！"——这就是 Reconciliation Loop（调谐循环），K8s 一切自动化的根基。

### 103. Declarative
- **音标**: /dɪˈklærətɪv/
- **词义**: 声明式的；告诉系统"我要什么"而非"怎么做"的配置方式
- **例句**: Kubernetes is a declarative system — you specify the desired state, and it figures out how to get there.
- **🪄 记忆**: Declare(声明/宣告) → 声明式就像点外卖："我要一份牛肉面"（Desired State），而不是命令式："生火→烧水→煮面→加牛肉"（Imperative）。K8s 就是你的专属厨师，你说吃什么它来做。

### 104. Observability
- **音标**: /əbˌzɜːrvəˈbɪləti/
- **词义**: 可观测性；通过日志(Logs)、指标(Metrics)、链路(Traces)三件套了解系统内部状态
- **例句**: A good observability stack helps you understand why a Pod crashed without needing to SSH into the node.
- **🪄 记忆**: Observe(观察) + ability(能力) = "能看出来里面在搞什么鬼"。Logs(日志)是日记本，Metrics(指标)是体检表，Traces(链路)是侦探路线图。三者齐全=完全可观测。

### 105. Orchestration
- **音标**: /ˌɔːrkɪˈstreɪʃən/
- **词义**: 编排；自动化管理容器的部署、扩缩、网络和生命周期
- **例句**: Kubernetes is the industry-standard platform for container orchestration at scale.
- **🪄 记忆**: Orchestration = 管弦乐"编曲"。指挥（K8s）站在台上，让每个乐手（容器）知道什么时候该演奏、多大声音、谁跟谁配合——这就是"容器编排"。

### 106. Bootstrap
- **音标**: /ˈbuːtstræp/
- **词义**: 引导/自举；系统从零开始启动并自我初始化的过程
- **例句**: `kubeadm init` bootstraps a Kubernetes control plane by generating certificates, starting components, and configuring networking.
- **🪄 记忆**: Bootstrap = "提自己的鞋带把自己拽起来"（拔靴自举）。想象从一台裸机到 K8s 集群运行——Bootstrap 就是那个"从无到有"的魔法步骤。

### 107. Resilience
- **音标**: /rɪˈzɪliəns/
- **词义**: 弹性/韧性；系统在故障后自动恢复并继续运行的能力
- **例句**: Kubernetes resilience means if a Node fails, the workload is automatically rescheduled onto healthy Nodes.
- **🪄 记忆**: Resilience = "打不死的小强精神"。Pod 挂了重启、Node 挂了迁移、机房挂了…在 K8s 能管的范围内，它比任何系统都扛揍。

### 108. Immutable
- **音标**: /ɪˈmjuːtəbl/
- **词义**: 不可变的；一旦创建不会被修改——更新时用新版本替换而非原地修改
- **例句**: Container images are immutable — you never patch a running container, you deploy a new image instead.
- **🪄 记忆**: Im(不) + mutable(可变的) = "永不修改，只重建"。Immutable Infrastructure 的核心思想：不修破房子，盖新的。

### 109. Isolation
- **音标**: /ˌaɪsəˈleɪʃən/
- **词义**: 隔离；将不同应用或租户的资源和环境分离，互不干扰
- **例句**: Namespaces provide a level of Isolation — Pods in different namespaces cannot see each other's resources by default.
- **🪄 记忆**: Isolation ≈ "隔离病房"。一个 Pod 炸了不会影响另一个，测试 Namespace 不会干扰生产——你住你家我住我家，同一栋楼（集群）也互不打扰。

### 110. Disruption
- **音标**: /dɪsˈrʌpʃən/
- **词义**: 中断/干扰；Pod 因节点维护、资源回收等主动操作导致的不可用
- **例句**: PodDisruptionBudget limits the number of voluntary disruptions a set of Pods can tolerate simultaneously.
- **🪄 记忆**: Disruption(干扰) ≈ "有人来砸场子"。分两种：自愿的（你主动维护节点）和非自愿的（机器挂了）。PDB 告诉你："你想搞事可以，但最多只能搞掉两个 Pod"。

### 111. Watch
- **音标**: /wɒtʃ/
- **词义**: 监听/观察；K8s API 的长连接机制，实时接收资源变更通知
- **例句**: The controller uses a Watch on Pod resources to get notified immediately when a Pod is created or deleted.
- **🪄 记忆**: Watch ≠ 看时间的表，是侦探"蹲点守候"的 Watch。K8s 控制器们不轮询（Polling），而是"挂个 Watch"等通知——一有风吹草动 API Server 就 push 消息过来。

---

## 第12期 — 集群工具、可观测性与 API 扩展

### 112. ImagePullBackOff

- **音标**: /ˈɪmɪdʒ pʊl bæk ɔːf/
- **词义**: 镜像拉取回退状态；K8s 拉取容器镜像失败后持续重试并逐渐增大间隔的状态
- **例句**: The Pod is stuck in ImagePullBackOff — check if the image tag is correct and the registry is accessible.
- **🪄 记忆**: Image(镜像) + Pull(拉取) + BackOff(回退) → K8s 去拉镜像，拉不到就等一会儿再试，还不行再等久一点……像网不好时疯狂刷新页面，刷一次等久一点。最常见的引发原因：镜像名写错了、标签不存在、私有仓库没登录。

### 113. kubeadm

- **音标**: /ˈkjuːb ædəm/
- **词义**: K8s 官方集群初始化工具；用于快速搭建符合最佳实践的 Kubernetes 集群
- **例句**: Run `kubeadm init` to bootstrap a Kubernetes control plane with TLS certificates and all core components.
- **🪄 记忆**: kube(8s) + adm(admin 管理员) → K8s 的"一键装机盘"——`kubeadm init` + `kubeadm join` 两条命令就能从零搭好集群。K8s 官方认证的集群搭建方式，生产环境最常用。

### 114. MetricsServer

- **音标**: /ˈmetrɪks ˈsɜːrvər/
- **词义**: 指标服务器；K8s 内置的资源指标收集组件，聚合每个 Node 上 kubelet 的 CPU/内存使用数据
- **例句**: MetricsServer collects resource usage metrics so that `kubectl top` and HPA can work.
- **🪄 记忆**: Metrics(指标) + Server(服务器) → K8s 的"体检仪"。没有它 `kubectl top pod` 会报错、HPA 不会工作。它定期给每个 Pod/Node 量"体温"（CPU/内存），不装的话集群就是个"瞎子"。

### 115. EndpointSlice

- **音标**: /ˈendpɔɪnt slaɪs/
- **词义**: 端点切片；Endpoint 的升级版，将 Service 后端 Pod IP 列表按页（Slice）拆分，支持大规模集群
- **例句**: EndpointSlice improves scalability by splitting endpoint data into smaller, independently updatable slices.
- **🪄 记忆**: Endpoint(端点) + Slice(切片) → 传统 Endpoint 像把全部 Pod IP 写在一张纸上，Pod 多了纸太大。EndpointSlice 把纸切成几页（每页最多100个 IP），改一个 Pod 只更新一页。K8s 1.21+ 默认启用。

### 116. IngressClass

- **音标**: /ˈɪnɡres klɑːs/
- **词义**: Ingress 类；指定 Ingress 资源由哪个 Ingress Controller 处理，支持集群中部署多个 Ingress 控制器
- **例句**: Add `ingressClassName: nginx` to your Ingress to route traffic through the NGINX Ingress Controller.
- **🪄 记忆**: Ingress(入口) + Class(类) → 想象公司大门。如果集群里装了 Nginx Ingress 和 Traefik 两个门卫，IngressClass 就是告诉 K8s："这个 Ingress 归 Nginx 管"。K8s 1.18+ GA，替代旧的 `kubernetes.io/ingress.class` 注解。

### 117. ClusterAutoscaler

- **音标**: /ˈklʌstər ˈɔːtoʊskeɪlər/
- **词义**: 集群自动扩缩器；当 Pod 因资源不足挂起(Pending)时自动增加 Node，Node 空闲时自动缩容
- **例句**: ClusterAutoscaler adds new worker nodes when Pods are unschedulable due to insufficient resources.
- **🪄 记忆**: Cluster(集群) + Autoscaler(自动扩缩器) → HPA 是"加 Pod"，ClusterAutoscaler 是"加机器"（Node）。HPA 说"人不够"，它就买新桌子（加 Node）。在云上最实用——高峰期自动扩容加机器，低谷期缩容省费用。

### 118. KubeStateMetrics (kube-state-metrics)

- **音标**: /ˈkjuːb steɪt ˈmetrɪks/
- **词义**: K8s 状态指标生成器；监听 API Server，将 K8s 对象（Deployment、Pod、Node 等）的状态转化为 Prometheus 指标
- **例句**: KubeStateMetrics exposes metrics like `kube_deployment_status_replicas_available` for Prometheus to scrape.
- **🪄 记忆**: Kube(8s) + State(状态) + Metrics(指标) → K8s 内部消息的"翻译官"。K8s 自己只知道资源状态，Prometheus 只认识指标——KubeStateMetrics 把前者翻译成后者。有了它你才能监控到"有多少 Pod Ready"、"Deployment 副本数够不够"。

### 119. Krew

- **音标**: /kruː/
- **词义**: kubectl 插件管理器；从插件市场搜索、安装和管理 kubectl 扩展
- **例句**: Install Krew to browse and install kubectl plugins like `stern` for log tailing or `tree` for resource hierarchy.
- **🪄 记忆**: Krew(crew 船员) → K8s 水手（kubectl）需要一个"工具包管理员"——Krew 就是这个角色。`kubectl krew install` 装上就能用各种插件（比如 `kubectl tree` 看资源树、`kubectl sniff` 抓包），就像 iPhone 的 App Store 之于手机。

### 120. Descheduler

- **音标**: /diːˈʃɛdjuːlər/
- **词义**: 重调度器；检测并重新平衡集群中 Pod 分布不均的问题，驱逐 Pod 触发 Scheduler 重新调度
- **例句**: The Descheduler evicts Pods from over-utilized nodes so they can be rescheduled onto less loaded ones.
- **🪄 记忆**: De(反/移除) + Scheduler(调度器) → Scheduler 管"放进来"，Descheduler 管"挪出去"。时间长了集群里 Pod 分布会歪（有的 Node 挤爆有的空转），Descheduler 就像搬家师傅——把拥挤楼层的几家搬到空旷楼层。配合 ClusterAutoscaler 效果更佳。

### 121. AggregationLayer (API Aggregation Layer)

- **音标**: /ˌæɡrɪˈɡeɪʃən ˈleɪər/
- **词义**: API 聚合层；K8s API Server 的扩展机制，允许注册第三方 API 服务，使其看起来像原生 K8s API
- **例句**: The AggregationLayer lets you extend the Kubernetes API with custom services like the Metrics Server.
- **🪄 记忆**: Aggregation(聚合) + Layer(层) → K8s API 的"扩展插槽"。你的 API 服务注册上去后，`kubectl get` 后面可以直接接你自定义的命令，就像 MetricsServer 让你能 `kubectl top nodes`。无需 CRD，直接接管标准 API 路径。

---

> 📅 最后更新：2026-07-07 | 累计 121 词 | 持续更新中 🐾

---

## 第13期 — 云原生生态工具与组件

### 122. Helmfile

- **音标**: /ˈhelmfaɪl/
- **词义**: 声明式 Helm Chart 部署编排工具；通过一个 YAML 文件统一管理多个 Helm Release 的版本、依赖与 values
- **例句**: With Helmfile, you can deploy a complete stack — Prometheus, Grafana, and Loki — in a single `helmfile sync` command.
- **🪄 记忆**: Helm + file → Helm 是 K8s 的"应用商店"，Helmfile 就是"购物清单"。你在一张清单上写好要装什么、去哪里下、参数怎么配，`helmfile sync` 一键搞定全部。比一个个 `helm install` 更省心，CI/CD 里尤其好用。

### 123. Kubebuilder

- **音标**: /ˈkjuːb bɪldər/
- **词义**: K8s Operator 官方开发框架；提供代码生成脚手架，快速构建基于 controller-runtime 的自定义控制器
- **例句**: Use Kubebuilder to scaffold a new Operator project with CRDs, controllers, and webhooks in minutes.
- **🪄 记忆**: Kube(8s) + Builder(建造者) → 你想给 K8s 写个"智能管家"（Operator）？Kubebuilder 就是毛坯房变成精装修的工具包——帮你搭好脚手架、生成 CRD 模板、注入 Controller 框架，你只需写核心业务逻辑。K8s 官方推荐开发方式。

### 124. FluentBit

- **音标**: /ˈfluːənt bɪt/
- **词义**: 轻量级日志采集与处理器；CNCF 毕业项目，常用于 K8s 中采集 Pod 日志并转发到 Elasticsearch/Loki 等后端
- **例句**: Deploy FluentBit as a DaemonSet to collect container logs from every node and forward them to your logging backend.
- **🪄 记忆**: Fluent(流动的) + Bit(少量/比特) → 想象一根超细的吸管插在每一个 Node 上，把容器日志一滴不漏地吸出来送到日志中心。和 Filebeat 比，FluentBit 是"小身材大本事"——内存占用不到 10MB，C 语言写的效率爆表。EFK 栈里的 F 就是它。

### 125. OpenPolicyAgent (OPA)

- **音标**: /ˈoʊpən ˈpɒlɪsi ˈeɪdʒənt/
- **词义**: 云原生策略引擎；CNCF 毕业项目，用 Rego 语言编写策略，统一在 K8s 中执行准入控制、配置审计等策略
- **例句**: OPA enforces policies like "all container images must come from a trusted registry" across the entire cluster.
- **🪄 记忆**: Open(开放) + Policy(策略) + Agent(代理) → 想象 K8s 集群的"门卫总管"。你在一个地方写好规则（Rego 语言），它就能在所有地方执行——准入控制（谁能进）、配置审计（配置对不对）、甚至微服务授权（谁能调用谁）。K8s 原生的策略大脑。

### 126. Gatekeeper

- **音标**: /ˈɡeɪtkiːpər/
- **词义**: 基于 OPA 的 K8s 原生准入控制器；将 OPA 策略包装为 K8s CRD，通过 Admission Webhook 强制执行
- **例句**: Gatekeeper rejects any Pod that doesn't have the required labels defined in the `ConstraintTemplate`.
- **🪄 记忆**: Gate(大门) + Keeper(守护者) → 名副其实的"守门员"。你把规则写成 CRD（`ConstraintTemplate`），它守在 API Server 门口——任何不符合规则的资源请求（创建/更新）都被拦截。就像园区保安——"你的 Pod 没有 label 标签？对不起，你不能进去。"

### 127. Kyverno

- **音标**: /kaɪˈvɜːrnoʊ/
- **词义**: K8s 原生策略引擎；比 OPA/Gatekeeper 更易上手，策略用 YAML 写（而非 Rego），天然就是 K8s 资源格式
- **例句**: With Kyverno, you can write a policy that automatically adds sidecar proxies to all new Pods — without modifying your deployments.
- **🪄 记忆**: 发音像"开 fun"（放开玩）→ 你不用学新语言（Rego），直接用 YAML 写策略。比如"所有 Pod 必须带监控标签"、"自动注入 Istio Sidecar"——几行 YAML 搞定。K8s 原生策略领域的新星，对小团队尤其友好。

### 128. ArgoCD

- **音标**: /ˈɑːrɡoʊ siː diː/
- **词义**: GitOps 持续交付工具；以 Git 仓库为单一事实来源，自动将 K8s 集群状态与 Git 中的声明式配置保持同步
- **例句**: ArgoCD automatically syncs your cluster to the desired state defined in the Git repository whenever changes are merged.
- **🪄 记忆**: Argo(阿尔戈号) + CD(持续交付) → 名字取自希腊神话的阿尔戈号（Jason 找金羊毛的船），象征"航行与发现"。GitOps 思路就一句话：**Git 里写着"我要什么"，ArgoCD 就确保集群里"有什么"**。`git push` 一顿操作，ArgoCD 自动同步到集群，比 `kubectl apply` 更可追溯、更可靠。

### 129. Flux

- **音标**: /flʌks/
- **词义**: GitOps 运维工具；CNCF 毕业项目，支持将 K8s 集群与 Git、Helm、OCI 等多种来源同步，是 ArgoCD 之外另一主流选择
- **例句**: Flux monitors the Git repository for changes and reconciles the cluster state automatically — no manual kubectl needed.
- **🪄 记忆**: Flux(流动/持续变化) → 名字暗示"持续流动的状态"。和 ArgoCD 的拉模式（Pull）不同，Flux 是"推+拉"混合模式，更轻量、更贴合 Helm 场景。Flux + ArgoCD 可以同时使用——Flux 管基础设施层，ArgoCD 管应用层。

### 130. Keda

- **音标**: /ˈkiːdə/
- **词义**: 事件驱动自动伸缩组件；将 HPA 与事件源（Kafka、RabbitMQ、Prometheus 等 50+ 触发器）桥接，按业务指标自动扩缩容器
- **例句**: KEDA scales the consumer Pods from zero to fifty when the Kafka queue length exceeds 100 messages.
- **🪄 记忆**: 全称 Kubernetes Event-Driven Autoscaler → K8s 的"事件驱动扩缩器"。HPA 只能看 CPU/内存，Keda 可以看"队列里有几条消息""Redis 延迟多高"。最酷的是**从 0 扩到 N**——没人用就缩到 0 节省资源，一有事件立刻弹起来。适合消息队列处理、流式计算场景。

### 131. Cilium

- **音标**: /ˈsɪliəm/
- **词义**: 基于 eBPF 的高性能 CNI 网络插件；提供网络连接、安全策略、可观测性，是云原生网络领域最先进的技术之一
- **例句**: Cilium uses eBPF to provide faster networking and more granular security policies than traditional iptables-based approaches.
- **🪄 记忆**: 取自生物学中的"纤毛"（cilium）→ 纤毛是细胞表面像头发丝的微结构，负责物质运输。Cilium 的 eBPF 技术就像"网络纤毛"——不用进入内核网络栈，直接在 Linux 内核里高效处理数据包。和传统 iptables 相比：更快（eBPF 直接在内核执行）、更细（可识别 HTTP/gRPC 协议的 L7 策略）。CNCF 毕业项目，K8s 网络的新一代标杆。

---

> 📅 最后更新：2026-07-08 | 累计 131 词 | 持续更新中 🐾

---

## 第14期 — 基础设施概念与运维模式

### 132. Lease

- **音标**: /liːs/
- **词义**: 租约；K8s 中的 Lease API 资源，用于分布式协调，最常见的是控制器通过 Lease 进行 Leader Election（领导者选举），确保同一时刻只有一个 Controller 在工作
- **例句**: Each controller manager uses a Lease to determine which replica is the active leader, preventing duplicate reconciliation.
- **🪄 记忆**: Lease（租约）= K8s 的"轮值排班表"。多个 Controller Manager 实例中只有一个人能干活——大家抢 Lease 租约，谁抢到谁值班。Lease 过期了没续约，其他人自动顶上。

### 133. Webhook

- **音标**: /ˈwebhʊk/
- **词义**: 网络钩子；HTTP 回调机制，K8s 通过 Admission Webhook（准入钩子）拦截 API 请求，在资源持久化前进行自定义校验（Validating）或修改（Mutating）
- **例句**: A ValidatingWebhookConfiguration registers an external HTTP endpoint as an admission controller that can accept or reject API requests.
- **🪄 记忆**: Web(网络) + Hook(钩子) → 你往 API Server 门口装了个"钩子"——每次有人提交资源请求，钩子就把请求截住，先发到你的外部服务检查一遍。Istio 的 Sidecar 注入、OPA Gatekeeper 策略检查全是靠 Webhook 实现的。

### 134. Canary

- **音标**: /kəˈneri/
- **词义**: 金丝雀发布/灰度发布；逐步将新版本流量从 1% 平滑增加到 100% 的部署策略，先喂一小部分流量验证，没问题再全量放量
- **例句**: Deploy the new version as a Canary with 5% traffic, monitor error rates for an hour, then gradually increase to 100%.
- **🪄 记忆**: 源自煤矿工人带金丝雀下井——鸟对有毒气体极其敏感，鸟死了说明有毒得撤。Canary 部署同理：新版本先喂给小部分用户，炸了也只影响小部分人，稳了再全量上线。

### 135. Cgroup (Control Group)

- **音标**: /ˈsiːɡruːp/
- **词义**: 控制组；Linux 内核特性，限制、隔离和统计进程组的资源使用（CPU、内存、磁盘I/O、网络），是容器技术的基础隔离手段
- **例句**: The container runtime creates a Cgroup for each container to enforce the CPU and memory limits defined in the Pod spec.
- **🪄 记忆**: 给每个容器画了一个"笼子"，写着"最多用 1 核 CPU、512MB 内存"——Cgroup 就是那个严格执行规则的笼子看守。没有 Cgroup，一个流氓容器能吃掉整台机器的资源。

### 136. Backoff

- **音标**: /ˈbæk ɔːf/
- **词义**: 退避；失败后逐渐增加重试间隔的指数退避策略（Exponential Backoff），K8s 在 ImagePullBackOff、CrashLoopBackOff 等处都使用此机制防止频繁重试压垮系统
- **例句**: When a container crashes, the kubelet uses exponential Backoff — waiting 10s, 20s, 40s, 80s — before retrying.
- **🪄 记忆**: Back(回) + Off(离开) → "退一步海阔天空"。失败了别马上再试——等 10 秒，再失败等 20 秒，每次都加倍。K8s 里 BackOff 随处可见，是一种"温柔的重试机制"。

### 137. DryRun

- **音标**: /draɪ rʌn/
- **词义**: 模拟执行/预演；`--dry-run=client` 或 `--dry-run=server` 模式，在不实际创建/修改资源的情况下验证请求的合法性
- **例句**: Run `kubectl apply -f deployment.yaml --dry-run=client` to check if the YAML is valid before applying it.
- **🪄 记忆**: Dry(干的/假的) + Run(跑一趟) → 像演戏前的走位彩排。client 模式本地验语法，server 模式走完整个准入流程但不存 etcd。部署前 DryRun 一下，避免翻车。

### 138. Provision

- **音标**: /prəˈvɪʒən/
- **词义**: 供应/动态分配；K8s 中自动创建和分配资源的过程，常见于动态存储供应（Dynamic Provisioning）——StorageClass 自动创建 PV
- **例句**: When a PVC is created, the StorageClass provisions a new PersistentVolume automatically from the storage backend.
- **🪄 记忆**: Provision = "自动备货"。你饿了（需要存储），写个 PVC（点餐单），K8s 直接调 StorageClass（厨房）Provision（现做）一份 PV（端上桌）。省去了手动准备 PV 的麻烦。

### 139. Termination (Graceful Termination)

- **音标**: /ˌtɜːrmɪˈneɪʃən/
- **词义**: 终止/优雅关闭；Pod 删除时 K8s 先发 SIGTERM 信号给主进程，等待 `terminationGracePeriodSeconds`（默认 30s）后若进程未退出则发 SIGKILL 强制杀死
- **例句**: Implement a SIGTERM handler in your application to drain active connections during graceful Termination.
- **🪄 记忆**: K8s 不会直接拔电源——先发 SIGTERM（"收拾东西准备下班"），30s 后发 SIGKILL（"好了，强制走人"）。应用必须处理好 SIGTERM 信号才能实现优雅关闭。

### 140. Overlay

- **音标**: /ˈoʊvərleɪ/
- **词义**: 覆盖网络；在物理网络之上构建的虚拟二层网络，K8s 的 CNI 插件（Flannel、Calico 等）通过 Overlay 网络（如 VXLAN）实现跨节点的 Pod 互通
- **例句**: An Overlay network encapsulates Pod traffic in UDP packets so that Pods on different nodes can communicate as if they were on the same LAN.
- **🪄 记忆**: Over(在……上) + Lay(铺设) → 在实体马路上空架"虚拟高速公路"。Pod 们感觉自己在一个二层网络上，物理网络细节完全透明。

### 141. GarbageCollection (GC)

- **音标**: /ˈɡɑːrbɪdʒ kəˈlekʃən/
- **词义**: 垃圾回收；K8s 通过 OwnerReference 自动清理不再需要的资源——删除 Deployment 时自动删除其 ReplicaSet 和 Pod，孤儿资源定期清理
- **例句**: When you delete a Deployment, GarbageCollection automatically removes all its child ReplicaSets and Pods.
- **🪄 记忆**: "自动打扫卫生"。基于 OwnerReference 的级联删除：父资源没了，子资源全部陪葬。也支持孤儿（Orphan）模式：父删了但子留着各自独立。

---

## 第15期 — 日常运维操作与集群配置

### 142. Selector

- **音标**: /sɪˈlektər/
- **词义**: 选择器；通过标签（Label）匹配一组资源的机制，kubectl 和 Service、Deployment 等核心资源都依赖它筛选目标对象
- **例句**: The Service uses a label Selector to determine which Pods receive traffic.
- **🪄 记忆**: Select(选择) + or(者) → 用"标签过滤器"从一堆 Pod 中精准捞出你要的那几个，像用筛子选豆子。

### 143. Patch

- **音标**: /pætʃ/
- **词义**: 补丁/部分更新；对资源进行局部更新而非整体替换的操作方式，支持 JSON Patch 和 Strategic Merge Patch
- **例句**: Use kubectl patch to update a single field without modifying the entire resource.
- **🪄 记忆**: 打补丁→ 不用重做整条裤子，破哪补哪就完事了。kubectl patch 同理，改一个字段不用重新写整个 YAML。

### 144. Exec

- **音标**: /ɪɡˈzek/
- **词义**: 执行命令；kubectl exec 进入运行中的容器内部执行命令，是日常排障最常用的操作之一
- **例句**: Run kubectl exec -it my-pod -- /bin/sh to open a shell inside the container.
- **🪄 记忆**: execute（执行）的缩写。想象你把脑袋伸进容器里喊了一嗓子——这就是 exec 干的事。

### 145. Logs

- **音标**: /lɔːɡz/
- **词义**: 日志；kubectl logs 从 Pod 内容器拉取标准输出日志，排查问题时永远第一个想到的命令
- **例句**: Check the application Logs with kubectl logs pod-name -c container-name.
- **🪄 记忆**: 航海日志→ 容器里发生的一切都记录在 stdout 这条"船长的航海日志"里，kubectl logs 就是翻出来看的动作。

### 146. Attach

- **音标**: /əˈtætʃ/
- **词义**: 附加/连接到；kubectl attach 将本地标准输入/输出连接到运行中容器的进程上，与 exec 类似但更接近"偷听"实时输出
- **例句**: You can Attach to a running process to see its real-time output.
- **🪄 记忆**: 像拿听诊器贴在容器壁上——attach 就是"贴上去听听里面在输出啥"。

### 147. TLS (Transport Layer Security)

- **音标**: /tiː el es/
- **词义**: 传输层安全协议；K8s 中 Ingress、etcd 通信、kubelet API 等都依赖 TLS 证书进行加密和身份认证
- **例句**: The Ingress resource terminates TLS using a Secret that contains the certificate and private key.
- **🪄 记忆**: HTTPS 前面那把锁🔒。在 K8s 里一切都是加密管道——etcd、kubelet、apiserver 全用 TLS 握手，没它集群就是裸奔。

### 148. PKI (Public Key Infrastructure)

- **音标**: /piː keɪ aɪ/
- **词义**: 公钥基础设施；K8s 集群安全的基础骨架，包括 CA 证书、服务端/客户端证书和密钥对
- **例句**: Kubernetes PKI consists of Certificate Authorities and signed certificates for each control plane component.
- **🪄 记忆**: K8s 集群的"身份证系统"——每个组件（apiserver、etcd、kubelet）都有专属身份证（证书），CA 就是办证中心。

### 149. Dashboard

- **音标**: /ˈdæʃbɔːrd/
- **词义**: 仪表盘；Kubernetes Dashboard 是一套 Web UI，用于可视化管理和监控集群资源
- **例句**: Deploy the Kubernetes Dashboard to get a graphical overview of your cluster's workloads.
- **🪄 记忆**: 汽车仪表盘——转速、油量、时速一目了然。K8s Dashboard 也一样，点几下鼠标就能看见集群里所有东西在不在干活。

### 150. Plugin

- **音标**: /ˈplʌɡɪn/
- **词义**: 插件；kubectl plugin 机制扩展 kubectl 功能，Krew 是官方插件管理器
- **例句**: Install third-party Plugins via Krew to add custom kubectl subcommands.
- **🪄 记忆**: 插座🔌→ 插上就能用。kubectl plugin 就像给 kubectl 这个"排插"接上各种小工具，用完拔走也不影响本体。

### 151. Config

- **音标**: /kənˈfɪɡ/
- **词义**: 配置；kubectl config 管理 kubeconfig 文件，包括集群、用户凭据和上下文（context）的切换
- **例句**: Use kubectl config use-context to switch between different clusters.
- **🪄 记忆**: Configure（配置）的缩写。kubeconfig 是你的"集群护照本"——里面记了你去过哪些集群、用什么身份、现在在哪个集群干活。

---

## 第16期 — 云原生生态工具与实践（上）

### 152. Istio

- **音标**: /ˈɪstiəʊ/
- **词义**: 服务网格（Service Mesh）；连接、监控和保护微服务的开源平台，在 K8s 中以 Sidecar 模式注入 Envoy 代理，管理流量路由、安全通信和可观测性
- **例句**: Istio injects an Envoy sidecar proxy into each Pod to handle traffic management and security policies without modifying application code.
- **🪄 记忆**: 发音像"一丝提欧"——想象进到一栋大楼，**一**切交通都由**丝**绸之路（网格）来调度，而不需要每个租户自己修路。
- **关联词**: Sidecar, Envoy, ServiceMesh

### 153. cert-manager

- **音标**: /sɜːrt ˈmænɪdʒər/
- **词义**: 证书管理器；K8s 原生 TLS 证书生命周期管理工具，自动从 Let's Encrypt、Vault 等签发者获取证书并更新 Secret
- **例句**: cert-manager automatically issues a Let's Encrypt certificate for the Ingress and renews it before expiry.
- **🪄 记忆**: Certificate(证书) + Manager(管家) → 你不再需要手动申请证书、手动上传 Secret、手动续期——cert-manager 全自动搞定，就像帮你管好所有"证件"的秘书。
- **关联词**: TLS, Secret, Ingress

### 154. Velero

- **音标**: /vəˈleroʊ/
- **词义**: K8s 集群备份恢复工具；支持备份整个集群的资源对象和持久卷快照，可迁移到另一集群
- **例句**: Schedule daily Velero backups to an S3 bucket so you can restore the entire cluster in case of disaster.
- **🪄 记忆**: 灵感来自"veloce"（意大利语"快速"）→ 灾难恢复的时候你要的就是"快"！想想你 Git 不提交代码、数据库不备份——Velero 就是给 K8s 集群买的"意外险"。出了事一个 `restore` 命令全回来。
- **关联词**: VolumeSnapshot, Backup, Restore

### 155. Knative

- **音标**: /ˈneɪtɪv/
- **词义**: 无服务器(Serverless)平台；构建在 K8s 之上，自动将应用从零缩容到零，根据请求自动扩缩，尤其适合事件驱动工作负载
- **例句**: Knative Serving auto-scales your application down to zero Pods when there are no requests, saving cluster resources.
- **🪄 记忆**: K(8s) + Native(原生) → 发音同"native"。它让 K8s 原生支持 Serverless 模式——没流量时缩到 0 省资源，有请求时秒级弹起，像电灯一样"即开即用"。
- **关联词**: Keda, Serverless, AutoScale

### 156. Harbor

- **音标**: /ˈhɑːrbər/
- **词义**: 企业级容器镜像仓库；CNCF 毕业项目，提供镜像存储、漏洞扫描、镜像签名、复制同步、RBAC 等企业级功能
- **例句**: Push your production images to Harbor with vulnerability scanning enabled to ensure no critical CVEs are deployed.
- **🪄 记忆**: Harbor(港口/避风港) → 所有容器镜像就像一艘艘船，Docker Hub 是公共码头，Harbor 是你公司的**私有港口**——船（镜像）停在这里安全（漏洞扫描）又有秩序（RBAC），不被外人乱动。
- **关联词**: Image, Registry, Docker

### 157. Traefik

- **音标**: /ˈtrɛfɪk/
- **词义**: 云原生反向代理和负载均衡器；作为 Ingress Controller 自动监听 K8s 后端的变化并动态更新路由规则
- **例句**: Traefik automatically discovers new Services in the cluster and exposes them via the Ingress without manual configuration reloads.
- **🪄 记忆**: 名字来自 traffic（流量）的变体。和 Nginx Ingress 比，最大的不同是**自动发现**：你创建一个新的 Service，Traefik 自己就配好路由了，不用 reload 配置。
- **关联词**: Ingress, IngressController, ReverseProxy

### 158. Minikube

- **音标**: /ˈmɪnikjuːb/
- **词义**: 本地单节点 K8s 集群工具；一键在本地机器上启动轻量级 K8s 集群，适合开发和测试环境
- **例句**: Run `minikube start` to spin up a local Kubernetes cluster on your laptop in under a minute.
- **🪄 记忆**: Mini(迷你) + Kube(8s) → 真正的"迷你"K8s。K8s 集群一般要 3 台以上服务器，但 Minikube 把整个集群封装成一台虚拟机——"全家挤在一个小房间里"但功能一个不少。开发者的入门首选。
- **关联词**: kubeadm, Kind, LocalCluster

### 159. Kind (Kubernetes in Docker)

- **音标**: /kaɪnd/
- **词义**: Docker 内的 K8s 集群工具；每个 Node 实际上是一个 Docker 容器，比 Minikube 更轻量、启动更快，是 CI/CD 环境首选
- **例句**: Use `kind create cluster` to run a multi-node K8s cluster entirely inside Docker containers for integration testing.
- **🪄 记忆**: Kind = K(8s) + in + D(ocker) → 如果说 Minikube 是"小别墅"，Kind 就是"集装箱房"——每个 Node 都是一个 Docker 容器。CI 里跑 Kind 集群飞快，用完直接删掉，**干干净净不留痕迹**。CI/CD 场景下 Kind 比 Minikube 更受青睐。
- **关联词**: Docker, CI, IntegrationTest

### 160. Telepresence

- **音标**: /ˈtɛlɪprɛzəns/
- **词义**: 本地开发调试工具；将本地开发环境无缝接入远程 K8s 集群，让本机服务就像运行在集群中一样，直接访问集群内的其他 Service
- **例句**: With Telepresence, you can run a local debugging version of your service while it communicates with real K8s services in the cluster.
- **🪄 记忆**: Tele(远程) + Presence(在场) → **"远程在场"**——你在本地写代码改一改就能跑，但 K8s 集群里的其他 Pod 以为你也在集群里。就像**远程会议**：你人在家，但在屏幕上"出现"在会议室里，和别人无障碍沟通。
- **关联词**: Debug, Development, PortForward

### 161. KubeVirt

- **音标**: /ˈkjuːb vərt/
- **词义**: K8s 上的虚拟机管理项目；在 K8s Pod 内运行传统虚拟机（支持 KVM 虚拟化），让容器和虚拟机在同一个平台上统一管理
- **例句**: KubeVirt allows you to run a legacy Windows VM alongside your cloud-native microservices on the same Kubernetes cluster.
- **🪄 记忆**: Kube(8s) + Virt(virtualization 虚拟化) → **容器和虚拟机的大一统**——很多公司还有旧系统只能跑在 VM 上，KubeVirt 让这些 VM 嫁接到 K8s 里面，像 Pod 一样管理它们。同一套 kubectl 命令管容器也管 VM。
- **关联词**: Virtualization, Hypervisor, VM

---

---

## 第17期 — 云原生观测、存储与基础设施管理

### 162. Grafana

- **音标**: /ɡrəˈfɑːnə/
- **词义**: 开源数据可视化仪表盘平台；连接 Prometheus、Loki 等数据源，将指标和日志数据以丰富多彩的图表和面板展示
- **例句**: Grafana queries Prometheus to render real-time CPU usage charts for all Pods in the cluster.
- **🪄 记忆**: 名字来自希腊语"γραφή"(graphē，意为"书写/图形")，就是"画图专家"。Prometheus 只管"收数据"，Grafana 负责"画成最好看的图表给你看"。一个面板搞定集群所有监控，排障第一眼就看 Grafana。Grafana + Prometheus = 王炸组合。

### 163. Loki

- **音标**: /ˈloʊkaɪ/
- **词义**: 日志聚合系统；Grafana Labs 出品，受 Prometheus 启发，用标签索引日志而非全文索引，比 Elasticsearch 更轻量省钱
- **例句**: Loki aggregates container logs from FluentBit across all nodes and makes them searchable via Grafana.
- **🪄 记忆**: 名字取自北欧神话的恶作剧之神"洛基"——它不干"正事"（全文索引导入 Elasticsearch），而是像 Prometheus 一样打标签。省存储、省内存，Grafana 里直接查日志。EFK → PLG（Promtail + Loki + Grafana），轻量日志方案首选。

### 164. Falco

- **音标**: /ˈfælkoʊ/
- **词义**: 云原生运行时安全工具；CNCF 毕业项目，通过内核 eBPF 模块监控容器异常行为（如反弹 Shell、读取敏感文件、容器内提权等）
- **例句**: Falco detects and alerts when a container spawns a shell process, which is a common sign of compromise.
- **🪄 记忆**: 名字意为"猎鹰"——Falco 像一只鹰一样在高空盘旋，盯着每一个容器的一举一动。谁在容器里偷偷开 Shell、读 /etc/shadow、挂载宿主机目录，它立刻发出警报。K8s 环境下的"摄像头+安防系统"。

### 165. Longhorn

- **音标**: /ˈlɒŋhɔːrn/
- **词义**: 轻量级分布式块存储系统；CNCF 项目，纯软件定义存储，在 K8s 上运行并管理持久卷，支持多副本、快照、备份和增量恢复
- **例句**: Longhorn creates a highly available replicaset of each volume across three nodes — if one node fails, the volume is still accessible.
- **🪄 记忆**: 名字来自美国"长角牛"（Texas Longhorn）——这种牛以耐力和韧性著称。Longhorn 的理念也如此：不依赖特定硬件，在每个 Node 上都能跑，一个 Node 挂了对数据毫发无伤。相比云上 EBS/云硬盘，Longhorn 是自建 K8s 集群最流行的存储方案之一。

### 166. K9s

- **音标**: /keɪ naɪnz/
- **词义**: K8s 终端 UI 管理工具；用 curses 界面实时展示集群状态，纯键盘操作，Coder 最爱的命令行神器
- **例句**: Launch K9s to browse Pods, view logs, and exec into containers — all without typing a single kubectl command.
- **🪄 记忆**: K(8s) + 9(9个字母) + s → 名字和 K8s 一样玩文字游戏。你可以把 K9s 想象成"kubectl 的图形外壳"——不用记几十个 kubectl 命令，上下左右键就能操作集群。DevOps 的"快照式"日常管理工具。

### 167. Karpenter

- **音标**: /ˈkɑːrpəntər/
- **词义**: 开源 Node 自动扩缩器；AWS 出品后捐给 CNCF，直接通过云 API 在几秒内创建/删除 Node，比 ClusterAutoscaler 更快、更灵活
- **例句**: Karpenter observes pending Pods and launches EC2 instances within seconds — much faster than the ClusterAutoscaler's node group approach.
- **🪄 记忆**: 名字意为"木匠/木工"——Karpenter 像一个超级木匠，"需要几张桌子（Node）就现做几张，不需要了就拆掉"。和 ClusterAutoscaler 比：CA 在"已有木料堆（Node Group）"里调拨，Karpenter 直接去"砍树做新桌子"（直接调云 API 创建最合适的机型），又快又省钱。

### 168. Crossplane

- **音标**: /ˈkrɒspleɪn/
- **词义**: 开源云原生控制平面框架；将云基础设施（数据库、存储、网络等）声明为 K8s CRD，通过 `kubectl` 统一管理多云资源
- **例句**: With Crossplane, you can provision an RDS database and an S3 bucket using the same `kubectl apply` workflow as your application.
- **🪄 记忆**: Cross(跨) + Plane(平面) → "跨云控制面"。它的野心很大：不只是管 K8s 集群内部，而是把 AWS、Azure、GCP 上的资源都变成 K8s 的"对象"。你的 infra 代码和 app 代码用同一套工具、同一个 GitOps 流程管理——`kubectl apply` 一个 RDS 数据库跟 `kubectl apply` 一个 Deployment 一样简单。

### 169. Trivy

- **音标**: /ˈtrɪvi/
- **词义**: 开源全能安全扫描器；Aqua Security 出品，覆盖容器镜像漏洞、文件系统扫描、IaC 配置检测、K8s 集群安全评估等
- **例句**: Run `trivy image nginx:latest` to scan the nginx image for all known CVEs before deploying it to production.
- **🪄 记忆**: Trivy = Tri(三) + vy → 名字来自"trivial"（简单）的变体，设计哲学就是"简单易用"。一条命令扫镜像、扫 Git 仓库、扫 K8s 配置。CI/CD 里加一行 `trivy image` 就能在镜像上线前揪出已知漏洞，像给每份外卖（镜像）验毒。

### 170. Lens

- **音标**: /lenz/
- **词义**: K8s 集成开发环境(IDE)；桌面 GUI 应用，提供集群资源管理、实时监控、终端访问、Helm 应用管理等一站式功能
- **例句**: Lens provides a single-pane-of-glass management experience — browse all your clusters, inspect workloads, and view logs in one window.
- **🪄 记忆**: Lens(透镜/镜头) → 像给你的眼睛装了一个"超级望远镜"，把 K8s 集群从黑漆漆的终端变成了可视化界面。建集群、看 Pod、翻日志、跑 Shell 全在一个窗口，不用记复杂命令。开源免费，K8s 日常管理的神器。

### 171. Thanos

- **音标**: /ˈθænɒs/
- **词义**: 开源 Prometheus 高可用方案；解决 Prometheus 单点故障、数据持久化、全局查询和多集群聚合问题
- **例句**: Thanos enables a global view of metrics across multiple Kubernetes clusters via its Query component.
- **🪄 记忆**: 名字取自漫威的灭霸(Thanos)——灭霸有"无限手套"（Infinity Gauntlet），Thanos 也有"三件套"（Sidecar + Store + Query）。它的核心使命：让 Prometheus 从"单机"变成"分布式"——数据存到对象存储（S3/MinIO），跨集群查询，不受单点限制。集齐"无限原石"就能看到整个公司的集群指标。

---

> 📅 最后更新：2026-07-16 | 累计 171 词 | 持续更新中 🐾

---

## 第18期 — 高级 Pod 配置与调度细节

### 172. StartupProbe

- **音标**: /ˈstɑːrtʌp prəʊb/
- **词义**: 启动探针；K8s 1.18+ GA，针对启动慢的容器设计的健康检查——在 StartupProbe 成功前，Liveness 和 Readiness 探针被禁用，避免慢启动容器被误杀
- **例句**: Use a StartupProbe to give a Java application 5 minutes to initialize before the LivenessProbe kicks in.
- **🪄 记忆**: LivenessProbe 像"心脏监测仪"——看你一直动没动。但有些同志（Java 应用）起床慢（启动慢），一睁眼就被监测仪报警了。StartupProbe 就是"起床铃"——等它真正醒来了，心脏监测仪才开始工作。

### 173. ReadinessGates

- **音标**: /ˈredinəs ɡeɪts/
- **词义**: 就绪门控；Pod 上的一组额外条件（Condition），只有所有 ReadinessGates 的 status 为 True 时，Pod 才被标记为 Ready，计入 Service Endpoint
- **例句**: Service mesh sidecars often add a ReadinessGate so the Pod is not considered Ready until the proxy is fully initialized.
- **🪄 记忆**: Readiness(就绪) + Gates(闸门/关卡) → 默认 Pod 就绪条件是"容器起来了"，但 ReadinessGates 加了更多道闸门——Sidecar 代理初始化好了吗？健康检查过了吗？**全部闸门打开**，流量才放进来。

### 174. HostNetwork

- **音标**: /həʊst ˈnetwɜːrk/
- **词义**: 主机网络模式；Pod spec 中 `hostNetwork: true`，让 Pod 直接使用宿主机网络栈，不创建独立的网络命名空间
- **例句**: System Pods like the Ingress Controller often use HostNetwork to bind directly to the host's ports for performance.
- **🪄 记忆**: Host(宿主机) + Network(网络) → 默认每个 Pod 有自己的"房间"（网络命名空间），HostNetwork 就是打开门直接睡在"客厅"——IP 和端口都和宿主机一样。CNI 插件不介入，速度快，但端口冲突风险高，一般只有控制面组件才这么干。

### 175. ShareProcessNamespace

- **音标**: /ʃer ˈprɒses ˈneɪmspeɪs/
- **词义**: 共享进程命名空间；Pod spec 中 `shareProcessNamespace: true`，让 Pod 内的所有容器共享同一个 PID 命名空间，可互相看到对方的进程
- **例句**: Enable `shareProcessNamespace: true` to allow a sidecar container to monitor the main process via signals without special privileges.
- **🪄 记忆**: 默认情况下，Pod 里的每个容器活在自己的"隔离间"里——你看不见我，我看不见你。ShareProcessNamespace 就是**拆掉隔间墙**——所有人都能看到谁在做什么。Sidecar 可以给主进程发送信号（SIGTERM/SIGHUP），不用特殊权限。

### 176. Sysctl

- **音标**: /ˈsɪstl/
- **词义**: 系统控制参数（Kernel Parameter）；Pod securityContext 中可设置内核参数，如 `net.core.somaxconn`（最大连接数）、`net.ipv4.tcp_tw_reuse` 等
- **例句**: Set `sysctls: [{ name: "net.core.somaxconn", value: "1024" }]` on a Pod to increase the listen backlog for high-traffic services.
- **🪄 记忆**: sysctl = system(系统) + control(控制) 的缩写。Linux 内核有上千个"旋钮"，拧一拧就能调网络、内存、文件系统的行为。K8s 安全模式下只允许"命名空间隔离的"sysctl（带 `net.`、`kernel.shm` 等前缀），改不了的 sysctl 叫"不安全 sysctl"——得冒风险才能拧。

### 177. Capabilities (Linux Capabilities)

- **音标**: /ˌkeɪpəˈbɪlətiz/
- **词义**: Linux 能力；将 root 权限拆分为最小单元（如 `CAP_NET_BIND_SERVICE` 绑定低端口、`CAP_SYS_TIME` 改系统时钟），容器可按需赋予而非直接给 root
- **例句**: Drop all capabilities with `drop: ["ALL"]` and add only `add: ["NET_BIND_SERVICE"]` to follow the principle of least privilege.
- **🪄 记忆**: 想象 root 是一把"万能钥匙"，Capabilities 是把钥匙拆解成伞、刀、起子——你要用起子就只给你起子。生产最佳实践：**`drop: ["ALL"]` + `add: ["NET_BIND_SERVICE"]`**——先全扔掉，再只加需要用的一两个。安全合规铁律。

### 178. LocalVolume

- **音标**: /ˈloʊkl ˈvɒljuːm/
- **词义**: 本地持久卷；使用 Node 本地磁盘（SSD、HDD）作为 PV 的存储方案，IO 延迟极低（无网络开销），但 Pod 被调度到该 Node 后才能使用
- **例句**: A LocalVolume is ideal for high-performance databases like Cassandra that can handle data replication themselves.
- **🪄 记忆**: Local(本地) + Volume(卷) → 其他 PV 是"云盘"（数据传网络存到远处），LocalVolume 是**直接插在本机硬盘**上读写。极致 IO 性能，代价是 Pod 不能随便换机器——你点了个外卖（Pod），外卖（数据）必须在这个厨房（Node）做。Node 挂了数据也可能丢失（除非应用自己有副本机制）。

### 179. CSR (CertificateSigningRequest)

- **音标**: /siː es ɑːr/
- **词义**: 证书签名请求；K8s 内置证书管理 API 资源，组件/用户通过创建 CSR 资源申请签名证书，由控制器或管理员审批后下发
- **例句**: When a new kubelet joins the cluster, it creates a CSR for its TLS certificate, which is then auto-approved by the bootstrap approver.
- **🪄 记忆**: CSR = 办身份证的"申请表"。你想加入 K8s 集群（比如新的 kubelet），先填一张 CSR 表交上去——"我是谁、我有什么公钥、我想做什么"。管理员（或自动批准控制器）看完签名："OK，这是你的身份证（签名证书）"。没它，任何新成员在集群里都是黑户。

### 180. ProjectedVolume

- **音标**: /prəˈdʒektɪd ˈvɒljuːm/
- **词义**: 投射卷；一种特殊的卷类型，将多个卷源（Secret、ConfigMap、DownwardAPI、ServiceAccountToken）合并投射到同一个目录下
- **例句**: Use a ProjectedVolume to mount a Secret, a ConfigMap, and the DownwardAPI token all into the same `/etc/app-config/` directory.
- **🪄 记忆**: Projected(投射/投影) + Volume(卷) → 想象三台投影仪（Secret、ConfigMap、DownwardAPI）打在同一个屏幕上——你在一个目录下看到来自不同来源的所有文件。比起挂多个独立卷，ProjectedVolume 更干净、更易管理。ServiceAccountTokenProjection 也是它的一种形式。

### 181. TopologyKey

- **音标**: /təˈpɒlədʒi kiː/
- **词义**: 拓扑键；Node 标签键，用于定义拓扑域（如 `topology.kubernetes.io/zone` 表示可用区、`kubernetes.io/hostname` 表示单台机器），是亲和性和拓扑分布约束中的核心概念
- **例句**: Set `topologyKey: "topology.kubernetes.io/zone"` in a PodAntiAffinity rule to spread Pods across availability zones for high availability.
- **🪄 记忆**: Topology(拓扑/地域结构) + Key(键/钥匙) → K8s 用 Node 标签划分"地盘"。TopologyKey 就是地盘的**划分标准**——按可用区（zone）分？按机房（rack）分？按机器（hostname）分？你告诉 K8s 规则，它就知道怎么"分房子"让 Pod 分散在不同地方。

---

> 📅 最后更新：2026-07-16 | 累计 181 词 | 持续更新中 🐾

---

## 第19期 — Pod 配置核心字段

### 182. ImagePullPolicy

- **音标**: /ˈɪmɪdʒ pʊl ˈpɒlɪsi/
- **词义**: 镜像拉取策略；决定 kubelet 何时拉取容器镜像，可选值为 `Always`（总是拉取）、`IfNotPresent`（本地不存在时才拉）、`Never`（永不拉取）
- **例句**: Set `imagePullPolicy: Always` to ensure the latest image is used for every Pod creation.
- **🪄 记忆**: Image（镜像）+ Pull（拉取）+ Policy（策略）= "K8s 什么时候去 Docker Hub 拉新菜"。默认规则：镜像 tag 是 `latest` 则 Always，否则 IfNotPresent。改了镜像但 Pod 还在用旧版？八成是 ImagePullPolicy 设成了 IfNotPresent。

### 183. ContainerPort

- **音标**: /kənˈteɪnər pɔːrt/
- **词义**: 容器端口声明；在 Pod spec 中显式声明容器要暴露的端口号（纯信息性声明，不强制端口实际开放或映射）
- **例句**: Declaring `containerPort: 8080` in the Pod spec is informational — it does not open the port by itself.
- **🪄 记忆**: Container（容器）+ Port（端口）= "在 YAML 里告诉 K8s『我这个容器跑在 8080 端口』"。注意！这只是个"标签"——不声明 K8s 也能自动识别端口，但声明了才有 `kubectl describe` 显示、方便别人看。

### 184. Requests

- **音标**: /rɪˈkwests/
- **词义**: 资源请求量；Pod 向集群"申请"的最低资源保障（CPU/内存），K8s 调度器据此选 Node，且确保 Pod 至少能拿到这么多资源
- **例句**: Set `requests: { memory: "256Mi", cpu: "500m" }` to guarantee the Pod gets at least 256 MiB of memory.
- **🪄 记忆**: Request = "最低保障线"。跟老板说"至少要给我 2 核 CPU 和 4G 内存"，老板（Scheduler）就只把 Pod 放到有这么多资源的 Node 上。**Requests 决定调度**，跟实际的资源用量无关。

### 185. Limits

- **音标**: /ˈlɪmɪts/
- **词义**: 资源上限；Pod 能使用的 CPU/内存**硬上限**，超过则可能被限流（CPU）或触发 OOMKill（内存）
- **例句**: If a container exceeds its memory Limits, the kernel kills it with OOMKilled status.
- **🪄 记忆**: Limit = "天花板"。吃自助餐（用内存），餐厅（K8s）给你一张限量的餐票——超过这个量就不让吃了（OOM）。Requests 是"至少要这么多"，Limits 是"最多只能这么多"。**学习区分 Requests vs Limits 是 K8s 资源管理第一课。**

### 186. RollingUpdate

- **音标**: /ˈrəʊlɪŋ ˈʌpdeɪt/
- **词义**: 滚动更新策略；Deployment 默认更新方式，逐步用新版本 Pod 替换旧版本 Pod，期间服务不中断
- **例句**: The default RollingUpdate strategy with `maxSurge: 25%` and `maxUnavailable: 25%` gradually replaces Pods while keeping the service available.
- **🪄 记忆**: Rolling（滚动）+ Update（更新）= "逐批换人"。默认参数：先多开 25% 的新 Pod（maxSurge），同时最多关掉 25% 的旧 Pod（maxUnavailable）。像地铁换乘——旧的车还没完全开走，新的已经来了，乘客（流量）从不中断。

### 187. NodeSelector

- **音标**: /nəʊd sɪˈlektər/
- **词义**: 节点选择器；Pod spec 中最简单的节点调度约束，通过匹配 Node 标签将 Pod 限定在特定 Node 上运行
- **例句**: Add `nodeSelector: { disktype: ssd }` to ensure Pods run only on nodes labeled with `disktype=ssd`.
- **🪄 记忆**: Node（节点）+ Selector（选择器）= "给 Pod 指定去哪台机器"。NodeSelector 是调度中最简单粗暴的方式——我说去 SSD 机器，它就只去 SSD 机器。比 Affinity（亲和性）简单但也**功能有限**（只有精确匹配，不支持优先级或复杂表达式）。日常够用了，复杂的才上 NodeAffinity。

### 188. NodeName

- **音标**: /nəʊd neɪm/
- **词义**: 节点名称；Pod spec 中直接指定 Pod 运行在哪个 Node 上，**绕过调度器**，Pod 会一直 Pending 直到该 Node 标记为 Ready
- **例句**: Setting `nodeName: worker-1` skips the Scheduler entirely — the Pod is assigned directly to that node.
- **🪄 记忆**: Node（节点）+ Name（名称）= "超超超直接的调度方式"。NodeSelector 和 Affinity 只是"建议"，最终调度器说了算。NodeName 是**直接点名**——"这台机器定了，绕过调度器"。用它的场景极少（比如 kubelet 自己创建的 StaticPod 才会用），手动设的话小心 Node 不存在时 Pod 永远 Pending。

### 189. DNSPolicy

- **音标**: /diː en es ˈpɒlɪsi/
- **词义**: DNS 策略；Pod 的 DNS 解析策略，可选值包括 `ClusterFirst`（默认，用 CoreDNS）、`Default`（从 Node 继承）、`None`（完全自定义 dnsConfig）
- **例句**: The default `dnsPolicy: ClusterFirst` ensures Pods resolve Service names via CoreDNS before falling back to the node's DNS.
- **🪄 记忆**: DNS（域名系统）+ Policy（策略）= "Pod 怎么查电话号码（域名解析）"。默认 `ClusterFirst`：先查 K8s 内部电话本（CoreDNS），查不到再拨外线（Node 的 DNS）。如果 Pod 网络特殊（比如 hostNetwork），自动变成 `Default`。**Pod 能通过 Service 名访问另一个 Service，全靠 ClusterFirst。**

### 190. HostAliases

- **音标**: /həʊst əˈliːsɪz/
- **词义**: 主机别名；在 Pod 的 `/etc/hosts` 文件中注入自定义 IP 到主机名的映射关系，不需要修改 DNS 配置
- **例句**: Use `hostAliases: [{ ip: "127.0.0.1", hostnames: ["my-local-service"] }]` to override DNS resolution within a Pod.
- **🪄 记忆**: Host（主机）+ Aliases（别名）= "在 Pod 里手动写 hosts 文件"。有时候临时想加个解析（比如测试用的域名），不想改 DNS 也不想改代码——`hostAliases` 就是干这个的。相当于在每个 Pod 的 `/etc/hosts` 里加了一行映射，优先级高于 CoreDNS。**临时调试利器。**

### 191. Env (Environment Variables)

- **音标**: /ɪnˈvaɪrənmənt ˈveriəblz/
- **词义**: 环境变量；向容器注入配置信息的最常见方式，支持静态值、字段引用（fieldRef）、资源引用（resourceFieldRef）和 Secret/ConfigMap 引用
- **例句**: Define `env: [{ name: "DB_HOST", value: "postgres-service" }]` to pass the database hostname into the container.
- **🪄 记忆**: Env = "给容器递小纸条"。想告诉容器"数据库地址是 xxx"、"日志级别是 debug"？最直接的方法就是写 Env（环境变量）。除了写死值，还可以通过 `valueFrom` 从 Secret、ConfigMap、DownwardAPI 动态引用——这是 K8s 中最常用的"配置传递"方式，没有之一。

---

> 📅 最后更新：2026-07-17 | 累计 191 词 | 持续更新中 🐾

---

## 第20期 — 容器规范与运维模式补充

### 192. Proxy

- **音标**: /ˈprɒksi/
- **词义**: 代理；K8s 中无处不在的网络中间件概念，包括 kube-proxy（维护 Node 上 Service 网络规则）、kubectl proxy（本地 API 代理隧道）、以及 Istio/Envoy 等 Sidecar Proxy
- **例句**: kube-proxy runs on every node and maintains iptables or IPVS rules to route Service traffic to the correct backend Pods.
- **🪄 记忆**: Proxy（代理人）→ 你不需要知道 Pod 的具体 IP 和位置，只要把请求丢给 Proxy，它帮你转交。像你的私人助理——"帮我找张三"，助理直接帮你转接，你根本不用关心张三坐在哪个工位。

### 193. Upstream

- **音标**: /ˈʌpstriːm/
- **词义**: 上游；负载均衡/Ingress 中指向真实处理请求的后端服务（upstream server），也指上游仓库（upstream repository——基础镜像或开源项目的原始来源）
- **例句**: The NGINX Ingress Controller proxies client requests to the upstream Service defined in the Ingress rules.
- **🪄 记忆**: Up(向上) + Stream(流) → 水往低处流。客户端 → Ingress（下游） → Upstream backend Pod（上游）。在开源领域也指"上游项目"——你 Fork 的原始项目叫 upstream，拉取它的更新就叫 sync upstream。

### 194. Downtime

- **音标**: /ˈdaʊntaɪm/
- **词义**: 停机/不可用时间；K8s 通过 RollingUpdate（滚动更新）、ReadinessProbe（就绪探针）和 PDB（Pod 干扰预算）等机制将应用更新和维护期间的 Downtime 降到最低
- **例句**: With proper RollingUpdate configuration and multiple replicas, you can achieve zero-downtime deployments in Kubernetes without interrupting user traffic.
- **🪄 记忆**: Down(倒下) + Time(时间) → 系统"趴着不能干活"的时间。K8s 毕生追求就是让 Downtime≈0：滚更新、多副本、优雅关闭、ReadinessProbe，全是为了让用户感觉不到你在后台偷偷换版本。

### 195. Health

- **音标**: /helθ/
- **词义**: 健康/健康检查；K8s 通过 LivenessProbe（存活探针）、ReadinessProbe（就绪探针）和 StartupProbe（启动探针）三个探针持续监控容器的健康状况
- **例句**: Kubernetes uses liveness and readiness probes to continuously monitor the health of your application containers and take automatic action when a probe fails.
- **🪄 记忆**: Health(健康) → 就像人体检，K8s 也不停给容器"把脉"：还活着吗？（Liveness）能接客吗？（Readiness）起床了吗？（Startup）。哪项不合格，K8s 自动处理——重启或切走流量。三个探针就是三堂会审。

### 196. Graceful

- **音标**: /ˈɡreɪsfl/
- **词义**: 优雅的；Graceful Shutdown（优雅关闭）指 K8s 终止 Pod 前先发 SIGTERM 信号给主进程，等待 terminationGracePeriodSeconds 内让应用处理完当前请求再退出，而非暴力 SIGKILL
- **例句**: Implement a graceful shutdown handler that catches SIGTERM, drains active connections, and then exits cleanly — never lose a user request.
- **🪄 记忆**: Grace(体面/优雅) + ful(充满) → 不是被一脚踹出门，而是"收拾好行李、跟同事告别、再关灯离开"。写代码时一个关键原则：**捕获 SIGTERM，处理完 inflight 请求再退出**。否则你的客户会突然断连。

### 197. Mirror

- **音标**: /ˈmɪrər/
- **词义**: 镜像/副本；容器镜像仓库的 Mirror（镜像加速代理，如配置 containerd mirror 从内网仓库拉取），以及流量 Mirror（将真实请求复制一份发给测试服务做流量分析）
- **例句**: Configure a container registry mirror in the container runtime to pull images from a local cache instead of Docker Hub, reducing latency and avoiding rate limits.
- **🪄 记忆**: Mirror(镜子) → 镜子里的你和真实的你一模一样。Mirror 就是"复制一份"：镜像仓库 Mirror 存了 Docker Hub 的副本（内网拉取快 10 倍，还不会被限速）；流量 Mirror 把真实请求复制一份发给 debug 服务，不影响线上用户。

### 198. Prune

- **音标**: /pruːn/
- **词义**: 修剪/清理；`kubectl apply --prune` 自动删除集群中不再存在于 YAML 清单中的资源；也指 Helm 的 `--prune` 选项以及容器镜像的定期清理
- **例句**: Run `kubectl apply --prune -f ./manifests/ -l app=myapp` to remove any resources that exist in the cluster but not in the local manifest directory.
- **🪄 记忆**: Prune(修剪树枝/修枝) → 园丁把多余的枯枝剪掉。你维护一套 YAML，删掉了某个资源的 YAML 但集群里还留着残骸——Prune 就是那把"园丁剪刀"，帮你把不该存在的东西全剪掉。清理残留的神器。

### 199. Command

- **音标**: /kəˈmɑːnd/
- **词义**: 命令；Pod spec 中容器的 `command` 字段，覆盖 Dockerfile 的 ENTRYPOINT，指定容器启动时执行的程序或脚本路径
- **例句**: Set `command: ["/app/start.sh"]` in the Pod spec to override the default entrypoint defined in the container image.
- **🪄 记忆**: Command(命令) = 容器的"开机指令"。Dockerfile 写了 ENTRYPOINT 是出厂设置，Pod 里的 command 可以覆盖它——"我不按出厂那套开机，我要先跑这个脚本"。和 args 的区别：command 换程序，args 改参数。

### 200. Args (Arguments)

- **音标**: /ɑːɡz/
- **词义**: 参数；Pod spec 中容器的 `args` 字段，覆盖 Dockerfile 的 CMD，作为传给 command 或 ENTRYPOINT 的启动参数
- **例句**: Pass `args: ["--port=8080", "--mode=production"]` to customize the container's startup configuration without rebuilding the image.
- **🪄 记忆**: Args ≈ 给容器的"启动参数"——不换程序（不改 command），只换配置参数。比如同一个 nginx 镜像，args 传不同的配置文件路径就能跑不同的站点配置。**最大的好处：不用重新打镜像！**

### 201. ReadOnly

- **音标**: /riːd ˈəʊnli/
- **词义**: 只读的；`readOnlyRootFilesystem: true` 在 SecurityContext 中将容器根文件系统设为只读，防止恶意写入和篡改，是容器安全加固的金标准
- **例句**: Set `readOnlyRootFilesystem: true` in the SecurityContext — combined with an emptyDir for temp data — to prevent attackers from writing malicious scripts to the container.
- **🪄 记忆**: Read(读) + Only(仅仅) = "只能看，不能写"。想象一张 CD-ROM 塞进电脑——内容能读但写不进去。SecurityContext 设了这个，攻击者就算进了容器也没法写恶意脚本。和 `drop: ["ALL"]` 并列，是安全合规的两大铁律。

---

> 📅 最后更新：2026-07-23 | 累计 201 词 | 持续更新中 🐾

---

## 第21期 — 工作负载、存储回收与镜像管理

### 202. Workload

- **音标**: /ˈwɜːrkloʊd/
- **词义**: 工作负载；K8s 中对"跑在集群里的应用"的总称，由各类控制器管理，包括 Deployment、StatefulSet、DaemonSet、Job、CronJob 等
- **例句**: Workloads in Kubernetes are managed by controllers such as Deployments, StatefulSets and Jobs, each defining how Pods should run.
- **🪄 记忆**: Work(工作) + Load(负担/负载) → "干活的活儿"。在 K8s 里，Deployment、StatefulSet 这些控制器统称 Workload——你只管声明"我要跑什么"，控制器替你扛下"怎么跑、跑几个、挂了咋办"这些活。

### 203. Reclaim

- **音标**: /rɪˈkleɪm/
- **词义**: 回收；PersistentVolume 的 `reclaimPolicy` 决定 PVC 删除后卷如何处理，可选值：Retain（保留）、Delete（删除）、Recycle（回收）
- **例句**: When a PVC is deleted, the PersistentVolume's reclaim policy determines whether the underlying storage is retained, deleted, or recycled.
- **🪄 记忆**: Re-(回) + Claim(索取/认领) → "把资源要回来"。PVC 删了，卷里存的数据怎么办？ReclaimPolicy 就是"财产处置条款"：Retain 留着自己处置（数据可能还在），Delete 直接删干净，Recycle 清空数据留给下家用。**生产环境务必搞懂，否则可能误删数据。**

### 204. Template

- **音标**: /ˈtempleɪt/
- **词义**: 模板；Deployment 等 Workload 的 `spec.template` 字段，定义副本 Pod 的完整规格（容器、卷、探针、标签等），是"批量复制 Pod"的模具
- **例句**: The Pod template in a Deployment defines the exact specification that every replica Pod is created from.
- **🪄 记忆**: Template 源于拉丁语 templum（衡量规）→ 就像做月饼的模具，按下去一个模子，印出一个个一模一样的 Pod。改 Pod 配置只需改 template，K8s 会自动滚动更新所有副本。

### 205. TTL (Time To Live)

- **音标**: /ˌtiː tiː ˈel/
- **词义**: 生存时间；资源存活时限，到期自动清理。K8s 中 TTLAfterFinished 控制器可自动删除已完成的 Job，DNS 记录、容器镜像层也各有 TTL 机制
- **例句**: The TTLAfterFinished controller deletes finished Jobs automatically once the configured TTL has elapsed, preventing cluster clutter.
- **🪄 记忆**: Time(时间) To(到) Live(活) → "还能活多久"。跟罐头保质期一个道理：Job 跑完了留一堆尸体？设个 TTL，到期自动收尸。DNS 缓存、IP 封包也有 TTL——过期的就该消失，别占地方。

### 206. Registry

- **音标**: /ˈredʒɪstri/
- **词义**: 镜像仓库；存储、分发容器镜像的服务，如 Docker Hub、Harbor、Amazon ECR，Kubelet 按"镜像名:标签"从 Registry 拉取
- **例句**: The kubelet pulls container images from the image registry specified in the Pod spec, such as docker.io/library/nginx:1.25.
- **🪄 记忆**: Register(登记) + -y → "登记处/户籍册"。镜像都"登记"在仓库里，每个镜像名就是它的户籍地址（仓库/命名空间/镜像名:标签）。生产环境常用 Harbor 搭私有 Registry，内网拉取快还能过审。

### 207. Digest

- **音标**: /ˈdaɪdʒest/
- **词义**: 摘要；镜像内容的 SHA256 哈希值，形如 `sha256:abc123...`，精确到具体构建产物，是镜像的"指纹"
- **例句**: Pin your image to a specific digest to guarantee every deployment runs the exact same build, immune to tag overwrites.
- **🪄 记忆**: 源自古法语 digeste（浓缩汇总）→ 镜像内容"浓缩"成一串 64 位哈希。标签(Tag)可以反复覆盖，但 Digest 永远指向同一个不可变内容——**生产环境用 digest 锁版本，比 Tag 靠谱一百倍。**

### 208. Timeout

- **音标**: /ˈtaɪmaʊt/
- **词义**: 超时；操作超过设定时限仍未完成则放弃/报错。K8s 中探针有 timeoutSeconds，kubectl 请求有 --request-timeout，网关/负载均衡也各有超时配置
- **例句**: If the container exceeds the probe's timeoutSeconds without responding, the liveness probe fails and Kubernetes restarts the container.
- **🪄 记忆**: Time(时间) + Out(出去) → 时间"走完了"就退场。就像等公交车：等 5 分钟是耐心，等 50 分钟是犯傻——Timeout 就是那个"不等了，先干别的"的闹钟。系统里处处需要它，防止一个慢请求拖垮全局。

### 209. Latency

- **音标**: /ˈleɪtənsi/
- **词义**: 延迟；从请求发出到收到响应的时间间隔，是衡量网络与 API 性能的核心指标（P99 延迟、网络延迟等）
- **例句**: High network latency between nodes can significantly degrade the performance of distributed microservices.
- **🪄 记忆**: Lat- 同 late（迟）→ "迟到的程度"。打游戏时的"网络延迟 50ms"就是它：延迟越低越流畅。K8s 里做性能分析必看三个指标：延迟(Latency)、吞吐(Throughput)、错误率(Error rate)——延迟是第一个要查的。

### 210. Retry

- **音标**: /rɪˈtraɪ/
- **词义**: 重试；操作失败后再次尝试。K8s 中镜像拉取失败会自动 Retry（伴随指数退避 ImagePullBackOff），客户端 SDK 也常带自动重试逻辑
- **例句**: The kubelet retries image pulls with exponential backoff when the registry is temporarily unavailable, avoiding a thundering herd.
- **🪄 记忆**: Re-(再次) + Try(尝试) → "再试一次"。像拨号占线后"再拨一遍"。注意 K8s 的重试不是无脑循环，而是带 Backoff（指数退避）的——第一次等 10s、第二次 20s……越退越久，防止重启风暴打爆集群。

### 211. Uptime

- **音标**: /ˈʌptaɪm/
- **词义**: 正常运行时间；服务持续可用、未中断的时长，SLA 中的 99.9%、99.99% 指的就是它，与 Downtime（停机时间）相对
- **例句**: Multi-replica deployments with readiness probes help achieve the 99.99% uptime promised in the service level agreement.
- **🪄 记忆**: Up(在线) + Time(时间) → "在线时长"。和上一期的 Downtime 正好是一对反义词：一年 525600 分钟，99.99% Uptime 意味着全年只能停机 52.6 分钟——K8s 的高可用设计（多副本、滚动更新、探针）全是为这 52.6 分钟而战。

---

> 📅 最后更新：2026-08-04 | 累计 211 词 | 持续更新中 🐾

---

## 第22期 — 网络、共识、认证与可靠性

### 212. CIDR

- **音标**: /ˈsaɪdər/（Classless Inter-Domain Routing 缩写）
- **词义**: 无类别域间路由；用"IP + 斜杠 + 前缀长度"表示网段（如 `10.244.0.0/16`），K8s 用它为 Pod、Service 规划地址池，Flannel、Calico 等 CNI 按 CIDR 分配 IP
- **例句**: The cluster's Pod CIDR is set to 10.244.0.0/16, so every Pod gets an address within this range.
- **🪄 记忆**: CIDR 就是给 IP 画"地盘"——`/16` 是围栏大小，数字越小围栏越大（/16 有 65536 个地址，/24 只有 256 个）。看到 `10.244.0.0/16`，就知道这个集群的 Pod 网段有多大。

### 213. Conntrack

- **音标**: /ˈkɒntræk/
- **词义**: 连接跟踪；Linux 内核记录所有网络连接状态的机制（conntrack 表），kube-proxy 的 NAT 转发、LoadBalancer 和防火墙都依赖它判断流量归属
- **例句**: A full conntrack table can drop new connections under heavy load, so monitoring it is essential in large clusters.
- **🪄 记忆**: Con(nection 连接) + Track(跟踪) → 内核里的"交通监控探头"，每条进出连接都被记录在案。kube-proxy 做 NAT 全靠它知道"这条响应是哪个 Pod 的"。**排障时看到 `nf_conntrack: table full` 就是它满了，该扩容了。**

### 214. iptables

- **音标**: /ˌaɪ piːˈteɪbəlz/
- **词义**: Linux 内核的防火墙/数据包规则工具；kube-proxy 的默认后端模式，通过在 Node 上写入 iptables 规则实现 Service 的负载均衡与 DNAT 转发
- **例句**: kube-proxy programs iptables rules on each node so that traffic to a Service's ClusterIP is forwarded to a backend Pod.
- **🪄 记忆**: IP + Tables(表格) → 内核里一排排"查表规则"。数据包进来先查表：匹配哪条规则就按哪条办（转发、丢弃、改地址）。kube-proxy 就是往这张表里"写规则"的勤务员——规则多了性能会掉，所以新贵 eBPF 来接班。

### 215. eBPF

- **音标**: /ˌiː biː piː ˈef/（extended Berkeley Packet Filter）
- **词义**: 扩展的伯克利包过滤器；Linux 内核可编程技术，允许在内核中安全运行用户程序，用于高性能网络、可观测性与安全，是 Cilium 等新一代 CNI 的核心底座
- **例句**: Cilium leverages eBPF to bypass iptables and provide high-performance service networking and security policies.
- **🪄 记忆**: 给内核"开外挂"——不改内核代码、不重启机器，就能注入小程序在内核里跑。相比 iptables 一条条规则线性遍历，eBPF 直接在数据路径上执行，又快又灵活。Cilium 靠它把 Service 转发性能拉满。

### 216. Raft

- **音标**: /rɑːft/
- **词义**: Raft 共识算法；分布式一致性算法，etcd 用它实现多节点日志复制与 Leader 选举，保证集群状态强一致
- **例句**: etcd replicates every write to all members using the Raft consensus algorithm, committing only after a quorum acknowledges.
- **🪄 记忆**: Raft 原意"木筏"——筏上的人步调一致才能不翻船。etcd 里所有节点通过 Raft 复制同一条日志，任何写入都要"大多数成员确认"才算生效。**K8s 控制面的"账本"就是靠 Raft 记平的。**

### 217. Quorum

- **音标**: /ˈkwɔːrəm/
- **词义**: 法定人数/多数派；分布式系统达成决策所需的最少确认节点数（通常 N/2+1），etcd 只有获得 Quorum 确认才提交写入
- **例句**: If more than half of the etcd members fail, the cluster loses quorum and stops accepting writes to protect consistency.
- **🪄 记忆**: Quorum 像开会表决——必须"过半数点头"才拍板。5 节点 etcd 挂 2 个还能干活（3 个达成法定），挂 3 个就"会开不成"，集群进入只读模式保护数据。**记住：过半即法定，etcd 最小规模请用 3 节点。**

### 218. JWT (JSON Web Token)

- **音标**: /ˌdʒeɪ dʌbəljuː ˈtiː/
- **词义**: JSON Web 令牌；紧凑的签名令牌，由 Header.Payload.Signature 三段组成，K8s 中每个 ServiceAccount 都会签发 JWT，Pod 挂载后用它向 API Server 认证
- **例句**: Each ServiceAccount gets a JWT that Pods mount and present to the API server for authentication.
- **🪄 记忆**: JWT 像一张"盖章的通行证"——身份信息（Payload）写在卡上，签名（Signature）防伪造，出示即通过、无需回查服务器。注意它默认不加密，**别把密码塞进去**。

### 219. OIDC (OpenID Connect)

- **音标**: /ˌəʊ aɪ diː ˈsiː/
- **词义**: 基于 OAuth 2.0 的身份认证协议；K8s API Server 支持配置 OIDC，让用户用企业统一账号（SSO）登录集群，并签发 JWT 完成认证
- **例句**: By configuring OIDC on the API server, users can authenticate to the cluster with their corporate single sign-on accounts.
- **🪄 记忆**: OIDC = 企业门禁系统——员工拿公司工牌（统一账号）刷脸进门（SSO），门禁（API Server）验证后发临时通行证（JWT）。企业里做 K8s 认证，OIDC 是标配。

### 220. GitOps

- **音标**: /ˈɡɪt ɒps/
- **词义**: 以 Git 为唯一事实来源（single source of truth）的声明式交付模式；ArgoCD、Flux 等工具持续对比 Git 中的期望状态与集群实际状态并自动同步
- **例句**: With GitOps, every change is first merged into Git, and ArgoCD automatically reconciles the cluster to match the desired state.
- **🪄 记忆**: Git(仓库) + Ops(运维) → "代码即配置，提交即发布"。所有改动走 Git 留痕、可审阅、可回滚，集群只是 Git 的"影子"。它和 K8s 的 Declarative（声明式）理念天生一对，所以 ArgoCD/Flux 才能大行其道。

### 221. SLO (Service Level Objective)

- **音标**: /ˌes el ˈəʊ/
- **词义**: 服务等级目标；对服务可靠性的量化承诺（如可用性 99.9%、延迟 P99 < 200ms），SRE 用它定义"什么算故障"、决定何时报警；对应 SLI 是实际测量值
- **例句**: The team defines an SLO of 99.9% availability and alerts the on-call engineer when the burn rate exceeds the budget.
- **🪄 记忆**: SLO 是"及格线"——写在纸上的目标（99.9%），SLI 是"实际考分"（真实测出来的值），Error Budget 是"允许挂科的次数"。考砸了（违反 SLO）就该报警了。**评估服务可靠性，三件套：SLI → SLO → Error Budget。**

## 第23期 — 高可用、容错与性能

### 222. Failover

- **音标**: /ˈfeɪlˌəʊvər/
- **词义**: 故障转移；当主节点/主实例不可用时，自动将工作切换到备用实例的机制。K8s 中控制器把 Pod 重新调度到健康节点实现 Failover，etcd 通过 Leader 切换实现
- **例句**: When a node crashes, the control plane performs a failover by rescheduling the Pods onto healthy nodes.
- **🪄 记忆**: Fail(失败) + Over(翻过去) → "挂了就翻篇"。像接力赛掉棒瞬间自动换替补上场——节点挂了，Pod 自动在别的节点重获新生。**高可用的本质就是"随时准备好 Failover"。**

### 223. Fault Tolerance

- **音标**: /fɔːlt ˈtɒlərəns/
- **词义**: 容错；系统在部分组件故障时仍能继续提供服务的能力。K8s 通过多副本（Replica）、跨可用区部署、健康检查等实现容错
- **例句**: Running three replicas across different availability zones gives the workload fault tolerance against zone failures.
- **🪄 记忆**: Fault(故障) + Tolerance(容忍) → "故障我忍得住"。像打不死的小强——单点挂了，剩下的照样顶住。它与 Resilience（韧性）是近义词：容错是手段，韧性是目标。

### 224. Circuit Breaker

- **音标**: /ˈsɜːrkɪt ˈbreɪkər/
- **词义**: 熔断器；微服务治理模式，当下游服务连续失败达到阈值时"跳闸"快速失败，防止故障雪崩，过段时间自动半开试探恢复。Istio 中通过 DestinationRule 配置
- **例句**: A circuit breaker trips when the backend fails repeatedly, returning an error immediately instead of piling up requests.
- **🪄 记忆**: 家里跳闸的"空气开关"——线路短路就自动断电保护整屋。服务也一样：下游崩了立刻"拉闸"，宁可快速失败也不排队硬挤，等恢复期到了再合闸试探。**熔断 + 重试 + 超时，是防雪崩三件套。**

### 225. Self-Healing

- **音标**: /ˌself ˈhiːlɪŋ/
- **词义**: 自愈；系统自动检测并修复故障的能力，无需人工干预。K8s 的核心特性：容器挂了自动重启、节点失联自动驱逐并重新调度、探针失败自动重启容器
- **例句**: Kubernetes self-healing restarts failed containers and reschedules Pods without human intervention.
- **🪄 记忆**: Self(自己) + Heal(治愈) → 像壁虎断尾再生。K8s 是"永动机医生"：容器挂了自动重启（RestartPolicy）、节点挂了自动搬家（重新调度）——你只需要声明期望状态，剩下的它自己医。**声明式 + 自愈 = K8s 的底层哲学。**

### 226. Heartbeat

- **音标**: /ˈhɑːrtbiːt/
- **词义**: 心跳；组件间周期性发送的存活信号，用于探测对端是否健康。Kubelet 定期向 API Server 上报节点状态，etcd 节点间也靠心跳维持 Leader 关系
- **例句**: The kubelet sends a heartbeat to the API server every few seconds to report the node's status.
- **🪄 记忆**: 心跳 = 活着的证明。Kubelet 每隔几秒给 API Server 报一次"我还活着"，超过阈值没消息就被判定"猝死"，开始驱逐 Pod。**排障时看到 Node 状态 NotReady，先查心跳断了多久。**

### 227. Leader Election

- **音标**: /ˈliːdər ɪˈlekʃn/
- **词义**: 领导选举；分布式系统中多副本竞争"唯一领导者"的机制，保证同一时刻只有一个实例在干活。kube-controller-manager、etcd、Operator 的高可用部署都靠它
- **例句**: Multiple replicas of the controller manager run leader election so only one acts as the active leader at a time.
- **🪄 记忆**: 一个团队只能有一个"带班组长"。多副本同时跑，但通过 Lease（租约）争夺领导权：谁抢到谁干活，Leader 挂了自动选新的。**注意：它不是"一人一票"民主，是"先到先得"抢锁。**

### 228. Idempotent

- **音标**: /ˌaɪdəmˈpoʊtənt/
- **词义**: 幂等的；同一操作执行多次与执行一次结果相同。K8s 的声明式 API 天然幂等：apply 同一个 YAML 一百次，集群状态不变；这也是 Reconcile 循环能反复运行的基础
- **例句**: Applying the same manifest multiple times is idempotent, so the cluster state remains unchanged.
- **🪄 记忆**: Idem(相同) + Potent(力量) → "多打几遍结果都一样"。像按电梯按钮——按一次和按十次，电梯都只来一趟。kubectl apply 反复执行不会重复建资源，这就是幂等。

### 229. Throughput

- **音标**: /ˈθruːpʊt/
- **词义**: 吞吐量；单位时间内系统成功处理的请求/数据量（如 QPS、TPS、GB/s）。性能压测看 Throughput，体验看 Latency，两者往往此消彼长
- **例句**: The gateway achieves a throughput of 20,000 requests per second under normal load.
- **🪄 记忆**: Through(穿过) + Put(放) → "单位时间能淌过去多少水"。水管粗细决定吞吐量，水流快慢是延迟（Latency）——**粗管子高吞吐，细管子低延迟，取舍是门艺术。**

### 230. Bandwidth

- **音标**: /ˈbændwɪdθ/
- **词义**: 带宽；网络链路的最大数据传输能力。K8s 中可通过 CNI（如 Cilium Bandwidth Manager）、Pod 注解或 QoS 层做带宽管理，跨可用区流量还会涉及带宽成本
- **例句**: High-bandwidth workloads may require dedicated nodes or bandwidth annotations to avoid network contention.
- **🪄 记忆**: Band(波段) + Width(宽度) → "路的车道数"。带宽 = 路有多宽，吞吐量 = 实际过了多少车。HPA 扩缩容、网络策略评估时带宽都是隐藏瓶颈——**查慢别只盯 CPU，先看带宽是不是堵死了。**

### 231. Cold Start

- **音标**: /kəʊld stɑːrt/
- **词义**: 冷启动；应用实例从零拉起（拉镜像→创建容器→初始化）到可服务的时间，Serverless/Knative 缩到零后首次请求尤其明显；预热（Warm Pool）、降低副本下限可缓解
- **例句**: Serverless workloads suffer from cold start latency when an instance is created on demand.
- **🪄 记忆**: 冷启动 = 车放了一夜再打火，发动机要热身；热启动 = 车刚熄火，一拧就着。Knative 缩到 0 副本后，第一发请求要经历拉镜像 + 初始化，慢到怀疑人生——**线上服务慎开 Scale-to-Zero，除非你受得了冷启动。**

---

## 第24期 — 资源治理与 QoS

### 232. Guaranteed

- **音标**: /ˌɡærənˈtiːd/
- **词义**: 保证的；K8s 中 QoS 等级最高的 Pod。所有容器都同时设置了 requests 和 limits 且两者相等，资源最稳定、最不容易被驱逐，适合核心数据库等关键应用
- **例句**: A Guaranteed Pod has requests equal to limits for every container, making it the highest-priority class for resource stability.
- **🪄 记忆**: Guarantee(保证) → "铁饭碗"。requests 和 limits 写得一模一样，系统知道它"就吃这么多"，最受优待。`kubectl get pod -o wide` 看到 `QoS Class: Guaranteed`，说明资源声明得很规范。

### 233. Burstable

- **音标**: /ˈbɜːstəbl/
- **词义**: 可突发的；requests < limits 的 Pod。系统保证它至少拿到 requests 的量，但节点有闲置资源时允许"借力"冲到 limits 上限
- **例句**: A Burstable Pod can use CPU beyond its requests as long as spare capacity remains on the node.
- **🪄 记忆**: Burst(爆发) + able(可…的) → "能爆发的"。像银行卡：余额底线（requests）保证你不饿死，透支额度（limits）允许偶尔浪一下。K8s 里大部分 Pod 都是这个等级，是资源利用率的"主力军"。

### 234. BestEffort

- **音标**: /ˌbest ɪˈfɔːrt/
- **词义**: 尽力而为；完全没有设置 requests/limits 的 Pod，QoS 最低级。能吃多少吃多少，节点资源紧张时第一个被驱逐或杀掉
- **例句**: BestEffort Pods are the first to be evicted when the node runs out of resources.
- **🪄 记忆**: Best(最好) + Effort(努力) → "我尽力了"。像没订房的散客——有空房就住，满员第一个被请走。**生产环境千万别裸奔，不写资源限制的 Pod 就是"被牺牲的那个"。**

### 235. Capacity

- **音标**: /kəˈpæsəti/
- **词义**: 容量；节点的总资源量（CPU、内存、存储等）。`kubectl describe node` 中 Capacity 显示物理总量，Allocatable 才是 Pod 真正能用的量
- **例句**: Check the node's capacity with kubectl describe node to understand its total CPU and memory resources.
- **🪄 记忆**: Cap(帽子) 的引申 → 帽子能装多少就是容量。Capacity 是"房屋总面积"，Allocatable 是"扣掉公摊的套内面积"——排障看资源，先对比这两个字段的差距。

### 236. Allocatable

- **音标**: /əˈləʊkeɪtəbl/
- **词义**: 可分配的；节点扣除系统预留（kube-reserved、system-reserved、eviction-threshold）后，实际可供 Pod 使用的资源量，调度器依据它决定能否调度新 Pod
- **例句**: The allocatable resources on a node equal its capacity minus the system reservations for the kubelet and the OS.
- **🪄 记忆**: Allocate(分配) + able(可…) → "能分出去的"。像租房：Capacity 是总面积，Allocatable 是扣掉房东自住后的出租面积。**节点标 8C16G 不代表 Pod 能用满，先看 Allocatable。**

### 237. Overcommit

- **音标**: /ˌəʊvərkəˈmɪt/
- **词义**: 超卖；集群中所有 Pod 的 requests 总和超过节点实际容量。K8s 允许超卖（按 requests 调度而非实际用量），赌"不是所有 Pod 同时用满"，从而大幅提高资源利用率，但也埋下 OOM 风险
- **例句**: Kubernetes allows overcommit by scheduling Pods based on requests, which may sum to more than the node's actual capacity.
- **🪄 记忆**: Over(超过) + Commit(承诺) → "承诺过头了"。像航空公司超卖机票——赌有人不来，赌对了满座率拉满，赌错了就得有人"被降舱"（OOMKilled）。**超卖是提效手段，但必须有监控兜底。**

### 238. Throttle

- **音标**: /ˈθrɒtl/
- **词义**: 节流/限流；容器 CPU 使用超过 limits 时被内核强制降速（CFS 带宽控制）。注意区别：CPU 超限只是"被降速"（Throttled），内存超限才是"被杀"（OOMKilled）
- **例句**: A container that exceeds its CPU limit is throttled rather than killed, which may show up as increased latency.
- **🪄 记忆**: Throttle 原意"油门/节气门"——收油门的动作。CPU 配额用尽不杀你，但给你"收油门"：跑是能跑，速度被压住。**监控里看到 Throttling 高企，说明 CPU limits 设小了。**

### 239. Saturation

- **音标**: /ˌsætʃəˈreɪʃn/
- **词义**: 饱和；资源利用率接近或达到上限的状态。节点 CPU/内存饱和通常伴随排队、延迟上升，是容量规划的第一警报信号
- **例句**: Node saturation on CPU or memory often precedes performance degradation and request timeouts.
- **🪄 记忆**: Saturate(浸透) → 海绵吸满水的状态。资源像海绵：水少随便挤，吸满了再滴一滴都费劲。**监控看"饱和度"比看绝对用量更能预判故障。**

### 240. Contention

- **音标**: /kənˈtenʃn/
- **词义**: 争抢；多个进程/Pod 同时竞争同一有限资源（CPU、内存、锁、带宽）导致性能下降。K8s 中多 Pod 挤在同一节点、大流量冲击时极易发生
- **例句**: Under heavy load, CPU contention between Pods on the same node causes erratic response times.
- **🪄 记忆**: Contend(竞争) + tion → "抢东西"。像高峰期地铁——人人都想挤上去，结果谁都不快。**延迟忽高忽低（抖动）时，先怀疑资源争抢而不是代码问题。**

### 241. Starvation

- **音标**: /stɑːˈveɪʃn/
- **词义**: 饥饿；进程/任务因长期得不到所需资源（或被更高优先级抢占）而无法推进。低优先级 Pod、等待锁过久的任务都可能"饿死"
- **例句**: A low-priority Pod may suffer from starvation when higher-priority workloads constantly consume the node's resources.
- **🪄 记忆**: Starve(挨饿) → 一直被饿着。食堂开饭，高优先级的先打饭，低优先级的排到最后——菜没了只能饿着。**PriorityClass 用得好是保障，用不好就有人"饿死"。**

---

## 第25期 — 数据保护与安全

### 242. Backup

- **音标**: /ˈbækʌp/
- **词义**: 备份；将数据或集群状态复制到安全位置以防丢失。K8s 中常用 Velero 做集群级备份（含 PVC 数据快照），etcd 备份则用于恢复集群元数据
- **例句**: Schedule regular cluster backups with Velero so you can restore the entire environment after a disaster.
- **🪄 记忆**: Back(后面) + Up(起来) → "留后手"。像照片存云盘——手机丢了还能找回来。**没有备份的集群，就像没有保险的人生，出事只能干瞪眼。**

### 243. Restore

- **音标**: /rɪˈstɔːr/
- **词义**: 恢复；从备份把数据或集群状态还原到某个时间点。K8s 恢复演练要常做，不然备份了却恢复不了等于白备
- **例句**: After the incident, the team restored the cluster from the latest backup in under an hour.
- **🪄 记忆**: Re(重新) + Store(存放) → "重新放回去"。像手机恢复出厂设置后导回通讯录。**备份是存钱，恢复才是取钱——只存不练，关键时刻可能提不出款。**

### 244. Replication

- **音标**: /ˌreplɪˈkeɪʃn/
- **词义**: 复制；将数据或状态同步到多个副本以保证可用性。etcd 通过 Raft 协议在节点间复制数据，存储层（如 PVC 底层）也有跨可用区复制
- **例句**: etcd uses Raft-based replication to keep all nodes' data consistent across the cluster.
- **🪄 记忆**: Replicate(复制) → "复印机模式"。一份文件复印三份放三个抽屉，烧了一个还有两个。**注意区分：Replica 是"副本"这个名词，Replication 是"复制"这个过程。**

### 245. Migrate

- **音标**: /maɪˈɡreɪt/
- **词义**: 迁移；把工作负载或数据从一个环境搬到另一个。常见场景：集群升级换节点、跨云迁移、从虚拟机搬到 K8s、StatefulSet 跨集群搬迁
- **例句**: The team migrated the legacy application from VMs to Kubernetes without noticeable downtime.
- **🪄 记忆**: Migrate 同源词"移民"。像搬家——从老房子搬到新小区，家具（数据）得一件不少地带过去。**迁移的坑都在"状态"上：无状态服务随便搬，有状态服务（数据库）才是硬骨头。**

### 246. Upgrade

- **音标**: /ˈʌpɡreɪd/
- **词义**: 升级；将软件或集群版本更新到更高版本。K8s 升级讲究"小步快跑"（一次升一个 minor 版本），且先升级控制面再升级节点，避免版本不兼容
- **例句**: Kubernetes upgrades are done incrementally, one minor version at a time, to reduce the risk of breaking changes.
- **🪄 记忆**: Up(向上) + Grade(等级) → "往上升一级"。像手机系统大版本更新——不升怕漏洞，瞎升怕变砖。**K8s 升级前必看三个东西：API 变更、弃用特性、第三方组件兼容性。**

### 247. Firewall

- **音标**: /ˈfaɪəwɔːl/
- **词义**: 防火墙；基于规则的网络访问控制设备/软件。云上集群的入口流量靠安全组/防火墙放行，集群内部则用 NetworkPolicy 做"东西向"微隔离
- **例句**: The cloud firewall only allows traffic from trusted IP ranges to reach the cluster's API server.
- **🪄 记忆**: Fire(火) + Wall(墙) → "挡火的墙"。像小区门禁——外人先过登记，不是谁都让进。**记住分工：防火墙管南北向（进出集群），NetworkPolicy 管东西向（Pod 之间）。**

### 248. Encryption

- **音标**: /ɪnˈkrɪpʃn/
- **词义**: 加密；将明文数据转换为密文，只有持有密钥才能读取。K8s 可对 etcd 中的 Secret 做静态加密（encryption at rest），网络传输则靠 TLS
- **例句**: Enable encryption at rest for etcd so that Secrets stored in the cluster cannot be read in plaintext.
- **🪄 记忆**: En(使) + Crypt(隐藏) + ion → "藏起来"。像写日记用密码本——偷到本子也看不懂内容。**线上事故查 Secret 泄露时，第一反应就是看 etcd 加密开没开。**

### 249. Certificate

- **音标**: /sərˈtɪfɪkət/
- **词义**: 证书；数字签名后用于身份验证的公钥凭证。K8s 集群各组件间通信都靠证书（CA 签发），kubeadm 默认证书有效期一年，过期前要轮换（renew）
- **例句**: The API server presents its certificate to clients so they can verify its identity over TLS.
- **🪄 记忆**: Certify(证明) + cate → "身份证明"。像身份证——证明"我就是我"，别人看到证书就敢信任。**K8s 翻车名场面：证书过期，kubectl 突然报 x509 错误，第一眼先看证书到期时间。**

### 250. Authentication

- **音标**: /ɔːˌθentɪˈkeɪʃn/
- **词义**: 认证；确认"你是谁"。K8s 的认证方式：客户端证书、ServiceAccount Token、OIDC、Webhook 等。认证只回答"你是谁"，不回答"你能干什么"
- **例句**: The kubeconfig file stores the credentials used for authentication against the Kubernetes API server.
- **🪄 记忆**: Author(作者/本人) 同源 → 验证"你确实是本人"。像进公司刷卡——先确认你是谁。**记口诀：Authentication(认证)=验明正身，Authorization(授权)=你能进哪个办公室。**

### 251. Authorization

- **音标**: /ˌɔːθərəˈzeɪʃn/
- **词义**: 授权；决定"你能做什么"。K8s 中通过 RBAC（Role/ClusterRole + RoleBinding/ClusterRoleBinding）控制用户对资源的读写权限，遵循最小权限原则
- **例句**: RBAC authorization determines which operations a user is allowed to perform on cluster resources.
- **🪄 记忆**: Authorize(批准) → "盖章放行"。认证完还得过授权这关：你是本人没错，但权限表里没有"删库"这一项。**排查权限问题先分两步：认证过没过（401），授权够不够（403）。**

---

> 📅 最后更新：2026-09-01 | 累计 251 词 | 持续更新中 🐾

---

## 第26期 — 容器运行时、Helm 与服务网格

### 252. OCI

- **音标**: /ˌəʊ siː ˈaɪ/
- **词义**: 开放容器倡议（Open Container Initiative）；Linux 基金会旗下的开源组织，制定容器镜像（image-spec）和容器运行时（runtime-spec）的行业标准，Docker、containerd、CRI-O 等全部遵循
- **例句**: The OCI image specification ensures that an image built by Docker can run on containerd, CRI-O, or any other OCI-compliant runtime.
- **🪄 记忆**: OCI = "容器世界的普通话"——以前每家各说各话（Docker 的镜像格式别人不认），OCI 定下统一标准后大家照着说，谁都能听懂。containerd、CRI-O 都是 OCI 的"模范生"。

### 253. CRI

- **音标**: /ˌsiː ɑːr ˈaɪ/
- **词义**: 容器运行时接口（Container Runtime Interface）；Kubelet 与容器运行时之间的 gRPC 协议，定义了 ImageService 和 RuntimeService 两组 API，让 K8s 可以对接任意符合 CRI 的运行时
- **例句**: The CRI allows Kubernetes to work with any container runtime — containerd, CRI-O, or others — as long as it implements the CRI protocol.
- **🪄 记忆**: CRI 就像"USB 接口"——K8s 是电脑，容器运行时是外设（U盘/键盘）。只要外设做成 USB 接口（实现 CRI），插上就能用。有了 CRI，K8s 才能"随便换运行时"。

### 254. CRI-O

- **音标**: /ˈkriː əʊ/
- **词义**: 轻量级容器运行时；红帽主导开发，专为 K8s 设计，直接实现 CRI 规范，使用 runc 运行容器、containers/image 拉取镜像，不依赖 Docker
- **例句**: CRI-O is a lightweight runtime built specifically for Kubernetes, enabling direct integration with OCI-compliant runtimes like runc.
- **🪄 记忆**: CRI + O(open) → "专为 K8s 而生"的运行时。它不做 Docker 那些花活（docker build、docker compose），只专注一件事：让 K8s 把容器跑起来。OpenShift 的默认运行时就是它。

### 255. crictl

- **音标**: /ˈkraɪtl/（亦常逐字母读作 /ˌsiː ɑːr aɪ ˈsiː tiː el/）
- **词义**: CRI 兼容的容器命令行工具；用法与 kubectl 相似，直接与容器运行时通信，可在 kubectl 不可用的情况下调试容器（拉镜像、查状态、看日志、执行命令）
- **例句**: On a node with a broken kubelet, you can use crictl ps and crictl logs to inspect the underlying containers directly.
- **🪄 记忆**: crictl = "kubectl 的平替调试版"。kubectl 是"前台客服"（走 API Server），crictl 是"内部直连"（直接对接运行时）。kubelet 挂了、kubectl 连不上时，登录节点用 crictl 照样能看容器。排障宝藏工具。

### 256. Chart

- **音标**: /tʃɑːrt/
- **词义**: Helm 的软件包格式；由一组描述 K8s 资源的 YAML 模板、values.yaml、Chart.yaml 元数据组成的目录结构，可以像安装软件一样把整套应用装进集群
- **例句**: The Bitnami nginx Chart packages the Deployment, Service, and ConfigMap templates together with configurable values.
- **🪄 记忆**: Chart 原意"航海图"。Helm 是舵手，Chart 就是"航海图+货物清单"——里面画好了怎么部署（模板）、有什么参数可调（values）。`helm install` 就像照着航海图出航，一键装好整套应用。

### 257. Release

- **音标**: /rɪˈliːs/
- **词义**: Helm 中的发布实例；每次执行 helm install / upgrade 都会创建一个 Release，记录安装的 Chart 版本、配置值和部署历史，可通过 helm rollback 回滚
- **例句**: Run helm upgrade --install myapp ./mychart to create a new Release or upgrade an existing one.
- **🪄 记忆**: Release = "一次部署的存档"。同一个 Chart 装 5 次就有 5 个 Release（分别起名）。每个 Release 都有"回滚存档"（revision 历史）——新版本翻车了，`helm rollback` 一键回到上一个版本。打游戏读档的 K8s 版。

### 258. Values

- **音标**: /ˈvæljuːz/
- **词义**: Helm 的配置值；通过 values.yaml 文件或 --set 参数传入 Chart 模板中的可配置项（副本数、镜像 tag、资源限制等），实现"同一套模板，不同环境不同配置"
- **例句**: Override the default values by running helm install myapp ./chart --set replicaCount=5 --values prod-values.yaml.
- **🪄 记忆**: Values = "填空答题卡"。Chart 模板里有各种"空"（{{ .Values.replicaCount }}），Values 就是填进去的答案——开发填 1 副本，生产填 5 副本，模板不用改。`--set` 临时改，`-f` 文件批量改。

### 259. Envoy

- **音标**: /ˈenvɔɪ/
- **词义**: 云原生高性能代理；CNCF 毕业项目，C++ 编写，支持动态配置，是 Istio 服务网格的数据面核心，负责流量转发、负载均衡、TLS 终止和可观测性数据采集
- **例句**: Istio injects an Envoy sidecar proxy into each Pod to handle all inbound and outbound traffic.
- **🪄 记忆**: Envoy 本意"外交使节"——所有进出 Pod 的流量都经过它"翻译转达"。它像每个 Pod 门口的"安检+翻译官"：流量管住（路由/限流/重试）、加密管住（mTLS）、数据管住（指标/日志）。服务网格的"发动机"就是 Envoy。

### 260. mTLS

- **音标**: /ˌem tiː el es/
- **词义**: 双向 TLS（Mutual TLS）；客户端和服务端互相验证对方证书，比单向 TLS 更安全。服务网格（Istio、Linkerd）默认启用 mTLS，实现服务间通信的加密与身份认证
- **例句**: Istio's mTLS feature encrypts and authenticates all traffic between services, ensuring that only verified workloads can communicate.
- **🪄 记忆**: 普通 TLS 是"你验我的证"（客户端验服务器），mTLS 是"互相验"——进小区保安要看你的证，你也得确认他是真保安。服务网格里每个服务都有"身份证"（证书），说话前先互验身份，杜绝伪造和窃听。

### 261. ServiceMesh

- **音标**: /ˈsɜːrvɪs meʃ/
- **词义**: 服务网格；专门处理服务间通信的基础设施层，将流量管理、安全（mTLS）、可观测性从业务代码中剥离，下沉到 Sidecar 代理（如 Envoy）中。Istio、Linkerd、Consul 是主流实现
- **例句**: A service mesh moves traffic management and security concerns out of the application code and into a dedicated infrastructure layer.
- **🪄 记忆**: 想象每条"服务通路"上都架了一张网（Mesh），网格里的"节点"是 Sidecar 代理。业务代码不再管"怎么通信"，只管业务本身——网络、加密、监控全交给这张网。**服务网格 = 给微服务通信"上保险+装监控"的隐形基础设施。**

---

> 📅 最后更新：2026-09-02 | 累计 261 词 | 持续更新中 🐾
