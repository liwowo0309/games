/**
 * 都市大亨 — UI
 */
const UI = (() => {
  const els = {};
  let toastTimer = null;
  let pendingOffline = null;
  let speechTimer = null;
  let draftLook = null;
  let onUpgradeCb = null;
  let handlers = {};
  let visitTarget = null;
  let boardSort = "week";

  function cache() {
    [
      "softCoins", "gems", "incomeRate", "shopGrid", "offlineModal", "offlineTime",
      "offlineAmount", "btnClaimOffline", "settingsModal", "btnSettings",
      "btnResetSave", "btnCloseSettings", "btnOfflineEntry", "toast",
      "chipAvatar", "playerNameLabel", "cityGrade", "btnBoss", "cityRow",
      "peds", "orders", "bossFigure", "bossSpeech", "floatLayer", "streetHint",
      "lookPreview", "nameInput", "hairOptions", "outfitOptions", "skinOptions",
      "btnSaveLook", "themeOptions", "marketHot", "supplyCard",
      "strategyStrip", "pricingChoices", "planChoices", "specChoices", "eventCard",
      "planCooldown", "comboHud", "comboText", "skillStats", "modalBoss", "vista",
      "taskList", "shopProducts", "cosmeticList", "boardList", "boardSortWeek",
      "boardSortCos", "visitPanel", "visitDetail", "btnCloudSync", "btnPullCloud",
      "warPanel", "guildPanel", "challengePanel", "auctionPanel", "iapModeLabel",
      "btnSubDaily", "frameOptions", "signOptions", "shockModal", "shockCard",
      "shockTag", "shockTitle", "shockSub", "shockBefore", "shockAfter",
      "shockDelta", "btnCloseShock", "visitModal", "visitTag", "visitTitle",
      "visitOwner", "visitDesc", "visitMenu", "btnCloseVisit", "hqBoard",
      "goalBar", "goalIndex", "goalName", "goalFill", "goalProg", "btnGoalClaim",
      "btnGoalSkip", "chestRing", "chestIco", "chestTxt", "playtimeStrip",
      "rushBanner", "rushTag", "rushTime", "rushCombo", "rushBar", "guestLayer",
      "passSeason", "passHead", "passRail", "fundBox", "dailyShopBox",
      "chestModal", "chestTierTag", "chestBig", "chestReward", "chestNext",
      "btnCloseChest", "btnSummonRush",
    ].forEach((id) => {
      els[id] = document.getElementById(id);
    });
    els.panels = {
      manage: document.getElementById("panelManage"),
      strategy: document.getElementById("panelStrategy"),
      look: document.getElementById("panelLook"),
      tasks: document.getElementById("panelTasks"),
      pass: document.getElementById("panelPass"),
      store: document.getElementById("panelStore"),
      net: document.getElementById("panelNet"),
      heavy: document.getElementById("panelHeavy"),
    };
    els.navBtns = Array.from(document.querySelectorAll(".nav-btn[data-panel]"));
  }

  function setHandlers(h) {
    handlers = h || {};
  }

  function lookOf(state) {
    return state.look || { hair: "side", outfit: "shirt", skin: "fair" };
  }

  function applyTheme(state) {
    const th = GameConfig.themes.find((t) => t.id === state.themeId) || GameConfig.themes[0];
    document.documentElement.dataset.theme = th.id;
    if (th.sky && window.World3D && World3D.ready) {
      World3D.setThemeSky(th.sky);
    }
  }

  function buildStreetSlots(state) {
    const slots = [];
    // 自己的店：所有已解锁业态都是「我的店」
    for (const id of GameConfig.shopOrder) {
      const def = GameConfig.shops[id];
      const shop = state.shops[id];
      if (!shop || !shop.unlocked) continue;
      slots.push({
        id,
        name: def.name,
        icon: def.icon,
        colorKey: def.building || id,
        owned: true,
        ownerName: state.playerName,
        unlocked: true,
        level: shop.level,
        floorLv: (state.hq && state.hq.floorLv) || 0,
        signLv: (state.hq && state.hq.signLv) || 0,
      });
    }
    // 别人的店
    (GameConfig.neighborShops || []).forEach((nb) => {
      slots.push({
        id: nb.id,
        name: nb.name,
        icon: nb.icon,
        colorKey: nb.colorKey,
        owned: false,
        ownerName: nb.ownerName,
        unlocked: true,
        level: 1,
        menu: nb.menu,
      });
    });
    return slots;
  }

  function syncWorld(state) {
    if (!window.World3D || !World3D.ready) return;
    World3D.syncShops(buildStreetSlots(state));
  }

  function showVisitShop(slot) {
    if (!els.visitModal) return;
    els.visitTag.textContent = "别人的店";
    els.visitTitle.textContent = slot.name;
    els.visitOwner.textContent = `店主：${slot.ownerName || "街坊"}`;
    els.visitDesc.textContent = "点单吃喝看看别人怎么经营（花费都市币）";
    els.visitMenu.innerHTML = "";
    (slot.menu || []).forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "visit-item";
      btn.innerHTML = `<strong>${item.name}</strong><span>${item.desc || ""}</span><em>${item.cost} 币</em>`;
      btn.addEventListener("click", () => {
        if (handlers.onVisitBuy) handlers.onVisitBuy(slot, item);
      });
      els.visitMenu.appendChild(btn);
    });
    els.visitModal.classList.remove("hidden");
  }

  function hideVisitShop() {
    if (els.visitModal) els.visitModal.classList.add("hidden");
  }

  // ===================================================================
  // 目标链 / 宝箱 / 在线时长
  // ===================================================================
  function renderGoal(state) {
    if (!els.goalBar) return;
    const st = SaveState.goalStatus(state);
    if (st.finished) {
      els.goalIndex.textContent = `${st.total}/${st.total}`;
      els.goalName.textContent = "全部目标已完成，你是这条街的传奇";
      els.goalFill.style.width = "100%";
      els.goalProg.textContent = "已通关";
      els.btnGoalClaim.disabled = true;
      els.btnGoalClaim.textContent = "已完成";
      els.btnGoalSkip.hidden = true;
    } else {
      const pct = Math.max(0, Math.min(1, st.cur / st.target));
      els.goalIndex.textContent = `${st.index + 1}/${st.total}`;
      els.goalName.textContent = st.def.name;
      els.goalFill.style.width = (pct * 100).toFixed(1) + "%";
      const soft = Economy.rewardSoft(state, st.def.softSec);
      els.goalProg.textContent = `${st.cur} / ${st.target} · 奖 ${Economy.formatCoins(soft)}币 +${st.def.gems}钻`;
      els.btnGoalClaim.disabled = !st.done;
      els.btnGoalClaim.textContent = st.done ? "领取奖励" : "进行中";
      els.btnGoalClaim.classList.toggle("ready", st.done);
      els.btnGoalSkip.hidden = st.done;
      els.btnGoalSkip.textContent = `💎${GameConfig.GOAL_SKIP_GEMS} 立刻完成`;
    }
    els.goalBar.classList.toggle("goal-ready", !st.finished && st.done);
    renderChestRing(state);
  }

  function renderChestRing(state) {
    if (!els.chestRing) return;
    const st = SaveState.chestStatus(state);
    els.chestIco.textContent = st.tier.icon;
    els.chestTxt.textContent = `${Math.floor(st.progress)}/${st.need}`;
    els.chestRing.style.setProperty("--pct", (st.pct * 100).toFixed(1) + "%");
    els.chestRing.classList.toggle("near", st.pct > 0.8);
    els.chestRing.title = `${st.tier.name}进度 · 点击可花 ${GameConfig.chest.instantGems} 钻立刻开箱`;
  }

  function renderPlaytime(state) {
    if (!els.playtimeStrip) return;
    const list = SaveState.playtimeStatus(state);
    const next = list.find((r) => !r.claimed);
    els.playtimeStrip.innerHTML = "";
    const head = document.createElement("p");
    head.className = "pt-head";
    head.textContent = next
      ? next.reached
        ? `今日在线奖励可领：${next.min} 分钟档`
        : `今日在线 ${Economy.formatDuration(state.playToday.sec)} · 再玩 ${Economy.formatDuration(next.leftSec)} 开下一档`
      : "今日全部在线奖励已领完，明天再来";
    els.playtimeStrip.appendChild(head);

    const row = document.createElement("div");
    row.className = "pt-row";
    list.forEach((r) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className =
        "pt-chip" + (r.claimed ? " claimed" : r.reached ? " ready" : "");
      b.dataset.pt = String(r.min);
      b.disabled = r.claimed || !r.reached;
      b.innerHTML = `<strong>${r.min}分</strong><span>${r.claimed ? "已领" : `💎${r.gems}${r.chest ? " 📦" : ""}`}</span>`;
      row.appendChild(b);
    });
    els.playtimeStrip.appendChild(row);
    row.querySelectorAll("[data-pt]").forEach((b) => {
      b.addEventListener("click", () => handlers.onClaimPlaytime && handlers.onClaimPlaytime(b.dataset.pt));
    });
  }

  // ===================================================================
  // 客流高峰：横幅 + 可点顾客
  // ===================================================================
  function renderRush(state) {
    if (!els.rushBanner) return;
    const now = Date.now();
    const active = Economy.rushActive(state, now);
    els.rushBanner.classList.toggle("hidden", !active);
    if (els.btnSummonRush) {
      els.btnSummonRush.classList.toggle("hidden", active);
      els.btnSummonRush.textContent = `💎${GameConfig.rush.summonGems} 立刻召唤客流高峰`;
      els.btnSummonRush.disabled = state.gems < GameConfig.rush.summonGems;
    }
    if (!active) {
      const wait = Economy.rushNextSec(state, now);
      if (els.comboText) {
        els.comboText.textContent = wait
          ? `下一波客流高峰 ${wait}s`
          : "自动接单中";
      }
      return;
    }
    const cfg = GameConfig.rush;
    const left = Economy.rushLeftSec(state, now);
    const pct = Math.max(0, Math.min(1, left / cfg.durationSec));
    const frenzy = Economy.frenzyActive(state, now);
    els.rushTag.textContent = frenzy ? "爆发中 ×3！" : `客流高峰 ×${cfg.incomeMult}`;
    els.rushBanner.classList.toggle("frenzy", frenzy);
    els.rushTime.textContent = left + "s";
    els.rushCombo.textContent = `连击 ×${state.rush.combo || 0} · 已赚 ${Economy.formatCoins(state.rush.coins || 0)}`;
    els.rushBar.style.width = (pct * 100).toFixed(1) + "%";
    if (els.comboText) els.comboText.textContent = `点客人！已招待 ${state.rush.taps || 0}`;
  }

  function spawnGuestEl(guest) {
    if (!els.guestLayer) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "guest";
    b.dataset.gid = guest.id;
    b.style.left = guest.x + "%";
    b.style.top = guest.y + "%";
    b.style.setProperty("--life", guest.ttl + "s");
    b.innerHTML = `<span class="guest-emoji">${guest.emoji}</span><i class="guest-ring"></i>`;
    b.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (handlers.onTapGuest) handlers.onTapGuest(guest.id);
    });
    els.guestLayer.appendChild(b);
  }

  function removeGuestEl(id, hit) {
    if (!els.guestLayer) return;
    const el = els.guestLayer.querySelector(`[data-gid="${id}"]`);
    if (!el) return;
    if (hit) {
      el.classList.add("hit");
      setTimeout(() => el.remove(), 220);
    } else {
      el.remove();
    }
  }

  function clearGuestEls() {
    if (els.guestLayer) els.guestLayer.innerHTML = "";
  }

  function showChest(chest) {
    if (!els.chestModal || !chest) return;
    els.chestTierTag.textContent = chest.tier.name;
    els.chestBig.textContent = chest.tier.icon;
    els.chestReward.textContent = chest.text;
    els.chestNext.textContent = chest.pass && chest.pass.levels
      ? `通行证升到 ${chest.pass.lv} 级！`
      : "继续点客人、升级店铺，下一个箱子马上就来";
    els.chestModal.classList.remove("hidden");
  }

  function hideChest() {
    if (els.chestModal) els.chestModal.classList.add("hidden");
  }

  // ===================================================================
  // 通行证 / 成长基金 / 每日限定
  // ===================================================================
  function rewardLabel(state, r) {
    if (!r) return "—";
    const parts = [];
    if (r.softSec) parts.push(Economy.formatCoins(Economy.rewardSoft(state, r.softSec)) + "币");
    if (r.gems) parts.push(r.gems + "钻");
    if (r.ticket) parts.push("券×" + r.ticket);
    if (r.theme) parts.push("主题");
    if (r.cosmetic) parts.push("装扮");
    return parts.join(" ") || "—";
  }

  function renderPass(state) {
    if (!els.passRail) return;
    SaveState.ensureMeta(state);
    const p = GameConfig.pass;
    const pass = state.pass;
    if (els.passSeason) els.passSeason.textContent = p.seasonName;
    const need = Economy.passLevelXp(pass.lv);
    const pct = pass.lv >= p.maxLevel ? 1 : Math.min(1, pass.xp / need);
    let claimable = 0;
    for (let lv = 1; lv <= pass.lv; lv++) {
      if (!pass.claimedFree[lv]) claimable += 1;
      if (pass.premium && !pass.claimedPrem[lv]) claimable += 1;
    }
    const prem = GameConfig.products.find((x) => x.id === "pass_premium");
    if (els.passHead) {
      els.passHead.innerHTML = `
        <div class="pass-lv">
          <strong>Lv.${pass.lv}</strong>
          <span>${pass.lv >= p.maxLevel ? "已满级" : `${Math.floor(pass.xp)}/${need} 经验`}</span>
          <div class="pass-xp"><i style="width:${(pct * 100).toFixed(1)}%"></i></div>
        </div>
        <div class="pass-actions">
          <button type="button" class="primary-btn" id="btnPassAll" ${claimable ? "" : "disabled"}>
            ${claimable ? `一键领取 ${claimable} 项` : "暂无可领"}
          </button>
          ${
            pass.premium
              ? `<p class="pass-owned">高级轨已解锁 ✓</p>`
              : `<button type="button" class="gold-btn" id="btnPassBuy">解锁高级轨 · ¥${prem ? prem.priceCny : 30}</button>`
          }
        </div>
        <p class="muted">经验来源：点客人 · 自动成交 · 升级 · 开箱 · 打完高峰 · 每日任务</p>
      `;
      const all = document.getElementById("btnPassAll");
      if (all) all.addEventListener("click", () => handlers.onClaimPassAll && handlers.onClaimPassAll());
      const buy = document.getElementById("btnPassBuy");
      if (buy) buy.addEventListener("click", () => handlers.onBuy && handlers.onBuy("pass_premium"));
    }

    els.passRail.innerHTML = "";
    for (let lv = 1; lv <= p.maxLevel; lv++) {
      const reached = pass.lv >= lv;
      const col = document.createElement("div");
      col.className = "pass-col" + (reached ? " reached" : "") + (pass.lv === lv ? " current" : "");
      const freeR = SaveState.passRewardFor(lv, "free");
      const premR = SaveState.passRewardFor(lv, "prem");
      const freeDone = !!pass.claimedFree[lv];
      const premDone = !!pass.claimedPrem[lv];
      col.innerHTML = `
        <p class="pass-lvtag">${lv}</p>
        <button type="button" class="pass-cell free ${freeDone ? "done" : reached ? "ready" : ""}"
          data-passlv="${lv}" data-track="free" ${!reached || freeDone ? "disabled" : ""}>
          <span>${rewardLabel(state, freeR)}</span>
          <em>${freeDone ? "已领" : reached ? "可领" : "免费轨"}</em>
        </button>
        <button type="button" class="pass-cell prem ${premDone ? "done" : reached && pass.premium ? "ready" : ""}"
          data-passlv="${lv}" data-track="prem" ${!reached || premDone || !pass.premium ? "disabled" : ""}>
          <span>${rewardLabel(state, premR)}</span>
          <em>${premDone ? "已领" : pass.premium ? (reached ? "可领" : "高级轨") : "🔒高级"}</em>
        </button>
      `;
      els.passRail.appendChild(col);
    }
    els.passRail.querySelectorAll("[data-passlv]").forEach((b) => {
      b.addEventListener("click", () => {
        if (handlers.onClaimPass) handlers.onClaimPass(b.dataset.passlv, b.dataset.track);
      });
    });

    renderFund(state);
  }

  function renderFund(state) {
    if (!els.fundBox) return;
    const fund = GameConfig.growthFund;
    const prod = GameConfig.products.find((x) => x.id === fund.productId);
    const rows = SaveState.fundStatus(state);
    const total = fund.milestones.reduce((s, m) => s + m.gems, 0);
    els.fundBox.innerHTML = `
      <p class="fund-head">${state.fund.owned ? "成长基金已激活" : `成长基金 · ¥${prod ? prod.priceCny : 18} → 累计返 ${total} 钻`}</p>
      <div class="fund-rows">
        ${rows
          .map(
            (r) => `
          <button type="button" class="fund-chip ${r.claimed ? "claimed" : r.reached && state.fund.owned ? "ready" : ""}"
            data-fund="${r.lv}" ${!state.fund.owned || !r.reached || r.claimed ? "disabled" : ""}>
            <strong>Lv.${r.lv}</strong><span>${r.claimed ? "已领" : "💎" + r.gems}</span>
          </button>`
          )
          .join("")}
      </div>
      ${state.fund.owned ? "" : `<button type="button" class="gold-btn" id="btnFundBuy">购买成长基金</button>`}
    `;
    els.fundBox.querySelectorAll("[data-fund]").forEach((b) => {
      b.addEventListener("click", () => handlers.onClaimFund && handlers.onClaimFund(b.dataset.fund));
    });
    const buy = document.getElementById("btnFundBuy");
    if (buy) buy.addEventListener("click", () => handlers.onBuy && handlers.onBuy(fund.productId));
  }

  function renderDailyShop(state) {
    if (!els.dailyShopBox) return;
    const items = SaveState.dailyShopItems(state);
    els.dailyShopBox.innerHTML = items
      .map(
        (it) => `
      <button type="button" class="daily-card ${it.bought ? "bought" : ""}" data-daily="${it.id}" ${it.bought ? "disabled" : ""}>
        <span class="daily-ico">${it.icon}</span>
        <strong>${it.name}</strong>
        <em>${it.bought ? "今日已购" : "💎" + it.gemCost}</em>
      </button>`
      )
      .join("");
    els.dailyShopBox.querySelectorAll("[data-daily]").forEach((b) => {
      b.addEventListener("click", () => handlers.onBuyDaily && handlers.onBuyDaily(b.dataset.daily));
    });
  }

  function renderTop(state) {
    const rate = Economy.netCashflowPerSec(state);
    const gross = Economy.grossIncomePerSec(state);
    const opex = Economy.opexBreakdown(state);
    els.softCoins.textContent = Economy.formatCoins(state.softCoins);
    if (els.gems) els.gems.textContent = String(Math.floor(state.gems));
    const flags = [];
    if (state.promoUntil && Date.now() < state.promoUntil) flags.push("引流");
    if (state.boostUntil && Date.now() < state.boostUntil) flags.push("双倍");
    if (state.subscriptionActive) flags.push("月卡");
    if (opex.bill) flags.push(opex.bill.name);
    const sign = rate >= 0 ? "+" : "";
    els.incomeRate.textContent =
      `${sign}${Economy.formatRate(rate)}/秒` + (flags.length ? " · " + flags.join(" ") : "");
    els.incomeRate.classList.toggle("loss", rate < 0);
    els.incomeRate.classList.toggle("profit", rate >= 0);
    els.playerNameLabel.textContent = state.playerName || GameConfig.defaultName;
    els.cityGrade.textContent = `都市评级 ${Economy.cityGrade(state)}`;
    Avatar.renderInto(els.chipAvatar, lookOf(state), "sm");
    const snap = Economy.currentMarketSnapshot();
    if (els.marketHot) {
      const dist = (snap.districts || [])
        .map((d) => `${d.name}${d.mood}×${d.mult.toFixed(2)}`)
        .join(" · ");
      els.marketHot.innerHTML = `${dist}<br/>营收 ${Economy.formatRate(gross)}/秒 − 水电地费 ${Economy.formatRate(opex.total)}/秒${
        opex.bill ? ` · <em class="bill-warn">${opex.bill.name}冲击中</em>` : ""
      }`;
    }
    applyTheme(state);
  }

  function renderCombo(runtime) {
    const c = runtime.combo || 0;
    els.comboText.textContent = c > 1 ? `连击 ×${c}` : "自动接单中";
    els.comboHud.classList.toggle("hot", c >= 3);
    els.skillStats.textContent = `已成交 ${runtime.servedSession || 0}`;
  }

  function buildingTier(level) {
    if (level >= 10) return 3;
    if (level >= 5) return 2;
    return 1;
  }

  function renderCity(state) {
    if (window.World3D && World3D.ready) {
      syncWorld(state);
      return;
    }
    if (!els.cityRow) return;
    els.cityRow.innerHTML = "";
    for (let i = 0; i < 2; i++) {
      const bg = document.createElement("div");
      bg.className = "bldg bg-bldg";
      bg.style.setProperty("--h", `${56 + i * 18}px`);
      els.cityRow.appendChild(bg);
    }
    for (const id of GameConfig.shopOrder) {
      const def = GameConfig.shops[id];
      const shop = state.shops[id];
      const wrap = document.createElement("button");
      wrap.type = "button";
      wrap.className =
        "bldg shop-bldg bldg-" +
        def.building +
        (shop.unlocked ? "" : " is-locked") +
        " tier-" +
        (shop.unlocked ? buildingTier(shop.level) : 0);
      const mkt = Economy.shopMarketMult(id);
      wrap.innerHTML = `
        <div class="bldg-sign">${def.icon}</div>
        <div class="bldg-body"></div>
        <div class="bldg-label">${shop.unlocked ? def.name + " Lv." + shop.level : "筹建"}</div>
        ${shop.unlocked ? `<div class="bldg-mkt">×${mkt.toFixed(2)}</div>` : '<div class="bldg-lock">🔒</div>'}
      `;
      wrap.addEventListener("click", () => {
        showPanel("manage");
        if (!shop.unlocked) toast(Economy.unlockHint(id));
      });
      els.cityRow.appendChild(wrap);
    }
  }

  function ensurePeds() {
    if (window.World3D && World3D.ready) return;
    if (!els.peds || els.peds.dataset.ready) return;
    els.peds.dataset.ready = "1";
    ["🚶", "🚕", "🧍", "🚲"].forEach((k, i) => {
      const p = document.createElement("span");
      p.className = "ped";
      p.textContent = k;
      p.style.setProperty("--dur", `${11 + i * 2}s`);
      p.style.setProperty("--delay", `${-i * 2.2}s`);
      els.peds.appendChild(p);
    });
  }

  function renderBoss(state) {
    if (els.bossFigure) Avatar.renderInto(els.bossFigure, lookOf(state), "lg");
    if (els.modalBoss) Avatar.renderInto(els.modalBoss, lookOf(state), "md");
    if (els.bossSpeech && state.equippedSign) {
      els.bossSpeech.dataset.sign = state.equippedSign;
    }
  }

  function say(text) {
    if (!els.bossSpeech) return;
    els.bossSpeech.textContent = text;
    els.bossSpeech.classList.add("show");
    clearTimeout(speechTimer);
    speechTimer = setTimeout(() => els.bossSpeech.classList.remove("show"), 2600);
  }

  function randomSpeech() {
    const list = GameConfig.speeches;
    say(list[Math.floor(Math.random() * list.length)]);
  }

  function spawnOrderEl(order) {
    if (!els.orders) return null;
    const el = document.createElement("div");
    el.className = "customer auto-order";
    el.dataset.id = order.id;
    el.style.left = order.x + "%";
    el.innerHTML = `
      <span class="cust-bubble">成交中</span>
      <span class="cust-body">${order.emoji}</span>
      <span class="cust-timer"><i style="animation-duration:${order.ttl}s"></i></span>
    `;
    els.orders.appendChild(el);
    return el;
  }

  function removeOrderEl(id) {
    if (!els.orders) return;
    const el = els.orders.querySelector(`[data-id="${id}"]`);
    if (el) el.remove();
  }

  function spawnFloat(amount, xPct) {
    if (!els.floatLayer || Math.abs(amount) < 0.3) return;
    const n = document.createElement("span");
    const neg = amount < 0;
    n.className = "float-coin" + (neg ? " loss" : "");
    n.textContent =
      (neg ? "" : "+") + Economy.formatCoins(neg ? Math.ceil(amount) : Math.max(1, Math.floor(amount)));
    n.style.left = (xPct != null ? xPct : 30 + Math.random() * 40) + "%";
    els.floatLayer.appendChild(n);
    setTimeout(() => n.remove(), 900);
  }

  function renderHq(state) {
    if (!els.hqBoard) return;
    SaveState.ensureHq(state);
    const hq = state.hq;
    const floor = Economy.floorDef(state);
    const sign = Economy.signDef(state);
    const nextFloor = GameConfig.hq.floors[hq.floorLv + 1];
    const nextSign = GameConfig.hq.signs[hq.signLv + 1];
    const mult = Economy.hqIncomeMult(state);
    const upgrades = (state.stats && state.stats.upgrades) || 0;

    let html = `
      <div class="hq-hero">
        <h2 class="panel-title">我的店</h2>
        <p class="panel-desc">店内养成是主玩法 · 当前店内加成 ×${mult.toFixed(2)} · 已升级 ${upgrades} 次</p>
        <div class="hq-stats">
          <span>店面 ${floor.name} · 工位 ${hq.staff.length}/${floor.maxStaff}</span>
          <span>招牌 ${sign.name}</span>
        </div>
      </div>
      <div class="hq-cols">
        <div class="hq-card">
          <h3>扩店面（金币）</h3>
          <p class="muted">${floor.desc}</p>
          ${
            nextFloor
              ? `<button type="button" class="primary-btn hq-btn" data-hq="floor">扩建为「${nextFloor.name}」· ${nextFloor.softCost} 币<br/><small>工位 ${nextFloor.maxStaff} · 空间×${nextFloor.spaceMult}</small></button>`
              : `<p class="muted">店面已达最大</p>`
          }
        </div>
        <div class="hq-card">
          <h3>做大招牌（金币）</h3>
          <p class="muted">${sign.desc}</p>
          ${
            nextSign
              ? `<button type="button" class="primary-btn hq-btn" data-hq="sign">升级为「${nextSign.name}」· ${nextSign.softCost} 币<br/><small>吸引×${nextSign.attract}</small></button>`
              : `<p class="muted">招牌已达最大</p>`
          }
        </div>
      </div>
      <h3 class="subhead">设备里程碑</h3>
      <div class="hq-equip" id="hqEquip"></div>
      <h3 class="subhead">员工（钻石雇佣）</h3>
      <div class="hq-staff" id="hqStaffList"></div>
      <div class="hq-hire" id="hqHire"></div>
    `;
    els.hqBoard.innerHTML = html;

    const equipBox = els.hqBoard.querySelector("#hqEquip");
    GameConfig.hq.equipment.forEach((eq) => {
      const owned = !!hq.equipment[eq.id];
      const ready = Economy.reqMet(state, eq.require);
      const row = document.createElement("div");
      row.className = "hq-row" + (owned ? " owned" : ready ? " ready" : "");
      row.innerHTML = `
        <div class="hq-ico">${eq.icon}</div>
        <div>
          <strong>${eq.name}</strong>
          <span>${owned ? "已安装 · 产速 +" + Math.round(eq.incomeBonus * 100) + "%" : eq.desc}</span>
          ${owned ? "" : `<em>${Economy.reqHint(eq.require) || "可领取"}</em>`}
        </div>
        <button type="button" class="mini-btn" data-eq="${eq.id}" ${owned || !ready ? "disabled" : ""}>
          ${owned ? "已有" : ready ? (eq.claimSoft ? `领取 · ${eq.claimSoft}币` : "免费领取") : "未达成"}
        </button>
      `;
      equipBox.appendChild(row);
    });

    const staffBox = els.hqBoard.querySelector("#hqStaffList");
    if (!hq.staff.length) {
      staffBox.innerHTML = `<p class="muted">还没有员工。用钻石招人，扩店才能雇更多。</p>`;
    } else {
      hq.staff.forEach((s) => {
        const typ = GameConfig.hq.staffTypes.find((t) => t.id === s.typeId) || {};
        const cost = Math.ceil(
          GameConfig.hq.staffUpgradeSoft *
            Math.pow(GameConfig.hq.staffUpgradeGrowth, (s.level || 1) - 1)
        );
        const row = document.createElement("div");
        row.className = "hq-row owned";
        row.innerHTML = `
          <div class="hq-ico">${typ.icon || "🧑"}</div>
          <div>
            <strong>${s.name || typ.name} Lv.${s.level || 1}</strong>
            <span>产速加成中 · 金币可加薪升级</span>
          </div>
          <button type="button" class="mini-btn" data-upstaff="${s.uid}">加薪 ${cost}币</button>
        `;
        staffBox.appendChild(row);
      });
    }

    const hireBox = els.hqBoard.querySelector("#hqHire");
    GameConfig.hq.staffTypes.forEach((typ) => {
      const ready = Economy.reqMet(state, typ.require);
      const full = hq.staff.length >= floor.maxStaff;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-card hire-card";
      btn.disabled = !ready || full || state.gems < typ.gemCost;
      btn.dataset.hire = typ.id;
      btn.innerHTML = `
        <strong>${typ.icon} ${typ.name}</strong>
        <span>${typ.desc}</span>
        <em>💎${typ.gemCost}${typ.softHire ? " + " + typ.softHire + "币" : ""} · 产速+${Math.round(typ.incomeBonus * 100)}%</em>
        ${!ready ? `<em>条件：${Economy.reqHint(typ.require)}</em>` : full ? `<em>工位已满，先扩店</em>` : ""}
      `;
      hireBox.appendChild(btn);
    });

    els.hqBoard.querySelectorAll("[data-hq]").forEach((b) => {
      b.addEventListener("click", () => {
        if (b.dataset.hq === "floor" && handlers.onExpandFloor) handlers.onExpandFloor();
        if (b.dataset.hq === "sign" && handlers.onExpandSign) handlers.onExpandSign();
      });
    });
    els.hqBoard.querySelectorAll("[data-eq]").forEach((b) => {
      b.addEventListener("click", () => handlers.onClaimEq && handlers.onClaimEq(b.dataset.eq));
    });
    els.hqBoard.querySelectorAll("[data-hire]").forEach((b) => {
      b.addEventListener("click", () => handlers.onHire && handlers.onHire(b.dataset.hire));
    });
    els.hqBoard.querySelectorAll("[data-upstaff]").forEach((b) => {
      b.addEventListener("click", () => handlers.onUpStaff && handlers.onUpStaff(b.dataset.upstaff));
    });
  }

  function renderShops(state) {
    els.shopGrid.innerHTML = "";
    let lastDistrict = "";
    for (const id of GameConfig.shopOrder) {
      const def = GameConfig.shops[id];
      if (def.district !== lastDistrict) {
        lastDistrict = def.district;
        const h = document.createElement("h3");
        h.className = "district-label";
        h.textContent = GameConfig.districts[def.district].name;
        els.shopGrid.appendChild(h);
      }
      const shop = state.shops[id];
      const card = document.createElement("article");
      card.className = "shop-card" + (shop.unlocked ? "" : " locked");
      card.dataset.id = id;
      const income = Economy.shopIncomePerSec(id, shop.level, state);
      const cost = Economy.upgradeCost(id, shop.level, state);
      const canAfford = shop.unlocked && state.softCoins >= cost;
      const mkt = Economy.shopMarketMult(id);
      card.innerHTML = `
        <div class="shop-icon">${def.icon}</div>
        <div class="shop-body">
          <h3>${def.name}</h3>
          <p class="shop-meta">${
            shop.unlocked
              ? `Lv.${shop.level} · ${Economy.formatRate(income)}/秒 · 行情×${mkt.toFixed(2)}<br/>升级 ${Economy.formatCoins(cost)}`
              : Economy.unlockHint(id)
          }</p>
        </div>
        <div class="shop-actions"></div>
      `;
      const actions = card.querySelector(".shop-actions");
      if (shop.unlocked) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "upgrade-btn" + (canAfford ? " affordable" : "");
        btn.disabled = !canAfford;
        btn.textContent = canAfford
          ? `升级 · ${Economy.formatCoins(cost)}`
          : `差币 · ${Economy.formatCoins(cost)}`;
        btn.addEventListener("click", () => onUpgradeCb && onUpgradeCb(id));
        actions.appendChild(btn);
      } else {
        const lock = document.createElement("div");
        lock.className = "lock-label";
        lock.textContent = "🔒 " + Economy.unlockHint(id);
        actions.appendChild(lock);
      }
      els.shopGrid.appendChild(card);
    }
  }

  function refreshShopButtons(state) {
    els.shopGrid.querySelectorAll(".shop-card").forEach((card) => {
      const id = card.dataset.id;
      const shop = state.shops[id];
      if (!shop || !shop.unlocked) return;
      const cost = Economy.upgradeCost(id, shop.level, state);
      const canAfford = state.softCoins >= cost;
      const btn = card.querySelector(".upgrade-btn");
      if (!btn) return;
      btn.disabled = !canAfford;
      btn.classList.toggle("affordable", canAfford);
      btn.textContent = canAfford
        ? `升级 · ${Economy.formatCoins(cost)}`
        : `差币 · ${Economy.formatCoins(cost)}`;
    });
  }

  function renderSupply(state) {
    if (!els.supplyCard) return;
    const cur = Economy.supplyOf(state);
    const next = GameConfig.supplyLevels[state.supplyLevel + 1];
    els.supplyCard.innerHTML = `
      <strong>供应链：${cur.name}</strong>
      <p>利润 ×${cur.profit.toFixed(2)} · 稳定 ×${cur.stability.toFixed(2)}</p>
      ${
        next
          ? `<button type="button" class="primary-btn" id="btnSupply">升级到 ${next.name} · ${next.cost} 币</button>`
          : `<p class="muted">已达最高渠道</p>`
      }
    `;
    const btn = document.getElementById("btnSupply");
    if (btn) btn.addEventListener("click", () => handlers.onSupply && handlers.onSupply());
  }

  function renderStrategyStrip(state) {
    const p = Economy.pricingOf(state);
    const plan = Economy.planOf(state);
    const spec = Economy.specOf(state);
    els.strategyStrip.innerHTML = `
      <button type="button" class="strip-chip" data-go="strategy">定价：${p.name}</button>
      <button type="button" class="strip-chip" data-go="strategy">方针：${plan.name}</button>
      <button type="button" class="strip-chip" data-go="strategy">${spec ? "专精：" + spec.name : "专精：未选"}</button>
    `;
    els.strategyStrip.querySelectorAll("[data-go]").forEach((b) => {
      b.addEventListener("click", () => {
        showPanel("strategy");
        renderStrategyPanel(state);
      });
    });
  }

  function choiceCard(item, selected, disabled, extra) {
    return `
      <button type="button" class="choice-card${selected ? " selected" : ""}" data-id="${item.id}" ${disabled ? "disabled" : ""}>
        <strong>${item.name}</strong>
        <span>${item.desc}</span>
        ${extra || ""}
      </button>
    `;
  }

  function renderStrategyPanel(state) {
    els.pricingChoices.innerHTML = Object.values(GameConfig.pricing)
      .map((p) => choiceCard(p, state.pricingId === p.id, false))
      .join("");
    els.pricingChoices.querySelectorAll(".choice-card").forEach((btn) => {
      btn.addEventListener("click", () => handlers.onPricing && handlers.onPricing(btn.dataset.id));
    });

    const left = Economy.planSwitchLeft(state);
    els.planCooldown.textContent = left > 0 ? `（冷却 ${left}s）` : "（可切换）";
    els.planChoices.innerHTML = Object.values(GameConfig.plans)
      .map((p) => choiceCard(p, state.planId === p.id, false))
      .join("");
    els.planChoices.querySelectorAll(".choice-card").forEach((btn) => {
      btn.addEventListener("click", () => handlers.onPlan && handlers.onPlan(btn.dataset.id));
    });

    els.specChoices.innerHTML = Object.values(GameConfig.specs)
      .map((s) => {
        const locked = state.specId && state.specId !== s.id;
        const mine = state.specId === s.id;
        const extra = mine
          ? `<em>已选择</em>`
          : `<em>需${GameConfig.shops[s.requireShop].name} Lv.${s.requireLv} · ${s.cost} 币</em>`;
        return choiceCard(s, mine, locked || mine, extra);
      })
      .join("");
    els.specChoices.querySelectorAll(".choice-card:not(:disabled)").forEach((btn) => {
      btn.addEventListener("click", () => handlers.onSpec && handlers.onSpec(btn.dataset.id));
    });

    renderSupply(state);

    const cost = Economy.promoCost(state);
    const now = Date.now();
    const promoOn = state.promoUntil && now < state.promoUntil;
    const cd = Math.max(0, Math.ceil(((state.eventReadyAt || 0) - now) / 1000));
    let status = `启动金约 ${Economy.formatCoins(cost)} · ${GameConfig.events.promo.durationSec}s 自动接单翻倍`;
    if (promoOn) status = `投放中！剩 ${Math.ceil((state.promoUntil - now) / 1000)}s`;
    else if (cd > 0) status = `冷却 ${cd}s`;
    els.eventCard.innerHTML = `
      <strong>${GameConfig.events.promo.name}</strong>
      <p>${GameConfig.events.promo.desc}</p>
      <p class="event-status">${status}</p>
      <button type="button" class="primary-btn" id="btnPromo" ${promoOn || cd > 0 ? "disabled" : ""}>投入引流</button>
    `;
    const promoBtn = document.getElementById("btnPromo");
    if (promoBtn) promoBtn.addEventListener("click", () => handlers.onPromo && handlers.onPromo());
  }

  function buildOptions(container, items, selectedId, onPick, labelFn) {
    if (!container) return;
    container.innerHTML = "";
    items.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt-chip" + (item.id === selectedId ? " selected" : "");
      btn.textContent = labelFn ? labelFn(item) : item.name;
      if (item.color) btn.style.setProperty("--swatch", item.color);
      if (item.body) btn.style.setProperty("--swatch", item.body);
      btn.addEventListener("click", () => onPick(item.id));
      container.appendChild(btn);
    });
  }

  function renderLookEditor(state) {
    draftLook = { ...lookOf(state) };
    els.nameInput.value = state.playerName || GameConfig.defaultName;
    const refresh = () => Avatar.renderInto(els.lookPreview, draftLook, "xl");
    refresh();
    const re = () => {
      buildOptions(els.hairOptions, GameConfig.hairs, draftLook.hair, (id) => {
        draftLook.hair = id;
        re();
        refresh();
      });
      buildOptions(els.outfitOptions, GameConfig.outfits, draftLook.outfit, (id) => {
        draftLook.outfit = id;
        re();
        refresh();
      });
      buildOptions(els.skinOptions, GameConfig.skins, draftLook.skin, (id) => {
        draftLook.skin = id;
        re();
        refresh();
      });
    };
    re();

    if (els.themeOptions) {
      els.themeOptions.innerHTML = "";
      GameConfig.themes.forEach((th) => {
        const owned = (state.ownedThemes || []).includes(th.id);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "opt-chip" + (state.themeId === th.id ? " selected" : "");
        btn.textContent = owned
          ? th.name
          : th.gemCost
            ? `${th.name} · ${th.gemCost}钻`
            : th.iapId
              ? `${th.name} · 商店`
              : th.name;
        btn.addEventListener("click", () => {
          if (handlers.onTheme) handlers.onTheme(th.id);
        });
        els.themeOptions.appendChild(btn);
      });
    }

    if (els.frameOptions) {
      els.frameOptions.innerHTML = "";
      GameConfig.cosmetics
        .filter((c) => c.type === "frame")
        .forEach((c) => {
          const owned = (state.ownedCosmetics || []).includes(c.id);
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "opt-chip" + (state.equippedFrame === c.id ? " selected" : "");
          btn.textContent = owned ? c.name : c.name + "（未解锁）";
          btn.disabled = !owned;
          btn.addEventListener("click", () => {
            state.equippedFrame = c.id;
            SaveState.save(state);
            toast("已装备边框");
            renderTop(state);
          });
          els.frameOptions.appendChild(btn);
        });
    }

    if (els.signOptions) {
      els.signOptions.innerHTML = "";
      GameConfig.cosmetics
        .filter((c) => c.type === "sign")
        .forEach((c) => {
          const owned = (state.ownedCosmetics || []).includes(c.id);
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "opt-chip" + (state.equippedSign === c.id ? " selected" : "");
          btn.textContent = owned
            ? c.name
            : c.gemCost
              ? `${c.name} · ${c.gemCost}钻`
              : `${c.name} · 商店`;
          btn.addEventListener("click", () => {
            if (handlers.onCosmetic) handlers.onCosmetic(c.id);
          });
          els.signOptions.appendChild(btn);
        });
    }
  }

  function getDraftLook() {
    return { playerName: els.nameInput.value, look: { ...draftLook } };
  }

  function renderTasks(state) {
    if (!els.taskList) return;
    SaveState.rollDay(state);
    els.taskList.innerHTML = "";
    GameConfig.dailyTasks.forEach((t) => {
      const prog = state.daily.progress[t.id] || 0;
      const done = prog >= t.target;
      const claimed = !!state.daily.claimed[t.id];
      const row = document.createElement("div");
      row.className = "task-row";
      row.innerHTML = `
        <div>
          <strong>${t.name}</strong>
          <span>${Math.min(prog, t.target)}/${t.target} · 奖 ${t.rewardSoft}币 + ${t.rewardGems}钻</span>
        </div>
        <button type="button" class="mini-btn" data-task="${t.id}" ${!done || claimed ? "disabled" : ""}>
          ${claimed ? "已领" : done ? "领取" : "进行中"}
        </button>
      `;
      els.taskList.appendChild(row);
    });
    els.taskList.querySelectorAll("[data-task]").forEach((btn) => {
      btn.addEventListener("click", () => handlers.onClaimTask && handlers.onClaimTask(btn.dataset.task));
    });
    if (els.btnSubDaily) {
      els.btnSubDaily.disabled = !state.subscriptionActive || !!state.daily.claimed.sub_daily;
      els.btnSubDaily.textContent = state.subscriptionActive
        ? state.daily.claimed.sub_daily
          ? "月卡每日礼已领"
          : "领取月卡每日礼"
        : "开通月卡后可领每日礼";
    }
  }

  function renderStore(state) {
    if (els.iapModeLabel) els.iapModeLabel.textContent = IAP.modeLabel();
    renderDailyShop(state);
    if (!els.shopProducts) return;
    els.shopProducts.innerHTML = "";
    GameConfig.products.forEach((p) => {
      const card = document.createElement("article");
      card.className = "product-card" + (p.tag ? " featured" : "");
      const owned =
        (p.type === "pass" && state.pass && state.pass.premium) ||
        (p.type === "fund" && state.fund && state.fund.owned);
      const doubleHint =
        p.type === "gems" && GameConfig.FIRST_BUY_DOUBLE && !state.firstBuyUsed
          ? `<span class="first-buy">首充双倍 → ${p.gems * 2} 钻</span>`
          : "";
      card.innerHTML = `
        <div>
          ${p.tag ? `<span class="prod-tag">${p.tag}</span>` : ""}
          <strong>${p.name}</strong>
          <p>${p.desc || (p.gems ? `${p.gems} 钻石` : "")}</p>
          ${doubleHint}
          <em>¥${p.priceCny}</em>
        </div>
        <button type="button" class="primary-btn" data-pid="${p.id}" ${owned ? "disabled" : ""}>${owned ? "已拥有" : "购买"}</button>
      `;
      card.querySelector("button").addEventListener("click", () => {
        handlers.onBuy && handlers.onBuy(p.id);
      });
      els.shopProducts.appendChild(card);
    });

    if (els.cosmeticList) {
      els.cosmeticList.innerHTML = `
        <p class="muted">钻石装扮：霓虹招牌 / 暮色与雨夜主题可在形象页用钻购买。加速券在设置或此处购买后使用。</p>
        <button type="button" class="mini-btn" id="btnUseBoost">使用加速券（剩 ${state.boostTickets || 0}）</button>
      `;
      const b = document.getElementById("btnUseBoost");
      if (b) b.addEventListener("click", () => handlers.onBoost && handlers.onBoost());
    }
  }

  function renderNet(state) {
    Net.publish(state);
    if (!els.boardList) return;
    const board = Net.weeklyBoard(boardSort);
    els.boardList.innerHTML = "";
    board.forEach((p, i) => {
      const li = document.createElement("li");
      li.className = "rival-row" + (p.playerId === state.playerId ? " you" : "");
      const score =
        boardSort === "cos"
          ? `装扮 ${p.cosmetics}`
          : `本周 ${Economy.formatCoins(p.weekEarned || 0)}`;
      li.innerHTML = `
        <span class="rank">#${i + 1}</span>
        <span class="r-name">${p.playerName}${p.playerId === state.playerId ? "（我）" : ""}</span>
        <span class="r-stat">${score} · ${p.grade} · 赞${p.likes || 0}</span>
        ${
          p.playerId === state.playerId
            ? ""
            : `<button type="button" class="mini-btn" data-visit="${p.playerId}">参观</button>
               <button type="button" class="like-btn" data-like="${p.playerId}">赞</button>`
        }
      `;
      els.boardList.appendChild(li);
    });
    if (els.visitDetail && visitTarget) {
      const p = Net.getProfile(visitTarget);
      if (p) {
        els.visitDetail.innerHTML = `
          <strong>${p.playerName} 的总部</strong>
          <p>评级 ${p.grade} · ${Economy.formatRate(p.rate)}/秒 · 主题 ${p.themeId}</p>
          <div id="visitAvatar"></div>
          <p class="muted">店铺快照：${Object.entries(p.shops || {})
            .filter(([, s]) => s.unlocked)
            .map(([id, s]) => GameConfig.shops[id].name + " Lv." + s.level)
            .join(" · ")}</p>
        `;
        Avatar.renderInto(document.getElementById("visitAvatar"), p.look || {}, "md");
      }
    }
  }

  function renderHeavy(state) {
    const war = Heavy.warStatus(state);
    if (els.warPanel) {
      if (war.active) {
        els.warPanel.innerHTML = `
          <strong>商战进行中</strong>
          <p>个人贡献 ${Economy.formatCoins(war.personal)} / ${war.goal} · 剩余 ${war.left}s</p>
          <p class="muted">经营与接单都会累加贡献</p>
        `;
      } else if (war.ended) {
        els.warPanel.innerHTML = `
          <strong>商战已结束</strong>
          <p>贡献 ${Economy.formatCoins(war.personal)} / ${war.goal}</p>
          <button type="button" class="primary-btn" id="btnClaimWar" ${war.canClaim ? "" : "disabled"}>
            ${war.canClaim ? "领取商战奖励" : "未达标或已领"}
          </button>
          <button type="button" class="ghost-btn" id="btnStartWar">再开一轮</button>
        `;
      } else {
        els.warPanel.innerHTML = `
          <strong>限时商战</strong>
          <p>1 小时内赚够 ${GameConfig.war.personalGoal} 币，奖励钻石与勋章框</p>
          <button type="button" class="primary-btn" id="btnStartWar">开启商战</button>
        `;
      }
      const sw = document.getElementById("btnStartWar");
      if (sw) sw.addEventListener("click", () => handlers.onStartWar && handlers.onStartWar());
      const cw = document.getElementById("btnClaimWar");
      if (cw) cw.addEventListener("click", () => handlers.onClaimWar && handlers.onClaimWar());
    }

    if (els.guildPanel) {
      const gp = Heavy.guildProgress(state);
      els.guildPanel.innerHTML = `<strong>商盟</strong>`;
      if (gp) {
        els.guildPanel.innerHTML += `
          <p>已加入「${gp.guild.name}」· ${gp.guild.motto}</p>
          <p>盟内周贡献约 ${Economy.formatCoins(gp.sum)} / 目标 ${gp.goal}</p>
          <button type="button" class="ghost-btn" id="btnLeaveGuild">退出商盟</button>
        `;
      } else {
        els.guildPanel.innerHTML += `<p>选择一个商盟（无私聊）</p><div class="choice-grid" id="guildChoices"></div>`;
        const box = document.getElementById("guildChoices");
        GameConfig.guilds.forEach((g) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "choice-card";
          b.innerHTML = `<strong>${g.name}</strong><span>${g.motto}</span>`;
          b.addEventListener("click", () => handlers.onJoinGuild && handlers.onJoinGuild(g.id));
          box.appendChild(b);
        });
      }
      const lg = document.getElementById("btnLeaveGuild");
      if (lg) lg.addEventListener("click", () => handlers.onLeaveGuild && handlers.onLeaveGuild());
    }

    if (els.challengePanel) {
      const targets = Heavy.challengeTargets(state);
      els.challengePanel.innerHTML = `
        <strong>异步竞品挑战</strong>
        <p class="muted">押注后按综合分结算，非实时对战</p>
        <ul class="rival-list" id="challengeList"></ul>
      `;
      const ul = document.getElementById("challengeList");
      targets.forEach((t) => {
        const li = document.createElement("li");
        li.className = "rival-row";
        li.innerHTML = `
          <span class="r-name">${t.playerName}</span>
          <span class="r-stat">${Economy.formatRate(t.rate)}/秒</span>
          <button type="button" class="mini-btn" data-chal="${t.playerId}">挑战</button>
        `;
        ul.appendChild(li);
      });
      ul.querySelectorAll("[data-chal]").forEach((b) => {
        b.addEventListener("click", () => handlers.onChallenge && handlers.onChallenge(b.dataset.chal));
      });
    }

    if (els.auctionPanel) {
      const auc = Heavy.currentAuction();
      els.auctionPanel.innerHTML = `
        <strong>定时拍卖（明码）</strong>
        <p>${auc.name} · ${auc.gemPrice} 钻石 · 剩余约 ${Math.floor(auc.leftSec / 3600)} 小时</p>
        <button type="button" class="primary-btn" id="btnAuction">一口价拍下</button>
      `;
      const ba = document.getElementById("btnAuction");
      if (ba) ba.addEventListener("click", () => handlers.onAuction && handlers.onAuction());
    }
  }

  function showPanel(name) {
    Object.entries(els.panels).forEach(([k, el]) => {
      if (el) el.classList.toggle("active", k === name);
    });
    els.navBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.panel === name);
    });
    if (els.vista) els.vista.classList.toggle("compact", name !== "manage");
  }

  function render(state, onUpgrade) {
    onUpgradeCb = onUpgrade;
    renderTop(state);
    renderCity(state);
    renderBoss(state);
    ensurePeds();
    renderShops(state);
    renderHq(state);
    renderGoal(state);
    renderPlaytime(state);
    renderRush(state);
    renderStrategyStrip(state);
    if (els.panels.pass && els.panels.pass.classList.contains("active")) renderPass(state);
    if (els.panels.strategy && els.panels.strategy.classList.contains("active")) {
      renderStrategyPanel(state);
    }
    if (els.panels.tasks && els.panels.tasks.classList.contains("active")) renderTasks(state);
    if (els.panels.store && els.panels.store.classList.contains("active")) renderStore(state);
    if (els.panels.net && els.panels.net.classList.contains("active")) renderNet(state);
    if (els.panels.heavy && els.panels.heavy.classList.contains("active")) renderHeavy(state);
  }

  function showOfflineModal(reward) {
    pendingOffline = reward;
    const lost = reward.amount < 0;
    els.offlineTime.textContent = reward.capped
      ? `离开了 ${Economy.formatDuration(reward.seconds)}（已达封顶）`
      : `总部运转了 ${Economy.formatDuration(reward.seconds)}`;
    if (reward.billHits) {
      els.offlineTime.textContent += ` · 期间约 ${reward.billHits} 次账单`;
    }
    els.offlineAmount.textContent =
      (lost ? "" : "+") + Economy.formatCoins(reward.amount);
    els.offlineAmount.classList.toggle("loss", lost);
    const note = els.offlineModal.querySelector(".modal-note");
    if (note) {
      note.textContent = lost
        ? "淡市 + 水电地费，本轮净亏损，点确认结算"
        : "点领取入账（已扣运营成本）";
    }
    const title = els.offlineModal.querySelector("h2");
    if (title) title.textContent = lost ? "营业亏损报告" : "营业报告";
    els.offlineAmount.classList.remove("pulse");
    void els.offlineAmount.offsetWidth;
    els.offlineAmount.classList.add("pulse");
    els.offlineModal.classList.remove("hidden");
  }

  function hideOfflineModal() {
    els.offlineModal.classList.add("hidden");
    pendingOffline = null;
  }

  function getPendingOffline() {
    return pendingOffline;
  }

  function showSettings(open) {
    els.settingsModal.classList.toggle("hidden", !open);
  }

  function showShock(hit) {
    if (!els.shockModal) return;
    const loss = hit.type === "bill";
    els.shockCard.classList.toggle("is-loss", loss);
    els.shockCard.classList.toggle("is-boom", !loss);
    els.shockTag.textContent = loss ? "巨额扣款" : "暴赚到账";
    els.shockTitle.textContent = hit.name;
    els.shockSub.textContent = loss
      ? `约抽走资产的 ${hit.pct}% —— 一眼就能看见少了一大截`
      : `约暴增资产的 ${hit.pct}% —— 大起大落才有生意感`;
    els.shockBefore.textContent = Economy.formatCoins(hit.before);
    els.shockAfter.textContent = Economy.formatCoins(hit.after);
    els.shockDelta.textContent =
      (loss ? "-" : "+") + Economy.formatCoins(hit.paid);
    els.shockModal.classList.remove("hidden");
    if (els.softCoins) {
      els.softCoins.classList.remove("coin-shock", "coin-boom");
      void els.softCoins.offsetWidth;
      els.softCoins.classList.add(loss ? "coin-shock" : "coin-boom");
    }
  }

  function hideShock() {
    if (els.shockModal) els.shockModal.classList.add("hidden");
  }

  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.add("hidden"), 2200);
  }

  function setVisitTarget(id) {
    visitTarget = id;
  }

  function setBoardSort(s) {
    boardSort = s;
  }

  return {
    cache,
    setHandlers,
    getHandlers: () => handlers,
    render,
    renderTop,
    refreshShopButtons,
    renderLookEditor,
    renderStrategyPanel,
    renderTasks,
    renderStore,
    renderNet,
    renderHeavy,
    renderCombo,
    getDraftLook,
    showPanel,
    showOfflineModal,
    hideOfflineModal,
    getPendingOffline,
    showShock,
    hideShock,
    renderGoal,
    renderChestRing,
    renderPlaytime,
    renderRush,
    renderPass,
    renderFund,
    renderDailyShop,
    spawnGuestEl,
    removeGuestEl,
    clearGuestEls,
    showChest,
    hideChest,
    showVisitShop,
    hideVisitShop,
    syncWorld,
    buildStreetSlots,
    renderHq,
    showSettings,
    toast,
    say,
    randomSpeech,
    spawnFloat,
    spawnOrderEl,
    removeOrderEl,
    setVisitTarget,
    setBoardSort,
    get els() {
      return els;
    },
  };
})();
