---
title: Kubernetes kubeadm 集群安装部署
tags:
  - Kubernetes
  - 部署
category: 自动化与部署
status: active
---

# Kubernetes kubeadm 集群安装部署

## 目标

使用 `kubeadm` 从零搭建一个可用的 Kubernetes 集群：

- 1 个控制平面节点（control-plane）
- 2 个工作节点（worker）
- 容器运行时使用 `containerd`
- CNI 使用 `Flannel` 或 `Calico`（二选一，Calico 步骤见 5.3）
- 最后部署一个 Nginx 应用，验证跨节点调度、Service 和 DNS 都正常

本文按“每一步都能直接复制执行”的方式编写，适合单机实验、内网测试和标准化重装。生产环境的 HA 控制平面、备份、监控和升级策略见文末附录与后续笔记。

> [!note]
> kubeadm 是 Kubernetes 官方提供的集群引导工具，负责证书、静态 Pod、kubeconfig 和加入令牌；它不负责安装 CNI，也不负责长期运维。本文只覆盖“装好一个能用的集群”。

## 版本与基线

本文以 **Kubernetes v1.35.4** 为例。补丁版本会持续更新，安装时可以用 `apt-cache madison kubeadm` 查看仓库里的最新版本；**所有节点的 kubeadm / kubelet / kubectl 必须保持同一版本**。

| 项目 | 本文取值 | 说明 |
|---|---|---|
| 操作系统 | Ubuntu 22.04 / 24.04 | 主流程按 Debian/Ubuntu 编写，RHEL 系差异见 3.4 |
| 内核 | 5.15 及以上 | Ubuntu 22.04+ 默认满足 |
| Kubernetes | v1.35.4 | kubeadm、kubelet、kubectl 三件套同版本 |
| 容器运行时 | containerd 2.x | 使用 Docker 官方仓库的 `containerd.io` 包 |
| crictl | v1.35.0 | 与 Kubernetes minor 版本对齐 |
| cgroup 驱动 | systemd | containerd 与 kubelet 必须一致 |
| CNI | Flannel（默认）/ Calico | Flannel 使用 VXLAN 8472；Calico 步骤见 5.3 |
| Pod CIDR | `10.244.0.0/16` | 与 Flannel 默认值一致 |
| Service CIDR | `10.96.0.0/12` | kubeadm 默认值，本文不修改 |
| 容器运行时 socket | `unix:///run/containerd/containerd.sock` | 初始化时显式指定，避免多运行时歧义 |

> [!tip]
> 不要混用 K3s 和 kubeadm 的组件。本库另一套笔记记录的是 K3s 集群；本文是从裸机安装标准 Kubernetes，两者不要在同一台机器上共存。

## 拓扑规划

示例使用 `192.168.1.0/24` 网段，实际部署时替换成你的地址。

| 主机名 | IP | 角色 | 建议配置 | 说明 |
|---|---|---|---|---|
| `k8s-master` | `192.168.1.11` | control-plane | 4C / 8G / 50G+ | 运行 apiserver、etcd、controller-manager、scheduler |
| `k8s-worker1` | `192.168.1.12` | worker | 4C / 8G / 100G | 运行业务 Pod |
| `k8s-worker2` | `192.168.1.13` | worker | 4C / 8G / 100G | 运行业务 Pod |

如果只有一台机器，可以只装 master，然后去掉控制平面污点，让它同时承载业务 Pod（见 5.4）。

### 网络规划

| 网段 | 用途 | 是否可改 |
|---|---|---|
| `192.168.1.0/24` | 节点物理网络 | 按实际环境 |
| `10.244.0.0/16` | Pod 网络 | 可改，但必须与 CNI 配置一致 |
| `10.96.0.0/12` | Service ClusterIP | 可改，本文使用默认值 |
| `30000-32767` | NodePort 端口范围 | 可改，本文使用默认值 |

## 端口与防火墙

生产环境不建议直接关闭防火墙，至少放行以下端口。

### 控制平面节点

| 端口 | 协议 | 用途 |
|---|---|---|
| 6443 | TCP | Kubernetes API Server |
| 2379-2380 | TCP | etcd server / peer |
| 10250 | TCP | kubelet API |
| 10257 | TCP | controller-manager |
| 10259 | TCP | scheduler |

### 工作节点

| 端口 | 协议 | 用途 |
|---|---|---|
| 10250 | TCP | kubelet API |
| 30000-32767 | TCP | NodePort Service |
| 8472 | UDP | Flannel VXLAN |

### Calico（使用 5.3 时）

| 端口 | 协议 | 用途 |
|---|---|---|
| 179 | TCP | BGP 路由交换 |
| 4789 | UDP | Calico VXLAN 封装 |
| 5473 | TCP | calico-typha |

本文 Calico 使用默认的 `VXLANCrossSubnet`：同子网节点直接路由，跨子网节点走 VXLAN。如果改成 IPIP 或纯 BGP 模式，按对应方式放行协议和端口。

## 0. 安装前检查

在**所有节点**执行：

```bash
cat /etc/os-release
uname -r
nproc
free -h
lsblk
ip -br a
sudo cat /sys/class/dmi/id/product_uuid
stat -fc %T /sys/fs/cgroup
timedatectl
```

逐项确认：

- [x] 操作系统是 Ubuntu 22.04/24.04 或兼容发行版，内核 5.15+
- [x] 至少 2C / 4G；控制平面建议 4C / 8G
- [x] `/var/lib` 所在分区至少 20G 空闲（镜像和 etcd 都放这里）
- [x] 每台机器有静态 IP 或 DHCP 保留地址
- [x] 每台机器的 hostname、MAC、`product_uuid` 唯一（虚拟机克隆后必须检查）
- [x] `stat -fc %T /sys/fs/cgroup` 输出 `cgroup2fs`（cgroup v2）
- [x] 时间同步正常，节点之间时间偏差不能过大

