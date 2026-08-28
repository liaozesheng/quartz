# 什么是Cloudflare？
Cloudflare是一家提供内容分发网络（CDN）服务的公司，它通过在全球各地部署服务器来加速网站和应用程序的访问速度。简单来说，Cloudflare就像是一个高速公路的出口，让网络数据包能够更快地到达目的地。

### 类比：快递服务
想象一下，你有一个网店，每天都有大量的包裹需要送到全国各地的顾客手中。如果你自己一个个送，不仅耗时耗力，而且成本高昂。这时候，你可以选择使用快递服务，他们有遍布全国的网点和高效的物流系统，可以帮你快速且经济地完成配送任务。

Cloudflare的服务就像是这样一个快递网络。它在全球有数百个数据中心，当用户访问你的网站时，数据会通过离用户最近的数据中心传输，大大减少了延迟，提高了访问速度。

### Cloudflare的主要功能
1. **加速网站加载速度**：通过CDN技术，Cloudflare可以将你的网站内容缓存到全球各地的服务器上，使用户能够从最近的服务器获取内容，从而加快网站的加载速度。
2. **提高安全性**：Cloudflare提供了多种安全功能，如DDoS攻击防护、Web应用防火墙（WAF）等，可以有效保护你的网站免受恶意攻击。
3. **优化SEO**：通过提高网站的访问速度和稳定性，Cloudflare有助于提升搜索引擎排名。
4. **简化DNS管理**：Cloudflare还提供DNS管理服务，使你可以轻松地配置和管理域名的DNS记录。

### 如何使用Cloudflare？
使用Cloudflare非常简单，只需按照以下步骤操作：

1. 注册并登录Cloudflare账户。
2. 输入你的网站域名，Cloudflare会扫描你的网站并提供优化建议。
3. 根据提示配置Cloudflare设置，如选择计划、启用CDN等。
4. 更新你的域名DNS记录，指向Cloudflare提供的DNS服务器。
5. 等待一段时间（通常为几分钟到几小时），Cloudflare会开始为你提供服务。

### 类比：换挡加速
想象一下你在开车，如果想要加速，你可以换到更高的挡位。同样地，使用Cloudflare就像是给你的网站换了一个更高的“挡位”，让它能够更快地响应用户的请求。



# Cloudflare Tunnel
### 建立cloudflare tunnel
① 安装 `cloudflared`

 Cloudflare 官方没直接支持 Rocky Linux 的仓库，不过我们可以用通用方式安装：  

```bash
# 下载 cloudflared 最新 rpm 包
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
# 下载不下来，可以用windows将github包先下载，再上传至服务器
mv cloudflared-linux-x86_64.rpm /usr/local/src/

# 安装
sudo dnf install -y ./cloudflared-linux-x86_64.rpm

```

 安装完成后，可以验证：  

```bash
cloudflared --version
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/46554067/1756865253410-9729c2f0-520f-4d52-ad59-955d0e10e12e.png)



② 登录 Cloudflare 账号  

```bash
cloudflared tunnel login

```

+ 它会打印一个 **URL**，复制到浏览器打开。
+ 登录 Cloudflare 账号后，选择你要操作的域名（`zesheng.lol`）。
+ 授权成功后，会在服务器 `/root/.cloudflared/` 下生成一个 `cert.pem` 文件（凭证）。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/46554067/1756865336945-c4a319bd-b12f-4bbc-8c9d-5f9ab0059167.png)



③ 创建隧道  

```bash
# 创建一个名为my-service的隧道
cloudflared tunnel create my-service

# 这会生成一个 JSON 凭证文件，例如：
/root/.cloudflared/xxxxxx.json

```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/46554067/1756865486150-478b97e8-2eaf-4b8a-b365-553539972fd0.png)



④ 绑定域名  

 把 `linux.zesheng.lol` 和隧道关联：  

```bash
cloudflared tunnel route dns my-service linux.zesheng.lol

```

 	执行后，Cloudflare 会自动在你的 DNS 管理里添加一条 CNAME，把 `linux.zesheng.lol` 指向 Cloudflare 内部的隧道地址。  

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/46554067/1756865690846-a02a79d2-18a8-4a8e-ba9e-2aa98901afb6.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/46554067/1756865583885-483babfe-5a90-4763-a3d4-70e83a40f889.png)



⑤ 配置回源  

 在 `/root/.cloudflared/config.yml` 写入：  

```bash
tunnel: my-service
credentials-file: /root/.cloudflared/xxxxxx.json

