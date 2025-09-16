---
layout:       post
title:        "vscode 引入本地 neovim 的配置"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - Visual Studio
    - Vim

---
#### 需求：
让 vscode 的编辑框支持 neovim 的操作，包括快捷键之类的。本地已经配置过 neovim，现在想通过引入本地的配置实现。

#### 方法：
首先在 vscode 下载 neovim 的扩展，有时间的话可以仔细看一下扩展的介绍，上面有更详细的用法。如果只是想引入本地 neovim 的配置，只需要简单地在 `.vscode/setting.json` 中添加一些配置就行，如下：

```json
"vscode-neovim.neovimExecutablePaths.darwin": "/opt/homebrew/bin/nvim",
"vscode-neovim.compositeKeys": {
	"jk": {
		"command": "vscode-neovim.escape",
		"args": [],
	},
},

```

或者如下（顺便保存，但是有时候可能会撤销之前写的东西，原因未知）：

```json
"vscode-neovim.neovimExecutablePaths.darwin": "/opt/homebrew/bin/nvim",
"vscode-neovim.compositeKeys": {
	"jk": {
		// Use lua to execute any logic
		"command": "vscode-neovim.lua",
		"args": [
			[
				"local code = require('vscode')",
				"code.action('vscode-neovim.escape')",
				"code.action('workbench.action.files.save')",
			],
		],
	},
},
```
其中的 `/opt/homebrew/bin/nvim` 要换成自己本地的 nvim 地址，下面的 "jk" 是我映射的 "Esc" 键，可以在 insert 模式下快速切换到 normal 模式。

注意：另外如果想设置在每个项目中都使用可以打开设置之后右上角有个图标，鼠标光标悬浮在这个图标会显示 "Open Settings(JSON)"，点击这个图标，然后把上面的配置写到这个文件里边。如果通过这种方法找不到 json 文件可以直接通过路径查找，路径为 "Users/{username}/Library/Aplication Support/Code/User/settings.json"。