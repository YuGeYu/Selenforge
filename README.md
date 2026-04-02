# Selenforge

Selenforge（月铸引擎）是一个基于 MoonLang 与 PlayCanvas 技术栈演进中的轻量级 3D 引擎原型。

当前仓库重点包含：

- `engine/`：Moonflare 渲染运行时基础
- `editor/`：StarAnvil 编辑器参考源码
- `desktop/`：MoonLang 桌面编辑器前端
- `main.moon`：桌面壳入口
- `build.bat`：Windows 构建脚本

## 当前保存模型

桌面程序启动时会在程序根目录扫描 `sfa1`、`sfa2`、`sfa3` 等目录：

- 如果不存在 `sfa1`，会自动创建 `sfa1` 并写入默认项目
- 如果已存在多个 `sfaN` 目录，会载入编号最大的目录
- 点击编辑器中的“保存”会创建新的 `sfaN` 快照目录
- 点击“载入”会重新载入当前根目录下最新的 `sfaN` 快照

不再使用 `.sfa` 单文件保存。当前快照目录使用以下文件：

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

## Moon 脚本

当前桌面编辑器已经提供基础 Moon 脚本资源链路：

- 项目内维护 `Moon脚本` 资源
- 资源面板点击脚本卡片可打开编辑器
- 保存项目时，脚本会随快照一起写入 `scripts/*.moon`
- 同时生成对应的 `runtime/*.js` 输出文件

当前 `desktop/moon-script-tools.js` 提供的是一个前端内置的 MoonLang -> JS 子集转换器与脚本消息总线骨架，适合先打通编辑、保存、导出和运行时对接流程。后续应替换为更完整的正式编译链。

系统级 Moon 脚本现在通过桌面壳里的 `executeSystemMoonScript` 通道执行：

- 前端仍然只显示 Moon 脚本
- 当脚本角色设为 `system` 时，可在脚本编辑器中直接运行
- 桌面壳会把脚本写入临时目录，用 `MulanMoonlang/moonc.exe` 编译成 EXE 后执行
- 游戏脚本则继续保持 `*.moon` 和 `runtime/*.js` 一一对应

## 游戏构建

桌面编辑器新增了“构建”按钮和构建参数页，当前支持输入：

- 游戏名称
- 公司名称
- 版本号
- 窗口宽高

构建时会：

1. 先保存当前项目快照
2. 在程序根目录生成 `builds/<游戏名>/`
3. 写入运行页、项目数据、Moon 脚本与对应 JS
4. 复制 `moonflare.js`
5. 复制 `MulanMoonlang/`
6. 生成可直接启动的游戏 EXE

## 构建

Windows 下执行：

```bat
build.bat
```

构建结果输出到 `dist/`，并且会把整个 `MulanMoonlang/` 目录复制到 `dist/MulanMoonlang/`，用于后续系统级 Moon 脚本执行与分发打包。
