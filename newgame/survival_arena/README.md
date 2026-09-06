# 疾锋战区 (Survival Arena)

成人向快局第三人称大逃杀 — 微信小游戏目标平台。

**位置**：`newgame/survival_arena/`（York Coding 仓库内）

**收入目标**：稳定期月净收入约 ¥10,000（第 4 月门禁验证后决定是否继续）。

## 快速开始

### 浏览器原型（上瘾验证，无需 Cocos）

```bash
cd prototype
# 直接用浏览器打开 index.html，或：
npx --yes serve . -p 3456
```

打开 http://localhost:3456 — WASD 移动，鼠标瞄准射击，Q/E 切换武器，R 换弹。

### Cocos Creator 3.8（微信小游戏正式客户端）

1. 安装 [Cocos Creator 3.8 LTS](https://www.cocos.com/creator-download)
2. 打开 `client/` 目录作为工程
3. 构建 → 微信小游戏

### 服务端（联机阶段）

```bash
cd server
npm install
npm start
```

## 目录

| 路径 | 说明 |
|------|------|
| `docs/` | GDD、变现模型、合规、门禁 KPI |
| `prototype/` | 可玩 HTML5 原型（16 人快局 + bot + 缩圈） |
| `client/` | Cocos Creator 3.8 工程 |
| `server/` | Node.js 房间服 |
| `tools/` | 埋点分析、门禁裁决脚本 |

## 门禁

第 4 月软启后运行：

```bash
node tools/gate-check.js --data tools/sample-metrics.json
```

详见 [docs/monetization.md](docs/monetization.md)。
