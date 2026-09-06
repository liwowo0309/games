/**
 * 疾锋战区 — 埋点与分析（本地存储，可导出给 gate-check）
 */
const Analytics = (() => {
  const STORAGE_KEY = 'survival_arena_analytics';
  const SESSION_KEY = 'survival_arena_session';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultData();
    } catch {
      return defaultData();
    }
  }

  function defaultData() {
    return {
      firstPlayDate: null,
      days: {},
      events: [],
      totals: {
        matches: 0,
        adViews: 0,
        shopOpens: 0,
        shopClicks: 0,
        iapAttempts: 0,
        iapSuccess: 0,
        sessionSeconds: 0,
      },
    };
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function ensureDay(data, day) {
    if (!data.days[day]) {
      data.days[day] = {
        sessions: 0,
        matches: 0,
        matchSeconds: 0,
        adViews: 0,
        shopOpens: 0,
        shopClicks: 0,
        iapAttempts: 0,
        iapSuccess: 0,
        sessionSeconds: 0,
      };
    }
    return data.days[day];
  }

  function track(eventName, payload = {}) {
    const data = load();
    const day = todayKey();
    if (!data.firstPlayDate) data.firstPlayDate = day;
    const d = ensureDay(data, day);

    data.events.push({
      t: Date.now(),
      e: eventName,
      ...payload,
    });
    if (data.events.length > 5000) data.events = data.events.slice(-3000);

    switch (eventName) {
      case 'session_start':
        d.sessions += 1;
        break;
      case 'session_end':
        const sec = payload.seconds || 0;
        d.sessionSeconds += sec;
        data.totals.sessionSeconds += sec;
        break;
      case 'match_start':
        d.matches += 1;
        data.totals.matches += 1;
        break;
      case 'match_end':
        d.matchSeconds += payload.duration || 0;
        break;
      case 'ad_complete':
        d.adViews += 1;
        data.totals.adViews += 1;
        break;
      case 'shop_open':
        d.shopOpens += 1;
        data.totals.shopOpens += 1;
        break;
      case 'shop_click_item':
        d.shopClicks += 1;
        data.totals.shopClicks += 1;
        break;
      case 'iap_attempt':
        d.iapAttempts += 1;
        data.totals.iapAttempts += 1;
        break;
      case 'iap_success':
        d.iapSuccess += 1;
        data.totals.iapSuccess += 1;
        break;
    }

    save(data);
  }

  let sessionStart = null;

  function startSession() {
    sessionStart = Date.now();
    track('session_start');
  }

  function endSession() {
    if (!sessionStart) return;
    const sec = (Date.now() - sessionStart) / 1000;
    track('session_end', { seconds: sec });
    sessionStart = null;
  }

  function exportMetrics() {
    const data = load();
    const days = Object.keys(data.days).sort();
    const today = todayKey();
    const first = data.firstPlayDate || today;

    // D1/D7 retention simulation from day keys
    const uniqueDays = days.length;
    const totalSessions = days.reduce((s, k) => s + data.days[k].sessions, 0);
    const totalMatches = days.reduce((s, k) => s + data.days[k].matches, 0);
    const totalMatchSec = days.reduce((s, k) => s + data.days[k].matchSeconds, 0);
    const totalAd = days.reduce((s, k) => s + data.days[k].adViews, 0);
    const totalShopOpen = days.reduce((s, k) => s + data.days[k].shopOpens, 0);
    const totalShopClick = days.reduce((s, k) => s + data.days[k].shopClicks, 0);
    const totalIapAtt = days.reduce((s, k) => s + data.days[k].iapAttempts, 0);
    const totalIapSucc = days.reduce((s, k) => s + data.days[k].iapSuccess, 0);
    const totalSessionSec = days.reduce((s, k) => s + data.days[k].sessionSeconds, 0);

    const dauEstimate = Math.max(1, uniqueDays);
    const matchesPerDay = totalMatches / dauEstimate;
    const adPerDay = totalAd / dauEstimate;
    const sessionMin = totalSessionSec / dauEstimate / 60;
    const matchMinPerSession = totalSessions > 0 ? totalMatchSec / totalSessions / 60 : 0;

    // Retention: users who played on day 0 and returned
    function dayOffset(base, offset) {
      const d = new Date(base);
      d.setDate(d.getDate() + offset);
      return d.toISOString().slice(0, 10);
    }
    const d1Key = dayOffset(first, 1);
    const d7Key = dayOffset(first, 7);
    const playedFirst = data.days[first]?.sessions > 0;
    const d1Retention = playedFirst && data.days[d1Key]?.sessions > 0 ? 1 : 0;
    const d7Retention = playedFirst && data.days[d7Key]?.sessions > 0 ? 1 : 0;

    // For multi-user export, use aggregated estimates from events
    const userIds = new Set();
    data.events.forEach((ev) => {
      if (ev.userId) userIds.add(ev.userId);
    });
    const users = userIds.size || 1;

    return {
      exportDate: today,
      sampleUsers: users,
      d1_retention: d1Retention * 100,
      d7_retention: d7Retention * 100,
      session_length: matchMinPerSession || sessionMin,
      matches_per_day: matchesPerDay,
      ad_views_per_day: adPerDay,
      iap_conversion: totalIapAtt > 0 ? (totalIapSucc / users) * 100 : 0,
      shop_click_rate: totalShopOpen > 0 ? (totalShopClick / totalShopOpen) * 100 : 0,
      ad_ecpm: 20,
      totals: data.totals,
      days: data.days,
    };
  }

  function exportJson() {
    return JSON.stringify(exportMetrics(), null, 2);
  }

  return {
    track,
    startSession,
    endSession,
    exportMetrics,
    exportJson,
    load,
  };
})();
