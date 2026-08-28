# npm安装
```bash
npm config list
npm config set registry https://registry.npmmirror.com

npm install -g @anthropic-ai/claude-code --registry=https://registry.npmmirror.com

command -v claude
```

# VSCODE插件安装
个人喜欢这种方式，编辑或者对话效果都比较好。

vscode中的Claude code和命令行cli完全没关系，是各自都有一套二进制文件，npm是维护在node_modules中， 而vscode是维护在扩展中。但是两者都是使用一套cluade code的用户配置文件，在用户级目录 `.claude` 中。 另外还有一个claude 的UI文件 为 `.claude.json`

个人喜好只安装vscode插件，不装npm包，保持环境整洁。

>[!tips] 离线下载VSCODE 插件
> 注意架构信息，一般选择 `win-32-x64` 架构

```bash
https://marketplace.visualstudio.com/_apis/public/gallery/publishers/anthropic/vsextensions/claude-code/2.1.247/vspackage?targetPlatform=win32-x64

```

# Deepseek 官方用法
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

# opencode Go 订阅用法
目前opencode go订阅首月半价活动已下线，已恢复原价10美元/月。

opencode go 目前已经提供了response 、 anthropic、chat completion等格式。

所以opencode go的订阅可以直接通过环境变量的设置让claude code直接调用opencode go提供的模型服务。不需要第三方 cc-switch的格式转换了。

>[!danger] 注意
> `opencode go` 的 `anthropic` 响应格式的baseURL 不带 `/v1` 

这里提供一个参考:
```json
{
  "env": {
    "ANTHROPIC_API_KEY": "sk-**********************************************",
    "ANTHROPIC_BASE_URL": "https://opencode.ai/zen/go",
    "ANTHROPIC_DEFAULT_FABLE_MODEL": "deepseek-v4-flash[1M]",
    "ANTHROPIC_DEFAULT_FABLE_MODEL_NAME": "deepseek-v4-flash",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-v4-flash",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-v4-flash[1M]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL_NAME": "deepseek-v4-flash",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-v4-flash[1M]",
    "ANTHROPIC_DEFAULT_SONNET_MODEL_NAME": "deepseek-v4-flash",
    "ANTHROPIC_MODEL": "deepseek-v4-flash",
    "DISABLE_AUTOUPDATER": "1"
  },
  "includeCoAuthoredBy": false,
  "permissions": {
    "allow": [
      "WebSearch"
    ]
  }
}

```

>[!warning] 注意
>首次进入时，**Claude**询问是否使用自定义的`API_KEY` , 选择 `YES` ，就可以进入了
>如果，选择了`NO` ，**claude**就会一直提示`/login` 要你登录
>需要更改 `.claude.json` 这个文件

关键在于这一段配置，需要将你的key标识放在`approved`  中，而不是`rejected` 
```json
{
  "numStartups": 4,
  "installMethod": "global",
  "customApiKeyResponses": {
    "approved": [
      "VPt2uh1t8nKJAZiGcmtR"
    ],
    "rejected": []
  },
```
