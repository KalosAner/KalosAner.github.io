---
layout:       post
title:        "Python运行requirements.txt 文件安装包"
author:       "KalosAner"
header-style: text
catalog:      true
tags:

---

### 从requirements.txt安装依赖

```
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

加上后面的 -i https://pypi.tuna.tsinghua.edu.cn/simple 的作用是指定清华大学的镜像，下载速度更快。
