# Linux目录
<!-- 这是一张图片，ocr 内容为： -->
![[1778671561089-2d5cefd7-7908-4d0a-a22b-7a4f696e5afe.png]]

# 命令分类大全
### 补充知识
##### fortune
<!-- 这是一张图片，ocr 内容为： -->
![[1778160071170-24e89237-e5b8-4d82-a9de-a9ee803ea03b.png]]

##### AppImage
<!-- 这是一张图片，ocr 内容为： -->
![[1778160676704-2ca35f86-0811-450d-a457-5ccfdb9d8504.png]]

##### tee
<!-- 这是一张图片，ocr 内容为： -->
![[1778160823408-29c1dee8-f903-4eb8-9c5c-3d87ce01a2a8.png]]

##### nice / renice
<!-- 这是一张图片，ocr 内容为： -->
![[1778160897634-c90cc8ad-35ba-4d95-aa93-3208110f8a8b.png]]

##### nano
<!-- 这是一张图片，ocr 内容为： -->
![[1778162095408-7620e18d-ce68-4979-9761-654351fcdc1d.png]]

##### sudo
<!-- 这是一张图片，ocr 内容为： -->
![[1778162195921-47db7447-2e11-4371-a6e8-2d223fd42e8c.png]]

##### 系统日志
<!-- 这是一张图片，ocr 内容为： -->
![[1778162870465-910363a9-b227-482c-8248-ff9c5874c526.png]]

##### snap包
<!-- 这是一张图片，ocr 内容为： -->
![[1778163246839-508503d0-6ffb-4f5d-bd48-f3f9faf48ff1.png]]

### 基础命令
##### ip
<!-- 这是一张图片，ocr 内容为： -->
![[1778154900887-5a828e0d-7aaf-401c-9c12-b011ee16d649.png]]

##### nslookup
<!-- 这是一张图片，ocr 内容为： -->
![[1778155020918-60bdfa3a-880e-4bf4-a4f5-926d725f7f0c.png]]

##### journalctl
<!-- 这是一张图片，ocr 内容为： -->
![[1778155110521-6bc1f755-d259-4873-83dd-ab27ccda3d07.png]]

##### stat
<!-- 这是一张图片，ocr 内容为： -->
![[1778154558472-35ca4ac3-5780-45a6-a45c-65e0b0628f37.png]]

##### file
<!-- 这是一张图片，ocr 内容为： -->
![[1778155217585-2c1929e3-f39e-48f8-bb2d-0f5ec4e45807.png]]

##### touch
<!-- 这是一张图片，ocr 内容为： -->
![[1778155269413-92245e94-9a5c-40ad-ad2b-75448f0d675d.png]]

##### tree
<!-- 这是一张图片，ocr 内容为： -->
![[1778155349615-cb06d03d-df47-4363-8518-ccdd29c88cf8.png]]

##### uniq
<!-- 这是一张图片，ocr 内容为： -->
![[1778160335236-25c2374c-be0f-4d1d-ba21-8b4ed1c04930.png]]

##### who&w
<!-- 这是一张图片，ocr 内容为： -->
![[1778155735287-43096241-3f96-4f15-acc7-729e86ca2800.png]]

##### yes
<!-- 这是一张图片，ocr 内容为： -->
![[1778155802005-7411986a-6e20-4031-9671-320aca6465c3.png]]

##### cal
<!-- 这是一张图片，ocr 内容为： -->
![[1778155912016-39a55b6d-099b-4e32-915c-dd7fb2ca7f26.png]]

##### dig
<!-- 这是一张图片，ocr 内容为： -->
![[1778156017692-91ca69b0-ead8-4a7a-8ed9-289af3527626.png]]

##### uname
<!-- 这是一张图片，ocr 内容为： -->
![[1778156087871-a3f6ad38-8705-412d-95b8-fe2aaba4fd1a.png]]

##### hostname
<!-- 这是一张图片，ocr 内容为： -->
![[1778156155193-03e2698f-88d3-40f2-aa4a-7e70851b2acb.png]]

##### sort
<!-- 这是一张图片，ocr 内容为： -->
![[1778156327709-69fff1f1-605a-491b-85fd-11357c514609.png]]

##### ss
<!-- 这是一张图片，ocr 内容为： -->
![[1778156415282-963a1a1b-3a48-4a94-9fce-1bf694567d7c.png]]

##### time
<!-- 这是一张图片，ocr 内容为： -->
![[1778156686276-110eccda-cf07-4e8e-81c5-1ea15a1bb34f.png]]

