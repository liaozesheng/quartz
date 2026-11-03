
# ①systemd介绍
Systemd 是 Rocky Linux 9.6（以及大多数现代 Linux 发行版）的默认初始化系统和服务管理器，取代了传统的 SysVinit 系统。
它负责管理系统的启动、服务的运行、日志记录、定时任务等功能。Systemd 通过单元（units）文件以声明式的方式管理服务、设备、挂载点等资源，提供高效、并行化的启动流程和强大的依赖管理。

**如何读懂这个图片？**
![[Pasted_image_20251027102240.png]]
```bash
○ NetworkManager.service - Network Manager
     Loaded: loaded (/usr/lib/systemd/system/NetworkManager.service; disabled; preset: enabled)
     Active: inactive (dead)
       Docs: man:NetworkManager(8)
```

服务名称=NetworkManager.service
服务配置文件在`/usr/lib/systemd/system/NetworkManager.service` 路径。
`disabled` 用户手动禁止自动启动
`preset: enabled` 系统的预设策略是enabled 自动启动，就是安装这个服务，不手动操作的时候，这个服务是自动启动的 enabled。

---
# ②命令
```bash
systemctl --version   #验证版本
ps -p 1 -o comm=     #检查 systemd 是否作为初始化系统运行

systemctl status httpd.service
systemctl start httpd.service
systemctl stop httpd.service
systemctl restart httpd.service
systemctl reload httpd.service   # 不会中断服务，有些服务有，比如nginx，有些缺少

systemctl enable httpd.service
systemctl disable httpd.service
systemctl is-enabled httpd.service  # 检查是否自动启动
systemctl is-active httpd.service  # 检查是否启动

# 开关机
systemctl reboot
systemctl poweroff
systemctl rescue  # 进入救援模式
systemctl isolate multi-user.target   # 切换运行级别

#
systemctl list-units
systemctl list-units --type=service
systemctl list-unit-files --state=enabled
```

# ③systemd的概念
![[Pasted_image_20260310174652.png]]
由3种概念组成，**units单元管理**，**targets运行级别**，**服务状态** 3种
下面我给你**逐一、通俗易懂、结构化**讲解  
`/usr/lib/systemd/system/` 目录下各种类型文件和目录的作用。

这个目录非常关键：
> **它放的是系统自带的、软件包安装时提供的 systemd 单元（unit files）。**
---

# 🧩 `/usr/lib/systemd/system/` 里文件的分类与作用

systemd 的“单位文件”（unit file）有多种类型，每种类型控制不同的系统资源或行为。

我用一张结构图让你快速掌握：

```
service —— 管理服务（进程）
socket —— 套接字激活、监听端口
target —— 运行级别（阶段）
timer —— 定时任务
mount —— 文件系统挂载点
automount —— 自动挂载点
path —— 文件/目录监控触发器
slice —— 资源控制（cgroups）
scope —— 临时外部程序 wrapper（systemd-run）
swap —— swap 分区
```

下面逐一解释👇

---

# 1️⃣ **.service 文件 — 管理服务（最常见）**

例如：

```
sshd.service
nginx.service
docker.service
chronyd.service
```

用途：

- 定义服务如何启动（ExecStart）
    
- 服务类型（simple、forking、oneshot）
    
- 重启策略（Restart=）
    
- 所需权限、环境变量
    
- 依赖关系（After=、Requires=）
    

你最常用 systemctl 就是在操作 service：

```
systemctl start nginx
systemctl enable sshd
systemctl status docker
```

---

# 2️⃣ **.socket 文件 — 监听端口的“触发器”**

例：

```
sshd.socket
cups.socket
systemd-journald.socket
```

意义：

> 当有人连这个端口/system socket 时，再自动启动对应 service（**socket activation**）。

比如：

```
sshd.socket → 启动 → 来连接了 → 自动拉起 sshd.service
```

优点：节省资源，懒加载服务。

---

# 3️⃣ **.target 文件 — 类似“阶段、运行级别”**

例：

