---
layout: post
title: ssh -T git@github.com 失败
author: Kalos Aner
header-style: text
catalog: true
tags:
  - Git
---

#### 问题：

windows 系统，浏览器可以访问 github.com，但是 `ssh -T git@github.com` 失败。

#### 解决：

在 `~/.ssh` 下添加 `config` 文件，写入

```
Host github.com
Hostname ssh.github.com
Port 443
User git
```

并且确保 `~/.ssh` 里边没有 `known_hosts` 文件。


#### 其他：

如果 git 的时候提示 `Bad owner or permissions on ~/.ssh/config`，可以打开这个文件的属性-》安全-》高级。

然后在权限这一栏，点击“禁用继承”然后点击“从此对象中删除所有已继承的权限”，然后再点击“添加”添加自己的用户名。

![Snipaste_2025-07-06_18-20-21.png](\img\in-post\Snipaste_2025-07-06_18-20-21.png)
