---
layout:       post
title:        "github actions 使用教程"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - GitHub
---



GitHub Actions 是 GitHub 2019年 7 月份左右推出的一套 CI/CD 平台，它可以自动化软件开发流程，简化代码提交、构建、测试和部署步骤，通过简单配置实现自动化。

在使用时只需要简单的配置，GitHub 就可以自动化工作流。

#### 1、创建仓库并点击菜单栏的 Actions 按钮，可以看到下边有很多现成的配置可以使用。

![Snipaste_2025-02-17_15-43-05](\img\in-post\Snipaste_2025-02-17_15-43-05.png)

#### 2、点击 Simple workflow 中的 Configure，它会生成一个简单的配置

![Snipaste_2025-02-17_15-45-26](\img\in-post\Snipaste_2025-02-17_15-45-26.png)

#### 3、上传项目代码

我这里使用的是 react 的示例项目 [计算器](https://github.com/KalosAner/KalosAner.github.io/blob/master/resource/example/calculator-master.zip)。

工作流配置文件放在 `.github/workflows/` 文件夹下，文件名可以自己命名。相关语法可以参考[官方文档](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions)。

#### 4、配置工作流

配置代码示例：

```yaml
name: myci

# on 代表触发事件
on:
# 当 push 时触发工作流
  push:
# 当特定 branches 发生 push 时触发，这里就是 master 分支
    branches:
    - master
# 当特定路径发生 push 时触发，这里是 src 文件夹
    paths:
    - src/*

# 不写 permissions 的话，在部署时容易出错
permissions:
  contents: write

# 工作流的任务
jobs:
# build 是自定义的名字，可以随意命名
  build:
# 工作流执行的系统环境
    runs-on: ubuntu-latest
# 多策略用法，使用的不多
    strategy:
      matrix:
        node-version: [14.x, 16.x, 18.x]
# 工作流执行的具体命令
    steps:
# uses 可以接多种类型，最常用的就是接另一个代码仓库，这里就是一个代码仓库，它的流程就是下载我仓库的代码
    - name: 检出代码
      uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
# 这里的 name 是为 run 起一个名字，会在 GitHub 上显示，也可以不写
    - name: 安装依赖
# run 后边加 | 可以支持写多行脚本
      run: |
        npm install
        npm run build
    - name: 上传文件
      uses: actions/upload-artifact@v4
      with: 
        name: build-pages
        path: build
        retention-days: 1
# deploy 是任务名字
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/download-artifact@v4
      with:
        name: build-pages
        path: build
    - name: 部署
      uses: JamesIves/github-pages-deploy-action@v4
      with:
        branch: gh-pages
        folder: build
# 另一个任务
  work:
    runs-on: ubuntu-latest
# 这个任务用到 nginx 服务
    services:
      nginx:
        image: nginx
        ports:
          - 8080:80
    steps:
    - uses: actions/checkout@v4
    - run: curl localhost:8080
```

> `ubuntu-latest` 默认安装了多语言的环境，`uses` 可以指定使用的语言的特定版本。

下图可以看到 node.js 版本为 14.x 和 16.x 的时候是成功的，18.x 的时候依赖安装失败，可能是项目不支持 17.x 之后的 node.js。

![Snipaste_2025-02-17_18-17-22](\img\in-post\Snipaste_2025-02-17_18-17-22.png)

我把 node.js 的版本指定为 16.x 之后重新 push 了一下，现在就没有报错了。

![Snipaste_2025-02-17_18-22-39](\img\in-post\Snipaste_2025-02-17_18-22-39.png)

#### 5、部署

执行完上述的工作流之后会导出静态页面到 gh-pages 这个分支，如下图。

![Snipaste_2025-02-17_18-24-15](\img\in-post\Snipaste_2025-02-17_18-24-15.png)

然后在设置里边，点击右侧的 pages 里边的 部署，最后要点击 save，如下图。

![Snipaste_2025-02-17_18-26-44](\img\in-post\Snipaste_2025-02-17_18-26-44.png)

这个时候再点进工作流就可以看到已经部署完成了。

![Snipaste_2025-02-17_18-27-57](\img\in-post\Snipaste_2025-02-17_18-27-57.png)

#### 6、其他

GitHub Actions 还支持自动化生成 Docker 镜像并推送到 Docker 仓库里。
