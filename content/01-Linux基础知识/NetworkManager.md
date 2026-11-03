
```
NetworkManager
├── 主配置（行为控制）
│   └── /etc/NetworkManager/NetworkManager.conf
│   └── /etc/NetworkManager/conf.d/*.conf

├── 连接配置（每个网卡的设置）
│   └── /etc/NetworkManager/system-connections/*.nmconnection  ← 主要管理的地方
│   └── /etc/sysconfig/network-scripts/ifcfg-*               ← CentOS7兼容

├── 运行时状态（动态生成）
│   └── /run/NetworkManager/

├── 预置系统配置（不要改）
│   └── /usr/lib/NetworkManager/

└── 持久数据库
    └── /var/lib/NetworkManager/
```
# NetworkManager 在 Red Hat 系列（RHEL 8/9、Rocky Linux 9、AlmaLinux 9 等）中的完整命令指南

适用于 RHCSA/RHCE 考试及生产环境，重点使用 `nmcli` 和、`nmtui`（图形化 TUI 工具已基本被弃用，考试推荐 nmcli）。

### 1. 简介
NetworkManager 是 RHEL 8/9 及衍生发行版（如 Rocky Linux 9）的默认网络管理工具。  
- 命令行工具：`nmcli`（考试必备，全功能）  
- 文本界面工具：`nmtui`（可选，适合快速临时配置）  
- 配置文件存放路径：`/etc/sysconfig/network-scripts/` 已被废弃，全部改为 `/etc/NetworkManager/system-connections/`（Keyfile 格式或 nmmeta 格式）

### 2. 常用命令表（nmcli 为主）

| 功能                   | 命令                                                                                                                                                                                                | 示例                                                                                                                                                                                                                                                         | 说明                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 查看 NetworkManager 状态 | `nmcli` 或 `nmcli general status`                                                                                                                                                                  | `nmcli`                                                                                                                                                                                                                                                    | 最常用，直接显示所有接口状态                          |
| 查看所有连接配置文件           | `nmcli connection show`                                                                                                                                                                           | `nmcli connection show`                                                                                                                                                                                                                                    | 列出所有 connection（profile）                |
| 查看已激活的连接             | `nmcli connection show --active`                                                                                                                                                                  |                                                                                                                                                                                                                                                            |                                         |
| 查看设备状态               | `nmcli device status`                                                                                                                                                                             |                                                                                                                                                                                                                                                            |                                         |
| 查看具体接口详细信息           | `nmcli device show <ifname>`                                                                                                                                                                      | `nmcli device show enp1s0`                                                                                                                                                                                                                                 | 显示 IP、网关、DNS 等                          |
| 手动激活一个连接             | `nmcli connection up <connection-name>`                                                                                                                                                           | `nmcli con up "System enp1s0"`                                                                                                                                                                                                                             |                                         |
| 手动关闭一个连接             | `nmcli connection down <connection-name>`                                                                                                                                                         | `nmcli con down "System enp1s0"`                                                                                                                                                                                                                           |                                         |
| 重启网卡（推荐方式）           | `nmcli device reapply <ifname>` 或 `nmcli con up <name>`                                                                                                                                           | `nmcli device reapply enp1s0`                                                                                                                                                                                                                              | 立即生效，不重启服务                              |
| 创建静态 IP 连接           | `nmcli con add type ethernet con-name <name> ifname <ifname> ipv4.addresses <ip>/<mask> ipv4.method manual ipv4.gateway <gw> ipv4.dns "223.5.5.5 223.6.6.6" ipv6.method disabled autoconnect yes` | `nmcli con add type ethernet con-name bigT ifname eth0 ipv4.addresses 192.168.71.32/24 ipv4.method manual ipv4.gateway 192.168.71.1 ipv4.dns "223.5.5.5 223.6.6.6" ipv6.method disabled autoconnect yes`                                                   |                                         |
| 添加 DNS（创建时）          | 继续加 `ipv4.dns "8.8.8.8 114.114.114.114"`                                                                                                                                                          |                                                                                                                                                                                                                                                            |                                         |
| 创建 DHCP 连接           | `nmcli con add type ethernet con-name <name> ifname <ifname>`                                                                                                                                     | `nmcli con add type ethernet con-name dhcp-enp1s0 ifname enp1s0`                                                                                                                                                                                           | 默认就是 DHCP                               |
| 修改已有连接为静态            | `nmcli con mod <connection-name> ipv4.method manual ipv4.addresses "<ip/mask>" ipv4.gateway <gw> ipv4.dns "8.8.8.8 114.114.114.114"`                                                              | `nmcli con mod "System enp1s0" ipv4.method manual ipv4.addresses "10.0.0.100/24" ipv4.gateway 10.0.0.1 ipv4.dns "8.8.8.8"`                                                                                                                                 | 最常用修改方式                                 |
| 修改为 DHCP             | `nmcli con mod <name> ipv4.method auto ipv4.addresses "" ipv4.gateway ""`                                                                                                                         | `nmcli con mod "static-enp1s0" ipv4.method auto`                                                                                                                                                                                                           | 清空地址和网关                                 |
| 设置开机自动激活             | `nmcli con mod <name> autoconnect yes`                                                                                                                                                            |                                                                                                                                                                                                                                                            | 默认就是 yes                                |
| 删除连接                 | `nmcli connection delete <name>`                                                                                                                                                                  | `nmcli con delete static-enp1s0`                                                                                                                                                                                                                           |                                         |
| 临时手动设置 IP（不持久）       | `nmcli device modify <ifname> ipv4.addresses <ip>/<mask> ipv4.gateway <gw> ipv4.method manual`                                                                                                    | `nmcli dev mod enp1s0 ipv4.addresses 172.16.1.100/24 ipv4.gateway 172.16.1.1 ipv4.method manual`                                                                                                                                                           | 重启后失效                                   |
| 添加第二 IP（多 IP）        | `nmcli con mod <name> +ipv4.addresses "ip/mask"`                                                                                                                                                  | `nmcli con mod "System enp1s0" +ipv4.addresses "192.168.1.200/24"`                                                                                                                                                                                         |                                         |
| 创建 VLAN 接口           | `nmcli con add type vlan con-name <name> dev <parent> id <vlanid> ip4 <ip>/<mask> gw4 <gw>`                                                                                                       | `nmcli con add type vlan con-name vlan100 dev enp1s0 id 100 ip4 192.168.100.10/24`                                                                                                                                                                         |                                         |
| 创建 Bond 接口（模式 0-6）   | `nmcli con add type bond con-name bond0 ifname bond0 bond.options "mode=active-backup,primary=eth1"`<br>然后加 slave                                                                                 | `nmcli con add type bond con-name bond0 ifname bond0 bond.options "mode=1,miimon=100"`<br>`nmcli con add type ethernet con-name bond0-slave1 ifname enp1s0 master bond0`<br>`nmcli con add type ethernet con-name bond0-slave2 ifname enp2s0 master bond0` | mode=0（balance-rr）到 mode=6（balance-alb） |
| 创建 Team 接口           | `nmcli con add type team con-name team0 ifname team0 team.runner activebackup`<br>再加 slave                                                                                                        | `nmcli con add type team con-name team0 ifname team0 config '{"runner": {"name": "activebackup"}}'`<br>`nmcli con add type ethernet con-name team0-slave1 ifname enp1s0 master team0`                                                                      | RHEL 8/9 推荐 team 替代 bonding（性能更好）       |
| 创建桥接（Bridge）         | `nmcli con add type bridge con-name br0 ifname br0`<br>然后把物理口加为 slave                                                                                                                             | `nmcli con add type bridge con-name br0 ifname br0 stp no`<br>`nmcli con add type ethernet con-name br0-slave1 ifname enp1s0 master br0`<br>`nmcli con add type bridge-slave ifname enp1s0 master br0`                                                     | KVM 虚拟化常用                               |
| 重载配置文件               | `nmcli connection reload`                                                                                                                                                                         | 修改了 /etc/NetworkManager/system-connections/ 里的文件后使用                                                                                                                                                                                                        |                                         |
| 重启 NetworkManager 服务 | `systemctl restart NetworkManager`                                                                                                                                                                | 所有修改最终都会生效，但某些情况下需要重启服务                                                                                                                                                                                                                                    |                                         |

