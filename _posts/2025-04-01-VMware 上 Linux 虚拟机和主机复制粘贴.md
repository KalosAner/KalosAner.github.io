---
layout:       post
title:        "VMware 上 Linux 虚拟机和主机复制粘贴"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - 后端
    - Linux
---

虚拟机和主机复制粘贴需要满足的条件：

1、安装 vm-tools

我是通过 VMware 安装的，除此之外也可以通过命令 `apt-get install open-vm-tools-desktop` 安装。

可以使用命令 `systemctl status vmtoolsd` 查看服务是否启动。

2、 开启时间同步

![Snipaste_2025-05-02_09-19-03](\img\in-post\Snipaste_2025-05-02_09-19-03.png)

3、设置设备状态为“启动时连接”，并且设置“使用 ISO 映像文件”

![Snipaste_2025-05-02_09-21-50](\img\in-post\Snipaste_2025-05-02_09-21-50.png)

4、查看虚拟机的配置文件（.vmx），确认是否存在禁用复制粘贴的配置项

```
isolation.tools.copy.disable = "true"
isolation.tools.paste.disable = "true"
```

如果有，将这两项的值改为 `"false"` 或删除相关设置，然后重启虚拟机以使配置生效。

5、网上有人说也需要打开共享文件夹，我测试发现不需要打开共享文件夹，不知道不同的版本是否有差异。

![Snipaste_2025-05-02_09-29-41](\img\in-post\Snipaste_2025-05-02_09-29-41.png)

> 我使用的是 Ubuntu20，设置好之后可以复制粘贴文字和文件等，也可以向文件夹拖动文件，但是没法向桌面拖文件。
