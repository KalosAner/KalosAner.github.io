---
layout:       post
title:        "Unable to read block 1 from .welcome.txt.swp"
author:       "Kalos Aner"
header-style: text
catalog:      false
tags:
    - 后端
    - Linux

---

使用vim编辑文本时，程序意外结束就会在该文件夹下产生类似`.welcome.txt.swp`的文件，主要用来保存vim程序结束时`welcome.txt`文件中没有来得及保存的内容，当再次编辑`welcome.txt`文件时会提示可以使用R键恢复未来得及保存的内容，不过有时候会提示`Unable to read block 1 from .welcome.txt.swp`错误，无法恢复，有可能是未来得及保存的内容太少导致的，这种情况就可以直接重新写入就可以了，因为丢失的内容较少，没有办法恢复了。
