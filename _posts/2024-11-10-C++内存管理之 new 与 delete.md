---
layout:       post
title:        "C++内存管理之 new 与 delete"
author:       "kalos Aner"
header-style: text
catalog:      true
tags:
    - C++
    - 内存管理

---

## C++内存管理之 new 与 delete

截止2010年之前Linux下的glibc中的malloc来自Doug Lea。

#### new express

class的构造函数无法被直接调用，只能使用new express在分配内存的同时调用，例如new string。

new express：申请内存并调用构造函数，底层会通过调用`malloc`实现。

operator new：申请内存，大小可以自己设置。

#### array new

在所有平台上的array new中，`malloc`函数被调用时会创建一个cookie 用来保存申请内存的块数，用来在释放内存的时候可以直接调用`delete[] string`进行array delete，`delete[] string`在析构时一般会反向析构。

**object array new**

上面提到不能直接调用构造函数，但是可以使用placement new（也即 new()）来调用构造函数，如下。

```cpp
A* buf = new A[size];
A* tmp = buf;
for (int i = 0; i < size; ++ i) {
	new(tmp++) A(i);
}
delete[] buf;
```

**base array new**

```cpp
int* pi = new int[10];
delete pi;
```

上述代码会申请如下图大小的空间。

![Snipaste_2024-11-11_20-09-19](/img/in-post/Snipaste_2024-11-11_20-09-19.png)

黄色部分在 debug 模式下才会出现，no man land 占4个字节 ，白色部分各占 4 个字节，加起来得到的字节数为84，然后加上 pad(可变) 使得最终字节为 16 的倍数，所以最终等于 96，16进制就是60h。析构时不需要使用`delete[] pi`，因为整数没有析构函数，调用一次析构和多次效果是一样的，object 必须使用array delete。

#### placement new

placement new 允许将 object 建立在 allocated memory 中。

```cpp
char* buf = new char[sizeof(Complex) * 3];
Complex* pc = new(buf)Complex(1, 2);
delete[] buf;

编译器会翻译为：

try {
	void* mem = operator new(sizeof(Complex), buf); // 此步什么也不做，仅仅将输入的地址 buf 再返回去
	pc = static_cast<Complex*> (mem);
	pc->Complex::Complex(1, 2);
} catch (std::bad_alloc) {

}
```

#### 重载 

**C++ 应用程序分配内存的途径**

1、

```cpp
// express 不可重载
Foo* p = new Foo(x);
...;
delete p;
```

2、

```cpp
// 可重载
Foo* p = (Foo*)operator new(sizeof(Foo));
new(p)Foo(x);
...;
p->~Foo();
operator delete(p);
// 可重载为
Foo::operator new(size_t);
Foo::operator delete(void*);
```

3、

```cpp
::operator new(size_t);
::operator delete(void*);
```

4、

```cpp
malloc(size_t);
free(void*);
```

可以将 `operator new` and `operator delete` 重载成 `Foo::operator new` and `Foo::operator delete`，这样可以在里边定义内存池来节省时间和空间，一般不会重载 `::operator new` and `::operator delete`。

**overload in class **

```cpp
class Foo {
public:
	void* operator new(size_t);
	void operator delete(void*, size_t=0); // size_t is optional parameter
    
    void* operator new[](size_t);
	void operator delete[](void*, size_t=0); // size_t is optional parameter
}
```

**implement memory pool**

```cpp 
class Foo {
public:
	void* operator new(size_t);
	void operator delete(void*, size_t=0); // size_t is optional parameter
    
    void* operator new[](size_t);
	void operator delete[](void*, size_t=0); // size_t is optional parameter
}
```

**overload new()**

```cpp
class Foo {
public:
	// express new
    void* operator new(size_t);
    
    // std placement new
    void* operator new(size_t, void* start);
    
    // diy placement new
    void* operator new(size_t, long);
   	void* operator new(size_t, long, char);
    
    void operator delete(void*, size_t);
    void operator delete(void*, void*);
    void operator delete(void*, long);
    void operator delete(void*, long, char);
}
```

note: first parameter must be type'size_t'.

The overloaded delete() will not be called directly by delete(). It will only make a system call to destroy the allocated memory when the overloaded new() has applied for memory but an error occurs in other operations.

如果不重载delete()，C++编译器也可以编译通过，但是这样就代表不进行异常处理。