##### date
<!-- 这是一张图片，ocr 内容为： -->
![[1778156757012-4f49d03e-d7f6-4ad6-ace1-6dac5f733432.png]]

##### kill<!-- 这是一张图片，ocr 内容为： -->
![[1778156807912-061e2df1-fab5-4480-9ab5-1aa06aadafab.png]]
##### lsof
<!-- 这是一张图片，ocr 内容为： -->
![[1778156913357-c1f89090-2bb2-4417-a198-5b3844892df4.png]]

##### ps
<!-- 这是一张图片，ocr 内容为： -->
![[1778157095087-d0e7fba3-ccd9-4981-bf77-613418cc60f5.png]]

##### cat
cat=catenate  连接的意思,意思是将文件的内容连接展示出来看看

```bash
# cat连接,可以连接展示文件的内容, 可以接多个文件
cat test.log
cat test1.log test2.log

# 展示行号
cat -n test.log

# 一般配合其他命令来使用
cat test.log > newFile.log
cat test.log | grep --color vin
cat test.log | wc -l
```

```bash
# 检查你的服务器命令
command -v scp

# 像远端服务器传输数据
# 将test.log传到71.216机器上，默认是登陆用户名的主目录。不写就是这个，可以另外指定
scp test.log root@100.100.71.216:/root/

# 将远端服务器的数据传到本地/home/zesheng/目录下来
scp root@100.100.71.216:/root/test.log /home/zesheng/

# 传输目录需要 -r 递归复制
scp -r config/ root@100.100.71.216:/root/

# 传输需要保留本来的元数据stat就用 -p  ， 目标文件的stat元数据就会保留下来
scp -pr config/ root@100.100.71.216:/root/

# 如果两台服务器的用户名相同就可以忽略，因为默认是采用相同的用户名，也可以写上，没多大关系。

# ssh 可以直接执行命令，不用再去开窗口，如果命令可以这样做
ssh root@100.100.71.216 ls 
```

##### man
##### cut
<!-- 这是一张图片，ocr 内容为： -->
![[1778157206523-d38d5415-c4e1-4ff6-8223-a915fd076219.png]]

##### tr
<!-- 这是一张图片，ocr 内容为： -->
![[1778157271291-87894ca4-45d7-4540-94d4-199984f1bbf4.png]]

##### find
<!-- 这是一张图片，ocr 内容为： -->
![[1778157355568-62b8e66d-5406-46d3-a9bc-42f2fc38a7e5.png]]

##### diff
<!-- 这是一张图片，ocr 内容为： -->
![[1778162718352-9377c74b-d0e6-4a6f-a9f8-9dc1357259d3.png]]

##### wget
<!-- 这是一张图片，ocr 内容为： -->
![[1778157499707-f76826a5-3abc-4a88-8017-02ddbbe52b4a.png]]

##### curl
调试，访问API

```bash
curl -o anzhuang.sh https://res1.hermesagent.org.cn/install.sh
curl -O https://res1.hermesagent.org.cn/install.sh
curl -I https://res1.hermesagent.org.cn/install.sh
curl -L http://192.168.71.213:9090
```

##### ping
<!-- 这是一张图片，ocr 内容为： -->
![[1778157588981-28f91a1a-eee6-4f26-938a-bd9039e80e70.png]]

##### tcpdump
基础的抓包工具，用于分析和捕获网络数据包。

用来分析k3s集群中pod的跨节点通信非常好使，输出的内容清晰明了、

```bash
# 抓任何网口的udp协议的与8472端口有关的数据包    srcport+dstport=8472
tcpdump -i any udp port 8472

# -c 10  抓10次自动退出
tcpdump -i any -c 10 udp port 8472

# -n 不解析主机名 抓的更快
tcpdump -i any -n udp port 8472

# -e 显示更多细节，包含链路层头
tcpdump -i any -c 5 -e udp port 8472

# -s 0 -w flannel.pcap  保存到文件
tcpdump -i any -s 0 -w flannel.pcap udp port 8472

# 完全不要解包
tcpdump -i any -n udp port 8472 -e -c 5
```

<!-- 这是一张图片，ocr 内容为： -->
![[1780456215131-746a7838-8aec-449b-8019-37f5d1aec2fa.png]]

```bash
[ 外层以太网帧 ] → [ 外层IP ] → [ 外层UDP:8472 ] → [ OTV头 ] → [ 内层以太网帧 ]
→ [ 内层IP ] → [ 内层TCP ] → [ HTTP请求 ]
```

1. <font style="color:rgb(15, 17, 21);">时间戳与接口方向</font>

