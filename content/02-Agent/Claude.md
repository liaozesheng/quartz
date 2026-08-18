## 安装
```bash
npm config list
npm config set registry https://registry.npmmirror.com

npm install -g @anthropic-ai/claude-code --registry=https://registry.npmmirror.com

command -v claude
```
## 配置环境变量
>[!warn] 警告
>Windows 和 Linux 系统使用不同的方式配置环境变量
```bash
[Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", "https://api.deepseek.com/anthropic", "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", "sk-**********************", "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_MODEL", "deepseek-v4-flash", "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_DEFAULT_OPUS_MODEL", "deepseek-v4-pro", "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_DEFAULT_SONNET_MODEL", "deepseek-v4-pro", "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_DEFAULT_HAIKU_MODEL", "deepseek-v4-flash", "User")
[Environment]::SetEnvironmentVariable("CLAUDE_CODE_SUBAGENT_MODEL", "deepseek-v4-flash", "User")
[Environment]::SetEnvironmentVariable("CLAUDE_CODE_EFFORT_LEVEL", "max", "User")
[Environment]::SetEnvironmentVariable("CLAUDE_CODE_AUTO_COMPACT_WINDOW", "786432", "User")
```

```bash
vim ~/.bashrc

export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
export ANTHROPIC_AUTH_TOKEN=sk-********************************
export ANTHROPIC_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_OPUS_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_SONNET_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_HAIKU_MODEL=deepseek-v4-flash
export CLAUDE_CODE_SUBAGENT_MODEL=deepseek-v4-flash
export CLAUDE_CODE_EFFORT_LEVEL=max
export CLAUDE_CODE_AUTO_COMPACT_WINDOW=786432

source ~/.bashrc
```
