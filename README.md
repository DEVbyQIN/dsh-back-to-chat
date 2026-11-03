# 返回当前会话 / dsh-back-to-chat

在 DeepSeek Harness 插件管理、自动化任务和上下文洞察页面左上角显示「← 返回当前会话」。点击后恢复当前会话，保留输入草稿；在插件详情页也可使用。支持浅色、深色、侧栏折叠及中英文界面。无持久化数据，无新增快捷键。

[English](README_EN.md) · MIT

[![verify](https://github.com/DEVbyQIN/dsh-back-to-chat/actions/workflows/verify.yml/badge.svg)](https://github.com/DEVbyQIN/dsh-back-to-chat/actions/workflows/verify.yml)
[![npm](https://img.shields.io/npm/v/dsh-back-to-chat.svg)](https://www.npmjs.com/package/dsh-back-to-chat)

## 安装

**桌面版（图形界面）**：左侧「插件」→「添加插件」，填包名 `dsh-back-to-chat`，装完点「立即启用」。

**命令行（任选一种）**：

```sh
"/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" \
  plugin --profile desktop add dsh-back-to-chat@0.1.1

dsh plugin --profile web add dsh-back-to-chat@0.1.1
dsh plugin --profile web add github:DEVbyQIN/dsh-back-to-chat#v0.1.1
```

也可以装组合包 [dsh-sidebar-expand](https://github.com/DEVbyQIN/dsh-sidebar-expand)，一次拿到四个侧边栏插件；组合包和本插件单独安装**二选一**，不要同时装。

## 开发验证

```sh
node --test test/verify.mjs
```
