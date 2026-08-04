/**
 * 街区小老板 — 存档与策略操作
 */
const SaveState = (() => {
  function defaultLook() {
    return { hair: "short", outfit: "tee", skin: "fair" };
  }

  function createDefault(nowMs = Date.now()) {
    const shops = {};
    for (const id of GameConfig.shopOrder) {
      const def = GameConfig.shops[id];
      shops[id] = {
        unlocked: !!def.startUnlocked,
        level: def.startUnlocked ? def.startLevel : 0,
      };
    }
    return {
      version: 3,
      softCoins: GameConfig.STARTING_SOFT,
      shops,
      subscriptionActive: false,
      lastSeenAt: nowMs,
      lifetimeEarned: 0,
      playerName: GameConfig.defaultName,
      look: defaultLook(),
      likesGiven: {},
      pricingId: "fair",
      planId: "rush",
      planSwitchAt: 0,
      specId: null,
      promoUntil: 0,
      eventReadyAt: 0,
      servedTotal: 0,
      missedTotal: 0,
      bestCombo: 0,
    };
  }

  function load() {
    try {
      const raw =
        localStorage.getItem(GameConfig.SAVE_KEY) ||
        localStorage.getItem("blockBoss_save_v2") ||
        localStorage.getItem("blockBoss_save_v1");
      if (!raw) return createDefault();
      return migrate(JSON.parse(raw));
    } catch (e) {
      console.warn("存档读取失败", e);
      return createDefault();
    }
  }

  function migrate(data) {
    const base = createDefault();
    if (!data || typeof data !== "object") return base;
    const shops = { ...base.shops };
    for (const id of GameConfig.shopOrder) {
      if (data.shops && data.shops[id]) {
        shops[id] = {
          unlocked: !!data.shops[id].unlocked,
          level: Math.max(0, Number(data.shops[id].level) || 0),
        };
      }
    }
    const look = { ...base.look, ...(data.look || {}) };
    const pricingId = GameConfig.pricing[data.pricingId] ? data.pricingId : "fair";
    const planId = GameConfig.plans[data.planId] ? data.planId : "rush";
    const specId = GameConfig.specs[data.specId] ? data.specId : null;
    return {
      version: 3,
      softCoins: Math.max(0, Number(data.softCoins) || 0),
      shops,
      subscriptionActive: !!data.subscriptionActive,
      lastSeenAt: Number(data.lastSeenAt) || Date.now(),
      lifetimeEarned: Math.max(0, Number(data.lifetimeEarned) || 0),
      playerName: String(data.playerName || base.playerName).slice(0, 8),
      look,
      likesGiven: data.likesGiven && typeof data.likesGiven === "object" ? data.likesGiven : {},
      pricingId,
      planId,
      planSwitchAt: Number(data.planSwitchAt) || 0,
      specId,
      promoUntil: Number(data.promoUntil) || 0,
      eventReadyAt: Number(data.eventReadyAt) || 0,
      servedTotal: Math.max(0, Number(data.servedTotal) || 0),
      missedTotal: Math.max(0, Number(data.missedTotal) || 0),
      bestCombo: Math.max(0, Number(data.bestCombo) || 0),
    };
  }

  function save(state) {
    const payload = { ...state, lastSeenAt: Date.now() };
    localStorage.setItem(GameConfig.SAVE_KEY, JSON.stringify(payload));
    state.lastSeenAt = payload.lastSeenAt;
  }

  function reset() {
    localStorage.removeItem(GameConfig.SAVE_KEY);
    localStorage.removeItem("blockBoss_save_v2");
    localStorage.removeItem("blockBoss_save_v1");
    return createDefault();
  }

  function tryUpgrade(state, shopId) {
    const shop = state.shops[shopId];
    if (!shop || !shop.unlocked) return false;
    const cost = Economy.upgradeCost(shopId, shop.level, state);
    if (state.softCoins < cost) return false;
    state.softCoins -= cost;
    shop.level += 1;
    applyUnlocks(state);
    save(state);
    return true;
  }

  function applyUnlocks(state) {
    for (const id of GameConfig.shopOrder) {
      const shop = state.shops[id];
      if (shop.unlocked) continue;
      if (Economy.canUnlock(state, id)) {
        shop.unlocked = true;
        shop.level = 1;
      }
    }
  }

  function addSoft(state, amount) {
    if (amount <= 0) return;
    state.softCoins += amount;
    state.lifetimeEarned += amount;
  }

  function claimOffline(state, amount, nowMs = Date.now()) {
    addSoft(state, amount);
    state.lastSeenAt = nowMs;
    save(state);
  }

  function tickIncome(state, dtSec) {
    const gained = Economy.totalIncomePerSec(state) * dtSec;
    addSoft(state, gained);
    return gained;
  }

  function saveLook(state, { playerName, look }) {
    state.playerName =
      String(playerName || GameConfig.defaultName).trim().slice(0, 8) || GameConfig.defaultName;
    state.look = { ...state.look, ...look };
    save(state);
  }

  function toggleLike(state, rivalName) {
    state.likesGiven[rivalName] = !state.likesGiven[rivalName];
    save(state);
    return !!state.likesGiven[rivalName];
  }

  function setPricing(state, pricingId) {
    if (!GameConfig.pricing[pricingId]) return false;
    state.pricingId = pricingId;
    save(state);
    return true;
  }

  function setPlan(state, planId, nowMs = Date.now()) {
    if (!GameConfig.plans[planId]) return { ok: false, reason: "无效方针" };
    if (state.planId === planId) return { ok: false, reason: "已是当前方针" };
    if (!Economy.planSwitchReady(state, nowMs)) {
      return { ok: false, reason: `冷却中还要 ${Economy.planSwitchLeft(state, nowMs)} 秒` };
    }
    state.planId = planId;
    state.planSwitchAt = nowMs + GameConfig.PLAN_SWITCH_COOLDOWN_SEC * 1000;
    save(state);
    return { ok: true };
  }

  function unlockSpec(state, specId) {
    if (state.specId) return { ok: false, reason: "专精只能选一条（重置存档可重选）" };
    const spec = GameConfig.specs[specId];
    if (!spec) return { ok: false, reason: "无效专精" };
    const stall = state.shops.stall;
    if (!stall || stall.level < spec.requireStallLv) {
      return { ok: false, reason: `需要小摊 Lv.${spec.requireStallLv}` };
    }
    if (state.softCoins < spec.cost) return { ok: false, reason: "街区币不够" };
    state.softCoins -= spec.cost;
    state.specId = specId;
    save(state);
    return { ok: true };
  }

  function startPromo(state, nowMs = Date.now()) {
    if (nowMs < (state.eventReadyAt || 0)) {
      return { ok: false, reason: "促销冷却中" };
    }
    if (state.promoUntil && nowMs < state.promoUntil) {
      return { ok: false, reason: "促销进行中" };
    }
    const cost = Economy.promoCost(state);
    if (state.softCoins < cost) return { ok: false, reason: `需要 ${cost} 币启动` };
    state.softCoins -= cost;
    state.promoUntil = nowMs + GameConfig.events.promo.durationSec * 1000;
    state.eventReadyAt = state.promoUntil + GameConfig.EVENT_COOLDOWN_SEC * 1000;
    save(state);
    return { ok: true, cost };
  }

  function recordServe(state, combo) {
    state.servedTotal += 1;
    if (combo > state.bestCombo) state.bestCombo = combo;
  }

  function recordMiss(state) {
    state.missedTotal += 1;
  }

  return {
    createDefault,
    load,
    save,
    reset,
    tryUpgrade,
    applyUnlocks,
    addSoft,
    claimOffline,
    tickIncome,
    saveLook,
    toggleLike,
    setPricing,
    setPlan,
    unlockSpec,
    startPromo,
    recordServe,
    recordMiss,
  };
})();
