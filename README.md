# 🌱 数字花园

基于 [Quartz](https://quartz.jzhao.xyz/) 搭建的个人知识库，将 Obsidian 笔记发布为网站。

## 功能

- ✅ Obsidian Wikilinks 双链
- ✅ 反向链接 (Backlinks)
- ✅ 知识图谱 (Graph View)
- ✅ 全文搜索
- ✅ 深色模式
- ✅ 标签系统
- ✅ 自动部署到 GitHub Pages

## 本地开发

```bash
# 安装依赖
npm install --registry=https://registry.npmjs.org --include=dev

# 启动开发服务器
npx quartz build --serve

# 访问 http://localhost:8080
```

## 部署

推送到 `main` 分支后，GitHub Actions 自动构建并部署到 GitHub Pages。

```bash
git add .
git commit -m "update content"
git push
```

## 目录结构

```
content/          # 笔记内容（markdown 文件）
quartz.config.yaml  # 站点配置
quartz/           # Quartz 框架源码
.github/workflows/ # CI/CD 配置
```

## 配置

编辑 `quartz.config.yaml` 修改站点标题、语言、主题等。
