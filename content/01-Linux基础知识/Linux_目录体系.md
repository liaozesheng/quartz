# ①Rocky Linux 9.6 根目录结构说明

> 本文整理了 Rocky Linux 9.6 系统中 `/` 根目录下各个一级目录的全称与用途，适合 RHCSA/RHCE 学习者作为基础知识点复习使用。

| 目录           | 全称                                               | 功能说明                                                           |
| ------------ | ------------------------------------------------ | -------------------------------------------------------------- |
| `/bin`       | **Binary**                                       | 系统启动和单用户模式下的基本命令（如 `ls`, `cp`, `mv`, `rm` 等）。已被合并至 `/usr/bin`。 |
| `/boot`      | **Boot Loader Files**                            | 存放启动引导相关文件，如 `grub2`、`vmlinuz`（内核）、`initramfs`。必须单独分区。         |
| `/dev`       | **Devices**                                      | 所有设备文件（如硬盘、终端、USB、挂载卷等），由 `udev` 动态管理。                         |
| `/etc`       | **Et Cetera**                                    | 系统和应用程序的配置文件存放目录。例如：`/etc/passwd`, `/etc/fstab`。               |
| `/home`      | **Home Directory**                               | 普通用户的主目录（如 `/home/zesheng`），用于存储用户文件、配置等。                      |
| `/lib`       | **Library**                                      | 系统引导和基本命令所需的共享库（libc 等）。大部分已被合并到 `/usr/lib`。                   |
| `/lib64`     | **64-bit Libraries**                             | 存放 64 位系统的共享库（`.so` 文件）。是 x86_64 系统上必不可少的目录。                   |
| `/media`     | **Removable Media Mounts**                       | 可移动设备挂载点（如 U 盘、光盘），现代系统较少直接用这个。                                |
| `/mnt`       | **Mount Temporary**                              | 临时挂载点，一般用于手动挂载磁盘或临时访问某个挂载设备。                                   |
| `/opt`       | **Optional**                                     | 第三方应用程序的安装目录（如 Oracle、VMware 等）。不会干扰系统主文件。                     |
| `/proc`      | **Process Info** (虚拟文件系统)                        | 内核与进程信息接口（如 `/proc/cpuinfo`, `/proc/meminfo`），不占磁盘空间。          |
| `/root`      | **Root Home**                                    | **超级管理员（root 用户）**的主目录，默认不在 `/home/` 中。                        |
| `/run`       | **Runtime Information**                          | 运行时数据（如进程 PID、服务套接字），系统重启后会清空，取代旧的 `/var/run`。                 |
| `/sbin`      | **System Binary**                                | 系统管理工具和启动用命令（如 `fsck`, `reboot`, `mount`）。现在多链接到 `/usr/sbin`。  |
| `/srv`       | **Service Data**                                 | 某些服务（如 Web/FTP）公开数据的目录，RHEL 系列系统中很少用。                          |
| `/sys`       | **System Info** (虚拟文件系统)                         | 内核与硬件的接口，例如挂载设备、驱动信息，类似 `/proc`。由 `sysfs` 管理。                  |
| `/tmp`       | **Temporary Files**                              | 临时文件目录，系统重启后会被清空。不要用于长期保存重要数据。                                 |
| `/usr`       | **Unix System Resources**                        | 存放用户命令、库文件、文档等的主目录，内容较大。                                       |
| `/usr/bin`   | **User Binaries**                                | 用户使用的大部分程序命令都在这里（如 `vim`, `git`, `ssh`）。                       |
| `/usr/sbin`  | **System Binaries**                              | 系统管理员用的工具（如 `sshd`, `useradd`, `firewalld` 等）。                 |
| `/usr/lib`   | **User Libraries**                               | 32 位的程序库文件（共享库），大多为程序依赖。                                       |
| `/usr/lib64` | **User Libraries (64-bit)**                      | 64 位的共享库，现代系统中非常关键。                                            |
| `/usr/local` | **Local Programs**                               | 系统管理员本地手动安装的软件，不受系统包管理器管理。                                     |
| `/var`       | **Variable Files**                               | **会变化的数据文件目录**，如日志、缓存、数据库、邮件、锁等。                               |
| `/var/log`   | 系统和服务日志，如 `/var/log/messages`, `/var/log/secure` |                                                                |
| `/var/lib`   | 应用的数据库、状态信息，如 `/var/lib/dnf`, `/var/lib/rpm`     |                                                                |
| `/var/spool` | 排队任务，如邮件、打印、计划任务等                                |                                                                |

---

## 🧠 小技巧：快速记忆分类表

