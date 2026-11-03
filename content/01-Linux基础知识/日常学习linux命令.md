# screen
### 终端复用器
>[!inote] 使用场景
>需要一个命令一直跑着，之后退出shell这个任务也在运行
>比如：开启deepseek-harness的web页面，需要启动命令 dsh web
>opencode启动web功能，也需要 opencode web

### 完整工作流程示例
```bash
# 1.创建会话,会进入一个新的shell
screen -S opencode

opencode web

# 3.按 Ctrl+A d 分离，回到初始的shell，之前的opencode web命令会继续跑，不断开

# 4. 之后重新进入opencode的shell，先查看会话列表
screen -ls

# 5.接回去看opencode的会话内容
screen -r opencode

# 6. opencode会话跑完了想退出，直接exit关闭会话
exit
```

### 特殊情况
```bash
# 如果 screen -r opencode ， 提示opencode这个会话别人在使用
# 可以加 -d 强制抢过会话
screen -d -r opencode

# 外部直接杀掉会话，不用进opencode会话操作
screen -X -S opencode quit 

# 想多人看一个会话，可以看到别人操作，多人共享画面
screen -x opencode
```

### 快捷键
| 快捷键          | 作用                                          |
| ------------ | ------------------------------------------- |
| `Ctrl+A d`   | **分离会话（detach）**，放到后台继续跑，返回普通 shellCSDN博... |
| `Ctrl+A c`   | 新建一个 shell 窗口（一个 screen 内部多个窗口）             |
| `Ctrl+A n`   | 切换下一个窗口                                     |
| `Ctrl+A p`   | 切换上一个窗口                                     |
| `Ctrl+A 0~9` | 按编号切窗口                                      |
| `Ctrl+A "`   | 弹出窗口列表，方向键选择                                |
