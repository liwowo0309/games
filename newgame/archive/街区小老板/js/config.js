/**
 * 街区小老板 — 配置（含策略层）
 */
const GameConfig = {
  SAVE_KEY: "blockBoss_save_v3",
  STARTING_SOFT: 50,
  OFFLINE_CAP_HOURS: 4,
  SUB_OFFLINE_CAP_HOURS: 8,
  SUB_INCOME_BONUS: 0.05,
  OFFLINE_MIN_SECONDS: 15,
  PLAN_SWITCH_COOLDOWN_SEC: 45,
  CUSTOMER_TTL_SEC: 3.2,
  COMBO_WINDOW_SEC: 1.8,
  COMBO_MAX: 8,
  EVENT_COOLDOWN_SEC: 90,

  defaultName: "小老板",

  /** 定价：客流 vs 客单价 vs 挂机，选错就赚得慢 */
  pricing: {
    cheap: {
      id: "cheap",
      name: "亲民价",
      desc: "客人多，但每人少赚；适合练手速",
      spawn: 1.45,
      tip: 0.7,
      passive: 0.92,
      offline: 1,
    },
    fair: {
      id: "fair",
      name: "公道价",
      desc: "均衡，适合大多数时候",
      spawn: 1,
      tip: 1,
      passive: 1,
      offline: 1,
    },
    premium: {
      id: "premium",
      name: "精品价",
      desc: "客人少但爆单；漏单更亏——考反应",
      spawn: 0.62,
      tip: 1.75,
      passive: 1.08,
      offline: 0.95,
    },
  },

  /** 经营方针：互斥，切换有冷却 */
  plans: {
    rush: {
      id: "rush",
      name: "高峰盯梢",
      desc: "接待奖励↑，离线↓ —— 适合在线猛点",
      customer: 1.4,
      offline: 0.75,
      passive: 1,
      upgrade: 1,
      spawn: 1.15,
    },
    idle: {
      id: "idle",
      name: "挂机托底",
      desc: "离线↑，接待↓ —— 适合放下手机",
      customer: 0.75,
      offline: 1.4,
      passive: 0.95,
      upgrade: 1,
      spawn: 0.9,
    },
    thrifty: {
      id: "thrifty",
      name: "省钱装修",
      desc: "升级更便宜，产速略低 —— 冲等级用",
      customer: 1,
      offline: 1,
      passive: 0.85,
      upgrade: 0.82,
      spawn: 1,
    },
  },

  /** 互斥专精：只能点一条，永久（重置除外） */
  specs: {
    night: {
      id: "night",
      name: "夜市专精",
      desc: "离线收益 +28%，接待 -10%",
      cost: 120,
      requireStallLv: 3,
      offline: 1.28,
      customer: 0.9,
      passive: 1,
    },
    noon: {
      id: "noon",
      name: "午高峰专精",
      desc: "接待奖励 +32%，离线 -10%",
      cost: 120,
      requireStallLv: 3,
      offline: 0.9,
      customer: 1.32,
      passive: 1,
    },
  },

  events: {
    promo: {
      id: "promo",
      name: "校园日促销",
      desc: "花一笔启动金，45 秒内接待翻倍。投不投？",
      costMult: 8,
      durationSec: 45,
      customerMult: 2,
    },
  },

  hairs: [
    { id: "short", name: "清爽短发", color: "#2c2418" },
    { id: "messy", name: "翘毛", color: "#3d2b1f" },
    { id: "pony", name: "马尾", color: "#5c3d2e" },
    { id: "cap", name: "棒球帽", color: "#1a3a5c" },
  ],

  outfits: [
    { id: "tee", name: "白T恤", body: "#f4f0e8", accent: "#2a9d8f" },
    { id: "hoodie", name: "薄荷绿帽衫", body: "#3d9b84", accent: "#1f5c4d" },
    { id: "apron", name: "店员围裙", body: "#e8e0d4", accent: "#c45c26" },
    { id: "jacket", name: "牛仔外套", body: "#3d5a80", accent: "#e9c46a" },
  ],

  skins: [
    { id: "fair", name: "浅", color: "#f3d5b5" },
    { id: "warm", name: "暖", color: "#e0ac69" },
    { id: "deep", name: "深", color: "#8d5524" },
  ],

  speeches: [
    "定价要想清楚！",
    "客人来了快接待！",
    "连击越高越赚！",
    "漏单会打断连击哦",
    "冲级就选省钱装修",
    "要挂机就选托底方针",
  ],

  rivals: [
    { name: "阿柠的茶摊", rate: 3.2, grade: "C" },
    { name: "文具小鹿", rate: 8.5, grade: "B" },
    { name: "电玩阿杰", rate: 18, grade: "B" },
    { name: "商场小希", rate: 42, grade: "A" },
  ],

  customerEmojis: ["🧑", "👩", "🧒", "👴", "👱"],

  shops: {
    stall: {
      id: "stall",
      name: "路边小摊",
      icon: "🍡",
      building: "stall",
      baseIncome: 1.4,
      incomeGrowth: 1.18,
      baseCost: 18,
      costGrowth: 1.2,
      startUnlocked: true,
      startLevel: 1,
    },
    tea: {
      id: "tea",
      name: "奶茶店",
      icon: "🧋",
      building: "tea",
      baseIncome: 5,
      incomeGrowth: 1.2,
      baseCost: 90,
      costGrowth: 1.24,
      startUnlocked: false,
      startLevel: 0,
      unlock: {
        requiresShop: "stall",
        minLevel: 5,
        hint: "小摊升到 Lv.5 开业",
      },
    },
  },

  shopOrder: ["stall", "tea"],
};
