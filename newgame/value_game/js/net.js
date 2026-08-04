/**
 * 都市大亨 — 轻联机（本地模拟云：可替换为 Firebase 等 BaaS）
 * 能力：游客云存档、周榜、参观、点赞（日限额）
 */
const Net = (() => {
  function loadDb() {
    try {
      const raw = localStorage.getItem(GameConfig.NET_DB_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return seedDb();
  }

  function seedDb() {
    const bots = [
      { name: "港湾资本", rate: 6, week: 4200, cos: 4, grade: "C", themeId: "day", look: { hair: "slick", outfit: "blazer", skin: "warm" } },
      { name: "霓虹咖啡", rate: 18, week: 9800, cos: 6, grade: "B", themeId: "dusk", look: { hair: "wave", outfit: "casual", skin: "fair" } },
      { name: "数码前线", rate: 45, week: 22000, cos: 8, grade: "A", themeId: "rain", look: { hair: "side", outfit: "ceo", skin: "deep" } },
      { name: "物流王", rate: 70, week: 36000, cos: 9, grade: "A", themeId: "day", look: { hair: "bun", outfit: "shirt", skin: "warm" } },
      { name: "金街控股", rate: 120, week: 58000, cos: 12, grade: "S", themeId: "gold", look: { hair: "slick", outfit: "ceo", skin: "fair" } },
    ].map((b, i) => ({
      playerId: "bot_" + i,
      playerName: b.name,
      rate: b.rate,
      weekEarned: b.week,
      cosmetics: b.cos,
      grade: b.grade,
      themeId: b.themeId,
      look: b.look,
      likes: 3 + i * 2,
      isBot: true,
      shops: snapshotShopsFromRate(b.rate),
    }));
    const db = { profiles: {}, updatedAt: Date.now() };
    bots.forEach((b) => {
      db.profiles[b.playerId] = b;
    });
    saveDb(db);
    return db;
  }

  function snapshotShopsFromRate(rate) {
    const shops = {};
    let remain = rate;
    for (const id of GameConfig.shopOrder) {
      const unlocked = remain > 2;
      const level = unlocked ? Math.max(1, Math.min(20, Math.floor(remain / 5))) : 0;
      shops[id] = { unlocked, level };
      if (unlocked) remain *= 0.55;
    }
    return shops;
  }

  function saveDb(db) {
    db.updatedAt = Date.now();
    localStorage.setItem(GameConfig.NET_DB_KEY, JSON.stringify(db));
  }

  function ensurePlayer(state) {
    const db = loadDb();
    publish(state, db);
    return db;
  }

  function publish(state, db) {
    db = db || loadDb();
    db.profiles[state.playerId] = {
      playerId: state.playerId,
      playerName: state.playerName,
      rate: Economy.totalIncomePerSec(state),
      weekEarned: state.weekEarned || 0,
      cosmetics: Economy.cosmeticsCollected(state),
      grade: Economy.cityGrade(state),
      themeId: state.themeId,
      look: { ...state.look },
      equippedFrame: state.equippedFrame,
      equippedSign: state.equippedSign,
      likes: (db.profiles[state.playerId] && db.profiles[state.playerId].likes) || 0,
      shops: JSON.parse(JSON.stringify(state.shops)),
      guildId: state.guildId,
      title: state.title || "",
      isBot: false,
      updatedAt: Date.now(),
    };
    saveDb(db);
    localStorage.setItem(
      GameConfig.CLOUD_KEY + "_" + state.playerId,
      JSON.stringify({
        savedAt: Date.now(),
        softCoins: state.softCoins,
        gems: state.gems,
        shops: state.shops,
        look: state.look,
        themeId: state.themeId,
        weekEarned: state.weekEarned,
      })
    );
    return db.profiles[state.playerId];
  }

  function pullCloud(state) {
    try {
      const raw = localStorage.getItem(GameConfig.CLOUD_KEY + "_" + state.playerId);
      if (!raw) return { ok: false, reason: "无云存档" };
      const cloud = JSON.parse(raw);
      return { ok: true, cloud };
    } catch (_) {
      return { ok: false, reason: "云存档损坏" };
    }
  }

  function weeklyBoard(sortBy = "week") {
    const db = loadDb();
    const list = Object.values(db.profiles);
    list.sort((a, b) => {
      if (sortBy === "cos") return (b.cosmetics || 0) - (a.cosmetics || 0);
      return (b.weekEarned || 0) - (a.weekEarned || 0);
    });
    return list.slice(0, 20);
  }

  function getProfile(playerId) {
    return loadDb().profiles[playerId] || null;
  }

  function likeProfile(state, targetId) {
    SaveState.rollDay(state);
    if (targetId === state.playerId) return { ok: false, reason: "不能赞自己" };
    if (state.likesToday.count >= GameConfig.LIKE_DAILY_CAP) {
      return { ok: false, reason: `今日点赞已达 ${GameConfig.LIKE_DAILY_CAP} 次` };
    }
    const db = loadDb();
    const p = db.profiles[targetId];
    if (!p) return { ok: false, reason: "玩家不存在" };
    const key = targetId + "_" + state.likesToday.day;
    if (state.likesGiven[key]) return { ok: false, reason: "今日已赞过" };
    state.likesGiven[key] = true;
    state.likesToday.count += 1;
    p.likes = (p.likes || 0) + 1;
    saveDb(db);
    SaveState.save(state);
    return { ok: true, likes: p.likes };
  }

  function listVisitTargets(state) {
    return weeklyBoard("week").filter((p) => p.playerId !== state.playerId);
  }

  return {
    ensurePlayer,
    publish,
    pullCloud,
    weeklyBoard,
    getProfile,
    likeProfile,
    listVisitTargets,
    loadDb,
  };
})();
