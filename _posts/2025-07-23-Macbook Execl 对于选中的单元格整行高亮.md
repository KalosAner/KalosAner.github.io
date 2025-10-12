---
layout: post
title: Macbook Execl 对于选中的单元格整行高亮
author: Kalos Aner
header-style: text
catalog: true
tags:
  - 杂谈
---

注意：不方便存图片，所以全文无图，后期看情况补。另外这个应该不是最优的方法，但是没时间找其他方法，这个方法勉强能用。
#### 1、新建规则
在菜单栏的“开始”栏里点击“条件格式”，点击“新建规则”。在“新建格式规则”里边，“样式”选择经典，下边选择“使用公式确定要设置格式的单元格”，公式添`=ROW()=CELL("row")`(设置行高亮)，”设置格式“可以任意选，我喜欢绿色填充。

#### 2、管理规则
在菜单栏的“开始”栏里点击“条件格式”，点击“管理规则”。在“管理规则”里边的“显示其格式规则”选择当前工作表“，勾选你刚才新建的规则的”如果为true则停止“。
最下边的”适用于“要自己选择一下，点击输入框的最后边的图标，选中”A-J“栏（可以按照需要选择）。然后点击”确定“。
#### 3、添加宏
右键点击当前工作表(最下边的”Sheet1“，或者其他工作表)，然后点击”查看代码“，会出现一个“Microsoft Visual Basic”(这个可能会出现在任意地方，如果点了“查看代码”没有出现就找找其他层或者显示器)，在里边输入如下代码：
```
Private Sub Worksheet_SelectionChange(ByVal Target As Range)
Application.ScreenUpdating = True
End Sub
```

或者另外一段代码(AI 生成的)：
```
Private Sub Worksheet_SelectionChange(ByVal Target As Range)
    ' 强制刷新条件格式
    Application.Calculate
End Sub
```

#### 4、启用宏
保存文件时选择“Excel 启用宏的工作簿”，打开文件时点击顶部警告栏的“启用宏”。
