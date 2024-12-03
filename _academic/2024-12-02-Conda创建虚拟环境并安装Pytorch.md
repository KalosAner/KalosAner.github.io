---
layout:       post
title:        "Conda创建虚拟环境并安装Pytorch"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - Conda
    - python
---

### 概述

本文主要针对在Anaconda3中创建虚拟环境并安装Pytorch学习框架，Ubuntu和Windows下操作基本一致。

### 创建虚拟环境

在终端下，创建环境的命令是

```sh
conda create -n your_env_name(虚拟环境名称) python==xx(想要创建的虚拟环境的python版本号)
```

可以根据自己需要修改，例如要创建基于python_3.8的1.7版本的pytorch。

### 虚拟环境的激活与切换

虚拟环境创建完成之后，终端输入以下命令即可激活虚拟环境。

```sh
# 激活虚拟环境
conda activate your_env_name(虚拟环境名称)
# 退出当前虚拟环境
conda deactivate
```

如果需要切换虚拟环境，建议先退出当前虚拟环境，再进入需要切换到的环境。 否则就会发生虚拟环境的嵌套，容易误操作。

此外，还可以用"conda info -e"和"conda env list"来查看当前已经安装的虚拟环境信息及位置， 两个函数效果一样。

```sh
conda info -e
conda env list
```

### 安装Pytorch

激活环境之后，就可以在环境中安装pytorch框架。 进入[Pytorch官网](https://pytorch.org/)点击 get started 进行选择。

![Snipaste_2024-12-02_12-29-55](\img\in-post\Snipaste_2024-12-02_12-29-55.png)

![Snipaste_2024-12-02_12-30-37](\img\in-post\Snipaste_2024-12-02_12-30-37.png)

注：如果想安装之前的版本可以点击上图中的 [install previous versions of PyTorch](https://pytorch.org/get-started/previous-versions) 链接。

例如pytorch2.1（pytorch 版本应该和 python 版本匹配，不然会报错，pytroch2.1对应python3.8~3.11），复制相应的命令到终端即可安装。

```sh
conda install pytorch==2.1.0 torchvision==0.16.0 cudatoolkit=11.7 -c pytorch -c nvidia
conda install pytorch==2.1.0 torchvision==0.16.0 cudatoolkit=11.8 -c pytorch -c nvidia
```

可根据需要修改安装版本，但需要提前查询[版本对应关系](https://kalosaner.github.io/2024/12/02/PyTorch-TorchVision-CUDA-Toolkit-%E5%92%8C-Python-%E7%89%88%E6%9C%AC%E7%9A%84%E5%AF%B9%E5%BA%94%E5%85%B3%E7%B3%BB/)。
`-c` 参数是选择指定的 channel，`-c pytorch` 表示从 PyTorch 官方 Conda 仓库 下载 PyTorch 相关的包。

注意：目前发现删除 -c pytorch 之后 conda 无法找到 torchvision0.5.0，安装时可删除 “torchvision==0.5.0”，待框架安装完毕在自己创建的虚拟环境下用pip安装即可。
conda安装pytorch可以直接复制命令到终端执行。 以下以pytorch_1.7、CUDA11.0为例。

![c9456ca53685876b958f09dd7c3cd5ad](\img\in-post\c9456ca53685876b958f09dd7c3cd5ad.png)

终端提示上述信息说明pytorch框架安装成功。

### 进行验证

在自己创建的虚拟环境中，依次执行以下代码进行验证：

```sh
python 
import torch 
torch.cuda.is_available() 
```

提示True说明框架配置成功，且GPU可用。

### 虚拟环境的复制、复现与删除

如果工作站已经配置好了某一环境，但出于互不干扰的考虑，需要另外创建一个各软件、库均相同的版本，可以直接利用conda的复制命令。

例如我想复制xwb创建的python3.6和pytorch1.4的虚拟环境，可以直接在终端输入

```sh
conda create -n your_env_name(要创建的虚拟环境名称) --clone env_name(要复制的虚拟环境名称)
```

进行虚拟环境的复制。
**注意**：复制环境时一定要提前更改名字，以免导致环境错乱。
复制完成之后激活进入使用。

需要注意的是conda复制时只会将原来环境中用conda install等命令安装的包进行复制，不能够复制pip等命令安装的包和软件。

如果想要导出配置好的虚拟环境，并在另外一台设备上进行虚拟环境的复现。
可以激活进入需要导出复现的虚拟环境，然后在终端执行

```sh
conda env export > environment.yaml 
```

执行后会在根目录生成一个environment.yaml的文件。

复制该文件到另外一台设备的根目录，在终端执行`conda env create -f environment.yaml`命令即可复现虚拟环境。

注意：以上操作在win10中可以复现，不同操作系统的设备不能相互复现。

而如果觉得某一个虚拟环境多余，就可以直接对其进行删除操作（**不可逆，请谨慎操作**）

```sh
conda remove -n your_env_name(虚拟环境名称) --all 删除虚拟环境
```

### Jupyter notebook的安装与使用

每一个虚拟环境都需要安装jupyter notebook。

```javascript
conda install jupyter notebook
```

![f2b1ccb6ae07b48621c0553716bade0a](\img\in-post\f2b1ccb6ae07b48621c0553716bade0a.png)

终端提示上述信息说明juputer notebook安装成功。

### 包的安装

默认情况下包会安装在 base 环境，每个环境的包是不互通的，安装在 base 环境下的包不能在虚拟环境使用。

所以安装包的时候最好激活进入到自己的虚拟环境之后再进行包的安装等操作。

