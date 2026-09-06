/**
 * 疾锋战区 — 额外玩法：靶场 / 夺宝 / 团竞
 */
const AlternateModes = (() => {
  let active = false;
  let modeId = null;
  let canvas, ctx;
  let keys = {};
  let mouse = { x: 0, y: 0, down: false };
  let player = null;
  let entities = [];
  let bullets = [];
  let targets = [];
  let lootItems = [];
  let matchTime = 0;
  let score = 0;
  let lootCollected = 0;
  let lastReward = 0;
  let onEnd = null;
  let ended = false;

  const ARENA = 900;
  const VIEW_SCALE = 1.1;
  const MAX_BULLETS = 80;

  function addBullet(b) {
    if (bullets.length >= MAX_BULLETS) bullets.splice(0, bullets.length - MAX_BULLETS + 1);
    bullets.push(b);
  }

  function syncPlayerHud() {
    if (!player) return;
    const hudHp = document.getElementById('hudHp');
    const hudWeapon = document.getElementById('hudWeapon');
    const hudAmmo = document.getElementById('hudAmmo');
    if (hudHp) hudHp.textContent = Math.ceil(player.hp);
    if (hudWeapon) {
      hudWeapon.textContent = player.weaponId
        ? getWeapon(player.weaponId).name
        : '无武器 — 进门搜刮';
    }
    if (hudAmmo) {
      hudAmmo.textContent = player.weaponId
        ? `${player.ammo}/${player.magSize}`
        : '—';
    }
  }

  function updateBulletsArena(dt, arenaSize, hitEntities) {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.life <= 0 || b.x < -40 || b.y < -40 || b.x > arenaSize + 40 || b.y > arenaSize + 40) {
        bullets.splice(i, 1);
        continue;
      }
      if (!hitEntities) continue;
      for (const e of hitEntities) {
        if (!e.alive || e.id === b.ownerId || e.team === b.ownerTeam) continue;
        if (Math.hypot(e.x - b.x, e.y - b.y) < e.radius + 4) {
          e.hp -= b.damage;
          if (e.hp <= 0) {
            e.alive = false;
            if (b.ownerId === 'player') player.kills++;
          }
          bullets.splice(i, 1);
          break;
        }
      }
    }
  }

  function bindInput() {
    window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
  }

  function makePlayer(x, y, team, withGun) {
    const w = withGun ? getWeapon('ar_alpha') : null;
    return {
      id: 'player', name: '你', x, y, angle: 0, hp: 100, alive: true,
      isPlayer: true, isBot: false, team,
      weaponId: withGun ? 'ar_alpha' : null,
      ammo: withGun ? w.magSize : 0,
      magSize: withGun ? w.magSize : 0,
      reloading: false, reloadTimer: 0, fireCooldown: 0,
      kills: 0, radius: 14, speed: 170, landed: true, parachuting: false,
    };
  }

  function start(mode, cvs, context, endCallback) {
    active = true;
    ended = false;
    modeId = mode.id;
    canvas = cvs;
    ctx = context;
    onEnd = endCallback;
    matchTime = 0;
    score = 0;
    lootCollected = 0;
    bullets = [];
    keys = {};
    mouse = { x: 0, y: 0, down: false };

    if (modeId === 'training') startTraining();
    else if (modeId === 'scavenge') startScavenge();
    else if (modeId === 'tdm_4v4') startTdm();
    syncPlayerHud();
    Analytics.track('match_start', { mode: modeId });
    Analytics.startSession();
  }

  function stop() {
    active = false;
    ended = true;
    modeId = null;
    bullets = [];
    mouse.down = false;
  }

  function forceEnd(title, stats) {
    if (ended) return;
    const result = { title, stats, reward: lastReward || 0 };
    try {
      window.GameUI?.showMatchResult({
        ...result,
        modeName: GAME_MODES[modeId]?.name || '训练',
      });
      if (onEnd) onEnd(result);
    } catch (e) {
      console.error('强制结算失败', e);
    }
    ended = true;
    active = false;
    bullets = [];
    mouse.down = false;
    Analytics.endSession();
    modeId = null;
    player = null;
  }

  function isActive() {
    return active && !ended;
  }

  function isEnded() {
    return ended;
  }

  function getLastReward() {
    return lastReward;
  }

  // —— 靶场训练 ——
  function startTraining() {
    player = makePlayer(ARENA / 2, ARENA / 2, TEAM_ALPHA, true);
    entities = [];
    targets = [];
    spawnTarget();
  }

  function spawnTarget() {
    targets.push({
      x: 80 + Math.random() * (ARENA - 160),
      y: 80 + Math.random() * (ARENA - 160),
      radius: 22,
      hp: 3,
      vx: (Math.random() - 0.5) * 80,
      vy: (Math.random() - 0.5) * 80,
      color: '#ffaa44',
    });
  }

  function updateTraining(dt) {
    if (ended) return;
    matchTime += dt;
    if (matchTime >= 60) {
      endAlt('training', '靶场训练结束');
      return;
    }

    let mx = 0, my = 0;
    if (keys['w']) my -= 1;
    if (keys['s']) my += 1;
    if (keys['a']) mx -= 1;
    if (keys['d']) mx += 1;
    if (mx || my) {
      const len = Math.hypot(mx, my) || 1;
      player.x += (mx / len) * player.speed * dt;
      player.y += (my / len) * player.speed * dt;
    }
    player.x = Math.max(30, Math.min(ARENA - 30, player.x));
    player.y = Math.max(30, Math.min(ARENA - 30, player.y));
    const wx = (mouse.x - canvas.width / 2) / VIEW_SCALE + player.x;
    const wy = (mouse.y - canvas.height / 2) / VIEW_SCALE + player.y;
    player.angle = Math.atan2(wy - player.y, wx - player.x);

    const w = getWeapon('ar_alpha');
    player.fireCooldown = Math.max(0, player.fireCooldown - dt);
    if (player.reloading) {
      player.reloadTimer -= dt;
      if (player.reloadTimer <= 0) {
        player.reloading = false;
        player.ammo = w.magSize;
      }
    } else if (mouse.down && player.fireCooldown <= 0 && player.ammo > 0) {
      addBullet({
        x: player.x + Math.cos(player.angle) * 18,
        y: player.y + Math.sin(player.angle) * 18,
        vx: Math.cos(player.angle) * w.bulletSpeed,
        vy: Math.sin(player.angle) * w.bulletSpeed,
        damage: w.damage,
        life: 1.0,
        color: w.color,
        hitTarget: true,
      });
      player.ammo--;
      player.fireCooldown = w.fireRate;
      if (player.ammo <= 0) {
        player.reloading = true;
        player.reloadTimer = w.reloadTime;
      }
    }

    for (const t of targets) {
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      if (t.x < 40 || t.x > ARENA - 40) t.vx *= -1;
      if (t.y < 40 || t.y > ARENA - 40) t.vy *= -1;
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.life <= 0 || b.x < -40 || b.y < -40 || b.x > ARENA + 40 || b.y > ARENA + 40) {
        bullets.splice(i, 1);
        continue;
      }
      if (!b.hitTarget) continue;
      for (let j = targets.length - 1; j >= 0; j--) {
        const t = targets[j];
        if (Math.hypot(t.x - b.x, t.y - b.y) < t.radius) {
          t.hp--;
          bullets.splice(i, 1);
          if (t.hp <= 0) {
            targets.splice(j, 1);
            score += 10;
            spawnTarget();
            if (targets.length < 3) spawnTarget();
          }
          break;
        }
      }
    }
    updateAltHud('训练', `得分 ${score}`, formatTime(Math.max(0, 60 - matchTime)));
    syncPlayerHud();
  }

  function drawTraining() {
    drawArenaBg();
    for (const t of targets) {
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('靶', t.x, t.y + 4);
    }
    drawHuman(ctx, player);
    drawBullets();
  }

  // —— 夺宝冲刺 ——
  function startScavenge() {
    // 出生在便利店附近，避免空地图中间看不到建筑
    player = makePlayer(420, 480, TEAM_ALPHA, false);
    entities = [];
    lootItems = spawnBuildingLoot();
    lootCollected = 0;
  }

  function updateScavenge(dt) {
    if (ended) return;
    matchTime += dt;
    if (matchTime >= 180) {
      endAlt('scavenge', '夺宝时间到');
      return;
    }
    if (lootCollected >= 20) {
      endAlt('scavenge', '夺宝完成！');
      return;
    }

    let mx = 0, my = 0;
    if (keys['w']) my -= 1;
    if (keys['s']) my += 1;
    if (keys['a']) mx -= 1;
    if (keys['d']) mx += 1;
    if (mx || my) {
      const len = Math.hypot(mx, my) || 1;
      player.x += (mx / len) * player.speed * dt;
      player.y += (my / len) * player.speed * dt;
    }
    player.x = Math.max(40, Math.min(MAP_SIZE - 40, player.x));
    player.y = Math.max(40, Math.min(MAP_SIZE - 40, player.y));
    resolveWallCollision(player);
    const scale = 0.85;
    const wx = (mouse.x - canvas.width / 2) / scale + player.x;
    const wy = (mouse.y - canvas.height / 2) / scale + player.y;
    player.angle = Math.atan2(wy - player.y, wx - player.x);

    const inB = getBuildingAt(player.x, player.y);
    for (const item of lootItems) {
      if (item.taken) continue;
      const b = BUILDINGS.find((x) => x.id === item.buildingId);
      if (inB && b && isInsideBuilding(item.x, item.y, b) &&
          Math.hypot(item.x - player.x, item.y - player.y) < 32) {
        applyLoot(player, item);
        item.taken = true;
        lootCollected++;
      }
    }
    updateAltHud('夺宝', `已收集 ${lootCollected}/20`, formatTime(180 - matchTime));
    syncPlayerHud();
  }

  function drawScavenge() {
    drawMapBg();
    drawBuildings(ctx);
    const inB = getBuildingAt(player.x, player.y);
    for (const item of lootItems) {
      if (item.taken) continue;
      const b = BUILDINGS.find((x) => x.id === item.buildingId);
      if (inB && b && isInsideBuilding(player.x, player.y, b)) drawLootItem(ctx, item);
    }
    drawHuman(ctx, player);
  }

  // —— 4v4 团竞 ——
  function startTdm() {
    const cx = ARENA / 2;
    player = makePlayer(cx - 80, ARENA / 2, TEAM_ALPHA, true);
    const w = getWeapon('smg_beta');
    player.weaponId = 'smg_beta';
    player.magSize = w.magSize;
    player.ammo = w.magSize;
    entities = [];
    for (let i = 0; i < 3; i++) {
      entities.push(createBot(`ally_${i}`, `队友${i + 1}`, cx - 100 + i * 40, ARENA / 2 + 60, TEAM_ALPHA));
      entities.slice(-1)[0].weaponId = 'ar_alpha';
      entities.slice(-1)[0].ammo = 30;
      entities.slice(-1)[0].magSize = 30;
      entities.slice(-1)[0].landed = true;
      entities.slice(-1)[0].parachuting = false;
    }
    for (let i = 0; i < 4; i++) {
      entities.push(createBot(`enemy_${i}`, `敌军${i + 1}`, cx + 80 + i * 35, ARENA / 2 - 40 + i * 30, TEAM_BRAVO));
      const bot = entities[entities.length - 1];
      bot.weaponId = 'ar_alpha';
      bot.ammo = 30;
      bot.magSize = 30;
      bot.landed = true;
      bot.parachuting = false;
      bot.accuracy = 0.08;
    }
  }

  function updateTdm(dt) {
    if (ended) return;
    matchTime += dt;
    if (matchTime >= 300) {
      endAlt('tdm', '团竞时间到');
      return;
    }

    let mx = 0, my = 0;
    if (keys['w']) my -= 1;
    if (keys['s']) my += 1;
    if (keys['a']) mx -= 1;
    if (keys['d']) mx += 1;
    if (mx || my) {
      const len = Math.hypot(mx, my) || 1;
      player.x += (mx / len) * player.speed * dt;
      player.y += (my / len) * player.speed * dt;
    }
    player.x = Math.max(40, Math.min(ARENA - 40, player.x));
    player.y = Math.max(40, Math.min(ARENA - 40, player.y));

    const wx = (mouse.x - canvas.width / 2) / VIEW_SCALE + player.x;
    const wy = (mouse.y - canvas.height / 2) / VIEW_SCALE + player.y;
    player.angle = Math.atan2(wy - player.y, wx - player.x);

    const w = getWeapon(player.weaponId);
    player.fireCooldown = Math.max(0, player.fireCooldown - dt);

    if (player.reloading) {
      player.reloadTimer -= dt;
      if (player.reloadTimer <= 0) {
        player.reloading = false;
        player.ammo = player.magSize;
      }
    } else if (mouse.down && player.fireCooldown <= 0 && player.ammo > 0) {
      addBullet({
        x: player.x + Math.cos(player.angle) * 18,
        y: player.y + Math.sin(player.angle) * 18,
        vx: Math.cos(player.angle) * w.bulletSpeed,
        vy: Math.sin(player.angle) * w.bulletSpeed,
        damage: w.damage,
        ownerId: 'player',
        ownerTeam: TEAM_ALPHA,
        life: 0.9,
        color: w.color,
      });
      player.ammo--;
      player.fireCooldown = w.fireRate;
      if (player.ammo <= 0) {
        player.reloading = true;
        player.reloadTimer = w.reloadTime;
      }
    }

    const fakeZone = { isOutside: () => false, centerX: 0, centerY: 0 };
    for (const bot of entities) {
      if (!bot.isBot || !bot.alive) continue;
      updateBot(bot, dt, [player, ...entities], fakeZone, [], matchTime + 120, (e, a) => {
        if (bullets.length >= MAX_BULLETS) return;
        const ww = getWeapon(e.weaponId);
        addBullet({
          x: e.x + Math.cos(a) * 18,
          y: e.y + Math.sin(a) * 18,
          vx: Math.cos(a) * ww.bulletSpeed,
          vy: Math.sin(a) * ww.bulletSpeed,
          damage: ww.damage * 0.7,
          ownerId: e.id,
          ownerTeam: e.team,
          life: 0.9,
          color: ww.color,
        });
      });
      bot.x = Math.max(40, Math.min(ARENA - 40, bot.x));
      bot.y = Math.max(40, Math.min(ARENA - 40, bot.y));
    }

    updateBulletsArena(dt, ARENA, [player, ...entities]);

    const blueKills = player.kills + entities.filter((e) => e.isBot && e.team === TEAM_ALPHA).reduce((s, e) => s + e.kills, 0);
    const redAlive = entities.filter((e) => e.alive && e.team === TEAM_BRAVO).length;
    if (redAlive === 0) {
      endAlt('tdm', '蓝队胜利！');
      return;
    }
    updateAltHud('团竞', `击杀 ${player.kills} · 蓝队分 ${blueKills}`, formatTime(300 - matchTime));
    syncPlayerHud();
  }

  function drawTdm() {
    drawArenaBg();
    for (const e of entities) {
      if (e.alive) drawHuman(ctx, e);
    }
    drawHuman(ctx, player);
    drawBullets();
  }

  function endAlt(modeKey, title) {
    if (ended || !active) return;

    let base = 0;
    if (modeKey === 'training') base = score * 3 + 20;
    else if (modeKey === 'scavenge') base = lootCollected * 25 + 30;
    else if (modeKey === 'tdm') base = (player?.kills || 0) * 40 + 50;

    const modeDef = GAME_MODES[modeId] || {};
    base = Math.floor(base * (modeDef.rewardMult || 1));

    let reward = base;
    try {
      reward = Monetization.applyMatchReward(base);
    } catch (e) {
      console.error('奖励结算失败', e);
      try { Monetization.addCoins(base); } catch (_) { /* ignore */ }
      reward = base;
    }
    lastReward = reward;

    let statsText;
    if (modeKey === 'training') {
      statsText = `得分 ${score} · 命中约 ${Math.floor(score / 10)} 个 · +${reward} 战区币`;
    } else if (modeKey === 'scavenge') {
      statsText = `收集 ${lootCollected}/20 件 · +${reward} 战区币`;
    } else {
      statsText = `击杀 ${player?.kills || 0} · +${reward} 战区币`;
    }

    Analytics.track('match_end', {
      mode: modeId,
      reward,
      score,
      kills: player?.kills,
    });
    Analytics.endSession();

    const result = { title, stats: statsText, reward };
    const modeName = modeDef.name || modeId;
    const savedOnEnd = onEnd;

    try {
      if (window.GameUI?.showMatchResult) {
        window.GameUI.showMatchResult({ ...result, modeName });
      }
      if (savedOnEnd) savedOnEnd(result);
    } catch (e) {
      console.error('结算界面显示失败', e);
      try {
        window.GameUI?.showMatchResult({
          title: title || '对局结束',
          stats: statsText,
          modeName,
        });
      } catch (_) { /* ignore */ }
    }

    ended = true;
    active = false;
    mouse.down = false;
    bullets = [];
    modeId = null;
    player = null;
  }

  function update(dt) {
    if (!active || ended) return;
    if (modeId === 'training') updateTraining(dt);
    else if (modeId === 'scavenge') updateScavenge(dt);
    else if (modeId === 'tdm_4v4') updateTdm(dt);
    Monetization.refreshCoinHud();
  }

  function draw() {
    if (!active || ended || !ctx || !player) return;
    const scale = modeId === 'scavenge' ? 0.85 : VIEW_SCALE;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-player.x, -player.y);
    if (modeId === 'training') drawTraining();
    else if (modeId === 'scavenge') drawScavenge();
    else if (modeId === 'tdm_4v4') drawTdm();
    ctx.restore();
  }

  function drawArenaBg() {
    const grad = ctx.createLinearGradient(0, 0, ARENA, ARENA);
    grad.addColorStop(0, '#2a3438');
    grad.addColorStop(1, '#1e262c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, ARENA, ARENA);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < ARENA; i += 60) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, ARENA);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(ARENA, i);
      ctx.stroke();
    }
    // 训练场标靶区标记
    ctx.strokeStyle = 'rgba(200,180,120,0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, ARENA - 80, ARENA - 80);
  }

  function drawMapBg() {
    drawTerrain(ctx, MAP_SIZE);
  }

  function drawBullets() {
    for (const b of bullets) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
    }
  }

  function formatTime(t) {
    t = Math.max(0, t);
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function updateAltHud(modeName, line2, timeStr) {
    const el = document.getElementById('hudTeam');
    if (el) el.textContent = modeName;
    const alive = document.getElementById('hudAlive');
    if (alive) alive.textContent = line2;
    const time = document.getElementById('hudTime');
    if (time) time.textContent = timeStr;
    const zone = document.getElementById('hudZone');
    if (zone) zone.textContent = getSelectedMode().name;
    if (player) {
      document.getElementById('hudHp').textContent = Math.ceil(player.hp);
      const killsEl = document.getElementById('hudKills');
      if (killsEl) {
        if (modeName === '训练') killsEl.textContent = Math.floor(score / 10);
        else killsEl.textContent = player.kills || lootCollected || 0;
      }
    }
  }

  function setMouse(x, y, down) {
    mouse.x = x;
    mouse.y = y;
    if (down !== undefined) mouse.down = down;
  }

  return { start, stop, forceEnd, isActive, isEnded, update, draw, getLastReward, setMouse, bindInput };
})();

AlternateModes.bindInput();
