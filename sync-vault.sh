#!/bin/bash
# sync-vault.sh — 从 Obsidian vault 同步公开内容到 Quartz
# 用法: ./sync-vault.sh

set -e

# ========== 配置 ==========
# 本脚本所在目录的上层目录作为基准，推得 quartz 与 vault 路径。
# 默认约定 vault 与 quartz 位于同一父目录下，
# 也可通过环境变量 QUARTZ_DIR / VAULT_DIR 覆盖。
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
QUARTZ_DIR="${QUARTZ_DIR:-$SCRIPT_DIR}"
VAULT_DIR="${VAULT_DIR:-$BASE_DIR/obsidian-vault}"

# 代理配置文件路径（可选用 .sync-proxy.env，见 .sync-proxy.env.example）
PROXY_CONFIG="$SCRIPT_DIR/.sync-proxy.env"
# 默认代理为空 -> 直连；有配置文件时由 load_proxy_config 填充
HTTP_PROXY=""
HTTPS_PROXY=""
NO_PROXY=""

# 同步内容推送到哪个分支。推送到非 main 分支不会触发 GitHub Actions，
# 发布时再手动合并到 main（见 README 说明）。
SYNC_BRANCH="${SYNC_BRANCH:-develop}"

# 要同步的目录（vault 路径 → quartz 目标名）
# 不想同步的目录在下面注释掉即可
SYNC_DIRS=(
    "00-索引"
    "01-Linux基础知识"
    "02-Agent"
    "06-技术栈"
    "07-命令速查"
    "08-故障复盘"
    "09-自动化与部署"
)

# 需要排除的文件（在 SYNC_DIRS 中匹配）
EXCLUDE_FILES=(
    "个人局域网环境.md"
    "阿里云ACP考试"
    #"系统监控"
    #"Awesome"
    #"Hermes"
)

# ========== 函数 ==========
log() { echo -e "\033[36m→ $*\033[0m"; }
ok()  { echo -e "\033[32m✅ $*\033[0m"; }
err() { echo -e "\033[31m❌ $*\033[0m"; }

# 从 .sync-proxy.env 加载代理配置（若存在）。
# 支持 env 风格键值对，可用 # 注释，也支持:
#   HTTP_PROXY / HTTPS_PROXY / NO_PROXY
#   HTT2_PROXY 被忽略（防拼写错误误用）。
# 配置文件不存在或未配置代理 -> 保持直连（不设置任何代理参数）。
load_proxy_config() {
    if [ ! -f "$PROXY_CONFIG" ]; then
        log "未找到代理配置 $PROXY_CONFIG，将直接连接（直连）"
        return 0
    fi

    # 用 ignorecase 复用同一个键名匹配两种大小写写法
    while IFS='=' read -r key val || [ -n "$key" ]; do
        # 跳过注释与空行
        case "$key" in ""|\#*) continue ;; esac
        # 去掉键值两端的空白
        key="${key#"${key%%[![:space:]]*}"}"; key="${key%"${key##*[![:space:]]}"}"
        val="${val#"${val%%[![:space:]]*}"}"; val="${val%"${val##*[![:space:]]}"}"

        case "${key^^}" in
            HTTP_PROXY)  HTTP_PROXY="$val"  ;;
            HTTPS_PROXY) HTTPS_PROXY="$val" ;;
            NO_PROXY)    NO_PROXY="$val"    ;;
        esac
    done < "$PROXY_CONFIG"

    if [ -n "$HTTP_PROXY" ] || [ -n "$HTTPS_PROXY" ]; then
        ok "已从 $PROXY_CONFIG 加载代理配置"
    else
        log "代理配置为空，将直接连接（直连）"
    fi
}

# 根据是否配置代理，构造 git push 所需的额外参数。
# 返回（通过全局 GIT_PUSH_ARGS）：空表示直连；非空则是 -c 代理参数列表。
build_push_args() {
    GIT_PUSH_ARGS=()
    local -A args_set=()
    if [ -n "$HTTP_PROXY" ]; then
        GIT_PUSH_ARGS+=(-c "http.proxy=$HTTP_PROXY"); args_set[http]=1
    fi
    if [ -n "$HTTPS_PROXY" ]; then
        GIT_PUSH_ARGS+=(-c "https.proxy=$HTTPS_PROXY"); args_set[https]=1
    fi
    if [ -z "${args_set[https]+_}" ] && [ -n "$HTTP_PROXY" ]; then
        # HTTPS 未单独指定时，复用 http 代理
        GIT_PUSH_ARGS+=(-c "https.proxy=$HTTP_PROXY")
    fi
    if [ -n "$NO_PROXY" ]; then
        GIT_PUSH_ARGS+=(-c "http.no_proxy=$NO_PROXY" -c "https.no_proxy=$NO_PROXY")
    fi
}

