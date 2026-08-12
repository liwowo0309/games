const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const statsEl = document.getElementById("stats");
const logEl = document.getElementById("log");
const questEl = document.getElementById("quest");
const buttons = {
  reset: document.getElementById("reset"),
  rest: document.getElementById("rest"),
  usePotion: document.getElementById("use-potion"),
};

const TILE = 32;
const COLS = 20;
const ROWS = 15;

const tileIds = { floor: 0, wall: 1, water: 2, camp: 3 };
const tileColors = {
  [tileIds.floor]: "#1c2433",
  [tileIds.wall]: "#0f131c",
  [tileIds.water]: "#0b3045",
  [tileIds.camp]: "#1f2f1f",
};

const mapLayout = [
  "####################",
  "#S..#...~~~~...#..##",
  "#...#...#....#....##",
  "#...#...#....#..G..#",
  "#...#...#....#.....#",
  "#.......#....#.....#",
  "#...####.....#..##.#",
  "#...#..G.....#..##.#",
  "#...#.........#....#",
  "#...#####.###.#.###.",
  "#.............#....#",
  "#..T...#..C..#..K..#",
  "#...#..#.....#.....#",
  "#..~#..#..B..#..~..#",
  "####################",
];

function makeSprite(pixels, palette, scale = 2) {
  const w = pixels[0].length;
  const h = pixels.length;
  const c = document.createElement("canvas");
  c.width = w * scale;
  c.height = h * scale;
  const g = c.getContext("2d");
  pixels.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const color = palette[ch];
      if (!color) return;
      g.fillStyle = color;
      g.fillRect(x * scale, y * scale, scale, scale);
    });
  });
  return c;
}

const sprites = {
  hero: makeSprite(
    [
      "................",
      "...hhhhhh.......",
      "..hhhhhhhh......",
      "..hhssssh.......",
      "..hsssss........",
      "..hhsssh........",
      "...hhhhhh.......",
      "...bbbbbb.......",
      "...bbbbbb.......",
      "...bbbbbb.......",
      "...dddddd.......",
      "...dddddd.......",
      "...g....g.......",
      "...g....g.......",
      "...g....g.......",
      "................",
    ],
    {
      h: "#5a3b1f", // hair
      s: "#f2d5b1", // skin
      b: "#5fa8ff", // shirt
      d: "#2a3242", // pants
      g: "#7d8a9a", // shoes
    }
  ),
  raider: makeSprite(
    [
      "................",
      ".....ggg........",
      "....ggggg.......",
      "...gsssgg.......",
      "...dddddd.......",
      "...dggggd.......",
      "...dgssgd.......",
      "...dggggd.......",
      "...dddddd.......",
      "...bgbgbg.......",
      "...bgbgbg.......",
      "...bgbgbg.......",
      "...g....g.......",
      "...g....g.......",
      "...g....g.......",
      "................",
    ],
    {
      g: "#3c8b52",
      s: "#e6cfac",
      d: "#1f2b23",
      b: "#6b4a28",
    }
  ),
  knight: makeSprite(
    [
      "................",
      ".....mmm........",
      "....mmmmm.......",
      "...mdddmm.......",
      "...dddddd.......",
      "...dmmmmd.......",
      "...dmddmd.......",
      "...dmmmmd.......",
      "...dddddd.......",
      "...bbbbbb.......",
      "...bbbbbb.......",
      "...bbbbbb.......",
      "...d....d.......",
      "...d....d.......",
      "...d....d.......",
      "................",
    ],
    {
      m: "#c7d2e5",
      d: "#2a3242",
      b: "#6ea8ff",
    }
  ),
  captain: makeSprite(
    [
      "................",
      ".....rrr........",
      "....rrrrr.......",
      "...rssssr.......",
      "...dddddd.......",
      "...drrrrd.......",
      "...drssrd.......",
      "...drrrrd.......",
      "...dddddd.......",
      "...oooooo.......",
      "...oooooo.......",
      "...oooooo.......",
      "...d....d.......",
      "...d....d.......",
      "...d....d.......",
      "................",
    ],
    {
      r: "#e36c6c",
      s: "#f5d7b7",
      d: "#2d1c1c",
      o: "#f2a45a",
    }
  ),
  chest: makeSprite(
    [
      "................",
      "................",
      "................",
      "...tttttttttt...",
      "...tbbbbbbbbt...",
      "...tbbbbbbbbt...",
      "...tbbbbbbbbt...",
      "...tbbbbbbbbt...",
      "...tbbbbbbbbt...",
      "...tbbbbbbbbt...",
      "...tbbbbbbbbt...",
      "...tggggggggt...",
      "...dddddddddd...",
      "................",
      "................",
      "................",
    ],
    {
      t: "#b88d4a",
      b: "#8a6b32",
      g: "#e6c76b",
      d: "#5a4120",
    }
  ),
};

