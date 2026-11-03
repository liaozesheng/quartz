---
title: Linux 系统交互式初始化脚本
tags:
  - Shell
  - Linux
  - 部署
category: 自动化与部署
status: active
date: 2026-06-24
---

# Linux 系统交互式初始化脚本

## 目标

通过一个 Bash 向导完成 Ubuntu 新系统初始化。脚本不再显示“完整初始化、仅配置网络、仅安装软件”等主菜单，而是从头到尾依次询问；每个模块都可以选择执行或跳过，最后统一显示执行计划并再次确认。

固定配置如下：

| 模块 | 固定配置 |
|---|---|
| APT | `https://mirrors.aliyun.com/ubuntu` |
| NVM | `v0.40.5` |
| NVM 安装器 | `https://gh-proxy.org/https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh` |
| NVM Git 仓库 | `https://gitee.com/mirrors/nvm.git` |
| Node.js | 由 NVM 安装一个 LTS 版本并设为默认版本 |
| Node.js 下载镜像 | `https://mirrors.huaweicloud.com/nodejs/` |
| npm Registry | `https://registry.npmmirror.com` |
| uv | 使用 `https://astral.sh/uv/install.sh` 安装 |
| Python 包索引 | `http://mirrors.aliyun.com/pypi/simple/` |

脚本不提供其他软件源选项。

> [!warning] APT 配置会清除其他源
> 选择配置 APT 后，脚本会备份并清除现有 `sources.list` 和 `sources.list.d`，只保留阿里云 Ubuntu 软件源。阿里云源验证失败时会自动恢复原配置。

> [!warning] Python 索引使用 HTTP
> 指定的阿里云 Python 索引是 HTTP 地址。uv 配置会加入 `allow-insecure-host = ["mirrors.aliyun.com"]`，这会绕过该主机的 TLS 校验，只应在可信网络中使用。

## 适用范围

- 仅支持 Ubuntu。
- 适合新服务器或新虚拟机初始化。
- 使用 Netplan 配置可选的 DHCP 或静态 IPv4。
- 使用 NVM 管理 Node.js，不再直接解压 Node.js 二进制包。
- 使用 uv 管理后续 Python 环境，不再安装系统级 `python3-pip`、`python3-venv` 或 `pipx`。

## 脚本文件

[打开 linux-system-init.sh](scripts/linux-system-init.sh)

## 使用方式

```bash
chmod +x linux-system-init.sh
sudo ./linux-system-init.sh
```

也可以直接执行：

```bash
sudo bash linux-system-init.sh
```

通过 `sudo` 执行时，NVM、Node.js、npm 和 uv 会配置到实际登录用户的主目录；直接以 root 登录时则配置到 `/root`。

## 执行流程

脚本依次询问以下内容：

1. 是否将 APT 固定为阿里云 Ubuntu 软件源。
2. 是否安装缺失的基础工具。
3. 是否安装 NVM、配置华为云镜像并安装 Node.js LTS。
4. 是否将 npm Registry 固定为 npmmirror。
5. 是否安装 uv 并配置阿里云 Python 索引。
6. 是否配置 Netplan IPv4 网络。
7. 显示完整计划，等待最终确认。

每次选择后，脚本都会立即说明将修改的文件、安装的软件或保持不变的内容。

## 基础工具和依赖

基础工具保持为：

```text
ca-certificates curl git gnupg build-essential unzip jq
```

NVM 或 uv 所需的额外安装依赖保持为：

```text
gzip tar
```

脚本会逐项检测，已经存在的工具不会重复安装，只通过 APT 补齐缺失项。APT/dpkg 被系统后台任务占用时，脚本每 10 秒重试一次，最长等待 15 分钟，不会删除锁文件。

## NVM 和 Node.js

NVM 未安装时，脚本以目标用户身份执行：

```bash
export NVM_SOURCE="https://gitee.com/mirrors/nvm.git"
export METHOD=git
curl -fsSL https://gh-proxy.org/https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | bash
```

NVM 安装器通过 `gh-proxy.org` 获取，完整 NVM 仓库从 Gitee clone。`METHOD=git` 会一次取得 `nvm.sh`、`nvm-exec` 和 `bash_completion`，避免 script 模式下后两个文件仍从 GitHub Raw 下载。

脚本不会再使用 `https://gitee.com/mirrors/nvm/raw/v0.40.5/nvm.sh`。该地址会先返回 HTTP 跳转，而 NVM v0.40.5 安装器内部下载 `NVM_SOURCE` 时不跟随该跳转，最终可能把 `Found` HTML 保存成 `nvm.sh`。如果检测到这种不完整安装，脚本会把原 `~/.nvm` 移至本次备份目录，然后重新安装。

