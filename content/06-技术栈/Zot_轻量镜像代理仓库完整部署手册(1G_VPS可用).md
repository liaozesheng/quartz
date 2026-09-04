# Zot 轻量镜像代理仓库 完整部署手册（1G VPS可用｜HTTPS｜域名鉴权｜代理缓存）

## 一、项目简介

针对 **1G 内存海外 VPS** 无法部署 Harbor 的痛点，使用 CNCF 开源轻量镜像仓库 Zot 替代。

实现能力：

- ✅ 代理缓存 Docker Hub / GHCR 镜像，国内机器加速 pull

- ✅ 支持按需缓存（onDemand），极度节省内存

- ✅ 自定义域名 \+ Let’s Encrypt 自动 HTTPS 证书

- ✅ 账号密码登录验证（禁止匿名拉取，和 Harbor 一致）

- ✅ 极低资源占用，1G 内存 VPS 稳定运行

本次部署域名：`zot.liaozesheng.lol`

## 二、前置准备

### 1\. 环境要求

- 海外 KVM VPS（1G 内存即可）

- 已安装 Docker \& Docker Compose

- 域名托管在 Cloudflare

### 2\. Cloudflare 前置配置

#### 2\.1 创建 CF API Token（用于自动签证书）

CF 后台 → 个人资料 → API 令牌 → 创建令牌

- 模板：编辑区域 DNS

- 权限：区域\-DNS\-编辑、区域\-区域\-读取

- 作用域：仅你的域名 `liaozesheng.lol`

保存拿到：`CF_Token`、域名 `CF_Zone_ID`

#### 2\.2 域名解析记录（关键）

添加 A 记录：

- 名称：`zot`

- IPv4：VPS 公网 IP

- 代理状态：**灰色仅 DNS（务必关闭 CF CDN 代理）**

❗ 开启黄云会导致 Docker 镜像推拉报错、断点异常

## 三、安装 acme\.sh 自动证书工具

### 1\. 安装 acme\.sh

```bash
curl https://get.acme.sh | sh
source ~/.bashrc
acme.sh --set-default-ca --server letsencrypt
```

### 2\. 配置 CF 环境变量

替换为你自己的 Token 和 ZoneID

```bash
export CF_Token="你的CF_API_Token"
export CF_Zone_ID="你的域名Zone_ID"
```

### 3\. 签发 ECC 证书（轻量快速）


```bash
acme.sh --issue --dns dns_cf -d zot.liaozesheng.lol --keylength ec-256
```

### 4\. 安装证书到固定目录 \+ 自动续签重启

```bash
mkdir -p /opt/zot/certs

acme.sh --install-cert -d zot.liaozesheng.lol \
--key-file       /opt/zot/certs/privkey.pem  \
--fullchain-file /opt/zot/certs/fullchain.pem \
--reloadcmd     "docker restart zot"
```

优势：证书到期自动续签，自动重启 Zot 生效

## 四、配置 Zot 账号密码认证（无匿名访问）

Zot 不支持明文密码，必须使用 bcrypt 哈希，**无需安装 htpasswd 工具**，Docker 一键生成

### 一键生成密码文件（自定义账号密码）

替换 `admin` 用户名、`你的密码` 为自己的信息

```bash
docker run --rm --entrypoint htpasswd httpd:2.4-alpine -Bbn admin "你的密码" > /opt/zot/htpasswd
```

## 五、Zot 完整配置文件

### 1\. /opt/zot/config\.json

功能：HTTPS \+ 登录鉴权 \+ DockerHub/GHCR 按需代理缓存 \+ WebUI

