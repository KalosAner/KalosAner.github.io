---
layout:       post
title:        "Ubuntu 上自定义安装配置 neovim"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - 后端
    - Vim
---

### 一、引言

本文配置使用的是自定义配置，适用于 C++ 开发。

### 二、安装

#### 1、安装 NeoVim

```sh
sudo apt-add-repository ppa:neovim-ppa/unstable
sudo apt update
sudo apt install neovim
sudo apt install clangd -y
sudo apt install lua5.3
```

> 这里的 ppa 使用 unstable，因为 ubuntu 的 neovim 的 stable 版本比较旧

#### 2、安装插件管理器

为了方便管理 NeoVim 插件，可以安装一个插件管理器.

之前 vim 最常见的插件管理应该是 `vim-plug`，如果 Neovim 0.5 之前的版本可以安装 `vim-plug`。

但 Neovim 0.5 以后一般都会推荐使用 lua 原生的 `packer.nvim` 做插件管理。现在 Neovim 常用插件的主页上都有如何用 `Packer.nvim` 安装的说明了，所以不用担心。

安装`packer.nvim`的命令如下：

```
mkdir -p ~/.local/share/nvim/site/pack/packer/start/ && sudo git clone --depth 1 https://github.com/wbthomason/packer.nvim ~/.local/share/nvim/site/pack/packer/start/packer.nvim
```

> 使用 `git clone` 有时可能需要打开 `clash` 的 TUN 模式。

#### 3、基本配置

```
# 创建配置文件夹
mkdir -p ~/.config/nvim
# 创建并编辑 init.lua 配置文件，写入配置
nvim ~/.config/nvim/init.lua
```

#### 4、安装插件

输入 `nvim` 进入 Neovim，然后输入 `:PackerSync` 就会自动下载配置。

#### 附录

我的配置如下，不过这个配置挺一般的，建议使用 [LunarVim](https://github.com/LunarVim/LunarVim) 或者 [LazyVim](https://github.com/LazyVim/LazyVim) 配置。

```lua
-- 基础设置
vim.opt.number = true              -- 显示行号
vim.opt.relativenumber = true      -- 相对行号
vim.opt.tabstop = 4                -- Tab 键宽度
vim.opt.shiftwidth = 4             -- 自动缩进宽度
vim.opt.expandtab = true           -- 使用空格替代 Tab
vim.opt.smartindent = true         -- 智能缩进
vim.opt.termguicolors = true       -- 启用 24 位颜色
vim.opt.wrap = false               -- 禁止自动换行
vim.opt.clipboard = "unnamedplus"  -- 系统剪贴板共享

-- 文件类型和语法高亮
vim.cmd('syntax on')
vim.cmd('filetype plugin indent on')

-- 插件管理
require('packer').startup(function(use)
    use 'wbthomason/packer.nvim'            -- 插件管理器

    -- 文件导航
    use 'nvim-tree/nvim-tree.lua'           -- 文件树
    use 'nvim-telescope/telescope.nvim'    -- 文件搜索

    -- 状态栏
    use 'nvim-lualine/lualine.nvim'         -- 美观状态栏

    -- 语法高亮和 Treesitter
    use 'nvim-treesitter/nvim-treesitter'   -- Treesitter

    -- LSP 支持
    use 'neovim/nvim-lspconfig'             -- LSP 配置
    use 'williamboman/mason.nvim'           -- LSP 安装器
    use 'williamboman/mason-lspconfig.nvim' -- 集成 mason 和 lspconfig

    -- 自动补全
    use 'hrsh7th/nvim-cmp'                  -- 补全引擎
    use 'hrsh7th/cmp-nvim-lsp'              -- LSP 补全
    use 'hrsh7th/cmp-buffer'                -- 缓冲区补全
    use 'hrsh7th/cmp-path'                  -- 路径补全

    -- 调试支持
    use 'mfussenegger/nvim-dap'             -- 调试适配器协议 (DAP)
    use 'rcarriga/nvim-dap-ui'              -- 调试界面
    use 'theHamsta/nvim-dap-virtual-text'   -- 调试时虚拟文本显示

    -- Git 支持
    use 'lewis6991/gitsigns.nvim'           -- Git 集成

    -- 其他
    use 'lukas-reineke/indent-blankline.nvim' -- 显示缩进线
	use 'nvim-neotest/nvim-nio'
end)

-- 文件导航
require('nvim-tree').setup {}
vim.keymap.set('n', '<leader>e', ':NvimTreeToggle<CR>', { noremap = true, silent = true }) -- 文件树快捷键

-- 状态栏
require('lualine').setup {
    options = { theme = 'auto', section_separators = '', component_separators = '' }
}

-- 语法高亮和 Treesitter
require('nvim-treesitter.configs').setup {
    ensure_installed = { "cpp", "c", "lua", "python" }, -- 需要的语言解析器
    highlight = { enable = true }
}

-- LSP 和自动补全
require('mason').setup()
require('mason-lspconfig').setup {
    ensure_installed = { "clangd" } -- 自动安装 clangd
}

-- 配置 clangd
local lspconfig = require('lspconfig')
lspconfig.clangd.setup {}

-- 配置补全引擎 nvim-cmp
local cmp = require('cmp')
cmp.setup {
    mapping = {
        ['<C-n>'] = cmp.mapping.select_next_item(),
        ['<C-p>'] = cmp.mapping.select_prev_item(),
        ['<CR>'] = cmp.mapping.confirm({ select = true }),
    },
    sources = {
        { name = 'nvim_lsp' },
        { name = 'buffer' },
        { name = 'path' }
    }
}

-- 调试支持
local dap = require('dap')
local dapui = require('dapui')
require('nvim-dap-virtual-text').setup {}

dapui.setup()

-- 配置调试适配器
dap.adapters.cppdbg = {
    type = 'executable',
    command = '/path/to/cpptools', -- 替换为 cppdbg 的路径
    name = "cppdbg"
}
dap.configurations.cpp = {
    {
        name = "Launch file",
        type = "cppdbg",
        request = "launch",
        program = function()
            return vim.fn.input('Path to executable: ', vim.fn.getcwd() .. '/', 'file')
        end,
        cwd = '${workspaceFolder}',
        stopOnEntry = false,
    },
}

-- 调试快捷键
vim.keymap.set('n', '<F5>', function() dap.continue() end, { noremap = true, silent = true })   -- 开始调试
vim.keymap.set('n', '<F10>', function() dap.step_over() end, { noremap = true, silent = true }) -- 单步跳过
vim.keymap.set('n', '<F11>', function() dap.step_into() end, { noremap = true, silent = true }) -- 单步进入
vim.keymap.set('n', '<F12>', function() dap.step_out() end, { noremap = true, silent = true })  -- 单步返回
```

