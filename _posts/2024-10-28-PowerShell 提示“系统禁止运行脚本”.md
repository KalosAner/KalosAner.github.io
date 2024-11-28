---
layout:       post
title:        "PowerShell 提示“系统禁止运行脚本"
author:       "Kalos Aner"
header-style: text
catalog:      true
tags:
    - PowerShell
    - .bat


---

## PowerShell 提示“系统禁止运行脚本”

**问题：**

在Windows10上执行下载的.bat文件时，提示"无法加载文件 D:\Documents\WindowsPowerShell\profile.ps1，因为在此系统上禁止运行脚本。"

**原因：**

系统为了安全会禁止运行不明来源的.bat文件上的部分命令。

**解决：**

使用管理员权限打开PowerShell，输入以下语句：

```powershell
Set-ExecutionPolicy RemoteSigned
```

**注意：**

如果提示以下错误：

```powershell
Access to the registry key
'HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\PowerShell\1\ShellIds\Microsoft.PowerShell' is denied. 
To change the execution policy for the default (LocalMachine) scope, 
  start Windows PowerShell with the "Run as administrator" option. 
To change the execution policy for the current user, 
  run "Set-ExecutionPolicy -Scope CurrentUser".
```

可以尝试这个命令：

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

此外，如果你想再改回默认设置可以输入以下语句：

```powershell
Set-ExecutionPolicy Restricted
```

