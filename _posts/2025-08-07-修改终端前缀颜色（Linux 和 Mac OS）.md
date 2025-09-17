---
layout:       post
title:        "修改终端前缀颜色（Linux 和 Mac OS）"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - 终端

---

#### Linux

1、进入 `root` 模式 `sudo su`
2、打开 `/root/.bashrc` 这个文件 `vim /root/.bashrc`
3、找到下面这段内容
```sh
if [ "$color_prompt" = yes ]; then
	PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
else
	PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
fi
```
这段内容表示在不同的模式下显示不同的颜色，主要由 `color_prompt` 这个变量决定，但是这个变量不用修改。
4、修改想自定义的样式
我是设置用户字段为红色对比普通用户模式下的绿色，路径字段跟普通用户模式下一样都是蓝色，内容如下。
```sh
if [ "$color_prompt" = yes ]; then
	PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
else
	PS1='${debian_chroot:+($debian_chroot)}\[\033[01;31m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
fi
```

除此之外还有其他模式如下

| 颜色       | 代码         |
| -------- | --------- |
| **红色**   | `\e[0;31m` |
| **绿色**   | `\e[0;32m` |
| **黄色**   | `\e[0;33m` |
| **蓝色**   | `\e[0;34m` |
| **紫色**   | `\e[0;35m` |
| **青色**   | `\e[0;36m` |
| **加粗**   | `\e[1m`    |
| **重置颜色** | `\e[0m`    |
注意：**颜色代码必须用`\[`和`\]`包裹**，避免终端换行计算错误。

#### MacOS
macOS 普通用户从 Catalina 开始默认使用 zsh，但是 root 用户默认仍使用 bash 或者 sh。
我这里把 root 用户的 shell 修改为 zsh。
1、修改 root 用户的 shell 为 zsh
```sh
# 其中 /bin/sh 为当前shell， /bin/zsh 为目标shell
sudo dscl . -change /Users/root UserShell /bin/sh /bin/zsh
# 验证
echo $SHELL
# or
dscl . -read /Users/root UserShell
```
2、配置 .zshrc
把 root 用户的 shell 设置为 zsh 之后，每次从普通用户切换到 root 用户都会自动 `source ~/.zshrc`，所以比较简单的方法就是把下面的代码同时添加到普通用户和 root 用户中的 .zshrc 文件。
```sh
if [ "$(id -u)" -eq 0 ]; then
    PROMPT="%F{red}%n%f@%F{yellow}%m%f:%F{blue}%~%f# "  # root用户
else
    PROMPT="%F{green}%n%f@%F{cyan}%m%f:%F{blue}%~%f$ "  # 普通用户
fi
```
这个配置会把路径名全显示，我比较习惯这种风格，如果不想显示全路径名的话可以使用下面的配置。
```sh
if [ $(id -u) -eq 0 ]; then
    PROMPT="%F{red}%n@%m:%F{blue}%1~ %#%f "  # 红色提示符
else
    PROMPT="%F{green}%n@%m:%F{blue}%1~ %#%f "  # 普通用户绿色
fi
```
3、重启
重启终端或者使用 `source ~/.zshrc` 刷新配置。