---
layout: post
title: "vscode 配置 claude code"
author: "Kalos Aner"
header-style: text
catalog: true
tags:
  - 杂谈
  - vibe coding

---



## 0. 前言

本文档介绍如何通过 CCR（Claude Code Router）在 **VS Code** 的 Claude Code 插件中接入和切换非 Claude 系列模型（如 GLM-5.1），涵盖原理说明、配置方法、多模型管理及一键切换脚本的使用。

> 如果想在终端中使用其他模型只需要使用 `ccr code`启动即可。

## 1. Claude Code 与 CCR 简介

### Claude Code（官方）

- **来源**: Anthropic 官方出品
- **安装**: `npm install -g @anthropic-ai/claude-code`
- **命令**: `claude`
- **用途**: 终端/VS Code 中的 AI 编程助手，直接调用 Anthropic API
- **必须使用 Anthropic 账户和 API Key**，只支持 Claude 系列模型

### CCR - Claude Code Router（第三方）

- **来源**: 社区开发者 musistudio
- **安装**: `npm install -g @musistudio/claude-code-router@2.0.0`
- **命令**: `ccr`
- **用途**: 本地代理服务器，拦截 Claude Code 的 API 请求并路由到其他模型提供商
- **支持**: OpenRouter、DeepSeek、Ollama、Gemini、JoyBuilder 等任意 OpenAI 兼容接口
- **配置文件**: `~/.claude-code-router/config.json`
- **默认监听**: `http://127.0.0.1:3456`

> ccr 3.x 之后架构变化，侧重于UI界面的使用，并且下面的方法会失效。因此推荐安装 2.0.0。另外部分中转站可能不支持ccr。

### 核心区别

|      | Claude Code         | CCR                            |
| ---- | ------------------- | ------------------------------ |
| 性质 | AI 编程助手         | 请求路由代理                   |
| 关系 | 独立运行            | 依赖 Claude Code，在其上层工作 |
| 模型 | 仅 Claude           | 任意 LLM                       |
| 账户 | 需要 Anthropic 账户 | 不需要，用第三方 Key           |

## 2. 在 Claude Code 中使用非 Claude 系列模型的原理

Claude Code 原生只支持 Anthropic API 协议（POST `/v1/messages`）。要使用非 Claude 模型，需要一个**协议转换层**，将 Anthropic 格式请求转为 OpenAI 格式（`/v1/chat/completions`），再将 OpenAI 格式响应转回 Anthropic 格式。

CCR 就是做这件事的：`Claude Code → CCR(协议转换) → 目标模型 API`

> **具体方法见第3条。**

## 3. 在 VS Code 中使用 Claude code 中的其他模型（如 GLM5.1）

### 前提

- VS Code 中安装的插件是官方 `anthropic.claude-code`，不是 CCR 的插件

![img](\img\in-post\M3wKpTGCbkNkkFWzHwiY.png)

- CCR 没有独立的 VS Code 插件，它通过修改 `ANTHROPIC_BASE_URL` 让请求经过 CCR

> 终端中如果想使用其他模型只需要在ccr的配置文件中配置完成之后使用 `ccr code` 其中即可，但是vscode中没有ccr插件，所以需要使用claude code插件，然后通过**配置**claude和ccr来转发claude code插件的请求。

### 配置步骤

1. **启动 CCR 代理**: 在终端运行 `ccr start`（保持运行）
2. **修改** `**~/.claude/settings.json**`: 将 `ANTHROPIC_BASE_URL` 指向 CCR

```
// http://127.0.0.1:3456 中的IP和PORT都是 ~/.claude-code-router/config.json 指定的
"ANTHROPIC_BASE_URL": "http://127.0.0.1:3456"
```

1. **配置"ANTHROPIC_BASE_URL"之后类似"ANTHROPIC_AUTH_TOKEN"等字段就会失效，请求就会直接走 CCR。**

> **具体的~/.claude-code-router/config.json内容见第4条**

### 直连 vs CCR 模式

| 模式 | `ANTHROPIC_BASE_URL`    | 说明                                             |
| ---- | ----------------------- | ------------------------------------------------ |
| 直连 | `<url>`                 | 直接访问 claude 官网或者 claude 系列模型的中转站 |
| CCR  | `http://127.0.0.1:3456` | 经 CCR 路由，可使用任意模型                      |

## 4. 配置多个模型

CCR 配置文件: `~/.claude-code-router/config.json`。

