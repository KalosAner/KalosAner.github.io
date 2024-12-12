---
layout:       post
title:        "Ubuntu 安装软件时提示缺少 libwebkit2gtk-4.1.0"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - 后端
    - Linux
---

#### 问题：

使用 `apt` 安装 .deb 文件提示：`E: Invalid operation ./Clash.Verge_2.0.1_amd64.deb`，但是不提示为什么不可用。

所以我使用 `gdebi` 安装软件。

```sh
sudo apt-get install gdebi 		#下载 gdebi
sudo gdebi xxx.deb				#安装 deb文件
```

然后报错：`Dependency is not satisfiable: libwebkit2gtk-4.1-0`。然后我就想用 `sudo apt install libwebkit2gtk-4.1.0` 安装这个库，发现安装失败，搜了一下是因为我的 Ubuntu20 不支持这个库，Ubuntu20 只支持 `libwebkit2gtk-4.0-dev` 这个库。（Ubuntu24 支持 `libwebkit2gtk-4.1.0` 而不支持 `libwebkit2gtk-4.0-dev`。）而我下载的软件依赖 `libwebkit2gtk-4.1.0`，所以没办法安装上。

#### 解决：

也没啥解决的办法，只能下载依赖  `libwebkit2gtk-4.0-dev`  的版本了。