安装器运行期间会临时将 `PATH` 收窄到 `/usr/bin:/bin`，避免扫描 `/opt` 或 `/usr/local/bin` 中旧 Node.js 的全局 npm 模块并输出大段英文警告。旧系统 Node.js 不会被删除；NVM 加载并执行 `nvm use default` 后，脚本会输出实际 `node` 路径，确认 NVM 管理的 LTS 已取得优先级。

如果目标用户 `~/.npmrc` 存在与 NVM 冲突的 `prefix` 或 `globalconfig`，脚本会先备份再移除这两项，其他 npm 配置保持不变。

然后在目标用户的 `~/.bashrc` 中写入：

```bash
export NVM_NODEJS_ORG_MIRROR=https://mirrors.huaweicloud.com/nodejs/
```

加载 NVM 后安装 LTS，并将其设为默认版本：

```bash
nvm install "lts/*"
nvm alias default "lts/*"
nvm use default
```

检测到 NVM 时不会重复安装；检测到 NVM 管理的 LTS 时不会重新下载 Node.js。完成后输出 NVM、Node.js 和 npm 的实际版本。

## npm Registry

选择配置 npm 后，将目标用户 `~/.npmrc` 中的 Registry 固定为：

```ini
registry=https://registry.npmmirror.com
```

原 `.npmrc` 会在修改前备份。其他非 Registry 配置会保留。

## uv 和 Python 包索引

uv 未安装时，以目标用户身份直接执行：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

随后写入 `~/.config/uv/uv.toml`：

```toml
allow-insecure-host = ["mirrors.aliyun.com"]

[[index]]
name = "aliyun"
url = "http://mirrors.aliyun.com/pypi/simple/"
default = true
```

检测到 uv 时跳过安装，但仍可补齐固定的阿里云索引配置。原 `uv.toml` 会在修改前备份。

uv 模块还会确保 `~/.local/bin/env` 存在，并在 `~/.bashrc` 中加入以下安全加载行：

```bash
[ -f "$HOME/.local/bin/env" ] && source "$HOME/.local/bin/env"
```

脚本通过 `sudo` 运行时，子进程中的 `source` 无法反向修改原终端环境。因此全部流程结束后会提示回到原用户终端执行：

```bash
source "$HOME/.local/bin/env"
source "$HOME/.bashrc"
```

## APT 软件源

选择配置 APT 后，会生成 `/etc/apt/sources.list.d/aliyun.sources`，包含当前 Ubuntu 版本的以下 Suites：

```text
<codename>
<codename>-updates
<codename>-backports
<codename>-security
```

Components 固定为：

```text
main restricted universe multiverse
```

脚本执行 `apt-get update` 验证新配置；验证失败时自动恢复原 `sources.list` 和 `sources.list.d`。

## 网络配置

网络配置默认跳过，当前仅支持 Netplan：

1. 选择网卡。
2. 选择 DHCP 或静态 IPv4。
3. 静态模式填写 IPv4/CIDR 和默认网关。
4. 选择预设 DNS 或填写自定义 DNS。
5. 备份 `/etc/netplan`。
6. 生成并校验 `99-linux-system-init.yaml`。
7. 通过 `netplan try --timeout 60` 临时应用。
8. 用户取消、超时或校验失败时恢复原配置。

> [!warning] 网络配置风险
> 修改 IPv4、网关或 DNS 可能导致 SSH 断开。建议先在具有控制台访问能力的测试主机上验证。

## 验证方法

脚本结束时会输出实际安装版本和配置状态，也可以手动检查：

```bash
source "$HOME/.local/bin/env"
source "$HOME/.bashrc"
nvm --version
nvm current
node --version
npm --version
npm config get registry
uv --version
cat ~/.config/uv/uv.toml
ip -brief -4 address
ip route show default
netplan get
```

## 备份与回滚

备份目录：

```text
/var/backups/linux-system-init/<执行时间>/
```

其中可能包含：

- `apt/`：原 APT 配置。
- `nvm/bashrc`：修改前的目标用户 `.bashrc`。
- `npm/npmrc`：修改前的 `.npmrc`。
- `uv/uv.toml`：修改前的 uv 配置。
- `netplan/`：原 Netplan 配置。

## 参考

- [nvm-sh/nvm](https://github.com/nvm-sh/nvm)
- [uv 安装文档](https://docs.astral.sh/uv/getting-started/installation/)
- [uv Package indexes](https://docs.astral.sh/uv/concepts/indexes/)

## 相关笔记

- [[Shell_自动化索引]]
- [[Python_UV_与_WSL2_开发环境实践]]
- [[Linux_排障索引]]
