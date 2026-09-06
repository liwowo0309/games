/**
 * 疾锋战区 — 写实军事风绘制
 */

const TEAM_COLORS = {
  alpha: { vest: '#3d5a6e', patch: '#5a8ab0', trim: '#8eb4d4' },
  bravo: { vest: '#5a3d3d', patch: '#a05050', trim: '#c07070' },
};

function drawHuman(ctx, e) {
  if (!e.alive) return;
  const team = TEAM_COLORS[e.team] || { vest: '#444', patch: '#666', trim: '#888' };
  const isPlayer = e.isPlayer;

  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.rotate(e.angle);

  // 地面阴影
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 5, 11, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (e.parachuting) {
    drawParachute(ctx, team);
    ctx.restore();
    drawHumanHud(ctx, e, isPlayer);
    return;
  }

  // 腿部（战术裤 + 靴）
  ctx.fillStyle = '#1e2428';
  ctx.fillRect(-6, 2, 5, 11);
  ctx.fillRect(1, 2, 5, 11);
  ctx.fillStyle = '#0d1014';
  ctx.fillRect(-6, 10, 5, 4);
  ctx.fillRect(1, 10, 5, 4);

  // 躯干 — 防弹背心
  ctx.fillStyle = team.vest;
  ctx.beginPath();
  ctx.moveTo(-8, -6);
  ctx.lineTo(8, -6);
  ctx.lineTo(9, 8);
  ctx.lineTo(-9, 8);
  ctx.closePath();
  ctx.fill();
  // 背心高光
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(-7, -5, 14, 4);
  // 队标肩章
  ctx.fillStyle = team.patch;
  ctx.fillRect(-8, -4, 4, 5);
  ctx.fillRect(4, -4, 4, 5);

  // 头盔（写实，非圆脸）
  ctx.fillStyle = '#2a3238';
  ctx.beginPath();
  ctx.arc(0, -9, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a4248';
  ctx.beginPath();
  ctx.arc(0, -10, 6, Math.PI, 0);
  ctx.fill();
  // 护目镜条
  ctx.fillStyle = 'rgba(20,30,40,0.85)';
  ctx.fillRect(-5, -11, 10, 3);

  // 武器
  if (e.weaponId) {
    const w = getWeapon(e.weaponId);
    ctx.fillStyle = '#15181c';
    ctx.fillRect(5, -2, 24, 4);
    ctx.fillStyle = '#252a30';
    ctx.fillRect(5, -1, 10, 2);
    ctx.fillStyle = w.color || '#4a5560';
    ctx.globalAlpha = 0.85;
    ctx.fillRect(22, -3, 10, 3);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
  drawHumanHud(ctx, e, isPlayer);
}

function drawParachute(ctx, team) {
  ctx.strokeStyle = team.trim;
  ctx.lineWidth = 1.5;
  ctx.fillStyle = 'rgba(40,50,60,0.5)';
  ctx.beginPath();
  ctx.arc(0, -24, 16, Math.PI, 0);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-14, -24);
  ctx.lineTo(-4, -10);
  ctx.moveTo(14, -24);
  ctx.lineTo(4, -10);
  ctx.stroke();
}

function drawHumanHud(ctx, e, isPlayer) {
  const barW = 30;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(e.x - barW / 2, e.y - 30, barW, 4);
  const hpPct = e.hp / 100;
  ctx.fillStyle = hpPct > 0.5 ? '#3a8f5c' : hpPct > 0.25 ? '#c9a227' : '#b33a3a';
  ctx.fillRect(e.x - barW / 2, e.y - 30, barW * hpPct, 4);

  ctx.font = '10px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  if (!isPlayer) {
    ctx.fillStyle = 'rgba(220,225,230,0.8)';
    ctx.fillText(e.name, e.x, e.y - 36);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillText('你', e.x, e.y - 36);
  }
}

/** 建筑门定义：side = n|s|e|w, pos = 0~1 沿墙位置, width */
function getBuildingDoor(b) {
  return b.door || { side: 's', pos: 0.5, width: 34 };
}

