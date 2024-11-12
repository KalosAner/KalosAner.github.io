---
layout:       post
title:        "npm安装bundle包时报错"
author:       "kalos Aner"
header-style: text
catalog:      true
tags:
    - 前端
    - npm

---

## npm安装bundle包时报错

**问题：**

npm版本10.2.4

npm安装bundle包时报错：sill idealTree buildDeps

**解决方法：**

```sh
npm set strict-ssl false
```

