const LifeMarket = (() => {
  const CATALOG = {
    shop: [
      { id: "carrot", name: "胡萝卜", nameEn: "carrot", emoji: "🥕", price: 3, say: "I'd like a carrot." },
      { id: "tomato", name: "西红柿", nameEn: "tomato", emoji: "🍅", price: 3, say: "I'd like a tomato." },
      { id: "spinach", name: "菠菜", nameEn: "spinach", emoji: "🥬", price: 4, say: "I'd like some spinach." },
      { id: "apple", name: "苹果", nameEn: "apple", emoji: "🍎", price: 3, say: "I'd like an apple." },
      { id: "milk", name: "牛奶", nameEn: "milk", emoji: "🥛", price: 4, say: "I'd like some milk." },
      { id: "bread", name: "面包", nameEn: "bread", emoji: "🍞", price: 3, say: "I'd like some bread." }
    ],
    stall: [
      { id: "icecream", name: "冰淇淋", nameEn: "ice cream", emoji: "🍦", price: 5, say: "I'd like an ice cream." },
      { id: "juice", name: "果汁", nameEn: "juice", emoji: "🧃", price: 5, say: "I'd like some juice." },
      { id: "cake", name: "蛋糕", nameEn: "cake", emoji: "🍰", price: 6, say: "I'd like a cake." }
    ]
  };

  const TITLES = {
    shop: { title: "小店货架", sub: "走进店里才能买。点一样，用金币换。" },
    stall: { title: "路边摊", sub: "摊上这些都可以买。点一样，用金币换。" }
  };

  let place = "";
  let root;

  function init(node) {
    root = node;
    root.querySelector("#market-close").onclick = hide;
  }

  function goods(id) {
    return CATALOG[id] || [];
  }

  function itemName(id) {
    const all = CATALOG.shop.concat(CATALOG.stall);
    const item = all.find((row) => row.id === id);
    return item ? item.emoji + " " + item.name : id;
  }

  function bagText() {
    const bag = LifeState.data.bag || [];
    if (!bag.length) return "还没有";
    const counts = {};
    bag.forEach((row) => {
      counts[row.id] = (counts[row.id] || 0) + 1;
    });
    return Object.keys(counts)
      .map((id) => itemName(id) + "×" + counts[id])
      .join("、");
  }

  function open(id) {
    place = id === "snack" || id === "stall" ? "stall" : "shop";
    root.hidden = false;
    paint("");
  }

  function hide() {
    root.hidden = true;
    place = "";
  }

  function busy() {
    return Boolean(root && !root.hidden);
  }

  function coinCount() {
    return LifeState.data.coins || 0;
  }

  function syncCoins() {
    if (!root || root.hidden) return;
    const n = coinCount();
    const node = root.querySelector("#market-coins");
    if (node) node.textContent = "你有 " + n + " 枚金币";
    root.querySelectorAll("[data-item]").forEach((btn) => {
      const item = goods(place).find((row) => row.id === btn.dataset.item);
      if (item) btn.classList.toggle("poor", n < item.price);
    });
  }

  function paint(note) {
    const meta = TITLES[place] || TITLES.shop;
    root.querySelector("#market-title").textContent = meta.title;
    root.querySelector("#market-sub").textContent = meta.sub;
    root.querySelector("#market-coins").textContent = "你有 " + coinCount() + " 枚金币";
    root.querySelector("#market-note").textContent = note || "";
    const box = root.querySelector("#market-goods");
    box.innerHTML = goods(place)
      .map((item) => {
        const poor = coinCount() < item.price;
        return `<button type="button" class="good${poor ? " poor" : ""}" data-item="${item.id}">
          <span class="good-emoji">${item.emoji}</span>
          <strong>${item.name}</strong>
          <em>${item.say}</em>
          <span class="good-price">🪙 ${item.price}</span>
        </button>`;
      })
      .join("");
    box.querySelectorAll("[data-item]").forEach((btn) => {
      btn.onclick = () => buy(btn.dataset.item);
    });
  }

  function buy(id) {
    const item = goods(place).find((row) => row.id === id);
    if (!item) return;
    if (!LifeState.spendCoins(item.price)) {
      paint("金币不够。开口说话或做完一件事就能赚到。");
      return;
    }
    LifeState.addItem(item.id);
    if (window.LifeSpeech) LifeSpeech.speak(item.say);
    paint("买到了 " + item.emoji + " " + item.nameEn + "。你说：" + item.say);
    document.dispatchEvent(new CustomEvent("life-buy", { detail: { item, place } }));
  }

  return { init, open, hide, busy, syncCoins, goods, itemName, bagText };
})();
window.LifeMarket = LifeMarket;