> [!warning]
> 虚拟机整机克隆后经常出现 `product_uuid` 和 MAC 相同，kubeadm 会直接报错。克隆后先修改主机名、MAC 和 machine-id，再安装 Kubernetes。

## 1. 所有节点：系统初始化

以下步骤在 `k8s-master`、`k8s-worker1`、`k8s-worker2` 上都要执行。

### 1.1 设置主机名

```bash
# 控制平面节点
sudo hostnamectl set-hostname k8s-master

# 工作节点分别执行
sudo hostnamectl set-hostname k8s-worker1
sudo hostnamectl set-hostname k8s-worker2

hostnamectl
```

### 1.2 配置 /etc/hosts

确保三台机器都能用主机名互相解析。**追加前先检查是否已存在相同条目**，避免重复。

```bash
sudo tee -a /etc/hosts >/dev/null <<'EOF'
192.168.1.11 k8s-master
192.168.1.12 k8s-worker1
192.168.1.13 k8s-worker2
EOF

getent hosts k8s-master k8s-worker1 k8s-worker2
```

如果使用 DNS，也可以只在 DNS 中配置 A 记录；但 `/etc/hosts` 是最不依赖外部环境的做法。

### 1.3 关闭 Swap

kubelet 默认要求关闭 Swap。

```bash
sudo swapoff -a
swapon --show
free -h
```

确认 `swapon --show` 没有输出后，注释掉 `/etc/fstab` 中的 swap 行，防止重启后自动挂载：

```bash
sudo cp /etc/fstab /etc/fstab.bak
sudo sed -i '/\sswap\s/s/^/#/' /etc/fstab
grep -n swap /etc/fstab
```

部分云镜像还会通过 systemd 挂载 swap，检查：

```bash
systemctl --type swap --all
```

如果存在 swap 单元，执行 `sudo systemctl mask <单元名>`。

### 1.4 加载内核模块

```bash
cat <<'EOF' | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

lsmod | grep -E 'overlay|br_netfilter'
```

`overlay` 用于容器分层文件系统，`br_netfilter` 用于让 iptables 看到桥接流量。

### 1.5 配置内核参数

```bash
cat <<'EOF' | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sudo sysctl --system

sysctl net.bridge.bridge-nf-call-iptables \
       net.bridge.bridge-nf-call-ip6tables \
       net.ipv4.ip_forward
```

三个值都应为 `1`。

### 1.6 防火墙

**实验环境**可以直接关闭：

```bash
sudo systemctl disable --now ufw
# RHEL 系：
# sudo systemctl disable --now firewalld
```

**生产环境**建议保留防火墙并放行端口：

```bash
sudo ufw allow 6443/tcp
sudo ufw allow 2379:2380/tcp
sudo ufw allow 10250/tcp
sudo ufw allow 10257/tcp
sudo ufw allow 10259/tcp
sudo ufw allow 30000:32767/tcp
sudo ufw allow 8472/udp
sudo ufw reload
sudo ufw status
```

RHEL 系等价命令：

```bash
sudo firewall-cmd --permanent --add-port=6443/tcp
sudo firewall-cmd --permanent --add-port=2379-2380/tcp
sudo firewall-cmd --permanent --add-port=10250/tcp
sudo firewall-cmd --permanent --add-port=10257/tcp
sudo firewall-cmd --permanent --add-port=10259/tcp
sudo firewall-cmd --permanent --add-port=30000-32767/tcp
sudo firewall-cmd --permanent --add-port=8472/udp
sudo firewall-cmd --reload
sudo firewall-cmd --list-ports
```

### 1.7 SELinux（仅 RHEL 系）

```bash
getenforce
sudo setenforce 0
sudo sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config
```

Ubuntu 默认不启用 SELinux，可跳过。

### 1.8 时间同步

```bash
sudo apt-get update
sudo apt-get install -y chrony
sudo systemctl enable --now chrony
chronyc tracking
timedatectl
```

时间服务器端配置:
```bash
vim /etc/chrony/chrony.conf

# 指定上游公网时间源（阿里云 NTP）
server ntp.aliyun.com iburst
server ntp1.aliyun.com iburst

# 允许内网网段（例如 192.168.71.0/24）的客户端来同步时间
allow 192.168.71.0/24

# 如果上游时间源暂时不可达，允许使用本地时钟作为备用（层级设为10，避免影响外部）
local stratum 10

sudo systemctl restart chronyd
sudo systemctl enable chrony
```

客户端同步:
```bash
vim /etc/chrony/chrony.conf

# 指向内网时间服务器
server 192.168.71.213 iburst

sudo systemctl restart chronyd
sudo systemctl enable chrony
```

验证同步状态:
```bash
chronyc sources -v
chronyc tracking
timedatectl
```

更改时区:
```bash
timedatectl set-timezone Asia/Shanghai
```

RHEL 系使用 `sudo dnf install -y chrony`。

节点时间偏差过大会导致证书校验和 Join 失败，三台机器必须使用同一时间源。

### 1.9 唯一性检查

```bash
ip link | grep -E 'link/ether'
sudo cat /sys/class/dmi/id/product_uuid
```

每台机器的 MAC 和 `product_uuid` 都不能相同。

## 2. 所有节点：安装并配置 containerd

### 2.1 安装依赖和 Docker 仓库

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release apt-transport-https

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null

