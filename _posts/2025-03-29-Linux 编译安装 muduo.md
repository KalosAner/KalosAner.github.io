---
layout:       post
title:        "Linux 编译安装 muduo"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - 后端
    - C++
    - Linux
---

#### 一、下载

本机测试环境 ubuntu 20。

直接从 GitHub 上下载：

```sh
git clone https://github.com/chenshuo/muduo
```

【注意】：muduo库是基于boost开发的，所以需要先在Linux平台上安装boost库。

**注意**，muduo库源码编译会编译很多unit_test测试用例代码，编译耗时长，我们也用不到，vim编辑上面源码目录里面的CMakeLists.txt文件，如下修改：

![Snipaste_2025-04-30_15-09-30](\img\in-post\Snipaste_2025-04-30_15-09-30.png)

保存并退出，继续下面的步骤。

#### 二、编译

看到有一个build.sh源码编译构建程序，运行该程序（注意：muduo是用cmake来构建的，需要先安装cmake，ubuntu下直接sudo apt-get install cmake就可以，redhat或者centos可以从yum仓库直接安装）：

拿ubuntu举例，如果没有安装cmake，执行下面的命令安装cmake：

```
apt-get install cmake
```

然后执行build.sh程序：

```
./build.sh
```

如果报错可以在根 `CMakeLists.txt` 中添加 `add_compile_options(-Wno-error)`。

#### 三、安装

编译完成后，再输入 `./build.sh install` 命令进行 muduo 库安装。

![Snipaste_2025-04-30_15-32-46.png](\img\in-post\Snipaste_2025-04-30_15-32-46.png)

这个 `./build.sh install` 实际上把 muduo 的 inlcude（头文件）和lib（库文件）放到了 muduo 同级目录下的 build 目录下的 release-install-cpp11 文件夹下面了。

所以上面的install命令并没有把它们拷贝到系统路径下，导致我们每次编译程序都需要指定muduo库的头文件和库文件路径，很麻烦，所以我们选择直接把 inlcude（头文件）和lib（库文件）目录下的文件拷贝到系统目录下。

假如现在在 muduo 目录下执行以下命令。

```sh
sudo su
cd ../build/release-install-cpp11/
cd include/
mv muduo/ /usr/include/
cd ../lib/
mv * /usr/local/lib/
```

#### 四、测试

回声客户端

```cpp
/*
    muduo 主要提供两个主要的类：
    TcpServer : 用于编写服务端程序
    TcpServer : 用于编写客户端程序

    epoll + 线程池
    好处：能够把网络 I/O 的代码和业务代码区分开

*/

#include <muduo/net/TcpServer.h>
#include <muduo/net/EventLoop.h>
#include <iostream>
#include <functional>

using namespace std;
using namespace muduo;
using namespace muduo::net;
using namespace placeholders;

/*
基于 muduo 网络库开发服务器程序步骤：
1、组合 TcpServer 对象
2、创建 EventLoop 时间循环对象的指针
3、明确 TCPServer 构造函数需要什么参数，输出 ChatServer 的构造函数
4、在当前服务器类的构造函数当中，注册处理连接的回调函数和处理读写事件的回调函数
5、设置合适的服务端线程数量，muduo 会自己分配 IO 线程和 work 线程
*/

class ChatServer
{
public:
    ChatServer(EventLoop *loop,               // 反应堆
               const InetAddress &listenAddr, // IP + port
               const string &nameArg) :       // 服务器名字
                                        _server(loop, listenAddr, nameArg), _loop(loop)
    {
        // 注册用户连接和断开的回调
        _server.setConnectionCallback(std::bind(&ChatServer::onConnection, this, _1));
        // 注册用户读写时间的回调
        _server.setMessageCallback(std::bind(&ChatServer::onMessage, this, _1, _2, _3));

        // 设置服务器端线程数
        _server.setThreadNum(4); // 其中1个是 IO 线程，3个工作线程
    }

    void start()
    {
        _server.start();
    }

private:
    // 处理用户连接的创建和断开
    void onConnection(const TcpConnectionPtr &conn)
    {
        if (conn->connected())
        {
            cout << conn->peerAddress().toIpPort() << "->" << conn->localAddress().toIpPort() << " :Online" << endl;
        }
        else
        {
            cout << conn->peerAddress().toIpPort() << "->" << conn->localAddress().toIpPort() << " :Offline" << endl;
            conn->shutdown();
            // _loop->quit();
        }
    }

    void onMessage(const TcpConnectionPtr &conn, Buffer *buffer, Timestamp time)
    {
        string buf = buffer->retrieveAllAsString();
        cout << "recv data:" << buf << " time:" << time.toString() << endl;
        conn->send(buf);
    }

    TcpServer _server;
    EventLoop *_loop;
};

int main()
{
    EventLoop loop; // epoll
    InetAddress addr("127.0.0.1", 6000);
    ChatServer server(&loop, addr, "ChatServer");

    server.start();   // listenfd epoll_ctl => epoll
    loop.loop();      // epoll_wait 以阻塞方式等待新用户连接

    return 0;
}
```

编译运行

```sh
g++ muduoTest.cpp -lmuduo_net -lmuduo_base -lpthread -std=c++11 -o muduoTest
./muduoTest
```

客户端输入

```sh
telnet 127.0.0.1 6000

# telnet 退出
Ctrl + ]
```