```
multi-user.target
graphical.target
network.target
basic.target
local-fs.target
```

作用：

> target 本身不是服务，而是“任务集合”。

比如：

- `multi-user.target` = 文本运行级别（类似 runlevel 3）
    
- `graphical.target` = GUI 模式（类似 runlevel 5）
    
- `network.target` = 网络准备好之后
    

target 有助于组织依赖、控制系统启动流程。

---

# 4️⃣ **.timer 文件 — 定时任务（systemd 版 cron）**

例：

```
logrotate.timer
fstrim.timer
dnf-makecache.timer
```

作用：

- 替代 cron
    
- 用 systemd 启动 service 的定时器
    
- 支持复杂时间语法（OnBootSec, OnUnitActiveSec）
    

比如：

```
fstrim.timer → 定期执行 fstrim.service
```

---

# 5️⃣ **.path 文件 — 文件/目录监控触发器**

例：

```
systemd-logind.path
cups.path
```

功能：

> 当目录或文件出现变化时触发某个 service

比如：

```
watched.path → 改动 → 执行 watched.service
```

常用场景：

- 程序上传文件后触发处理脚本
    
- 日志变化触发采集
    

---

# 6️⃣ **.mount 文件 — 挂载点**

例：

```
home.mount
var-lib-nfs-rpc_pipefs.mount
```

规则：

> 每个挂载点会映射到一个 mount unit  
> 如 `/home` → `home.mount`

mount unit 规范了挂载方式，而不是写死在 `/etc/fstab`。

---

# 7️⃣ **.automount 文件 — 自动挂载点（访问自动挂载）**

例：

```
proc-sys-fs-binfmt_misc.automount
```

用途：

> 当访问某个目录时，自动挂载对应 mount unit。

例如 NFS、特殊 fs 很常用。

---

# 8️⃣ **.swap 文件 — SWAP 分区管理**

例：

```
dev-disk-by-uuid-xxx.swap
```

功能：

- 控制 swap 分区的启停
    
- 代替 fstab 配置
    

---

# 9️⃣ **.slice 文件 — Cgroups 分组资源控制**

例：

```
system.slice
user.slice
machine.slice
```

目的：

> 将服务按 slice 分组，限制 CPU、内存、IO 等。

比如：

- system.slice：系统服务
    
- user.slice：用户会话
    
- machine.slice：容器/虚拟机
    

可以结合 `systemd-run` 动态创建 slice：

```
systemd-run --slice=mygroup.slice -p MemoryLimit=1G myscript.sh
```

---

# 🔟 **.scope 文件 — 临时任务的单位（systemd-run 创建）**

一般不会在 `/usr/lib/systemd/system` 出现，是运行后自动生成。

例如由 systemd-run 创建：

```
session-7.scope
```

代表一个临时任务或外部进程。

---

# 📌 目录作用总结

除了各种 _.service、_.timer 文件，你会看到：

|目录|解释|
|---|---|
|**multi-user.target.wants/**|开机进入 multi-user 时需要启动哪些服务（软链接）|
|**graphical.target.wants/**|GUI 模式所需服务|
|**sysinit.target.wants/**|初始化阶段需要的服务|
|**sockets.target.wants/**|socket 激活用的套接字列表|
|**timers.target.wants/**|所有启用的定时任务|

核心作用：

> 这些目录告诉 systemd “在对应阶段需要加载哪些 unit”。

---

# 🧠 全流程图（非常关键）

```
            sysinit.target
                    │
           basic.target
                    │
          network.target
                    │
      multi-user.target
                    │
     graphical.target（可选）
```

对应的 `*.target.wants/` 中放着软链接：

```
xxx.service -> /usr/lib/systemd/system/xxx.service
```

---

# 💡 如果你愿意，我还可以继续讲：

- enable 与 link、add dependency 的区别
    
- target 之间的依赖和启动顺序原理
    
- 如何写一个你自己的 systemd service
    
- 如何排查 service 启动失败
    
- systemd boot flow 完整图解
    

你想继续哪一部分？
