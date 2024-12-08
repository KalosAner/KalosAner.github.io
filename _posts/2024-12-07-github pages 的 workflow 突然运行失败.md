---
layout:       post
title:        "github pages 的 workflow 突然运行失败"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - GitHub
---

### 问题：

使用 GitHub pages 搭建的博客网页突然不能运行工作流了，提示：

```sh
The current runner (ubuntu-24.04-x64) was detected as self-hosted because the platform does not match a GitHub-hosted runner image (or that image is deprecated and no longer supported).
In such a case, you should install Ruby in the $RUNNER_TOOL_CACHE yourself, for example using https://github.com/rbenv/ruby-build
You can take inspiration from this workflow for more details: https://github.com/ruby/ruby-builder/blob/master/.github/workflows/build.yml
$ ruby-build 3.1.4 /opt/hostedtoolcache/Ruby/3.1.4/x64
Once that completes successfully, mark it as complete with:
$ touch /opt/hostedtoolcache/Ruby/3.1.4/x64.complete
It is your responsibility to ensure installing Ruby like that is not done in parallel.
```

### 原因：

在运行失败的 workflow 里可以看到警告：ubuntu-latest pipelines will use ubuntu-24.04 soon. For more details, see https://github.com/actions/runner-images/issues/10636

大概意思就是 ubuntu-latest 将被替换为 ubuntu-24.04 。而如果 jekyll 和 ruby 版本与 ubuntu-24.04 不兼容就会 build 失败。

### 解决：

把`.github\workflows` 下的 jekyll.yml 文件中的 runs-on 部分修改成如下配置

```
jobs:
  # Build job
  build:
    runs-on: ubuntu-22.04
```

但是据说 ubuntu-22.04 只会再支持两年了，所以等不支持 ubuntu-22.04 的时候 ruby 和 jekyll 肯定已经可以稳定在 ubuntu-24.04 运行了，说实话我挺喜欢 ubuntu-24.04 的，听说这个发行版 LTS 长达 12 年。
