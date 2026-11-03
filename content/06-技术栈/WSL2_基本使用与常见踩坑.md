---
title: WSL2 基本使用与常见踩坑
tags:
  - Linux
  - WSL2
  - 命令速查
category: 命令速查
status: active
---

# WSL2 基本使用与常见踩坑

## 什么是 WSL

WSL（Windows Subsystem for Linux，Windows 子系统 for Linux）是 Windows 10/11 内置的兼容层，让你无需虚拟机或双系统，就能在 Windows 上直接运行 Linux 命令行工具、应用程序和服务。

- **WSL1**：通过系统调用翻译层在 Windows 内核上运行 Linux，与 Windows 文件系统互通性好，但不兼容全部 Linux 系统调用（如 Docker 守护进程）。
- **WSL2**：基于轻量级 Hyper-V 虚拟机，运行真正的 Linux 内核，提供完整系统调用兼容性（Docker、systemd 等均可原生运行），文件系统默认是独立的 ext4 虚拟磁盘（`.vhdx`），跨 Windows 文件系统时性能略低。

WSL2 适合本地开发、运维脚本验证、运行 Linux 专用服务（如 Docker、K3s 单节点）。日常用 Windows 办公、用 WSL 跑 Linux 工具，二者通过路径挂载（`/mnt/<drive>`）和互操作命令（`wsl.exe`、`explorer.exe`）无缝协作。

> [!tip] 两个版本怎么选
> 需要 Docker、Kubernetes（k3s/kind）、systemd 或完整 Linux 内核特性时，务必使用 **WSL2**。仅在极度依赖 Windows 文件系统性能、且不需要完整内核特性的场景下考虑 WSL1。

## 开启虚拟化

![[Pasted_image_20260716123311.png]]

## 使用场景

用于在 Windows 中管理 WSL2 发行版、执行常用 Linux 操作、处理 Windows/Linux 路径转换，以及排查跨文件系统、权限、换行符和网络问题。

> [!tip] 先分清命令在哪里执行
> `wsl ...` 管理命令主要在 **PowerShell / Windows Terminal** 中执行；`apt`、`systemctl`、`ls` 等 Linux 命令在 **WSL 终端** 中执行。

## PowerShell 中的 WSL 管理命令

| 场景          | 命令                                                              | 说明                   |
| ----------- | --------------------------------------------------------------- | -------------------- |
| 查看 WSL 状态   | `wsl --status`                                                  | 查看默认发行版和默认版本         |
| 查看 WSL 组件版本 | `wsl --version`                                                 | 排查功能差异时先记录版本         |
| 更新 WSL      | `wsl --update`                                                  | 更新 WSL 内核和相关组件       |
| 查看已安装发行版    | `wsl --list --verbose`                                          | 简写为 `wsl -l -v`      |
| 查看可安装发行版    | `wsl --list --online`                                           | 简写为 `wsl -l -o`      |
| 安装 Ubuntu   | `wsl --install -d Ubuntu`                                       | 首次启动后创建 Linux 用户     |
| 进入指定发行版     | `wsl -d Ubuntu`                                                 | 发行版名以 `wsl -l -v` 为准 |
| 设为默认发行版     | `wsl --set-default Ubuntu`                                      | 之后执行 `wsl` 默认进入它     |
| 停止一个发行版     | `wsl --terminate Ubuntu`                                        | 简写为 `wsl -t Ubuntu`  |
| 停止所有 WSL 实例 | `wsl --shutdown`                                                | 配置变更、网络异常或内存未释放时常用   |
| 设置为 WSL2    | `wsl --set-version Ubuntu 2`                                    | 转换前先确认磁盘空间           |
| 安装到指定位置   | `wsl --install kali-linux --location D:\wsl\kali-linux`         | 自定义安装路径，避免占用系统盘     |
| 自定义名称安装   | `wsl --install Ubuntu --name Ubuntu2 --location D:\wsl\Ubuntu2` | 指定实例名和目录，便于多实例管理   |
| 强制网络下载    | `wsl --install --web-download`                                  | 绕过 Microsoft Store 直接下载 |
## wslconfig配置文件
```ini
[wsl2]
# Balanced for local coding agents and builds on a 16-thread / 16-GB host.
memory=8GB
processors=12
swap=4GB
swapFile=D:\\WSL\\swap.vhdx

# Reliable localhost, VPN, DNS, and proxy behavior for Codex / Claude Code.
networkingMode=mirrored
dnsTunneling=true
firewall=true
autoProxy=true

[experimental]
# Preserve Linux page cache while returning unused memory to Windows gradually.
autoMemoryReclaim=gradual
bestEffortDnsParsing=true
initialAutoProxyTimeout=5000

```

## 备份、迁移与删除

以下命令在 PowerShell 中执行：