sudo apt-get update
```

> [!tip]
> 网络问题，可以换国内的镜像源
```bash
curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://mirrors.aliyun.com/docker-ce/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
```


### 2.2 安装 containerd

```bash
sudo apt-get install -y containerd.io
containerd --version
```

> [!tip]
> 这里只安装 `containerd.io`，不需要安装完整的 Docker Engine。Kubernetes 通过 CRI 直接对接 containerd。

### 2.3 生成默认配置

```bash
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml >/dev/null
sudo cp /etc/containerd/config.toml /etc/containerd/config.toml.bak
```

### 2.4 设置 systemd cgroup 驱动

Kubernetes 推荐 kubelet 与容器运行时都使用 systemd cgroup，否则节点会出现 cgroup 驱动不一致的问题。

```bash
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
grep -n 'SystemdCgroup' /etc/containerd/config.toml
```

确认输出中至少有一行 `SystemdCgroup = true`。

如果 `sed` 没有替换成功（不同 containerd 版本的缩进或引号可能不同），手动编辑：

```bash
sudo vi /etc/containerd/config.toml
```

找到 `runtimes.runc.options` 段，把 `SystemdCgroup` 改为 `true`。containerd 1.7 与 2.x 的配置段名不同，但键名都是 `SystemdCgroup`。

### 2.5 启动并设置开机自启
> [!tip]
> 生成默认配置之后，需要再次重启containerd，应用最新配置
> `sudo systemctl restart containerd`

```bash
sudo systemctl enable --now containerd
sudo systemctl status containerd --no-pager
sudo ctr version
```

`ctr version` 能正常输出版本，说明 containerd 已经工作。

如果启用了国内镜像，先不要在这一步改 `sandbox_image`，等 kubeadm 安装完成后按附录 B 统一处理。

### 2.6 安装 crictl

`crictl` 是 CRI 的命令行工具，用来直接查看 containerd 里的容器、镜像和 Pod。kubeadm 不会自动安装它，建议每个节点都装。

选择与 Kubernetes minor 版本一致的 cri-tools 版本；本文集群是 1.35.x，所以使用 `v1.35.0`：

```bash
CRICTL_VERSION="v1.35.0"
ARCH="$(dpkg --print-architecture)"

curl -L -o crictl.tar.gz \
  "https://github.com/kubernetes-sigs/cri-tools/releases/download/${CRICTL_VERSION}/crictl-${CRICTL_VERSION}-linux-${ARCH}.tar.gz"

sudo tar -C /usr/local/bin -xzf crictl.tar.gz
rm -f crictl.tar.gz

crictl --version
```

配置默认 endpoint，避免每次手动指定：

```bash
sudo tee /etc/crictl.yaml >/dev/null <<'EOF'
runtime-endpoint: unix:///run/containerd/containerd.sock
image-endpoint: unix:///run/containerd/containerd.sock
timeout: 10
debug: false
EOF

sudo crictl info
```

常用命令：

```bash
sudo crictl images                 # 镜像列表
sudo crictl pods                   # Pod 列表（Sandbox）
sudo crictl ps -a                  # 所有容器，包括已退出
sudo crictl logs <container-id>    # 查看容器日志
sudo crictl inspect <container-id> # 查看容器详情
sudo crictl stats                  # 资源占用
sudo crictl rmi <image-id>         # 删除镜像
```

> [!tip]
> 如果 `crictl ps` 看不到 kubelet 创建的容器，加上 `-n k8s.io` 指定命名空间，例如 `sudo crictl -n k8s.io ps -a`。

### 2.7 用 crictl 拉取私有仓库镜像

手动拉取带 Basic Auth 的私有镜像：

```bash
sudo crictl pull --creds "admin:你的密码" zot.liaozesheng.lol/你的镜像名:标签
```

拉取后确认：

```bash
sudo crictl images | grep zot.liaozesheng.lol
```

如果列表里看不到，尝试指定 kubelet 使用的命名空间：

```bash
sudo crictl -n k8s.io images | grep zot.liaozesheng.lol
```

> [!warning]
> `--creds` 的密码会出现在命令历史、进程列表和终端记录中。不要把真实密码提交到笔记或 Git；建议用交互输入，并定期轮换。本文位于公开发布目录时，请把仓库地址和账号替换成占位符。

更安全的输入方式：

```bash
read -rsp "Registry password: " REG_PASS; echo
sudo crictl pull --creds "admin:${REG_PASS}" zot.liaozesheng.lol/你的镜像名:标签
unset REG_PASS
```

**让 Kubernetes Pod 也能拉取私有镜像**

`crictl pull` 只影响当前节点的一次手动拉取，不会给 kubelet 持久化凭据。Pod 需要使用 `imagePullSecret`：

```bash
kubectl create secret docker-registry zot-registry \
  --docker-server=zot.liaozesheng.lol \
  --docker-username=admin \
  --docker-password='你的密码' \
  -n default
```

Pod 中引用：

```yaml
spec:
  imagePullSecrets:
    - name: zot-registry
  containers:
    - name: app
      image: zot.liaozesheng.lol/你的镜像名:标签
```

如果希望节点级别免 Secret，可以在 containerd 的 registry 配置中写入认证信息，然后重启 containerd。containerd 1.x 与 2.x 的配置段名不同，以 `containerd config default` 生成的段名为准：

```toml
# containerd 2.x 示例；1.x 段名不同，按实际配置调整
[plugins.'io.containerd.cri.v1.images'.registry.configs.'zot.liaozesheng.lol'.auth]
  username = "admin"
  password = "你的密码"
```

```bash
sudo systemctl restart containerd
```

如果仓库使用自签证书或 HTTP，需要在 `/etc/containerd/certs.d/zot.liaozesheng.lol/hosts.toml` 配置 CA 或 `skip_verify`；生产环境优先使用受信任证书。

## 3. 所有节点：安装 kubeadm / kubelet / kubectl

### 3.1 添加 Kubernetes 官方仓库（Debian/Ubuntu）

```bash
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.35/deb/Release.key \
  | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
sudo chmod a+r /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.35/deb/ /' \
  | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt-get update
