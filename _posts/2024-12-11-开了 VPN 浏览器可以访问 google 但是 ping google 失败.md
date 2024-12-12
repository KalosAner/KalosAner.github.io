---
layout:       post
title:        "开了 VPN 浏览器可以访问 google 但是 ping google 失败"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - VPN
---

#### 问题：

使用 Clash 开了 VPN，而且浏览器可以访问外网，但是使用终端 ping google.com 却显示超时。

#### 解决：

开 VPN 基本上都是打开的**系统代理**，系统代理就是字面上的将系统的代理设置设置为 Clash，而软件是否走系统代理，则是看软件自身，常见的例子就是终端你需要手动设置环境变量才能让里面的请求走代理。

如果需要所有流量都走代理，可以开启 TUN，TUN是设置了一个虚拟网卡，所有流量都会经过这个虚拟网卡，由不得你走不走代理，所有的流量都会被接管分流。开启TUN模式之前需要先安装并打开下边的服务模式。

注意：这两个单独开一个就行了，不要全都开。

也可以通过配置环境变量的方式实现终端的请求走系统代理。代码如下，但是我没有进行测试。

添加到`~/.bashrc`或`~/.zshrc`文件

```sh
# 设置使用代理
alias setproxy="export http_proxy=http://127.0.0.1:7897; export https_proxy=$http_proxy; export all_proxy=socks5://127.0.0.1:7897; echo 'Set proxy successfully'"

# 设置取消使用代理
alias unsetproxy="unset http_proxy; unset https_proxy; unset all_proxy; echo 'Unset proxy successfully'"
```

注：每个人的端口可能不一样，我的是 7897。

可以通过 `curl https://www.google.com` 测试。
