---
layout: post
title: 在C语言中运行 dpkg 出现 install ok unpacked 的问题
author: Kalos Aner
header-style: text
catalog: true
tags:
  - 后端
  - Linux
---
#### 问题：
在 C 语言中使用 system("dpkg -i xxx.deb") 安装软件包时软件包卡在 install ok unpacked 状态。

#### 原因：
程序运行在 Linux 上，后台运行，执行 system("dpkg -i xxx.deb") 终端已经被关闭，标准流（0，1，2）中 1 和 2 指向的“文件”（类似 /dev/pts/9，其实是个伪终端）显示 deleted。大概原因是因为进程无法输出，运行 system("dpkg -i xxx.deb") 时 dpkg 进程继承了 C 语言进程的标准流，导致 dpkg 运行过程中也无法输出导致 dpkg 进程终止。

#### 解决：
可以在 C 语言中把标准流重定向为 `/dev/null`，这样进程的标准流指向的文件就不会被删除了。或者启动程序时在末尾加上 `>/dev/null 2>&1` 也同样可以重定向进程的标准流。


