# Back to chat / dsh-back-to-chat

Adds a back button to the upper-left corner of the DeepSeek Harness Plugins, Schedules and Context Insights panels, including plugin detail pages. Returns to the retained conversation without replacing the session or its draft. Supports light/dark themes, collapsed sidebars and Chinese/English labels. No persistent data or additional shortcuts.

[中文](README.md) · MIT

[![verify](https://github.com/DEVbyQIN/dsh-back-to-chat/actions/workflows/verify.yml/badge.svg)](https://github.com/DEVbyQIN/dsh-back-to-chat/actions/workflows/verify.yml)
[![npm](https://img.shields.io/npm/v/dsh-back-to-chat.svg)](https://www.npmjs.com/package/dsh-back-to-chat)

## Install

**Desktop GUI**: open **Plugins** → **Add plugin** → enter `dsh-back-to-chat` → **Enable now**.

**CLI** (any one):

```sh
"/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" \
  plugin --profile desktop add dsh-back-to-chat@0.1.1

dsh plugin --profile web add dsh-back-to-chat@0.1.1
dsh plugin --profile web add github:DEVbyQIN/dsh-back-to-chat#v0.1.1
```

Or install the [dsh-sidebar-expand](https://github.com/DEVbyQIN/dsh-sidebar-expand) bundle to get all four sidebar plugins at once. Install either the bundle or this plugin — not both.

## Validation

```sh
node --test test/verify.mjs
```
