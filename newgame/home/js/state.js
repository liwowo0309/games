const LifeState = (() => {
  const KEY = "english_life_home_v1";

  function weekKey(now = new Date()) {
    const date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const day = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
    return date.getUTCFullYear() + "-W" + String(week).padStart(2, "0");
  }

  function empty() {
    return {
      name: "",
      grade: 2,
      captions: true,
      cloudAsr: false,
      createdAt: Date.now(),
      speakCount: 0,
      speakWeek: weekKey(),
      album: [],
      done: {},
      lastFood: "",
      lastSpoken: "",
      turns: {},
      coins: 8,
      bag: []
    };
  }

  let data = empty();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) data = Object.assign(empty(), JSON.parse(raw));
    } catch (err) {
      data = empty();
    }
    rollWeek();
    return data;
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function rollWeek() {
    const now = weekKey();
    if (data.speakWeek !== now) {
      data.speakWeek = now;
      data.speakCount = 0;
      save();
    }
  }

  function packGrade(grade = data.grade) {
    if (grade <= 3) return 2;
    if (grade <= 5) return 4;
    return 6;
  }

  function hasProfile() {
    return Boolean(data.name);
  }

  function setProfile(name, grade) {
    data.name = String(name || "Xiaoyu").trim().slice(0, 12);
    data.grade = Number(grade) || 2;
    save();
  }

  function addSpeak() {
    rollWeek();
    data.speakCount += 1;
    addCoins(1);
  }

  function tellCoins() {
    document.dispatchEvent(new CustomEvent("life-coins", { detail: data.coins || 0 }));
  }

  function addCoins(n) {
    data.coins = Math.max(0, (data.coins || 0) + n);
    save();
    tellCoins();
    return data.coins;
  }

  function spendCoins(n) {
    if ((data.coins || 0) < n) return false;
    data.coins -= n;
    save();
    tellCoins();
    return true;
  }

  function addItem(id) {
    if (!data.bag) data.bag = [];
    data.bag.push({ id, at: Date.now() });
    save();
  }

  function bagCount(id) {
    return (data.bag || []).filter((item) => item.id === id).length;
  }

  function addPhoto(entry) {
    data.album.unshift(entry);
    data.album = data.album.slice(0, 40);
    data.done[entry.eventId] = Date.now();
    save();
  }

  function nextVariant(key, count) {
    if (!data.turns) data.turns = {};
    if (!count || count < 1) return 0;
    const last = data.turns[key];
    const next = last == null ? 0 : (last + 1) % count;
    data.turns[key] = next;
    save();
    return next;
  }

  function reset() {
    data = empty();
    save();
    tellCoins();
  }

  return {
    weekKey,
    empty,
    load,
    save,
    packGrade,
    hasProfile,
    setProfile,
    addSpeak,
    addCoins,
    spendCoins,
    addItem,
    bagCount,
    addPhoto,
    nextVariant,
    reset,
    get data() {
      return data;
    }
  };
})();