`<font style="color:rgb(15, 17, 21);">10:32:30.640392 enp2s0 Out ifindex 2</font>`

+ **<font style="color:rgb(15, 17, 21);">10:32:30.640392</font>**<font style="color:rgb(15, 17, 21);">：抓包时间</font>
+ **<font style="color:rgb(15, 17, 21);">enp2s0 Out</font>**<font style="color:rgb(15, 17, 21);">：从本机</font><font style="color:rgb(15, 17, 21);"> </font>`<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">enp2s0</font>`<font style="color:rgb(15, 17, 21);"> </font><font style="color:rgb(15, 17, 21);">网卡</font>**<font style="color:rgb(15, 17, 21);">发送出去</font>**<font style="color:rgb(15, 17, 21);">（Out）</font>
+ **<font style="color:rgb(15, 17, 21);">ifindex 2</font>**<font style="color:rgb(15, 17, 21);">：内核接口索引号</font>

---

2. <font style="color:rgb(15, 17, 21);">外层以太网帧</font>

```plain
70:b5:e8:42:33:df > 某个MAC (省略部分)
ethertype IPv4 (0x0800), length 498
```

+ <font style="color:rgb(15, 17, 21);">源 MAC 是本机</font><font style="color:rgb(15, 17, 21);"> </font>`<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">enp2s0</font>`<font style="color:rgb(15, 17, 21);"> </font><font style="color:rgb(15, 17, 21);">的地址</font>
+ <font style="color:rgb(15, 17, 21);">目标 MAC 是下一跳网关或对端物理机</font>
+ <font style="color:rgb(15, 17, 21);">帧总长度 498 字节</font>

---

3. <font style="color:rgb(15, 17, 21);">外层 UDP 封装（Overlay 隧道）</font>

`<font style="color:rgb(15, 17, 21);">ext-215.55204 > ext-214.8472</font>`

<font style="color:rgb(15, 17, 21);">这一行实际是 tcpdump 简化显示，完整含义：</font>

| <font style="color:rgb(15, 17, 21);">字段</font> | <font style="color:rgb(15, 17, 21);">值</font> | <font style="color:rgb(15, 17, 21);">含义</font> |
| --- | --- | --- |
| <font style="color:rgb(15, 17, 21);">外层源IP</font> | `<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">ext-215</font>`<br/><font style="color:rgb(15, 17, 21);">（假设是 192.168.71.215 之类的物理机IP）</font> | <font style="color:rgb(15, 17, 21);">本机物理IP</font> |
| <font style="color:rgb(15, 17, 21);">外层源端口</font> | `<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">55204</font>` | <font style="color:rgb(15, 17, 21);">随机端口（隧道封装使用）</font> |
| <font style="color:rgb(15, 17, 21);">外层目标IP</font> | `<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">ext-214</font>` | <font style="color:rgb(15, 17, 21);">对端物理机IP</font> |
| <font style="color:rgb(15, 17, 21);">外层目标端口</font> | `<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">8472</font>` | **<font style="color:rgb(15, 17, 21);">Overlay 隧道端口</font>**<font style="color:rgb(15, 17, 21);">（你过滤的就是这个）</font> |
| <font style="color:rgb(15, 17, 21);">协议</font> | <font style="color:rgb(15, 17, 21);">UDP</font> | <font style="color:rgb(15, 17, 21);">隧道传输协议</font> |


<font style="color:rgb(15, 17, 21);">说明：</font>`<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">ext-215</font>`<font style="color:rgb(15, 17, 21);"> </font><font style="color:rgb(15, 17, 21);">/</font><font style="color:rgb(15, 17, 21);"> </font>`<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">ext-214</font>`<font style="color:rgb(15, 17, 21);"> </font><font style="color:rgb(15, 17, 21);">是 DNS 反向解析结果，实际是物理机的 IP。</font>

---

4. <font style="color:rgb(15, 17, 21);">OTV 头（类似 VXLAN）</font>

`<font style="color:rgb(15, 17, 21);">OTV, flags [I] (0x08), overlay 0, instance 1</font>`

