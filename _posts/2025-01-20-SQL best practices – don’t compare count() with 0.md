---
layout:       post
title:        "SQL best practices – don’t compare count(*) with 0"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - 翻译
    - 后端
---

#### 原文：

**SQL best practices – don’t compare count(*) with 0**

Every now and then I see something like this:

```sql
SELECT u.* FROM users u 
WHERE 0 = (SELECT COUNT(*) FROM addresses a WHERE a.user_id = u.id);
```

and it kinda pains me. So figured, I'll write about what is the problem with it, and how to avoid such constructs.

Lets consider what went through someones mind when they wrote it. This query will return all users, that have zero addresses. In other words – users that never provided any address.

Why is that bad? After all, if we need to find users without addresses, it does what needs to be done? Right. No.

The problem is counting. What will happen if an user has million addresses? Pg will dutifully count all of them, only then to reject the row, because there was *something*.

The thing is that you don't need to have million addresses. Even if there can be two – they still need to be counted, and while the time cost will be lower than counting million rows, it is still there, and it's 100% useless work.

So, the question can be: how to do the thing properly? It's easy – there is [EXISTS](https://www.postgresql.org/docs/current/functions-subquery.html#FUNCTIONS-SUBQUERY-EXISTS) expression:

```SQL
SELECT u.* FROM users u
WHERE NOT EXISTS (SELECT FROM addresses a WHERE a.user_id = u.id);
```

EXISTS (well, in this case NOT EXISTS) will check abandoning the test as soon as one row will be found. No need to count.

Of course, in some (most?) cases, where people use this construct (0 == count), someone can say: “but it doesn't matter in our case, because…". Well, this is where *best practices* part of the title comes from. One shouldn't do wrong things, even if they don't matter in this particular case, at the very least not to get into habit of doing it, and then accidentally make the same mistake when it will actually be important.

[原文链接](https://www.depesz.com/2024/12/01/sql-best-practices-dont-compare-count-with-0/)

#### 翻译：

**SQL 最佳实践：避免 count(*) 与 0 进行比较**

我总是看到如下代码：

```sql
SELECT u.* FROM users u 
WHERE 0 = (SELECT COUNT(*) FROM addresses a WHERE a.user_id = u.id);
```

这看着有点难受。因此，我在这里讨论一下它的问题，以及如何避免这种结构。

让我们思考一下写下这行代码的人的思路。这个查询会返回地址数量为零的用户。换句话说——从未提供过地址的用户。

为什么这样是糟糕的？毕竟，如果我们需要找到没有地址的用户，它确实完成了需要做的事，不是吗？

问题在于计数。如果一个用户拥有一百万个地址会发生什么？postgreSqL 会尽责地进行计算，然后因为某些问题而拒绝该行代码。

这个问题就是你不需要有数百万个地址。即使有两个，仍需要计算它们，虽然时间成本会低于计算百万行，但它仍然存在，并且事百分百的无用功。

那么，问题出现了：怎么做才是正确的做法？这很简单，使用 EXISTS 表达式：

```SQL
SELECT u.* FROM users u
WHERE NOT EXISTS (SELECT FROM addresses a WHERE a.user_id = u.id);
```

EXISTS （额，在本例中为 NOT EXISTS）会先进行查找，一旦找到一行就放弃查找，不需要计数。

当然，在某些（大多数？）情况下，当人们使用此结构（0 == count）时，他们可能会说：”但这在我们的情况下并不重要，因为......“。好吧，这就是这个标题”最佳实践“的由来。人们不应该做错误的事情，即使在这种特殊的情况下它们并不重要，至少不要养成这样做的习惯，然后在真正重要的时候不小心犯同样的错误。













