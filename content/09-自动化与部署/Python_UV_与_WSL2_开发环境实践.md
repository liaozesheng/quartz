---
title: Python UV 与 WSL2 开发环境实践
tags:
  - Python
  - Linux
  - 部署
category: 开发环境
status: active
updated: 2026-06-23
---

# Python UV 与 WSL2 开发环境实践

## 适用场景

这篇笔记用于在 WSL2 中使用 UV 管理 Python 版本、虚拟环境和项目依赖，同时保留对传统 `requirements.txt` 项目的兼容方式。

> [!tip] 选择原则
> 新项目优先采用 `pyproject.toml + uv.lock`；尚未迁移的老项目使用 `uv pip compile` 和 `uv pip sync`。系统依赖仍由 `apt` 管理。

## UV 的定位

UV 是 Astral 使用 Rust 编写的 Python 工具链，可覆盖常见的 Python 安装、虚拟环境、依赖解析、项目同步、工具运行和包发布场景。

UV 创建的 `.venv` 仍是标准 Python 虚拟环境。它简化了环境管理，但不替代 Conda 对 CUDA、非 Python 二进制库等环境的管理，也不替代 `apt` 等系统包管理器。

## 安装与验证

在 WSL2 中安装 UV：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

重新打开终端后验证：

```bash
uv --version
```

## 国内镜像配置

WSL/Linux 的用户级配置文件为 `~/.config/uv/uv.toml`：

```toml
# Python 解释器下载镜像；这是第三方镜像，异常时删除本项并回退官方源。
python-install-mirror = "https://registry.npmmirror.com/-/binary/python-build-standalone/"
concurrent-downloads = 16

[[index]]
name = "tsinghua"
url = "https://pypi.tuna.tsinghua.edu.cn/simple"
default = true
```

> [!warning] TOML 配置顺序
> `python-install-mirror` 和 `concurrent-downloads` 是顶层设置，必须写在 `[[index]]` 前面；写在其后会被 TOML 解析为该索引表的字段。

临时指定索引可以使用：

```bash
uv pip install --index-url https://pypi.tuna.tsinghua.edu.cn/simple requests
```

## 新项目：使用项目模式

```bash
# 创建项目
uv init my-project
cd my-project

# 安装指定 Python 版本
uv python install 3.12

# 添加依赖并更新 pyproject.toml、uv.lock
uv add fastapi uvicorn

# 运行命令；通常不需要手动激活虚拟环境
uv run python main.py

# 按锁文件同步环境，且不允许命令修改锁文件
uv sync --locked
```

项目模式下：

- `pyproject.toml` 声明项目及直接依赖。
- `uv.lock` 记录解析后的完整依赖图，由 UV 管理，不手工编辑。
- `uv sync` 使项目环境与声明和锁文件保持一致。

## 老项目：保留 requirements 工作流

### 已有完整 requirements.txt

如果文件已经固定了直接依赖和间接依赖版本，可直接同步环境：

```bash
uv venv
uv pip sync requirements.txt
```

### 只有直接依赖列表

建议将人工维护的直接依赖放在 `requirements.in`，再生成固定版本的 `requirements.txt`：

```bash
uv pip compile requirements.in -o requirements.txt
uv pip sync requirements.txt
```

也可以从 `setup.py` 或 `pyproject.toml` 生成：

```bash
uv pip compile setup.py -o requirements.txt
uv pip compile pyproject.toml -o requirements.txt
```

> [!important] 不要混淆两种锁定方式
> `uv lock` 属于 UV 项目模式，会在 `pyproject.toml` 旁维护 `uv.lock`。没有迁移为 UV 项目的老仓库，应使用 `uv pip compile` 生成固定版本的 `requirements.txt`，而不是假定 `uv lock` 能直接处理任意旧目录。

### 关于 pip freeze

`pip freeze` 会输出当前环境中已安装的包，通常包含直接依赖和间接依赖。一个完整固定版本的文件并不是“只锁主包”。它的局限主要是：

- 它只是当前环境的快照，没有区分人工声明的直接依赖与解析得到的间接依赖。
- 跨 Python 版本、操作系统或 CPU 架构时，快照未必通用。
- 环境中无关的包也可能被一起写入。
- 它不像 `uv.lock` 那样作为项目级、跨平台的结构化锁文件管理。

因此，新项目使用 `pyproject.toml + uv.lock`；传统流程使用 `requirements.in + uv pip compile`，会比反复手工维护 `pip freeze` 更清晰。

## 本地包与可选依赖

```bash
uv pip install -e 'packages/markitdown[all]'
```