```

### 3.2 安装并锁定版本

先查看仓库里可用的版本：

```bash
apt-cache madison kubeadm | head
apt-cache madison kubelet | head
apt-cache madison kubectl | head
```

安装三件套：

```bash
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

如果仓库里同时存在多个版本，建议显式指定同一版本，例如：

```bash
sudo apt-get install -y \
  kubeadm=1.35.10-1.1 \
  kubelet=1.35.10-1.1 \
  kubectl=1.35.10-1.1
```

版本号后缀以 `apt-cache madison` 的实际输出为准。

验证：

```bash
kubeadm version -o short
kubelet --version
kubectl version --client
```

### 3.3 设置 kubelet 开机启动

```bash
sudo systemctl enable kubelet
```

此时 kubelet 可能处于 `activating` 或反复重启状态，因为还没有执行 `kubeadm init`，这是正常现象。初始化完成后它会自己变为 `active (running)`。

### 3.4 RHEL / Rocky / AlmaLinux 差异

Debian 系跳过本节。RHEL 系把第 2、3 步替换为：

```bash
# Docker CE 仓库（按发行版选择 rhel / centos / fedora 路径）
sudo dnf install -y dnf-plugins-core ca-certificates curl gnupg2
sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
sudo dnf install -y containerd.io

# Kubernetes 仓库
sudo tee /etc/yum.repos.d/kubernetes.repo >/dev/null <<'EOF'
[kubernetes]
name=Kubernetes
baseurl=https://pkgs.k8s.io/core:/stable:/v1.35/rpm/
enabled=1
gpgcheck=1
gpgkey=https://pkgs.k8s.io/core:/stable:/v1.35/rpm/repodata/repomd.xml.key
EOF

sudo dnf install -y kubelet kubeadm kubectl --disableexcludes=kubernetes
sudo systemctl enable --now containerd
sudo systemctl enable kubelet
```

RHEL 系的 containerd 配置文件路径同为 `/etc/containerd/config.toml`，第 1.7 节的 SELinux 设置不要漏掉。

## 4. 控制平面节点：kubeadm init

以下步骤只在 `k8s-master` 执行。

### 4.1 查看并预拉取镜像（可选）

```bash
kubeadm config images list --kubernetes-version v1.35.4
```

国内网络建议先预拉取：

```bash
sudo kubeadm config images pull \
  --kubernetes-version v1.35.4 \
  --image-repository registry.aliyuncs.com/google_containers
```

如果预拉取失败，先解决镜像仓库访问问题，不要直接执行 init，否则会卡在 `PullImage` 阶段。

> [!tip]
> `registry.aliyuncs.com/google_containers` 不保证同步所有补丁版本。如果拉取失败，可改用 `registry.k8s.io` 或当前环境可访问的镜像仓库，并同步修改 init 命令里的 `--image-repository`。

### 4.2 执行初始化

单控制平面、物理网络为 `192.168.1.11` 时：

```bash
sudo kubeadm init \
  --apiserver-advertise-address=192.168.1.11 \
  --control-plane-endpoint=192.168.1.11:6443 \
  --pod-network-cidr=10.244.0.0/16 \
  --kubernetes-version=v1.35.4 \
  --cri-socket=unix:///run/containerd/containerd.sock \
  --image-repository=registry.aliyuncs.com/google_containers
```

参数说明：

| 参数 | 作用 |
|---|---|
| `--apiserver-advertise-address` | API Server 对外通告的地址，多网卡时必须指定 |
| `--control-plane-endpoint` | 集群 API 的统一入口；单机可以写 master IP，未来做 HA 时应改为 VIP 或 DNS |
| `--pod-network-cidr` | Pod 网段，必须与 CNI 配置一致 |
| `--kubernetes-version` | 控制平面版本，需与本机 kubeadm 匹配 |
| `--cri-socket` | 显式指定 containerd 的 CRI socket |
| `--image-repository` | 国内镜像仓库；能直连 registry.k8s.io 时可省略 |

> [!warning]
> `--control-plane-endpoint` 一旦写入集群，后续改成 VIP 需要重新初始化或修改配置，不能直接改 hosts 了事。规划 HA 时一开始就使用 DNS 名称或 VIP。

初始化成功后会输出类似内容：

```text
Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 192.168.1.11:6443 --token abcdef.0123456789abcdef \
  --discovery-token-ca-cert-hash sha256:...
```

**把 join 命令完整保存下来**，后面工作节点加入要用。

### 4.3 配置 kubectl

普通用户：

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

