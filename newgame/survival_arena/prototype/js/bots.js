/**
 * 疾锋战区 — Bot AI（8v8 分队、搜刮期、友军不互伤）
 */
const BOT_NAMES_ALPHA = ['灰岩先锋', '蓝盾', '疾锋1号', '港湾', '北风', '铁壁', '猎鹰'];
const BOT_NAMES_BRAVO = ['赤潮', '暗影', '夜行', '碎冰', '雷鸣', '幽灵', '钢铁', '疾风'];

function randomBotName(team, used) {
  const pool = (team === TEAM_ALPHA ? BOT_NAMES_ALPHA : BOT_NAMES_BRAVO)
    .filter((n) => !used.has(n));
  const name = pool[Math.floor(Math.random() * pool.length)] || `队员_${used.size}`;
  used.add(name);
  return name;
}

function createBot(id, name, x, y, team) {
  return {
    id,
    name,
    x,
    y,
    angle: Math.random() * Math.PI * 2,
    hp: 100,
    alive: true,
    isPlayer: false,
    isBot: true,
    team,
    weaponId: null,
    ammo: 0,
    magSize: 0,
    reloading: false,
    reloadTimer: 0,
    fireCooldown: 0,
    target: null,
    state: 'loot',
    stateTimer: 2,
    wanderAngle: Math.random() * Math.PI * 2,
    kills: 0,
    radius: 14,
    speed: 100 + Math.random() * 30,
    accuracy: 0.06 + Math.random() * 0.06,
    parachuting: true,
    landed: false,
    lootTarget: null,
  };
}

function spawnPlaneX(index, total) {
  const margin = MAP_SIZE * 0.15;
  return margin + (index / (total - 1)) * (MAP_SIZE - 2 * margin);
}

function spawnTeams() {
  const bots = [];
  const usedAlpha = new Set();
  const usedBravo = new Set();
  let idx = 0;
  // 7 队友（蓝队）
  for (let i = 0; i < 7; i++) {
    const x = spawnPlaneX(idx++, 16);
    bots.push(createBot(`bot_a_${i}`, randomBotName(TEAM_ALPHA, usedAlpha), x, 60, TEAM_ALPHA));
  }
  // 8 敌人（红队）
  for (let i = 0; i < 8; i++) {
    const x = spawnPlaneX(idx++, 16);
    bots.push(createBot(`bot_b_${i}`, randomBotName(TEAM_BRAVO, usedBravo), x, 60, TEAM_BRAVO));
  }
  return bots;
}

function isEnemy(a, b) {
  return a.team !== b.team;
}

function isLootPhase(matchTime) {
  const sec = typeof window !== 'undefined' && window.CURRENT_LOOT_PHASE
    ? window.CURRENT_LOOT_PHASE
    : LOOT_PHASE_SEC;
  return matchTime < sec;
}

function findLootTarget(bot, lootItems) {
  let best = null;
  let bestD = 400;
  for (const item of lootItems) {
    if (item.taken) continue;
    const d = Math.hypot(item.x - bot.x, item.y - bot.y);
    if (d < bestD) {
      bestD = d;
      best = item;
    }
  }
  return best;
}

function tryPickupBot(bot, lootItems) {
  for (let i = lootItems.length - 1; i >= 0; i--) {
    const item = lootItems[i];
    if (item.taken) continue;
    if (Math.hypot(item.x - bot.x, item.y - bot.y) < 28) {
      applyLoot(bot, item);
      item.taken = true;
    }
  }
}

function applyLoot(entity, item) {
  switch (item.type) {
    case 'weapon_ar':
      entity.weaponId = 'ar_alpha';
      const wa = getWeapon('ar_alpha');
      entity.magSize = wa.magSize;
      entity.ammo = wa.magSize;
      break;
    case 'weapon_smg':
      entity.weaponId = 'smg_beta';
      const ws = getWeapon('smg_beta');
      entity.magSize = ws.magSize;
      entity.ammo = ws.magSize;
      break;
    case 'med':
      entity.hp = Math.min(100, entity.hp + 35);
      break;
    case 'ammo':
      if (entity.weaponId) entity.ammo = Math.min(entity.magSize, entity.ammo + 20);
      break;
  }
}