const enemySprites = {
  Raider: sprites.raider,
  Knight: sprites.knight,
  "Camp Captain": sprites.captain,
};

const enemyCatalog = {
  G: { name: "Raider", hp: 9, attack: 4, defense: 1, xp: 6, color: "#7bd67b" },
  K: { name: "Knight", hp: 14, attack: 6, defense: 2, xp: 12, color: "#9cb4ff" },
  B: { name: "Camp Captain", hp: 20, attack: 7, defense: 3, xp: 20, color: "#f0a97a" },
};

let state = {
  hero: null,
  enemies: [],
  chests: [],
  map: [],
  gameOver: false,
  victory: false,
};

function defaultHero() {
  return {
    x: 1,
    y: 1,
    hp: 24,
    maxHp: 24,
    attack: 6,
    defense: 2,
    level: 1,
    xp: 0,
    potions: 2,
  };
}

function buildWorld() {
  state.map = [];
  state.enemies = [];
  state.chests = [];
  state.victory = false;
  state.gameOver = false;
  state.hero = defaultHero();

  mapLayout.forEach((row, y) => {
    const tiles = [];
    [...row].forEach((ch, x) => {
      let tile = tileIds.floor;
      if (ch === "#") tile = tileIds.wall;
      if (ch === "~") tile = tileIds.water;
      if (ch === "C") tile = tileIds.camp;
      if (ch === "S") {
        state.hero.x = x;
        state.hero.y = y;
      }
      if (enemyCatalog[ch]) {
        const data = enemyCatalog[ch];
        state.enemies.push({
          type: data.name,
          hp: data.hp,
          maxHp: data.hp,
          attack: data.attack,
          defense: data.defense,
          xp: data.xp,
          color: data.color,
          sprite: enemySprites[data.name] || null,
          x,
          y,
        });
      }
      if (ch === "T") {
        state.chests.push({ x, y, opened: false });
      }
      tiles.push(tile);
    });
    state.map.push(tiles);
  });
}

function tileAt(x, y) {
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return tileIds.wall;
  return state.map[y][x];
}

function isWalkable(tile) {
  return tile === tileIds.floor || tile === tileIds.camp;
}

function findEnemy(x, y) {
  return state.enemies.find((e) => e.x === x && e.y === y);
}

function findChest(x, y) {
  return state.chests.find((c) => c.x === x && c.y === y && !c.opened);
}

function damage(from, to) {
  return Math.max(1, from.attack - Math.floor(to.defense / 2));
}

function handleKey(e) {
  if (state.gameOver || state.victory) return;
  const key = e.key.toLowerCase();
  const moveMap = {
    arrowup: [0, -1],
    w: [0, -1],
    arrowdown: [0, 1],
    s: [0, 1],
    arrowleft: [-1, 0],
    a: [-1, 0],
    arrowright: [1, 0],
    d: [1, 0],
  };

  if (moveMap[key]) {
    e.preventDefault();
    tryStep(...moveMap[key]);
    return;
  }
  if (key === " " || key === "spacebar") {
    e.preventDefault();
    rest();
    return;
  }
  if (key === "f") {
    e.preventDefault();
    usePotion();
  }
}

function tryStep(dx, dy) {
  const nx = state.hero.x + dx;
  const ny = state.hero.y + dy;
  const tile = tileAt(nx, ny);
  if (!isWalkable(tile)) {
    addLog("Can't move there.");
    return;
  }

  const foe = findEnemy(nx, ny);
  if (foe) {
    engage(foe);
    return;
  }

  state.hero.x = nx;
  state.hero.y = ny;
  const chest = findChest(nx, ny);
  if (chest) openChest(chest);
  addLog("You scout the area.");
  draw();
  renderStats();
}

function engage(enemy) {
  addLog(`You engage the ${enemy.type}.`);
  const heroHit = damage(state.hero, enemy);
  enemy.hp -= heroHit;
  addLog(`You strike for ${heroHit} damage.`);

  if (enemy.hp <= 0) {
    slay(enemy);
    return;
  }

  const enemyHit = damage(enemy, state.hero);
  state.hero.hp -= enemyHit;
  addLog(`The ${enemy.type} hits for ${enemyHit}.`);

  if (state.hero.hp <= 0) {
    state.hero.hp = 0;
    state.gameOver = true;
    addLog("You fall in battle. Reset to try again.");
  }
  draw();
  renderStats();
}

function slay(enemy) {
  addLog(`The ${enemy.type} falls.`);
  state.enemies = state.enemies.filter((e) => e !== enemy);
  state.hero.xp += enemy.xp;
  state.hero.potions += Math.random() < 0.25 ? 1 : 0;
  maybeLevel();
  if (state.enemies.length === 0) {
    state.victory = true;
    addLog("The camp is cleared! You survived.");
  }
  draw();
  renderStats();
}