kubectl get nodes
```

root 用户：

```bash
export KUBECONFIG=/etc/kubernetes/admin.conf
kubectl get nodes
```

建议把 `KUBECONFIG` 写入 shell 配置文件，或者直接使用上面的普通用户 kubeconfig。

### 4.4 查看初始化结果

```bash
kubectl get nodes -o wide
kubectl get pods -n kube-system -o wide
kubectl get --raw='/readyz?verbose'
```

此时节点通常是 `NotReady`，原因是还没有安装 CNI；`kube-system` 中 `kube-apiserver`、`etcd`、`kube-controller-manager`、`kube-scheduler` 应该已经 Running，而 `coredns` 可能处于 Pending，安装 CNI 后会恢复。

### 4.5 保存 join 命令

在 master 上随时可以重新生成：

```bash
sudo sudo kubeadm token create --print-join-command | sudo tee /root/kubeadm-join.sh >/dev/null
```

该命令默认生成 24 小时有效的 token。长期有效的 token 可以用 `--ttl 0`，但安全性较低，不推荐在共享环境使用。

## 5. 安装 CNI

CNI 不安装，节点会一直 NotReady，Pod 之间也无法通信。Flannel 和 Calico 二选一：主流程使用 Flannel，需要 NetworkPolicy 或 BGP 时使用 5.3 的 Calico，**不要同时安装两者**。

### 5.1 部署 Flannel

```bash
kubectl apply -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml
```

等待 Pod 启动：

```bash
kubectl -n kube-flannel get pods -w
```

看到 `kube-flannel-ds-*` 全部 Running 后按 `Ctrl+C`。

检查 Flannel 的 Pod 网段是否与初始化时的 `--pod-network-cidr` 一致：

```bash
kubectl -n kube-flannel get configmap kube-flannel-cfg -o yaml | grep -A2 Network
```

默认应为 `10.244.0.0/16`。如果不一致，修改 ConfigMap 后重启 Flannel：

```bash
kubectl -n kube-flannel edit configmap kube-flannel-cfg
kubectl -n kube-flannel rollout restart daemonset kube-flannel-ds
```

### 5.2 验证 CNI（Flannel）

```bash
kubectl get nodes -o wide
kubectl -n kube-flannel get pods -o wide
kubectl -n kube-system get pods -o wide
ip route | grep flannel
```

节点状态应变为 `Ready`，`coredns` 也会变为 Running。

### 5.3 Calico 安装（可选，与 Flannel 二选一）

Flannel 适合快速验证；生产环境如果需要 NetworkPolicy、BGP 对接或更细的流量控制，使用 Calico。以下步骤假设**全新集群、尚未安装任何 CNI**。

> [!warning]
> Calico 和 Flannel 不要同时安装。已经装了 Flannel 的集群，先执行 5.3.7 的清理步骤，确认旧 CNI 配置和网卡清理干净，再安装 Calico。

#### 5.3.1 确认 Pod 网段

本文 `kubeadm init` 使用：

```bash
--pod-network-cidr=10.244.0.0/16
```

Calico 的默认 IP 池是 `192.168.0.0/16`，必须改成与 kubeadm 一致；否则 Pod 地址与 kubelet/CNI 预期不一致，跨节点通信会出现问题。

#### 5.3.2 安装 Tigera Operator

Calico 官方推荐通过 Operator 安装。先部署 operator：
> [!tip]
> 国内建议先下载，查看镜像信息，再视情况创建

```bash
curl -O https://raw.githubusercontent.com/projectcalico/calico/v3.33.0/manifests/tigera-operator.yaml --proxy http://192.168.71.212:7890

kubectl create -f tigera-operator.yaml
```

等待 operator 就绪：

```bash
kubectl -n tigera-operator get pods -w
```

看到 `tigera-operator-*` 为 Running 后按 `Ctrl+C`。

#### 5.3.3 修改 Installation 配置并安装 Calico

下载 `custom-resources.yaml`：
> 视情况添加代理

```bash
curl -O https://raw.githubusercontent.com/projectcalico/calico/v3.33.0/manifests/custom-resources.yaml  --proxy https://192.168.71.212:7890
```

把默认 CIDR 改为 kubeadm 的 Pod 网段：

```bash
sed -i 's#cidr: 192.168.0.0/16#cidr: 10.244.0.0/16#' custom-resources.yaml
grep -n 'cidr:' custom-resources.yaml
```

输出应为 `cidr: 10.244.0.0/16`。然后创建 Calico 资源：

```bash
kubectl create -f custom-resources.yaml
```

> [!tip]
> `raw.githubusercontent.com` 访问不稳定时，可以先把两个 YAML 下载到本地再 `kubectl create -f` 文件。operator 和自定义资源必须使用同一个 Calico 版本。如果重复执行提示 `AlreadyExists`，改用 `kubectl apply -f`。

#### 5.3.4 观察 Calico 状态

```bash
kubectl -n calico-system get pods -w
```

看到 `calico-node-*`、`calico-typha-*`、`calico-kube-controllers-*` 全部 Running 后按 `Ctrl+C`。

检查整体状态：

```bash
kubectl get tigerastatus
kubectl get nodes -o wide
```

`tigerastatus` 中的组件应为 `Available=True`，节点应变为 `Ready`。

如果 `kubectl get tigerastatus` 提示 CRD 不存在，说明 operator 或 custom-resources 没有创建成功，按 5.3.6 排查。

#### 5.3.5 验证 IP 池和节点

```bash
kubectl get ippools.crd.projectcalico.org -o wide
```

输出的 CIDR 应为 `10.244.0.0/16`。

可选安装 `calicoctl`：

```bash
curl -L -o calicoctl \
  https://github.com/projectcalico/calico/releases/download/v3.33.0/calicoctl-linux-amd64
chmod +x calicoctl
sudo mv calicoctl /usr/local/bin/