```powershell
# 导出前先停止，避免备份内容不一致
wsl --terminate Ubuntu-24.04
wsl --export Ubuntu-24.04 D:\WSL-Backup\ubuntu.tar

#永久删除实例
wsl --unregister Ubuntu-24.04

# 建立新文件夹
New-Item D:\WSL\Ubuntu-24.04 -ItemType Directory -Force

# 导入为新实例
wsl --import Ubuntu-24.04 D:\WSL\Ubuntu-24.04 D:\WSL-Backup\ubuntu.tar --version 2

# 如果知道用户直接使用命令设置用户
wsl --manage Ubuntu-24.04 --set-default-user zesheng

# 启动wsl 指定名称
wsl -d Ubuntu-24.04

git clone https://gitlab.liaozesheng.cn/poqaod/dotfiles.git
```

### 导入后设置用户名和密码

`wsl --import` 导入的实例默认以 `root` 登录。先在 PowerShell 中以 root 进入新实例：

```powershell
wsl -d Ubuntu-Work -u root
```

先在 WSL 内确认原来的用户是否已经存在。从已有 Ubuntu 导出的 tar 通常会保留原用户：

```bash
id <username>
```

如果用户不存在，创建用户；`adduser` 会交互式要求输入密码：

```bash
adduser <username>
usermod -aG sudo <username>
```

如果用户已经存在，只需要重置密码或确认 sudo 权限：

```bash
passwd <username>
usermod -aG sudo <username>
```

编辑 `/etc/wsl.conf`：

```bash
nano /etc/wsl.conf
```

增加或合并以下配置，不要覆盖文件中已有的其他配置：

```ini
[user]
default=<username>
```

退出 WSL，回到 PowerShell 重启该实例并验证：

```powershell
wsl --terminate Ubuntu-Work
wsl -d Ubuntu-Work -- whoami
wsl -d Ubuntu-Work
```

> [!note] 导入实例的默认用户设置
> `ubuntu config --default-user <username>` 仅适用于具有 Ubuntu 启动器的发行版，不适用于 `wsl --import` 创建的自定义实例。导入实例使用 `/etc/wsl.conf` 设置默认用户。

> [!danger] `wsl --unregister` 会永久删除实例
> `wsl --unregister Ubuntu` 会删除该发行版的文件系统。执行前必须核对发行版名，并确认导出文件可用。

## WSL 内的基本命令

### 文件和目录

| 场景 | 命令 |
|---|---|
| 查看当前目录 | `pwd` |
| 查看文件 | `ls -lah` |
| 切换目录 | `cd <dir>` |
| 创建多级目录 | `mkdir -p <dir>` |
| 复制目录 | `cp -a <source> <target>` |
| 移动或重命名 | `mv <source> <target>` |
| 查看目录体积 | `du -sh <dir>` |
| 查看磁盘空间 | `df -hT` |
| 搜索文件名 | `rg --files \| rg '<keyword>'` |
| 搜索文件内容 | `rg -n '<keyword>' <dir>` |

> [!warning] 谨慎使用 `rm -rf`
> WSL 内删除 `/mnt/c`、`/mnt/d`、`/mnt/e` 下的文件，等价于直接删除 Windows 磁盘文件，通常不会进入回收站。

### 软件包与系统

```bash
sudo apt update
sudo apt upgrade
sudo apt install <package>
sudo apt remove <package>

uname -a
cat /etc/os-release
ps -p 1 -o comm=
systemctl status <service>
```

`ps -p 1 -o comm=` 返回 `systemd` 时，才按常规 Linux 方式使用 `systemctl`。

## Windows 与 WSL 互操作

| 场景 | 命令 | 说明 |
|---|---|---|
| 用资源管理器打开当前目录 | `explorer.exe .` | 在 WSL 内执行 |
| Linux 路径转 Windows 路径 | `wslpath -w "$PWD"` | 便于传给 Windows 程序 |
| Windows 路径转 Linux 路径 | `wslpath -u 'E:\Obsidian'` | 输出类似 `/mnt/e/Obsidian` |
| 调用 PowerShell | `powershell.exe -NoProfile -Command 'Get-Date'` | 在 WSL 内调用 Windows 命令 |
| 查看 Windows 环境变量 | `cmd.exe /c set` | 输出中可能包含敏感信息 |

Windows 中访问 Linux 用户目录时，使用 `\\wsl$\Ubuntu\home\<user>`，不要直接查找或修改 WSL 的虚拟磁盘文件。

## 文件应该放在哪里

| 数据类型 | 推荐位置 | 原因 |
|---|---|---|
| Git 仓库、Node/Python 依赖、编译产物 | `~/projects` 等 WSL ext4 目录 | 大量小文件和元数据操作更快 |
| 主要由 Windows 程序管理的文档 | `/mnt/c`、`/mnt/d`、`/mnt/e` | Windows 程序可直接访问 |
| 小型 Obsidian 笔记库 | 可放 `/mnt/<drive>` | 便于 Windows Obsidian 使用，应用 WSL 搜索前先实测性能 |

