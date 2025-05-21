---
layout:       post
title:        "在cmd、powershell 或者 terminal 中提升权限"
author:       "佚名"
header-style: text
catalog:      true
tags:
    - Windowsr
    - 转载


---

如何在命令框中使用命令把自己的权限从用户提升到管理员？



参考[官网](https://learn.microsoft.com/zh-cn/powershell/module/microsoft.powershell.management/start-process?view=powershell-7.5&viewFallbackFrom=powershell-7.3)的方法，重新打开一个带有管理员权限的窗口。



如果想打开 `powershell`
命令：`Start-Process -Verb runAs powershell`
如果想打开 `cmd`
命令：`powershell Start-Process -Verb RunAs cmd`
如果想打开 `windows terminal`
命令：`powershell Start-Process -Verb RunAs wt`




转载：[https://blog.csdn.net/qq_16740151/article/details/129846661](https://blog.csdn.net/qq_16740151/article/details/129846661)
