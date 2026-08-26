---
title: Python UV 与 pip Windows 开发环境配置
tags:
  - Python
  - Windows
  - 部署
category: 开发环境
status: active
updated: 2026-06-23
---

# Python UV 与 pip Windows 开发环境配置

## 适用场景

这篇笔记用于在 Windows 10/11 的 PowerShell 或 CMD 中安装 Python、UV，配置国内包索引，并管理项目虚拟环境和依赖。

> [!tip] 推荐组合
> 新项目优先使用 UV 的 `pyproject.toml + uv.lock` 工作流；传统项目保留 `requirements.txt` 时，可以使用 `uv pip`，也可以通过 `py -m pip` 操作。不要直接使用无法确认归属的裸 `pip` 命令。

## 检查当前环境

在 PowerShell 中执行：

```powershell
py --version
python --version
py -0p
Get-Command python -All
Get-Command pip -All
```

- `py` 是 Windows Python Launcher，适合在安装了多个 Python 版本时选择解释器。
- `py -0p` 可以显示已注册的 Python 版本和路径。
- 如果 `python` 打开 Microsoft Store，通常是 Windows 的“应用执行别名”抢占了命令；可以优先使用 `py`，或在系统设置中关闭对应别名。

## 安装 UV

使用 Astral 官方 PowerShell 安装脚本：

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

关闭并重新打开终端后验证：

```powershell
uv --version
uv python list
```

如果当前终端仍提示找不到 `uv`，先重新打开 PowerShell，再检查：

```powershell
Get-Command uv -All
$env:Path -split ';'
```

## UV 国内镜像配置

Windows 用户级配置文件位于：

```text
%APPDATA%\uv\uv.toml
```

在 PowerShell 中创建目录并打开配置文件：

```powershell
New-Item -ItemType Directory -Force "$env:APPDATA\uv"
notepad "$env:APPDATA\uv\uv.toml"
```

写入：

```toml
# Python 解释器下载镜像；属于第三方镜像，异常时删除本项并回退官方源。
python-install-mirror = "https://registry.npmmirror.com/-/binary/python-build-standalone/"
concurrent-downloads = 16

[[index]]
name = "tsinghua"
url = "https://pypi.tuna.tsinghua.edu.cn/simple"
default = true
```

> [!warning] 配置文件不要混用
> UV 不读取 `%APPDATA%\pip\pip.ini` 作为自身配置。UV 和 pip 应分别配置，排障时也要确认实际执行的是 `uv`、`uv pip` 还是 `py -m pip`。

临时指定 UV 索引：

```powershell
uv pip install --index-url https://pypi.tuna.tsinghua.edu.cn/simple requests
```

查看 UV 实际缓存位置：

```powershell
uv cache dir
```

## pip 国内镜像配置

### 推荐：使用 pip config

使用 `py -m pip` 可以明确调用 Python Launcher 所选解释器中的 pip：

```powershell
py -m pip install --upgrade pip
py -m pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
py -m pip config set global.timeout 120
py -m pip config list -v
```

Windows 当前用户的 pip 配置文件通常位于：

```text
%APPDATA%\pip\pip.ini
```

等价的文件内容为：

```ini
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple
timeout = 120
```

> [!warning] 不要随意配置 trusted-host
> 国内镜像已经提供 HTTPS，通常不需要 `trusted-host`。只有明确存在企业代理或证书链问题，并理解其安全影响时才考虑使用。

### 临时使用指定镜像

```powershell
py -m pip install -i https://pypi.tuna.tsinghua.edu.cn/simple requests
```

查看 pip 的配置来源、缓存和解释器归属：

```powershell
py -m pip config debug
py -m pip cache dir
py -c "import sys; print(sys.executable)"
```

## 新项目：使用 UV 项目模式

```powershell
uv init my-project
Set-Location my-project

uv python install 3.12
uv add fastapi uvicorn

uv run python main.py
uv sync --locked
```

项目中的职责划分：

- `pyproject.toml`：声明项目元数据和直接依赖。
- `uv.lock`：保存解析后的完整依赖图，由 UV 管理并提交到版本库。
- `.venv`：本机虚拟环境，不提交到版本库。

