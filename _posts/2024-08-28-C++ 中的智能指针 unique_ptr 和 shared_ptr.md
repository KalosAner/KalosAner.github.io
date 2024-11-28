---
layout:       post
title:        "C++ 中的智能指针 unique_ptr 和 shared_ptr"
author:       "kalos Aner"
header-style: text
catalog:      true
tags:
    - C++

---

C++ 中的智能指针是用于自动管理动态内存资源的工具，它们通过 RAII（资源获取即初始化）机制来确保对象在适当的时候被释放，从而避免内存泄漏和其他与内存管理相关的问题。C++ 标准库中提供了三种主要的智能指针类型：`std::unique_ptr`、`std::shared_ptr` 和 `std::weak_ptr`。以下是它们的详细总结：

#### 1. `std::unique_ptr`

- **独占所有权**：`std::unique_ptr` 表示独占所有权，确保同一时间只有一个指针可以拥有某个资源。
- **自动销毁**：当 `std::unique_ptr` 离开作用域时，所拥有的对象会被自动销毁。
- **不允许复制**：由于独占所有权，`std::unique_ptr` 不支持复制（复制构造或复制赋值），但可以通过 `std::move` 进行所有权的转移。
- **使用场景**：适用于明确的资源所有者，例如对象工厂函数、独占资源管理等。

**示例**：

```cpp
#include <memory>
#include <iostream>

std::unique_ptr<int> createUniquePtr() {
    return std::make_unique<int>(42);
}

int main() {
    std::unique_ptr<int> ptr = createUniquePtr();
    std::cout << *ptr << std::endl;
}
```

#### 2. `std::shared_ptr`

- **共享所有权**：`std::shared_ptr` 允许多个指针共享同一个资源，通过引用计数来管理资源的生命周期。
- **自动销毁**：当最后一个 `std::shared_ptr` 被销毁或重置时，所拥有的对象会被自动释放。
- **引用计数**：每次复制 `std::shared_ptr`，引用计数加一；每次销毁或重置，引用计数减一。只有当引用计数降为 0 时，资源才会被释放。
- **使用场景**：适用于资源的所有权在多个地方共享的场景，例如在复杂的数据结构中共享节点或在多个对象之间共享资源。

**示例**：

```cpp
#include <memory>
#include <iostream>

void process(std::shared_ptr<int> ptr) {
    std::cout << "Inside function: " << *ptr << std::endl;
}

int main() {
    std::shared_ptr<int> ptr = std::make_shared<int>(42);
    process(ptr);
    std::cout << "After function: " << *ptr << std::endl;
}
```

#### 3. `std::weak_ptr`

- **非所有权弱引用**：`std::weak_ptr` 是一种不参与引用计数的智能指针，它只持有对由 `std::shared_ptr` 管理的对象的弱引用。
- **避免循环引用**：`std::weak_ptr` 主要用于避免 `std::shared_ptr` 之间的循环引用导致的内存泄漏。
- **访问共享对象**：使用 `weak_ptr.lock()` 可以获取一个 `std::shared_ptr`，如果资源已经被释放，`lock()` 返回一个空的 `std::shared_ptr`。
- **使用场景**：适用于缓存、观察者模式，或者需要弱引用的地方。

**示例**：

```cpp
#include <memory>
#include <iostream>

int main() {
    std::shared_ptr<int> sharedPtr = std::make_shared<int>(42);
    std::weak_ptr<int> weakPtr = sharedPtr;
    
    if (auto tempPtr = weakPtr.lock()) {
        std::cout << "Resource is still available: " << *tempPtr << std::endl;
    } else {
        std::cout << "Resource has been released." << std::endl;
    }

    sharedPtr.reset();

    if (auto tempPtr = weakPtr.lock()) {
        std::cout << "Resource is still available: " << *tempPtr << std::endl;
    } else {
        std::cout << "Resource has been released." << std::endl;
    }
}
```

#### 4. `std::auto_ptr`（已废弃）

- **过时的智能指针**：`std::auto_ptr` 是 C++98 中引入的早期智能指针，但由于所有权语义不明确且容易导致未定义行为，它在 C++11 中被废弃，建议使用 `std::unique_ptr` 替代。

#### 总结

- **`std::unique_ptr`**：独占所有权，不允许复制，只能通过移动转移所有权。适用于独占资源管理。
- **`std::shared_ptr`**：共享所有权，通过引用计数管理资源，适用于多个对象共享资源的场景。
- **`std::weak_ptr`**：非所有权弱引用，防止循环引用，用于需要弱引用的场景，如观察者模式。
- **`std::auto_ptr`**：已废弃，建议使用 `std::unique_ptr` 代替。
