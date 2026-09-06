/**
 * 疾锋战区 — 主游戏（8v8、跳伞、建筑搜刮、人物造型）
 */
(function () {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  let player = null;
  let entities = [];
  let bullets = [];
  let lootItems = [];
  let zone = new Zone();
  let matchActive = false;
  let matchPhase = 'idle'; // idle | parachute | playing
  let matchTime = 0;
  let lastReward = 0;
  let keys = {};
  let mouse = { x: 0, y: 0, down: false };
  let lastMatchStats = null;
  let currentMode = getSelectedMode();

  const VIEW_SCALE = 0.85;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function createPlayer(team) {
    const x = spawnPlaneX(0, 16);
    return {
      id: 'player',
      name: '你',
      x,
      y: 50,
      angle: 0,
      hp: 100,
      alive: true,
      isPlayer: true,
      isBot: false,
      team,
      weaponId: null,
      ammo: 0,
      magSize: 0,
      reloading: false,
      reloadTimer: 0,
      fireCooldown: 0,
      kills: 0,
      radius: 14,
      speed: 165,
      parachuting: true,
      landed: false,
    };
  }

  function countAlive(team) {
    return entities.filter((e) => e.alive && e.team === team).length;
  }

  function countAliveTotal() {
    return entities.filter((e) => e.alive).length;
  }

  function startMatch() {
    currentMode = getSelectedMode();
    document.getElementById('startScreen')?.classList.add('hidden');
    document.getElementById('matchOverlay')?.classList.add('hidden');

    if (currentMode.type === 'alt') {
      matchActive = false;
      AlternateModes.start(currentMode, canvas, ctx, (result) => {
        lastReward = result.reward;
        showMatchResult({
          title: result.title,
          stats: result.stats,
          modeName: currentMode.name,
        });
      });
      return;
    }

    document.getElementById('parachuteHint')?.classList.remove('hidden');

    zone.reset();
    player = createPlayer(TEAM_ALPHA);
    applyStartBoosts(player);
    entities = [player, ...spawnTeams()];
    bullets = [];
    lootItems = spawnBuildingLoot();
    window.CURRENT_LOOT_PHASE = currentMode.lootPhase || LOOT_PHASE_SEC;
    matchActive = true;
    matchPhase = 'parachute';
    matchTime = 0;
    lastReward = 0;

    Analytics.track('match_start', { mode: currentMode.id });
    Analytics.startSession();
    updateHud();
  }

  function applyStartBoosts(p) {
    if (Monetization.hasBoost('cs_boost_armor')) {
      p.hp = 120;
      Monetization.consumeBoost('cs_boost_armor');
    }
  }

  function allLanded() {
    return entities.every((e) => !e.alive || e.landed);
  }

  function updateParachutePhase(dt) {
    for (const e of entities) {
      if (!e.alive || !e.parachuting) continue;
      if (e.isPlayer) {
        let mx = 0;
        if (keys['a'] || keys['arrowleft']) mx -= 1;
        if (keys['d'] || keys['arrowright']) mx += 1;
        e.x += mx * 140 * dt;
        const worldMouseX = (mouse.x - canvas.width / 2) / VIEW_SCALE + e.x;
        const worldMouseY = (mouse.y - canvas.height / 2) / VIEW_SCALE + e.y;
        e.angle = Math.atan2(worldMouseY - e.y, worldMouseX - e.x);
        e.x = Math.max(60, Math.min(MAP_SIZE - 60, e.x));
      } else {
        e.x += (Math.sin(e.id.length) * 0.5) * 40 * dt;
      }
      e.y += PARACHUTE_FALL_SPEED * dt;
      const landY = 320 + (e.id.charCodeAt(e.id.length - 1) % 12) * 55;
      if (e.y >= landY) {
        e.parachuting = false;
        e.landed = true;
        e.y = Math.min(e.y, MAP_SIZE - 100);
        e.x = Math.max(80, Math.min(MAP_SIZE - 80, e.x));
      }
    }
    if (allLanded()) {
      matchPhase = 'playing';
      document.getElementById('parachuteHint')?.classList.add('hidden');
      document.getElementById('lootHint')?.classList.remove('hidden');
      setTimeout(() => document.getElementById('lootHint')?.classList.add('hidden'), 6000);
    }
  }

  function canShoot(entity) {
    return entity.weaponId && entity.ammo > 0 && !entity.reloading &&
      !entity.parachuting && entity.landed;
  }

  function shootEntity(entity, angle) {
    if (!canShoot(entity)) return;
    const w = getWeapon(entity.weaponId);
    bullets.push({
      x: entity.x + Math.cos(angle) * 18,
      y: entity.y + Math.sin(angle) * 18,
      vx: Math.cos(angle) * w.bulletSpeed,
      vy: Math.sin(angle) * w.bulletSpeed,
      damage: w.damage,
      ownerId: entity.id,
      ownerTeam: entity.team,
      life: w.range / w.bulletSpeed,
      color: w.color,
    });
  }

  function damageEntity(target, amount, attacker) {
    if (!target.alive) return;
    target.hp -= amount;
    if (target.hp <= 0) {
      target.alive = false;
      if (attacker && attacker.id === 'player') attacker.kills++;
      if (attacker && attacker.isBot) attacker.kills++;
    }
  }

  function tryPickupPlayer() {
    if (!player || !player.landed) return;
    for (const item of lootItems) {
      if (item.taken) continue;
      const inBuilding = getBuildingAt(player.x, player.y);
      const itemBuilding = BUILDINGS.find((b) => b.id === item.buildingId);
      const canPick = inBuilding && itemBuilding && isInsideBuilding(item.x, item.y, itemBuilding);
      if (canPick && Math.hypot(item.x - player.x, item.y - player.y) < 32) {
        applyLoot(player, item);
        item.taken = true;
        showPickupMsg(item.type);
      }
    }
  }

  function showPickupMsg(type) {
    const el = document.getElementById('pickupMsg');
    if (!el) return;
    const labels = { weapon_ar: '获得：阿尔法步枪', weapon_smg: '获得：贝塔冲锋', med: '使用医疗包', ammo: '获得弹药' };
    el.textContent = labels[type] || '拾取';
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 1500);
  }

  function updatePlayer(dt) {
    if (!player.alive || matchPhase === 'parachute') return;

    const w = player.weaponId ? getWeapon(player.weaponId) : null;
    player.fireCooldown = Math.max(0, player.fireCooldown - dt);

    if (player.reloading && w) {
      player.reloadTimer -= dt;
      if (player.reloadTimer <= 0) {
        player.reloading = false;
        player.ammo = player.magSize;
      }
      return;
    }

    let mx = 0, my = 0;
    if (keys['w'] || keys['arrowup']) my -= 1;
    if (keys['s'] || keys['arrowdown']) my += 1;
    if (keys['a'] || keys['arrowleft']) mx -= 1;
    if (keys['d'] || keys['arrowright']) mx += 1;
    if (mx || my) {
      const len = Math.hypot(mx, my) || 1;
      player.x += (mx / len) * player.speed * dt;
      player.y += (my / len) * player.speed * dt;
    }
    player.x = Math.max(40, Math.min(MAP_SIZE - 40, player.x));
    player.y = Math.max(40, Math.min(MAP_SIZE - 40, player.y));
    resolveWallCollision(player);

    const worldMouseX = (mouse.x - canvas.width / 2) / VIEW_SCALE + player.x;
    const worldMouseY = (mouse.y - canvas.height / 2) / VIEW_SCALE + player.y;
    player.angle = Math.atan2(worldMouseY - player.y, worldMouseX - player.x);

    if (mouse.down && canShoot(player) && player.fireCooldown <= 0) {
      const spread = (Math.random() - 0.5) * w.spread;
      shootEntity(player, player.angle + spread);
      player.ammo--;
      player.fireCooldown = w.fireRate;
      if (player.ammo <= 0) {
        player.reloading = true;
        player.reloadTimer = w.reloadTime;
      }
    }

    if (keys['q'] && player.weaponId === 'smg_beta') switchWeapon('ar_alpha');
    if (keys['e'] && player.weaponId === 'ar_alpha') switchWeapon('smg_beta');
    if (keys['r'] && w && !player.reloading && player.ammo < player.magSize) {
      player.reloading = true;
      player.reloadTimer = w.reloadTime;
    }

    tryPickupPlayer();

    const b = getBuildingAt(player.x, player.y);
    const hint = document.getElementById('buildingHint');
    if (hint) {
      if (b) hint.textContent = `📍 ${b.name} — 从门口进入，屋内拾取装备`;
      else if (nearBuildingDoor(player.x, player.y)) hint.textContent = '门前 — 走进门进入建筑';
      else hint.textContent = '';
    }

    if (zone.isOutside(player.x, player.y)) {
      player.hp -= zone.getDamagePerSecond() * dt;
      showZoneWarn(true);
      if (player.hp <= 0) player.alive = false;
    } else {
      showZoneWarn(false);
    }
  }

  function switchWeapon(id) {
    if (!player || player.weaponId === id) return;
    player.weaponId = id;
    const w = getWeapon(id);
    player.magSize = w.magSize;
    player.ammo = w.magSize;
    player.reloading = false;
  }

  function showZoneWarn(on) {
    document.getElementById('zoneWarn')?.classList.toggle('show', on);
  }

  function updateBullets(dt) {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.life <= 0 || b.x < 0 || b.y < 0 || b.x > MAP_SIZE || b.y > MAP_SIZE) {
        bullets.splice(i, 1);
        continue;
      }
      for (const e of entities) {
        if (!e.alive || e.id === b.ownerId) continue;
        if (e.team === b.ownerTeam) continue; // 队友不伤
        if (Math.hypot(e.x - b.x, e.y - b.y) < e.radius + 4) {
          const attacker = entities.find((x) => x.id === b.ownerId);
          damageEntity(e, b.damage, attacker);
          bullets.splice(i, 1);
          break;
        }
      }
    }
  }

  function updateBots(dt) {
    if (matchPhase !== 'playing') return;
    for (const bot of entities) {
      if (!bot.isBot) continue;
      updateBot(bot, dt, entities, zone, lootItems, matchTime, shootEntity);
      if (bot.alive && bot.landed && zone.isOutside(bot.x, bot.y)) {
        bot.hp -= zone.getDamagePerSecond() * dt;
        if (bot.hp <= 0) bot.alive = false;
      }
    }
  }

  function checkMatchEnd() {
    if (!matchActive || matchPhase === 'parachute') return;

    const alphaAlive = countAlive(TEAM_ALPHA);
    const bravoAlive = countAlive(TEAM_BRAVO);
    const teamWin = alphaAlive === 0 || bravoAlive === 0;
    const playerDead = !player.alive;
    const duration = currentMode.matchDuration || MATCH_DURATION;
    const timeout = matchTime >= duration;

    if (teamWin || playerDead || timeout) {
      const won = player.alive && (bravoAlive === 0 || (timeout && alphaAlive > bravoAlive));
      endMatch(won, playerDead, timeout, alphaAlive, bravoAlive);
    }
  }

  function endMatch(won, dead, timeout, alphaAlive, bravoAlive) {
    matchActive = false;
    matchPhase = 'idle';
    const rank = won ? 1 : (player.alive ? alphaAlive : alphaAlive + 1);
    const survivalScore = Math.floor(matchTime * 2);
    const killScore = player.kills * 50;
    let reward = 15 + killScore + survivalScore;
    if (won) reward += 120;
    reward = Math.floor(reward * (currentMode.rewardMult || 1));
    lastReward = Monetization.applyMatchReward(reward);
    Analytics.track('match_end', {
      rank,
      kills: player.kills,
      duration: matchTime,
      won,
      mode: currentMode.id,
      reward: lastReward,
    });
    const overlay = document.getElementById('matchOverlay');
    overlay?.classList.remove('hidden');
    document.getElementById('matchTitle').textContent = won ? '蓝队胜利！' : '对局结束';
    document.getElementById('matchRank').textContent = won ? '胜利' : `蓝队剩余 ${alphaAlive} · 红队剩余 ${bravoAlive}`;
    document.getElementById('matchStats').textContent =
      `击杀 ${player.kills} · 存活 ${Math.floor(matchTime)}s · +${lastReward} 币`;
  }

  function updateHud() {
    if (!player) return;
    document.getElementById('hudHp').textContent = player.alive ? Math.ceil(player.hp) : 0;
    if (player.weaponId) {
      const w = getWeapon(player.weaponId);
      document.getElementById('hudWeapon').textContent = w.name;
      document.getElementById('hudAmmo').textContent = `${player.ammo}/${player.magSize}`;
    } else {
      document.getElementById('hudWeapon').textContent = '无武器 — 进建筑搜刮';
      document.getElementById('hudAmmo').textContent = '—';
    }
    document.getElementById('hudTeam').textContent = currentMode.name;
    document.getElementById('hudAlive').textContent =
      `蓝${countAlive(TEAM_ALPHA)} / 红${countAlive(TEAM_BRAVO)}`;
    document.getElementById('hudKills').textContent = player.kills || 0;
    document.getElementById('hudTime').textContent = formatTime(matchTime);
    const lootSec = currentMode.lootPhase || LOOT_PHASE_SEC;
    const inLoot = matchTime < lootSec;
    document.getElementById('hudZone').textContent =
      matchPhase === 'parachute'
        ? '跳伞中…'
        : `${inLoot ? '搜刮期' : '交战期'} · 缩圈 ${zone.stage + 1}/5`;
    document.getElementById('hudCoins').textContent = Monetization.getCoins();
  }

  function formatTime(t) {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function showMatchResult(result) {
    const overlay = document.getElementById('matchOverlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    const titleEl = document.getElementById('matchTitle');
    const rankEl = document.getElementById('matchRank');
    const statsEl = document.getElementById('matchStats');
    if (titleEl) titleEl.textContent = result.title || '对局结束';
    if (rankEl) rankEl.textContent = result.modeName || currentMode?.name || '—';
    if (statsEl) statsEl.textContent = result.stats || '';
    Monetization.refreshCoinHud();
  }

  window.GameUI = { showMatchResult };

  function draw() {
    if (AlternateModes.isActive()) {
      ctx.fillStyle = '#1a2332';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      AlternateModes.draw();
      return;
    }

    ctx.fillStyle = '#1a2332';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (AlternateModes.isEnded()) return;
    if (!player) return;

    const camX = player.x;
    const camY = player.y;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(VIEW_SCALE, VIEW_SCALE);
    ctx.translate(-camX, -camY);

    // 草地
    drawTerrain(ctx, MAP_SIZE);

    drawBuildings(ctx);

    // 安全区
    ctx.beginPath();
    ctx.arc(zone.centerX, zone.centerY, zone.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(94, 207, 255, 0.06)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(94, 207, 255, 0.45)';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, MAP_SIZE, MAP_SIZE);
    ctx.arc(zone.centerX, zone.centerY, zone.radius, 0, Math.PI * 2, true);
    ctx.fillStyle = 'rgba(255, 50, 50, 0.12)';
    ctx.fill();
    ctx.restore();

    // 建筑内战利品（仅进入建筑可见）
    const inB = getBuildingAt(player.x, player.y);
    for (const item of lootItems) {
      if (item.taken) continue;
      const b = BUILDINGS.find((x) => x.id === item.buildingId);
      if (inB && b && isInsideBuilding(player.x, player.y, b)) {
        drawLootItem(ctx, item);
      }
    }

    // 人物
    for (const e of entities) {
      drawHuman(ctx, e);
    }

    // 子弹
    for (const b of bullets) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
    }

    ctx.restore();
  }

  let lastTs = 0;
  function loop(ts) {
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;

    if (AlternateModes.isActive()) {
      try {
        AlternateModes.update(dt);
      } catch (err) {
        console.error('模式更新错误:', err);
        AlternateModes.forceEnd('对局结束', '结算出错，请点击返回大厅');
      }
      Monetization.refreshCoinHud();
      draw();
      requestAnimationFrame(loop);
      return;
    }

    if (matchActive) {
      if (matchPhase === 'parachute') {
        updateParachutePhase(dt);
      } else {
        matchTime += dt;
        zone.update(dt);
        updatePlayer(dt);
        updateBots(dt);
        updateBullets(dt);
        checkMatchEnd();
      }
      updateHud();
    }
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (['q', 'e', 'r'].includes(e.key.toLowerCase())) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

  canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (AlternateModes.isActive()) AlternateModes.setMouse(e.clientX, e.clientY);
  });
  canvas.addEventListener('mousedown', () => {
    mouse.down = true;
    if (AlternateModes.isActive()) AlternateModes.setMouse(mouse.x, mouse.y, true);
  });
  canvas.addEventListener('mouseup', () => {
    mouse.down = false;
    if (AlternateModes.isActive()) AlternateModes.setMouse(mouse.x, mouse.y, false);
  });
  canvas.addEventListener('mouseleave', () => {
    mouse.down = false;
    if (AlternateModes.isActive()) AlternateModes.setMouse(mouse.x, mouse.y, false);
  });

  document.getElementById('btnAgain')?.addEventListener('click', () => {
    document.getElementById('startScreen')?.classList.remove('hidden');
    document.getElementById('matchOverlay')?.classList.add('hidden');
  });
  document.getElementById('btnPlay')?.addEventListener('click', startMatch);
  document.getElementById('btnDouble')?.addEventListener('click', () => {
    Monetization.watchAd('double_reward', () => {
      if (lastReward > 0) {
        Monetization.addCoins(lastReward);
        alert(`观看广告成功！额外获得 ${lastReward} 币`);
      }
    });
  });
  document.getElementById('btnShop')?.addEventListener('click', () => Monetization.openShop());
  document.getElementById('btnCloseShop')?.addEventListener('click', () => Monetization.closeShop());
  document.getElementById('btnCloseAd')?.addEventListener('click', () => {
    document.getElementById('adModal')?.classList.remove('open');
  });
  document.getElementById('btnExport')?.addEventListener('click', () => {
    const blob = new Blob([Analytics.exportJson()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'survival_arena_metrics.json';
    a.click();
  });

  window.addEventListener('beforeunload', () => Analytics.endSession());
  requestAnimationFrame(loop);
})();
