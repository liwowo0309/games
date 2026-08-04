/**
 * 都市大亨 — 全局配置
 */
const GameConfig = {
  SAVE_KEY: "metroTycoon_save_v1",
  CLOUD_KEY: "metroTycoon_cloud_v1",
  NET_DB_KEY: "metroTycoon_netdb_v1",
  STARTING_SOFT: 120,
  STARTING_GEMS: 28,
  OFFLINE_CAP_HOURS: 4,
  SUB_OFFLINE_CAP_HOURS: 8,
  SUB_INCOME_BONUS: 0.05,
  OFFLINE_MIN_SECONDS: 12,
  PLAN_SWITCH_COOLDOWN_SEC: 40,
  ORDER_TTL_SEC: 3.0,
  /** 订单出现后自动成交，无需点击 */
  AUTO_SERVE_DELAY_SEC: 0.85,
  COMBO_WINDOW_SEC: 1.7,
  COMBO_MAX: 8,
  MARKET_CYCLE_SEC: 75,
  /** 大额冲击间隔更短，制造紧张感 */
  BILL_MIN_GAP_SEC: 28,
  BILL_MAX_GAP_SEC: 55,
  /** 运营成本：日常慢扣；真正吓人的是周期性大额账单 */
  opex: {
    basePerShop: 0.45,
    perLevel: 0.12,
    electric: 0.4,
    water: 0.22,
    land: 0.38,
    newtownLandExtra: 1.25,
  },
  /**
   * 大额账单：按当前都市币比例一次扣掉（例：20k 地租可扣约一半）
   * wealthPct: [min, max] 占当前金币比例
   */
  bills: [
    { id: "electric", name: "电费结算", wealthPct: [0.22, 0.35], costMult: 2.2, durationSec: 20 },
    { id: "water", name: "水费结算", wealthPct: [0.18, 0.28], costMult: 1.8, durationSec: 18 },
    { id: "rent", name: "地租暴涨", wealthPct: [0.4, 0.55], costMult: 3.2, durationSec: 26 },
    { id: "tax", name: "突击税费", wealthPct: [0.28, 0.42], costMult: 2.4, durationSec: 22 },
    { id: "repair", name: "设备大修", wealthPct: [0.3, 0.45], costMult: 2.0, durationSec: 24 },
  ],
  /** 暴赚：同样按资产比例一笔进账，形成大起大落 */
  windfalls: [
    { id: "festival", name: "旺季分红到账", wealthPct: [0.25, 0.4] },
    { id: "deal", name: "大客户成交", wealthPct: [0.2, 0.35] },
    { id: "rally", name: "行情暴涨套现", wealthPct: [0.3, 0.5] },
  ],
  /** 冲击事件里，账单 vs 暴赚 的权重（账单略多更紧张） */
  SHOCK_BILL_WEIGHT: 0.62,
  BOOST_DAILY_CAP_SEC: 1800,
  LIKE_DAILY_CAP: 8,
  defaultName: "都市新锐",

  /** 街上别人的店（可参观吃喝） */
  neighborShops: [
    {
      id: "nb_cafe",
      name: "港湾咖啡",
      icon: "☕",
      colorKey: "cafe",
      ownerName: "港湾资本",
      menu: [
        { id: "latte", name: "拿铁", cost: 12, heal: 0, buff: "mood", desc: "提神一会儿" },
        { id: "cake", name: "芝士蛋糕", cost: 18, desc: "甜品时光" },
      ],
    },
    {
      id: "nb_ramen",
      name: "深夜拉面",
      icon: "🍜",
      colorKey: "stall",
      ownerName: "阿面",
      menu: [
        { id: "ramen", name: "豚骨拉面", cost: 22, desc: "吃饱继续巡街" },
        { id: "egg", name: "味玉加面", cost: 8, desc: "加个蛋" },
      ],
    },
    {
      id: "nb_arcade",
      name: "霓虹电玩",
      icon: "🎮",
      colorKey: "esports",
      ownerName: "数码前线",
      menu: [
        { id: "coin", name: "游戏币×10", cost: 15, desc: "放松一下" },
        { id: "soda", name: "冰汽泡水", cost: 6, desc: "续命" },
      ],
    },
    {
      id: "nb_mart",
      name: "24h 便利",
      icon: "🏪",
      colorKey: "store",
      ownerName: "西港财团",
      menu: [
        { id: "bento", name: "热便当", cost: 16, desc: "管饱" },
        { id: "coffee", name: "罐装咖啡", cost: 5, desc: "便宜提神" },
      ],
    },
    {
      id: "nb_logi",
      name: "速达驿站",
      icon: "📦",
      colorKey: "logistics",
      ownerName: "物流王",
      menu: [
        { id: "send", name: "寄件体验", cost: 10, desc: "看看别人怎么做物流" },
      ],
    },
  ],

  districts: {
    oldtown: {
      id: "oldtown",
      name: "旧城区",
      cycleSec: 68,
      amplitude: 0.48,
      phase: 0.12,
    },
    newtown: {
      id: "newtown",
      name: "新城商业带",
      cycleSec: 100,
      amplitude: 0.55,
      phase: 0.61,
    },
  },

  pricing: {
    cheap: {
      id: "cheap",
      name: "走量价",
      desc: "订单多、单笔少；适合走量",
      spawn: 1.4,
      tip: 0.72,
      passive: 0.94,
      offline: 1,
    },
    fair: {
      id: "fair",
      name: "均衡价",
      desc: "多数时段的稳妥选择",
      spawn: 1,
      tip: 1,
      passive: 1,
      offline: 1,
    },
    premium: {
      id: "premium",
      name: "高端价",
      desc: "单笔暴利，订单更少",
      spawn: 0.58,
      tip: 1.85,
      passive: 1.1,
      offline: 0.92,
    },
  },

  plans: {
    rush: {
      id: "rush",
      name: "高峰盯盘",
      desc: "自动接单↑ 离线↓ —— 在线收益更好",
      customer: 1.38,
      offline: 0.72,
      passive: 1,
      upgrade: 1,
      spawn: 1.12,
    },
    idle: {
      id: "idle",
      name: "稳健挂机",
      desc: "离线↑ 自动接单↓ —— 放下手机",
      customer: 0.72,
      offline: 1.42,
      passive: 0.96,
      upgrade: 1,
      spawn: 0.88,
    },
    thrifty: {
      id: "thrifty",
      name: "精简扩张",
      desc: "升级更便宜，产速略低",
      customer: 1,
      offline: 1,
      passive: 0.86,
      upgrade: 0.8,
      spawn: 1,
    },
  },

  specs: {
    logistics: {
      id: "logistics",
      name: "供应链专精",
      desc: "离线 +26%，自动接单 -8%",
      cost: 180,
      requireShop: "stall",
      requireLv: 4,
      offline: 1.26,
      customer: 0.92,
      passive: 1.02,
    },
    retail: {
      id: "retail",
      name: "零售专精",
      desc: "自动接单 +30%，离线 -8%",
      cost: 180,
      requireShop: "stall",
      requireLv: 4,
      offline: 0.92,
      customer: 1.3,
      passive: 1,
    },
  },

  supplyLevels: [
    { id: 0, name: "自采", cost: 0, profit: 1, stability: 1 },
    { id: 1, name: "批发渠道", cost: 60, profit: 1.08, stability: 1.05 },
    { id: 2, name: "品牌直供", cost: 220, profit: 1.16, stability: 1.1 },
    { id: 3, name: "集团仓配", cost: 800, profit: 1.28, stability: 1.18 },
  ],

  /** 市场行情：周期内对各业态标签的倍率 */
  marketTags: {
    food: { name: "餐饮潮" },
    cafe: { name: "咖啡热" },
    retail: { name: "零售旺" },
    digital: { name: "数码潮" },
    logistics: { name: "运力紧" },
    mall: { name: "综合消费" },
  },

  events: {
    promo: {
      id: "promo",
      name: "限时引流投放",
      desc: "投入启动金，50 秒内自动接单收益翻倍",
      costMult: 7,
      durationSec: 50,
      customerMult: 2,
      cooldownSec: 100,
    },
  },

  hairs: [
    { id: "side", name: "侧分", color: "#1a1a1a" },
    { id: "slick", name: "背头", color: "#2b2118" },
    { id: "wave", name: "微卷", color: "#3a2a20" },
    { id: "bun", name: "盘发", color: "#4a3428" },
  ],

  outfits: [
    { id: "shirt", name: "白衬衫", body: "#f2f4f7", accent: "#2c5aa0" },
    { id: "blazer", name: "深蓝西装", body: "#1e3a5f", accent: "#c9a227" },
    { id: "casual", name: "商务休闲", body: "#3d7a6a", accent: "#e8dcc8" },
    { id: "ceo", name: "黑金外套", body: "#1a1a1a", accent: "#d4af37", premium: true },
  ],

  skins: [
    { id: "fair", name: "浅", color: "#f0d5b8" },
    { id: "warm", name: "暖", color: "#d4a574" },
    { id: "deep", name: "深", color: "#8b5a3c" },
  ],

  themes: [
    { id: "day", name: "晴昼都市", free: true, sky: ["#5b8def", "#b8d4f0", "#e8eef5"] },
    { id: "dusk", name: "暮色霓虹", gemCost: 40, sky: ["#2a1f4d", "#c45c26", "#1a1528"] },
    { id: "rain", name: "雨夜商务", gemCost: 60, sky: ["#1c2833", "#3d5a6c", "#0f1419"] },
    { id: "gold", name: "金街夜宴", iapId: "theme_gold", sky: ["#1a1208", "#c9a227", "#2a1c0a"] },
  ],

  cosmetics: [
    { id: "frame_none", name: "默认边框", type: "frame", free: true },
    { id: "frame_sub", name: "月卡金框", type: "frame", requireSub: true },
    { id: "frame_war", name: "商战勋章框", type: "frame", warReward: true },
    { id: "sign_neon", name: "霓虹招牌", type: "sign", gemCost: 25 },
    { id: "sign_gold", name: "鎏金招牌", type: "sign", iapId: "cos_sign_gold" },
  ],

  products: [
    {
      id: "pass_premium",
      name: "赛季通行证 · 高级轨",
      type: "pass",
      priceCny: 30,
      tag: "本赛季最超值",
      desc: "解锁 30 级全部高级奖励；已达成的等级立刻补发",
    },
    {
      id: "growth_fund",
      name: "成长基金",
      type: "fund",
      priceCny: 18,
      tag: "总返 880 钻",
      desc: "通行证每到 5/10/15/20/25/30 级返一次钻石，越玩越回本",
    },
    { id: "sub_month", name: "大亨月卡", type: "sub", priceCny: 12, tag: "日常首选", desc: "离线8小时 · 每日20钻 · +5%产速 · 金框" },
    { id: "sub_season", name: "大亨季卡", type: "sub", priceCny: 30, desc: "月卡权益 90 天 + 季卡称号" },
    { id: "gem_s", name: "钻石小包", type: "gems", priceCny: 6, gems: 60 },
    { id: "gem_m", name: "钻石中包", type: "gems", priceCny: 12, gems: 140, tag: "+17% 赠送" },
    { id: "gem_l", name: "钻石大包", type: "gems", priceCny: 30, gems: 400, tag: "最划算 +33%" },
    { id: "gem_xl", name: "钻石豪华包", type: "gems", priceCny: 68, gems: 1000, tag: "+47% 赠送" },
    { id: "boost_pack", name: "加速券×5", type: "boost", priceCny: 3, boostSec: 300, count: 5 },
    { id: "theme_gold", name: "金街夜宴主题", type: "theme", priceCny: 12, unlockTheme: "gold" },
    { id: "cos_sign_gold", name: "鎏金招牌", type: "cosmetic", priceCny: 6, unlockCosmetic: "sign_gold" },
    { id: "starter_look", name: "新锐套装", type: "bundle", priceCny: 6, outfit: "blazer", gems: 20 },
  ],

  /** 首充双倍：第一次买钻石包，钻石翻倍（只生效一次，明示） */
  FIRST_BUY_DOUBLE: true,

  dailyTasks: [
    { id: "claim_offline", name: "领取一次离线收益", target: 1, rewardSoft: 40, rewardGems: 4 },
    { id: "upgrade_any", name: "任意升级 5 次", target: 5, rewardSoft: 80, rewardGems: 5 },
    { id: "serve_orders", name: "自动成交 15 次", target: 15, rewardSoft: 60, rewardGems: 4 },
    { id: "change_look", name: "更换一次形象或主题", target: 1, rewardSoft: 30, rewardGems: 3 },
    { id: "hire_or_expand", name: "扩店或招工 1 次", target: 1, rewardSoft: 50, rewardGems: 6 },
    { id: "rush_clear", name: "打完 3 波客流高峰", target: 3, rewardSoft: 120, rewardGems: 8 },
    { id: "tap_guests", name: "手动招待 60 位客人", target: 60, rewardSoft: 100, rewardGems: 6 },
  ],

  /**
   * 目标链：永远只显示"下一个目标"，完成立刻给奖励并推下一个。
   * softSec = 奖励金币 ≈ 当前每秒营收 × softSec（自动随进度放大）
   */
  goalChain: [
    { id: "g1", name: "把路边摊升到 Lv.3", metric: "topLevel", target: 3, softSec: 25, gems: 2, xp: 40 },
    { id: "g2", name: "手动招待 10 位客人", metric: "taps", target: 10, softSec: 30, gems: 3, xp: 45 },
    { id: "g3", name: "任意升级 5 次", metric: "upgrades", target: 5, softSec: 35, gems: 3, xp: 50 },
    { id: "g4", name: "开出第一个宝箱", metric: "chests", target: 1, softSec: 40, gems: 4, xp: 55 },
    { id: "g5", name: "扩建店面到「玻璃小店」", metric: "floorLv", target: 1, softSec: 45, gems: 5, xp: 60 },
    { id: "g6", name: "打完 1 波客流高峰", metric: "rush", target: 1, softSec: 50, gems: 5, xp: 70 },
    { id: "g7", name: "手动招待 60 位客人", metric: "taps", target: 60, softSec: 55, gems: 6, xp: 75 },
    { id: "g8", name: "升级 15 次", metric: "upgrades", target: 15, softSec: 60, gems: 6, xp: 80 },
    { id: "g9", name: "雇到第 1 名员工", metric: "staff", target: 1, softSec: 65, gems: 8, xp: 90 },
    { id: "g10", name: "招牌升级到「灯箱招牌」", metric: "signLv", target: 1, softSec: 70, gems: 8, xp: 95 },
    { id: "g11", name: "领到 2 件设备", metric: "equip", target: 2, softSec: 75, gems: 9, xp: 100 },
    { id: "g12", name: "开出 4 个宝箱", metric: "chests", target: 4, softSec: 80, gems: 10, xp: 110 },
    { id: "g13", name: "开第 2 家店", metric: "shops", target: 2, softSec: 90, gems: 12, xp: 120 },
    { id: "g14", name: "手动招待 200 位客人", metric: "taps", target: 200, softSec: 95, gems: 12, xp: 130 },
    { id: "g15", name: "打完 5 波客流高峰", metric: "rush", target: 5, softSec: 100, gems: 14, xp: 140 },
    { id: "g16", name: "升级 40 次", metric: "upgrades", target: 40, softSec: 105, gems: 14, xp: 150 },
    { id: "g17", name: "任一店铺到 Lv.10", metric: "topLevel", target: 10, softSec: 110, gems: 16, xp: 160 },
    { id: "g18", name: "扩建到「临街铺面」", metric: "floorLv", target: 2, softSec: 115, gems: 16, xp: 170 },
    { id: "g19", name: "雇到 2 名员工", metric: "staff", target: 2, softSec: 120, gems: 18, xp: 180 },
    { id: "g20", name: "开出 10 个宝箱", metric: "chests", target: 10, softSec: 125, gems: 18, xp: 190 },
    { id: "g21", name: "开第 3 家店", metric: "shops", target: 3, softSec: 130, gems: 20, xp: 200 },
    { id: "g22", name: "手动招待 500 位客人", metric: "taps", target: 500, softSec: 135, gems: 20, xp: 220 },
    { id: "g23", name: "打完 12 波客流高峰", metric: "rush", target: 12, softSec: 140, gems: 22, xp: 240 },
    { id: "g24", name: "招牌升到「立体大字」", metric: "signLv", target: 2, softSec: 145, gems: 22, xp: 260 },
    { id: "g25", name: "升级 80 次", metric: "upgrades", target: 80, softSec: 150, gems: 25, xp: 280 },
    { id: "g26", name: "领到 4 件设备", metric: "equip", target: 4, softSec: 155, gems: 25, xp: 300 },
    { id: "g27", name: "任一店铺到 Lv.18", metric: "topLevel", target: 18, softSec: 160, gems: 28, xp: 320 },
    { id: "g28", name: "开第 4 家店", metric: "shops", target: 4, softSec: 170, gems: 30, xp: 340 },
    { id: "g29", name: "手动招待 1200 位客人", metric: "taps", target: 1200, softSec: 180, gems: 32, xp: 360 },
    { id: "g30", name: "打完 25 波客流高峰", metric: "rush", target: 25, softSec: 190, gems: 35, xp: 400 },
    { id: "g31", name: "扩建到「双开间旗舰」", metric: "floorLv", target: 3, softSec: 200, gems: 38, xp: 420 },
    { id: "g32", name: "开出 30 个宝箱", metric: "chests", target: 30, softSec: 210, gems: 40, xp: 450 },
    { id: "g33", name: "开满 6 家店", metric: "shops", target: 6, softSec: 240, gems: 50, xp: 500 },
  ],

  /**
   * 客流高峰：每隔一段时间来一波，需要玩家动手点顾客。
   * 这是"能连着玩几小时"的主动玩法核心。
   */
  rush: {
    gapMinSec: 95,
    gapMaxSec: 150,
    durationSec: 42,
    incomeMult: 2.2,
    /** 每秒生成顾客数（会随高峰进行略微加快） */
    spawnPerSec: 1.5,
    spawnRamp: 0.5,
    guestLifeSec: 2.4,
    maxOnScreen: 5,
    comboMax: 25,
    /** 连击到这里进入爆发 */
    frenzyAt: 10,
    frenzyMult: 3,
    frenzySec: 8,
    /** 单次点击基础收益 ≈ 每秒营收 × tapSec */
    tapSec: 1.6,
    /** 钻石立即召唤一波高峰 */
    summonGems: 20,
    /** 高峰结算奖励 */
    clearSoftSec: 45,
    clearGems: 3,
    clearXp: 40,
  },

  /** 宝箱：所有操作都会攒进度，攒满立刻开，永远有"就差一点" */
  chest: {
    needBase: 14,
    needGrowth: 1.12,
    tapWeight: 1,
    serveWeight: 1,
    upgradeWeight: 3,
    rushWeight: 6,
    instantGems: 15,
    tiers: [
      { id: "wood", name: "木箱", icon: "📦", softSec: 40, gems: [1, 3], ticket: 0 },
      { id: "silver", name: "银箱", icon: "🎁", softSec: 70, gems: [3, 6], ticket: 0 },
      { id: "gold", name: "金箱", icon: "🏆", softSec: 120, gems: [6, 12], ticket: 1 },
    ],
  },

  /** 赛季通行证：免费轨 + 高级轨；买了立刻补发已达成等级 */
  pass: {
    seasonId: "S1",
    seasonName: "第一赛季 · 街区崛起",
    maxLevel: 30,
    xpBase: 120,
    xpGrowth: 1.09,
    /** 每级免费奖励（循环取用，特殊等级见 special） */
    freeCycle: [
      { softSec: 30 },
      { gems: 4 },
      { softSec: 45 },
      { ticket: 1 },
      { gems: 6 },
    ],
    premiumCycle: [
      { gems: 10, softSec: 60 },
      { gems: 14 },
      { softSec: 120, ticket: 1 },
      { gems: 18 },
      { gems: 22, softSec: 150 },
    ],
    special: {
      10: { free: { gems: 12 }, prem: { theme: "dusk", gems: 25 } },
      20: { free: { ticket: 2 }, prem: { cosmetic: "sign_neon", gems: 40 } },
      30: { free: { gems: 30 }, prem: { theme: "rain", cosmetic: "frame_sub", gems: 80 } },
    },
    xp: {
      tap: 1,
      serve: 1,
      upgrade: 6,
      chest: 25,
      rush: 40,
      dailyTask: 30,
    },
  },

  /** 今日累计在线时长奖励：越坐得久，奖励越大（按天累计，关掉重开不刷） */
  playtimeRewards: [
    { min: 5, softSec: 40, gems: 3 },
    { min: 15, softSec: 70, gems: 5 },
    { min: 30, softSec: 110, gems: 8, chest: true },
    { min: 45, softSec: 150, gems: 10 },
    { min: 60, softSec: 200, gems: 14, chest: true },
    { min: 90, softSec: 280, gems: 20 },
    { min: 120, softSec: 400, gems: 30, chest: true },
  ],

  /** 每日轮换装扮位（按日期确定性轮换，制造"今天才有"的新鲜感） */
  dailyShopPool: [
    { id: "d_sign_neon", name: "霓虹招牌", icon: "🪧", gemCost: 25, cosmetic: "sign_neon" },
    { id: "d_theme_dusk", name: "暮色霓虹主题", icon: "🌆", gemCost: 40, theme: "dusk" },
    { id: "d_theme_rain", name: "雨夜商务主题", icon: "🌧", gemCost: 60, theme: "rain" },
    { id: "d_ticket3", name: "加速券×3", icon: "⚡", gemCost: 18, ticket: 3 },
    { id: "d_ticket8", name: "加速券×8", icon: "🔋", gemCost: 40, ticket: 8 },
    { id: "d_coins_s", name: "启动金一小袋", icon: "💰", gemCost: 12, softSec: 120 },
    { id: "d_coins_l", name: "启动金一大袋", icon: "🧧", gemCost: 30, softSec: 320 },
    { id: "d_outfit_ceo", name: "黑金外套", icon: "🧥", gemCost: 55, outfit: "ceo" },
  ],
  DAILY_SHOP_SLOTS: 3,

  /** 成长基金：按通行证等级返还，总返还高于售价 */
  growthFund: {
    productId: "growth_fund",
    milestones: [
      { lv: 5, gems: 60 },
      { lv: 10, gems: 90 },
      { lv: 15, gems: 120 },
      { lv: 20, gems: 150 },
      { lv: 25, gems: 200 },
      { lv: 30, gems: 260 },
    ],
  },

  /** 目标链可用钻石直接跳过（钻石消耗口） */
  GOAL_SKIP_GEMS: 30,

  /**
   * 自家店养成：里程碑解锁设备；钻石雇人；金币扩店面/招牌
   */
  hq: {
    /** 店面扩大（金币）— 更大空间、更多工位 */
    floors: [
      { lv: 0, name: "路边摊位", softCost: 0, spaceMult: 1, maxStaff: 1, desc: "只能站一个人" },
      { lv: 1, name: "玻璃小店", softCost: 180, spaceMult: 1.12, maxStaff: 2, desc: "多一张操作台" },
      { lv: 2, name: "临街铺面", softCost: 520, spaceMult: 1.25, maxStaff: 3, desc: "客人能坐下来" },
      { lv: 3, name: "双开间旗舰", softCost: 1400, spaceMult: 1.4, maxStaff: 4, desc: "店面显眼，产能跳一档" },
      { lv: 4, name: "街角大铺", softCost: 3600, spaceMult: 1.6, maxStaff: 5, desc: "整条街都能看见" },
    ],
    /** 招牌升级（金币）— 更大更吸引人，提高成交与产速 */
    signs: [
      { lv: 0, name: "手写纸板", softCost: 0, attract: 1, desc: "路过才看得见" },
      { lv: 1, name: "灯箱招牌", softCost: 140, attract: 1.1, desc: "晚上也亮" },
      { lv: 2, name: "立体大字", softCost: 400, attract: 1.22, desc: "隔两条街看到" },
      { lv: 3, name: "霓虹巨幅", softCost: 1100, attract: 1.38, desc: "客流明显上涨" },
      { lv: 4, name: "全息旗舰牌", softCost: 2800, attract: 1.55, desc: "整条街的焦点" },
    ],
    /** 设备：达成条件后可领取/购买 */
    equipment: [
      {
        id: "grinder",
        name: "手摇磨豆机",
        icon: "🫘",
        desc: "升级店铺 3 次后领取",
        require: { upgrades: 3 },
        claimSoft: 0,
        incomeBonus: 0.06,
      },
      {
        id: "coffee_machine",
        name: "意式咖啡机",
        icon: "☕",
        desc: "升级 8 次 + 成交 25 单后领取",
        require: { upgrades: 8, served: 25, equipment: ["grinder"] },
        claimSoft: 0,
        incomeBonus: 0.14,
      },
      {
        id: "fridge",
        name: "商用冷柜",
        icon: "🧊",
        desc: "店面至少「玻璃小店」+ 咖啡机",
        require: { floorLv: 1, equipment: ["coffee_machine"] },
        claimSoft: 80,
        incomeBonus: 0.08,
      },
      {
        id: "oven",
        name: "烤箱台",
        icon: "🍞",
        desc: "升级 15 次 + 招牌灯箱",
        require: { upgrades: 15, signLv: 1 },
        claimSoft: 200,
        incomeBonus: 0.1,
      },
      {
        id: "pos",
        name: "智能收银",
        icon: "🖥️",
        desc: "雇过至少 1 名员工",
        require: { staffCount: 1, upgrades: 12 },
        claimSoft: 150,
        incomeBonus: 0.09,
      },
    ],
    /** 员工：主要花钻石雇；金币可加薪升级 */
    staffTypes: [
      {
        id: "helper",
        name: "兼职帮手",
        icon: "🧑",
        gemCost: 12,
        softHire: 40,
        incomeBonus: 0.07,
        offlineBonus: 0.04,
        desc: "钻石招人，帮你盯摊",
      },
      {
        id: "barista",
        name: "咖啡师",
        icon: "👩‍🍳",
        gemCost: 28,
        softHire: 120,
        require: { equipment: ["coffee_machine"], floorLv: 1 },
        incomeBonus: 0.12,
        offlineBonus: 0.06,
        desc: "要有咖啡机和更大店面",
      },
      {
        id: "manager",
        name: "店长助理",
        icon: "🧳",
        gemCost: 45,
        softHire: 280,
        require: { equipment: ["pos"], floorLv: 2, staffCount: 1 },
        incomeBonus: 0.16,
        offlineBonus: 0.1,
        desc: "管人管店，离线也更稳",
      },
    ],
    staffUpgradeSoft: 90,
    staffUpgradeGrowth: 1.45,
    staffUpgradeBonus: 0.03,
  },

  speeches: [
    "高峰期点客人赚得最快，连击 10 下会爆发！",
    "宝箱进度快满了就多点几个客人，马上开箱。",
    "先看顶上的当前目标——完成就有钻石。",
    "今天多待一会儿，在线时长档位有钻石拿。",
    "通行证经验靠点客人和升级攒，别忘了领奖。",
    "大部分时间待在自己店里扩店、招人！",
    "钻石用来雇员工，金币用来把店面做大。",
    "做到条件就能领咖啡机——别只会走路。",
    "招牌越大，客流加成越狠。",
    "水电地费能一次砍掉半个身家！",
    "别人的店可以去吃喝，回家还得经营自家。",
  ],

  orderEmojis: ["💼", "🧑‍💼", "👩‍💻", "🧳", "🛵"],

  shops: {
    stall: {
      id: "stall",
      name: "路边摊",
      icon: "🌭",
      district: "oldtown",
      tags: ["food"],
      building: "stall",
      baseIncome: 1.6,
      incomeGrowth: 1.17,
      baseCost: 20,
      costGrowth: 1.19,
      startUnlocked: true,
      startLevel: 1,
    },
    cafe: {
      id: "cafe",
      name: "咖啡店",
      icon: "☕",
      district: "oldtown",
      tags: ["cafe", "food"],
      building: "cafe",
      baseIncome: 5.5,
      incomeGrowth: 1.19,
      baseCost: 100,
      costGrowth: 1.22,
      unlock: { requiresShop: "stall", minLevel: 5, hint: "路边摊升到 Lv.5" },
    },
    store: {
      id: "store",
      name: "便利店",
      icon: "🏪",
      district: "oldtown",
      tags: ["retail"],
      building: "store",
      baseIncome: 12,
      incomeGrowth: 1.2,
      baseCost: 280,
      costGrowth: 1.23,
      unlock: { requiresShop: "cafe", minLevel: 6, hint: "咖啡店升到 Lv.6" },
    },
    esports: {
      id: "esports",
      name: "电竞馆",
      icon: "🎮",
      district: "newtown",
      tags: ["digital"],
      building: "esports",
      baseIncome: 28,
      incomeGrowth: 1.21,
      baseCost: 900,
      costGrowth: 1.24,
      unlock: {
        requiresShop: "store",
        minLevel: 8,
        minGrade: "B",
        hint: "便利店 Lv.8 且都市评级 B",
      },
    },
    logistics: {
      id: "logistics",
      name: "物流站",
      icon: "📦",
      district: "newtown",
      tags: ["logistics"],
      building: "logistics",
      baseIncome: 45,
      incomeGrowth: 1.22,
      baseCost: 2200,
      costGrowth: 1.25,
      unlock: { requiresShop: "esports", minLevel: 6, hint: "电竞馆升到 Lv.6" },
    },
    mall: {
      id: "mall",
      name: "综合商场",
      icon: "🏬",
      district: "newtown",
      tags: ["mall", "retail"],
      building: "mall",
      baseIncome: 90,
      incomeGrowth: 1.23,
      baseCost: 6000,
      costGrowth: 1.26,
      unlock: {
        requiresAll: ["stall", "cafe", "store", "esports", "logistics"],
        minLevelEach: 5,
        hint: "前五家均达 Lv.5",
      },
    },
  },

  shopOrder: ["stall", "cafe", "store", "esports", "logistics", "mall"],

  war: {
    durationSec: 3600,
    personalGoal: 500,
    guildGoal: 3000,
    rewardGems: 25,
    rewardFrame: "frame_war",
  },

  guilds: [
    { id: "east", name: "东岸商盟", motto: "稳健扩张" },
    { id: "west", name: "西港财团", motto: "高风险高回报" },
    { id: "central", name: "中央联营", motto: "均衡经营" },
  ],

  challenge: {
    cooldownSec: 120,
    durationSec: 45,
    stakeMult: 20,
    winMult: 1.8,
  },
};
