

## 证书文件的格式
证书文件有两种格式：

①PEM格式：<font style="background-color:#FBDE28;">.crt</font>  	<font style="background-color:#FBDE28;">.cer(windows)</font>	 <font style="background-color:#FBDE28;">.pem</font>	<font style="background-color:#FBDE28;">.key</font>	

②PKCS12格式：<font style="background-color:#8CCF17;">.p12</font>	<font style="background-color:#8CCF17;">.pfx</font>

## 将证书转为java的JKS密钥库
很多情况，java程序直接使用JKS 来存储证书，所以我们有需求将证书转为 JKS
```bash
唯一指定的官方工具是keytool

# 查看keytool版本
keytool --version

使用keytool将证书转为JKS格式有个限制,keytool只能接受将PKCS12格式的证书直接转为JKS格式,
也就是说如果证书是PEM格式的,需要先转为PKCS12格式再转为JKS格式

核心转换流程
crt/cer/pem + key → pfx/p12（openssl） → jks（keytool） ✅ 两步走
pfx/p12 → jks（keytool） ✅ 一步走


# 1. PEM转PKCS12  由于PKCS12也是如jks一样是个密钥库，所以需要输入密钥库的密码
openssl pkcs12 -export -in cert.crt -inkey private.key -out cert.pfx -name mycert

# 2. PKCS12转JKS（通用）
keytool -importkeystore -srckeystore cert.pfx -srcstoretype PKCS12 -destkeystore cert.jks -deststoretype JKS

# 3. 验证JKS有效性
keytool -list -v -keystore cert.jks
```

**PEM格式转为PKCS12格式的时候为什么要-inkey加入私钥?**
因为PKCS12格式的文件并不是像PEM格式的文件是单一的文件,而是一个完整的打包密钥库,公钥和私钥是成对存储的,也可以放入证书链。

==必须同时包含【证书公钥】 + 【证书私钥】的一体化文件==

==PKCS12 是公私钥一体化文件，必须同时包含公钥 (crt) 和私钥 (key)，缺一不可==

## 使用acme.sh来管理证书
#### 安装
```bash
git clone https://gitee.com/neilpang/acme.sh.git
cd acme.sh/
./acme.sh --install -m my@example.com
source .bashrc
```

#### 管理证书，申请证书
```bash
export Ali_Key="LTAI5tA********************"
export Ali_Secret="itvSmJ*************"

acme.sh --issue --dns dns_ali -d liaozesheng.cn -d *.liaozesheng.cn --force

#安装
acme.sh --install-cert -d *.liaozesheng.cn --key-file /etc/nginx/certs/*.liaozesheng.cn.key --fullchain-file /etc/nginx/certs/*.liaozesheng.cn.pem --reloadcmd "service nginx force-reload"
```

#### 查看定时任务
```bash
crontab -l
#

38 19 * * * "/root/.acme.sh"/acme.sh --cron --home "/root/.acme.sh" > /dev/null
```

## 📁 自建证书
>[!note] 私有根CA
>现在要做的是建立一个**私有根CA**，然后用这个根CA来签发GitLab的证书。这样做的好处是：只需要在客户端安装一次根证书，以后所有由这个根CA签发的证书都会被信任。

### 1. 准备工作目录
```bash
# 创建必要的目录结构
sudo mkdir -p /etc/pki/CA/{certs,crl,newcerts,private}
sudo mkdir -p /etc/pki/CA/requests  # 存放证书签名请求
sudo chmod 700 /etc/pki/CA/private

# 创建CA的必要索引文件
sudo touch /etc/pki/CA/index.txt
sudo echo 1000 > /etc/pki/CA/serial
```

### 2. 生成根CA的私钥和证书
#### 2.1 创建根CA配置文件
```bash
sudo nano /etc/pki/CA/root-ca.conf
```

```properties
[req]
default_bits = 4096
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_ca

[dn]
C = CN
ST = Beijing
L = Beijing
O = My Private CA
OU = IT
CN = My Private Root CA

[v3_ca]
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:TRUE, pathlen:0
keyUsage = critical, keyCertSign, cRLSign
```

#### 2.2 生成根CA私钥
```bash
cd /etc/pki/CA
sudo openssl genrsa -out private/root-ca.key 4096
sudo chmod 400 private/root-ca.key
```

#### 2.3 生成根CA证书（自签名）
```bash
sudo openssl req -new -x509 -days 3650 \
    -key private/root-ca.key \
    -out root-ca.crt \
    -config root-ca.conf
```

### 3. 为GitLab生成证书（由根CA签发）
#### 3.1 创建GitLab证书配置文件
```bash
sudo nano /etc/pki/CA/requests/gitlab.ext-216.com.conf
```

