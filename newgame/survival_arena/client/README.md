# Cocos Creator 3.8 客户端

微信小游戏正式客户端工程目录。

## 创建工程

1. 安装 [Cocos Creator 3.8 LTS](https://www.cocos.com/creator-download)
2. 新建项目 → 空项目 3D → 保存到本目录 `client/`
3. 将 `scripts/` 下 TypeScript 复制到 `assets/scripts/`

## 目录说明

```
client/
  scripts/           # 可复用脚本（复制到 Cocos assets）
    GameConfig.ts    # 数值配置
    NetClient.ts     # WebSocket 联机
    Monetization.ts  # 微信广告 + IAP 接口
    Analytics.ts     # 埋点
  BUILD.md           # 微信小游戏构建步骤
```

## 与原型关系

`prototype/` 用于快速验证上瘾感；Cocos 工程用于微信上架与 3D 第三人称正式版。

原型验证通过后，将数值与 monetization 逻辑迁移到本工程。