ingress:
  - hostname: linux.zesheng.lol
    service: http://localhost:8088  # 假设你的服务运行在 本机 8088 端口
  - service: http_status:404

```



⑥ 启动隧道  

```bash
# 测试运行，访问linux.zesheng.lol，看能否到达本机的http://localhost:8088
cloudflared tunnel --config ~/.cloudflared/config.yml ingress validate
# 运行成功了
cloudflared tunnel run my-service
```

 如果正常，可以注册为 systemd 服务，开机自启：  

```bash
sudo cloudflared service install

sudo systemctl enable --now cloudflared

systemctl status cloudflared

```



⑦浏览器访问效果

 Cloudflare 会自动通过 Tunnel 把请求转发到你服务器的 `localhost:8088`，**不会再触发阿里云备案拦截。**

```bash
http://linux.zesheng.lol

```

****

### **追加Cloudflare Tunnel配置**
**想在同一台服务器上，再让另一个服务（**`**localhost:9099**`**）通过 **`**bb.zesheng.lol**`** 访问。用 Cloudflare Tunnel 非常方便追加配置。核心思路是 在同一个隧道里增加一个 ingress 条目，或单独建一个隧道。  **



你想在同一台服务器上，再让另一个服务（`localhost:9099`）通过 `bb.zesheng.lol` 访问。用 **Cloudflare Tunnel** 非常方便追加配置。核心思路是 **在同一个隧道里增加一个 ingress 条目**，或单独建一个隧道。

---

**方法 A：在同一个隧道里追加 ingress（推荐）**

1️⃣ 编辑隧道配置文件

打开你现有的隧道配置 `/root/.cloudflared/config.yml`：

```yaml
tunnel: my-service
credentials-file: /root/.cloudflared/xxxxxxxx.json

ingress:
  - hostname: linux.zesheng.lol
    service: http://localhost:8088

  - hostname: web.zesheng.lol
    service: http://localhost:9099

  - service: http_status:404
```

解释：

+ **hostname**：访问的域名
+ **service**：本机对应服务地址（端口）
+ 最后的 `http_status:404` 用于匹配其它请求

---

2️⃣ DNS 设置

在 Cloudflare DNS 里为 `web.zesheng.lol` 添加一条 CNAME：

+ **Type:** CNAME
+ **Name:** web
+ **Target:** 会自动指向 `my-service.cfargotunnel.com`（如果你之前用了 `cloudflared tunnel route dns`，确认 CNAME 指向正确）
+ **Proxy status:** Proxied（橙色云）

注意：同一个隧道可以绑定多个域名，所以这个 CNAME 目标可以复用原来的隧道地址。

---

3️⃣ 重启隧道

更新配置后，需要重启 tunnel 才生效：

```bash
sudo systemctl restart cloudflared
```

或者如果你是直接用 `cloudflared tunnel run my-service`，就停止后重新运行。

---

4️⃣ 测试

在浏览器访问：

```plain
http://web.zesheng.lol
```

+ 请求会通过 Cloudflare → Tunnel → 本机 9099
+ 用户无需写端口，透明访问

---

**方法 B：单独创建一个新隧道**

+ 也可以单独为 `web.zesheng.lol` 创建新隧道（例如叫 `web-service`）
+ 优点：管理独立，互不干扰
+ 缺点：多了一个隧道进程，稍占资源

---

💡 **总结**

+ 同一个隧道：在 `config.yml` 追加 ingress 条目 → DNS CNAME 指向隧道 → 重启 tunnel
+ 新隧道：独立 tunnel + CNAME

### 删除多余的tunnel
①查看tunnel

```bash
cloudflared tunnel list
```

②查看tunnel信息

```bash
cloudflared tunnel info my-service
```

③删除tunnel

```bash
cloudflared tunnel delete my-service
```

# 托管域名
### 购买域名
目前我是在porkbun上购买的域名，花费大概在2美元1年

直接使用alipay支付宝支付，

`liaozesheng.lol`

### 交给cf托管
在cf上域名板块选择添加域名，将域名地址`liaozesheng.lol`添加进去之后，选择免费计划，自动检测。

将cf分配的nameservers替换掉porkbun上默认的nameservers。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/46554067/1787731921755-20314fc2-8aa7-4a68-874f-0db96f4bc652.png)

替换成功后，cf上重新检测等待结果就好，一般1小时左右。