calicoctl get ippools -o wide
calicoctl node status
```

`calicoctl node status` 可以查看节点间的 BGP 会话状态。单机或纯 VXLAN 环境下没有 BGP peer 也属正常。

#### 5.3.6 Calico 常见问题

| 现象 | 排查方向 |
|---|---|
| `tigera-operator` Pod 拉取镜像失败 | 检查 `quay.io` 或镜像仓库网络，必要时配置镜像加速/私有仓库 |
| `calico-node` CrashLoopBackOff | `kubectl -n calico-system logs <pod>`，重点看 IP 池、网卡自动探测和 BGP/VXLAN 端口 |
| 节点一直 NotReady | `kubectl describe node`，确认 `/etc/cni/net.d` 下有 Calico 配置，`calico-node` 已 Ready |
| 跨节点 Pod 不通 | 放行 4789/UDP（VXLAN）、179/TCP（BGP）、5473/TCP（Typha），检查安全组和防火墙 |
| 大包超时、SSH 正常 | MTU 问题；在 `custom-resources.yaml` 的 `calicoNetwork` 下设置 `mtu: 1450` 后重新 apply |
| IP 池不是 10.244.0.0/16 | 修改 `custom-resources.yaml` 后重新创建，或删除旧 IP 池后重建 |

#### 5.3.7 从 Flannel 切换到 Calico

先删除 Flannel：

```bash
kubectl delete -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml
```

清理每个节点上的 Flannel 残留：

```bash
sudo rm -f /etc/cni/net.d/10-flannel.conflist
sudo ip link delete flannel.1 2>/dev/null || true
sudo ip link delete cni0 2>/dev/null || true
```

然后按 5.3.2 ~ 5.3.5 安装 Calico。切换 CNI 会中断现有 Pod 网络，生产环境先在测试集群验证。

#### 5.3.8 卸载 Calico

```bash
kubectl delete -f custom-resources.yaml
kubectl delete -f https://raw.githubusercontent.com/projectcalico/calico/v3.33.0/manifests/tigera-operator.yaml
```

清理节点残留（确认要重装 CNI 时再执行）：

```bash
sudo rm -rf /etc/cni/net.d/10-calico.conflist /etc/cni/net.d/calico-*
sudo rm -rf /var/lib/calico
```

> [!warning]
> 卸载 CNI 后 Pod 网络立即失效，节点上的业务 Pod 会不可用。

#### 5.3.9 自管理 manifest 方式（备选）

如果不想使用 Operator，也可以直接用 `calico.yaml`：

```bash
curl -O https://raw.githubusercontent.com/projectcalico/calico/v3.33.0/manifests/calico.yaml
```

编辑 `calico.yaml`，找到 `CALICO_IPV4POOL_CIDR`（默认被注释），取消注释并改为：

```yaml
- name: CALICO_IPV4POOL_CIDR
  value: "10.244.0.0/16"
```

然后应用：

```bash
kubectl apply -f calico.yaml
kubectl -n kube-system get pods -l k8s-app=calico-node -w
```

Operator 方式更适合长期维护，自管理方式适合离线或需要完全控制 manifest 的场景。

### 5.4 单节点集群：允许业务 Pod 调度到控制平面

只有一台机器时，去掉控制平面污点：

```bash
kubectl taint nodes k8s-master node-role.kubernetes.io/control-plane:NoSchedule-
```

生产环境不建议这样做，控制平面节点应保持专用。

## 6. 工作节点加入集群

### 6.1 在 master 上生成 join 命令

```bash
sudo kubeadm token create --print-join-command
```

输出示例：

```text
kubeadm join 192.168.1.11:6443 --token abcdef.0123456789abcdef \
  --discovery-token-ca-cert-hash sha256:0123456789abcdef...
```

如果 token 过期，重新执行上面的命令即可。也可以在 master 上查看当前有效 token：

```bash
sudo kubeadm token list
```

### 6.2 在 worker 上执行 join

在 `k8s-worker1` 和 `k8s-worker2` 上分别执行（需要 root）：

```bash
sudo kubeadm join 192.168.1.11:6443 \
  --token abcdef.0123456789abcdef \
  --discovery-token-ca-cert-hash sha256:0123456789abcdef... \
  --cri-socket unix:///run/containerd/containerd.sock
```

如果 `sudo kubeadm token create --print-join-command` 输出的命令里没有 `--cri-socket`，手动补上，避免 kubeadm 在多个运行时之间无法判断。

### 6.3 验证节点

回到 master：

```bash
kubectl get nodes -o wide
kubectl get pods -A -o wide
```

两台 worker 都应变为 `Ready`。

### 6.4 给节点打标签（可选）

```bash
kubectl label node k8s-worker1 node-role.kubernetes.io/worker=worker
kubectl label node k8s-worker2 node-role.kubernetes.io/worker=worker
kubectl get nodes --show-labels
```

## 7. 集群验证

### 7.1 基础状态

```bash
kubectl cluster-info
kubectl get nodes -o wide
kubectl get pods -A -o wide
kubectl get --raw='/readyz?verbose'
```

所有系统 Pod 应为 Running，节点为 Ready。

### 7.2 部署测试应用

```bash
kubectl create deployment web --image=nginx:1.27
kubectl scale deployment web --replicas=2
kubectl expose deployment web --port=80 --type=NodePort

kubectl get pods -o wide
kubectl get svc web
```

获取 NodePort：

```bash
kubectl get svc web -o jsonpath='{.spec.ports[0].nodePort}'; echo
```

假设输出 `31234`，从集群外访问任意节点的 IP：

```bash
curl -I http://192.168.1.12:31234
```

应返回 `HTTP/1.1 200 OK`。

> [!tip]
> 如果镜像拉取失败，把 `nginx:1.27` 换成你的私有仓库或国内可访问的镜像地址。内网环境可以先把镜像推到 Harbor，再由 Deployment 引用。

### 7.3 DNS 验证

```bash
kubectl run dns-test --rm -it --restart=Never --image=busybox:1.36 \
  -- nslookup kubernetes.default
```

能解析出 `10.96.0.1` 说明 CoreDNS 正常。

### 7.4 验证 Pod 跨节点通信

```bash
kubectl get pods -o wide
```

确认两个 Nginx Pod 分别调度到不同节点后，可以进入其中一个 Pod 访问另一个 Pod 的 IP：

```bash
kubectl exec -it <pod-name> -- curl -I http://<另一个-pod-IP>
```

如果镜像里没有 `curl`，可以用 `wget` 或临时部署 `busybox` 测试。

## 8. 日常运维

### 8.1 kubeconfig

```bash
kubectl config view
kubectl config get-contexts
kubectl config current-context
```

多集群场景建议给 context 起明确名称：

```bash
kubectl config rename-context kubernetes-admin@kubernetes prod-k8s
```

### 8.2 Token 管理

```bash
sudo kubeadm token list
sudo kubeadm token create --print-join-command
sudo kubeadm token delete <token>
```

### 8.3 节点维护

```bash
# 禁止新 Pod 调度
kubectl cordon k8s-worker1