function maybeLevel() {
  const needed = 12 + (state.hero.level - 1) * 8;
  if (state.hero.xp >= needed) {
    state.hero.level += 1;
    state.hero.xp = 0;
    state.hero.maxHp += 4;
    state.hero.hp = state.hero.maxHp;
    state.hero.attack += 1;
    state.hero.defense += 1;
    addLog("You feel stronger. Level up!");
  }
}

function openChest(chest) {
  chest.opened = true;
  state.hero.potions += 1;
  state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + 4);
  addLog("Found a potion and patched some wounds.");
  draw();
  renderStats();
}

function rest() {
  if (state.gameOver || state.victory) return;
  const tile = tileAt(state.hero.x, state.hero.y);
  const heal = tile === tileIds.camp ? 8 : 4;
  const before = state.hero.hp;
  state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + heal);
  addLog(tile === tileIds.camp ? "You rest by the fire." : "You catch your breath.");
  if (state.hero.hp === before) addLog("You already feel topped up.");
  draw();
  renderStats();
}

function usePotion() {
  if (state.gameOver || state.victory) return;
  if (state.hero.potions <= 0) {
    addLog("No potions left.");
    return;
  }
  state.hero.potions -= 1;
  const before = state.hero.hp;
  state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + 10);
  addLog("You drink a potion.");
  if (state.hero.hp === before) addLog("Health already full.");
  draw();
  renderStats();
}

function addLog(entry) {
  const li = document.createElement("li");
  li.textContent = entry;
  logEl.prepend(li);
  while (logEl.children.length > 60) logEl.removeChild(logEl.lastChild);
}

function renderStats() {
  const h = state.hero;
  const bar = (value, max) => {
    const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
    return `<div class="bar"><span style="width:${pct}%"></span></div>`;
  };

  statsEl.innerHTML = `
    <div class="statline"><span>HP</span><strong>${h.hp}/${h.maxHp}</strong></div>
    ${bar(h.hp, h.maxHp)}
    <div class="statline"><span>Atk</span><strong>${h.attack}</strong></div>
    <div class="statline"><span>Def</span><strong>${h.defense}</strong></div>
    <div class="statline"><span>Level</span><strong>${h.level}</strong></div>
    <div class="statline"><span>XP</span><strong>${h.xp}</strong></div>
    <div class="statline"><span>Potions</span><strong>${h.potions}</strong></div>
  `;

  if (state.victory) questEl.textContent = "Victory! Reset to play again.";
  else if (state.gameOver) questEl.textContent = "Defeated. Reset to try again.";
  else questEl.textContent = "Explore the forest, defeat the camp captain, and survive.";
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const tile = state.map[y][x];
      ctx.fillStyle = tileColors[tile] || "#1c2433";
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      if (tile === tileIds.wall) {
        ctx.strokeStyle = "#222a38";
        ctx.strokeRect(x * TILE, y * TILE, TILE, TILE);
      }
      if (tile === tileIds.camp) {
        ctx.fillStyle = "#3a5d3a";
        ctx.fillRect(x * TILE + 8, y * TILE + 8, TILE - 16, TILE - 16);
      }
    }
  }

  state.chests.forEach((c) => {
    if (c.opened) return;
    if (sprites.chest) {
      ctx.drawImage(sprites.chest, c.x * TILE, c.y * TILE);
    } else {
      ctx.fillStyle = "#d7b15c";
      ctx.fillRect(c.x * TILE + 8, c.y * TILE + 10, TILE - 16, TILE - 20);
      ctx.strokeStyle = "#8a6b32";
      ctx.strokeRect(c.x * TILE + 8, c.y * TILE + 10, TILE - 16, TILE - 20);
    }
  });

  state.enemies.forEach((e) => {
    if (e.sprite) {
      ctx.drawImage(e.sprite, e.x * TILE, e.y * TILE);
    } else {
      ctx.fillStyle = e.color;
      ctx.beginPath();
      ctx.arc(e.x * TILE + TILE / 2, e.y * TILE + TILE / 2, TILE * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  if (sprites.hero) {
    ctx.drawImage(sprites.hero, state.hero.x * TILE, state.hero.y * TILE);
  } else {
    ctx.fillStyle = "#8cd0ff";
    ctx.fillRect(state.hero.x * TILE + 6, state.hero.y * TILE + 6, TILE - 12, TILE - 12);
  }
}

function reset() {
  logEl.innerHTML = "";
  buildWorld();
  addLog("A new day dawns. You enter the camp.");
  renderStats();
  draw();
}

function wireEvents() {
  window.addEventListener("keydown", handleKey);
  buttons.reset.addEventListener("click", reset);
  buttons.rest.addEventListener("click", rest);
  buttons.usePotion.addEventListener("click", usePotion);
}

function main() {
  wireEvents();
  reset();
}

main();