function doorOpeningRect(b) {
  const d = getBuildingDoor(b);
  const dw = d.width;
  const pos = d.pos;
  switch (d.side) {
    case 'n':
      return { x: b.x + b.w * pos - dw / 2, y: b.y, w: dw, h: WALL + 2 };
    case 's':
      return { x: b.x + b.w * pos - dw / 2, y: b.y + b.h - WALL, w: dw, h: WALL + 2 };
    case 'w':
      return { x: b.x, y: b.y + b.h * pos - dw / 2, w: WALL + 2, h: dw };
    case 'e':
      return { x: b.x + b.w - WALL, y: b.y + b.h * pos - dw / 2, w: WALL + 2, h: dw };
    default:
      return { x: b.x + b.w / 2 - dw / 2, y: b.y + b.h - WALL, w: dw, h: WALL + 2 };
  }
}

function drawBuildingDoor(ctx, b) {
  const dr = doorOpeningRect(b);
  const inner = buildingInner(b);

  // 门洞（通向内部）
  ctx.fillStyle = '#0a0c10';
  ctx.fillRect(dr.x, dr.y, dr.w, dr.h);

  // 门框
  ctx.strokeStyle = '#4a5058';
  ctx.lineWidth = 2;
  ctx.strokeRect(dr.x, dr.y, dr.w, dr.h);

  // 门扇（双开门或单扇）
  const doorW = dr.w / 2 - 2;
  ctx.fillStyle = '#2a3038';
  if (dr.w > dr.h) {
    ctx.fillRect(dr.x + 2, dr.y + 1, doorW, dr.h - 2);
    ctx.fillRect(dr.x + dr.w / 2, dr.y + 1, doorW, dr.h - 2);
    ctx.fillStyle = '#3a424a';
    ctx.fillRect(dr.x + doorW - 2, dr.y + 3, 2, dr.h - 6);
    ctx.fillRect(dr.x + dr.w / 2 + doorW - 2, dr.y + 3, 2, dr.h - 6);
  } else {
    ctx.fillRect(dr.x + 1, dr.y + 2, dr.w - 2, dr.h / 2 - 2);
    ctx.fillRect(dr.x + 1, dr.y + dr.h / 2, dr.w - 2, dr.h / 2 - 2);
  }

  // 入口标识（小）
  ctx.fillStyle = 'rgba(200,210,220,0.5)';
  ctx.font = '9px sans-serif';
  ctx.textAlign = 'center';
  const labelX = dr.x + dr.w / 2;
  const labelY = dr.side === 'n' ? b.y - 4 : dr.side === 's' ? b.y + b.h + 12 : dr.y + dr.h / 2;
  if (dr.w > dr.h) ctx.fillText('入口', labelX, dr.side === 'n' ? b.y - 4 : b.y + b.h + 12);
}

function drawBuildings(ctx) {
  for (const b of BUILDINGS) {
    const style = getBuildingStyle(b.type);
    const inner = buildingInner(b);

    // 建筑底座阴影
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(b.x + 4, b.y + 4, b.w, b.h);

    // 外墙主体 — 混凝土渐变
    const grad = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
    grad.addColorStop(0, style.wallLight);
    grad.addColorStop(1, style.wallDark);
    ctx.fillStyle = grad;
    ctx.fillRect(b.x, b.y, b.w, b.h);

    // 墙面噪点纹理
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let i = 0; i < 8; i++) {
      const rx = b.x + (b.id.length * 17 + i * 23) % b.w;
      const ry = b.y + (i * 31) % b.h;
      ctx.fillRect(rx, ry, 12, 3);
    }

    // 屋顶压边
    ctx.fillStyle = style.roof;
    ctx.fillRect(b.x, b.y, b.w, 6);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(b.x, b.y + 5, b.w, 1);

    // 窗户（写实横条窗）
    drawBuildingWindows(ctx, b, style);

    // 内地面
    ctx.fillStyle = style.floor;
    ctx.fillRect(inner.x, inner.y, inner.w, inner.h);

    // 内墙线
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(inner.x, inner.y, inner.w, inner.h);

    // 门（在墙层之上）
    drawBuildingDoor(ctx, b);

    // 建筑名牌 — 军事标牌风格
    ctx.fillStyle = 'rgba(10,12,16,0.65)';
    const labelW = Math.min(b.w - 16, 90);
    ctx.fillRect(b.x + (b.w - labelW) / 2, b.y + 10, labelW, 16);
    ctx.fillStyle = 'rgba(210,218,225,0.85)';
    ctx.font = 'bold 10px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(b.name, b.x + b.w / 2, b.y + 21);
  }
}