- `packages/markitdown`：本地 Python 包目录。
- `-e`：以 editable 模式安装，源码修改后无需重复安装。
- `[all]`：安装该包在项目元数据中声明的 `all` 可选依赖组；它不是遍历目录。

按需安装其他可选依赖时，名称必须以目标包实际声明的 extra 为准：

```bash
uv pip install 'package-name[pdf,ocr]'
```

## 虚拟环境常用操作

UV 命令通常可以直接定位项目的 `.venv`：

```bash
uv run python main.py
uv run pytest
```

需要进入环境时：

```bash
source .venv/bin/activate
deactivate
```

虚拟环境主要改变 `python`、`pip` 和已安装命令的解析位置，不影响 `ls`、`cd`、`apt` 等系统命令。

## WSL2 中的系统依赖

FFmpeg 属于系统工具，应使用系统包管理器安装：

```bash
sudo apt update
sudo apt install -y ffmpeg
ffmpeg -version
```

不建议为了单个 Python 项目直接全局替换 Ubuntu 软件源。确有下载问题时，应先确认 WSL 发行版和版本，再按对应镜像站说明配置源。

### apt 或 dpkg 被中断

先确认没有其他包管理进程仍在运行：

```bash
ps aux | grep -E '[a]pt|[d]pkg'
```

随后修复未完成的配置和依赖：

```bash
sudo dpkg --configure -a
sudo apt --fix-broken install
sudo apt clean
sudo apt autoremove
```

> [!danger] 不要直接删除锁文件
> 不要把 `pkill -9 apt` 或删除 `/var/lib/dpkg/lock*` 当成常规步骤。只有确认没有 `apt`、`apt-get` 或 `dpkg` 进程运行，并确定锁文件已经陈旧时，才进一步处理锁问题。

## WSL2 环境备份与复制

在 PowerShell 中执行：

```powershell
# 查看准确的发行版名称
wsl --list --verbose

# 停止发行版并导出
wsl --terminate Ubuntu-22.04
wsl --export Ubuntu-22.04 D:\WSL_Backup\ubuntu-base.tar

# 导入为另一套独立环境
wsl --import Ubuntu-Proj1 D:\WSL_Env\Ubuntu-Proj1 D:\WSL_Backup\ubuntu-base.tar --version 2

# 删除不再使用的发行版；此操作会永久删除该实例
wsl --unregister Ubuntu-Proj1
```

> [!warning] 导入后的默认用户
> `wsl --import` 创建的发行版可能默认以 `root` 登录，需要在 `/etc/wsl.conf` 中配置默认用户。执行 `wsl --unregister` 前必须确认数据已经备份。

## WSL2 与虚拟机的边界

WSL2 适合 Python 开发、Docker/Kind/K3s 学习和常规 Operator 开发。以下场景更适合完整虚拟机或物理机：

- 复杂多网卡、网络拓扑或安全隔离实验。
- 内核模块、硬件直通和嵌入式开发。
- 大规模多节点性能与故障测试。

## 常见问题

| 问题 | 原因 | 处理方式 |
|---|---|---|
| `uv sync --locked` 报锁文件过期 | `pyproject.toml` 与 `uv.lock` 不一致 | 开发阶段执行 `uv lock` 或普通 `uv sync` 更新并提交锁文件 |
| 老项目执行 `uv add` 后出现项目文件 | 使用了项目模式 | 未计划迁移时改用 `uv pip install/compile/sync` |
| UV 下载 Python 很慢 | Python 独立发行包下载链路较慢 | 配置 `python-install-mirror`，异常时回退官方源 |
| 安装 Python 包后仍缺 FFmpeg | FFmpeg 是系统依赖 | 使用 `apt install ffmpeg` |
| `[all]` 没有效果 | 包没有声明名为 `all` 的 extra | 查看项目 `pyproject.toml` 中的 optional dependencies |

## 相关笔记

- [[WSL2_基本使用与常见踩坑]]
- [[Python_UV_与_pip_Windows_开发环境配置]]
- [[技术栈索引]]
- [[Linux_排障索引]]

## 官方资料

- [UV 项目结构](https://docs.astral.sh/uv/concepts/projects/layout/)
- [UV 锁定与同步](https://docs.astral.sh/uv/concepts/projects/sync/)
- [UV 锁定 requirements](https://docs.astral.sh/uv/pip/compile/)
- [UV 配置文件](https://docs.astral.sh/uv/configuration/files/)
- [Microsoft WSL 基本命令](https://learn.microsoft.com/windows/wsl/basic-commands)
