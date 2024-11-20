---
layout:       post
title:        "C++内存管理之malloc&free"
author:       "kalos Aner"
header-style: text
catalog:      true
tags:
    - C++
    - 内存管理

---

## C++内存管理之malloc&free

### 1、malloc

#### 1 VC6下的_heap_alloc_base

先调整区块大小

```cpp
// SBH: small block heap
void _heap_alloc_base(...)
{
    if (size <= __sbh_threashold) {  // __sbh_threashold == 1016
        pvReturn = __sbh_alloc_block(size);
        if (pvReturn) return pvReturn;
    }
    if (size == 0) size = 1;
    size = (size + ...) & ~(...);
    return HeapAlloc(_crtheap, 0, size); // 如果申请的空间太大则交给系统
}
```