| <font style="color:rgb(15, 17, 21);">字段</font> | <font style="color:rgb(15, 17, 21);">值</font> | <font style="color:rgb(15, 17, 21);">含义</font> |
| --- | --- | --- |
| <font style="color:rgb(15, 17, 21);">类型</font> | <font style="color:rgb(15, 17, 21);">OTV</font> | <font style="color:rgb(15, 17, 21);">Overlay Transport Virtualization（Cisco 的 Overlay 协议，类似 VXLAN）</font> |
| <font style="color:rgb(15, 17, 21);">flags</font><font style="color:rgb(15, 17, 21);"> </font>`<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">[I]</font>` | <font style="color:rgb(15, 17, 21);">0x08</font> | <font style="color:rgb(15, 17, 21);">表示</font><font style="color:rgb(15, 17, 21);"> </font>**<font style="color:rgb(15, 17, 21);">Inter-site</font>**<font style="color:rgb(15, 17, 21);">（跨站点）或控制标志</font> |
| <font style="color:rgb(15, 17, 21);">overlay</font> | <font style="color:rgb(15, 17, 21);">0</font> | <font style="color:rgb(15, 17, 21);">Overlay 网络标识符（类似 VNI，这里是 0）</font> |
| <font style="color:rgb(15, 17, 21);">instance</font> | <font style="color:rgb(15, 17, 21);">1</font> | <font style="color:rgb(15, 17, 21);">实例 ID（相当于二层隔离域）</font> |


**<font style="color:rgb(15, 17, 21);">OTV 作用</font>**<font style="color:rgb(15, 17, 21);">：在 UDP 隧道中封装一个完整的二层以太网帧。</font>

5. <font style="color:rgb(15, 17, 21);">内层以太网帧（容器网络内部）</font>

`<font style="color:rgb(15, 17, 21);">76:8f:bd:69:fb:93 > 62:23:99:bd:eb:db, ethertype IPv4 (0x0800), length 442</font>`

+ <font style="color:rgb(15, 17, 21);">源 MAC：</font>`<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">76:8f:...</font>`<font style="color:rgb(15, 17, 21);"> </font><font style="color:rgb(15, 17, 21);">→ 可能是</font><font style="color:rgb(15, 17, 21);"> </font>**<font style="color:rgb(15, 17, 21);">容器 A 的虚拟网卡 MAC</font>**
+ <font style="color:rgb(15, 17, 21);">目标 MAC：</font>`<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">62:23:...</font>`<font style="color:rgb(15, 17, 21);"> </font><font style="color:rgb(15, 17, 21);">→ 可能是</font><font style="color:rgb(15, 17, 21);"> </font>**<font style="color:rgb(15, 17, 21);">容器 B 的虚拟网卡 MAC</font>**<font style="color:rgb(15, 17, 21);"> </font><font style="color:rgb(15, 17, 21);">或容器网关 MAC</font>
+ <font style="color:rgb(15, 17, 21);">类型：IPv4</font>
+ <font style="color:rgb(15, 17, 21);">内层帧长度：442 字节</font>

<font style="color:rgb(15, 17, 21);">这说明 Overlay 网络模拟了一个跨物理机的</font>**<font style="color:rgb(15, 17, 21);">二层广播域</font>**<font style="color:rgb(15, 17, 21);">，容器以为自己在同一个 LAN 里。</font>

---

6. <font style="color:rgb(15, 17, 21);">内层 IP 层（容器真实通信）</font>

`<font style="color:rgb(15, 17, 21);">10.42.0.121.36260 > 10.42.1.74.http-alt</font>`

| <font style="color:rgb(15, 17, 21);">字段</font> | <font style="color:rgb(15, 17, 21);">值</font> | <font style="color:rgb(15, 17, 21);">含义</font> |
| --- | --- | --- |
| <font style="color:rgb(15, 17, 21);">源IP</font> | `<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">10.42.0.121</font>` | <font style="color:rgb(15, 17, 21);">容器 A 的 Pod IP（所在节点网段 .0.121）</font> |
| <font style="color:rgb(15, 17, 21);">源端口</font> | `<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">36260</font>` | <font style="color:rgb(15, 17, 21);">容器内进程使用的临时端口</font> |
| <font style="color:rgb(15, 17, 21);">目标IP</font> | `<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">10.42.1.74</font>` | <font style="color:rgb(15, 17, 21);">容器 B 的 Pod IP（另一节点网段 .1.74）</font> |
| <font style="color:rgb(15, 17, 21);">目标端口</font> | `<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">http-alt</font>`<br/><font style="color:rgb(15, 17, 21);"> </font><font style="color:rgb(15, 17, 21);">(8080)</font> | `<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">http-alt</font>`<br/><font style="color:rgb(15, 17, 21);"> </font><font style="color:rgb(15, 17, 21);">是 8080 端口的别名</font> |


---

7. <font style="color:rgb(15, 17, 21);">内层 TCP 层</font>

