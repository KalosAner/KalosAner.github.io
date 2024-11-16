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

![Snipaste_2024-11-15_21-31-22](\img\in-post\Snipaste_2024-11-15_21-31-22.png)![Snipaste_2024-11-16_21-38-46](\img\in-post\Snipaste_2024-11-16_21-38-46.png)

<figure class="half">
    <img src="\img\in-post\Snipaste_2024-11-15_21-31-22.png" width = “50%”/>
    <img src="\img\in-post\Snipaste_2024-11-16_21-38-46.png" width = “50%”/>
</figure>


而 VC6 和 BC5 中的 `allocator` 只是以 `::operator new` 和 `::operator delete` 完成 `allocator()` 和 `deallocate()` 没有任何特殊设计，而且他们申请的内存以元素大小为单位(int)。

![Snipaste_2024-11-15_21-37-25](\img\in-post\Snipaste_2024-11-15_21-37-25.png)

GNU2.9 同样没有进行特殊设计，但是它的容器使用的分配器不是 `std::allocator` 而是 `std::alloc`。

### 2、alloc

下面将阅读 GUN2.9 版的 `alloc` ，它与 GUN4.9 版方法一样，但是代码更容易读。
