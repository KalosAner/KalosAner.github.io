---
layout:       post
title:        "C++内存管理之 标准allocator"
author:       "kalos Aner"
header-style: text
catalog:      true
tags:
    - C++
    - 内存管理

---

## C++内存管理之 标准allocator

### 1、cookie

![Snipaste_2024-11-15_21-16-09](/img/in-post/Snipaste_2024-11-15_21-16-09.png)

`malloc` 函数在申请内存的同时也会分配一段 `cookie` 用来记录区块的大小，但是当所有申请的区块大小相同或者只有两三种大小的区块时，使用 `cookie` 不是很有必要。如图所示当申请 12 个字节时（block size 是申请的内存），`malloc` 会分配 0xC + (32 + 4) + 4 * 2 = 0x38 然后填充成 0x40(16 的倍数)。

本小节的目的就是要去除 `cookie`。

![Snipaste_2024-11-15_21-31-22](\img\in-post\Snipaste_2024-11-15_21-31-22.png)

