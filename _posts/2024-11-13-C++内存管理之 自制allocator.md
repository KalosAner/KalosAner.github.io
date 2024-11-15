---
layout:       post
title:        "C++内存管理之 自制allocator"
author:       "kalos Aner"
header-style: text
catalog:      true
tags:
    - C++
    - 内存管理

---

## C++内存管理之 自制allocator

### 1、简单的内存池

内存管理的目的主要是为了节约时间和空间，虽然调用 `malloc` 并不慢，但是也应该尽可能地减少调用它的次数。减少调用 `malloc` 的调用次数可以通过一次性地调用大块内存，这样每次需要的时候只需要把没用到的内存分配出去即可，这种方法称之为内存池，如下例所示。

```cpp
#include <cstddef>
#include <iostream>
using namespace std;

class Screen {
public:
	Screen(int x) : i(x) {};
	int get() {return i;}
	
	void* operator new(size_t);
	void operator delete(void*, size_t);

private:
	Screen* next;
    static Screen* freeStore;
    static const int screenChunk;
	int i;
}
Screen* Screen::freeStore = 0;
const int Screen::screenChunk = 24;
void* Screen::operator new(size_t size) {
    Screen* p;
    if (!freeStore) {
        size_t chunk = screenChunk * size; 
        freeStore = p = reinterpret_cast<Screen*>(new char[chunk]);
        for (; p != &freeStore[screenChunk - 1]; ++ p) {
            p->next = p + 1;
        }
        p->next = 0;
    }
    p = freeStore;
    freeStore = freeStore->next;
    return p;
}
// 不进行真正的回收，仅仅把想要回收的内存当作储备的可分配内存
void Screen::operator delete(void* p, size_t) {
    (static_cast<Screen*>(p))->next = freeStore;
    freeStore = static_cast<Screen*>(p);
}
```

但是这种设计会使得空间开销增大一倍。

另外一种方法如下。

```cpp
class Airplane {
private:
	struct AirplaneRep {
		unsigned long miles;
		char type;
	};
private:
    union {
        AiplaneRep rep;
        Airplane* next;
    };
public:
    unsigned long getMiles() {
        return rep.miles;
    }
    char getType() {
        return rep.type;
    }
    void set(unsigned long m, char t) {
        rep.miles = m;
        rep.type = t;
    }
public:
    static void* operator new(size_t size);
    static void operator delete(void* deadObject, size_t size);
private:
    static const int BLOCK_SIZE;
    static Airplane* headOfFreeList;
};
Airplane* Airplane::headOfFreeList;
const int Airplane::BLOCK_SIZE = 512;
void* Airplane::operator new(size_t size) {
    // 如果大小有误（当发生继承时可能会出现大小有误），转交给::operator new()
    if (size != sizeof(Airplane))
        return ::operator new(size);
   	Airplane* p = headOfFreeList;
    // 如果p还有效则下移，否则申请大块内存
    if (p) {
        headOfFreeList = p->next;
    } else {
        Airplane* newBlock = static_cast<Airplane*> (::operator new(BLOCK_SIZE* sizeof(Airplane)))
        for (int i = 1; i < BLOCK_SIZE - 1; ++ i) {
            newBlock[i].next = &newBlock[i + 1];
        }
        newBlock[BLOCK_SIZE - 1].next = 0;
        p = newBlock;
        headOfFreeList = &newBlock[1];
    }
	return p;
}
void Airplane::operator delete(void* deadObject, size_t size) {
    if (deadObject == 0) return ;
    if (size != sizeof(Airplane)) {
        ::operator delete(deadObject);
        return ;
    }
    Airplane* carcass = static_cast<Airplane*>(deadObject);
    carcass->next = headOfFreeList;
    headOfFreeList = carcass;
}
```

结构体 `AirplaneRep` 有 16 个字节，但是它只是在类 `Airplane` 中声明，所以类 `Airplane` 只有一个 `union` 占用16字节内存。这样当一个 `Airplane` 对象中没有数据时可以用 `next` 指针指向下一段空间，如果 `Airplane` 对象被分配数据了则使用 `rep` 变量存储数据。

### 2、简版 allocator

```cpp
class allocator {
private:
	struct obj {
		struct obj* next;
	};
public:
	void* allocate(size_t);
	void deallocate(void*, size_t);
private:
	obj* freeStore = nullptr;
	const int CHUNK = 5;
};
void allocator::deallocate(void* p, size_t) {
    ((obj*)p)->next = freeStore;
    freeStore = (obj*)p;
}
void* allocator::allocate(size_t size) {
    obj* p;
    if (!freeStore) {
        size_t chunk = CHUNK * size;
        // 申请 CHUNK 块空间，并把空间类型设置为 obj 指针
        freeStore = p = (obj*)malloc(chunk);
        
        for (int i = 0; i < CHUNK - 1; ++ i) {
            p->next = (obj*)((char*)p + size);
            // 每次都把下一块空间当作一个obj指针用
            p = p->next;
        }
        p->next = nullptr;
    }
    p = freeStore;
    freeStore = freeStore->next;
    return p;
}
```

```cpp
class Foo {
public:
    long L;
    string str;
    static allocator myAlloc;
public:
    Foo(long l) : L(l) {}
    static void* operator new(size_t size) {
        return myAlloc.allocate(size);
    }
    static void operator delete(void* pdead, size_t size) {
        return myAlloc.deallocate(pdead, size);
    }
};
allocator Foo::myAlloc;
```

目的：增加可复用行。

### 3、macro for static allocator

```cpp
// DECLARE_POOL_ALLOC -- used in class definition
#define DECLARE_POOL_ALLOC() \
public: \
    static void* operator new(size_t size) {return myAlloc.allocate(size);} \
    static void operator delete(void* pdead, size_t size) {return myAlloc.deallocate(pdead, size);} \
protected: \
	static allocator myAlloc;
	
// IMPLEMENT_POOL_ALLOC -- used in class implementation file
#define IMPLEMENT_POOL_ALLOC(class_name) \
allocator class_name::myAlloc;
```

目的：简化代码量。

### 4、异常处理

如果 operator new 申请 memory 失败，会抛出 std::bad_alloc exception（某些古老的编译器会返回0）。程序抛出 exception 之前会先调用一个可指定的 handler，可以通过下面方法设置 handler ：

```cpp
typedef void (*new_handler)();
new_handler set_new_handler(new_handler p) throw();
```

如下代码会反复调用 new_handler：

```cpp
void* operator new(size t size, const std:nothrow_t&)
_THROW0(){
    // try to allocate size bytes
    void *p;
    while((p = malloc(size)) == 0) {
        // buy more memory or return null pointer
        _TRY_BEGIN
            if(_callnewh(size) == 0) break;
        _CATCH( td::bad alloc)return (0);
        _CATCH_END
    }
    return (p);
}
```

设计良好的 new handler 只有两个选择：

- 使得有更多的 memory 可用
- 调用 abort() 或 exit()

例如：

```cpp
void noMoreMemory() {
	cerr << "out of memory" << endl;
	abort();
}
void main() {
    set_new_handler(noMoreMemory);
    int* p = new int[INT_MAX];
    assert(p);
}
```

abort() 会直接中止 operator new。
