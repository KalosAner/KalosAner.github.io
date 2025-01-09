---
layout:       post
title:        "Windows 上配置 neovim"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - 后端
    - Vim
---

### 一、引言

本文配置使用的是自定义配置，适用于 C++ 开发。

### 二、安装 packer.vim

`Packer` 是 LunarVim 默认使用的插件管理器。

进入 `C:\Users\<你的用户名>\AppData\Local\nvim-data` 中，创建文件夹 `\site\pack\packer\start\`，在该文件夹下执行 `git clone --depth 1 https://github.com/wbthomason/packer.nvim` 进行下载。

### 三、安装 plugin

在 `C:\Users\Administrator\AppData\Local\nvim` 中创建 `init.lua`，我使用的配置如下。

然后在终端输入 `nvim` 进入 neovim，然后在 normal 模式下输入 `:PackerSync`。

然后就配置成功了。

```lua
-- 基础设置
vim.opt.number = true          -- 显示行号
vim.opt.relativenumber = true  -- 显示相对行号
vim.opt.tabstop = 4            -- Tab 键宽度
vim.opt.shiftwidth = 4         -- 自动缩进宽度
vim.opt.expandtab = true       -- 使用空格替代 Tab
vim.opt.smartindent = true     -- 智能缩进
vim.opt.termguicolors = true   -- 启用 24 位颜色
vim.opt.wrap = false           -- 禁止自动换行

-- 插件管理（使用 packer.nvim）
require('packer').startup(function(use)
    -- 插件管理器
    use 'wbthomason/packer.nvim'

    -- 文件导航
    use 'nvim-tree/nvim-tree.lua'
    use 'nvim-lualine/lualine.nvim'       -- 状态栏
    use 'nvim-telescope/telescope.nvim'  -- 文件查找

    -- 语法高亮
    use 'nvim-treesitter/nvim-treesitter'

    -- LSP 支持
    use 'neovim/nvim-lspconfig'          -- LSP 基础配置
    use 'williamboman/mason.nvim'        -- LSP/DAP 安装器
    use 'williamboman/mason-lspconfig.nvim'

    -- 自动补全
    use 'hrsh7th/nvim-cmp'               -- 补全引擎
    use 'hrsh7th/cmp-nvim-lsp'           -- LSP 补全
    use 'hrsh7th/cmp-buffer'             -- 缓冲区补全
    use 'hrsh7th/cmp-path'               -- 文件路径补全

    -- 调试工具
    use 'mfussenegger/nvim-dap'          -- 调试适配器协议 (DAP)
    use 'rcarriga/nvim-dap-ui'           -- 调试界面

    -- 其他功能
    use 'lewis6991/gitsigns.nvim'        -- Git 集成
    use 'lukas-reineke/indent-blankline.nvim' -- 显示缩进线
	
	use 'nvim-neotest/nvim-nio'
end)

-- 配置 nvim-tree 文件导航
require('nvim-tree').setup {}

-- 配置 lualine 状态栏
require('lualine').setup {
    options = {
        theme = 'auto',                  -- 自动适配主题
        section_separators = '',
        component_separators = ''
    }
}

-- 配置 Treesitter 语法高亮
require('nvim-treesitter.configs').setup {
    ensure_installed = { "cpp", "lua", "python" },  -- 安装的语言解析器
    highlight = { enable = true }
}

-- 配置 Mason 和 LSP
require('mason').setup()
require('mason-lspconfig').setup {
    ensure_installed = { "clangd", "lua_ls" }  -- 自动安装 clangd 和 lua_ls
}

-- LSP 基础配置
local lspconfig = require('lspconfig')
lspconfig.clangd.setup {}  -- 配置 clangd 用于 C++

-- 配置自动补全
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

-- 配置调试工具 (DAP)
local dap = require('dap')
local dapui = require('dapui')
dapui.setup()
dap.adapters.cppdbg = {
    type = 'executable',
    command = 'path/to/cpptools', -- 替换为 cppdbg 调试适配器路径
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

-- 快捷键映射
vim.keymap.set('n', '<leader>e', ':NvimTreeToggle<CR>')  -- 文件树开关
vim.keymap.set('n', '<leader>f', ':Telescope find_files<CR>') -- 文件查找
vim.keymap.set('n', '<F5>', function() dap.continue() end) -- 开始调试
vim.keymap.set('n', '<F10>', function() dap.step_over() end) -- 单步跳过
vim.keymap.set('n', '<F11>', function() dap.step_into() end) -- 单步进入
vim.keymap.set('n', '<F12>', function() dap.step_out() end) -- 单步返回
-- 确保 packer.nvim 被正确加载
local ensure_packer = function()
    local fn = vim.fn
    local install_path = fn.stdpath('data')..'/site/pack/packer/start/packer.nvim'
    if fn.empty(fn.glob(install_path)) > 0 then
        fn.system({'git', 'clone', '--depth', '1', 'https://github.com/wbthomason/packer.nvim', install_path})
        vim.cmd [[packadd packer.nvim]]
        return true
    end
    return false
end

local packer_bootstrap = ensure_packer()

-- 插件管理
require('packer').startup(function(use)
    use 'wbthomason/packer.nvim'  -- packer.nvim 本身
    -- 这里可以添加更多插件，例如:
    use 'nvim-treesitter/nvim-treesitter'
    use 'nvim-lualine/lualine.nvim'
    -- 自动同步
    if packer_bootstrap then
        require('packer').sync()
    end
end)
```

