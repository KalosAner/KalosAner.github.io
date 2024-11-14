---
layout:       post
title:        "C++内存管理之 allocator"
author:       "kalos Aner"
header-style: text
catalog:      true
tags:
    - C++
    - 内存管理

---

## C++内存管理之 allocator

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
