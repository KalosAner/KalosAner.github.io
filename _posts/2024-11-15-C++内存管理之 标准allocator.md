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

<img src="\img\in-post\Snipaste_2024-11-16_21-38-46.png" alt="Snipaste_2024-11-16_21-38-46" style="zoom: 50%;" /><img src="\img\in-post\Snipaste_2024-11-15_21-31-22.png" alt="Snipaste_2024-11-15_21-31-22" style="zoom:50%;" />

而 VC6 和 BC5 中的 `allocator` 只是以 `::operator new` 和 `::operator delete` 完成 `allocator()` 和 `deallocate()` 没有任何特殊设计，而且他们申请的内存以元素大小为单位(int)。

![Snipaste_2024-11-15_21-37-25](\img\in-post\Snipaste_2024-11-15_21-37-25.png)

GNU2.9 同样没有进行特殊设计，但是它的容器使用的分配器不是 `std::allocator` 而是 `std::alloc`。

### 2、alloc 运行一瞥

下面将阅读 GUN2.9 版的 `alloc` ，它与 GUN4.9 版方法一样，但是代码更容易读。

![Snipaste_2024-11-18_20-03-19](\img\in-post\Snipaste_2024-11-18_20-03-19.png)

首先看一下 `alloc` 的分配流程，`alloc` 会维护一个存有 16 个指针的链表 free_list（#0、#1、#2、#3、...、#15），分别指向区块大小为 8 bytes、16 bytes、24 bytes、32 bytes...、128 bytes的连续空间。当容器申请 32 bytes （或者其他大于 24 bytes 小于 32 bytes 的区块）大小的空间时，`alloc` 会直接申请 20 个 32 bytes 的区块（为什么是 20 官方也没有文档解释），然后把 1 个分配个容器，其他的区块使用 `union obj` 的方式串联起来，最后一个位置指向 NULL。如果容器又申请了 64 bytes 大小的区块时，`alloc` 会将上一次（32 bytes）申请 20 个的区块的下一个位置分配给 64 bytes 的区块，这里其实只剩下 10 个 64 bytes 的区块，因为上一次申请其实一共申请了 40 * 32 bytes 大小的空间，其中 20 * 32 bytes 作为 32 bytes 的连续空间，另外 20 * 32 bytes 被称为“战备池”，以供下次分配，所以此次（64 bytes）就只剩下了 10 个区块，用同样的方法串联在一起。

以上分配的区块都是不带 cookie 的，不过整块的空间（40 * 32 bytes）是带 cookie 的。如果容器申请的内存区块超过了 128 bytes，那么分配器会直接调用 malloc，这时分配的内存都是带 cookie。

在以上分配过程中，分配器会记录累计申请量，每次重新调用 malloc 函数，也就是战备池为空的时候，都会申请  `请求区块大小 * 20 * 2 + 累计申请量 >> 4 `的空间，多申请的空间被称为追加量。虽然 malloc 可能会申请很多空间，但是每次分配给容器时只会分配 1 ~ 20 个区块。具体步骤会放在附录的图片中。

### 3、alloc 源码剖析

主要分配器分为两级，主要工作集中在第二级分配器，第二级分配器失败的话就会转到第一级分配器。

