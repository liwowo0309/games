/**
 * 街区小老板 — 经济与策略结算
 */
const Economy = (() => {
  function shopDef(id) {
    return GameConfig.shops[id];
  }

  function pricingOf(state) {
    return GameConfig.pricing[state.pricingId] || GameConfig.pricing.fair;
  }

  function planOf(state) {
    return GameConfig.plans[state.planId] || GameConfig.plans.rush;
  }

  function specOf(state) {
    if (!state.specId) return null;
    return GameConfig.specs[state.specId] || null;
  }

  function shopIncomePerSec(id, level) {
    if (!level || level < 1) return 0;
    const def = shopDef(id);
    return def.baseIncome * Math.pow(def.incomeGrowth, level - 1);
  }

  function upgradeCost(id, level, state) {
    const def = shopDef(id);
    const from = Math.max(level, 0);
    let cost = Math.ceil(def.baseCost * Math.pow(def.costGrowth, from));
    if (state) {
      const plan = planOf(state);
      cost = Math.ceil(cost * (plan.upgrade || 1));
    }
    return cost;
  }

  function mods(state) {
    const p = pricingOf(state);
    const plan = planOf(state);
    const spec = specOf(state);
    return {
      passive: p.passive * plan.passive * (spec ? spec.passive : 1),
      offline: p.offline * plan.offline * (spec ? spec.offline : 1),
      customer: p.tip * plan.customer * (spec ? spec.customer : 1),
      spawn: p.spawn * plan.spawn,
    };
  }

  function totalIncomePerSec(state) {
    let total = 0;
    for (const id of GameConfig.shopOrder) {
      const shop = state.shops[id];
      if (!shop || !shop.unlocked) continue;
      total += shopIncomePerSec(id, shop.level);
    }
    total *= mods(state).passive;
    if (state.subscriptionActive) {
      total *= 1 + GameConfig.SUB_INCOME_BONUS;
    }
    return total;
  }

  function offlineCapSeconds(state) {
    const hours = state.subscriptionActive
      ? GameConfig.SUB_OFFLINE_CAP_HOURS
      : GameConfig.OFFLINE_CAP_HOURS;
    return hours * 3600;
  }

  function calcOfflineReward(state, nowMs) {
    const last = state.lastSeenAt || nowMs;
    const elapsedSec = Math.max(0, (nowMs - last) / 1000);
    const cap = offlineCapSeconds(state);
    const capped = elapsedSec > cap;
    const seconds = Math.min(elapsedSec, cap);
    const rate = totalIncomePerSec(state) * mods(state).offline;
    // offline mult already partly in mods.offline applied on top of passive rate
    // Recompute cleanly: base passive * offline mod only once
    let base = 0;
    for (const id of GameConfig.shopOrder) {
      const shop = state.shops[id];
      if (!shop || !shop.unlocked) continue;
      base += shopIncomePerSec(id, shop.level);
    }
    const p = pricingOf(state);
    const plan = planOf(state);
    const spec = specOf(state);
    let offlineRate =
      base *
      p.passive *
      plan.passive *
      (spec ? spec.passive : 1) *
      p.offline *
      plan.offline *
      (spec ? spec.offline : 1);
    if (state.subscriptionActive) offlineRate *= 1 + GameConfig.SUB_INCOME_BONUS;
    const amount = offlineRate * seconds;
    return { seconds, amount, capped, rate: offlineRate };
  }

  function customerSpawnInterval(state) {
    const m = mods(state);
    // 基础 2.4 秒，spawn 越高越快
    return Math.max(0.85, 2.4 / m.spawn);
  }

  function customerTip(state, combo) {
    const base = 4 + Economy.totalIncomePerSec(state) * 1.8;
    const comboMult = 1 + Math.min(combo, GameConfig.COMBO_MAX) * 0.22;
    let tip = base * mods(state).customer * comboMult;
    if (state.promoUntil && Date.now() < state.promoUntil) {
      tip *= GameConfig.events.promo.customerMult;
    }
    return Math.max(1, Math.floor(tip));
  }

  function promoCost(state) {
    const rate = Math.max(2, totalIncomePerSec(state));
    return Math.ceil(rate * GameConfig.events.promo.costMult);
  }

  function canUnlock(state, shopId) {
    const def = shopDef(shopId);
    if (!def.unlock) return true;
    const req = state.shops[def.unlock.requiresShop];
    return !!(req && req.unlocked && req.level >= def.unlock.minLevel);
  }

  function unlockHint(shopId) {
    const def = shopDef(shopId);
    return (def.unlock && def.unlock.hint) || "未解锁";
  }

  function formatCoins(n) {
    if (!Number.isFinite(n)) return "0";
    if (n < 1000) return String(Math.floor(n));
    if (n < 1e6) return (n / 1000).toFixed(n < 1e4 ? 2 : 1).replace(/\.?0+$/, "") + "K";
    if (n < 1e9) return (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
    return (n / 1e9).toFixed(2).replace(/\.?0+$/, "") + "B";
  }

  function formatRate(n) {
    if (n < 10) return n.toFixed(1);
    return formatCoins(n);
  }

  function formatDuration(seconds) {
    const s = Math.floor(seconds);
    if (s < 60) return `${s} 秒`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} 分钟`;
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return rm ? `${h} 小时 ${rm} 分` : `${h} 小时`;
  }

  function streetGrade(state) {
    const rate = totalIncomePerSec(state);
    const unlocked = GameConfig.shopOrder.filter(
      (id) => state.shops[id] && state.shops[id].unlocked
    ).length;
    const skill = (state.bestCombo || 0) * 2 + (state.servedTotal || 0) * 0.02;
    const score = rate + unlocked * 5 + skill;
    if (score >= 80) return "S";
    if (score >= 40) return "A";
    if (score >= 15) return "B";
    if (score >= 5) return "C";
    return "D";
  }

  function planSwitchReady(state, nowMs = Date.now()) {
    return nowMs >= (state.planSwitchAt || 0);
  }

  function planSwitchLeft(state, nowMs = Date.now()) {
    return Math.max(0, Math.ceil(((state.planSwitchAt || 0) - nowMs) / 1000));
  }

  return {
    shopIncomePerSec,
    upgradeCost,
    totalIncomePerSec,
    offlineCapSeconds,
    calcOfflineReward,
    canUnlock,
    unlockHint,
    formatCoins,
    formatRate,
    formatDuration,
    streetGrade,
    pricingOf,
    planOf,
    specOf,
    mods,
    customerSpawnInterval,
    customerTip,
    promoCost,
    planSwitchReady,
    planSwitchLeft,
  };
})();
