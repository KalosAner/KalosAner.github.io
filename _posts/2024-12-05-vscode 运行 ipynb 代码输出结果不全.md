---
layout:       post
title:        "vscode 运行 ipynb 代码输出结果不全"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - python
---

### 问题：

vscode 运行 ipynb 代码输出结果不全，提示：*Output is truncated. View as a* [scrollable element](command:cellOutput.enableScrolling?9e1b8c88-0356-4485-8b1d-3c17b51e5e39) *or open in a* [text editor](command:workbench.action.openLargeOutput?9e1b8c88-0356-4485-8b1d-3c17b51e5e39)*. Adjust cell output* [settings](command:workbench.action.openSettings?["@tag:notebookOutputLayout"])。

大概意思就是输出被截断了，可以点击 scrollable element 获得滚动条或者在本地编辑器中查看结果，可以通过点击 settings 调整。

### 解决：

所以这里直接点击 settings，进入到如下界面

![Snipaste_2024-12-05_11-33-36](\img\in-post\Snipaste_2024-12-05_11-33-36.png)

然后勾选 Initially render notebook outputs in a scrollable region when longer than the limit. 前面的复选框，并且修改 Text line Limit 里边的数值。

这样修改貌似只是修改的 User，还可以点击最上边的 Workspace 选择修改 Workspace的，但是我没试过不知道会有什么效果。

注意：如果不弹出直接 settings 按钮，可以通过在设置中搜索 @tag:notebookOutputLayout 进入到这个界面。