```cpp
// Default node allocator.
// With a reasonable compiler, this should be roughly as fast as the
// original STL class-specific allocators, but with less fragmentation.
// Default_alloc_template parameters are experimental and MAY
// DISAPPEAR in the future.  Clients should just use alloc for now.
//
// Important implementation properties:
// 1. If the client request an object of size > _MAX_BYTES, the resulting
//    object will be obtained directly from malloc.
// 2. In all other cases, we allocate an object of size exactly
//    _S_round_up(requested_size).  Thus the client has enough size
//    information that we can return the object to the proper free list
//    without permanently losing part of the object.
//

// The first template parameter specifies whether more than one thread
// may use this allocator.  It is safe to allocate an object from
// one instance of a default_alloc and deallocate it with another
// one.  This effectively transfers its ownership to the second one.
// This may have undesirable effects on reference locality.
// The second parameter is unreferenced and serves only to allow the
// creation of multiple default_alloc instances.
// Node that containers built on different allocator instances have
// different types, limiting the utility of this approach.
#ifdef __SUNPRO_CC
// breaks if we make these template class members:
  enum {_ALIGN = 8};
  enum {_MAX_BYTES = 128};
  enum {_NFREELISTS = _MAX_BYTES/_ALIGN};
#endif

template <bool threads, int inst>
class __default_alloc_template {

private:
  // Really we should use static const int x = N
  // instead of enum { x = N }, but few compilers accept the former.
# ifndef __SUNPRO_CC
    enum {_ALIGN = 8};
    enum {_MAX_BYTES = 128};
    enum {_NFREELISTS = _MAX_BYTES/_ALIGN};
# endif
  // 上调函数，调整为 8 的倍数
  static size_t
  _S_round_up(size_t __bytes)
    { return (((__bytes) + _ALIGN-1) & ~(_ALIGN - 1)); }

__PRIVATE:
  // 共用体
  union _Obj {
        union _Obj* _M_free_list_link;
        char _M_client_data[1];    /* The client sees this.        */
  };
private:
# ifdef __SUNPRO_CC
    static _Obj* __VOLATILE _S_free_list[];
        // Specifying a size results in duplicate def for 4.1
# else
    static _Obj* __VOLATILE _S_free_list[_NFREELISTS];
# endif
  static  size_t _S_freelist_index(size_t __bytes) {
        return (((__bytes) + _ALIGN-1)/_ALIGN - 1);
  }

  // Returns an object of size __n, and optionally adds to size __n free list.
  static void* _S_refill(size_t __n);
  // Allocates a chunk for nobjs of size "size".  nobjs may be reduced
  // if it is inconvenient to allocate the requested number.
  static char* _S_chunk_alloc(size_t __size, int& __nobjs);

  // Chunk allocation state.
  static char* _S_start_free;
  static char* _S_end_free;
  static size_t _S_heap_size;

# ifdef __STL_SGI_THREADS
    static volatile unsigned long _S_node_allocator_lock;
    static void _S_lock(volatile unsigned long*);
    static inline void _S_unlock(volatile unsigned long*);
# endif

# ifdef __STL_PTHREADS
    static pthread_mutex_t _S_node_allocator_lock;
# endif

# ifdef __STL_SOLTHREADS
    static mutex_t _S_node_allocator_lock;
# endif

# ifdef __STL_WIN32THREADS
    static CRITICAL_SECTION _S_node_allocator_lock;
    static bool _S_node_allocator_lock_initialized;

  public:
    __default_alloc_template() {
	// This assumes the first constructor is called before threads
	// are started.
        if (!_S_node_allocator_lock_initialized) {
            InitializeCriticalSection(&_S_node_allocator_lock);
            _S_node_allocator_lock_initialized = true;
        }
    }
  private:
# endif

    class _Lock {
        public:
            _Lock() { __NODE_ALLOCATOR_LOCK; }
            ~_Lock() { __NODE_ALLOCATOR_UNLOCK; }
    };
    friend class _Lock;

public:

  /* __n must be > 0      */
  static void* allocate(size_t __n)
  {
    _Obj* __VOLATILE* __my_free_list;
    _Obj* __RESTRICT __result;

    if (__n > (size_t) _MAX_BYTES) {
        return(malloc_alloc::allocate(__n));
    }
    __my_free_list = _S_free_list + _S_freelist_index(__n);
    // Acquire the lock here with a constructor call.
    // This ensures that it is released in exit or during stack
    // unwinding.
#       ifndef _NOTHREADS
        /*REFERENCED*/
        _Lock __lock_instance;
#       endif
    __result = *__my_free_list;
    if (__result == 0) {
        void* __r = _S_refill(_S_round_up(__n));
        return __r;
    }
    *__my_free_list = __result -> _M_free_list_link;
    return (__result);
  };

  /* __p may not be 0 */
  static void deallocate(void* __p, size_t __n)
  {
    _Obj* __q = (_Obj*)__p;
    _Obj* __VOLATILE* __my_free_list;

    if (__n > (size_t) _MAX_BYTES) {
        malloc_alloc::deallocate(__p, __n);
        return;
    }
    __my_free_list = _S_free_list + _S_freelist_index(__n);
    // acquire lock
#       ifndef _NOTHREADS
        /*REFERENCED*/
        _Lock __lock_instance;
#       endif /* _NOTHREADS */
    __q -> _M_free_list_link = *__my_free_list;
    *__my_free_list = __q;
    // lock is released here
  }

  static void* reallocate(void* __p, size_t __old_sz, size_t __new_sz);

} ;

typedef __default_alloc_template<__NODE_ALLOCATOR_THREADS, 0> alloc;
typedef __default_alloc_template<false, 0> single_client_alloc;
```



### 附录

#### 1、alloc 运行一瞥

![](\img\in-post\Snipaste_2024-11-18_21-06-24.png)

![](\img\in-post\Snipaste_2024-11-18_21-06-33.png)

![](\img\in-post\Snipaste_2024-11-18_21-06-52.png)

![](\img\in-post\Snipaste_2024-11-18_21-07-00.png)

![](\img\in-post\Snipaste_2024-11-18_21-07-08.png)

![](\img\in-post\Snipaste_2024-11-18_21-07-17.png)

![](\img\in-post\Snipaste_2024-11-18_21-07-24.png)

![](\img\in-post\Snipaste_2024-11-18_21-07-33.png)

![](\img\in-post\Snipaste_2024-11-18_21-07-40.png)

![](\img\in-post\Snipaste_2024-11-18_21-07-49.png)

![](\img\in-post\Snipaste_2024-11-18_21-07-57.png)

![](\img\in-post\Snipaste_2024-11-18_21-08-05.png)

![](\img\in-post\Snipaste_2024-11-18_21-08-12.png)

![](\img\in-post\Snipaste_2024-11-18_21-08-18.png)

#### 2、alloc 源码

跟侯捷老师ppt上的不是完全一样，但是内容只多不少，侯捷老师ppt上的源码主要集中在本文件的前 500 行。

第二类分配器源码在 288 行到 450 行。

 [stl_alloc.h](\img\in-post\stl_alloc.h) 

C语言版本

 [allocc.h](\img\in-post\allocc.h) 

#### 3、容量测试代码

```cpp
#include <iostream>
#include <vector>

using namespace std;

int main() {
	vector<int> a;
	int pre = a.capacity();
	for (int i = 0; i < 10000; ++i) {
		a.push_back(0);
		if (a.capacity() != pre) {
			cout << pre << ' ';
			pre = a.capacity();
		}
	}
	return 0;
}
// 测试多次，结果都是这个
// 0 1 2 3 4 6 9 13 19 28 42 63 94 141 211 316 474 711 1066 1599 2398 3597 5395 8092
```

