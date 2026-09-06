# 微信小游戏构建步骤

## 1. 项目设置

- 设计分辨率：1280 × 720（横屏）
- 引擎：Cocos Creator 3.8 LTS
- 渲染：3D 第三人称

## 2. 分包策略（首包 < 20MB）

| 分包 | 内容 |
|------|------|
| 主包 | 启动、UI、核心脚本、1 把枪模型 |
| sub_map | 灰岩岛地图资源 |
| sub_skins | 皮肤资源 |

## 3. 构建流程

1. 菜单 → 项目 → 构建发布
2. 发布平台：**微信小游戏**
3. 填写 AppID（企业主体小游戏账号）
4. 勾选 **分包加载**
5. 构建 → 用微信开发者工具打开 `build/wechatgame`

## 4. 接入清单

- [ ] `wx.createRewardedVideoAd` — 激励视频（见 `Monetization.ts`）
- [ ] `wx.requestMidasPayment` — 虚拟支付沙盒
- [ ] 隐私政策 URL — `docs/compliance.md`
- [ ] 服务器域名 — 在小游戏后台配置 WebSocket 合法域名

## 5. 软启发布

- 体验版 → 分享给 200～500 测试用户
- 收集埋点 → `tools/aggregate-metrics.js` → `tools/gate-check.js`
