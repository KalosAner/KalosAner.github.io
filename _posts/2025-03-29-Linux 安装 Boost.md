---
layout:       post
title:        "Linux 安装 Boost"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - 后端
    - C++
    - Linux
---

#### 一、安装依赖

本机测试环境 ubuntu 20。

安装编译工具：

```sh
sudo apt install gcc g++
```

安装依赖库：

```sh
sudo apt install mpi-default-dev libicu-dev libbz2-dev
```

#### 二、编译安装

B2 是Boost.Build的简写，目的在于使得编译C++项目更加便捷. Boost库的源码编译采用了B2工具.

##### 下载

在 [https://www.boost.org/users/history/](https://www.boost.org/users/history/) 选择合适版本的源码包下载，解压 `tar -zxvf boost_1_80_0`，并进入文件夹。

我下载的是 [1.80 版本](https://archives.boost.io/release/1.80.0/source/boost_1_80_0.tar.gz)。

##### 编译设置

```sh
./bootstrap.sh
```

产生4个新文件：

1. `b2`
2. `bjam`
3. `bootstrap.log`
4. `project-config.jam`

##### 启用 MPI 支持

如果想启用 MPI 支持，可以在 `project-config.jam`文件末尾加上 `using mpi ;`。

> `using mpi ;` 分号之前要加空格，不然会报错。

> Boost.MPI 是 Boost 库中用于并行计算的模块，它封装了 MPI（消息传递接口），方便用户利用 MPI 编写分布式 C++ 应用程序。添加“using mpi ;”命令后，Boost.Build 会激活 MPI 相关的配置，从而在编译 Boost 库时识别并构建 Boost.MPI 模块。

boost 包含众多独立的库，使用 `--show-libraries` 查看将会编译安装的库文件列表：

```sh
./bootstrap.sh --show-libraries
```

查看更多设置选项：

```sh
./bootstrap.sh -h
```

##### 编译

```sh
./b2
```

编译得到的库文件在`${boost_version}/stage/lib/`目录下，头文件在`${boost_version}/boost`目录下。而且编译的时候内存要足够，不然可能会出错。

##### 安装到系统目录

安装到默认系统目录：

```sh
sudo ./b2 install
```

库文件安装到`/usr/local/lib`目录下，头文件安装到`/usr/local/include/boost`目录下。

如果安装到系统默认目录后仍提示boost库未找到，则需要手动安装到 `/usr/lib/x86_64-linux-gnu/` 目录下：

```sh
sudo chmod -x stage/lib/libboost*.so.*
sudo cp stage/lib/libboost*.so.* /usr/lib/x86_64-linux-gnu/
```

##### 卸载方法

默认的头文件在/usr/local/include/boost目录下，库文件在/usr/local/lib/目录下. 因此直接删除文件即可.

```sh
sudo rm -rf /usr/local/include/boost
sudo rm -rf /usr/local/lib/libboost*
```

#### 三、使用

##### 代码：

```Cpp
#include <iostream>
#include <boost/filesystem.hpp>

namespace fs = boost::filesystem;

int main()
{
    try {
        // 获取当前工作目录
        fs::path currentPath = fs::current_path();
        std::cout << "当前工作目录：" << currentPath.string() << std::endl;

        // 判断当前路径是否为目录
        if (fs::is_directory(currentPath)) {
            std::cout << "目录内容：" << std::endl;
            // 遍历目录中的所有条目
            for (const auto &entry : fs::directory_iterator(currentPath)) {
                std::cout << "  " << entry.path().filename().string() << std::endl;
            }
        } else {
            std::cout << "当前路径不是一个目录！" << std::endl;
        }
    } catch (const fs::filesystem_error &ex) {
        std::cerr << "Filesystem error: " << ex.what() << std::endl;
    } catch (const std::exception &ex) {
        std::cerr << "Error: " << ex.what() << std::endl;
    }
    return 0;
}
```

##### 编译：

```sh
g++ -std=c++11 boostTest.cpp -lboost_system -lboost_filesystem -o boostTest
```

