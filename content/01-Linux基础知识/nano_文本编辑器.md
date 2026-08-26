# nano
**<font style="color:rgb(15, 17, 21);">Nano</font>**<font style="color:rgb(15, 17, 21);"> 是一个轻量级、命令行下的文本编辑器，设计理念是"</font>**<font style="color:rgb(15, 17, 21);">简单易用</font>**<font style="color:rgb(15, 17, 21);">"。它的最大特点是：底部一直显示快捷键提示，不需要像 Vim 那样先学习模式切换。</font>

<font style="color:rgb(15, 17, 21);"></font>

<font style="color:rgb(15, 17, 21);">了解一下，偶尔在轻量级 的镜像容器种会使用到。</font>

<font style="color:rgb(15, 17, 21);"></font>

+ **<font style="color:rgb(15, 17, 21);">默认安装</font>**<font style="color:rgb(15, 17, 21);">：很多轻量级 Linux（如 Alpine）默认有 nano 或 vi，但 nano 更直观</font>

```bash
nano filename          # 打开文件
nano -c filename       # 显示行号和列号（方便定位）
```

<!-- 这是一张图片，ocr 内容为： -->
![[1778144646877-6598987b-93a2-42a3-838c-9006a0eaef45.png]]



# 核心快捷键
| <font style="color:rgb(15, 17, 21);">快捷键</font> | <font style="color:rgb(15, 17, 21);">作用 </font> |
| --- | --- |
| <font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">^</font> | <font style="color:rgb(15, 17, 21);"> </font><font style="color:rgb(15, 17, 21);">表示 Ctrl 键）</font> |
| <font style="color:rgb(15, 17, 21);background-color:rgb(235, 238,242);">^X</font>| **<font style="color:rgb(15, 17, 21);">退出</font>**<font style="color:rgb(15, 17, 21);">（会提示是否保存）</font> |
| <font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">^O</font> | **<font style="color:rgb(15, 17, 21);">保存</font>**<font style="color:rgb(15, 17, 21);">（Write Out）</font> |
| <font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">^R</font> | <font style="color:rgb(15, 17, 21);">读取其他文件插入到当前位置</font> |
| <font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">^W</font> | <font style="color:rgb(15, 17, 21);">查找（搜索）</font> |
| <font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">^G</font> | <font style="color:rgb(15, 17, 21);">帮助文档</font> |



## 编辑相关
| 快捷键                                                                                | 作用                                                      |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------- |
| \^K                                                                                | 剪切当前行（或选中文本后剪切）                                         |
| \^U                                                                                | 粘贴（Uncut）                                               |
| <font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">^J</font> | <font style="color:rgb(15, 17, 21);">对齐段落（调整换行）</font>  |
| <font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">^T</font> | <font style="color:rgb(15, 17, 21);">拼写检查（如果安装了）</font> |

## <font style="color:rgb(15, 17, 21);">光标移动和选择</font>
| <font style="color:rgb(15, 17, 21);">快捷键</font> | <font style="color:rgb(15, 17, 21);">作用</font> |
| --- | --- |
| <font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">^A</font> | <font style="color:rgb(15, 17, 21);">跳到行首</font> |
| <font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">^E</font> | <font style="color:rgb(15, 17, 21);">跳到行尾</font> |
| <font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">^Y</font> | <font style="color:rgb(15, 17, 21);">上一页</font> |
| <font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">^V</font> | <font style="color:rgb(15, 17, 21);">下一页</font> |
| <font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">^_</font> | <font style="color:rgb(15, 17, 21);">跳转到指定行号</font> |
| <font style="color:rgb(15, 17, 21);background-color:rgb(235, 238, 242);">^6</font> | <font style="color:rgb(15, 17, 21);">开始选择文本（然后移动光标选中区域）</font> |