`<font style="color:rgb(15, 17, 21);">Flags [P.], seq 344688621:344688997, ack 843165503, win 6666, options [nop,nop,TS val 3842157405 ecr 2281446211], length 376</font>`

| <font style="color:rgb(15, 17, 21);">字段</font> | <font style="color:rgb(15, 17, 21);">含义</font> |
| --- | --- |
| `<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">[P.]</font>` | <font style="color:rgb(15, 17, 21);">PSH + ACK（推数据并确认）</font> |
| `<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">seq</font>` | <font style="color:rgb(15, 17, 21);">从 344688621 到 344688997，共</font><font style="color:rgb(15, 17, 21);"> </font>**<font style="color:rgb(15, 17, 21);">376 字节</font>** |
| `<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">ack</font>` | <font style="color:rgb(15, 17, 21);">确认号 843165503（对端下一个期望的序列号）</font> |
| `<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">win 6666</font>` | <font style="color:rgb(15, 17, 21);">TCP 窗口大小</font> |
| `<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">TS val/ecr</font>` | <font style="color:rgb(15, 17, 21);">TCP 时间戳选项（用于 RTT 计算）</font> |
| `<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">length 376</font>` | <font style="color:rgb(15, 17, 21);">TCP payload 长度</font> |


---

8. <font style="color:rgb(15, 17, 21);">HTTP 请求内容</font>

`<font style="color:rgb(15, 17, 21);">HTTP: GET /actuator/prometheus HTTP/1.1</font>`

+ **<font style="color:rgb(15, 17, 21);">方法</font>**<font style="color:rgb(15, 17, 21);">：GET</font>
+ **<font style="color:rgb(15, 17, 21);">路径</font>**<font style="color:rgb(15, 17, 21);">：</font>`<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">/actuator/prometheus</font>`<font style="color:rgb(15, 17, 21);">（Spring Boot Actuator 的 Prometheus 指标端点）</font>
+ **<font style="color:rgb(15, 17, 21);">版本</font>**<font style="color:rgb(15, 17, 21);">：HTTP/1.1</font>

<font style="color:rgb(15, 17, 21);">这说明是 </font>**<font style="color:rgb(15, 17, 21);">监控系统抓取指标</font>**<font style="color:rgb(15, 17, 21);"> 的流量。</font>

##### <font style="color:rgb(15, 17, 21);">ss</font>
ss = **<font style="color:rgb(15, 17, 21);">Socket Statistics  套接字统计信息</font>**

<font style="color:rgb(15, 17, 21);">是 iproute2 工具集的一部分（和 </font>`<font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">ip</font>`<font style="color:rgb(15, 17, 21);"> 命令同源），</font><font style="color:rgb(15, 17, 21);">直接从内核 netlink 获取数据，</font><font style="color:rgb(15, 17, 21);">是netstat的现代替代品。</font>

```bash
ss -s
ss -ln
ss -tulnp

# ss：原生过滤（更快、更精确）
ss state established
ss state time-wait sport = :80   # 源端口是80的time-wait连接
ss state listening sport = :443  # 监听443端口的服务

# ss：更详细的进程、cgroup、TCP 内部状态
ss -p      # 进程信息
ss -e      # 扩展信息（socket 选项、uid、inode）
ss -m      # 内存使用（发送/接收缓冲区大小）
ss -i      # TCP 内部信息（RTT、拥塞窗口、重传等）
ss -t -i   # TCP + 内部信息（非常详细）


# 找出所有连接到 80 端口且处于 time-wait 状态的连接
ss state time-wait dport = :80

# 找出所有与 192.168.1.100 通信的 established 连接
ss state established dst 192.168.1.100

# 监控 RTT 大于 100ms 的连接
ss -ti | grep -B 3 "rtt:10[0-9]"
```

### 系统管理
##### alias
<!-- 这是一张图片，ocr 内容为： -->
![[1778157726022-532b3363-5d0a-4b75-bb91-0ddbc6f166b7.png]]

##### crontab定时任务
<!-- 这是一张图片，ocr 内容为： -->
![[1778161665053-5d9a1e6d-6ced-4750-b037-325f2b48fb80.png]]

##### systemctl
systemd的管理命令

```bash
# 在很多的linux发行版都有这个命令，包括redhat系列、Debian系列、Ubuntu等等
# 在systemd中每一个服务被称为 unit
# 可以使用apache2来实验一下
systemctl status apache2
systemctl start apache2
```

##### usermod
<!-- 这是一张图片，ocr 内容为： -->
![[1778157922520-1fe9c6b4-e508-4ff7-8abb-aee054c4abe0.png]]

