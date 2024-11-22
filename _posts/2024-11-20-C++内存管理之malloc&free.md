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

#### 第一次分配过程

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
// indGroupUse记录目前正在使用的Group索引
typedef struct tagRegion {
    int indGroupUse;
    char cntRegionSize[64];
    BITVEC bitvGroupHi[32];
    BITVEC bitvGroupLo[32];
    struct tagGroup grpHeadList[32];
}REGION, *PREGION;

// cntEntries 记录分配次数，分配加一，释放减一，为0则可以还给操作系统
typedef struct tagGroup {
    int cntEntries;
    struct tagListHead listHead[64];
}GROUP, *PGROUP;

typedef struct tagListHead {
    struct tagEntry* pEntryNext;
    struct tagEntry* pEntryPrev;
}LISTHEAD, *PLISTHEAD;

// 两个指针，指向一块空间
typedef struct tagEntry {
    int sizeFront;
    struct tagEntry* pEntryNext;
    struct tagEntry* pEntryPrev;
}ENTRY, *PENTRY;
```

![Snipaste_2024-11-20_21-38-12](\img\in-post\Snipaste_2024-11-20_21-38-12.png)

红色为 cookie 信息，灰色是 debuger header。

绿色是无人区(4 个 0xfd)，它的作用：当用户有意或者无意地往无人区中写入了输入，回收的时候 debuger 会检查无人区地数据是不是 0xfdfdfdfd，如果不是的话 debuger就会给出警告。

![Snipaste_2024-11-21_13-27-43](\img\in-post\Snipaste_2024-11-21_13-27-43.png)

在第一次分配内存的时候，会首先调用 `HeapAlloc` 来申请 1Mb 的内存，由一个 Header 管理，它有 32 个 Group，每个 Group 管理 32 Kb 的内存，一个HEADER 有一个指向 32 个 Group的指针和一个指向 32Kb 内存的指针。32Kb 内存被分为 8 个区块，每个区块 4Kb，每个 Group 有 64 个指针，前面指针指向区块小于 1Kb 的内存，最后两个指针指向区块大于 1Kb 的内存。

32 个 Group 每个 Group 中的每个 64 个指针都有一个对应的状态，如果状态为 0 代表指针为空，状态为 1 代表指向一块内存，这些状态存在 HEADER 的一个表格中，如上图。

第一次用户或者 CRT 申请 100h 的内存，经过加上 cookie 和 debuger header 等等会扩大到 130h。把 130h 换成 10 进制然后再除以 16 再减 1，得到 18，所以由 #18 lists 来供应。

每个 page 都是 16 的倍数，由于两个黄色块一共占 8 个字节，所以要保留 8 个字节。

#### 后继分配与释放过程

![Snipaste_2024-11-21_13-28-08](\img\in-post\Snipaste_2024-11-21_13-28-08.png)

第二次分配发现 240 对应的 lists 状态为空，就会往后找到第一个状态为 1 的 lists。

![Snipaste_2024-11-21_13-28-20](\img\in-post\Snipaste_2024-11-21_13-28-20.png)

![Snipaste_2024-11-21_13-28-43](\img\in-post\Snipaste_2024-11-21_13-28-43.png)

![Snipaste_2024-11-21_13-28-58](\img\in-post\Snipaste_2024-11-21_13-28-58.png)

![Snipaste_2024-11-21_13-29-10](\img\in-post\Snipaste_2024-11-21_13-29-10.png)

### 2、free

#### 区块合并

![Snipaste_2024-11-21_15-08-45](\img\in-post\Snipaste_2024-11-21_15-08-45.png)

内存在释放的时候会先查找上下区块的 cookie 是否为已释放状态，如果是的话就会进行区块合并，然后把合并后的区块挂到该挂的链表去。

#### p 花落谁家

`free(p)` 如何确定 p 落在哪个 Header 中的哪个 Group 中的哪个 free-list？

确定Header：Header 中的内存是连续的，只需要确定 p 在不在这段连续内存中间即可。

确定Group：指针减掉头除以 32K 再减一。

确定free-list：找到这块空间的 cookie，就可以通过 cookie 计算出落在哪一个 list 里面。

### 3、分段管理之妙

分段管理更便于区块合并统一归还给系统，每个 Group 使用 cntEntries 记录分配次数，分配加一，释放减一，为0 则可以还给操作系统。

但是第一个全回收 Group 出现时并不着急还给系统，当有第二个全回收 Group 出现时才归还第一个全回收 Group。没还给系统的全回收 Group 被称为暂留，使用 `__shb_pHeaderDefer` 来指向该 Group 所属的 Header，另一个指针 `__sbh_indGroupDefer` 来指向该 Group 。

如果尚未出现第二个全回收 Group 而用户又需要内存时，该 Group 将被重新分配给用户， `__shb_pHeaderDefer` 被重新设置为 `NULL`。
