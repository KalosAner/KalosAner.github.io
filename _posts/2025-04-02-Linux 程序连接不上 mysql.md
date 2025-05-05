---
layout:       post
title:        "Linux 程序连接不上 mysql"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - 后端
    - Linux
    - C++
    - 问题
---

#### 一、前言

在 Linux 上使用 C++ 写了一段代码，需要连接 mysql，该引入的头文件和动态库都已经下载好，但是还是连接失败。

```cpp
_conn = mysql_init(nullptr);

MYSQL *p = mysql_real_connect(_conn, server.c_str(), user.c_str(), password.c_str(), dbname.c_str(), 3306, nullptr, 0);
```

如上代码，返回的 `p` 指针是个 `nullptr`。

#### 二、问题

一般安装 mysql 的时候都会使用如下命令进行配置：

```sh
# 登录mysql，在默认安装时如果没有让我们设置密码，则直接回车就能登录成功。
sudo mysql -uroot -p
# 设置密码 mysql8.0，我一般设置 123456
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '新密码';
# 刷新缓存
flush privileges;
```

但是我安装的时候忘记用这个命令进行配置了，导致每次登录都需要使用 Linux 的 root 用户才能登录。

#### 三、解决

重新配置以下就好了。

```sh
# 登录mysql，在默认安装时如果没有让我们设置密码，则直接回车就能登录成功。
sudo mysql -uroot -p
# 设置密码 mysql8.0，我一般设置 123456
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '新密码';
# 刷新缓存
flush privileges;
```

