# Selenforge

Selenforge 是一个基于 MoonLang 的自研游戏引擎与编辑器项目。

项目当前形态是：

- `engine/`：参考 PlayCanvas engine 演进的运行时与渲染基础
- `editor/`：参考 PlayCanvas editor 演进的编辑器源码
- `desktop/`：桌面编辑器前端资源
- `main.moon`：MoonLang 桌面壳入口
- `build.bat`：Windows 一键构建脚本

## 项目目标

Selenforge 目前聚焦于一套可在 Windows 上运行的 MoonLang 工作流：

- 使用 MoonLang 编写桌面编辑器壳层
- 管理场景、资源与脚本快照
- 将游戏项目导出为可直接运行的 Windows EXE
- 结合 MoonLang 1.6 工具链完成本地构建与分发

## 当前状态

当前仓库已经完成这些基础能力：

- MoonLang 1.6 工具链接入
- 桌面编辑器壳构建
- 基于 `sfaN/` 目录的项目快照保存
- Moon 脚本资源编辑与保存
- 游戏构建输出到 `builds/<GameName>/`
- 桌面发行输出到 `dist/`

## 仓库结构

```text
selenforge/
  desktop/              桌面编辑器前端
  editor/               编辑器源码
  engine/               引擎源码
  main.moon             桌面壳入口
  build.bat             Windows 构建脚本
  MOONLANG_1_6_UPGRADE.md
```

## 快速开始

本项目当前面向 Windows 开发环境。

### 1. 准备依赖

- 安装 Node.js 和 npm
- 准备本地 MoonLang 1.6 工具链
- 确保仓库根目录下存在 `MulanMoonlang/`

本地工具链至少需要包含：

```text
MulanMoonlang/
  moonc.exe
  moonrt.lib
  packages/
```

并且应满足：

```text
MulanMoonlang/moonc.exe --version
=> MoonLang Native Compiler v1.6.0
```

### 2. 构建桌面编辑器

在仓库根目录执行：

```bat
build.bat
```

构建成功后会输出：

- `dist/SelenforgeEditor.exe`
- `dist/MulanMoonlang/`
- `dist/vendor/moonflare.js`

## 项目保存模型

编辑器当前使用 `sfaN/` 目录快照，而不是单个 `.sfa` 文件。

典型结构如下：

```text
sfaN/
  project.ini
  project.txt
  scenes/
    main.scene.txt
  assets/
    assets.cfg
  scripts/
    *.moon
    scripts.cfg
  runtime/
    *.js
```

行为约定如下：

- 如果不存在 `sfa1/`，程序会自动创建默认快照
- 如果存在多个 `sfaN/`，默认加载编号最大的快照
- 保存项目时会更新当前快照目录中的项目、场景、资源与脚本文件

## Moon 脚本工作流

当前桌面编辑器支持将 Moon 脚本作为项目资源进行管理：

- 脚本源码保存到 `scripts/*.moon`
- 运行时产物保存到 `runtime/*.js`
- 系统级脚本通过桌面壳内的 `executeSystemMoonScript` 通道执行
- 系统脚本执行时会调用 `MulanMoonlang/moonc.exe` 编译为 EXE 后运行

当前 `desktop/moon-script-tools.js` 提供的是一套前端内置的 MoonLang 到 JS 转换与运行时桥接方案，适合先打通编辑、保存和导出流程；后续可以继续替换为更完整的正式编译链。

## 游戏构建

编辑器支持将当前项目构建为独立游戏目录与 EXE。

构建时会：

1. 保存当前项目快照
2. 生成 `builds/<GameName>/`
3. 写入运行页面、项目数据与脚本文件
4. 复制 `moonflare.js`
5. 复制 `MulanMoonlang/`
6. 生成可直接启动的游戏 EXE

## MoonLang 1.6

本仓库当前以 MoonLang 1.6 为目标版本。

相关说明见：

- [MOONLANG_1_6_UPGRADE.md](./MOONLANG_1_6_UPGRADE.md)

## 后续建议

如果希望 GitHub 仓库首页展示更完整，建议在仓库 About 区域补充：

- Description：`MoonLang-based game engine and desktop editor prototype for Windows`
- Topics：`moonlang`, `game-engine`, `editor`, `windows`, `playcanvas`
