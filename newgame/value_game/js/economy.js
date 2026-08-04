/**
 * 都市大亨 — 经济结算（含行情与供应链）
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

  function supplyOf(state) {
    const lv = Math.min(
      Math.max(0, state.supplyLevel | 0),
      GameConfig.supplyLevels.length - 1
    );
    return GameConfig.supplyLevels[lv];
  }

  /** 0~1 周期相位 → 各 tag 倍率约 0.55~1.45（跌涨更明显） */
  function marketMultForTag(tag, phase) {
    const seed = tag.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const wave = Math.sin(phase * Math.PI * 2 + seed * 0.7);
    return 1 + wave * 0.42;
  }

  function marketPhase(nowMs = Date.now()) {
    const cycle = GameConfig.MARKET_CYCLE_SEC * 1000;
    return (nowMs % cycle) / cycle;
  }

  /** 城区独立涨跌：可低至约 0.45、高至约 1.55 */
  function districtMult(districtId, nowMs = Date.now()) {
    const d = GameConfig.districts[districtId];
    if (!d) return 1;
    const cycle = (d.cycleSec || 80) * 1000;
    const phase = ((nowMs / cycle) + (d.phase || 0)) % 1;
    const wave = Math.sin(phase * Math.PI * 2);
    return 1 + wave * (d.amplitude || 0.4);
  }

  function districtSnapshot(nowMs = Date.now()) {
    return Object.values(GameConfig.districts).map((d) => {
      const mult = districtMult(d.id, nowMs);
      return {
        id: d.id,
        name: d.name,
        mult,
        mood: mult >= 1.12 ? "旺" : mult <= 0.88 ? "淡" : "平",
      };
    });
  }

  function shopMarketMult(shopId, nowMs = Date.now()) {
    const def = shopDef(shopId);
    if (!def || !def.tags || !def.tags.length) return 1;
    const phase = marketPhase(nowMs);
    let m = 1;
    for (const t of def.tags) m *= marketMultForTag(t, phase);
    m = Math.pow(m, 1 / def.tags.length);
    m *= districtMult(def.district, nowMs);
    return m;
  }

  function currentMarketSnapshot(nowMs = Date.now()) {
    const phase = marketPhase(nowMs);
    const rows = Object.keys(GameConfig.marketTags).map((tag) => ({
      tag,
      name: GameConfig.marketTags[tag].name,
      mult: marketMultForTag(tag, phase),
    }));
    rows.sort((a, b) => b.mult - a.mult);
    return {
      phase,
      hot: rows[0],
      cold: rows[rows.length - 1],
      rows,
      districts: districtSnapshot(nowMs),
    };
  }

  function shopIncomePerSec(id, level, state, nowMs = Date.now()) {
    if (!level || level < 1) return 0;
    const def = shopDef(id);
    let base = def.baseIncome * Math.pow(def.incomeGrowth, level - 1);
    base *= shopMarketMult(id, nowMs);
    if (state) base *= supplyOf(state).profit;
    return base;
  }

  function upgradeCost(id, level, state) {
    const def = shopDef(id);
    const from = Math.max(level, 0);
    let cost = Math.ceil(def.baseCost * Math.pow(def.costGrowth, from));
    if (state) cost = Math.ceil(cost * (planOf(state).upgrade || 1));
    return cost;
  }

  function mods(state) {
    const p = pricingOf(state);
    const plan = planOf(state);
    const spec = specOf(state);
    const supply = supplyOf(state);
    return {
      passive: p.passive * plan.passive * (spec ? spec.passive : 1) * supply.stability,
      offline: p.offline * plan.offline * (spec ? spec.offline : 1),
      customer: p.tip * plan.customer * (spec ? spec.customer : 1),
      spawn: p.spawn * plan.spawn,
    };
  }

  function activeBill(state, nowMs = Date.now()) {
    if (!state.bill || !state.bill.until || nowMs >= state.bill.until) return null;
    return state.bill;
  }

  function billCostMult(state, nowMs = Date.now()) {
    const b = activeBill(state, nowMs);
    return b ? b.costMult || 1 : 1;
  }

  /** 水电地费等运营成本（每秒），账单冲击时会翻倍 */
  function operatingCostPerSec(state, nowMs = Date.now()) {
    const cfg = GameConfig.opex;
    let raw = 0;
    for (const id of GameConfig.shopOrder) {
      const shop = state.shops[id];
      if (!shop || !shop.unlocked || shop.level < 1) continue;
      const def = shopDef(id);
      let c = cfg.basePerShop + shop.level * cfg.perLevel;
      if (def.district === "newtown") c *= cfg.newtownLandExtra;
      raw += c;
    }
    if (raw <= 0) raw = cfg.basePerShop * 0.5;
    return raw * billCostMult(state, nowMs);
  }

  function opexBreakdown(state, nowMs = Date.now()) {
    const total = operatingCostPerSec(state, nowMs);
    const cfg = GameConfig.opex;
    return {
      total,
      electric: total * cfg.electric,
      water: total * cfg.water,
      land: total * cfg.land,
      bill: activeBill(state, nowMs),
    };
  }

  function hqOf(state) {
    return (
      state.hq || {
        equipment: {},
        staff: [],
        floorLv: 0,
        signLv: 0,
      }
    );
  }

  function floorDef(state) {
    const hq = GameConfig.hq;
    const lv = Math.min(hqOf(state).floorLv | 0, hq.floors.length - 1);
    return hq.floors[lv];
  }

  function signDef(state) {
    const hq = GameConfig.hq;
    const lv = Math.min(hqOf(state).signLv | 0, hq.signs.length - 1);
    return hq.signs[lv];
  }

  function hqIncomeMult(state) {
    const hq = hqOf(state);
    let m = floorDef(state).spaceMult * signDef(state).attract;
    (GameConfig.hq.equipment || []).forEach((eq) => {
      if (hq.equipment && hq.equipment[eq.id]) m *= 1 + (eq.incomeBonus || 0);
    });
    (hq.staff || []).forEach((s) => {
      const typ = (GameConfig.hq.staffTypes || []).find((t) => t.id === s.typeId);
      if (!typ) return;
      const lvBonus = 1 + (s.level || 1) * (GameConfig.hq.staffUpgradeBonus || 0.03);
      m *= 1 + (typ.incomeBonus || 0) * lvBonus;
    });
    return m;
  }

  function hqOfflineMult(state) {
    let m = 1;
    (hqOf(state).staff || []).forEach((s) => {
      const typ = (GameConfig.hq.staffTypes || []).find((t) => t.id === s.typeId);
      if (typ) m *= 1 + (typ.offlineBonus || 0) * (s.level || 1) * 0.5;
    });
    return m;
  }

  function reqMet(state, require) {
    if (!require) return true;
    const hq = hqOf(state);
    const upgrades = (state.stats && state.stats.upgrades) || 0;
    const served = state.servedTotal || 0;
    if (require.upgrades != null && upgrades < require.upgrades) return false;
    if (require.served != null && served < require.served) return false;
    if (require.floorLv != null && (hq.floorLv || 0) < require.floorLv) return false;
    if (require.signLv != null && (hq.signLv || 0) < require.signLv) return false;
    if (require.staffCount != null && (hq.staff || []).length < require.staffCount) return false;
    if (require.equipment) {
      for (const id of require.equipment) {
        if (!(hq.equipment && hq.equipment[id])) return false;
      }
    }
    return true;
  }

  function reqHint(require) {
    if (!require) return "";
    const parts = [];
    if (require.upgrades != null) parts.push(`升级 ${require.upgrades} 次`);
    if (require.served != null) parts.push(`成交 ${require.served} 单`);
    if (require.floorLv != null) {
      const f = GameConfig.hq.floors[require.floorLv];
      parts.push(`店面「${f ? f.name : "Lv" + require.floorLv}」`);
    }
    if (require.signLv != null) {
      const s = GameConfig.hq.signs[require.signLv];
      parts.push(`招牌「${s ? s.name : "Lv" + require.signLv}」`);
    }
    if (require.staffCount != null) parts.push(`员工 ≥${require.staffCount}`);
    if (require.equipment) {
      require.equipment.forEach((id) => {
        const eq = GameConfig.hq.equipment.find((e) => e.id === id);
        parts.push(eq ? eq.name : id);
      });
    }
    return parts.join(" · ");
  }

  function grossIncomePerSec(state, nowMs = Date.now()) {
    let total = 0;
    for (const id of GameConfig.shopOrder) {
      const shop = state.shops[id];
      if (!shop || !shop.unlocked) continue;
      total += shopIncomePerSec(id, shop.level, state, nowMs);
    }
    total *= mods(state).passive;
    total *= hqIncomeMult(state);
    if (state.subscriptionActive) total *= 1 + GameConfig.SUB_INCOME_BONUS;
    if (state.boostUntil && nowMs < state.boostUntil) total *= 2;
    if (rushActive(state, nowMs)) total *= GameConfig.rush.incomeMult;
    return total;
  }

  /** 客流高峰进行中？ */
  function rushActive(state, nowMs = Date.now()) {
    return !!(state.rush && state.rush.until && nowMs < state.rush.until);
  }

  function rushLeftSec(state, nowMs = Date.now()) {
    if (!rushActive(state, nowMs)) return 0;
    return Math.max(0, Math.ceil((state.rush.until - nowMs) / 1000));
  }

  function rushNextSec(state, nowMs = Date.now()) {
    if (!state.rush || !state.rush.nextAt) return 0;
    return Math.max(0, Math.ceil((state.rush.nextAt - nowMs) / 1000));
  }

  function frenzyActive(state, nowMs = Date.now()) {
    return !!(state.rush && state.rush.frenzyUntil && nowMs < state.rush.frenzyUntil);
  }

  /** 奖励金币按当前营收缩放，前中后期都有感觉 */
  function rewardSoft(state, softSec) {
    const gross = Math.max(1.2, grossIncomePerSec(state));
    return Math.max(20, Math.round(gross * (softSec || 30)));
  }

  /** 手动招待一位客人的收益（连击 + 爆发加成） */
  function tapReward(state, combo, nowMs = Date.now()) {
    const cfg = GameConfig.rush;
    const gross = Math.max(1.2, grossIncomePerSec(state, nowMs));
    let v = (3 + gross * cfg.tapSec) * mods(state).customer;
    v *= 1 + Math.min(combo, cfg.comboMax) * 0.1;
    if (frenzyActive(state, nowMs)) v *= cfg.frenzyMult;
    if (state.promoUntil && nowMs < state.promoUntil) v *= 1.5;
    return Math.max(2, Math.floor(v));
  }

  function passLevelXp(lv) {
    const p = GameConfig.pass;
    return Math.round(p.xpBase * Math.pow(p.xpGrowth, Math.max(0, lv - 1)));
  }

  function chestNeed(openedCount) {
    const c = GameConfig.chest;
    return Math.max(8, Math.round(c.needBase * Math.pow(c.needGrowth, Math.min(30, openedCount || 0))));
  }

  /** 宝箱档位：每第 5 个金箱、每第 3 个银箱 */
  function chestTierFor(openedCount) {
    const tiers = GameConfig.chest.tiers;
    const n = (openedCount || 0) + 1;
    if (n % 10 === 0) return tiers[2];
    if (n % 3 === 0) return tiers[1];
    return tiers[0];
  }

  /** 净现金流：营收 - 运营成本，可为负（亏损） */
  function netCashflowPerSec(state, nowMs = Date.now()) {
    return grossIncomePerSec(state, nowMs) - operatingCostPerSec(state, nowMs);
  }

  /** 兼容旧调用：顶栏/排行用净现金流 */
  function totalIncomePerSec(state, nowMs = Date.now()) {
    return netCashflowPerSec(state, nowMs);
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
    const m = mods(state);
    // 取样起点与终点净现金流，体现涨跌
    const netA = netCashflowPerSec(state, last);
    const netB = netCashflowPerSec(state, last + seconds * 1000);
    let avgNet = ((netA + netB) / 2) * m.offline * hqOfflineMult(state);
    // 离线大起大落：按资产比例估算账单冲击
    const gap = (GameConfig.BILL_MIN_GAP_SEC + GameConfig.BILL_MAX_GAP_SEC) / 2;
    const hits = Math.floor(seconds / gap);
    const coins = Math.max(0, state.softCoins);
    let billLump = 0;
    for (let i = 0; i < hits; i++) {
      const pct = 0.25 + (i % 3) * 0.08;
      billLump += Math.floor(coins * pct * 0.7);
    }
    const amount = avgNet * seconds - billLump;
    return {
      seconds,
      amount,
      capped,
      rate: avgNet,
      billHits: hits,
      lost: amount < 0,
    };
  }

  function orderSpawnInterval(state) {
    return Math.max(0.8, 2.35 / mods(state).spawn);
  }

  function orderTip(state, combo) {
    const gross = Math.max(0.5, grossIncomePerSec(state));
    const base = 5 + gross * 1.7;
    const comboMult = 1 + Math.min(combo, GameConfig.COMBO_MAX) * 0.22;
    let tip = base * mods(state).customer * comboMult;
    if (state.promoUntil && Date.now() < state.promoUntil) {
      tip *= GameConfig.events.promo.customerMult;
    }
    // 淡市时订单少赚一点
    const snap = currentMarketSnapshot();
    tip *= 0.75 + snap.hot.mult * 0.2;
    return Math.max(1, Math.floor(tip));
  }

  function promoCost(state) {
    return Math.ceil(Math.max(3, Math.abs(grossIncomePerSec(state))) * GameConfig.events.promo.costMult);
  }

  function gradeScore(state) {
    const rate = Math.max(0, grossIncomePerSec(state));
    const unlocked = GameConfig.shopOrder.filter(
      (id) => state.shops[id] && state.shops[id].unlocked
    ).length;
    const cos = (state.ownedCosmetics || []).length + (state.ownedThemes || []).length;
    return rate + unlocked * 8 + (state.bestCombo || 0) * 2 + cos * 3;
  }

  function cityGrade(state) {
    const score = gradeScore(state);
    if (score >= 120) return "S";
    if (score >= 55) return "A";
    if (score >= 22) return "B";
    if (score >= 8) return "C";
    return "D";
  }

  function gradeRank(g) {
    return { D: 0, C: 1, B: 2, A: 3, S: 4 }[g] || 0;
  }

  function canUnlock(state, shopId) {
    const def = shopDef(shopId);
    if (!def.unlock) return true;
    const u = def.unlock;
    if (u.requiresAll) {
      return u.requiresAll.every((id) => {
        const s = state.shops[id];
        return s && s.unlocked && s.level >= (u.minLevelEach || 1);
      });
    }
    const req = state.shops[u.requiresShop];
    if (!(req && req.unlocked && req.level >= u.minLevel)) return false;
    if (u.minGrade && gradeRank(cityGrade(state)) < gradeRank(u.minGrade)) return false;
    return true;
  }

  function unlockHint(shopId) {
    const def = shopDef(shopId);
    return (def.unlock && def.unlock.hint) || "未解锁";
  }

  function formatCoins(n) {
    if (!Number.isFinite(n)) return "0";
    const sign = n < 0 ? "-" : "";
    const a = Math.abs(n);
    if (a < 1000) return sign + String(Math.floor(a));
    if (a < 1e6) return sign + (a / 1000).toFixed(a < 1e4 ? 2 : 1).replace(/\.?0+$/, "") + "K";
    if (a < 1e9) return sign + (a / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
    return sign + (a / 1e9).toFixed(2).replace(/\.?0+$/, "") + "B";
  }

  function formatRate(n) {
    const sign = n < 0 ? "-" : "";
    const a = Math.abs(n);
    if (a < 10) return sign + a.toFixed(1);
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

  function planSwitchReady(state, nowMs = Date.now()) {
    return nowMs >= (state.planSwitchAt || 0);
  }

  function planSwitchLeft(state, nowMs = Date.now()) {
    return Math.max(0, Math.ceil(((state.planSwitchAt || 0) - nowMs) / 1000));
  }

  function cosmeticsCollected(state) {
    let n = (state.ownedCosmetics || []).length + (state.ownedThemes || []).length;
    if (state.look && state.look.outfit) n += 1;
    return n;
  }

  function weekId(nowMs = Date.now()) {
    const d = new Date(nowMs);
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d - oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${week}`;
  }

  return {
    shopIncomePerSec,
    upgradeCost,
    totalIncomePerSec,
    grossIncomePerSec,
    netCashflowPerSec,
    operatingCostPerSec,
    opexBreakdown,
    hqOf,
    floorDef,
    signDef,
    hqIncomeMult,
    hqOfflineMult,
    reqMet,
    reqHint,
    activeBill,
    billCostMult,
    rushActive,
    rushLeftSec,
    rushNextSec,
    frenzyActive,
    rewardSoft,
    tapReward,
    passLevelXp,
    chestNeed,
    chestTierFor,
    districtMult,
    districtSnapshot,
    offlineCapSeconds,
    calcOfflineReward,
    canUnlock,
    unlockHint,
    formatCoins,
    formatRate,
    formatDuration,
    cityGrade,
    gradeScore,
    pricingOf,
    planOf,
    specOf,
    supplyOf,
    mods,
    orderSpawnInterval,
    orderTip,
    promoCost,
    planSwitchReady,
    planSwitchLeft,
    currentMarketSnapshot,
    shopMarketMult,
    cosmeticsCollected,
    weekId,
  };
})();