### 3. 使用技巧（RHCSA/RHCE 考试高频技巧）

1. **快速记忆缩写**  
   `nmcli con` → `nmcli c`  
   `nmcli dev` → `nmcli d`  
   考试时可以省时间。

2. **查看当前连接名字**（最容易忘）  
   ```bash
   nmcli device show <ifname> | grep CONNECTION
   # 或
   nmcli con show --active | grep <ifname>
   ```

3. **考试中最快改静态 IP 的三连**  
   ```bash
   CON=$(nmcli device show enp1s0 | grep GENERAL.CONNECTION | awk '{print $2}')
   nmcli con mod "$CON" ipv4.method manual ipv4.addresses 172.25.254.100/24 ipv4.gateway 172.25.254.250 ipv4.dns 114.114.114.114
   nmcli con up "$CON"
   ```

4. **批量设置多台服务器**  
   把 `/etc/NetworkManager/system-connections/` 目录直接 scp 过去，然后执行 `nmcli con reload && systemctl restart NetworkManager`

### 4. 注意事项

- 修改后必须 `nmcli con up <name>` 或 `nmcli device reapply <ifname>` 才能立即生效  
- 不要手动编辑 `/etc/NetworkManager/system-connections/*.nmconnection` 后再不 reload（容易被覆盖）  
- RHEL 9 已完全移除 network-scripts 包，`ifcfg-*` 文件不会被读取  
- Bond/Team/Bridge 创建 slave 时，**不要给 slave 单独分配 IP**，否则会冲突  
- `nmcli con mod` 时如果要清空某项，用空双引号 `""`，不要直接删行

### 5. 补充学习建议

1. 实验环境：两台 Rocky Linux 9 虚拟机，练习 Bond + VLAN + Bridge  
2. 官方文档：`man nmcli`、`man nmcli-examples`（里面有大量完整案例）  
3. 考试必备记忆口诀：  
   “show → mod → up”  
   “设备看 device，连接看 connection”

需要我打包一份包含所有上面案例的 `.sh` 脚本或完整 lab 练习文件，直接在 Rocky Linux 9 上运行即可，随时告诉我！