# 驱逐 Pod（DaemonSet 和 emptyDir 需要显式参数）
kubectl drain k8s-worker1 --ignore-daemonsets --delete-emptydir-data

# 维护完成后恢复
kubectl uncordon k8s-worker1
```

### 8.4 证书检查与续期

```bash
sudo kubeadm certs check-expiration
```

续期全部证书：

```bash
sudo kubeadm certs renew all
```

续期后需要重启 kubelet，让静态 Pod 重新加载证书：

```bash
sudo systemctl restart kubelet
```

控制平面证书默认一年有效期，生产环境应提前规划续期或使用外部证书管理。

### 8.5 版本升级（简述）

升级必须按 minor 版本逐步进行，不能跨版本直接跳。以 1.35.x 升级到 1.36.x 为例，顺序是：先升级控制平面，再逐个升级工作节点。

```bash
# 控制平面
sudo apt-mark unhold kubeadm
sudo apt-get update
sudo apt-get install -y kubeadm=1.36.0-1.1
sudo apt-mark hold kubeadm

sudo kubeadm upgrade plan

# 多控制平面环境：先驱逐当前节点；单控制平面集群跳过 drain
kubectl drain k8s-master --ignore-daemonsets --delete-emptydir-data

sudo kubeadm upgrade apply v1.36.0

# 再升级 kubelet / kubectl
sudo apt-mark unhold kubelet kubectl
sudo apt-get install -y kubelet=1.36.0-1.1 kubectl=1.36.0-1.1
sudo apt-mark hold kubelet kubectl
sudo systemctl daemon-reload
sudo systemctl restart kubelet

# 如果执行过 drain，升级完成后恢复调度
kubectl uncordon k8s-master
```

> [!tip]
> 上面的 `1.36.0-1.1` 只是示例，替换成 `apt-cache madison kubeadm` 查到的实际版本。工作节点使用 `sudo kubeadm upgrade node`，不要执行 `kubeadm upgrade apply`。完整步骤以官方升级文档为准。

## 9. 常见问题

| 现象 | 常见原因 | 处理方向 |
|---|---|---|
| `kubeadm init` 报 swap 相关错误 | Swap 未关闭 | `swapoff -a`，检查 `/etc/fstab` 和 systemd swap 单元 |
| `bridge-nf-call-iptables contents are not set to 1` | 内核参数或 `br_netfilter` 未加载 | 执行 1.4、1.5 节并 `sysctl --system` |
| `CRI v1 runtime API is not implemented` | CRI socket 指向错误或 containerd 未启动 | 检查 `--cri-socket`，`systemctl status containerd` |
| `failed to pull image "registry.k8s.io/..."` | 无法访问官方镜像仓库 | 使用 `--image-repository`，或先 `kubeadm config images pull` |
| 节点一直 `NotReady` | CNI 未安装或 Pod 网段不一致 | 检查 Flannel Pod、`kubectl describe node`、ConfigMap 网段 |
| `coredns` 一直 Pending | 没有 CNI | 安装 Flannel 后再观察 |
| join 时报 token 过期 | 默认 token 24 小时有效 | 在 master 重新 `sudo kubeadm token create --print-join-command` |
| `x509: certificate signed by unknown authority` | 时间不同步或 join 命令中的 CA hash 错误 | 校准时间，重新获取 join 命令 |
| 端口被占用 | 6443/10250 被其他程序占用 | `ss -lntp \| grep -E '6443\|10250'` |
| Service 访问不通 | kube-proxy 异常或防火墙未放行 NodePort | 检查 `kube-proxy`、iptables/nftables、防火墙 |
| `kubectl` 连接被拒绝 | 控制平面未启动或 kubeconfig 不对 | 检查静态 Pod、`$HOME/.kube/config` |
| 节点克隆后 init 失败 | `product_uuid` 或 MAC 重复 | 修改虚拟机唯一标识后重装 |

### 9.1 查看日志的固定顺序

```bash
# 1. kubelet
sudo journalctl -u kubelet -n 200 --no-pager

# 2. containerd
sudo journalctl -u containerd -n 200 --no-pager

# 3. 静态 Pod
kubectl -n kube-system get pods
kubectl -n kube-system describe pod <pod>

# 4. 节点事件
kubectl describe node <node-name>
```

绝大多数初始化问题都能在 kubelet 日志里看到明确原因。

### 9.2 CNI 排查

Flannel：

```bash
kubectl -n kube-flannel get pods -o wide
kubectl -n kube-flannel logs <flannel-pod>
kubectl get nodes -o wide
ip route | grep flannel
```

Calico：

```bash
kubectl -n calico-system get pods -o wide
kubectl -n calico-system logs <calico-node-pod>
kubectl get tigerastatus
kubectl get ippools.crd.projectcalico.org -o wide
calicoctl node status
```

Flannel 的 VXLAN 使用 UDP 8472；Calico 的 VXLAN 使用 UDP 4789，BGP 使用 TCP 179。跨节点不通时优先检查防火墙、安全组，以及 CNI 网段是否与 `--pod-network-cidr` 一致。

## 10. 重置与重装

> [!warning]
> 以下命令会删除该节点上的 Kubernetes 配置、证书、etcd 数据和容器网络配置。只在确认要重建节点时执行，生产环境执行前必须先备份 etcd 和相关数据。

```bash
sudo kubeadm reset -f
```

清理残留配置：

```bash
sudo rm -rf /etc/cni/net.d
sudo rm -rf /var/lib/cni/
sudo rm -rf /var/lib/kubelet
sudo rm -rf /etc/kubernetes
sudo rm -rf /var/lib/etcd
rm -rf $HOME/.kube
```

如果有 IPVS 规则：

```bash
sudo ipvsadm --clear
```

清理 iptables：

```bash
sudo iptables -F
sudo iptables -t nat -F
sudo iptables -t mangle -F
sudo iptables -X
```

重启运行时：

```bash
sudo systemctl restart containerd
sudo systemctl restart kubelet
```

重置后重新执行第 4、6 节的初始化和加入步骤。

## 附录 A：三控制平面 HA 简述

生产环境建议 3 个控制平面节点 + VIP（keepalived）或外部负载均衡。核心区别是初始化时使用统一入口：

```bash
sudo kubeadm init \
  --control-plane-endpoint="192.168.1.100:6443" \
  --upload-certs \
  --pod-network-cidr=10.244.0.0/16 \
  --kubernetes-version=v1.35.4 \
  --cri-socket=unix:///run/containerd/containerd.sock
