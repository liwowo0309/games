# 第 4 月软启操作手册

## 目标

200～500 真实用户，连续观察 **14 天**，收集埋点并运行门禁裁决。

## 步骤

### 1. 准备包体

- Cocos 构建微信小游戏，或原型阶段用 H5 链接分发
- 首包 < 20MB，隐私政策 URL 可访问

### 2. 获客渠道

| 渠道 | 预期人数 | 成本 |
|------|---------|------|
| 亲友微信群 | 50～100 | ¥0 |
| 小游戏社群/论坛 | 50～150 | ¥0 |
| 短视频测试投流 | 100～250 | ¥300～500 |

### 3. 埋点收集

原型阶段：玩家点击「导出埋点数据」，汇总 JSON 文件。

正式版：接入微信数据助手 + 自建 `server/analytics` 聚合。

### 4. 每日监控

| 指标 | 工具 |
|------|------|
| DAU | 埋点 `session_start` 去重 |
| D1/D7 | 首日 cohort 回访 |
| 人均开局 | `match_start` / DAU |
| 广告 | `ad_complete` / DAU |
| IAP | `iap_success` / 样本用户 |

### 5. 第 14 天裁决

```bash
node tools/gate-check.js --data path/to/aggregated-metrics.json
```

- **PASS** → 进入 scale-or-stop 冲量阶段
- **FAIL** → 再观察 7 天或 pivot
- **KILL** → 立即停止

## 聚合脚本（多用户 JSON 合并）

将多个 `survival_arena_metrics.json` 放入 `tools/raw/`，运行：

```bash
node tools/aggregate-metrics.js
```

输出 `tools/aggregated-metrics.json` 供 gate-check 使用。
