---
layout:       post
title:        "vscode 的 remote-ssh 插件远程连接失败"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - 后端
    - Linux
    - SSH
---

#### 一、问题

使用 Windows 上的 vscode 的 remote-ssh 插件远程连接虚拟机中的 Ubuntu 时每次选择完 "platform" 等待一会儿就会提示失败，而不会提示输入密码。

#### 二、原因

原因是我之前使用 Windows 上的 vscode 连接虚拟机的 Ubuntu，这个过程中 Windows 上已经保存了密钥在 "C:\Users\Administrator\.ssh\known_hosts" 和 "C:\Users\Administrator\.ssh\known_hosts.old" 中，后来虚拟机的 Ubuntu 重新安装了操作系统，但是 Windows 上的密钥并没有改变，所以每次连接都是失败。

#### 三、解决

就把 "C:\Users\Administrator\.ssh\known_hosts" 和 "C:\Users\Administrator\.ssh\known_hosts.old" 中相应的密钥删掉就行了，但是删除时要注意这个文件并不是只保存了连接虚拟机的密钥，也保存了其他 ssh 连接的密钥，删除的时候不要删除掉其他 ssh 连接的密钥。



**如果想验证密钥是否正确可以使用 `ssh <username>@<ip.address> -p 22` 命令进行验证。**



#### 后记

如果还是失败可以在设置里边输入 **`remote.SSH.useLocalServer`** 查看一下这个是否启用了，设置成如图就是启用了。

![Snipaste_2025-02-19_17-01-58](\img\in-post\Snipaste_2025-02-19_17-01-58.png)