##### 文件权限
<!-- 这是一张图片，ocr 内容为： -->
![[1778161296574-2ff5e834-58ca-42d4-9728-b8eec4ebfaa0.png]]

##### 用户账户管理
<!-- 这是一张图片，ocr 内容为： -->
![[1778161950054-dd389614-6cb2-42a8-b4ef-86be1b978e2d.png]]

##### 用户管理
<!-- 这是一张图片，ocr 内容为： -->
![[1778161474749-478428b7-8568-422e-8f71-82822b88bd5f.png]]

##### 用户组管理
<!-- 这是一张图片，ocr 内容为： -->
![[1778161562498-5956c225-bd83-4da0-9ed3-78e9bdffa297.png]]

##### 环境变量PATH
<!-- 这是一张图片，ocr 内容为： -->
![[1778158002377-b99f1639-6caf-484d-82ea-2161b06c82a1.png]]

##### 符号连接ln
<!-- 这是一张图片，ocr 内容为： -->
![[1778158078982-19eb7df5-50dd-4184-af68-092b5999257c.png]]

##### history
history=就是bash命令的历史记录,很有用的命令,可以看到你在这台机器上干了些什么

每个用户都有独特的历史记录,配置文件在~/.bashrc文件中

```bash
history

# 在history的配置文件的.bashrc中可以打开命令的时间标签
# 加上这句就行
export HISTTIMEFORMAT="%Y-%m-%d %H:%M:%S "
# 另外还有一个配置 
HISTCONTROL=ignoreboth  # 这行配置很重要,他的意思就是如果你在命令前面输入一个空格,
# 就是命令以空格开头,就不会将命令记入历史记录中
# 这点非常有用,如果你的命令中有明文的密码之类的敏感信息就可以使用这个小技巧

# 另外可以使用 ! 来执行命令,!命令序号就可执行了,自己去试试就行

# 最重要的一点就是 !! 可以重复执行上条命令,!!就是最近的一条,比如你想apt update更新一下,
# 但没权限,失败了,就可以 sudo !!重复执行一下上一条命令.
sudo !!

# 另外 ctrl + r 可以简单搜索命令,比如我想搜索最近使用sudo执行的命令,就可使用
# ctrl + r ,之后输入 sudo, 他就会不全最近的sudo命令,使用ctrl + r 来切换下一个命令
# 当然也可以使用 history | grep sudo
history | grep sudo


```

##### top
<!-- 这是一张图片，ocr 内容为： -->
![[1778158533509-b1969d3e-f448-48ac-91ea-f73b6652ae27.png]]

<!-- 这是一张图片，ocr 内容为： -->
![[1776133091929-f0bf7d6b-c43d-4b0a-813d-1ab7ee752253.png]]

1. 系统运行状态行

```plain
top - 10:08:41 up 823 days,  9:37,  1 user,  load average: 0.27, 0.55, 0.31
```

| 字段 | 含义 | 分析 |
| --- | --- | --- |
| `10:08:41` | 当前系统时间 | - |
| `up 823 days, 9:37` | 系统连续运行时长 | **连续运行823天（约2年3个月）**，稳定性极佳，无重启记录 |
| `1 user` | 当前登录用户数 | 仅1个用户在线，负载低 |
| `load average: 0.27, 0.55, 0.31` | 1/5/15分钟系统平均负载 | 假设为多核CPU，负载远低于CPU核心数，**系统极度空闲**，无压力 |


---

2. 任务状态行

```plain
Tasks: 247 total,   1 running, 246 sleeping,   0 stopped,   0 zombie
```

| 字段 | 含义 | 分析 |
| --- | --- | --- |
| `247 total` | 总进程数 | 正常水平，无异常进程堆积 |
| `1 running` | 正在运行的进程数 | 仅1个进程在CPU上运行，其余均休眠，CPU资源充足 |
| `246 sleeping` | 休眠进程数 | 绝大多数进程处于等待I/O/事件状态，符合空闲系统特征 |
| `0 stopped` | 停止进程数 | 无挂起进程，系统正常 |
| `0 zombie` | 僵尸进程数 | **无僵尸进程**，父进程回收正常，无资源泄漏 |


---

3. CPU使用率行

```plain
%Cpu(s):  0.4 us,  0.1 sy,  0.0 ni, 99.5 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
```