```json
{
  "LOG": false,
  "LOG_LEVEL": "debug",
  "CLAUDE_PATH": "",
  "HOST": "127.0.0.1",
  "PORT": 3456,
  "APIKEY": "",
  "API_TIMEOUT_MS": "600000",
  "PROXY_URL": "",
  "transformers": [],
  "Providers": [
    {
      "name": "claude",
      "api_base_url": "<url>/anthropic/v1/messages",
      "api_key": "xxx",
      "models": [
        "Claude-Opus-4.6"
      ],
      "transformer": {
        "use": [
          "Anthropic"
        ],
        "Claude-Opus-4.6": {
          "use": [
            "Anthropic"
          ]
        }
      }
    },
    {
      "name": "glm",
      "api_base_url": "<url>/v1/chat/completions",
      "api_key": "xxx",
      "models": [
        "GLM-5.1"
      ]
    },
    {
      "name": "gemini",
      "api_base_url": "<url>/v1/images/gemini_flash/generations",
      "api_key": "xxx",
      "models": [
        "Gemini-3-Pro-Image-Preview"
      ]
    },
    {
      "name": "deepseek",
      "api_base_url": "<url>/v1/chat/completions",
      "api_key": "xxx",
      "models": [
        "DeepSeek-V4-Flash"
      ]
    },
    {
      "name": "deepseek-v4-pro",
      "api_base_url": "<url>/v1/chat/completions",
      "api_key": "xxx",
      "models": [
        "DeepSeek-V4-Pro"
      ]
    }
  ],
  "StatusLine": {
    "enabled": false,
    "currentStyle": "default",
    "default": {
      "modules": []
    },
    "powerline": {
      "modules": []
    }
  },
  "Router": {
    "default": "deepseek,DeepSeek-V4-Flash",
    "background": "deepseek,DeepSeek-V4-Flash",
    "think": "deepseek,DeepSeek-V4-Flash",
    "longContext": "deepseek,DeepSeek-V4-Flash",
    "longContextThreshold": 60000,
    "webSearch": "deepseek,DeepSeek-V4-Flash",
    "image": "deepseek,DeepSeek-V4-Flash"
  },
  "CUSTOM_ROUTER_PATH": ""
}
```

### 关键字段说明

- **Providers[].name**: 提供商名称，Router 中用 `name,model` 格式引用

- **Providers[].api_base_url**: API 地址

- - Claude 模型用 Anthropic 原生接口: `<url>/anthropic/v1/messages`
  - 非 Claude 模型用 OpenAI 兼容接口: `<url>/v1/chat/completions`

该字段可以在模型官网或者中转站平台上查到。

- **Providers[].transformer**: Claude 模型需设置 `"use": ["Anthropic"]` 表示透传（不做协议转换）；非 Claude 模型无需设置（CCR 自动做 Anthropic→OpenAI 转换）

- **Router**: 各场景路由，CCR 作为代理拦截 Claude Code 的每一个 API 请求，根据请求内容特征自动匹配路由规则，对用户无感，格式为 `provider_name,model_name`

- - `default`: 默认模型
  - `background`: 后台任务模型
  - `think`: 推理模型
  - `longContext`: 长上下文模型

### 新增模型的步骤

1. 在 `Providers` 数组中添加新的 provider 配置
2. 在 `Router` 中将需要的场景指向新模型（格式: `name,model`）
3. 重启 CCR: `ccr restart`
4. 重新打开 Claude Code

## 5. 使用脚本切换模型

### 脚本位置

我让AI帮我生成了一个切换模型的脚本：`~/.claude-code-router/ccr-switch.sh`

### 用法

```
~/.claude-code-router/ccr-switch.sh

Current model: claude,Claude-Opus-4.6

Available models:
  1) claude,Claude-Opus-4.6  <-- current
  2) glm,GLM-5.1
  3) gemini,Gemini-3-Pro-Image-Preview
  4) glm5.1,GLM-5.1

  0) Cancel

Select model number (0 to cancel): 0
Cancelled.
```

这个脚本会从~/.claude-code-router/config.json获取可用的模型信息（如果不可用请让AI帮你修改一下）。

~/.claude-code-router/ccr-switch.sh