| 分类         | 关键目录                                                       |
| ---------- | ---------------------------------------------------------- |
| 📦 程序命令    | `/bin`, `/sbin`, `/usr/bin`, `/usr/sbin`, `/usr/local/bin` |
| 📚 库文件     | `/lib`, `/lib64`, `/usr/lib`, `/usr/lib64`                 |
| ⚙️ 配置文件    | `/etc`, `/usr/share`, `/opt/<软件名>/etc`                     |
| 📁 用户目录    | `/home`, `/root`                                           |
| 🧩 临时/缓存   | `/tmp`, `/var/tmp`, `/var/cache`                           |
| 🔒 日志/数据库  | `/var/log`, `/var/lib`, `/var/spool`                       |
| 🧠 内核/进程信息 | `/proc`, `/sys`, `/run`, `/dev`                            |
| 💻 启动相关    | `/boot`, `/grub2`, `/efi`（若是 UEFI）                         |


# ②📁 /usr/share/ 目录详解

## 🧠 一句话理解
`/usr/share/` 是用来存放**平台无关的、可共享的只读数据文件**的目录。

---

## 📦 通俗理解举例

你安装了一个软件 `vim`，它会包含：

| 文件类型     | 放置位置           | 内容说明                       |
|--------------|--------------------|--------------------------------|
| 可执行程序   | `/usr/bin/vim`     | 可以运行的二进制文件           |
| 帮助文档/模板 | `/usr/share/vim/`   | 语法高亮、帮助文档、示例配置等 |

---

## ✅ 常见子目录说明

| 子目录                  | 用途说明 |
|-------------------------|----------|
| `/usr/share/doc/`       | 文档（README、LICENSE） |
| `/usr/share/man/`       | man 手册页 |
| `/usr/share/info/`      | GNU info 帮助文档 |
| `/usr/share/icons/`     | 图标资源 |
| `/usr/share/locale/`    | 国际化语言翻译支持 |
| `/usr/share/fonts/`     | 字体资源 |
| `/usr/share/applications/` | 桌面启动项 (`.desktop` 文件) |

---

## 📌 特点总结

| 特性     | 描述 |
|----------|------|
| ✅ 只读   | 一般用户无需也不应修改 |
| ✅ 跨平台 | 与 CPU 架构无关 |
| ✅ 可共享 | 可在多系统中共享使用 |

---

## 🚫 不适合放在这里的内容

| 类型       | 推荐目录         | 理由 |
|------------|------------------|------|
| 可执行程序 | `/usr/bin/`、`/usr/sbin/` | 平台相关，需编译 |
| 配置文件   | `/etc/`          | 主机相关，可修改 |
| 日志/缓存  | `/var/`          | 动态生成，不共享 |

---

## ✅ Git 举例

```bash
/usr/bin/git                    # Git 可执行程序
/usr/share/doc/git/            # Git 文档
/usr/share/git-core/templates/ # 默认初始化模板
```

---

## 🔁 总结

> `/usr/share/` 是系统中共享、只读、跨平台的资源仓库。常用于放置说明书、翻译、图标、模板等内容。


# ⑨问题合集
## 为什么/usr/目录下会有 lib/ lib64/ libexec/ 3个lib目录？

lib = library 共享库
主要出现3个目录的原因是 **历史版本+ 架构区分 + 程序内部组件隔离** 

linux系统早期程序是32位系统，也就是 386 字眼。不过现在大多数软件都转为64位了，
因为操作系统为64位。
但是为了兼容 以前的32位操作系统，一般程序也会有32位的版本提供下载，比如notepad++
![[Pasted_image_20260310133901.png]]
由于历史原因，32-->64 位，操作系统为了兼容32位和64位的程序软件，所以就会有两个版本的软件库来提供给程序使用。
于是结果就是：
linux系统中就有了
/usr/lib/
/usr/lib64  这两个目录

其实 windows操作系统 也对此做了区分。
![[Pasted_image_20260310134311.png]]

但是操作系统发展到如今，32位基本已经被淘汰了，市面上大多数都是64位操作系统。
渐渐的/usr/lib目录也就不仅仅只存储32位操作系统库文件，而是作为了主共享库。

在如今的**Ubuntu**系统中，就已经不再区分/lib64  和 /lib 了，大部分安装的软件库文件都在 /usr/lib中。而/lib64仅仅作为补充。所以/usr/lib/目录中文件非常多，而/usr/lib64/目录下文件比较少。
而在Rocky Linux等redhat系列的linux 发行版中，/usr/lib64/目录下的库文件还是非常多的，还是保留了将/usr/lib64/作为64位操作系统的主目录。

③ **/usr/libexec/** 目录主要存放的是程序的执行文件
 `/usr/libexec` —— 程序的内部执行文件
`libexec` 里面不是库，而是 **给程序内部调用的可执行文件**。