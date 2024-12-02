---
layout:       post
title:        "C++ 二分函数 lower_bound 和 upper_bound 的用法"
author:       "Kalos Aner"
header-style: text
catalog:      true
tags:
    - C++
    - STL

---

两者都是定义在头文件`<algorithm>` 里。用**二分搜索**在一个有序数组中使用特定规则进行查找特定元素，时间复杂度就是 `O(logN)` 。

**基础用法**

在升序数组中查找特定元素。

```cpp
vector<int> arr = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
int x = 6;

//lower_bound 基础用法
//查找arr中第一个大于等于x的数，返回它的索引指针
auto it = lower_bound(arr.begin(), arr.end(), x);
//查找arr中第一个大于等于x的数，返回它的下标
int pos = lower_bound(arr.begin(), arr.end(), x) - arr.begin();

//upper_bound 基础用法
//查找arr中第一个大于x的数，返回它的索引指针
auto it = upper_bound(arr.begin(), arr.end(), x);
//查找arr中第一个大于x的数，返回它的下标
int pos = upper_bound(arr.begin(), arr.end(), x) - arr.begin();
```

**用 `greater<type>()` 重载**

在降序数组中查找特定元素。

```cpp
vector<int> arr = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0};
int x = 6;

//lower_bound 用greater<type>()重载
//查找arr中第一个小于等于x的数，返回它的索引指针
auto it = lower_bound(arr.begin(), arr.end(), x, greater<int>());
//查找arr中第一个小于等于x的数，返回它的下标
int pos = lower_bound(arr.begin(), arr.end(), x, greater<int>()) - arr.begin();

//upper_bound 用greater<type>()重载
//查找arr中第一个小于x的数，返回它的索引指针
auto it = upper_bound(arr.begin(), arr.end(), x, greater<int>());
//查找arr中第一个小于x的数，返回它的下标
int pos = upper_bound(arr.begin(), arr.end(), x, greater<int>()) - arr.begin();
```

**复合数组自定义重载函数**

```cpp
{% raw %}
//arr 是一个pair数组，按照pair的first元素从小到大排序，pair的first元素相同时按照pair的second元素从小到大排序
vector<pair<int, int>> arr = {{0, 1}, {0, 3}, {2, 1}, {2, 6}, {3, 3}, {4, 2}, {5, 1}};

//因为是按照pair的first元素排的序，所以自定义函数时只能使用pair的first进行比较
//lower_bound 自定义重载函数，函数接收两个参数，第一个表示数组中的元素（这里是pair元素），第二个表示要查找的值（也是lower_bound函数中的x）
//查找arr中第一个first大于等于x的pair元素，返回它的索引指针
auto it = lower_bound(arr.begin(), arr.end(), x, [](const pair<int, int>& p, const int b){return p.first < b;});
//查找arr中第一个first大于x的pair元素，返回它的索引指针
auto it = lower_bound(arr.begin(), arr.end(), x, [](const pair<int, int>& p, const int b){return p.first <= b;});
//查找arr中第一个first大于等于x的pair元素，返回它的下标
int pos = lower_bound(arr.begin(), arr.end(), x, [](const pair<int, int>& p, const int b){return p.first < b;}) - arr.begin();
//查找arr中第一个first大于x的pair元素，返回它的下标
int pos = lower_bound(arr.begin(), arr.end(), x, [](const pair<int, int>& p, const int b){return p.first <= b;}) - arr.begin();

//upper_bound 自定义重载函数，函数接收两个参数，第一个表示要查找的值（也是upper_bound函数中的x），第二个表示数组中的元素（这里是pair元素）
//查找arr中第一个大于等于x的数，返回它的索引指针
auto it = upper_bound(arr.begin(), arr.end(), x, [](const int b, const pair<int, int>& p){return b <= p.first;});
//查找arr中第一个大于x的数，返回它的索引指针
auto it = upper_bound(arr.begin(), arr.end(), x, [](const int b, const pair<int, int>& p){return b < p.first;});
//查找arr中第一个大于x的数，返回它的下标
int pos = upper_bound(arr.begin(), arr.end(), x, [](const int b, const pair<int, int>& p){return b <= p.first;}) - arr.begin();
//查找arr中第一个大于等于x的数，返回它的下标
int pos = upper_bound(arr.begin(), arr.end(), x, [](const int b, const pair<int, int>& p){return b < p.first;}) - arr.begin();
{% endraw %}
```

以上是普通容器的二分用法，除此之外还有关于 `set` 和 `map` 的用法，与上面类似，只是调用方法上的差异。

示例

```cpp
set<int> s;
s.lower_bound(x);
```

如上，暂时不进行展开介绍了。
