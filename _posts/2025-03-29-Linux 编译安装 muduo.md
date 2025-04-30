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

```cpp
#include <muduo/net/TcpServer.h>
#include <muduo/base/Logging.h>
#include <boost/bind.hpp>
#include <muduo/net/EventLoop.h>
 
// 使用muduo开发回显服务器
class EchoServer
{
 public:
  EchoServer(muduo::net::EventLoop* loop,
             const muduo::net::InetAddress& listenAddr);
 
  void start(); 
 
 private:
  void onConnection(const muduo::net::TcpConnectionPtr& conn);
 
  void onMessage(const muduo::net::TcpConnectionPtr& conn,
                 muduo::net::Buffer* buf,
                 muduo::Timestamp time);
 
  muduo::net::TcpServer server_;
};
 
EchoServer::EchoServer(muduo::net::EventLoop* loop,
                       const muduo::net::InetAddress& listenAddr)
  : server_(loop, listenAddr, "EchoServer")
{
  server_.setConnectionCallback(
      boost::bind(&EchoServer::onConnection, this, _1));
  server_.setMessageCallback(
      boost::bind(&EchoServer::onMessage, this, _1, _2, _3));
}
 
void EchoServer::start()
{
  server_.start();
}
 
void EchoServer::onConnection(const muduo::net::TcpConnectionPtr& conn)
{
  LOG_INFO << "EchoServer - " << conn->peerAddress().toIpPort() << " -> "
           << conn->localAddress().toIpPort() << " is "
           << (conn->connected() ? "UP" : "DOWN");
}
 
void EchoServer::onMessage(const muduo::net::TcpConnectionPtr& conn,
                           muduo::net::Buffer* buf,
                           muduo::Timestamp time)
{
  // 接收到所有的消息，然后回显
  muduo::string msg(buf->retrieveAllAsString());
  LOG_INFO << conn->name() << " echo " << msg.size() << " bytes, "
           << "data received at " << time.toString();
  conn->send(msg);
}
 
 
int main()
{
  LOG_INFO << "pid = " << getpid();
  muduo::net::EventLoop loop;
  muduo::net::InetAddress listenAddr(8888);
  EchoServer server(&loop, listenAddr);
  server.start();
  loop.loop();
}
```

编译运行

```sh
g++ muduoTest.cpp -lmuduo_net -lmuduo_base -lpthread -std=c++11 -o muduoTest
./muduoTest
```

客户端输入

```sh
echo "hello world" | nc localhost 8888
```

