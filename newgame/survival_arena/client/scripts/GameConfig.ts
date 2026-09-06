/**
 * 疾锋战区 — 游戏配置（Cocos Creator 3.8）
 */
export const GameConfig = {
  MAX_PLAYERS: 16,
  MAP_SIZE: 1200,
  MATCH_DURATION: 600,
  SERVER_URL: 'ws://localhost:3921',

  WEAPONS: {
    ar_alpha: { name: '阿尔法步枪', damage: 28, magSize: 30, fireRate: 0.12, reloadTime: 2.0 },
    smg_beta: { name: '贝塔冲锋', damage: 18, magSize: 25, fireRate: 0.07, reloadTime: 1.6 },
  },

  ZONE_STAGES: [
    { time: 0, radius: 600, dps: 0 },
    { time: 90, radius: 400, dps: 2 },
    { time: 210, radius: 280, dps: 4 },
    { time: 330, radius: 160, dps: 6 },
    { time: 450, radius: 80, dps: 10 },
    { time: 540, radius: 25, dps: 15 },
  ],

  IAP_PRODUCTS: [
    { id: 'pass_season', name: '赛季通行证', price: 18 },
    { id: 'month_card', name: '月卡', price: 8 },
    { id: 'skin_ar_red', name: '赤焰步枪皮肤', price: 12 },
    { id: 'first_pack', name: '首充礼包', price: 6, once: true },
  ],

  AD_SLOTS: {
    double_reward: { limit: 5 },
    daily_supply: { limit: 3 },
    pass_xp: { limit: 2 },
  },
};
