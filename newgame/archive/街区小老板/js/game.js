/**
 * 街区小老板 — 主循环（含接待与策略）
 */
(function boot() {
  let state = SaveState.load();
  let lastTick = performance.now();
  let saveAccum = 0;
  let floatAccum = 0;
  let speechAccum = 0;
  let spawnAccum = 0;
  let custId = 1;

  const runtime = {
    combo: 0,
    comboTimer: 0,
    customers: [],
    servedSession: 0,
    missedSession: 0,
  };

  function refreshAll() {
    UI.render(state, onUpgrade);
    UI.renderCombo(runtime);
  }

  function onUpgrade(shopId) {
    const beforeTea = state.shops.tea && state.shops.tea.unlocked;
    const ok = SaveState.tryUpgrade(state, shopId);
    if (!ok) {
      UI.toast("币不够：去接待客人，或换「省钱装修」方针");
      return;
    }
    UI.say(`${GameConfig.shops[shopId].name} 升级！`);
    UI.spawnFloat(8);
    if (!beforeTea && state.shops.tea.unlocked) {
      UI.toast("奶茶店开业！精品价更吃香了");
    } else {
      UI.toast(`${GameConfig.shops[shopId].name} → Lv.${state.shops[shopId].level}`);
    }
    refreshAll();
  }

  function onPricing(id) {
    if (SaveState.setPricing(state, id)) {
      const p = GameConfig.pricing[id];
      UI.toast(`定价改为「${p.name}」`);
      UI.say(p.desc);
      refreshAll();
      UI.renderStrategyPanel(state);
    }
  }

  function onPlan(id) {
    const res = SaveState.setPlan(state, id);
    if (!res.ok) {
      UI.toast(res.reason);
      return;
    }
    UI.toast(`方针：${GameConfig.plans[id].name}`);
    UI.say(GameConfig.plans[id].desc);
    refreshAll();
    UI.renderStrategyPanel(state);
  }

  function onSpec(id) {
    const res = SaveState.unlockSpec(state, id);
    if (!res.ok) {
      UI.toast(res.reason);
      return;
    }
    UI.toast(`专精锁定：${GameConfig.specs[id].name}`);
    UI.say("专精选好就不能改了，想清楚！");
    refreshAll();
    UI.renderStrategyPanel(state);
  }

  function onPromo() {
    const res = SaveState.startPromo(state);
    if (!res.ok) {
      UI.toast(res.reason);
      return;
    }
    UI.toast(`促销启动！花了 ${res.cost} 币`);
    UI.say("快接待！翻倍只有一会儿");
    refreshAll();
    UI.renderStrategyPanel(state);
  }

  function serveCustomer(id) {
    const idx = runtime.customers.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const c = runtime.customers[idx];
    runtime.customers.splice(idx, 1);
    UI.removeCustomerEl(id);

    if (runtime.comboTimer > 0) runtime.combo = Math.min(GameConfig.COMBO_MAX, runtime.combo + 1);
    else runtime.combo = 1;
    runtime.comboTimer = GameConfig.COMBO_WINDOW_SEC;

    const tip = Economy.customerTip(state, runtime.combo);
    SaveState.addSoft(state, tip);
    SaveState.recordServe(state, runtime.combo);
    runtime.servedSession += 1;
    UI.spawnFloat(tip, c.x);
    if (runtime.combo >= 4) UI.say(`连击 ×${runtime.combo}！`);
    UI.renderTop(state);
    UI.renderCombo(runtime);
    UI.refreshShopButtons(state);
  }

  function missCustomer(c) {
    UI.removeCustomerEl(c.id);
    runtime.combo = 0;
    runtime.comboTimer = 0;
    SaveState.recordMiss(state);
    runtime.missedSession += 1;
    UI.renderCombo(runtime);
    if (runtime.missedSession % 3 === 0) UI.toast("漏单打断连击——精品价更怕漏");
  }

  function spawnCustomer() {
    if (runtime.customers.length >= 3) return;
    const emoji =
      GameConfig.customerEmojis[Math.floor(Math.random() * GameConfig.customerEmojis.length)];
    const customer = {
      id: String(custId++),
      emoji,
      x: 28 + Math.random() * 52,
      ttl: GameConfig.CUSTOMER_TTL_SEC,
      life: GameConfig.CUSTOMER_TTL_SEC,
    };
    runtime.customers.push(customer);
    UI.spawnCustomerEl(customer, serveCustomer);
  }

  function claimOffline() {
    const pending = UI.getPendingOffline();
    if (!pending || pending.amount <= 0) {
      UI.hideOfflineModal();
      return;
    }
    SaveState.claimOffline(state, pending.amount);
    UI.hideOfflineModal();
    UI.say("方针若是挂机托底，这次会更多");
    UI.toast(`领取 ${Economy.formatCoins(pending.amount)} 街区币`);
    UI.spawnFloat(pending.amount);
    refreshAll();
  }

  function checkOfflineOnBoot() {
    const now = Date.now();
    const reward = Economy.calcOfflineReward(state, now);
    if (reward.seconds < GameConfig.OFFLINE_MIN_SECONDS || reward.amount < 1) {
      state.lastSeenAt = now;
      SaveState.save(state);
      UI.say("点客人、调定价，别只会挂机！");
      return;
    }
    UI.showOfflineModal(reward);
  }

  function showOfflinePreview() {
    UI.showSettings(false);
    const now = Date.now();
    const reward = Economy.calcOfflineReward(state, now);
    if (reward.amount < 1) {
      UI.toast(`离开后最多累计 ${GameConfig.OFFLINE_CAP_HOURS} 小时（受方针影响）`);
      return;
    }
    UI.showOfflineModal(reward);
  }

  function bind() {
    UI.setHandlers({ onPricing, onPlan, onSpec, onPromo });
    UI.els.btnClaimOffline.addEventListener("click", claimOffline);
    UI.els.btnSettings.addEventListener("click", () => UI.showSettings(true));
    UI.els.btnCloseSettings.addEventListener("click", () => UI.showSettings(false));
    UI.els.btnOfflineEntry.addEventListener("click", showOfflinePreview);
    UI.els.btnResetSave.addEventListener("click", () => {
      if (!confirm("确定重置？专精与进度都会清空。")) return;
      state = SaveState.reset();
      runtime.combo = 0;
      runtime.customers = [];
      UI.els.customers.innerHTML = "";
      UI.showSettings(false);
      UI.hideOfflineModal();
      UI.toast("重新开街");
      refreshAll();
      lastTick = performance.now();
    });
    UI.els.btnBoss.addEventListener("click", () => {
      UI.showPanel("look");
      UI.renderLookEditor(state);
    });
    UI.els.btnSaveLook.addEventListener("click", () => {
      SaveState.saveLook(state, UI.getDraftLook());
      UI.toast("形象已保存");
      refreshAll();
    });
    UI.els.btnCopyCard.addEventListener("click", async () => {
      const rate = Economy.totalIncomePerSec(state);
      const text = `【街区小老板】${state.playerName}｜评级 ${Economy.streetGrade(state)}｜${Economy.formatRate(rate)}/秒｜最佳连击×${state.bestCombo || 0}`;
      try {
        await navigator.clipboard.writeText(text);
        UI.toast("名片已复制");
      } catch {
        UI.toast(text);
      }
    });

    UI.els.navBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const panel = btn.dataset.panel;
        UI.showPanel(panel);
        if (panel === "look") UI.renderLookEditor(state);
        if (panel === "plaza") UI.renderPlaza(state);
        if (panel === "strategy") UI.renderStrategyPanel(state);
      });
    });

    UI.els.rivalList.addEventListener("click", (e) => {
      const btn = e.target.closest(".like-btn");
      if (!btn) return;
      const on = SaveState.toggleLike(state, btn.dataset.name);
      UI.toast(on ? "已点赞" : "取消点赞");
      UI.renderPlaza(state);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        SaveState.save(state);
      } else {
        lastTick = performance.now();
        const now = Date.now();
        const reward = Economy.calcOfflineReward(state, now);
        if (reward.seconds >= GameConfig.OFFLINE_MIN_SECONDS && reward.amount >= 1) {
          UI.showOfflineModal(reward);
        } else {
          state.lastSeenAt = now;
          SaveState.save(state);
        }
        refreshAll();
      }
    });

    window.addEventListener("beforeunload", () => SaveState.save(state));
  }

  function tick(now) {
    const dt = Math.min(1, (now - lastTick) / 1000);
    lastTick = now;
    const modalOpen = !UI.els.offlineModal.classList.contains("hidden");

    if (!modalOpen) {
      const gained = SaveState.tickIncome(state, dt);
      floatAccum += gained;
      if (floatAccum >= 15) {
        UI.spawnFloat(floatAccum);
        floatAccum = 0;
      }

      // combo window
      if (runtime.comboTimer > 0) {
        runtime.comboTimer -= dt;
        if (runtime.comboTimer <= 0) {
          runtime.combo = 0;
          UI.renderCombo(runtime);
        }
      }

      // customers life
      for (let i = runtime.customers.length - 1; i >= 0; i--) {
        const c = runtime.customers[i];
        c.life -= dt;
        if (c.life <= 0) {
          runtime.customers.splice(i, 1);
          missCustomer(c);
        }
      }

      spawnAccum += dt;
      const interval = Economy.customerSpawnInterval(state);
      if (spawnAccum >= interval) {
        spawnAccum = 0;
        spawnCustomer();
      }

      saveAccum += dt;
      speechAccum += dt;
      if (saveAccum >= 5) {
        SaveState.save(state);
        saveAccum = 0;
      }
      if (speechAccum >= 20) {
        UI.randomSpeech();
        speechAccum = 0;
      }
    }

    UI.renderTop(state);
    if (!tick._acc) tick._acc = 0;
    tick._acc += dt;
    if (tick._acc >= 0.4) {
      tick._acc = 0;
      if (UI.els.panels.manage.classList.contains("active")) {
        UI.refreshShopButtons(state);
      }
      if (UI.els.panels.strategy.classList.contains("active")) {
        UI.renderStrategyPanel(state);
      }
    }
    requestAnimationFrame(tick);
  }

  UI.cache();
  SaveState.applyUnlocks(state);
  bind();
  refreshAll();
  checkOfflineOnBoot();
  requestAnimationFrame(tick);
})();