# 确保工作区处于同步分支（默认 develop）上：
#   - 远程已存在 -> 检出并在需要时拉取以保持最新
#   - 远程/本地不存在 -> 基于最新 origin/main 创建
# 全程用当前 origin/main 兜底，避免 develop 落后于 main。
ensure_sync_branch() {
    cd "$QUARTZ_DIR" || exit 1
    git fetch --quiet origin

    if git show-ref --verify --quiet "refs/heads/$SYNC_BRANCH"; then
        git checkout --quiet "$SYNC_BRANCH"
        # 拉取远程同步分支的最新提交（多机场景下保险）
        git pull --quiet origin "$SYNC_BRANCH" 2>/dev/null || log "未跟踪远程，继续使用本地 $SYNC_BRANCH"
    elif git show-ref --verify --quiet "refs/remotes/origin/$SYNC_BRANCH"; then
        git checkout --quiet -b "$SYNC_BRANCH" "origin/$SYNC_BRANCH"
    else
        # 远程与本地都无此分支 -> 从最新 origin/main 创建
        git checkout --quiet main 2>/dev/null
        git pull --quiet origin main 2>/dev/null || true
        git checkout --quiet -b "$SYNC_BRANCH"
    fi

    ok "当前工作分支: $(git branch --show-current)（推送 target: origin/$SYNC_BRANCH）"
}

# ========== 1. 拉取最新 vault ==========
log "================$(date +'%y-%m-%d %H:%M:%S')==================="
log "拉取 quartz 最新内容"
cd "$QUARTZ_DIR" || exit 1
git pull --quiet origin main

log "拉取 obsidian-vault 最新内容..."
cd "$VAULT_DIR" || exit 1
git fetch origin
REMOTE_NEW=$(git log HEAD..origin/main --oneline)      # 远程领先本地的提交
LOCAL_NEW=$(git log origin/main..HEAD --oneline)       # 本地领先远程的提交

# 检查是否有变更：只要本地或远程任一侧有新提交，都视为需要同步
if [[ -n "$REMOTE_NEW" ]]; then
    git pull --quiet origin main
    ok "vault 已更新到 $(git log -1 --format='%h %s')"
    echo "$REMOTE_NEW"
elif [[ -n "$LOCAL_NEW" ]]; then
    LOCAL_COUNT=$(echo "$LOCAL_NEW" | wc -l | tr -d ' ')
    ok "vault 本地有 $LOCAL_COUNT 个未推送的提交，直接纳入同步"
    echo "$LOCAL_NEW"
else
    ok "vault没有变更，提前结束"
    exit 0
fi

# ========== 2. 同步目录到 Quartz content ==========
log "同步 ${#SYNC_DIRS[@]} 个目录到 Quartz..."

# 先清理旧内容（保留 index.md 和 .gitkeep）
for dir in "${SYNC_DIRS[@]}"; do
    target="$QUARTZ_DIR/content/$dir"
    if [ -d "$target" ]; then
        rm -rf "$target"
    fi
done

# 复制目录
for dir in "${SYNC_DIRS[@]}"; do
    src="$VAULT_DIR/$dir"
    dst="$QUARTZ_DIR/content/$dir"
    
    if [ ! -d "$src" ]; then
        err "源目录不存在: $src"
        continue
    fi
    
    cp -r "$src" "$dst"
    
    # 排除敏感文件
    for pattern in "${EXCLUDE_FILES[@]}"; do
        find "$dst" -type f -name "*${pattern}*" -delete 2>/dev/null || true
        find "$dst" -type d -name "*${pattern}*" -exec rm -rf {} + 2>/dev/null || true
    done
    
    count=$(find "$dst" -name "*.md" | wc -l)
    ok "$dir → $count 篇"
done

# ========== 3. 提交并推送（推送到同步分支，不触发部署） ==========
log "提交并推送（目标分支: $SYNC_BRANCH）..."

# 先确保工作区在同步分支上
ensure_sync_branch
cd "$QUARTZ_DIR"

# 检查是否有变更
if git diff --quiet && git diff --cached --quiet; then
    ok "没有变更，跳过推送"
    exit 0
fi

git add -A
git commit -m "sync: $(date '+%Y-%m-%d %H:%M') vault update"

# 加载代理配置并构造推送参数
load_proxy_config
build_push_args

# 使用代理（若配置）推送
if [ "${#GIT_PUSH_ARGS[@]}" -gt 0 ]; then
    log "通过代理推送: ${GIT_PUSH_ARGS[*]}"
    GIT_PUSH_ARGS+=("push")
else
    log "无代理，直接推送"
    GIT_PUSH_ARGS=("push")
fi
# 显式指定目标分支，避免依赖于当前分支的上游配置
GIT_PUSH_ARGS+=("origin" "$SYNC_BRANCH")
git "${GIT_PUSH_ARGS[@]}"

ok "推送成功！已同步到 origin/$SYNC_BRANCH（未触发部署）"
echo ""
echo "ℹ️  本机的 obsidian-vault 尚未部署到线上。"
echo "  要发布时，将 $SYNC_BRANCH 合并到 main 即可触发 GitHub Actions："
echo "      git merge $SYNC_BRANCH main  # 或创建 PR: $SYNC_BRANCH -> main"
echo "  🌐 部署后访问: https://liaozesheng.github.io"
