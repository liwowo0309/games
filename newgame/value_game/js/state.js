/**
 * 都市大亨 — 存档与操作
 */
const SaveState = (() => {
  function uid() {
    return "mt_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }

  function todayKey(nowMs = Date.now()) {
    return new Date(nowMs).toISOString().slice(0, 10);
  }

  function defaultLook() {
    return { hair: "side", outfit: "shirt", skin: "fair" };
  }

  function defaultDaily() {
    const progress = {};
    GameConfig.dailyTasks.forEach((t) => {
      progress[t.id] = 0;
    });
    return { day: todayKey(), progress, claimed: {} };
  }

  /** 上瘾循环相关的默认状态（目标链 / 高峰 / 宝箱 / 通行证 / 在线时长） */
  function defaultMeta(nowMs = Date.now()) {
    return {
      goal: { index: 0 },
      chestState: { progress: 0, opened: 0 },
      rush: {
        until: 0,
        nextAt: nowMs + 40000,
        combo: 0,
        comboUntil: 0,
        frenzyUntil: 0,
        taps: 0,
        coins: 0,
        wave: 0,
      },
      pass: {
        season: GameConfig.pass.seasonId,
        lv: 1,
        xp: 0,
        premium: false,
        claimedFree: {},
        claimedPrem: {},
      },
      fund: { owned: false, claimed: {} },
      playToday: { day: todayKey(nowMs), sec: 0, claimed: {} },
      dailyShop: { day: todayKey(nowMs), bought: {} },
      firstBuyUsed: false,
    };
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
      version: 1,
      playerId: uid(),
      softCoins: GameConfig.STARTING_SOFT,
      gems: GameConfig.STARTING_GEMS,
      shops,
      supplyLevel: 0,
      subscriptionActive: false,
      subscriptionUntil: 0,
      seasonPass: false,
      lastSeenAt: nowMs,
      lifetimeEarned: 0,
      weekEarned: 0,
      weekId: Economy.weekId(nowMs),
      playerName: GameConfig.defaultName,
      look: defaultLook(),
      themeId: "day",
      ownedThemes: ["day"],
      ownedCosmetics: ["frame_none"],
      equippedFrame: "frame_none",
      equippedSign: null,
      likesGiven: {},
      likesToday: { day: todayKey(nowMs), count: 0 },
      pricingId: "fair",
      planId: "rush",
      planSwitchAt: 0,
      specId: null,
      promoUntil: 0,
      eventReadyAt: 0,
      boostUntil: 0,
      boostUsedToday: { day: todayKey(nowMs), sec: 0 },
      boostTickets: 0,
      servedTotal: 0,
      missedTotal: 0,
      bestCombo: 0,
      daily: defaultDaily(),
      title: "",
      guildId: null,
      war: { active: false, startedAt: 0, endsAt: 0, personal: 0, claimed: false },
      challengeCooldownUntil: 0,
      challengeWins: 0,
      iapReceipts: [],
      stats: { upgrades: 0, lookChanges: 0, taps: 0, chests: 0, rushCleared: 0 },
      bill: null,
      nextBillAt: nowMs + 35 * 1000,
      lifetimeSpent: 0,
      hq: { equipment: {}, staff: [], floorLv: 0, signLv: 0 },
      ...defaultMeta(nowMs),
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(GameConfig.SAVE_KEY);
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
    const merged = {
      ...base,
      ...data,
      shops,
      look: { ...base.look, ...(data.look || {}) },
      ownedThemes: Array.isArray(data.ownedThemes) ? data.ownedThemes : base.ownedThemes,
      ownedCosmetics: Array.isArray(data.ownedCosmetics)
        ? data.ownedCosmetics
        : base.ownedCosmetics,
      daily: data.daily && data.daily.day ? data.daily : defaultDaily(),
      playerId: data.playerId || base.playerId,
      hq: {
        equipment: (data.hq && data.hq.equipment) || {},
        staff: Array.isArray(data.hq && data.hq.staff) ? data.hq.staff : [],
        floorLv: Math.max(0, Number(data.hq && data.hq.floorLv) || 0),
        signLv: Math.max(0, Number(data.hq && data.hq.signLv) || 0),
      },
      version: 1,
    };
    ensureMeta(merged);
    rollDay(merged);
    rollWeek(merged);
    return merged;
  }

  /** 老存档补齐新系统字段；赛季更换时重置通行证 */
  function ensureMeta(state, nowMs = Date.now()) {
    const base = defaultMeta(nowMs);
    Object.keys(base).forEach((k) => {
      if (state[k] == null || typeof state[k] !== typeof base[k]) {
        state[k] = base[k];
        return;
      }
      if (typeof base[k] === "object" && base[k] && !Array.isArray(base[k])) {
        Object.keys(base[k]).forEach((sub) => {
          if (state[k][sub] == null) state[k][sub] = base[k][sub];
        });
      }
    });
    state.stats = state.stats || {};
    ["upgrades", "lookChanges", "taps", "chests", "rushCleared"].forEach((k) => {
      if (typeof state.stats[k] !== "number") state.stats[k] = 0;
    });
    if (state.pass.season !== GameConfig.pass.seasonId) {
      state.pass = { ...base.pass };
    }
    const day = todayKey(nowMs);
    if (state.playToday.day !== day) state.playToday = { day, sec: 0, claimed: {} };
    if (state.dailyShop.day !== day) state.dailyShop = { day, bought: {} };
    return state;
  }

  function rollDay(state, nowMs = Date.now()) {
    const day = todayKey(nowMs);
    if (state.daily.day !== day) state.daily = defaultDaily();
    if (!state.likesToday || state.likesToday.day !== day) {
      state.likesToday = { day, count: 0 };
    }
    if (!state.boostUsedToday || state.boostUsedToday.day !== day) {
      state.boostUsedToday = { day, sec: 0 };
    }
    if (state.playToday && state.playToday.day !== day) {
      state.playToday = { day, sec: 0, claimed: {} };
    }
    if (state.dailyShop && state.dailyShop.day !== day) {
      state.dailyShop = { day, bought: {} };
    }
    if (state.subscriptionActive && state.subscriptionUntil && nowMs > state.subscriptionUntil) {
      state.subscriptionActive = false;
    }
  }

  function rollWeek(state, nowMs = Date.now()) {
    const w = Economy.weekId(nowMs);
    if (state.weekId !== w) {
      state.weekId = w;
      state.weekEarned = 0;
    }
  }

  function save(state) {
    rollDay(state);
    rollWeek(state);
    const payload = { ...state, lastSeenAt: Date.now() };
    localStorage.setItem(GameConfig.SAVE_KEY, JSON.stringify(payload));
    state.lastSeenAt = payload.lastSeenAt;
  }

  function reset() {
    localStorage.removeItem(GameConfig.SAVE_KEY);
    return createDefault();
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

  function tryUpgrade(state, shopId) {
    const shop = state.shops[shopId];
    if (!shop || !shop.unlocked) return false;
    const cost = Economy.upgradeCost(shopId, shop.level, state);
    if (state.softCoins < cost) return false;
    state.softCoins -= cost;
    shop.level += 1;
    state.stats.upgrades = (state.stats.upgrades || 0) + 1;
    bumpDaily(state, "upgrade_any", 1);
    applyUnlocks(state);
    const pass = addPassXp(state, GameConfig.pass.xp.upgrade);
    const chest = addChestProgress(state, GameConfig.chest.upgradeWeight);
    save(state);
    return { ok: true, pass, chest };
  }

  function bumpDaily(state, taskId, n = 1) {
    rollDay(state);
    if (state.daily.progress[taskId] == null) state.daily.progress[taskId] = 0;
    state.daily.progress[taskId] += n;
  }

  function claimDaily(state, taskId) {
    rollDay(state);
    const def = GameConfig.dailyTasks.find((t) => t.id === taskId);
    if (!def) return { ok: false, reason: "无效任务" };
    if (state.daily.claimed[taskId]) return { ok: false, reason: "已领取" };
    if ((state.daily.progress[taskId] || 0) < def.target) {
      return { ok: false, reason: "未完成" };
    }
    state.daily.claimed[taskId] = true;
    addSoft(state, def.rewardSoft);
    state.gems += def.rewardGems;
    const pass = addPassXp(state, GameConfig.pass.xp.dailyTask);
    save(state);
    return { ok: true, soft: def.rewardSoft, gems: def.rewardGems, pass };
  }

  function addSoft(state, amount) {
    if (amount === 0 || !Number.isFinite(amount)) return;
    if (amount > 0) {
      state.softCoins += amount;
      state.lifetimeEarned += amount;
      rollWeek(state);
      state.weekEarned += amount;
      if (state.war && state.war.active) state.war.personal += amount;
      return;
    }
    // 亏损 / 扣费
    const lost = Math.min(state.softCoins, -amount);
    state.softCoins = Math.max(0, state.softCoins + amount);
    state.lifetimeSpent = (state.lifetimeSpent || 0) + lost;
    rollWeek(state);
    state.weekEarned += amount; // 可为负，周榜体现真实盈亏
  }

  function claimOffline(state, amount, nowMs = Date.now()) {
    addSoft(state, amount);
    state.lastSeenAt = nowMs;
    bumpDaily(state, "claim_offline", 1);
    save(state);
  }

  function scheduleNextBill(state, nowMs = Date.now()) {
    const span = GameConfig.BILL_MAX_GAP_SEC - GameConfig.BILL_MIN_GAP_SEC;
    const wait = GameConfig.BILL_MIN_GAP_SEC + Math.random() * span;
    state.nextBillAt = nowMs + wait * 1000;
  }

  function rollWealthPct(range) {
    const [lo, hi] = range || [0.2, 0.35];
    return lo + Math.random() * (hi - lo);
  }

  /** 按当前资产比例算一笔大钱（至少也有底，避免前期无感） */
  function wealthShockAmount(state, wealthPct) {
    const coins = Math.max(0, state.softCoins);
    const byWealth = Math.floor(coins * wealthPct);
    const gross = Math.max(1, Economy.grossIncomePerSec(state));
    const cap = Math.floor(coins * 0.92);
    const floor = Math.min(cap, Math.ceil(gross * 40 + 50));
    return Math.max(byWealth, floor);
  }

  function maybeTriggerBill(state, nowMs = Date.now()) {
    if (Economy.activeBill(state, nowMs)) return null;
    if (!state.nextBillAt) scheduleNextBill(state, nowMs);
    if (nowMs < state.nextBillAt) return null;

    const isBill = Math.random() < (GameConfig.SHOCK_BILL_WEIGHT || 0.6);
    if (isBill) {
      const list = GameConfig.bills;
      const def = list[Math.floor(Math.random() * list.length)];
      const pct = rollWealthPct(def.wealthPct);
      let lump = wealthShockAmount(state, pct);
      // 扣款不能超过现有金币，但要尽量「砍一半」那种体感
      lump = Math.min(lump, Math.floor(state.softCoins));
      if (lump < 1) {
        scheduleNextBill(state, nowMs);
        return null;
      }
      const before = state.softCoins;
      state.bill = {
        id: def.id,
        name: def.name,
        costMult: def.costMult || 2,
        until: nowMs + (def.durationSec || 20) * 1000,
        lump,
      };
      addSoft(state, -lump);
      scheduleNextBill(state, nowMs + (def.durationSec || 20) * 1000);
      save(state);
      return {
        type: "bill",
        name: def.name,
        paid: lump,
        before,
        after: state.softCoins,
        pct: Math.round(pct * 100),
      };
    }

    const list = GameConfig.windfalls || [];
    if (!list.length) {
      scheduleNextBill(state, nowMs);
      return null;
    }
    const def = list[Math.floor(Math.random() * list.length)];
    const pct = rollWealthPct(def.wealthPct);
    const gain = wealthShockAmount(state, pct);
    const before = state.softCoins;
    addSoft(state, gain);
    scheduleNextBill(state, nowMs);
    save(state);
    return {
      type: "boom",
      name: def.name,
      paid: gain,
      before,
      after: state.softCoins,
      pct: Math.round(pct * 100),
    };
  }

  function clearExpiredBill(state, nowMs = Date.now()) {
    if (state.bill && state.bill.until && nowMs >= state.bill.until) {
      state.bill = null;
    }
  }

  function tickIncome(state, dtSec) {
    clearExpiredBill(state);
    const gained = Economy.netCashflowPerSec(state) * dtSec;
    addSoft(state, gained);
    return gained;
  }

  function saveLook(state, { playerName, look }) {
    state.playerName =
      String(playerName || GameConfig.defaultName).trim().slice(0, 10) ||
      GameConfig.defaultName;
    state.look = { ...state.look, ...look };
    state.stats.lookChanges = (state.stats.lookChanges || 0) + 1;
    bumpDaily(state, "change_look", 1);
    save(state);
  }

  function setTheme(state, themeId) {
    if (!(state.ownedThemes || []).includes(themeId)) {
      return { ok: false, reason: "未拥有该主题" };
    }
    state.themeId = themeId;
    bumpDaily(state, "change_look", 1);
    save(state);
    return { ok: true };
  }

  function upgradeSupply(state) {
    const next = state.supplyLevel + 1;
    const def = GameConfig.supplyLevels[next];
    if (!def) return { ok: false, reason: "供应链已满级" };
    if (state.softCoins < def.cost) return { ok: false, reason: "都市币不足" };
    state.softCoins -= def.cost;
    state.supplyLevel = next;
    save(state);
    return { ok: true, name: def.name };
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
    if (state.specId) return { ok: false, reason: "专精只能选一条" };
    const spec = GameConfig.specs[specId];
    if (!spec) return { ok: false, reason: "无效专精" };
    const shop = state.shops[spec.requireShop];
    if (!shop || shop.level < spec.requireLv) {
      return { ok: false, reason: `需要${GameConfig.shops[spec.requireShop].name} Lv.${spec.requireLv}` };
    }
    if (state.softCoins < spec.cost) return { ok: false, reason: "都市币不够" };
    state.softCoins -= spec.cost;
    state.specId = specId;
    save(state);
    return { ok: true };
  }

  function startPromo(state, nowMs = Date.now()) {
    const ev = GameConfig.events.promo;
    if (nowMs < (state.eventReadyAt || 0)) return { ok: false, reason: "投放冷却中" };
    if (state.promoUntil && nowMs < state.promoUntil) return { ok: false, reason: "投放进行中" };
    const cost = Economy.promoCost(state);
    if (state.softCoins < cost) return { ok: false, reason: `需要 ${cost} 币` };
    state.softCoins -= cost;
    state.promoUntil = nowMs + ev.durationSec * 1000;
    state.eventReadyAt = state.promoUntil + ev.cooldownSec * 1000;
    save(state);
    return { ok: true, cost };
  }

  function recordServe(state, combo) {
    state.servedTotal += 1;
    if (combo > state.bestCombo) state.bestCombo = combo;
    bumpDaily(state, "serve_orders", 1);
    addPassXp(state, GameConfig.pass.xp.serve);
    return addChestProgress(state, GameConfig.chest.serveWeight);
  }

  function recordMiss(state) {
    state.missedTotal += 1;
  }

  function buyCosmeticGems(state, cosId) {
    const cos = GameConfig.cosmetics.find((c) => c.id === cosId);
    if (!cos || !cos.gemCost) return { ok: false, reason: "不可用钻石购买" };
    if ((state.ownedCosmetics || []).includes(cosId)) return { ok: false, reason: "已拥有" };
    if (state.gems < cos.gemCost) return { ok: false, reason: "钻石不足" };
    state.gems -= cos.gemCost;
    state.ownedCosmetics.push(cosId);
    if (cos.type === "sign") state.equippedSign = cosId;
    if (cos.type === "frame") state.equippedFrame = cosId;
    save(state);
    return { ok: true };
  }

  function buyThemeGems(state, themeId) {
    const th = GameConfig.themes.find((t) => t.id === themeId);
    if (!th || !th.gemCost) return { ok: false, reason: "不可用钻石购买" };
    if ((state.ownedThemes || []).includes(themeId)) return { ok: false, reason: "已拥有" };
    if (state.gems < th.gemCost) return { ok: false, reason: "钻石不足" };
    state.gems -= th.gemCost;
    state.ownedThemes.push(themeId);
    state.themeId = themeId;
    bumpDaily(state, "change_look", 1);
    save(state);
    return { ok: true };
  }

  function useBoostTicket(state, nowMs = Date.now()) {
    rollDay(state);
    if (state.boostTickets < 1) return { ok: false, reason: "无加速券" };
    const add = 300;
    if (state.boostUsedToday.sec + add > GameConfig.BOOST_DAILY_CAP_SEC) {
      return { ok: false, reason: "今日加速时长已达上限" };
    }
    state.boostTickets -= 1;
    state.boostUsedToday.sec += add;
    state.boostUntil = Math.max(state.boostUntil || 0, nowMs) + add * 1000;
    save(state);
    return { ok: true, sec: add };
  }

  function grantSub(state, days, season, nowMs = Date.now()) {
    state.subscriptionActive = true;
    state.subscriptionUntil = Math.max(state.subscriptionUntil || nowMs, nowMs) + days * 86400000;
    if (season) {
      state.seasonPass = true;
      state.title = "季卡大亨";
    }
    if (!(state.ownedCosmetics || []).includes("frame_sub")) {
      state.ownedCosmetics.push("frame_sub");
    }
    state.equippedFrame = "frame_sub";
    save(state);
  }

  function claimSubDaily(state, nowMs = Date.now()) {
    if (!state.subscriptionActive) return { ok: false, reason: "未开通月卡" };
    rollDay(state);
    if (state.daily.claimed.sub_daily) return { ok: false, reason: "今日已领" };
    state.daily.claimed.sub_daily = true;
    state.gems += 20;
    addSoft(state, 50);
    save(state);
    return { ok: true, gems: 20, soft: 50 };
  }

  function ensureHq(state) {
    if (!state.hq) state.hq = { equipment: {}, staff: [], floorLv: 0, signLv: 0 };
    if (!state.hq.equipment) state.hq.equipment = {};
    if (!Array.isArray(state.hq.staff)) state.hq.staff = [];
    return state.hq;
  }

  function claimEquipment(state, eqId) {
    ensureHq(state);
    const eq = GameConfig.hq.equipment.find((e) => e.id === eqId);
    if (!eq) return { ok: false, reason: "无此设备" };
    if (state.hq.equipment[eqId]) return { ok: false, reason: "已拥有" };
    if (!Economy.reqMet(state, eq.require)) {
      return { ok: false, reason: "未达成：" + Economy.reqHint(eq.require) };
    }
    const cost = eq.claimSoft || 0;
    if (state.softCoins < cost) return { ok: false, reason: "都市币不足" };
    if (cost > 0) state.softCoins -= cost;
    state.hq.equipment[eqId] = true;
    save(state);
    return { ok: true, name: eq.name };
  }

  function expandFloor(state) {
    ensureHq(state);
    const next = state.hq.floorLv + 1;
    const def = GameConfig.hq.floors[next];
    if (!def) return { ok: false, reason: "店面已最大" };
    if (state.softCoins < def.softCost) return { ok: false, reason: "都市币不足" };
    state.softCoins -= def.softCost;
    state.hq.floorLv = next;
    bumpDaily(state, "hire_or_expand", 1);
    save(state);
    return { ok: true, name: def.name, maxStaff: def.maxStaff };
  }

  function expandSign(state) {
    ensureHq(state);
    const next = state.hq.signLv + 1;
    const def = GameConfig.hq.signs[next];
    if (!def) return { ok: false, reason: "招牌已最大" };
    if (state.softCoins < def.softCost) return { ok: false, reason: "都市币不足" };
    state.softCoins -= def.softCost;
    state.hq.signLv = next;
    bumpDaily(state, "hire_or_expand", 1);
    save(state);
    return { ok: true, name: def.name };
  }

  function hireStaff(state, typeId) {
    ensureHq(state);
    const typ = GameConfig.hq.staffTypes.find((t) => t.id === typeId);
    if (!typ) return { ok: false, reason: "无此岗位" };
    if (!Economy.reqMet(state, typ.require)) {
      return { ok: false, reason: "未达成：" + Economy.reqHint(typ.require) };
    }
    const floor = Economy.floorDef(state);
    if (state.hq.staff.length >= floor.maxStaff) {
      return { ok: false, reason: `工位已满（${floor.maxStaff}）· 先用金币扩店` };
    }
    if (state.gems < typ.gemCost) return { ok: false, reason: `需要 ${typ.gemCost} 钻石` };
    if (state.softCoins < (typ.softHire || 0)) return { ok: false, reason: "入职押金不够" };
    state.gems -= typ.gemCost;
    if (typ.softHire) state.softCoins -= typ.softHire;
    state.hq.staff.push({
      uid: "st_" + Date.now().toString(36),
      typeId,
      level: 1,
      name: typ.name,
    });
    bumpDaily(state, "hire_or_expand", 1);
    save(state);
    return { ok: true, name: typ.name, gemCost: typ.gemCost };
  }

  function upgradeStaff(state, uid) {
    ensureHq(state);
    const s = state.hq.staff.find((x) => x.uid === uid);
    if (!s) return { ok: false, reason: "员工不存在" };
    const cost = Math.ceil(
      GameConfig.hq.staffUpgradeSoft * Math.pow(GameConfig.hq.staffUpgradeGrowth, (s.level || 1) - 1)
    );
    if (state.softCoins < cost) return { ok: false, reason: "都市币不足" };
    state.softCoins -= cost;
    s.level = (s.level || 1) + 1;
    save(state);
    return { ok: true, level: s.level, cost };
  }

  // ===================================================================
  // 奖励发放（统一入口，配置里写 softSec/gems/ticket/theme/cosmetic/outfit）
  // ===================================================================
  function grantReward(state, r) {
    const got = { soft: 0, gems: 0, ticket: 0, extras: [] };
    if (!r) return got;
    if (r.softSec) got.soft += Economy.rewardSoft(state, r.softSec);
    if (r.soft) got.soft += r.soft;
    if (r.gems) got.gems += r.gems;
    if (r.ticket) got.ticket += r.ticket;
    if (r.theme && !(state.ownedThemes || []).includes(r.theme)) {
      state.ownedThemes.push(r.theme);
      got.extras.push(themeName(r.theme));
    }
    if (r.cosmetic && !(state.ownedCosmetics || []).includes(r.cosmetic)) {
      state.ownedCosmetics.push(r.cosmetic);
      got.extras.push(cosmeticName(r.cosmetic));
    }
    if (r.outfit) {
      state.look.outfit = r.outfit;
      got.extras.push("新着装");
    }
    if (got.soft) addSoft(state, got.soft);
    if (got.gems) state.gems += got.gems;
    if (got.ticket) state.boostTickets += got.ticket;
    return got;
  }

  function themeName(id) {
    const t = GameConfig.themes.find((x) => x.id === id);
    return t ? t.name : "主题";
  }

  function cosmeticName(id) {
    const c = GameConfig.cosmetics.find((x) => x.id === id);
    return c ? c.name : "装扮";
  }

  function rewardText(got) {
    const parts = [];
    if (got.soft) parts.push(`+${Economy.formatCoins(got.soft)} 币`);
    if (got.gems) parts.push(`+${got.gems} 钻`);
    if (got.ticket) parts.push(`+${got.ticket} 加速券`);
    (got.extras || []).forEach((e) => parts.push(e));
    return parts.join(" · ") || "已领取";
  }

  // ===================================================================
  // 目标链：永远有下一个小目标
  // ===================================================================
  function metricValue(state, metric) {
    const hq = ensureHq(state);
    switch (metric) {
      case "upgrades":
        return state.stats.upgrades | 0;
      case "served":
        return state.servedTotal | 0;
      case "taps":
        return state.stats.taps | 0;
      case "chests":
        return state.stats.chests | 0;
      case "rush":
        return state.stats.rushCleared | 0;
      case "floorLv":
        return hq.floorLv | 0;
      case "signLv":
        return hq.signLv | 0;
      case "staff":
        return hq.staff.length;
      case "equip":
        return Object.keys(hq.equipment || {}).length;
      case "shops":
        return GameConfig.shopOrder.filter((id) => state.shops[id] && state.shops[id].unlocked).length;
      case "topLevel":
        return GameConfig.shopOrder.reduce(
          (m, id) => Math.max(m, (state.shops[id] && state.shops[id].level) || 0),
          0
        );
      case "passLv":
        return state.pass.lv | 0;
      default:
        return 0;
    }
  }

  function goalStatus(state) {
    ensureMeta(state);
    const list = GameConfig.goalChain;
    const idx = Math.min(state.goal.index | 0, list.length);
    if (idx >= list.length) {
      return { done: true, finished: true, index: idx, total: list.length, def: null, cur: 0, target: 0 };
    }
    const def = list[idx];
    const cur = metricValue(state, def.metric);
    return {
      def,
      index: idx,
      total: list.length,
      cur: Math.min(cur, def.target),
      target: def.target,
      done: cur >= def.target,
      finished: false,
    };
  }

  function claimGoal(state) {
    const st = goalStatus(state);
    if (st.finished) return { ok: false, reason: "全部目标已完成" };
    if (!st.done) return { ok: false, reason: "目标还没达成" };
    const got = grantReward(state, { softSec: st.def.softSec, gems: st.def.gems });
    state.goal.index = st.index + 1;
    const pass = addPassXp(state, st.def.xp || 0);
    save(state);
    return { ok: true, name: st.def.name, got, text: rewardText(got), pass };
  }

  function skipGoal(state) {
    const st = goalStatus(state);
    if (st.finished) return { ok: false, reason: "全部目标已完成" };
    if (st.done) return { ok: false, reason: "已经达成，直接领取就行" };
    const cost = GameConfig.GOAL_SKIP_GEMS;
    if (state.gems < cost) return { ok: false, reason: `需要 ${cost} 钻石` };
    state.gems -= cost;
    const got = grantReward(state, { softSec: st.def.softSec, gems: st.def.gems });
    state.goal.index = st.index + 1;
    const pass = addPassXp(state, st.def.xp || 0);
    save(state);
    return { ok: true, name: st.def.name, got, text: rewardText(got), gems: cost, pass };
  }

  // ===================================================================
  // 赛季通行证
  // ===================================================================
  function addPassXp(state, xp) {
    ensureMeta(state);
    if (!xp || xp <= 0) return { levels: 0, lv: state.pass.lv };
    const max = GameConfig.pass.maxLevel;
    state.pass.xp += xp;
    let levels = 0;
    while (state.pass.lv < max) {
      const need = Economy.passLevelXp(state.pass.lv);
      if (state.pass.xp < need) break;
      state.pass.xp -= need;
      state.pass.lv += 1;
      levels += 1;
    }
    if (state.pass.lv >= max) state.pass.xp = 0;
    return { levels, lv: state.pass.lv };
  }

  function passRewardFor(lv, track) {
    const p = GameConfig.pass;
    const sp = p.special[lv];
    if (sp) return track === "prem" ? sp.prem : sp.free;
    const cycle = track === "prem" ? p.premiumCycle : p.freeCycle;
    return cycle[(lv - 1) % cycle.length];
  }

  function claimPassReward(state, lv, track) {
    ensureMeta(state);
    const level = Number(lv);
    if (!level || level > GameConfig.pass.maxLevel) return { ok: false, reason: "等级无效" };
    if (state.pass.lv < level) return { ok: false, reason: `通行证还没到 ${level} 级` };
    if (track === "prem" && !state.pass.premium) {
      return { ok: false, reason: "需要解锁高级轨" };
    }
    const box = track === "prem" ? state.pass.claimedPrem : state.pass.claimedFree;
    if (box[level]) return { ok: false, reason: "已领取" };
    box[level] = true;
    const got = grantReward(state, passRewardFor(level, track));
    save(state);
    return { ok: true, got, text: rewardText(got) };
  }

  /** 一键领取所有可领（买高级轨后补发的主要体验） */
  function claimAllPass(state) {
    ensureMeta(state);
    const total = { soft: 0, gems: 0, ticket: 0, extras: [] };
    let count = 0;
    for (let lv = 1; lv <= state.pass.lv; lv++) {
      ["free", "prem"].forEach((track) => {
        const res = claimPassReward(state, lv, track);
        if (res.ok) {
          count += 1;
          total.soft += res.got.soft;
          total.gems += res.got.gems;
          total.ticket += res.got.ticket;
          res.got.extras.forEach((e) => total.extras.push(e));
        }
      });
    }
    if (!count) return { ok: false, reason: "暂时没有可领取的奖励" };
    return { ok: true, count, text: rewardText(total) };
  }

  function unlockPassPremium(state) {
    ensureMeta(state);
    state.pass.premium = true;
    let claimable = 0;
    for (let lv = 1; lv <= state.pass.lv; lv++) {
      if (!state.pass.claimedPrem[lv]) claimable += 1;
    }
    save(state);
    return { ok: true, claimable };
  }

  // ===================================================================
  // 成长基金
  // ===================================================================
  function ownGrowthFund(state) {
    ensureMeta(state);
    state.fund.owned = true;
    save(state);
  }

  function fundStatus(state) {
    ensureMeta(state);
    return GameConfig.growthFund.milestones.map((m) => ({
      lv: m.lv,
      gems: m.gems,
      reached: state.pass.lv >= m.lv,
      claimed: !!state.fund.claimed[m.lv],
    }));
  }

  function claimFund(state, lv) {
    ensureMeta(state);
    if (!state.fund.owned) return { ok: false, reason: "还没购买成长基金" };
    const m = GameConfig.growthFund.milestones.find((x) => x.lv === Number(lv));
    if (!m) return { ok: false, reason: "无此档位" };
    if (state.pass.lv < m.lv) return { ok: false, reason: `通行证到 ${m.lv} 级才能领` };
    if (state.fund.claimed[m.lv]) return { ok: false, reason: "已领取" };
    state.fund.claimed[m.lv] = true;
    state.gems += m.gems;
    save(state);
    return { ok: true, gems: m.gems };
  }

  // ===================================================================
  // 宝箱：所有操作都攒进度，攒满自动开
  // ===================================================================
  function chestStatus(state) {
    ensureMeta(state);
    const need = Economy.chestNeed(state.chestState.opened);
    const tier = Economy.chestTierFor(state.chestState.opened);
    return {
      progress: Math.min(state.chestState.progress, need),
      need,
      tier,
      pct: Math.max(0, Math.min(1, state.chestState.progress / need)),
    };
  }

  function grantChest(state) {
    ensureMeta(state);
    const tier = Economy.chestTierFor(state.chestState.opened);
    const gems =
      tier.gems[0] + Math.floor(Math.random() * (tier.gems[1] - tier.gems[0] + 1));
    const got = grantReward(state, { softSec: tier.softSec, gems, ticket: tier.ticket });
    state.chestState.opened += 1;
    state.stats.chests = (state.stats.chests || 0) + 1;
    const pass = addPassXp(state, GameConfig.pass.xp.chest);
    save(state);
    return { tier, got, text: rewardText(got), pass };
  }

  function addChestProgress(state, n) {
    ensureMeta(state);
    state.chestState.progress += n || 0;
    const need = Economy.chestNeed(state.chestState.opened);
    if (state.chestState.progress < need) return null;
    state.chestState.progress -= need;
    return grantChest(state);
  }

  function openChestInstant(state) {
    ensureMeta(state);
    const cost = GameConfig.chest.instantGems;
    const st = chestStatus(state);
    if (st.progress >= st.need) return { ok: true, chest: addChestProgress(state, 0) };
    if (state.gems < cost) return { ok: false, reason: `需要 ${cost} 钻石` };
    state.gems -= cost;
    state.chestState.progress = 0;
    return { ok: true, gems: cost, chest: grantChest(state) };
  }

  // ===================================================================
  // 客流高峰
  // ===================================================================
  function scheduleRush(state, nowMs = Date.now()) {
    ensureMeta(state);
    const cfg = GameConfig.rush;
    const wait = cfg.gapMinSec + Math.random() * (cfg.gapMaxSec - cfg.gapMinSec);
    state.rush.nextAt = nowMs + wait * 1000;
  }

  function startRush(state, nowMs = Date.now()) {
    ensureMeta(state);
    const cfg = GameConfig.rush;
    state.rush.until = nowMs + cfg.durationSec * 1000;
    state.rush.combo = 0;
    state.rush.comboUntil = 0;
    state.rush.frenzyUntil = 0;
    state.rush.taps = 0;
    state.rush.coins = 0;
    state.rush.wave = (state.rush.wave || 0) + 1;
    state.rush.nextAt = state.rush.until + 1000;
    save(state);
    return { wave: state.rush.wave, sec: cfg.durationSec };
  }

  function summonRush(state, nowMs = Date.now()) {
    ensureMeta(state);
    if (Economy.rushActive(state, nowMs)) return { ok: false, reason: "高峰正在进行" };
    const cost = GameConfig.rush.summonGems;
    if (state.gems < cost) return { ok: false, reason: `需要 ${cost} 钻石` };
    state.gems -= cost;
    const res = startRush(state, nowMs);
    return { ok: true, gems: cost, ...res };
  }

  function endRush(state, nowMs = Date.now()) {
    ensureMeta(state);
    const cfg = GameConfig.rush;
    const taps = state.rush.taps || 0;
    const coins = state.rush.coins || 0;
    state.rush.until = 0;
    state.rush.combo = 0;
    state.rush.frenzyUntil = 0;
    state.stats.rushCleared = (state.stats.rushCleared || 0) + 1;
    bumpDaily(state, "rush_clear", 1);
    const got = grantReward(state, { softSec: cfg.clearSoftSec, gems: cfg.clearGems });
    const pass = addPassXp(state, cfg.clearXp);
    const chest = addChestProgress(state, GameConfig.chest.rushWeight);
    scheduleRush(state, nowMs);
    save(state);
    return {
      taps,
      coins,
      wave: state.rush.wave,
      got,
      text: rewardText(got),
      pass,
      chest,
    };
  }

  /** 手动招待一位客人 */
  function tapGuest(state, nowMs = Date.now()) {
    ensureMeta(state);
    const cfg = GameConfig.rush;
    if (nowMs < (state.rush.comboUntil || 0)) {
      state.rush.combo = Math.min(cfg.comboMax, (state.rush.combo || 0) + 1);
    } else {
      state.rush.combo = 1;
    }
    state.rush.comboUntil = nowMs + 1800;
    let frenzyStarted = false;
    if (
      state.rush.combo >= cfg.frenzyAt &&
      state.rush.combo % cfg.frenzyAt === 0 &&
      nowMs >= (state.rush.frenzyUntil || 0)
    ) {
      state.rush.frenzyUntil = nowMs + cfg.frenzySec * 1000;
      frenzyStarted = true;
    }
    const coins = Economy.tapReward(state, state.rush.combo, nowMs);
    addSoft(state, coins);
    state.stats.taps = (state.stats.taps || 0) + 1;
    state.rush.taps = (state.rush.taps || 0) + 1;
    state.rush.coins = (state.rush.coins || 0) + coins;
    if (state.rush.combo > (state.bestCombo || 0)) state.bestCombo = state.rush.combo;
    bumpDaily(state, "tap_guests", 1);
    const pass = addPassXp(state, GameConfig.pass.xp.tap);
    const chest = addChestProgress(state, GameConfig.chest.tapWeight);
    return { coins, combo: state.rush.combo, frenzyStarted, pass, chest };
  }

  // ===================================================================
  // 今日累计在线时长奖励
  // ===================================================================
  function addPlaytime(state, sec) {
    ensureMeta(state);
    rollDay(state);
    state.playToday.sec += sec || 0;
  }

  function playtimeStatus(state) {
    ensureMeta(state);
    const min = state.playToday.sec / 60;
    return GameConfig.playtimeRewards.map((r) => ({
      min: r.min,
      gems: r.gems,
      chest: !!r.chest,
      reached: min >= r.min,
      claimed: !!state.playToday.claimed[r.min],
      leftSec: Math.max(0, Math.ceil(r.min * 60 - state.playToday.sec)),
    }));
  }

  function claimPlaytime(state, min) {
    ensureMeta(state);
    const def = GameConfig.playtimeRewards.find((r) => r.min === Number(min));
    if (!def) return { ok: false, reason: "无此档位" };
    if (state.playToday.sec < def.min * 60) return { ok: false, reason: "时长还没到" };
    if (state.playToday.claimed[def.min]) return { ok: false, reason: "已领取" };
    state.playToday.claimed[def.min] = true;
    const got = grantReward(state, { softSec: def.softSec, gems: def.gems });
    const chest = def.chest ? grantChest(state) : null;
    save(state);
    return { ok: true, got, text: rewardText(got), chest };
  }

  // ===================================================================
  // 每日轮换商店（钻石消耗口）
  // ===================================================================
  function dayHash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000;
    return h;
  }

  function dailyShopItems(state) {
    ensureMeta(state);
    const pool = GameConfig.dailyShopPool;
    const slots = GameConfig.DAILY_SHOP_SLOTS;
    const h = dayHash(state.playToday.day || todayKey());
    const picked = [];
    for (let i = 0; i < slots; i++) {
      const idx = (h + i * 37) % pool.length;
      let k = idx;
      while (picked.includes(pool[k])) k = (k + 1) % pool.length;
      picked.push(pool[k]);
    }
    return picked.map((p) => ({ ...p, bought: !!state.dailyShop.bought[p.id] }));
  }

  function buyDailyShop(state, id) {
    ensureMeta(state);
    const item = dailyShopItems(state).find((x) => x.id === id);
    if (!item) return { ok: false, reason: "今日不在售" };
    if (item.bought) return { ok: false, reason: "今日已买过" };
    if (state.gems < item.gemCost) return { ok: false, reason: `需要 ${item.gemCost} 钻石` };
    state.gems -= item.gemCost;
    state.dailyShop.bought[id] = true;
    const got = grantReward(state, item);
    save(state);
    return { ok: true, name: item.name, text: rewardText(got) };
  }

  return {
    createDefault,
    load,
    save,
    reset,
    ensureMeta,
    grantReward,
    rewardText,
    metricValue,
    goalStatus,
    claimGoal,
    skipGoal,
    addPassXp,
    passRewardFor,
    claimPassReward,
    claimAllPass,
    unlockPassPremium,
    ownGrowthFund,
    fundStatus,
    claimFund,
    chestStatus,
    addChestProgress,
    grantChest,
    openChestInstant,
    scheduleRush,
    startRush,
    summonRush,
    endRush,
    tapGuest,
    addPlaytime,
    playtimeStatus,
    claimPlaytime,
    dailyShopItems,
    buyDailyShop,
    tryUpgrade,
    applyUnlocks,
    addSoft,
    claimOffline,
    tickIncome,
    saveLook,
    setTheme,
    upgradeSupply,
    setPricing,
    setPlan,
    unlockSpec,
    startPromo,
    recordServe,
    recordMiss,
    bumpDaily,
    claimDaily,
    buyCosmeticGems,
    buyThemeGems,
    useBoostTicket,
    grantSub,
    claimSubDaily,
    rollDay,
    rollWeek,
    todayKey,
    maybeTriggerBill,
    clearExpiredBill,
    scheduleNextBill,
    claimEquipment,
    expandFloor,
    expandSign,
    hireStaff,
    upgradeStaff,
    ensureHq,
  };
})();