```shell
#!/usr/bin/env bash
# Switch CCR default model interactively
# Usage: ccr-switch

set -euo pipefail

CCR_CONFIG="$HOME/.claude-code-router/config.json"
CLAUDE_SETTINGS="$HOME/.claude/settings.json"

# Read available models from CCR config
MODELS=$(python3 -c "
import json
with open('$CCR_CONFIG') as f:
    cfg = json.load(f)
for p in cfg.get('Providers', []):
    name = p['name']
    for m in p.get('models', []):
        print(f'{name},{m}')
")

if [ -z "$MODELS" ]; then
  echo "No models found in CCR config"
  exit 1
fi

# Get current default
CURRENT=$(python3 -c "
import json
with open('$CCR_CONFIG') as f:
    cfg = json.load(f)
print(cfg.get('Router', {}).get('default', 'unknown'))
")

echo "Current model: $CURRENT"
echo ""
echo "Available models:"

# Build array (compatible with Bash 3.2 on macOS)
MODEL_LIST=()
while IFS= read -r line; do
  [ -z "$line" ] && continue
  MODEL_LIST+=("$line")
done <<< "$MODELS"

for i in "${!MODEL_LIST[@]}"; do
  item="${MODEL_LIST[$i]}"
  marker=""
  if [ "$item" = "$CURRENT" ]; then
    marker="  <-- current"
  fi
  echo "  $((i+1))) $item$marker"
done

echo ""
echo "  0) Cancel"
echo ""
read -rp "Select model number (0 to cancel): " choice

if [ "$choice" = "0" ] || [ -z "$choice" ]; then
  echo "Cancelled."
  exit 0
fi

if ! [[ "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -lt 1 ] || [ "$choice" -gt "${#MODEL_LIST[@]}" ]; then
  echo "Invalid selection"
  exit 1
fi

TARGET="${MODEL_LIST[$((choice-1))]}"

if [ "$TARGET" = "$CURRENT" ]; then
  echo "Already using $TARGET"
  exit 0
fi

# Update CCR config Router
python3 -c "
import json
with open('$CCR_CONFIG') as f:
    cfg = json.load(f)
for key in cfg.get('Router', {}):
    if key == 'longContextThreshold':
        continue
    cfg['Router'][key] = '$TARGET'
with open('$CCR_CONFIG', 'w') as f:
    json.dump(cfg, f, indent=2, ensure_ascii=False)
    f.write('\n')
"

# Update settings.json: ANTHROPIC_BASE_URL (from HOST+PORT) and model fields (from TARGET)
python3 -c "
import json
with open('$CCR_CONFIG') as f:
    ccr = json.load(f)
host = ccr.get('HOST', '127.0.0.1')
port = ccr.get('PORT', 3456)
base_url = f'http://{host}:{port}'

model = '$TARGET'.split(',', 1)[1]

with open('$CLAUDE_SETTINGS') as f:
    settings = json.load(f)
env = settings.setdefault('env', {})

changed = False
if env.get('ANTHROPIC_BASE_URL', '') != base_url:
    env['ANTHROPIC_BASE_URL'] = base_url
    changed = True

for key in (
    'ANTHROPIC_DEFAULT_HAIKU_MODEL',
    'ANTHROPIC_DEFAULT_OPUS_MODEL',
    'ANTHROPIC_DEFAULT_SONNET_MODEL',
    'ANTHROPIC_MODEL',
):
    if env.get(key, '') != model:
        env[key] = model
        changed = True

if changed:
    with open('$CLAUDE_SETTINGS', 'w') as f:
        json.dump(settings, f, indent=2, ensure_ascii=False)
        f.write('\n')
"

echo "Switched to: $TARGET"
ccr restart
```

### 脚本功能

1. 从 CCR config 中自动读取可用模型列表
2. 显示当前模型并标记
3. 交互式选择目标模型
4. 自动更新 CCR Router 配置
5. 自动同步 `ANTHROPIC_BASE_URL` 到 `~/.claude/settings.json`（从 CCR config 的 HOST+PORT 拼接）
6. 自动执行 `ccr restart`（重启ccr切换模型才会生效）

### 添加别名（可选）

在 `~/.zshrc` 中添加:

```
alias ccr-switch='~/.claude-code-router/ccr-switch.sh'
```

## 6. IntelliJ IDEA 使用 claude code

IDEA中也有 claude code 相关的插件，直接搜Claude Code，如下图。

![img](\img\in-post\e8vgx2IHcBxZkcX7pHpl.png)

图中两个插件都可以使用，这里演示以CC GUI为例。

使用起来非常简单，打开插件之后直接输入对话，它会提示你需要安装或者配置什么。也可以参考下面的案例。使用之前需要先安装SDK，如下图

![img](\img\in-post\a4597Q27CMyVC1x9rUgn.png)

然后授权本地配置，如下图。

![img](\img\in-post\EgNsD4DCDDHXBpVYhZdh.png)

然后就可以直接进行对话了。

## 7. 注意事项

- GLM-5.1 等非 Claude 模型对 tool use（工具调用）的兼容性可能不如 Claude，Claude Code 大量依赖工具调用
- 修改配置后必须重启 CCR 才能生效
- VS Code 中的 Claude Code 面板需要在配置变更后重新打开
