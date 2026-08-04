/**
 * 都市大亨 — 重联机（本地模拟：商战、公会、异步竞品挑战、定时拍卖展示）
 */
const Heavy = (() => {
  function joinGuild(state, guildId) {
    const g = GameConfig.guilds.find((x) => x.id === guildId);
    if (!g) return { ok: false, reason: "商盟不存在" };
    state.guildId = guildId;
    SaveState.save(state);
    Net.publish(state);
    return { ok: true, guild: g };
  }

  function leaveGuild(state) {
    state.guildId = null;
    SaveState.save(state);
    Net.publish(state);
    return { ok: true };
  }

  function startWar(state, nowMs = Date.now()) {
    if (state.war && state.war.active && nowMs < state.war.endsAt) {
      return { ok: false, reason: "商战进行中" };
    }
    state.war = {
      active: true,
      startedAt: nowMs,
      endsAt: nowMs + GameConfig.war.durationSec * 1000,
      personal: 0,
      claimed: false,
    };
    SaveState.save(state);
    return { ok: true, endsAt: state.war.endsAt };
  }

  function warStatus(state, nowMs = Date.now()) {
    if (!state.war || !state.war.active) return { active: false };
    if (nowMs >= state.war.endsAt) {
      return {
        active: false,
        ended: true,
        personal: state.war.personal,
        goal: GameConfig.war.personalGoal,
        canClaim: !state.war.claimed && state.war.personal >= GameConfig.war.personalGoal,
      };
    }
    return {
      active: true,
      left: Math.ceil((state.war.endsAt - nowMs) / 1000),
      personal: state.war.personal,
      goal: GameConfig.war.personalGoal,
    };
  }

  function claimWarReward(state, nowMs = Date.now()) {
    const st = warStatus(state, nowMs);
    if (!st.ended || !st.canClaim) return { ok: false, reason: "未达成或已领取" };
    state.war.claimed = true;
    state.war.active = false;
    state.gems += GameConfig.war.rewardGems;
    const frame = GameConfig.war.rewardFrame;
    if (!(state.ownedCosmetics || []).includes(frame)) state.ownedCosmetics.push(frame);
    state.equippedFrame = frame;
    SaveState.save(state);
    return { ok: true, gems: GameConfig.war.rewardGems };
  }

  function guildProgress(state) {
    if (!state.guildId) return null;
    const db = Net.loadDb();
    let sum = 0;
    let members = 0;
    Object.values(db.profiles).forEach((p) => {
      if (p.guildId === state.guildId) {
        members += 1;
        sum += p.weekEarned || 0;
      }
    });
    // 加上本机商战贡献的估算
    if (state.war) sum += state.war.personal || 0;
    return {
      guild: GameConfig.guilds.find((g) => g.id === state.guildId),
      members,
      sum,
      goal: GameConfig.war.guildGoal,
    };
  }

  function challengeTargets(state) {
    return Net.listVisitTargets(state).slice(0, 8);
  }

  function startChallenge(state, targetId, nowMs = Date.now()) {
    if (nowMs < (state.challengeCooldownUntil || 0)) {
      const left = Math.ceil((state.challengeCooldownUntil - nowMs) / 1000);
      return { ok: false, reason: `冷却 ${left}s` };
    }
    const target = Net.getProfile(targetId);
    if (!target) return { ok: false, reason: "目标不存在" };
    const myRate = Economy.totalIncomePerSec(state);
    const stake = Math.ceil(Math.max(10, myRate) * GameConfig.challenge.stakeMult);
    if (state.softCoins < stake) return { ok: false, reason: `需要押注 ${stake} 币` };

    state.softCoins -= stake;
    // 异步结算：比较本周营收与产速的综合分
    const myScore = myRate * 10 + (state.weekEarned || 0) * 0.02 + Math.random() * 5;
    const theirScore =
      (target.rate || 1) * 10 + (target.weekEarned || 0) * 0.02 + Math.random() * 5;
    const win = myScore >= theirScore;
    let payout = 0;
    if (win) {
      payout = Math.floor(stake * GameConfig.challenge.winMult);
      SaveState.addSoft(state, payout);
      state.challengeWins = (state.challengeWins || 0) + 1;
    }
    state.challengeCooldownUntil = nowMs + GameConfig.challenge.cooldownSec * 1000;
    SaveState.save(state);
    Net.publish(state);
    return {
      ok: true,
      win,
      stake,
      payout,
      targetName: target.playerName,
      myScore: myScore.toFixed(1),
      theirScore: theirScore.toFixed(1),
    };
  }

  /** 定时拍卖：展示向，明码一口价用钻石竞得（非随机抽） */
  function currentAuction(nowMs = Date.now()) {
    const slot = Math.floor(nowMs / (6 * 3600 * 1000)); // 每 6 小时一轮
    const items = [
      { id: "auc_neon", name: "限时霓虹招牌", gemPrice: 35, unlockCosmetic: "sign_neon" },
      { id: "auc_dusk", name: "暮色主题快拍", gemPrice: 45, unlockTheme: "dusk" },
      { id: "auc_rain", name: "雨夜主题快拍", gemPrice: 55, unlockTheme: "rain" },
    ];
    const item = items[slot % items.length];
    const endsAt = (slot + 1) * 6 * 3600 * 1000;
    return { ...item, slot, endsAt, leftSec: Math.max(0, Math.ceil((endsAt - nowMs) / 1000)) };
  }

  function buyAuction(state, nowMs = Date.now()) {
    const auc = currentAuction(nowMs);
    if (state.gems < auc.gemPrice) return { ok: false, reason: "钻石不足" };
    if (auc.unlockCosmetic) {
      if ((state.ownedCosmetics || []).includes(auc.unlockCosmetic)) {
        return { ok: false, reason: "已拥有" };
      }
      state.gems -= auc.gemPrice;
      state.ownedCosmetics.push(auc.unlockCosmetic);
      state.equippedSign = auc.unlockCosmetic;
    } else if (auc.unlockTheme) {
      if ((state.ownedThemes || []).includes(auc.unlockTheme)) {
        return { ok: false, reason: "已拥有" };
      }
      state.gems -= auc.gemPrice;
      state.ownedThemes.push(auc.unlockTheme);
      state.themeId = auc.unlockTheme;
    }
    SaveState.save(state);
    return { ok: true, item: auc.name };
  }

  return {
    joinGuild,
    leaveGuild,
    startWar,
    warStatus,
    claimWarReward,
    guildProgress,
    challengeTargets,
    startChallenge,
    currentAuction,
    buyAuction,
  };
})();
