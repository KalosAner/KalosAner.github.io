---
layout:       post
title:        "Linux的一些快捷键（hot keyboard）"
author:       "kalos Aner"
header-style: text
catalog:      true
tags:
    - Linux
    - 快捷键

---

Ctrl + Alt + t：打开bash（就是命令框窗口）
Ctrl + Alt + F3~F6：打开 tty 终端（纯命令行终端，每个Linux发行版不相同，我的是Ubuntu20版）
Alt + F4：关闭当前窗口（Windows下也有这个）
以下是终端中的快捷键：

| 快捷键           | 执行结果                           |
| ---------------- | ---------------------------------- |
| Ctrl + Shift + C | 复制选中的文本。                   |
| Ctrl + Shift + V | 粘贴文本。                         |
| Ctrl + H         | 等于backspace，删除光标前一个字符  |
| Ctrl + D         | 等于delete，删除光标后的一个字符   |
| Ctrl + A         | 将光标移到行首。                   |
| Ctrl + E         | 将光标移到行尾。                   |
| Ctrl + U         | 删除从光标到行首的文本。           |
| Ctrl + Y         | 恢复之前删除的文本                 |
| Ctrl + K         | 删除从光标到行尾的文本。           |
| Ctrl + W         | 删除光标前的一个单词。             |
| Ctrl + T         | 把光标签一个字符向后拖             |
| Ctrl + P         | 相当于方向键的Up键，找到上一条指令 |
| Ctrl + N         | 相当于方向键的Down键               |
| Ctrl + B         | 相当于方向键的Left键               |
| Ctrl + F         | 相当于方向键的Right键              |
| Alt + D          | 删除光标后的一个单词。             |
| Ctrl + L         | 清屏。                             |
| Ctrl + C         | 终止当前命令。                     |
| Ctrl + D         | 退出当前Shell。                    |
| Ctrl + R         | 搜索历史命令。                     |
| !!               | 执行上一条命令。                   |
| !n               | 执行历史记录中的第n条命令。        |
| Tab              | 文件名、命令、变量名等的自动补全。 |
| Ctrl + Z         | 将当前命令置于后台。               |
| jobs             | 查看当前作业。                     |
| fg               | 将后台作业移到前台。               |

其实终端中的部分命令可以在终端查得到，在bash中输入`stty -a`，就会得到如下图

![2a630762f4a9fb7ed45129f1740dac93](\img\in-post\2a630762f4a9fb7ed45129f1740dac93.png)

图中主要符合的含义如下：

![c1e4136c0da663069803a8d6a976f3fc](\img\in-post\c1e4136c0da663069803a8d6a976f3fc.png)