`/mnt/e` 是 Windows 文件系统的跨系统挂载，不是 WSL 内的原生 ext4。顺序读写大文件通常可用，但 Git、`node_modules`、解压和遍历大量小文件可能明显变慢。

## 本笔记库的实际踩坑

### 1. `/mnt/e` 不等于 WSL 原生磁盘

本笔记库位于 `/mnt/e/Obsidian`。当时的实测结果：

| 项目 | 结果 |
|---|---|
| Markdown 文件数 | 81 |
| Markdown 全文搜索 | 约 0.07 秒 |
| 清理 Git 后的全库文件扫描 | 约 0.65 秒，3,465 个文件 |

结论：当前规模下日常检索足够快，没必要为了 WSL 将笔记库搬离 Windows 磁盘。如果以后引入大量附件、Git 对象或插件小文件，再重新测量。

### 2. 不再使用 Git，`.git` 仍会带来扫描负担

清理前 `.git` 占用约 108 MB，包含 4,288 个文件。这些文件对 Markdown 正文没有价值，却会增加全目录遍历、备份和安全软件扫描的成本。

确认已经不需要版本历史后，再执行：

```bash
du -sh .git
find .git -type f | wc -l
rm -rf .git
```

> [!danger] 删除 `.git` 会丢失本地版本历史
> 删除前先确认不再需要 Git，或先备份整个目录。`rg` 默认不搜索隐藏目录，因此删除 `.git` 不一定会让普通正文检索更快；主要优化的是全目录扫描。

本次在 `/mnt/e` 上首次删除时遇到 `Directory not empty`，检查残留内容后重试成功。Windows 程序、同步软件或安全软件正在访问文件时，也可能出现类似情况。

## 其他常见坑

### 换行符导致脚本无法执行

Windows 的 CRLF 可能导致 `/bin/bash^M: bad interpreter` 或 `$'\r': command not found`。

```bash
file <script.sh>
sed -i 's/\r$//' <script.sh>
chmod +x <script.sh>
```

编辑器中将 Shell 脚本换行符设为 LF。

### 权限语义不完全一致

`/mnt/<drive>` 上的权限和大小写行为受 Windows 文件系统与挂载配置影响。不要假设 `chmod`、符号链接、文件所有者和仅大小写不同的文件名一定与 ext4 表现相同。对权限和符号链接敏感的项目放在 WSL 原生目录。

### 路径中有空格

传递 Windows 路径时始终加引号：

```bash
cd "/mnt/c/Users/<user>/My Project"
wslpath -u 'C:\Users\<user>\My Project'
```

### 发行版名写错

`Ubuntu`、`Ubuntu-22.04` 和导入时自定义的名字不一定相同。执行 `--terminate`、`--export`、`--unregister` 前，先用下列命令获取准确名称：

```powershell
wsl --list --verbose
```

### 网络或 DNS 突然异常

先分层检查，不要一上来重写 DNS 配置：

```bash
ip addr
ip route
cat /etc/resolv.conf
getent hosts example.com
curl -I https://example.com
```

如果 Windows 网络正常而 WSL 状态异常，可先在 PowerShell 执行 `wsl --shutdown` 后重启。VPN、代理和防火墙会影响 WSL 网络，不要默认 Windows 的代理环境已经自动传入 Linux Shell。

## 配置边界

- `/etc/wsl.conf`：当前 Linux 发行版的配置，例如默认用户、systemd 和挂载行为。
- `%UserProfile%\.wslconfig`：Windows 上的 WSL2 全局配置，例如资源限制。
- 修改后通常需在 PowerShell 执行 `wsl --shutdown` 再重启。
- 不要直接复制网络上的 `.wslconfig` 或 `wsl.conf`；先核对 WSL 版本、发行版和实际需求。

## 排查顺序

1. 确认命令应在 PowerShell 还是 WSL 内执行。
2. 用 `wsl -l -v`、`wsl --version`、`cat /etc/os-release` 记录环境。
3. 确认当前目录是 WSL ext4 还是 `/mnt/<drive>`。
4. 针对文件、权限、换行符或网络分层排查。
5. 在修改全局配置前，先用最小命令复现问题。

## 相关笔记

- [[Python_UV_与_WSL2_开发环境实践]]
- [[Linux_排障索引]]
- [[技术栈索引]]

## 官方资料

- [Microsoft WSL 基本命令](https://learn.microsoft.com/windows/wsl/basic-commands)
- [Microsoft 导入自定义 WSL 发行版](https://learn.microsoft.com/windows/wsl/use-custom-distro)
- [Microsoft WSL 文件存储建议](https://learn.microsoft.com/windows/wsl/filesystems)
- [Microsoft WSL 高级配置](https://learn.microsoft.com/windows/wsl/wsl-config)
