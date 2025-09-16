---
layout:       post
title:        "在 ubuntu 上打包安装 deb 遇到的问题"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - Linux

---
环境：ubuntu aarch64

#### 文件结构
打包需要按照格式放置文件
```
myapp/
├── usr/
│   └── bin/
│       └── myapp   # 可执行文件
└── DEBIAN/
│   ├── control
│   ├── postinst
│   ├── postrm
│   ├── preinst
│   ├── prerm
│   └── conffiles
└── lib/
    └── systemd/
	    └── system/
		    └── myapp.service
```

`preinst, postinst` 分别是安装前后需要执行的命令
`prerm, postrm` 分别是卸载前后需要执行的命令
`conffiles` 文件是 Debian 包管理系统中用于**声明配置文件**的特殊文件，它定义了哪些文件需要被当作配置文件处理。这些文件会获得特殊的管理行为，确保系统管理员对配置的修改不会被自动覆盖。
`myapp.service` 如果需要注册成服务可以在这个文件中配置
#### 文件配置
`control` 文件(`dpkg -s myapp` 会返回本段信息)
```
Package: myapp
Version: 0.0.2
Section: utils
Priority: optional
Architecture: all
Maintainer: Your Name <your.email@example.com>
Description: myapp is xxx.
```
`myapp.service` 文件
```
[Unit]
Description=aiecplugin-a
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/myapp
Restart=always   # 保活
RestartSec=5s    # 5秒之内保活

[Install]
WantedBy=multi-user.target
```
`preinst, postinst, prerm, postrm` 直接写需要执行的 shell 指令就行，如果没有需要的可以不写

#### 打包安装
```sh
打包
dpkg -b myapp myapp.deb
安装
dpkg -i myapp.deb
检查
dpkg -s myapp
```

#### 问题和解决
我想注册一个可以保活的服务，但是安装之后发现无法保活。大概率是`myapp.service` 文件没有生效，但是不能确定原因。参考了同组的一个哥哥的写法，最终把这个文件放在了 `etc/systemd/system/myapp.service` 位置可以生效。不知道是不是 `arrch64` 架构的原因。

#### 其他
安装 deb 包之后如果想在系统中找到安装的文件可以根据 deb 包的结构查找，例如，按照最开始的结构，myapp 将被放在 /usr/bin/ 下边；myapp.service 会被放在 /lib/systemd/system/ 下边，而且 /lib/systemd/system/multi-user.target/ 下边也会有。postinst 等等会被放在 /var/lib/dpkg/info/<包名>.postinst。