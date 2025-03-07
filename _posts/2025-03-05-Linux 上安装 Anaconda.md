---
layout:       post
title:        "Linux 上安装 Anaconda"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - 后端
    - Linux
    - Anaconda
---

#### 一、下载

首先在官网仓库找自己需要的版本，[https://repo.anaconda.com/archive/](https://repo.anaconda.com/archive/)。以 [Anaconda3-2024.06-1-Linux-x86_64.sh](https://repo.anaconda.com/archive/Anaconda3-2024.06-1-Linux-x86_64.sh) 为例，在终端输入 `wget https://repo.anaconda.com/archive/Anaconda3-2024.06-1-Linux-x86_64.sh`。这一步是下载批处理命令脚本，安装成功效果如下图。

![Snipaste_2025-03-05_10-42-54](\img\in-post\Snipaste_2025-03-05_10-42-54.png)

> 如果没有 `wget` 可以在 `root` 权限下通过 `apt-get install -y wget` 进行安装。

#### 二、安装

然后输入 `chmod +x Anaconda3-2024.06-1-Linux-x86_64.sh` 给脚本添加执行权限。再输入 `./Anaconda3-2024.06-1-Linux-x86_64.sh` 执行。

![Snipaste_2025-03-05_10-59-03](\img\in-post\Snipaste_2025-03-05_10-59-03.png)

然后一直按 `Enter` 直到需要输入 `yes` 的时候输入 `yes`，这时候会再让点一次 `Enter` 最好不要多点，多点会错过配置环境变量。

![Snipaste_2025-03-05_10-59-55](\img\in-post\Snipaste_2025-03-05_10-59-55.png)

> 结束后会提示是否添加到系统环境变量中，如果这里不小心点 Enter 会跳过这一步。
>
> 如果跳过了这一步的话网上有教程说在 `~/.bashrc` 目录或者 `/etc/profile` 目录添加 `export PATH=/root/anaconda3/bin:$PATH` 但是我并没有成功。

安装完成后需要重新打开一个终端输入 `anaconda -V` 或者 `conda -V` 查看是否安装成功。

#### 三、卸载

找到 Anaconda 的安装目录，默认是 `~/anaconda3` ，然后删掉该文件夹，`sudo rm -rf ~/anaconda3`。

**修改配置**

```
vim ~/.bashrc
sudo vim /etc/profile
```

把上面两个文件里的 `export PATH=path/anaconda3/bin:$PATH` 全删掉或者注释掉。

**更新配置文件**

```html
source  ~/.bashrc
source /etc/profile
```