function updateBot(bot, dt, entities, zone, lootItems, matchTime, onShoot) {
  if (!bot.alive) return;
  if (bot.parachuting) return;

  const weapon = bot.weaponId ? getWeapon(bot.weaponId) : null;
  bot.fireCooldown = Math.max(0, bot.fireCooldown - dt);

  if (bot.reloading && weapon) {
    bot.reloadTimer -= dt;
    if (bot.reloadTimer <= 0) {
      bot.reloading = false;
      bot.ammo = bot.magSize;
    }
    return;
  }

  const outside = zone.isOutside(bot.x, bot.y);
  const toCenter = Math.atan2(zone.centerY - bot.y, zone.centerX - bot.x);
  const looting = isLootPhase(matchTime);

  if (!bot.weaponId || (looting && bot.ammo < 5)) {
    const loot = findLootTarget(bot, lootItems);
    if (loot) {
      bot.angle = Math.atan2(loot.y - bot.y, loot.x - bot.x);
      const d = Math.hypot(loot.x - bot.x, loot.y - bot.y);
      if (d > 20) {
        bot.x += Math.cos(bot.angle) * bot.speed * dt;
        bot.y += Math.sin(bot.angle) * bot.speed * dt;
      }
      tryPickupBot(bot, lootItems);
      resolveWallCollision(bot);
      return;
    }
  }

  tryPickupBot(bot, lootItems);

  let nearest = null;
  let nearestDist = looting ? 180 : 420;
  for (const e of entities) {
    if (!e.alive || e.id === bot.id || !isEnemy(bot, e)) continue;
    if (looting && e.isPlayer) continue;
    const d = Math.hypot(e.x - bot.x, e.y - bot.y);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = e;
    }
  }

  if (outside) {
    bot.x += Math.cos(toCenter) * bot.speed * 1.3 * dt;
    bot.y += Math.sin(toCenter) * bot.speed * 1.3 * dt;
  } else if (nearest && nearestDist < 420 && bot.weaponId) {
    bot.angle = Math.atan2(nearest.y - bot.y, nearest.x - bot.x);
    const dist = nearestDist;
    if (dist > 150) {
      bot.x += Math.cos(bot.angle) * bot.speed * 0.85 * dt;
      bot.y += Math.sin(bot.angle) * bot.speed * 0.85 * dt;
    } else if (dist < 70) {
      bot.x -= Math.cos(bot.angle) * bot.speed * 0.4 * dt;
      bot.y -= Math.sin(bot.angle) * bot.speed * 0.4 * dt;
    }
    if (bot.fireCooldown <= 0 && bot.ammo > 0 && weapon) {
      const acc = looting ? bot.accuracy * 0.4 : bot.accuracy;
      if (Math.random() < acc) {
        onShoot(bot, bot.angle + (Math.random() - 0.5) * 0.25);
        bot.ammo -= 1;
        bot.fireCooldown = weapon.fireRate;
      }
      if (bot.ammo <= 0) {
        bot.reloading = true;
        bot.reloadTimer = weapon.reloadTime;
      }
    }
  } else {
    bot.stateTimer -= dt;
    if (bot.stateTimer <= 0) {
      bot.wanderAngle = Math.random() * Math.PI * 2;
      bot.stateTimer = 2 + Math.random() * 3;
    }
    const ax = Math.cos(bot.wanderAngle) * 0.6 + Math.cos(toCenter) * 0.25;
    const ay = Math.sin(bot.wanderAngle) * 0.6 + Math.sin(toCenter) * 0.25;
    const len = Math.hypot(ax, ay) || 1;
    bot.x += (ax / len) * bot.speed * 0.5 * dt;
    bot.y += (ay / len) * bot.speed * 0.5 * dt;
    bot.angle = Math.atan2(ay, ax);
  }

  bot.x = Math.max(40, Math.min(MAP_SIZE - 40, bot.x));
  bot.y = Math.max(40, Math.min(MAP_SIZE - 40, bot.y));
  resolveWallCollision(bot);
}
