const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");
const cityInfo = document.getElementById("city-info");
const logEl = document.getElementById("log");
const hintEl = document.getElementById("hint");
const turnEl = document.getElementById("turn-number");
const goldEl = document.getElementById("gold");
const currentPlayerEl = document.getElementById("current-player");
const cityCountEl = document.getElementById("city-count");

const unitCosts = { infantry: 3, cavalry: 5, archers: 4 };
const baseIncome = 10;
const perCityIncome = 6;
const cityRadius = 18;

const playersTemplate = [
  { id: "wei", name: "Wei", color: "#1f7cc9", gold: 22, capital: "xuchang" },
  { id: "shu", name: "Shu", color: "#2c9e5d", gold: 22, capital: "chengdu" },
];

const citiesTemplate = [
  {
    id: "changAn",
    name: "Chang'an",
    x: 220,
    y: 180,
    neighbors: ["hanzhong", "luoyang"],
    owner: "wei",
    units: { infantry: 2, cavalry: 1, archers: 1 },
  },
  {
    id: "luoyang",
    name: "Luoyang",
    x: 380,
    y: 170,
    neighbors: ["changAn", "xuchang", "hefei"],
    owner: "wei",
    units: { infantry: 2, cavalry: 1, archers: 2 },
  },
  {
    id: "xuchang",
    name: "Xuchang (Capital)",
    x: 430,
    y: 260,
    neighbors: ["luoyang", "xiangyang", "hefei"],
    owner: "wei",
    units: { infantry: 3, cavalry: 2, archers: 2 },
  },
  {
    id: "hefei",
    name: "Hefei",
    x: 540,
    y: 210,
    neighbors: ["luoyang", "xuchang", "jianye"],
    owner: "wei",
    units: { infantry: 2, cavalry: 1, archers: 1 },
  },
  {
    id: "hanzhong",
    name: "Hanzhong",
    x: 220,
    y: 270,
    neighbors: ["changAn", "xiangyang", "chengdu"],
    owner: "shu",
    units: { infantry: 2, cavalry: 1, archers: 2 },
  },
  {
    id: "xiangyang",
    name: "Xiangyang",
    x: 320,
    y: 310,
    neighbors: ["hanzhong", "xuchang", "chengdu"],
    owner: "shu",
    units: { infantry: 2, cavalry: 2, archers: 1 },
  },
  {
    id: "chengdu",
    name: "Chengdu (Capital)",
    x: 180,
    y: 370,
    neighbors: ["hanzhong", "xiangyang", "jianye"],
    owner: "shu",
    units: { infantry: 3, cavalry: 2, archers: 2 },
  },
  {
    id: "jianye",
    name: "Jianye",
    x: 540,
    y: 350,
    neighbors: ["chengdu", "hefei"],
    owner: "neutral",
    units: { infantry: 1, cavalry: 1, archers: 1 },
  },
];

let state = {
  players: [],
  cities: [],
  currentPlayerIndex: 0,
  selectedCityId: null,
  movingFromId: null,
  turn: 1,
  log: [],
};

const buttons = {
  endTurn: document.getElementById("end-turn"),
  reset: document.getElementById("reset"),
  startMove: document.getElementById("start-move"),
  cancelMove: document.getElementById("cancel-move"),
  recruitBtns: Array.from(document.querySelectorAll("button.recruit")),
};

function cloneUnits(units) {
  return { infantry: units.infantry, cavalry: units.cavalry, archers: units.archers };
}

function resetGame() {
  state.players = playersTemplate.map((p) => ({ ...p, gold: p.gold }));
  state.cities = citiesTemplate.map((c) => ({ ...c, units: cloneUnits(c.units) }));
  state.currentPlayerIndex = 0;
  state.selectedCityId = null;
  state.movingFromId = null;
  state.turn = 1;
  state.log = [];
  grantIncome(getCurrentPlayer());
  addLog(`${getCurrentPlayer().name} receives starting income.`);
  draw();
  refreshUI();
  hintEl.textContent = "Click a city to inspect or act.";
}

function getCurrentPlayer() {
  return state.players[state.currentPlayerIndex];
}

function getOpponentPlayer() {
  return state.players[1 - state.currentPlayerIndex];
}

function findCity(id) {
  return state.cities.find((c) => c.id === id);
}

function cityCount(ownerId) {
  return state.cities.filter((c) => c.owner === ownerId).length;
}

function totalUnits(units) {
  return units.infantry + units.cavalry + units.archers;
}

function formatUnits(units) {
  return `Inf ${units.infantry} | Cav ${units.cavalry} | Arc ${units.archers}`;
}

function grantIncome(player) {
  const income = baseIncome + perCityIncome * cityCount(player.id);
  player.gold += income;
  addLog(`${player.name} gains ${income} gold (base + cities).`);
}