| 字段 | 含义 | 分析 |
| --- | --- | --- |
| `us (user)` | 用户态CPU占比 | 0.4%，应用程序占用极低 |
| `sy (system)` | 内核态CPU占比 | 0.1%，系统内核开销极小 |
| `ni (nice)` | 调整优先级进程占比 | 0%，无优先级调整进程 |
| `id (idle)` | 空闲CPU占比 | **99.5%**，CPU几乎完全空闲，性能冗余 |
| `wa (wait)` | I/O等待占比 | 0%，磁盘/网络I/O无瓶颈 |
| `hi (hardirq)` | 硬中断占比 | 0%，硬件中断无压力 |
| `si (softirq)` | 软中断占比 | 0%，网络/内核中断正常 |
| `st (steal)` | 被宿主机抢占时间 | 0%，虚拟机环境下无资源被抢占（物理机默认0） |


---

4. 内存状态行

```plain
KiB Mem : 41018360 total, 22925424 free, 10095996 used, 7996940 buff/cache
```

单位：KiB（1 KiB = 1024 B），换算后：

| 字段 | 数值（KiB） | 换算（GB） | 含义 | 分析 |
| --- | --- | --- | --- | --- |
| `total` | 41,018,360 | ≈39.12 GB | 总物理内存 | 约39GB内存，配置充足 |
| `free` | 22,925,424 | ≈21.86 GB | 完全空闲内存 | 超21GB空闲，内存充足 |
| `used` | 10,095,996 | ≈9.63 GB | 已用内存（不含缓存） | 仅约9.6GB被应用占用 |
| `buff/cache` | 7,996,940 | ≈7.63 GB | 缓存/缓冲内存 | 用于文件缓存，可随时回收给应用 |
| `avail Mem` | 28,360,208 | ≈27.05 GB | 可分配给新应用的内存 | **≈27GB可用内存**，完全无内存压力 |


---

5. 交换分区（Swap）状态行

```plain
KiB Swap:  8388604 total,  8388604 free,        0 used. 28360208 avail Mem
```

| 字段 | 数值（KiB） | 换算（GB） | 含义 | 分析 |
| --- | --- | --- | --- | --- |
| `total` | 8,388,604 | ≈8.0 GB | 总交换分区大小 | 8GB Swap，配置合理 |
| `free` | 8,388,604 | ≈8.0 GB | 空闲交换分区 | 完全空闲 |
| `used` | 0 | 0 | 已用交换分区 | **0使用**，说明内存完全足够，无内存交换，系统性能极佳 |


---

二、整体系统健康状态总结

✅ **核心结论：这是一台极度健康、负载极低、运行稳定的Linux服务器**

1. **运行稳定性**：连续运行823天无重启，无僵尸进程，无异常状态
2. **CPU负载**：99.5%空闲，平均负载远低于CPU核心数，无性能瓶颈
3. **内存状态**：27GB+可用内存，Swap完全未使用，无内存压力
4. **I/O状态**：I/O等待为0，磁盘/网络无瓶颈

---

三、补充说明与运维建议

1. 关键指标健康阈值参考

| 指标 | 健康阈值 | 当前状态 |
| --- | --- | --- |
| 系统负载 | 低于CPU核心数（如8核<8） | 0.27/0.55/0.31，远低于阈值 |
| CPU空闲率 | >70%为健康 | 99.5%，极度健康 |
| Swap使用率 | <10%为健康 | 0%，完美 |
| 可用内存 | >20%总内存为健康 | ≈69%总内存可用，远超阈值 |




```bash
top命令
├─ 核心作用
│  └─ 实时监控进程、CPU、内存、系统负载
├─ 界面分为两部分
│  ├─ 上半区：系统统计
│  │  ├─ 时间、运行时长、用户数
│  │  ├─ 1/5/15分钟平均负载
│  │  ├─ 进程总数、运行/睡眠/僵尸状态
│  │  ├─ CPU使用率（us/sy/id/wa等）
│  │  └─ 内存、Swap使用情况
│  └─ 下半区：进程列表
│     ├─ PID、USER、PR、NI
│     ├─ VIRT、RES、SHR
│     ├─ %CPU、%MEM、TIME+
│     └─ COMMAND
├─ 常用快捷键
│  ├─ P：按CPU排序
│  ├─ M：按内存排序
│  ├─ T：按时间排序
│  ├─ k：杀死进程
│  ├─ s、d：修改刷新间隔
│  ├─ 1：显示CPU核心
│  ├─ H：显示线程
│  └─ q：退出
├─ 与 htop 对比
│  ├─ top：系统自带、轻量
│  └─ htop：需安装、界面更友好、功能更强
└─ 常用排查场景
   ├─ 找CPU高占用进程
   ├─ 查内存占用异常
   ├─ 看系统负载高原因
   └─ 检查IO等待（wa）偏高
```



