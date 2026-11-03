
## 安装
```bash
npm config list
npm config set registry https://registry.npmmirror.com

npm install -g @openai/codex --registry=https://registry.npmmirror.com

command -v codex
```

## 配置文件
```bash
# 使用deepseek的官方的脚本

bash <(curl -fsSL https://cdn.deepseek.com/api-docs/codex-deepseek-setup.sh)

irm https://cdn.deepseek.com/api-docs/codex-deepseek-setup-en.ps1 | iex
```

>[!note]
>注意，一定要注意model.json这个模型的定义文件

