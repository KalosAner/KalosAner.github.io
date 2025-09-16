---
layout:       post
title:        "设置 MacBook iTerm2 终端 ls 显示颜色"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - 终端


---
git@github.com:plctlab/riscv-operating-system-mooc.git
#### 问题：

MacBook 上的 iTerm2 是 MacBook 比较好用的终端，但是 MacBook 的 ls 指令不支持显示颜色。

#### 解决：

前置条件可能需要设置 iTerm2 支持颜色，因为我一开始就设置了很多东西，所以不记得这个需不需要再设置。

我这里的解决办法就是使用 `gunls` ，方法很简单，按照如下执行就可以使用。

```sh
# 安装 GNU coreutils
brew install coreutils
# 创建正确格式的配置文件
cat > ~/.dir_colors << 'EOF'
# 基本文件类型
NORMAL 00
FILE 00
DIR 01;34
LINK 01;36
FIFO 40;33
SOCK 01;35
BLK 40;33;01
CHR 40;33;01
ORPHAN 40;31;01
MISSING 00
EXEC 01;32

# 扩展名类型
.tar 01;31
.tgz 01;31
.zip 01;31
.gz 01;31
.bz2 01;31
.rar 01;31
.jpg 01;35
.jpeg 01;35
.png 01;35
.gif 01;35
.mov 01;35
.mp4 01;35
.avi 01;35
EOF

# 添加到 zshrc
echo "alias ls='gls --color=auto'" >> ~/.zshrc
echo "eval \$(gdircolors -b ~/.dir_colors)" >> ~/.zshrc
echo "export CLICOLOR_FORCE=1" >> ~/.zshrc

# 立即生效
source ~/.zshrc
```



#### 其他：

如果中途报错了，可以查看一下报错信息，是不是缺少什么。因为我提前设置了很多东西，所以这个方法在我这里可以直接使用。
