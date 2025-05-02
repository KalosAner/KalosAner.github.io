---
layout:       post
title:        "Linux安装Redis（超详细，附图）"
author:       "程序猿子清"
header-style: text
catalog:      true
tags:
    - 后端
    - Linux
    - 转载
---

## 一、Linux安装Redis服务

[官网](https://redis.io/downloads/)下载redis压缩包

### 1.将下载的redis压缩包上传到linux

![在这里插入图片描述](\img\in-post\Reprint\155626b2a675cbb23e6a96990d8147ed.jpeg#pic_center)
![在这里插入图片描述](\img\in-post\Reprint\0981e8ab54d653683a9d30f1ba76d0df.jpeg#pic_center)

### 2.创建redis文件夹，文件夹可任意目录，我这里创建在/usr/local目录下

![在这里插入图片描述](\img\in-post\Reprint\76f407da8038542d2a15320efd39b6b6.jpeg#pic_center)

### 3.进入redis目录，将压缩包移动到redis目录

![在这里插入图片描述](\img\in-post\Reprint\42a5906959773f31f9b7dfa6511e0bdc.jpeg#pic_center)

### 4.解压redis

```powershell
tar -zxvf redis-6.2.12.tar.gz
```

![在这里插入图片描述](\img\in-post\Reprint\74df66775bc0e80d108b860a612fb226.jpeg#pic_center)

### 5.进入redis-6.2.12目录，依次执行以下命令

```powershell
make
```

![在这里插入图片描述](\img\in-post\Reprint\0e026b623c53eedb6fd0596f2efe3970.jpeg#pic_center)
make执行完毕，执行下面命令
![在这里插入图片描述](\img\in-post\Reprint\7aa8ac7165a96c373d66243cf950a02f.jpeg#pic_center)

```powershell
make install
```

![在这里插入图片描述](\img\in-post\Reprint\04ddf071f2fbe8f44d0612b64d4640f0.jpeg#pic_center)

### 6.修改配置文件redis.conf

```powershell
vim redis.conf
```

![在这里插入图片描述](\img\in-post\Reprint\34ccd560c16014bb3c0b0c853b0a42ef.jpeg#pic_center)
找到bind 127.0.0.1，可在配置文件输入斜杠’/‘，后接127.0.0.1
![在这里插入图片描述](\img\in-post\Reprint\6494f269c0e4e25c509df77a06b3ea3a.jpeg#pic_center)
将这一行注掉，输入命令‘i’， 新加一行bind 0.0.0.0，为了能够远程连接redis
![在这里插入图片描述](\img\in-post\Reprint\090f340d63eedc82eb46c680fca1223d.jpeg#pic_center)
如果还在INSERT模式，按ESC退出来，输入斜杠’/‘，后接daemonize，找到daemonize no
![在这里插入图片描述](\img\in-post\Reprint\900ea2e5c52ab4b40e42f680d8e312d2.jpeg#pic_center)
输入命令’i’，将no改为yes，启动redis服务的时候以后台方式运行
![在这里插入图片描述](\img\in-post\Reprint\0d2651076b9e2d494923b961bfa5fcd9.jpeg#pic_center)
输入斜杠’/‘，后接requirepass，找到requirepass foobared
![在这里插入图片描述](\img\in-post\Reprint\e333798aad37ec60f5212b09f90c3296.jpeg#pic_center)
取消注释，输入命令’i’，将foobared改为自己想要设置的密码
![在这里插入图片描述](\img\in-post\Reprint\182b7d1ad375ab36b08da90c48ca96c3.jpeg#pic_center)
基本配置就配置完成了，按ESC退出编辑模式，输入冒号’:'，后接wq，保存配置文件
![在这里插入图片描述](\img\in-post\Reprint\2ed2a59d42cbc8bf866dc2695bc92391.jpeg#pic_center)

### 7.启动redis服务

进入src目录，输入下面命令启动redis

```powershell
./redis-server /usr/local/redis/redis-6.2.12/redis.conf
```

![在这里插入图片描述](\img\in-post\Reprint\c6685a42cd0783a8629ebe409d672a7d.jpeg#pic_center)
查看redis运行情况

```powershell
ps -ef|grep redis
```

![在这里插入图片描述](\img\in-post\Reprint\65148d36493820f280e79e940d1e8e74.jpeg#pic_center)

### 8.连接redis客户端

```powershell
./redis-cli
```

![在这里插入图片描述](\img\in-post\Reprint\d7d886164bb7c8eb0583c828b57752f6.jpeg#pic_center)
而后我们输入命令会出现下面的错误，意思是我们配置了密码验证，需要输入密码
![在这里插入图片描述](\img\in-post\Reprint\3aa11c94b2e70aa5e20a5ccfeb9f69cf.jpeg#pic_center)
接下来输入这个命令

```powershell
auth 密码
```

![在这里插入图片描述](\img\in-post\Reprint\35cd180b96ad4d43df7a8b3e51c9c553.jpeg#pic_center)
这样就连接成功了，我们可以操作redis了
![在这里插入图片描述](\img\in-post\Reprint\6e27e67a5b47b5427e9b7e94a11be190.jpeg#pic_center)

## 二、使用redis可视化工具操作redis

我这里使用的是RedisDesktopManager
![在这里插入图片描述](\img\in-post\Reprint\071ad39a8a2e4456915f48ce9cef1d1b.jpeg#pic_center)

### 1.打开RedisDesktopManager，点击Add New Connection

![在这里插入图片描述](\img\in-post\Reprint\a1518d6e73aaf06a6392a3b31c65654f.jpeg#pic_center)

### 2.而后输入redis连接信息

![在这里插入图片描述](\img\in-post\Reprint\fe607e4b534db25e5f055ef58cc8a505.jpeg#pic_center)

### 3.可能会出现下图的错误，原因是6379端口没有放开，我们需要在阿里云(或腾讯云、华为云等)开放6379端口

![在这里插入图片描述](\img\in-post\Reprint\bcf980731b511dd28093d9ad57ef7433.jpeg#pic_center)
我的是腾讯云服务器，找到防火墙，开放6379端口
![在这里插入图片描述](\img\in-post\Reprint\054c716d1919d1ce1d6b87b52836167e.jpeg#pic_center)
![在这里插入图片描述](\img\in-post\Reprint\7a03f0c7b3ef1e88fcaefaef940ca400.jpeg#pic_center)

### 4.重新使用RedisDesktopManager连接

![在这里插入图片描述](\img\in-post\Reprint\7551a1d9ea0d3c7c71edd51476f59284.jpeg#pic_center)
ok，连接成功，可以使用可视化工具操作redis啦



转载自：https://blog.csdn.net/weixin_60692635/article/details/130694476
