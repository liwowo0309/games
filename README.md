# York Coding

一个集合了多款网页游戏、编程教学工具和学习资源的项目。所有内容均为纯前端实现，打开 HTML 文件即可运行，无需安装任何依赖。

## 项目总览

```
york_coding/
├── pilot_flying_game/   # 3D 战斗机飞行模拟器
├── minecraft/           # 网页版 Minecraft
├── rpg/                 # Pocket RPG 冒险游戏
├── newgame/             # 三国志双人对战
├── coding_class/        # 进制转换教学与练习
├── cpp_compiler/        # C++ 在线编译器
├── english_teaching/    # 英语语法学习工具
└── gesp历史真题/         # GESP 三级历史真题 (PDF)
```

---

## 游戏

### Fighter Aircraft Pilot — 3D 战斗机飞行模拟器
`pilot_flying_game/index.html`

基于 Canvas 的 3D 空战飞行游戏。可选择不同战斗机，在天空中自由飞行并进行空中作战。

### Minecraft Web — 网页版我的世界
`minecraft/index.html`

基于 Three.js 的 3D 体素世界。支持方块挖掘与放置、地形生成、合成系统、商店经济、动物互动、飞行模式等丰富的 Minecraft 核心玩法。

### Pocket RPG — 像素冒险
`rpg/index.html`

轻量级回合制 RPG。使用方向键/WASD 在地图上探索，遭遇敌人自动进入战斗，收集药水恢复生命。

### Three Kingdoms Duel — 三国志双人对战
`newgame/main.js`

双人同屏策略游戏。轮流招兵、调兵、攻城，占领对方都城即获胜。

---

## 教学工具

### 进制转换学习套件
`coding_class/` 目录下包含一系列进制转换相关的互动教学页面：

| 文件 | 说明 |
|------|------|
| `base_teach.html` | 进制转换可视化教学工具 |
| `binary_game.html` | 二进制练习游戏 |
| `base_converter_game.html` | 进制转换闯关游戏 |
| `khan_base_converter.html` | Khan Academy 风格进制转换器 |
| `gesp_level3_base_practice.html` | GESP 三级进制专项练习 |

### C++ 在线编译器
`cpp_compiler/cpp_compiler.html`

网页版 C++ 编译器，集成 CodeMirror 代码编辑器，支持语法高亮、多主题切换，可直接在浏览器中编写和运行 C++ 代码。

### 英语语法学习
`english_teaching/tense.html`

英语时态互动学习工具，涵盖时态网格、助动词讲解和练习测验。

---

## 学习资源

### GESP 三级历史真题
`gesp历史真题/` 目录下收录了 2025 年多期 GESP 三级考试真题 PDF：
- 2025.03 / 2025.06 / 2025.09 / 2025.12

---

## 快速开始

所有项目均为纯前端页面，双击对应的 `.html` 文件即可在浏览器中打开运行。推荐使用 Chrome / Edge / Firefox 等现代浏览器。

## 技术栈

- **Three.js** — 3D 游戏渲染 (Minecraft)
- **Canvas API** — 2D/3D 游戏绘制 (飞行模拟器、RPG)
- **CodeMirror** — 代码编辑器 (C++ 编译器)
- **HTML / CSS / JavaScript** — 全部项目的基础

## 作者

York — 9 岁，拥有 3 年编程经验的小开发者
