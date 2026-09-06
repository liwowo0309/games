/**
 * 疾锋战区 — 变现：充值购币 + 金币商城 + 直购 + 广告
 */
const Monetization = (() => {
  const STORAGE_KEY = 'survival_arena_wallet';

  /** 人民币直购 — 金币包 */
  const COIN_PACKS = [
    { id: 'coin_6', name: '600 战区币', price: 6, coins: 600, badge: '' },
    { id: 'coin_12', name: '1500 战区币', price: 12, coins: 1500, badge: '热销' },
    { id: 'coin_30', name: '4200 战区币', price: 30, coins: 4200, badge: '超值' },
    { id: 'coin_68', name: '10000 战区币', price: 68, coins: 10000, badge: '土豪' },
    { id: 'coin_first', name: '首充双倍包', price: 6, coins: 1200, once: true, badge: '仅一次' },
  ];

  /** 直购礼包（给币+权益） */
  const IAP_PRODUCTS = [
    { id: 'pass_season', name: '赛季通行证', price: 18, coins: 0, type: 'pass' },
    { id: 'month_card', name: '月卡（每日领币）', price: 8, coins: 200, type: 'subscription', dailyCoins: 80 },
    { id: 'skin_ar_red', name: '赤焰步枪皮肤', price: 12, coins: 0, type: 'skin' },
    { id: 'skin_suit_void', name: '虚空套装', price: 30, coins: 0, type: 'skin' },
    { id: 'first_pack', name: '新手礼包', price: 6, coins: 500, type: 'pack', once: true },
  ];

  /** 金币商城 — 用战区币购买 */
  const COIN_SHOP = [
    { id: 'cs_skin_trail', name: '蓝色曳光弹', cost: 500, type: 'cosmetic', desc: '子弹特效' },
    { id: 'cs_skin_vest', name: '金色战术背心', cost: 800, type: 'cosmetic', desc: '外观' },
    { id: 'cs_skin_para', name: '炫彩降落伞', cost: 600, type: 'cosmetic', desc: '跳伞外观' },
    { id: 'cs_boost_2x', name: '下局金币×2', cost: 200, type: 'boost', desc: '一次性加成' },
    { id: 'cs_boost_armor', name: '开局护甲+20', cost: 150, type: 'boost', desc: '下一局生效' },
    { id: 'cs_lucky_box', name: '幸运补给箱', cost: 120, type: 'consumable', desc: '随机 80～400 币' },
    { id: 'cs_ammo_pack', name: '满弹匣补给', cost: 80, type: 'consumable', desc: '靶场/团竞可用' },
  ];

  const AD_DAILY_LIMIT = {
    double_reward: 5,
    daily_supply: 3,
    pass_xp: 2,
    free_coins: 5,
  };

  const AD_FREE_COINS = 50;

  function loadWallet() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultWallet();
    } catch {
      return defaultWallet();
    }
  }

  function defaultWallet() {
    return {
      coins: 100,
      owned: [],
      boosts: [],
      firstPackUsed: false,
      coinFirstUsed: false,
      monthCard: false,
      adCounts: {},
      adCountsDate: null,
      lastDailyDate: null,
      dailyClaimed: false,
    };
  }

  function saveWallet(w) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(w));
    refreshCoinHud();
  }

  function refreshCoinHud() {
    const el = document.getElementById('hudCoins');
    if (el) el.textContent = loadWallet().coins;
    const menuCoins = document.getElementById('menuCoins');
    if (menuCoins) menuCoins.textContent = loadWallet().coins;
  }

  function resetAdCountsIfNeeded(w) {
    const today = new Date().toISOString().slice(0, 10);
    if (w.adCountsDate !== today) {
      w.adCounts = {};
      w.adCountsDate = today;
      w.dailyClaimed = false;
    }
  }

  function canWatchAd(slot) {
    const w = loadWallet();
    resetAdCountsIfNeeded(w);
    saveWallet(w);
    const limit = AD_DAILY_LIMIT[slot] || 5;
    return (w.adCounts[slot] || 0) < limit;
  }

  function watchAd(slot, onComplete) {
    if (!canWatchAd(slot)) {
      alert('今日该广告位已达上限');
      return;
    }
    const modal = document.getElementById('adModal');
    const msg = document.getElementById('adModalMsg');
    if (modal && msg) {
      msg.textContent = '模拟激励视频播放中…（3 秒）';
      modal.classList.add('open');
      setTimeout(() => {
        modal.classList.remove('open');
        const w = loadWallet();
        resetAdCountsIfNeeded(w);
        w.adCounts[slot] = (w.adCounts[slot] || 0) + 1;
        if (slot === 'free_coins') {
          w.coins += AD_FREE_COINS;
        }
        saveWallet(w);
        Analytics.track('ad_complete', { slot });
        if (onComplete) onComplete();
        if (slot === 'free_coins') alert(`获得 ${AD_FREE_COINS} 战区币！`);
      }, 3000);
    } else if (onComplete) setTimeout(onComplete, 1000);
  }

  function purchaseCoinPack(packId) {
    const pack = COIN_PACKS.find((p) => p.id === packId);
    if (!pack) return false;
    const w = loadWallet();
    if (pack.once && pack.id === 'coin_first' && w.coinFirstUsed) {
      alert('首充双倍包仅可购买一次');
      return false;
    }
    Analytics.track('iap_attempt', { productId: packId, price: pack.price });
    const ok = confirm(
      `【沙盒支付】购买 ${pack.name}\n价格 ¥${pack.price} → 获得 ${pack.coins} 战区币\n（不会真实扣款）`
    );
    if (!ok) return false;
    let grant = pack.coins;
    if (pack.id === 'coin_first') {
      grant = 1200;
      w.coinFirstUsed = true;
    }
    w.coins += grant;
    saveWallet(w);
    Analytics.track('iap_success', { productId: packId, price: pack.price, coins: grant });
    alert(`购买成功！获得 ${grant} 战区币`);
    return true;
  }

  function purchaseIap(productId) {
    const product = IAP_PRODUCTS.find((p) => p.id === productId);
    if (!product) return false;
    const w = loadWallet();
    if (product.once && w.firstPackUsed) {
      alert('该礼包仅可购买一次');
      return false;
    }
    Analytics.track('iap_attempt', { productId, price: product.price });
    const ok = confirm(`【沙盒支付】${product.name} ¥${product.price}？`);
    if (!ok) return false;
    if (product.once) w.firstPackUsed = true;
    if (!w.owned.includes(productId)) w.owned.push(productId);
    if (product.coins) w.coins += product.coins;
    if (product.type === 'subscription') w.monthCard = true;
    saveWallet(w);
    Analytics.track('iap_success', { productId, price: product.price });
    alert('购买成功！');
    return true;
  }

  function buyWithCoins(itemId) {
    const item = COIN_SHOP.find((i) => i.id === itemId);
    if (!item) return false;
    const w = loadWallet();
    if (w.coins < item.cost) {
      alert(`战区币不足！需要 ${item.cost}，当前 ${w.coins}\n可去「充值购币」用人民币购买`);
      return false;
    }
    Analytics.track('shop_click_item', { productId: itemId, cost: item.cost });

    if (item.type === 'cosmetic') {
      if (w.owned.includes(itemId)) {
        alert('已拥有该外观');
        return false;
      }
      w.coins -= item.cost;
      w.owned.push(itemId);
      saveWallet(w);
      alert(`购买成功：${item.name}`);
      return true;
    }

    if (item.type === 'boost') {
      w.coins -= item.cost;
      w.boosts.push(itemId);
      saveWallet(w);
      alert(`已购买：${item.name}（下一局自动生效）`);
      return true;
    }

    if (item.type === 'consumable') {
      w.coins -= item.cost;
      if (itemId === 'cs_lucky_box') {
        const bonus = 80 + Math.floor(Math.random() * 320);
        w.coins += bonus;
        alert(`幸运箱开出 ${bonus} 战区币！`);
      } else {
        alert(`获得：${item.name}`);
      }
      saveWallet(w);
      return true;
    }
    return false;
  }

  function claimDaily() {
    const w = loadWallet();
    resetAdCountsIfNeeded(w);
    if (w.dailyClaimed) {
      alert('今日每日奖励已领取');
      return;
    }
    let amount = 30;
    if (w.monthCard) amount += 80;
    w.coins += amount;
    w.dailyClaimed = true;
    saveWallet(w);
    alert(`每日补给 +${amount} 战区币`);
  }

  function consumeBoost(boostId) {
    const w = loadWallet();
    const idx = w.boosts.indexOf(boostId);
    if (idx >= 0) {
      w.boosts.splice(idx, 1);
      saveWallet(w);
      return true;
    }
    return false;
  }

  function hasBoost(boostId) {
    return loadWallet().boosts.includes(boostId);
  }

  function applyMatchReward(baseAmount) {
    let mult = 1;
    if (hasBoost('cs_boost_2x')) {
      mult = 2;
      consumeBoost('cs_boost_2x');
    }
    const total = Math.floor(baseAmount * mult);
    addCoins(total);
    return total;
  }

  function purchase(productId) {
    if (COIN_PACKS.some((p) => p.id === productId)) return purchaseCoinPack(productId);
    if (COIN_SHOP.some((i) => i.id === productId)) return buyWithCoins(productId);
    return purchaseIap(productId);
  }

  function addCoins(amount) {
    const w = loadWallet();
    w.coins += amount;
    saveWallet(w);
  }

  function getCoins() {
    return loadWallet().coins;
  }

  let currentTab = 'coins';

  function renderShopTab(tab) {
    currentTab = tab;
    const content = document.getElementById('shopContent');
    const w = loadWallet();
    if (!content) return;

    document.querySelectorAll('.shop-tab').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    if (tab === 'coins') {
      content.innerHTML = `
        <p class="shop-balance">当前战区币：<strong>${w.coins}</strong></p>
        <p class="shop-desc">用人民币购买战区币，再到「金币商城」买皮肤、加成</p>
        ${COIN_PACKS.map((p) => {
          const disabled = p.once && p.id === 'coin_first' && w.coinFirstUsed;
          return `<div class="shop-item">
            <div><strong>${p.name}</strong> ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}<br>
            <span class="price-tag">¥${p.price}</span></div>
            <button class="btn-buy" ${disabled ? 'disabled' : ''} data-buy="${p.id}">
              ${disabled ? '已购' : '购买'}
            </button>
          </div>`;
        }).join('')}`;
    } else if (tab === 'spend') {
      content.innerHTML = `
        <p class="shop-balance">当前战区币：<strong>${w.coins}</strong></p>
        ${COIN_SHOP.map((i) => {
          const owned = i.type === 'cosmetic' && w.owned.includes(i.id);
          return `<div class="shop-item">
            <div><strong>${i.name}</strong> — ${i.cost} 币<br><small>${i.desc}</small></div>
            <button class="btn-buy" ${owned ? 'disabled' : ''} data-buy="${i.id}">
              ${owned ? '已拥有' : '兑换'}
            </button>
          </div>`;
        }).join('')}`;
    } else if (tab === 'iap') {
      content.innerHTML = `
        ${IAP_PRODUCTS.map((p) => {
          const owned = p.type === 'skin' && w.owned.includes(p.id);
          const disabled = p.once && w.firstPackUsed;
          return `<div class="shop-item">
            <div><strong>${p.name}</strong> <span class="price-tag">¥${p.price}</span>
            ${p.coins ? ` +${p.coins}币` : ''}</div>
            <button class="btn-buy" ${disabled || owned ? 'disabled' : ''} data-buy="${p.id}">
              ${owned ? '已拥有' : disabled ? '已购' : '购买'}
            </button>
          </div>`;
        }).join('')}`;
    } else if (tab === 'ad') {
      const freeLeft = AD_DAILY_LIMIT.free_coins - (w.adCounts.free_coins || 0);
      content.innerHTML = `
        <p class="shop-balance">当前战区币：<strong>${w.coins}</strong></p>
        <div class="shop-item">
          <div><strong>每日签到</strong><br>免费 30 币${w.monthCard ? ' +月卡80' : ''}</div>
          <button class="btn-buy" id="btnDaily" ${w.dailyClaimed ? 'disabled' : ''}>
            ${w.dailyClaimed ? '已领' : '领取'}
          </button>
        </div>
        <div class="shop-item">
          <div><strong>看广告得币</strong><br>每次 +${AD_FREE_COINS} 币（今日剩 ${freeLeft} 次）</div>
          <button class="btn-buy" id="btnAdCoins" ${freeLeft <= 0 ? 'disabled' : ''}>看广告</button>
        </div>
        <div class="shop-item">
          <div><strong>结算翻倍</strong><br>对局结束后在结算页使用</div>
          <span class="muted">自动触发</span>
        </div>`;
      document.getElementById('btnDaily')?.addEventListener('click', () => {
        claimDaily();
        renderShopTab('ad');
      });
      document.getElementById('btnAdCoins')?.addEventListener('click', () => {
        watchAd('free_coins', () => renderShopTab('ad'));
      });
      return;
    }

    content.querySelectorAll('[data-buy]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (purchase(btn.dataset.buy)) renderShopTab(tab);
      });
    });
  }

  function renderShop() {
    renderShopTab(currentTab);
  }

  function openShop(tab = 'coins') {
    Analytics.track('shop_open');
    renderShopTab(tab);
    document.getElementById('shopModal')?.classList.add('open');
  }

  function closeShop() {
    document.getElementById('shopModal')?.classList.remove('open');
  }

  refreshCoinHud();

  return {
    COIN_PACKS,
    IAP_PRODUCTS,
    COIN_SHOP,
    watchAd,
    canWatchAd,
    purchase,
    purchaseCoinPack,
    buyWithCoins,
    claimDaily,
    addCoins,
    applyMatchReward,
    hasBoost,
    consumeBoost,
    getCoins,
    openShop,
    closeShop,
    renderShop,
    renderShopTab,
    loadWallet,
    refreshCoinHud,
  };
})();