## 老项目：requirements 工作流

### 使用 UV

```powershell
uv venv
uv pip sync requirements.txt
```

如果项目只有人工维护的直接依赖列表，建议使用 `requirements.in` 生成固定版本：

```powershell
uv pip compile requirements.in -o requirements.txt
uv pip sync requirements.txt
```

### 使用原生 venv 与 pip

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

直接调用虚拟环境中的 `python.exe -m pip`，即使未激活环境，也不会把依赖误装到全局 Python。

## Windows 虚拟环境操作

### UV：通常无需激活

```powershell
uv run python main.py
uv run pytest
```

### PowerShell 激活

```powershell
.\.venv\Scripts\Activate.ps1
deactivate
```

### CMD 激活

```bat
.venv\Scripts\activate.bat
deactivate
```

如果 PowerShell 因执行策略拒绝运行 `Activate.ps1`，优先选择 `uv run` 或直接调用 `.venv\Scripts\python.exe`。仅需在当前终端临时放行时可执行：

```powershell
Set-ExecutionPolicy -Scope Process Bypass
```

> [!important] 执行策略范围
> `-Scope Process` 只影响当前 PowerShell 进程，关闭终端后失效。不要为了激活虚拟环境直接修改整台机器的执行策略。

## 本地包与可选依赖

PowerShell 可以使用单引号保护 extras 语法：

```powershell
uv pip install -e 'packages/markitdown[all]'
```

在 CMD 中使用双引号：

```bat
uv pip install -e "packages/markitdown[all]"
```

`[all]` 表示安装包元数据中名为 `all` 的可选依赖组，不是遍历目录。

## 多 Python 版本管理

使用 UV：

```powershell
uv python list
uv python install 3.11 3.12
uv venv --python 3.12
uv run --python 3.12 python --version
```

使用 Windows Python Launcher：

```powershell
py -0p
py -3.11 --version
py -3.12 -m pip --version
```

## 常见问题

| 问题 | 原因 | 处理方式 |
|---|---|---|
| `uv` 安装后提示不是命令 | 当前终端尚未刷新 PATH | 重新打开终端，再用 `Get-Command uv -All` 检查 |
| `python` 跳转 Microsoft Store | 应用执行别名抢占命令 | 使用 `py`，或关闭系统中的 Python 应用执行别名 |
| `Activate.ps1` 被禁止运行 | PowerShell 执行策略限制 | 优先使用 `uv run`；必要时仅对当前进程设置 `Bypass` |
| 包安装成功但程序仍提示缺失 | pip 对应了另一个 Python | 使用 `.venv\Scripts\python.exe -m pip` 并检查 `sys.executable` |
| UV 已配置镜像但 pip 仍走官方源 | UV 与 pip 配置相互独立 | 分别检查 `uv.toml` 与 `pip config debug` |
| 安装包时要求 C++ 编译器 | 没有适用的预编译 wheel | 优先升级 pip/换兼容 Python 版本，确需源码编译时安装 Visual Studio Build Tools |
| 镜像出现包缺失或同步延迟 | 镜像尚未同步完成 | 临时切回官方 PyPI，确认后再恢复镜像 |

## 推荐的项目检查命令

```powershell
uv --version
uv python list
uv run python -c "import sys; print(sys.executable); print(sys.version)"
uv pip list
```

使用 pip 工作流时：

```powershell
.\.venv\Scripts\python.exe -c "import sys; print(sys.executable); print(sys.version)"
.\.venv\Scripts\python.exe -m pip --version
.\.venv\Scripts\python.exe -m pip check
```

## 相关笔记

- [[Python_UV_与_WSL2_开发环境实践]]
- [[技术栈索引]]

## 官方资料

- [UV 安装](https://docs.astral.sh/uv/getting-started/installation/)
- [UV 配置文件](https://docs.astral.sh/uv/configuration/files/)
- [UV 项目结构](https://docs.astral.sh/uv/concepts/projects/layout/)
- [UV 锁定 requirements](https://docs.astral.sh/uv/pip/compile/)
- [pip 配置文件](https://pip.pypa.io/en/stable/topics/configuration/)
- [Python venv](https://docs.python.org/3/library/venv.html)
