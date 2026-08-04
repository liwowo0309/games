/**
 * 街区小老板 — UI
 */
const UI = (() => {
  const els = {};
  let toastTimer = null;
  let pendingOffline = null;
  let speechTimer = null;
  let draftLook = null;
  let onUpgradeCb = null;
  let handlers = {};

  function cache() {
    [
      "softCoins", "incomeRate", "shopGrid", "offlineModal", "offlineTime",
      "offlineAmount", "btnClaimOffline", "settingsModal", "btnSettings",
      "btnResetSave", "btnCloseSettings", "btnOfflineEntry", "toast",
      "chipAvatar", "playerNameLabel", "streetGrade", "btnBoss", "cityRow",
      "peds", "customers", "bossFigure", "bossSpeech", "floatLayer", "streetHint",
      "lookPreview", "nameInput", "hairOptions", "outfitOptions", "skinOptions",
      "btnSaveLook", "cardAvatar", "cardName", "cardStats", "btnCopyCard",
      "rivalList", "modalBoss", "mainScroll", "vista", "comboHud", "comboText",
      "skillStats", "strategyStrip", "pricingChoices", "planChoices",
      "specChoices", "eventCard", "planCooldown",
    ].forEach((id) => {
      els[id] = document.getElementById(id);
    });
    els.panels = {
      manage: document.getElementById("panelManage"),
      strategy: document.getElementById("panelStrategy"),
      look: document.getElementById("panelLook"),
      plaza: document.getElementById("panelPlaza"),
    };
    els.navBtns = Array.from(document.querySelectorAll(".nav-btn[data-panel]"));
  }

  function setHandlers(h) {
    handlers = h || {};
  }

  function lookOf(state) {
    return state.look || { hair: "short", outfit: "tee", skin: "fair" };
  }

  function renderTop(state) {
    const rate = Economy.totalIncomePerSec(state);
    els.softCoins.textContent = Economy.formatCoins(state.softCoins);
    const promoOn = state.promoUntil && Date.now() < state.promoUntil;
    els.incomeRate.textContent =
      `+${Economy.formatRate(rate)}/秒` + (promoOn ? " · 促销中" : "");
    els.playerNameLabel.textContent = state.playerName || GameConfig.defaultName;
    els.streetGrade.textContent = `街区评级 ${Economy.streetGrade(state)}`;
    Avatar.renderInto(els.chipAvatar, lookOf(state), "sm");
  }

  function renderCombo(runtime) {
    const c = runtime.combo || 0;
    els.comboText.textContent = c > 1 ? `连击 ×${c}` : "接待客人赚外快";
    els.comboHud.classList.toggle("hot", c >= 3);
    els.skillStats.textContent = `接待 ${runtime.servedSession || 0} · 漏单 ${runtime.missedSession || 0}`;
  }

  function buildingTier(level) {
    if (level >= 10) return 3;
    if (level >= 5) return 2;
    return 1;
  }

  function renderCity(state) {
    els.cityRow.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const bg = document.createElement("div");
      bg.className = "bldg bg-bldg";
      bg.style.setProperty("--h", `${48 + i * 14}px`);
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
      wrap.innerHTML = `
        <div class="bldg-sign">${def.icon}</div>
        <div class="bldg-body"></div>
        <div class="bldg-awning"></div>
        <div class="bldg-door"></div>
        <div class="bldg-label">${shop.unlocked ? def.name + " Lv." + shop.level : "筹建中"}</div>
        ${shop.unlocked ? '<div class="bldg-smoke"></div>' : '<div class="bldg-lock">🔒</div>'}
      `;
      wrap.addEventListener("click", () => {
        showPanel("manage");
        if (!shop.unlocked) toast(Economy.unlockHint(id));
      });
      els.cityRow.appendChild(wrap);
    }
    const plot = document.createElement("div");
    plot.className = "bldg empty-plot";
    plot.innerHTML = `<div class="plot-fence"></div><div class="bldg-label">空地</div>`;
    els.cityRow.appendChild(plot);
  }

  function ensurePeds() {
    if (els.peds.dataset.ready) return;
    els.peds.dataset.ready = "1";
    const kinds = ["🚶", "🧍", "🐕", "🚲"];
    for (let i = 0; i < 4; i++) {
      const p = document.createElement("span");
      p.className = "ped";
      p.textContent = kinds[i % kinds.length];
      p.style.setProperty("--dur", `${10 + i * 2.2}s`);
      p.style.setProperty("--delay", `${-i * 2.5}s`);
      p.style.setProperty("--y", `${4 + (i % 3) * 3}px`);
      els.peds.appendChild(p);
    }
  }

  function renderBoss(state) {
    Avatar.renderInto(els.bossFigure, lookOf(state), "lg");
    Avatar.renderInto(els.modalBoss, lookOf(state), "md");
  }

  function say(text) {
    els.bossSpeech.textContent = text;
    els.bossSpeech.classList.add("show");
    clearTimeout(speechTimer);
    speechTimer = setTimeout(() => els.bossSpeech.classList.remove("show"), 2600);
  }

  function randomSpeech() {
    const list = GameConfig.speeches;
    say(list[Math.floor(Math.random() * list.length)]);
  }

  function spawnFloat(amount, xPct) {
    if (amount < 0.3) return;
    const n = document.createElement("span");
    n.className = "float-coin";
    n.textContent = "+" + Economy.formatCoins(Math.max(1, Math.floor(amount)));
    n.style.left = (xPct != null ? xPct : 30 + Math.random() * 40) + "%";
    els.floatLayer.appendChild(n);
    setTimeout(() => n.remove(), 900);
  }

  function spawnCustomerEl(customer, onTap) {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "customer";
    el.dataset.id = customer.id;
    el.style.left = customer.x + "%";
    el.innerHTML = `
      <span class="cust-bubble">点我!</span>
      <span class="cust-body">${customer.emoji}</span>
      <span class="cust-timer"><i style="animation-duration:${customer.ttl}s"></i></span>
    `;
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      onTap(customer.id);
    });
    els.customers.appendChild(el);
    return el;
  }

  function removeCustomerEl(id) {
    const el = els.customers.querySelector(`[data-id="${id}"]`);
    if (el) el.remove();
  }

  function renderShops(state) {
    els.shopGrid.innerHTML = "";
    for (const id of GameConfig.shopOrder) {
      const def = GameConfig.shops[id];
      const shop = state.shops[id];
      const card = document.createElement("article");
      card.className = "shop-card" + (shop.unlocked ? "" : " locked");
      card.dataset.id = id;
      const income = Economy.shopIncomePerSec(id, shop.level);
      const cost = Economy.upgradeCost(id, shop.level, state);
      const canAfford = shop.unlocked && state.softCoins >= cost;
      card.innerHTML = `
        <div class="shop-icon">${def.icon}</div>
        <div class="shop-body">
          <h3>${def.name}</h3>
          <p class="shop-meta">${
            shop.unlocked
              ? `Lv.${shop.level} · 基础 ${Economy.formatRate(income)}/秒<br/>升级 ${Economy.formatCoins(cost)}`
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
          ? `升级装修 · ${Economy.formatCoins(cost)}`
          : `还差币 · ${Economy.formatCoins(cost)}`;
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
        ? `升级装修 · ${Economy.formatCoins(cost)}`
        : `还差币 · ${Economy.formatCoins(cost)}`;
    });
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
    els.planCooldown.textContent = left > 0 ? `（切换冷却 ${left}s）` : "（可切换）";
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
          : `<em>需小摊 Lv.${s.requireStallLv} · ${s.cost} 币</em>`;
        return choiceCard(s, mine, locked || mine, extra);
      })
      .join("");
    els.specChoices.querySelectorAll(".choice-card:not(:disabled)").forEach((btn) => {
      btn.addEventListener("click", () => handlers.onSpec && handlers.onSpec(btn.dataset.id));
    });

    const cost = Economy.promoCost(state);
    const now = Date.now();
    const promoOn = state.promoUntil && now < state.promoUntil;
    const cd = Math.max(0, Math.ceil(((state.eventReadyAt || 0) - now) / 1000));
    let status = `启动金约 ${Economy.formatCoins(cost)} 币 · 45 秒接待翻倍`;
    if (promoOn) status = `促销进行中！剩余 ${Math.ceil((state.promoUntil - now) / 1000)} 秒`;
    else if (cd > 0) status = `冷却中 ${cd} 秒后再来`;
    els.eventCard.innerHTML = `
      <strong>${GameConfig.events.promo.name}</strong>
      <p>${GameConfig.events.promo.desc}</p>
      <p class="event-status">${status}</p>
      <button type="button" class="primary-btn" id="btnPromo" ${promoOn || cd > 0 ? "disabled" : ""}>投入启动促销</button>
    `;
    const promoBtn = document.getElementById("btnPromo");
    if (promoBtn) promoBtn.addEventListener("click", () => handlers.onPromo && handlers.onPromo());
  }

  function buildOptions(container, items, selectedId, onPick) {
    container.innerHTML = "";
    items.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt-chip" + (item.id === selectedId ? " selected" : "");
      btn.textContent = item.name;
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
  }

  function getDraftLook() {
    return { playerName: els.nameInput.value, look: { ...draftLook } };
  }

  function renderPlaza(state) {
    const rate = Economy.totalIncomePerSec(state);
    const grade = Economy.streetGrade(state);
    Avatar.renderInto(els.cardAvatar, lookOf(state), "md");
    els.cardName.textContent = state.playerName || GameConfig.defaultName;
    els.cardStats.textContent = `评级 ${grade} · ${Economy.formatRate(rate)}/秒 · 最佳连击×${state.bestCombo || 0}`;

    const mine = {
      name: state.playerName || GameConfig.defaultName,
      rate,
      grade,
      isYou: true,
    };
    const rows = [...GameConfig.rivals, mine].sort((a, b) => b.rate - a.rate);
    els.rivalList.innerHTML = "";
    rows.forEach((r, i) => {
      const li = document.createElement("li");
      li.className = "rival-row" + (r.isYou ? " you" : "");
      const liked = !r.isYou && state.likesGiven[r.name];
      li.innerHTML = `
        <span class="rank">#${i + 1}</span>
        <span class="r-name">${r.name}${r.isYou ? "（我）" : ""}</span>
        <span class="r-stat">${Economy.formatRate(r.rate)}/秒 · ${r.grade}</span>
        ${r.isYou ? "" : `<button type="button" class="like-btn${liked ? " on" : ""}" data-name="${r.name}">${liked ? "已赞" : "赞"}</button>`}
      `;
      els.rivalList.appendChild(li);
    });
  }

  function showPanel(name) {
    Object.entries(els.panels).forEach(([k, el]) => {
      el.classList.toggle("active", k === name);
    });
    els.navBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.panel === name);
    });
    els.vista.classList.toggle("compact", name !== "manage");
  }

  function render(state, onUpgrade) {
    onUpgradeCb = onUpgrade;
    renderTop(state);
    renderCity(state);
    renderBoss(state);
    ensurePeds();
    renderShops(state);
    renderStrategyStrip(state);
    if (els.panels.strategy.classList.contains("active")) renderStrategyPanel(state);
    if (els.panels.plaza.classList.contains("active")) renderPlaza(state);
  }

  function showOfflineModal(reward) {
    pendingOffline = reward;
    els.offlineTime.textContent = reward.capped
      ? `离开了 ${Economy.formatDuration(reward.seconds)}（已达封顶）`
      : `店员帮你看了 ${Economy.formatDuration(reward.seconds)}`;
    els.offlineAmount.textContent = "+" + Economy.formatCoins(reward.amount);
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

  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.add("hidden"), 2000);
  }

  return {
    cache,
    setHandlers,
    render,
    renderTop,
    refreshShopButtons,
    renderLookEditor,
    renderPlaza,
    renderStrategyPanel,
    renderCombo,
    getDraftLook,
    showPanel,
    showOfflineModal,
    hideOfflineModal,
    getPendingOffline,
    showSettings,
    toast,
    say,
    randomSpeech,
    spawnFloat,
    spawnCustomerEl,
    removeCustomerEl,
    get els() {
      return els;
    },
  };
})();
