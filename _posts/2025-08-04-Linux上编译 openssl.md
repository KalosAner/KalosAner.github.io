---
layout:       post
title:        "Linux上编译 openssl"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - 编译

---

编译流程如下，值得注意的一点时，如果不在 `./config --prefix=/usr/local/openssl --openssldir=/usr/local/openssl` 中指定编译工具就会使用默认的编译工具。使用默认编译工具编译出来的包，如果在另外一个软件的编译过程中被引用了，而且另外一个软件的编译是交叉编译，那么另外一个软件的编译有可能会失败。
```sh
wget https://www.openssl.org/source/openssl-1.1.1g.tar.gz
tar -xzvf openssl-1.1.1g.tar.gz
cd openssl-1.1.1g
./config --prefix=/usr/local/openssl --openssldir=/usr/local/openssl
make depend    # 建立依赖关系
make           # 开始编译（这步需要较长时间）
sudo make install
echo 'export OPENSSL_PATH="/usr/local/openssl"' >> ~/.bashrc
source ~/.bashrc
```