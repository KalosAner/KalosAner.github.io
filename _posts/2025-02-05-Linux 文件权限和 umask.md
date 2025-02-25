---
layout:       post
title:        "Linux 文件权限和 umask"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - 后端
    - Linux
---

在 Linux 系统中，进程的 `umask` 会决定创建出的文件和目录的默认权限。`umask` 默认为 `022` ，这意味着创建出的文件权限为 644（`rw-r--r--`），目录权限为 755（`rwxr-xr-x`）。

> 文件权限的表示方法都是二进制对应着权限的有无，分别对应着：`root` 用户，用户组用户，拥有者的权限。例如这里的 6 就是 `root` 用户，它的二进制表示为 `110` 对应着 `rwx` ，由于最后一位为 0，也就是没有 `x` 权限。

`umask` 不会决定进程有没有权限创建文件，只会决定创建出来的文件可以由哪些用户进行读写和执行权限。

将 `umask` 设置为 0 时，将不屏蔽任何权限。新创建的文件将具有 666 权限（即 `rw-rw-rw-`），目录将具有 777 权限（即 `rwxrwxrwx`）。