```json
{
  "distSpecVersion": "1.1.1",
  "storage": {
    "rootDirectory": "/var/lib/zot"
  },
  "http": {
    "address": "0.0.0.0",
    "port": 443,
    "realm": "zot-registry",
    "compat": ["docker2s2"],
    "tls": {
      "cert": "/etc/zot/certs/fullchain.pem",
      "key": "/etc/zot/certs/privkey.pem"
    },
    "auth": {
      "htpasswd": {
        "path": "/etc/zot/htpasswd"
      },
      "failDelay": 5
    }
  },
  "log": {
    "level": "info"
  },
  "extensions": {
    "ui": {
      "enable": true
    },
    "search": {
      "enable": true
    },
    "sync": {
      "enable": true,
      "registries": [
        {
          "urls": ["https://registry-1.docker.io"],
          "onDemand": true,
          "tlsVerify": true,
          "preserveDigest": true,
          "maxRetries": 2,
          "retryDelay": "30s",
          "content": [
            {
              "prefix": "**"
            }
          ]
        },
        {
          "urls": ["https://ghcr.io"],
          "onDemand": true,
          "tlsVerify": true,
          "preserveDigest": true,
          "maxRetries": 2,
          "retryDelay": "30s",
          "content": [
            {
              "prefix": "**"
            }
          ]
        },
        {
          "urls": ["https://gcr.io"],
          "onDemand": true,
          "tlsVerify": true,
          "preserveDigest": true,
          "maxRetries": 2,
          "retryDelay": "30s",
          "content": [
            {
              "prefix": "**"
            }
          ]
        },
        {
          "urls": ["https://registry.redhat.io"],
          "onDemand": true,
          "tlsVerify": true,
          "preserveDigest": true,
          "maxRetries": 2,
          "retryDelay": "30s",
          "content": [
            {
              "prefix": "**"
            }
          ]
        },
        {
          "urls": ["https://quay.io"],
          "onDemand": true,
          "tlsVerify": true,
          "preserveDigest": true,
          "maxRetries": 2,
          "retryDelay": "30s",
          "content": [
            {
              "prefix": "**"
            }
          ]
        }
      ]
    },
    "scrub": {
      "interval": "12h"
    }
  }
}
```

### 2\. /opt/zot/docker\-compose\.yaml

```yaml
version: "3.8"
services:
  zot:
    image: ghcr.io/project-zot/zot-linux-amd64:v2.1.18
    container_name: zot
    restart: always
    ports:
      - "443:443"
    volumes:
      - ./config.json:/etc/zot/config.json
      - ./zot-data:/var/lib/zot
      - /opt/zot/certs:/etc/zot/certs:ro
      - /opt/zot/htpasswd:/etc/zot/htpasswd:ro
```

## 六、启动服务

```bash
cd /opt/zot
docker compose down && docker compose up -d

# 查看启动日志
docker logs -f zot
```

出现 `listening on :443` 即为启动成功

## 七、客户端使用方法（国内机器）

### 1\. 登录私有仓库（必须登录，禁止匿名）

```bash
docker login zot.liaozesheng.lol -u admin
```

### 2\. 拉取代理镜像

```bash
# 拉取 docker hub 镜像
docker pull zot.liaozesheng.lol/library/nginx:alpine
docker pull zot.liaozesheng.lol/library/alpine

# 拉取 gcr.io 镜像
docker pull zot.liaozesheng.lol/gcr.io/google-containers/pause:3.9

# 拉取 quay.io 镜像
docker pull zot.liaozesheng.lol/quay.io/coreos/etcd:v3.5.12
```

### 核心机制说明（重点）

- Zot `onDemand: true` 为**后台异步缓存**

- 第一次拉取新镜像提示 `not found` 是正常现象

- 等待 Zot 后台同步完成后，第二次拉取即可成功，后续走本地缓存极速访问

## 八、日常运维命令

```bash
# 重启服务
docker restart zot

# 查看实时日志
docker logs -f zot

# 手动触发证书续签
acme.sh --cron

# 新增用户（无需重启服务）
htpasswd -B /opt/zot/htpasswd 新用户名
```

## 九、关键避坑总结

1. **禁止开启 CF 黄色 CDN 代理**，必须灰色仅 DNS

2. 证书命令必须用英文半角横线，全角符号会签发失败

3. Zot 无明文密码，必须 bcrypt 哈希，可 Docker 生成无需装工具

4. 开启认证后，所有推拉、访问 WebUI 必须登录，安全性等同 Harbor

5. 1G 内存 VPS 完美适配，无 OOM 崩溃，远优于 Harbor

6. 首次拉取新镜像报错 not found 为正常异步缓存机制

## 十、访问 Web 管理界面

浏览器打开：`https://zot.liaozesheng.lol`，输入账号密码即可查看所有缓存镜像、Tag 记录

## 十一、磁盘空间管理｜镜像清理 \& 自动回收（适配20G小SSD）

**核心禁忌**：严禁手动零散删除 `zot-data` 内部文件，会破坏元数据，导致 Zot 损坏、无法启动。

**核心原理**：Web/命令删除镜像 Tag 仅删除标签，底层镜像层（blob）不会立刻释放；必须开启 **GC垃圾回收**清理无引用 blob，磁盘才会真正释放。

### 1、开启 GC 垃圾回收（必配）

作用：删除镜像后，延时自动回收无用镜像层，释放磁盘空间，不影响服务运行。

更新完整 `config.json`，新增 `gc`、`retention` 自动过期清理策略（小磁盘核心配置）：