function addLog(message) {
  state.log.unshift(message);
  state.log = state.log.slice(0, 50);
  renderLog();
}

function renderLog() {
  logEl.innerHTML = "";
  state.log.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = entry;
    logEl.appendChild(li);
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawEdges();
  state.cities.forEach((city) => drawCity(city));
}

function drawEdges() {
  ctx.strokeStyle = "#2a3242";
  ctx.lineWidth = 2;
  state.cities.forEach((city) => {
    city.neighbors.forEach((nId) => {
      const target = findCity(nId);
      if (!target) return;
      // Draw each edge once
      if (city.id > target.id) return;
      ctx.beginPath();
      ctx.moveTo(city.x, city.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
    });
  });
}

function drawCity(city) {
  const isSelected = state.selectedCityId === city.id;
  const isMovingFrom = state.movingFromId === city.id;
  const ownerColor =
    city.owner === "wei"
      ? playersTemplate[0].color
      : city.owner === "shu"
      ? playersTemplate[1].color
      : "#6d768a";

  ctx.beginPath();
  ctx.fillStyle = ownerColor;
  ctx.strokeStyle = isMovingFrom ? "#e0b347" : isSelected ? "#ffffff" : "#0b0f16";
  ctx.lineWidth = isSelected || isMovingFrom ? 4 : 2;
  ctx.arc(city.x, city.y, cityRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#0b0f16";
  ctx.font = "12px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(city.name, city.x, city.y - cityRadius - 8);
}

function handleCanvasClick(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const clicked = state.cities.find((city) => {
    const dx = city.x - x;
    const dy = city.y - y;
    return Math.sqrt(dx * dx + dy * dy) <= cityRadius + 2;
  });
  if (!clicked) return;

  if (state.movingFromId) {
    attemptMove(clicked.id);
    return;
  }

  state.selectedCityId = clicked.id;
  hintEl.textContent = `Selected ${clicked.name}. Recruit or move from this city.`;
  refreshUI();
  draw();
}

function attemptMove(targetId) {
  const origin = findCity(state.movingFromId);
  const target = findCity(targetId);
  if (!origin || !target) return;

  if (!origin.neighbors.includes(target.id)) {
    hintEl.textContent = "Destination must be adjacent. Move canceled.";
    state.movingFromId = null;
    draw();
    return;
  }

  moveArmy(origin, target);
  state.movingFromId = null;
  state.selectedCityId = target.id;
  draw();
  refreshUI();
}

function moveArmy(origin, target) {
  if (totalUnits(origin.units) === 0) {
    hintEl.textContent = "No units to move.";
    return;
  }

  const movingUnits = cloneUnits(origin.units);
  origin.units = { infantry: 0, cavalry: 0, archers: 0 };

  if (target.owner === origin.owner) {
    target.units.infantry += movingUnits.infantry;
    target.units.cavalry += movingUnits.cavalry;
    target.units.archers += movingUnits.archers;
    addLog(`Army reinforced ${target.name}.`);
    hintEl.textContent = `Reinforced ${target.name}.`;
    return;
  }

  if (totalUnits(target.units) === 0) {
    target.owner = origin.owner;
    target.units = movingUnits;
    addLog(`${getCurrentPlayer().name} captured ${target.name} without a fight.`);
    hintEl.textContent = `${target.name} captured.`;
    checkVictory();
    return;
  }

  const result = resolveBattle(movingUnits, target.units);
  if (result.winner === "attacker") {
    target.owner = origin.owner;
    target.units = result.remaining;
    addLog(
      `${getCurrentPlayer().name} won at ${target.name}. Remaining ${formatUnits(result.remaining)}.`
    );
    hintEl.textContent = `Victory at ${target.name}!`;
    checkVictory();
  } else {
    target.units = result.remaining;
    addLog(
      `${getOpponentPlayer().name} held ${target.name}. Defenders left ${formatUnits(
        result.remaining
      )}.`
    );
    hintEl.textContent = `Attack on ${target.name} failed.`;
  }
}

function resolveBattle(attacker, defender) {
  // Simple for kids: no randomness, headcount wins. Winner loses units equal to loser headcount.
  const attackerPower = battlePower(attacker);
  const defenderPower = battlePower(defender);

  if (attackerPower === defenderPower) {
    // Tie: defender keeps city, both lose half of defender army.
    return { winner: "defender", remaining: casualtyByCount(defender, Math.floor(defenderPower / 2)) };
  }

  if (attackerPower > defenderPower) {
    const remaining = casualtyByCount(attacker, defenderPower);
    return { winner: "attacker", remaining };
  }

  const remaining = casualtyByCount(defender, attackerPower);
  return { winner: "defender", remaining };
}

function battlePower(units) {
  return totalUnits(units); // every unit = 1 power
}

function casualtyByCount(units, lossCount) {
  const result = { ...units };
  let remainingLoss = lossCount;
  const order = ["infantry", "cavalry", "archers"];
  order.forEach((kind) => {
    const take = Math.min(result[kind], remainingLoss);
    result[kind] -= take;
    remainingLoss -= take;
  });
  return result;
}

function tryRecruit(unitType) {
  if (!state.selectedCityId) {
    hintEl.textContent = "Select your city first.";
    return;
  }
  const city = findCity(state.selectedCityId);
  const player = getCurrentPlayer();
  if (city.owner !== player.id) {
    hintEl.textContent = "You can only recruit in your own city.";
    return;
  }
  const cost = unitCosts[unitType];
  if (player.gold < cost) {
    hintEl.textContent = "Not enough gold.";
    return;
  }
  player.gold -= cost;
  city.units[unitType] += 1;
  addLog(`${player.name} recruited 1 ${unitType} at ${city.name}.`);
  hintEl.textContent = `Recruited ${unitType} in ${city.name}.`;
  refreshUI();
  draw();
}

function startMove() {
  if (!state.selectedCityId) {
    hintEl.textContent = "Select your city to move from.";
    return;
  }
  const city = findCity(state.selectedCityId);
  if (city.owner !== getCurrentPlayer().id) {
    hintEl.textContent = "You can only move from your own city.";
    return;
  }
  if (totalUnits(city.units) === 0) {
    hintEl.textContent = "No units to move.";
    return;
  }
  state.movingFromId = city.id;
  hintEl.textContent = `Moving from ${city.name}. Click an adjacent city.`;
  draw();
}

function cancelMove() {
  state.movingFromId = null;
  hintEl.textContent = "Move canceled.";
  draw();
}

function endTurn() {
  state.movingFromId = null;
  state.selectedCityId = null;
  state.currentPlayerIndex = 1 - state.currentPlayerIndex;
  if (state.currentPlayerIndex === 0) {
    state.turn += 1;
  }
  grantIncome(getCurrentPlayer());
  addLog(`Turn passes to ${getCurrentPlayer().name}.`);
  hintEl.textContent = `${getCurrentPlayer().name}'s turn. Select a city.`;
  refreshUI();
  draw();
}

function refreshUI() {
  const player = getCurrentPlayer();
  turnEl.textContent = state.turn;
  currentPlayerEl.textContent = player.name;
  currentPlayerEl.style.color = player.color;
  goldEl.textContent = player.gold;
  cityCountEl.textContent = cityCount(player.id);
  renderCityInfo();
  renderLog();
}

function renderCityInfo() {
  if (!state.selectedCityId) {
    cityInfo.innerHTML = "<p>Select a city on the map.</p>";
    return;
  }
  const city = findCity(state.selectedCityId);
  const ownerLabel =
    city.owner === "wei" ? `<span class="badge wei">Wei</span>` :
    city.owner === "shu" ? `<span class="badge shu">Shu</span>` :
    `<span class="badge neutral">Neutral</span>`;

  const neighbors = city.neighbors.map((id) => findCity(id)?.name ?? id).join(", ");
  cityInfo.innerHTML = `
    <p><strong>${city.name}</strong> ${ownerLabel}</p>
    <p class="statline">Army: ${formatUnits(city.units)}</p>
    <p class="statline">Neighbors: ${neighbors}</p>
  `;
}

function checkVictory() {
  const opponentCapital = getOpponentPlayer().capital;
  const opponentCapitalCity = findCity(opponentCapital);
  if (opponentCapitalCity && opponentCapitalCity.owner === getCurrentPlayer().id) {
    addLog(`${getCurrentPlayer().name} captured the enemy capital!`);
    hintEl.textContent = `${getCurrentPlayer().name} wins! Reset to play again.`;
    buttons.endTurn.disabled = true;
    buttons.startMove.disabled = true;
    buttons.recruitBtns.forEach((b) => (b.disabled = true));
  }
}

function wireEvents() {
  canvas.addEventListener("click", handleCanvasClick);
  buttons.endTurn.addEventListener("click", endTurn);
  buttons.reset.addEventListener("click", () => {
    buttons.endTurn.disabled = false;
    buttons.startMove.disabled = false;
    buttons.recruitBtns.forEach((b) => (b.disabled = false));
    resetGame();
  });
  buttons.startMove.addEventListener("click", startMove);
  buttons.cancelMove.addEventListener("click", cancelMove);
  buttons.recruitBtns.forEach((btn) =>
    btn.addEventListener("click", () => tryRecruit(btn.dataset.unit))
  );
}

wireEvents();
resetGame();