```properties
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = req_ext

[dn]
C = CN
ST = Beijing
L = Beijing
O = Your Organization
OU = IT
CN = gitlab.ext-216.com

[req_ext]
subjectAltName = @alt_names
keyUsage = keyEncipherment, dataEncipherment, digitalSignature
extendedKeyUsage = serverAuth

[alt_names]
DNS.1 = gitlab.ext-216.com
#DNS.2 = gitlab.local  # 如果有本地别名可以加上
#IP.1 = 你的服务器IP    # 如果有固定IP，可以加上
```

#### 3.2 创建CA签署配置文件（用于签发）
```bash
sudo nano /etc/pki/CA/signing.conf
```

```properties
[ca]
default_ca = CA_default

[CA_default]
database = /etc/pki/CA/index.txt
serial = /etc/pki/CA/serial
new_certs_dir = /etc/pki/CA/newcerts
certificate = /etc/pki/CA/root-ca.crt
private_key = /etc/pki/CA/private/root-ca.key
default_days = 365
default_md = sha256
preserve = no
policy = policy_loose

[policy_loose]
countryName = optional
stateOrProvinceName = optional
localityName = optional
organizationName = optional
organizationalUnitName = optional
commonName = supplied
emailAddress = optional

[req_ext]
subjectAltName = @alt_names
keyUsage = keyEncipherment, dataEncipherment, digitalSignature
extendedKeyUsage = serverAuth

[alt_names]
DNS.1 = gitlab.ext-216.com
```

#### 3.3 生成GitLab证书私钥和证书签名请求
```bash
cd /etc/pki/CA
# 生成私钥
sudo openssl genrsa -out private/gitlab.ext-216.com.key 2048
sudo chmod 600 private/gitlab.ext-216.com.key

# 生成证书签名请求
sudo openssl req -new \
    -key private/gitlab.ext-216.com.key \
    -out requests/gitlab.ext-216.com.csr \
    -config requests/gitlab.ext-216.com.conf
```

#### 3.4 使用根CA签发GitLab证书
```bash
sudo openssl ca -in requests/gitlab.ext-216.com.csr \
    -out certs/gitlab.ext-216.com.crt \
    -config signing.conf \
    -extensions req_ext \
    -batch
```

### 4. 部署证书到GitLab
#### 4.1 复制证书到GitLab SSL目录
```bash
# 复制私钥和证书
sudo cp private/gitlab.ext-216.com.key /etc/gitlab/ssl/
sudo cp certs/gitlab.ext-216.com.crt /etc/gitlab/ssl/

# 设置权限
sudo chmod 600 /etc/gitlab/ssl/gitlab.ext-216.com.key
sudo chmod 644 /etc/gitlab/ssl/gitlab.ext-216.com.crt
```

#### 4.2 配置GitLab使用新证书
```bash
sudo nano /etc/gitlab/gitlab.rb
```

确保以下配置正确：

```ruby
external_url 'https://gitlab.ext-216.com'

nginx['ssl_certificate'] = "/etc/gitlab/ssl/gitlab.ext-216.com.crt"
nginx['ssl_certificate_key'] = "/etc/gitlab/ssl/gitlab.ext-216.com.key"
```

#### 4.3 重新配置GitLab
```bash
sudo gitlab-ctl reconfigure
sudo gitlab-ctl restart
```

### 5. 客户端信任根证书
为了让浏览器信任你的GitLab证书，需要在访问的客户端上安装根证书：

#### Windows客户端
```bash
# 首先将根证书从服务器复制到客户端
scp root@your-server:/etc/pki/CA/root-ca.crt ./
```

然后双击 `root-ca.crt`：

1. 点击"安装证书"
2. 选择"本地计算机"
3. 选择"将所有的证书都放入下列存储"
4. 点击"浏览"，选择"受信任的根证书颁发机构"
5. 完成安装

#### Linux客户端
```bash
# 复制根证书
sudo cp root-ca.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates
```

#### macOS客户端
```bash
# 双击root-ca.crt
# 在钥匙串访问中，将证书添加到"系统"钥匙串
# 双击证书，展开"信任"，设置为"始终信任"
```

### 6. 验证证书
```bash
# 检查GitLab证书是否由你的根CA签发
openssl verify -CAfile /etc/pki/CA/root-ca.crt \
    /etc/gitlab/ssl/gitlab.ext-216.com.crt
```

应该输出：`/etc/gitlab/ssl/gitlab.ext-216.com.crt: OK`

### 📋 文件清单
操作完成后，你的主要文件如下：

```plain
/etc/pki/CA/
├── private/
│   ├── root-ca.key          # 根CA私钥（权限400）
│   └── gitlab.ext-216.com.key # GitLab私钥
├── certs/
│   └── gitlab.ext-216.com.crt  # 签发的GitLab证书
├── root-ca.crt               # 根CA证书（需要分发给客户端）
├── index.txt                 # CA数据库
├── serial                    # 序列号文件
└── newcerts/                 # 存放所有已签发证书的备份
```