```json
{
  "distSpecVersion": "1.1.1",
  "storage": {
    "rootDirectory": "/var/lib/zot"
  },
  "http": {
    "address": "0.0.0.0",
    "port": 443,
    "realm": "zot-registry",
    "compat": ["docker2s2"],
    "tls": {
      "cert": "/etc/zot/certs/fullchain.pem",
      "key": "/etc/zot/certs/privkey.pem"
    },
    "auth": {
      "htpasswd": {
        "path": "/etc/zot/htpasswd"
      },
      "failDelay": 5
    }
  },
  "log": {
    "level": "info"
  },
  "extensions": {
    "ui": {
      "enable": true
    },
    "search": {
      "enable": true
    },
    "gc": {
      "enable": true,
      "gcDelay": "10m"
    },
    "retention": {
      "dryRun": false,
      "policies": [
        {
          "repositories": ["**"],
          "deleteUntagged": true,
          "keepTags": [
            {
              "pulledWithin": "168h"
            }
          ]
        }
      ]
    },
    "sync": {
      "enable": true,
      "registries": [
        {
          "urls": ["https://registry-1.docker.io"],
          "onDemand": true,
          "tlsVerify": true,
          "preserveDigest": true,
          "maxRetries": 2,
          "retryDelay": "30s",
          "content": [
            {
              "prefix": "**"
            }
          ]
        },
        {
          "urls": ["https://ghcr.io"],
          "onDemand": true,
          "tlsVerify": true,
          "preserveDigest": true,
          "maxRetries": 2,
          "retryDelay": "30s",
          "content": [
            {
              "prefix": "**"
            }
          ]
        },
        {
          "urls": ["https://gcr.io"],
          "onDemand": true,
          "tlsVerify": true,
          "preserveDigest": true,
          "maxRetries": 2,
          "retryDelay": "30s",
          "content": [
            {
              "prefix": "**"
            }
          ]
        },
        {
          "urls": ["https://registry.redhat.io"],
          "onDemand": true,
          "tlsVerify": true,
          "preserveDigest": true,
          "maxRetries": 2,
          "retryDelay": "30s",
          "content": [
            {
              "prefix": "**"
            }
          ]
        },
        {
          "urls": ["https://quay.io"],
          "onDemand": true,
          "tlsVerify": true,
          "preserveDigest": true,
          "maxRetries": 2,
          "retryDelay": "30s",
          "content": [
            {
              "prefix": "**"
            }
          ]
        }
      ]
    },
    "scrub": {
      "interval": "12h"
    }
  }
}
```

策略说明：

- `gcDelay:10m`：删除镜像后等待10分钟再回收镜像层，避免传输中误删

- `pulledWithin:168h`：自动清理 **7天无访问** 的缓存镜像，永久防止磁盘爆满

- 清理后再次pull会自动重新异步缓存，业务无感知

生效命令：

```bash
cd /opt/zot
docker compose down && docker compose up -d
```

### 2、手动删除镜像（WebUI 可视化操作）

1. 登录 Zot WebUI：`https://zot.liaozesheng.lol`

2. 进入对应仓库，选中不需要的镜像 Tag 删除

3. 删除后等待10分钟，GC自动回收磁盘空间

### 3、命令行删除镜像（精准清理）

OCI 规范：必须删除镜像摘要（digest）才能释放磁盘，仅删标签不生效。

```bash
# 1、查询仓库所有tag
curl -u 用户名:密码 https://zot.liaozesheng.lol/v2/library/nginx/tags/list

# 2、获取镜像digest
curl -u 用户名:密码 \
-H "Accept: application/vnd.docker.distribution.manifest.v2+json" \
-I https://zot.liaozesheng.lol/v2/library/nginx/manifests/alpine

# 3、根据digest删除镜像
curl -u 用户名:密码 -X DELETE \
https://zot.liaozesheng.lol/v2/library/nginx/manifests/sha256:xxx
```

### 4、紧急磁盘爆满兜底方案（代理缓存专用）

若磁盘100%爆满、服务异常，可一键清空所有缓存（仅代理缓存场景可用，无自定义私有镜像可放心执行）：

```bash
cd /opt/zot
docker compose down
rm -rf ./zot-data/*
docker compose up -d
```

效果：瞬间释放全部磁盘空间，后续拉取镜像会自动重新缓存。

### 5、查看磁盘占用

```bash
# 查看Zot总占用
du -sh /opt/zot/zot-data

# 查看细分目录占用
du -h --max-depth=2 /opt/zot/zot-data
```

### 6、磁盘管理最终总结

- 小磁盘核心：**开启GC\+7天自动清理策略**，无需手动维护

- 禁止手动删零碎文件，只通过Web/API删除镜像

- 代理缓存可随意清空，不影响业务可用性

- 自动过期清理完美适配20G SSD长期运行
