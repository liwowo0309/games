/**
 * 都市大亨 — 主循环
 */
(function boot() {
  let state = SaveState.load();
  let lastTick = performance.now();
  let saveAccum = 0;
  let floatAccum = 0;
  let speechAccum = 0;
  let spawnAccum = 0;
  let orderId = 1;
  let guestId = 1;
  let guestAccum = 0;
  let playAccum = 0;
  let goalAccum = 0;
  let wasRush = false;

  const GUEST_EMOJIS = ["🧑‍💼", "👩‍💻", "🧳", "🧑‍🎓", "👨‍🍳", "🙋", "🧑‍🔧", "👩‍🎤"];

  const runtime = {
    combo: 0,
    comboTimer: 0,
    orders: [],
    guests: [],
    pendingChests: [],
    servedSession: 0,
    missedSession: 0,
  };

  /** 高峰中先攒着，等结束再弹开箱，避免打断点击 */
  function handleChest(chest) {
    if (!chest) return;
    if (Economy.rushActive(state)) {
      runtime.pendingChests.push(chest);
      UI.toast(`${chest.tier.name}到手：${chest.text}`);
      return;
    }
    UI.showChest(chest);
  }

  function flushChests() {
    if (!runtime.pendingChests.length) return;
    const chest = runtime.pendingChests.shift();
    UI.showChest(chest);
  }

  function notePass(pass) {
    if (pass && pass.levels) {
      UI.toast(`通行证升到 Lv.${pass.lv}！去通行证页领奖`);
      UI.say(`通行证 ${pass.lv} 级，奖励别忘了领。`);
    }
  }

  function spawnGuest() {
    if (runtime.guests.length >= GameConfig.rush.maxOnScreen) return;
    const ttl = GameConfig.rush.guestLifeSec;
    const guest = {
      id: String(guestId++),
      emoji: GUEST_EMOJIS[Math.floor(Math.random() * GUEST_EMOJIS.length)],
      x: 6 + Math.random() * 60,
      y: 22 + Math.random() * 40,
      ttl,
      life: ttl,
    };
    runtime.guests.push(guest);
    UI.spawnGuestEl(guest);
  }

  function tapGuest(id) {
    const idx = runtime.guests.findIndex((g) => g.id === id);
    if (idx < 0) return;
    const g = runtime.guests[idx];
    runtime.guests.splice(idx, 1);
    UI.removeGuestEl(id, true);
    const res = SaveState.tapGuest(state);
    UI.spawnFloat(res.coins, g.x);
    if (res.frenzyStarted) {
      UI.toast(`连击 ${res.combo}！爆发 ×${GameConfig.rush.frenzyMult}`);
      UI.say("爆发！这波别停手！");
    }
    handleChest(res.chest);
    notePass(res.pass);
    UI.renderTop(state);
    UI.renderRush(state);
    UI.renderChestRing(state);
  }

  function clearGuests() {
    runtime.guests = [];
    UI.clearGuestEls();
  }

  function refreshAll() {
    UI.render(state, onUpgrade);
    UI.renderCombo(runtime);
  }

  function onUpgrade(shopId) {
    const before = {};
    GameConfig.shopOrder.forEach((id) => {
      before[id] = state.shops[id] && state.shops[id].unlocked;
    });
    const ok = SaveState.tryUpgrade(state, shopId);
    if (!ok) {
      UI.toast("币不够：等自动接单，或换「精简扩张」");
      return;
    }
    UI.say(`${GameConfig.shops[shopId].name} 升级！`);
    UI.spawnFloat(10);
    handleChest(ok.chest);
    notePass(ok.pass);
    for (const id of GameConfig.shopOrder) {
      if (!before[id] && state.shops[id].unlocked) {
        UI.toast(`${GameConfig.shops[id].name} 开业！`);
        break;
      }
    }
    Net.publish(state);
    refreshAll();
  }

  function onPricing(id) {
    if (SaveState.setPricing(state, id)) {
      UI.toast(`定价：${GameConfig.pricing[id].name}`);
      UI.say(GameConfig.pricing[id].desc);
      refreshAll();
      UI.renderStrategyPanel(state);
    }
  }

  function onPlan(id) {
    const res = SaveState.setPlan(state, id);
    if (!res.ok) return UI.toast(res.reason);
    UI.toast(`方针：${GameConfig.plans[id].name}`);
    refreshAll();
    UI.renderStrategyPanel(state);
  }

  function onSpec(id) {
    const res = SaveState.unlockSpec(state, id);
    if (!res.ok) return UI.toast(res.reason);
    UI.toast(`专精：${GameConfig.specs[id].name}`);
    refreshAll();
    UI.renderStrategyPanel(state);
  }

  function onPromo() {
    const res = SaveState.startPromo(state);
    if (!res.ok) return UI.toast(res.reason);
    UI.toast(`引流启动，花费 ${res.cost}`);
    refreshAll();
    UI.renderStrategyPanel(state);
  }

  function onSupply() {
    const res = SaveState.upgradeSupply(state);
    if (!res.ok) return UI.toast(res.reason);
    UI.toast(`供应链 → ${res.name}`);
    refreshAll();
    UI.renderStrategyPanel(state);
  }

  function onTheme(themeId) {
    const th = GameConfig.themes.find((t) => t.id === themeId);
    if (!th) return;
    if ((state.ownedThemes || []).includes(themeId)) {
      SaveState.setTheme(state, themeId);
      UI.toast("主题已切换");
      refreshAll();
      UI.renderLookEditor(state);
      return;
    }
    if (th.gemCost) {
      const res = SaveState.buyThemeGems(state, themeId);
      UI.toast(res.ok ? "主题已购买" : res.reason);
      refreshAll();
      UI.renderLookEditor(state);
      return;
    }
    if (th.iapId) {
      UI.toast("请到商店购买该主题");
      UI.showPanel("store");
      UI.renderStore(state);
    }
  }

  function onCosmetic(cosId) {
    const cos = GameConfig.cosmetics.find((c) => c.id === cosId);
    if (!cos) return;
    if ((state.ownedCosmetics || []).includes(cosId)) {
      if (cos.type === "sign") state.equippedSign = cosId;
      if (cos.type === "frame") state.equippedFrame = cosId;
      SaveState.save(state);
      UI.toast("已装备");
      refreshAll();
      UI.renderLookEditor(state);
      return;
    }
    if (cos.gemCost) {
      const res = SaveState.buyCosmeticGems(state, cosId);
      UI.toast(res.ok ? "已购买" : res.reason);
      refreshAll();
      UI.renderLookEditor(state);
      return;
    }
    UI.toast("请到商店购买");
    UI.showPanel("store");
  }

  function serveOrder(id) {
    const idx = runtime.orders.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const c = runtime.orders[idx];
    runtime.orders.splice(idx, 1);
    UI.removeOrderEl(id);

    if (runtime.comboTimer > 0) runtime.combo = Math.min(GameConfig.COMBO_MAX, runtime.combo + 1);
    else runtime.combo = 1;
    runtime.comboTimer = GameConfig.COMBO_WINDOW_SEC;

    const tip = Economy.orderTip(state, runtime.combo);
    SaveState.addSoft(state, tip);
    handleChest(SaveState.recordServe(state, runtime.combo));
    runtime.servedSession += 1;
    UI.spawnFloat(tip, c.x);
    if (runtime.combo >= 4) UI.say(`连击 ×${runtime.combo}！`);
    UI.renderTop(state);
    UI.renderCombo(runtime);
    UI.refreshShopButtons(state);
  }

  function spawnOrder() {
    if (runtime.orders.length >= 3) return;
    const emoji =
      GameConfig.orderEmojis[Math.floor(Math.random() * GameConfig.orderEmojis.length)];
    const delay = GameConfig.AUTO_SERVE_DELAY_SEC;
    const order = {
      id: String(orderId++),
      emoji,
      x: 26 + Math.random() * 54,
      ttl: delay,
      life: delay,
    };
    runtime.orders.push(order);
    UI.spawnOrderEl(order);
  }

  function claimOffline() {
    const pending = UI.getPendingOffline();
    if (!pending) {
      UI.hideOfflineModal();
      return;
    }
    SaveState.claimOffline(state, pending.amount);
    UI.hideOfflineModal();
    if (pending.amount < 0) {
      UI.toast(`结算亏损 ${Economy.formatCoins(pending.amount)}`);
      UI.say("账单和淡市刮走一笔……挺住！");
    } else {
      UI.toast(`领取 ${Economy.formatCoins(pending.amount)} 都市币`);
    }
    UI.spawnFloat(pending.amount);
    Net.publish(state);
    refreshAll();
  }

  function checkOfflineOnBoot() {
    const now = Date.now();
    const reward = Economy.calcOfflineReward(state, now);
    if (reward.seconds < GameConfig.OFFLINE_MIN_SECONDS || Math.abs(reward.amount) < 1) {
      state.lastSeenAt = now;
      SaveState.save(state);
      UI.say("城区会涨跌，水电地费也会扣——盯紧现金流。");
      return;
    }
    UI.showOfflineModal(reward);
  }

  function bind() {
    UI.setHandlers({
      onPricing,
      onPlan,
      onSpec,
      onPromo,
      onSupply,
      onTheme,
      onCosmetic,
      onClaimTask: (id) => {
        const res = SaveState.claimDaily(state, id);
        UI.toast(res.ok ? `任务奖励 +${res.soft}币 +${res.gems}钻` : res.reason);
        UI.renderTasks(state);
        refreshAll();
      },
      onBuy: (pid) => {
        const res = IAP.purchase(state, pid);
        UI.toast(res.ok ? res.message : res.reason);
        Net.publish(state);
        refreshAll();
        UI.renderStore(state);
      },
      onBoost: () => {
        const res = SaveState.useBoostTicket(state);
        UI.toast(res.ok ? `双倍产出 ${res.sec} 秒` : res.reason);
        refreshAll();
        UI.renderStore(state);
      },
      onStartWar: () => {
        const res = Heavy.startWar(state);
        UI.toast(res.ok ? "商战开始！" : res.reason);
        UI.renderHeavy(state);
      },
      onClaimWar: () => {
        const res = Heavy.claimWarReward(state);
        UI.toast(res.ok ? `获得 ${res.gems} 钻石与勋章框` : res.reason);
        refreshAll();
        UI.renderHeavy(state);
      },
      onJoinGuild: (gid) => {
        const res = Heavy.joinGuild(state, gid);
        UI.toast(res.ok ? `加入 ${res.guild.name}` : res.reason);
        UI.renderHeavy(state);
      },
      onLeaveGuild: () => {
        Heavy.leaveGuild(state);
        UI.toast("已退出商盟");
        UI.renderHeavy(state);
      },
      onChallenge: (tid) => {
        const res = Heavy.startChallenge(state, tid);
        if (!res.ok) return UI.toast(res.reason);
        UI.toast(
          res.win
            ? `战胜 ${res.targetName}！净赚 ${res.payout - res.stake}`
            : `惜败 ${res.targetName}，损失押注 ${res.stake}`
        );
        refreshAll();
        UI.renderHeavy(state);
      },
      onAuction: () => {
        const res = Heavy.buyAuction(state);
        UI.toast(res.ok ? `拍得：${res.item}` : res.reason);
        refreshAll();
        UI.renderHeavy(state);
      },
      onVisitBuy: (slot, item) => {
        if (state.softCoins < item.cost) {
          UI.toast("都市币不够");
          return;
        }
        SaveState.addSoft(state, -item.cost);
        SaveState.save(state);
        UI.toast(`在「${slot.name}」点了 ${item.name}`);
        UI.say(`${slot.ownerName}：欢迎光临！`);
        UI.spawnFloat(-item.cost);
        refreshAll();
      },
      onExpandFloor: () => {
        const res = SaveState.expandFloor(state);
        if (!res.ok) return UI.toast(res.reason);
        UI.toast(`店面扩建：${res.name}（工位 ${res.maxStaff}）`);
        UI.say("地方变大了，可以多雇人！");
        refreshAll();
      },
      onExpandSign: () => {
        const res = SaveState.expandSign(state);
        if (!res.ok) return UI.toast(res.reason);
        UI.toast(`招牌升级：${res.name}`);
        UI.say("招牌更大，街上更显眼！");
        refreshAll();
      },
      onClaimEq: (id) => {
        const res = SaveState.claimEquipment(state, id);
        if (!res.ok) return UI.toast(res.reason);
        UI.toast(`获得设备：${res.name}`);
        UI.say(id === "coffee_machine" ? "咖啡机到货！可以招咖啡师了" : `${res.name}安装完成`);
        refreshAll();
      },
      onHire: (typeId) => {
        const res = SaveState.hireStaff(state, typeId);
        if (!res.ok) return UI.toast(res.reason);
        UI.toast(`花 ${res.gemCost} 钻雇了${res.name}`);
        UI.say("新人报到！钻石花得值");
        refreshAll();
      },
      onUpStaff: (uid) => {
        const res = SaveState.upgradeStaff(state, uid);
        if (!res.ok) return UI.toast(res.reason);
        UI.toast(`员工升到 Lv.${res.level}（花 ${res.cost} 币）`);
        refreshAll();
      },
      onTapGuest: tapGuest,
      onClaimGoal: () => {
        const res = SaveState.claimGoal(state);
        if (!res.ok) return UI.toast(res.reason);
        UI.toast(`目标完成：${res.text}`);
        UI.say("目标达成！下一个马上开始。");
        UI.spawnFloat(res.got.soft);
        notePass(res.pass);
        Net.publish(state);
        refreshAll();
      },
      onSkipGoal: () => {
        const res = SaveState.skipGoal(state);
        if (!res.ok) return UI.toast(res.reason);
        UI.toast(`花 ${res.gems} 钻直接完成：${res.text}`);
        notePass(res.pass);
        refreshAll();
      },
      onOpenChest: () => {
        const res = SaveState.openChestInstant(state);
        if (!res.ok) return UI.toast(res.reason);
        if (res.gems) UI.toast(`花 ${res.gems} 钻立刻开箱`);
        handleChest(res.chest);
        refreshAll();
      },
      onClaimPlaytime: (min) => {
        const res = SaveState.claimPlaytime(state, min);
        if (!res.ok) return UI.toast(res.reason);
        UI.toast(`在线奖励：${res.text}`);
        UI.spawnFloat(res.got.soft);
        if (res.chest) handleChest(res.chest);
        refreshAll();
      },
      onClaimPass: (lv, track) => {
        const res = SaveState.claimPassReward(state, lv, track);
        if (!res.ok) return UI.toast(res.reason);
        UI.toast(`通行证 ${lv} 级：${res.text}`);
        refreshAll();
        UI.renderPass(state);
      },
      onClaimPassAll: () => {
        const res = SaveState.claimAllPass(state);
        if (!res.ok) return UI.toast(res.reason);
        UI.toast(`领取 ${res.count} 项：${res.text}`);
        refreshAll();
        UI.renderPass(state);
      },
      onClaimFund: (lv) => {
        const res = SaveState.claimFund(state, lv);
        if (!res.ok) return UI.toast(res.reason);
        UI.toast(`成长基金返还 ${res.gems} 钻`);
        refreshAll();
        UI.renderPass(state);
      },
      onBuyDaily: (id) => {
        const res = SaveState.buyDailyShop(state, id);
        if (!res.ok) return UI.toast(res.reason);
        UI.toast(`${res.name}：${res.text}`);
        refreshAll();
        UI.renderStore(state);
      },
    });

    if (window.World3D) {
      World3D.setHandlers({
        onEnterOwn: (slot) => {
          UI.showPanel("manage");
          UI.toast(`回到自家「${slot.name}」· 扩店 / 招人 / 领设备`);
          UI.say("店长回来了！先看看设备里程碑");
          if (World3D.focusShop) World3D.focusShop(slot.id);
          const board = document.getElementById("hqBoard");
          if (board) board.scrollIntoView({ behavior: "smooth", block: "start" });
        },
        onEnterOther: (slot) => {
          UI.showVisitShop(slot);
        },
      });
    }
    UI.els.btnClaimOffline.addEventListener("click", claimOffline);
    if (UI.els.btnGoalClaim) {
      UI.els.btnGoalClaim.addEventListener("click", () => UI.getHandlers().onClaimGoal());
    }
    if (UI.els.btnGoalSkip) {
      UI.els.btnGoalSkip.addEventListener("click", () => UI.getHandlers().onSkipGoal());
    }
    if (UI.els.chestRing) {
      UI.els.chestRing.addEventListener("click", () => UI.getHandlers().onOpenChest());
    }
    if (UI.els.btnSummonRush) {
      UI.els.btnSummonRush.addEventListener("click", () => {
        const res = SaveState.summonRush(state);
        if (!res.ok) return UI.toast(res.reason);
        wasRush = true;
        guestAccum = 0;
        UI.toast(`花 ${res.gems} 钻召唤第 ${res.wave} 波高峰！`);
        UI.say("高峰提前来了，点客人！");
        refreshAll();
      });
    }
    if (UI.els.btnCloseChest) {
      UI.els.btnCloseChest.addEventListener("click", () => {
        UI.hideChest();
        flushChests();
        refreshAll();
      });
    }
    if (UI.els.btnCloseShock) {
      UI.els.btnCloseShock.addEventListener("click", () => UI.hideShock());
    }
    if (UI.els.btnCloseVisit) {
      UI.els.btnCloseVisit.addEventListener("click", () => UI.hideVisitShop());
    }
    UI.els.btnSettings.addEventListener("click", () => UI.showSettings(true));
    UI.els.btnCloseSettings.addEventListener("click", () => UI.showSettings(false));
    UI.els.btnOfflineEntry.addEventListener("click", () => {
      UI.showSettings(false);
      const reward = Economy.calcOfflineReward(state, Date.now());
      if (reward.amount === 0 || Math.abs(reward.amount) < 1) {
        UI.toast(`离线会算水电地费；最长 ${GameConfig.OFFLINE_CAP_HOURS} 小时（月卡 8 小时）`);
        return;
      }
      UI.showOfflineModal(reward);
    });
    UI.els.btnResetSave.addEventListener("click", () => {
      if (!confirm("确定重置全部进度？")) return;
      state = SaveState.reset();
      runtime.combo = 0;
      runtime.orders = [];
      runtime.pendingChests = [];
      clearGuests();
      wasRush = false;
      if (UI.els.orders) UI.els.orders.innerHTML = "";
      UI.showSettings(false);
      UI.hideOfflineModal();
      Net.publish(state);
      UI.toast("重新起步");
      refreshAll();
      UI.syncWorld(state);
      lastTick = performance.now();
    });

    UI.els.btnBoss.addEventListener("click", () => {
      UI.showPanel("look");
      UI.renderLookEditor(state);
    });
    UI.els.btnSaveLook.addEventListener("click", () => {
      SaveState.saveLook(state, UI.getDraftLook());
      Net.publish(state);
      UI.toast("形象已保存");
      refreshAll();
    });

    if (UI.els.btnSubDaily) {
      UI.els.btnSubDaily.addEventListener("click", () => {
        const res = SaveState.claimSubDaily(state);
        UI.toast(res.ok ? `每日礼 +${res.soft}币 +${res.gems}钻` : res.reason);
        UI.renderTasks(state);
        refreshAll();
      });
    }

    if (UI.els.btnCloudSync) {
      UI.els.btnCloudSync.addEventListener("click", () => {
        Net.publish(state);
        UI.toast("已同步到云存档（本机模拟）");
      });
    }
    if (UI.els.btnPullCloud) {
      UI.els.btnPullCloud.addEventListener("click", () => {
        const res = Net.pullCloud(state);
        UI.toast(res.ok ? `云存档时间：${new Date(res.cloud.savedAt).toLocaleString()}` : res.reason);
      });
    }
    if (UI.els.boardSortWeek) {
      UI.els.boardSortWeek.addEventListener("click", () => {
        UI.setBoardSort("week");
        UI.renderNet(state);
      });
    }
    if (UI.els.boardSortCos) {
      UI.els.boardSortCos.addEventListener("click", () => {
        UI.setBoardSort("cos");
        UI.renderNet(state);
      });
    }

    UI.els.navBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const panel = btn.dataset.panel;
        UI.showPanel(panel);
        if (panel === "look") UI.renderLookEditor(state);
        if (panel === "strategy") UI.renderStrategyPanel(state);
        if (panel === "tasks") UI.renderTasks(state);
        if (panel === "pass") UI.renderPass(state);
        if (panel === "store") UI.renderStore(state);
        if (panel === "net") UI.renderNet(state);
        if (panel === "heavy") UI.renderHeavy(state);
      });
    });

    document.getElementById("panelNet").addEventListener("click", (e) => {
      const visit = e.target.closest("[data-visit]");
      if (visit) {
        UI.setVisitTarget(visit.dataset.visit);
        UI.renderNet(state);
        UI.toast("正在参观");
      }
      const like = e.target.closest("[data-like]");
      if (like) {
        const res = Net.likeProfile(state, like.dataset.like);
        UI.toast(res.ok ? `点赞成功（总赞 ${res.likes}）` : res.reason);
        UI.renderNet(state);
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        SaveState.save(state);
        Net.publish(state);
      } else {
        lastTick = performance.now();
        const now = Date.now();
        const reward = Economy.calcOfflineReward(state, now);
        if (reward.seconds >= GameConfig.OFFLINE_MIN_SECONDS && Math.abs(reward.amount) >= 1) {
          UI.showOfflineModal(reward);
        } else {
          state.lastSeenAt = now;
          SaveState.save(state);
        }
        refreshAll();
      }
    });

    window.addEventListener("beforeunload", () => {
      SaveState.save(state);
      Net.publish(state);
    });
  }

  /** 客流高峰：到点开波、波中生成顾客、超时的客人流失、结束结算 */
  function tickRush(dt) {
    const nowMs = Date.now();
    const active = Economy.rushActive(state, nowMs);

    if (!active && !wasRush) {
      if (!state.rush.nextAt) SaveState.scheduleRush(state, nowMs);
      if (nowMs >= state.rush.nextAt) {
        const res = SaveState.startRush(state, nowMs);
        wasRush = true;
        guestAccum = 0;
        UI.toast(`第 ${res.wave} 波客流高峰！点客人赚大钱（${res.sec} 秒）`);
        UI.say("高峰来了！手别停，连击有爆发！");
        UI.renderRush(state);
        return;
      }
      return;
    }

    if (active) {
      wasRush = true;
      const cfg = GameConfig.rush;
      const past = 1 - Economy.rushLeftSec(state, nowMs) / cfg.durationSec;
      const rate = cfg.spawnPerSec * (1 + past * cfg.spawnRamp);
      guestAccum += dt * rate;
      while (guestAccum >= 1) {
        guestAccum -= 1;
        spawnGuest();
      }
      for (let i = runtime.guests.length - 1; i >= 0; i--) {
        const g = runtime.guests[i];
        g.life -= dt;
        if (g.life <= 0) {
          runtime.guests.splice(i, 1);
          UI.removeGuestEl(g.id, false);
        }
      }
      return;
    }

    // 刚刚结束
    wasRush = false;
    clearGuests();
    const res = SaveState.endRush(state, nowMs);
    UI.toast(`高峰结束：招待 ${res.taps} 人，赚 ${Economy.formatCoins(res.coins)} · ${res.text}`);
    UI.say(res.taps > 25 ? "这波打得漂亮！" : "下波再多点几个客人。");
    notePass(res.pass);
    if (res.chest) runtime.pendingChests.push(res.chest);
    flushChests();
    refreshAll();
  }

  function tick(now) {
    const dt = Math.min(1, (now - lastTick) / 1000);
    lastTick = now;
    const modalOpen = !UI.els.offlineModal.classList.contains("hidden");

    if (!modalOpen) {
      const billHit = SaveState.maybeTriggerBill(state);
      if (billHit) {
        if (billHit.type === "bill") {
          UI.say(`${billHit.name}！金币被砍一刀！`);
          UI.spawnFloat(-billHit.paid);
        } else {
          UI.say(`${billHit.name}！大笔进账！`);
          UI.spawnFloat(billHit.paid);
        }
        UI.showShock(billHit);
        refreshAll();
      }

      const gained = SaveState.tickIncome(state, dt);
      floatAccum += gained;
      if (floatAccum >= 18) {
        UI.spawnFloat(floatAccum);
        floatAccum = 0;
      } else if (floatAccum <= -12) {
        UI.spawnFloat(floatAccum);
        floatAccum = 0;
      }

      if (runtime.comboTimer > 0) {
        runtime.comboTimer -= dt;
        if (runtime.comboTimer <= 0) {
          runtime.combo = 0;
          UI.renderCombo(runtime);
        }
      }

      for (let i = runtime.orders.length - 1; i >= 0; i--) {
        const c = runtime.orders[i];
        c.life -= dt;
        if (c.life <= 0) {
          serveOrder(c.id);
        }
      }

      spawnAccum += dt;
      if (spawnAccum >= Economy.orderSpawnInterval(state)) {
        spawnAccum = 0;
        spawnOrder();
      }

      // 今日累计在线时长（做在线奖励梯度）
      playAccum += dt;
      if (playAccum >= 1) {
        SaveState.addPlaytime(state, playAccum);
        playAccum = 0;
      }

      tickRush(dt);

      saveAccum += dt;
      speechAccum += dt;
      if (saveAccum >= 5) {
        SaveState.save(state);
        saveAccum = 0;
      }
      if (speechAccum >= 22) {
        UI.randomSpeech();
        speechAccum = 0;
      }
    }

    UI.renderTop(state);
    UI.renderRush(state);
    if (window.World3D && World3D.ready) World3D.tick();
    if (!tick._acc) tick._acc = 0;
    tick._acc += dt;
    if (tick._acc >= 0.45) {
      tick._acc = 0;
      if (UI.els.panels.manage.classList.contains("active")) UI.refreshShopButtons(state);
      if (UI.els.panels.strategy.classList.contains("active")) UI.renderStrategyPanel(state);
    }
    goalAccum += dt;
    if (goalAccum >= 1) {
      goalAccum = 0;
      UI.renderGoal(state);
      UI.renderPlaytime(state);
    }
    requestAnimationFrame(tick);
  }

  UI.cache();
  SaveState.applyUnlocks(state);
  Net.ensurePlayer(state);
  if (window.World3D) {
    World3D.init(document.getElementById("vista"));
  }
  bind();
  refreshAll();
  UI.syncWorld(state);
  checkOfflineOnBoot();
  requestAnimationFrame(tick);
})();
