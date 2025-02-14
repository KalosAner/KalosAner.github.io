---
layout:       post
title:        "KalosAner 的奇妙发现"
author:       "KalosAner"
header-style: text
catalog:      false
tags:
    - 杂谈
---

#### 2024-11-18

力扣对C++的中的 priority_queue 的支持有点问题，如下：

```cpp
// 直接取堆顶元素会报错
priority_queue<int> heap;
cout << heap.top() << endl;
// 先插入一个元素再弹出去，取堆顶元素就不会报错，直接输出 heap.size() 也可以看到等于0
priority_queue<int> heap;
heap.push(1);
heap.pop();
cout << heap.top() << endl;
```

#### 2024-11-28

发现：复制一段文字想用它当文件名或者文件夹名，如果这段文字当中有诸如：`/  ? :`等等之类的符号粘贴到文件夹名中时就会发现这些符号会自动消失，然后再在 txt 中再次粘贴这段文字（不要重新复制），就会发现粘贴出来的文字中的这些符号也消失了。如果不粘贴到文件名直接粘贴到 txt 里的话这些符号是不会消失的。

#### 2024-12-18

Windows 10 如果同时打开多个文件夹（资源管理器）窗口放在后台，然后打开好多软件放在前台，一段时间之后（经历了win+L锁屏，熄屏等各种操作）然后再通过任务栏打开文件夹窗口，第一个打开的窗口极有可能打不开（并不是打不开，而是调不到前台），再打开其他的就是正常的，而那一个还是会一直卡在后台。
