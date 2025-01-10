---
layout:       post
title:        "Visual Studio 同时启动多个项目"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - 后端
    - Visual Studio
---

#### 环境

Visual Studio 2022

Windows 10

#### 添加项目

每个已经创建好的项目都有一个 Solution（解决方案），在 Solution 上右键，然后点击 Add（添加） → new project（新项目） 就可以添加一个新项目。

![Snipaste_2025-01-10_17-12-08](\img\in-post\Snipaste_2025-01-10_17-12-08.png)

#### 传入参数

每个项目都可以单独进行配置，如传入参数。在项目上右键点击 Properties（属性）→ Configuration Properties（配置属性） → Debugging（调试） → Command Arguments（命令行参数）。

![Snipaste_2025-01-10_17-15-14](\img\in-post\Snipaste_2025-01-10_17-15-14.png)

#### 设置启动项目

在 Solution 上右键，点击 Properties（属性）就可以打开解决方案的属性页。

在 Common Properties（常规）→ Startup Project（启动项目）的右侧选择 Multiple startup projects（多个启动项目），然后把右下小框中的项目设置为 start。

![Snipaste_2025-01-10_17-31-57](\img\in-post\Snipaste_2025-01-10_17-31-57.png)
