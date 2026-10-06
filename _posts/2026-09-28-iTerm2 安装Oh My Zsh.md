---
layout: post
title: iTerm2 安装Oh My Zsh
author: Kalos Aner
header-style: text
catalog: true
tags:
  - 终端
---

#### 背景：

Oh My Zsh 是**开源社区驱动的 Zsh 配置管理框架**，用来管理 Zsh 配置，自带**数百个主题 + 300 + 插件**（git、docker、npm、自动补全、语法高亮等），开箱美化终端，省去手写复杂 zsh 配置。MacOS终端默认使用zsh，所以可以直接安装Oh My Zsh，其他系统需要先安装zsh，zsh安装方法可以联网搜索。

#### 1、安装Oh My Zsh

安装需要使用 curl 或者 wget

```shell
#两种方法选择一种即可
# curl
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
# wget
sh -c "$(wget -O- https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

执行脚本后，会询问：**Do you want to change your default shell to zsh?** 输入 `y`，把 zsh 设置成默认 shell。

如果刚才没选 y 可以在安装完成之后输入 `chsh -s $(which zsh)` 进行设置。

#### 2、下载字体

使用 Oh My Zsh 推荐使用 Powerlevel10k 主题，这个主题是目前最流行的 Zsh 主题，速度快、颜值高、可定制性强。使用这个主题需要安装 Nerd Font。

Nerd Font 字体官网：https://www.nerdfonts.com/font-downloads

我个人比较喜欢使用 Iosevka Nerd Font 这个字体，如果没有偏好的字体推荐使用这个。下载好之后：

1. 点选你要安装的所有 `.ttf` 文件，不必安装完，根据需要安装就行
2. 右键选择「打开」→ 选择「字体册」
3. 点击「安装字体」，就会一次性批量完成安装

然后如下图所示，配置到 iTerm2 中。

![image-20261006下午42656144](/img/in-post/image-20261006下午42656144.png)

#### 3、安装 Powerlevel10k 主题

**安装主题**

```shell
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/themes/powerlevel10k
```

**启用主题**

编辑配置文件：

```shell
vim ~/.zshrc
```

找到 `ZSH_THEME` 这一行，修改为：

```shell
ZSH_THEME="powerlevel10k/powerlevel10k"
```

保存退出后，执行生效：

```shell
source ~/.zshrc
```

然后按照提示选择就行，不懂的可以自行搜索。

#### 4、装插件推荐

Oh My Zsh 自带 300+ 插件，以下是最实用的几个，按推荐优先级排序。

1、zsh-autosuggestions（必装）

**功能**：根据历史命令自动补全，输入时灰色显示建议，按 `→` 键接受整条建议，`Ctrl + →` 接受一个单词。

**安装**：

```shell
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

2、zsh-syntax-highlighting（必装）

**功能**：实时语法高亮，命令正确显示绿色，错误显示红色，引号未闭合显示黄色。

**安装**：

```shell
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

> **注意**：此插件必须放在 plugins 列表的**最后一个**。

然后搜索 `plugins=` 找到原本配置 plugins 的位置，配置 plugins 一定要在 `source $ZSH/oh-my-zsh.sh` 之前，不然不生效。找到之后替换成如下配置：

```shell
plugins=(
  git
  zsh-autosuggestions
  zsh-syntax-highlighting
)
```

#### 5、效果展示

![image-20261006下午45433433](/img/in-post/image-20261006下午45433433.png)