function drawBuildingWindows(ctx, b, style) {
  const rows = Math.max(1, Math.floor((b.h - 30) / 28));
  const cols = Math.max(2, Math.floor((b.w - 24) / 32));
  ctx.fillStyle = style.window;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = b.x + 14 + c * ((b.w - 28) / cols);
      const wy = b.y + 22 + r * 26;
      if (wy + 14 > b.y + b.h - 20) continue;
      ctx.fillRect(wx, wy, 18, 10);
      ctx.fillStyle = 'rgba(180,200,220,0.15)';
      ctx.fillRect(wx, wy, 18, 3);
      ctx.fillStyle = style.window;
    }
  }
}

function getBuildingStyle(type) {
  switch (type) {
    case 'shop':
      return { wallLight: '#6b7280', wallDark: '#4a5058', roof: '#3d4450', floor: '#2a2e34', window: '#1a2228' };
    case 'garage':
      return { wallLight: '#505868', wallDark: '#353c48', roof: '#2a3038', floor: '#1e2228', window: '#12161c' };
    case 'apartment':
      return { wallLight: '#7a7068', wallDark: '#524a44', roof: '#403a36', floor: '#2c2824', window: '#1c1a18' };
    case 'warehouse':
      return { wallLight: '#5c6470', wallDark: '#3e4550', roof: '#323840', floor: '#242830', window: '#141820' };
    default:
      return { wallLight: '#5a6068', wallDark: '#3c4248', roof: '#303640', floor: '#242830', window: '#181c22' };
  }
}

function drawLootItem(ctx, item) {
  if (item.taken) return;
  const meta = {
    weapon_ar: { color: '#6a8fa8', label: '步枪', icon: '▣' },
    weapon_smg: { color: '#a08060', label: '冲锋', icon: '▣' },
    med: { color: '#4a9a6a', label: '医疗', icon: '+' },
    ammo: { color: '#c09050', label: '弹药', icon: '◆' },
  };
  const m = meta[item.type] || { color: '#888', label: '', icon: '?' };

  // 物资箱造型
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(item.x - 10, item.y + 4, 20, 6);
  ctx.fillStyle = '#2a3238';
  ctx.fillRect(item.x - 11, item.y - 6, 22, 14);
  ctx.strokeStyle = m.color;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(item.x - 11, item.y - 6, 22, 14);
  ctx.fillStyle = m.color;
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(m.icon, item.x, item.y + 2);
  ctx.fillStyle = 'rgba(220,225,230,0.9)';
  ctx.font = '9px sans-serif';
  ctx.fillText(m.label, item.x, item.y - 12);
}

/** 写实地图地面 */
function drawTerrain(ctx, mapSize) {
  const grad = ctx.createLinearGradient(0, 0, mapSize, mapSize);
  grad.addColorStop(0, '#2a3c32');
  grad.addColorStop(0.5, '#243528');
  grad.addColorStop(1, '#1e2e26');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, mapSize, mapSize);

  // 泥土/草地纹理
  ctx.fillStyle = 'rgba(0,0,0,0.04)';
  for (let i = 0; i < 120; i++) {
    const x = (i * 137) % mapSize;
    const y = (i * 89) % mapSize;
    ctx.beginPath();
    ctx.arc(x, y, 8 + (i % 5), 0, Math.PI * 2);
    ctx.fill();
  }

  // 道路痕迹
  ctx.strokeStyle = 'rgba(60,55,50,0.25)';
  ctx.lineWidth = 24;
  ctx.beginPath();
  ctx.moveTo(0, mapSize * 0.4);
  ctx.lineTo(mapSize, mapSize * 0.55);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(mapSize * 0.3, 0);
  ctx.lineTo(mapSize * 0.35, mapSize);
  ctx.stroke();
}