##### bg & fg
<!-- 这是一张图片，ocr 内容为： -->
![[1778158492703-39affce5-2a77-4a7f-afd6-3895bf0b5c07.png]]

后台和前台

前台=控制台、直接可以操作的

后台=放在后面，不直接表现在控制台界面

```bash
# 比如我想编辑一个~/bashrc文件，执行了vim ~/.bashrc， 正在编辑的时候，
# 现在又要去跑一个docker容器，一般只能就是先暂时保存这个.bashrc文件，稍后来处理。或者再开一个
# bash去跑docker容器。
# 现在你可以在未完成的vim ~/.bashrc发送到后台，跑完容器再把他从后台拿到前台来处理
# & 后面接这个符号主动将任务发送到后台，或者使用ctrl + z 发送到后台
vim ~/.bashrc & 

# 使用fg将任务拿到前台，fg直接执行是拿最近一个放入后台的任务。
# 如果有多个任务，可以使用jobs命令查看bg后台的任务列表，每个任务有一个id，可以使用这个id配合
# fg命令来将任务取出。这个id是绑定在任务上的,id=1的任务结束了,id=2的任务并不会变成id=1,
# 任务和id是绑定在一起的。
jobs

fg

fg 1
fg 2

# 其实可以配合kill命令干掉任务,使用任务id,就可以干掉任务
kill %1
```

##### scp
scp=secure copy 安全的复制

<!-- 这是一张图片，ocr 内容为： -->
![[1778158445475-135c67c6-7d01-41b7-931e-f96c2b1fbcc3.png]]

##### ssh公钥认证
<!-- 这是一张图片，ocr 内容为： -->
![[1778161762045-23c49bc5-4197-42b2-8c3c-7d5db46bc717.png]]

##### memory&swap
<!-- 这是一张图片，ocr 内容为： -->
![[1778158626852-009e8e29-f8b6-451a-bfd6-155dd704ce20.png]]

##### head & tail
<!-- 这是一张图片，ocr 内容为： -->
![[1778162451799-00c1bd25-9593-4062-8e86-a7df678e5ff6.png]]

##### load average
<!-- 这是一张图片，ocr 内容为： -->
![[1778162515329-25af0649-b043-4995-a8dc-3047593a1662.png]]

##### apt
<!-- 这是一张图片，ocr 内容为： -->
![[1778161370004-7628f4fc-d9fe-4d6b-af4c-5bb8576ec758.png]]

### 文件与存储
##### tar & gizp
<!-- 这是一张图片，ocr 内容为： -->
![[1778158726362-38d8b480-885a-4508-84f9-422eab94f025.png]]

##### du & df
<!-- 这是一张图片，ocr 内容为： -->
![[1778158880292-6f9746ac-83a0-45bf-a440-294e42773fbe.png]]

##### /etc/fstab文件
<!-- 这是一张图片，ocr 内容为： -->
![[1778158951995-1eda6a2f-c809-46dc-8205-6c861a1d8509.png]]

##### linux文件系统
<!-- 这是一张图片，ocr 内容为： -->
![[1778159006710-76a516c8-739f-451d-bb3f-4429147d3bf1.png]]

##### 磁盘格式化与挂载
<!-- 这是一张图片，ocr 内容为： -->
![[1778161097742-5ef25435-31fb-4c81-9023-b17c0ea9d2a0.png]]

### linux文本处理
##### grep
<!-- 这是一张图片，ocr 内容为： -->
![[1778159081033-af3c9d9a-757e-4c43-8885-b4688d5182ff.png]]

##### sed
<!-- 这是一张图片，ocr 内容为： -->
![[1778159125263-42d4683c-ad1d-45be-8e23-1cc9cf3658a5.png]]

##### awk
<!-- 这是一张图片，ocr 内容为： -->
![[1778159160491-9895bca7-e2d4-4286-a057-a90743dcbd77.png]]

### 性能工具
##### sar性能监控
### linux标准数据流
标准输入流

标准输出流

标准错误流

<!-- 这是一张图片，ocr 内容为： -->
![[1778159339409-0d44e8d4-b132-4678-af9a-b1cc87afd70e.png]]

### linux发行版
<!-- 这是一张图片，ocr 内容为： -->
![[1778159449076-0f08b5c9-8c47-48da-8049-83750a84e292.png]]

##### 桌面环境
<!-- 这是一张图片，ocr 内容为： -->
![[1778163095751-81f9c9d3-e35c-47f5-90a6-1a2a0e1c74a0.png]]



