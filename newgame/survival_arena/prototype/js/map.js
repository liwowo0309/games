/**
 * 疾锋战区 — 地图与建筑（灰岩岛）
 */
const MAP_SIZE = 2800;
const MATCH_DURATION = 600;
const LOOT_PHASE_SEC = 90;
const PARACHUTE_FALL_SPEED = 220;

const TEAM_ALPHA = 'alpha';
const TEAM_BRAVO = 'bravo';

/** 建筑：door = { side: n|s|e|w, pos: 0~1, width } */
const BUILDINGS = [
  { id: 'shop1', type: 'shop', name: '便利店', x: 350, y: 400, w: 140, h: 100, door: { side: 's', pos: 0.5, width: 36 } },
  { id: 'shop2', type: 'shop', name: '路边商店', x: 1200, y: 650, w: 130, h: 90, door: { side: 'e', pos: 0.55, width: 32 } },
  { id: 'garage1', type: 'garage', name: '地下车库', x: 800, y: 1100, w: 200, h: 140, door: { side: 's', pos: 0.35, width: 48 } },
  { id: 'garage2', type: 'garage', name: 'B2 车库', x: 1900, y: 900, w: 180, h: 160, door: { side: 'w', pos: 0.5, width: 44 } },
  { id: 'apt1', type: 'apartment', name: '住宅 A 栋', x: 500, y: 1600, w: 160, h: 120, door: { side: 's', pos: 0.5, width: 34 } },
  { id: 'apt2', type: 'apartment', name: '住宅 B 栋', x: 1400, y: 1400, w: 150, h: 130, door: { side: 'n', pos: 0.5, width: 34 } },
  { id: 'apt3', type: 'apartment', name: '写字楼', x: 2100, y: 500, w: 140, h: 180, door: { side: 's', pos: 0.45, width: 38 } },
  { id: 'warehouse', type: 'warehouse', name: '仓库', x: 2200, y: 1800, w: 220, h: 150, door: { side: 's', pos: 0.6, width: 52 } },
  { id: 'gas', type: 'shop', name: '加油站', x: 1650, y: 2100, w: 120, h: 90, door: { side: 'e', pos: 0.5, width: 30 } },
  { id: 'market', type: 'shop', name: '集市', x: 900, y: 2000, w: 180, h: 110, door: { side: 's', pos: 0.5, width: 40 } },
  { id: 'clinic', type: 'apartment', name: '诊所', x: 400, y: 2200, w: 110, h: 90, door: { side: 's', pos: 0.5, width: 30 } },
  { id: 'school', type: 'apartment', name: '学校', x: 1200, y: 2400, w: 200, h: 140, door: { side: 's', pos: 0.4, width: 42 } },
];

const WALL = 12;

function buildingInner(b) {
  return {
    x: b.x + WALL,
    y: b.y + WALL,
    w: b.w - WALL * 2,
    h: b.h - WALL * 2,
  };
}

function isInsideBuilding(x, y, b) {
  const inner = buildingInner(b);
  return x >= inner.x && x <= inner.x + inner.w && y >= inner.y && y <= inner.y + inner.h;
}

function isInsideAnyBuilding(x, y) {
  return BUILDINGS.some((b) => isInsideBuilding(x, y, b));
}

function getBuildingAt(x, y) {
  for (const b of BUILDINGS) {
    if (isInsideBuilding(x, y, b)) return b;
  }
  return null;
}

function isInDoorZone(x, y, b, margin = 10) {
  const dr = doorOpeningRect(b);
  return x >= dr.x - margin && x <= dr.x + dr.w + margin &&
    y >= dr.y - margin && y <= dr.y + dr.h + margin;
}

function nearBuildingDoor(x, y, dist = 55) {
  for (const b of BUILDINGS) {
    if (isInDoorZone(x, y, b, dist)) return b;
    const dr = doorOpeningRect(b);
    const cx = dr.x + dr.w / 2;
    const cy = dr.y + dr.h / 2;
    if (Math.hypot(x - cx, y - cy) < dist) return b;
  }
  return null;
}

function collidesBuildingWall(x, y, radius) {
  for (const b of BUILDINGS) {
    const inOuter = x >= b.x - radius && x <= b.x + b.w + radius &&
      y >= b.y - radius && y <= b.y + b.h + radius;
    if (!inOuter) continue;
    if (isInsideBuilding(x, y, b)) continue;
    // 门口可通行
    if (isInDoorZone(x, y, b, radius + 6)) continue;
    return true;
  }
  return false;
}

function resolveWallCollision(entity) {
  if (!collidesBuildingWall(entity.x, entity.y, entity.radius)) return;
  for (const b of BUILDINGS) {
    const inner = buildingInner(b);
    const cx = inner.x + inner.w / 2;
    const cy = inner.y + inner.h / 2;
    const dx = entity.x - cx;
    const dy = entity.y - cy;
    const halfW = inner.w / 2 + WALL;
    const halfH = inner.h / 2 + WALL;
    if (Math.abs(dx) < halfW + entity.radius && Math.abs(dy) < halfH + entity.radius) {
      if (!isInsideBuilding(entity.x, entity.y, b) && !isInDoorZone(entity.x, entity.y, b, entity.radius + 8)) {
        if (Math.abs(dx) > Math.abs(dy)) {
          entity.x = dx > 0 ? b.x + b.w + entity.radius + 2 : b.x - entity.radius - 2;
        } else {
          entity.y = dy > 0 ? b.y + b.h + entity.radius + 2 : b.y - entity.radius - 2;
        }
      }
    }
  }
}

function spawnBuildingLoot() {
  const loot = [];
  const types = ['weapon_ar', 'weapon_smg', 'med', 'ammo', 'ammo'];
  BUILDINGS.forEach((b, bi) => {
    const inner = buildingInner(b);
    const spots = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < spots; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      loot.push({
        id: `loot_${bi}_${i}`,
        x: inner.x + 20 + Math.random() * (inner.w - 40),
        y: inner.y + 20 + Math.random() * (inner.h - 40),
        type,
        buildingId: b.id,
        radius: 12,
        taken: false,
      });
    }
  });
  return loot;
}

function getBuildingColor(type) {
  switch (type) {
    case 'shop': return '#6a7d8a';
    case 'garage': return '#4a5568';
    case 'apartment': return '#8b7355';
    case 'warehouse': return '#5c6b7a';
    default: return '#555';
  }
}
