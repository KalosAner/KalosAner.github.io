---
layout:       post
title:        "Linux ubuntu 时间日期设置"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - Linux
---

Ubuntu 可以通过图形界面和终端两种方式设置时间日期，本文主要介绍使用终端的方式。

### 1、自定义时间日期

```sh
# 设置格式
sudo date MMDDhhmmYYYY.ss
# 示例：设置2024年10月1日12:34:56
sudo date 100112342024.56
```

### 2、自动同步时间 

配置 NTP（Network Time Protocol）服务器可以实现自动同步时间

```sh
# 安装 NTP 服务
sudo apt-get install ntp
# 启动 NTP 服务
sudo systemctl restart ntp
# 查看当前时间、时区之类的信息
timedatectl status
# 查看所有可用的时区
timedatectl list-timezones
# 设置时区，以 Asia/Shanghai （亚洲上海）为例，设置完时间会自动更新
sudo timedatectl set-timezone Asia/Shanghai
```