```

其他控制平面节点加入：

```bash
sudo kubeadm join 192.168.1.100:6443 \
  --token <token> \
  --discovery-token-ca-cert-hash sha256:<hash> \
  --control-plane \
  --certificate-key <certificate-key> \
  --cri-socket unix:///run/containerd/containerd.sock
```

`--upload-certs` 生成的 certificate key 默认 2 小时有效，过期后可以重新生成：

```bash
sudo kubeadm init phase upload-certs --upload-certs
```

HA 还涉及 etcd 成员数量、VIP 漂移、负载均衡健康检查，本文不展开；单机验证通过后再做 HA 更稳妥。

## 附录 B：国内网络环境

### B.1 kubeadm 控制平面镜像

初始化时使用：

```bash
--image-repository registry.aliyuncs.com/google_containers
```

也可以先手动拉取：

```bash
sudo kubeadm config images pull \
  --kubernetes-version v1.35.4 \
  --image-repository registry.aliyuncs.com/google_containers
```

### B.2 containerd 的 pause 镜像

kubeadm 预拉取的是控制平面镜像，Pod 沙箱使用的 pause 镜像由 containerd 自己拉取。若 pause 镜像仍指向 `registry.k8s.io`，需要同步修改：

```bash
PAUSE_TAG=$(kubeadm config images list --kubernetes-version v1.35.4 \
  --image-repository registry.aliyuncs.com/google_containers \
  | awk -F/ '/pause/{print $NF}')

echo "$PAUSE_TAG"

sudo sed -i "s#^\(\s*sandbox_image\s*=\s*\).*#\1\"registry.aliyuncs.com/google_containers/${PAUSE_TAG}\"#" \
  /etc/containerd/config.toml

grep -n sandbox_image /etc/containerd/config.toml
sudo systemctl restart containerd
```

修改后重新检查 `kubectl -n kube-system get pods`，确保新 Pod 能正常创建。

### B.3 业务镜像

Nginx、BusyBox 等业务镜像默认从 Docker Hub 拉取，国内网络可能很慢。可选方案：

- 给 containerd 配置 Docker Hub 镜像加速器；
- 使用公司 Harbor / 阿里云 ACR 等私有仓库，在 Deployment 中直接写完整镜像地址；
- 提前在节点上 `ctr -n k8s.io images pull` 并导入。

### B.4 系统软件源

如果 `download.docker.com` 或 `pkgs.k8s.io` 访问缓慢，可以换成公司内部镜像源或云厂商镜像；换源后仍需保证 kubeadm / kubelet / kubectl 版本一致。

## 附录 C：端口速查

| 节点 | 端口 | 协议 | 用途 |
|---|---|---|---|
| control-plane | 6443 | TCP | API Server |
| control-plane | 2379-2380 | TCP | etcd |
| control-plane | 10257 | TCP | controller-manager |
| control-plane | 10259 | TCP | scheduler |
| all | 10250 | TCP | kubelet |
| all | 8472 | UDP | Flannel VXLAN |
| worker | 30000-32767 | TCP | NodePort |

## 部署完成检查清单

- [x] `kubectl get nodes` 三个节点全部 `Ready`
- [x] `kubectl get pods -A` 系统 Pod 全部 Running
- [x] `kubectl get --raw='/readyz?verbose'` 返回 ok
- [ ] Nginx Deployment 的 Pod 能跨节点调度
- [ ] NodePort 能通过节点 IP 访问
- [ ] `nslookup kubernetes.default` 能解析
- [ ] `sudo kubeadm token list` 中有可用 token，或已保存 join 命令
- [ ] `kubeadm certs check-expiration` 记录到期时间
- [ ] `crictl info` 正常，能列出节点容器和镜像
- [ ] 私有仓库镜像已按 2.7 配置 `imagePullSecret` 或 containerd 认证
- [ ] 已记录集群版本、Pod CIDR、Service CIDR 和节点清单

## 相关笔记

- [[Kubernetes_命令速查]]
- [[Kubernetes_故障排查索引]]
- [[Kubernetes_Node_NotReady_排查]]
- [[Kubernetes_Service_无响应排查]]
- [[Kubernetes_Traefik_Ingress入口改造]]
- [[Kubernetes_NFS动态存储_部署]]
- [[Kubernetes_监控栈_kube-prometheus-stack_部署]]
- [[Kubernetes_Pod_Pending_排查]]
- [[Kubernetes_Pod_CrashLoopBackOff_排查]]
- [[containerd_占用磁盘空间过大]]
- [[Harbor_使用_Helm_安装部署]]
- [[Docker_基础与常用操作]]

## 参考

- kubeadm 安装：https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/
- 容器运行时：https://kubernetes.io/docs/setup/production-environment/container-runtimes/
- 创建集群：https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/
- Flannel：https://github.com/flannel-io/flannel
- Calico：https://docs.tigera.io/calico/latest/getting-started/kubernetes/self-managed-onprem/onpremises
