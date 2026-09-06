/**
 * 疾锋战区 — 房间服
 * 16 人匹配、状态同步、基础反作弊
 */
const http = require('http');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3921;
const MAX_PLAYERS = 16;
const TICK_MS = 50;

const WEAPON_FIRE_RATE = { ar_alpha: 0.12, smg_beta: 0.07 };
const MAX_SPEED = 220;
const MAP_SIZE = 1200;

const rooms = new Map();
const queue = [];

function createRoom() {
  const id = `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const room = {
    id,
    players: new Map(),
    bots: 0,
    state: 'waiting',
    matchTime: 0,
    zone: { centerX: MAP_SIZE / 2, centerY: MAP_SIZE / 2, radius: 600, stage: 0 },
    createdAt: Date.now(),
  };
  rooms.set(id, room);
  return room;
}

function findOrCreateRoom() {
  for (const room of rooms.values()) {
    if (room.state === 'waiting' && room.players.size < MAX_PLAYERS) return room;
  }
  return createRoom();
}

function validateMove(player, x, y) {
  const dx = x - player.x;
  const dy = y - player.y;
  const dist = Math.hypot(dx, dy);
  const maxDist = MAX_SPEED * (TICK_MS / 1000) * 1.5;
  if (dist > maxDist) return false;
  if (x < 0 || y < 0 || x > MAP_SIZE || y > MAP_SIZE) return false;
  return true;
}

function validateShoot(player, now) {
  const rate = WEAPON_FIRE_RATE[player.weaponId] || 0.12;
  if (now - player.lastShot < rate * 900) return false;
  player.lastShot = now;
  return true;
}

function broadcast(room, data, excludeId) {
  const msg = JSON.stringify(data);
  for (const [id, p] of room.players) {
    if (id !== excludeId && p.ws.readyState === 1) p.ws.send(msg);
  }
}

function broadcastAll(room, data) {
  broadcast(room, data, null);
}

function startMatch(room) {
  room.state = 'playing';
  room.matchTime = 0;
  const needBots = MAX_PLAYERS - room.players.size;
  room.bots = needBots;
  broadcastAll(room, { type: 'match_start', players: serializePlayers(room), bots: needBots });
}

function serializePlayers(room) {
  return [...room.players.values()].map((p) => ({
    id: p.id,
    name: p.name,
    x: p.x,
    y: p.y,
    hp: p.hp,
    alive: p.alive,
    weaponId: p.weaponId,
    kills: p.kills,
  }));
}

function tick() {
  for (const room of rooms.values()) {
    if (room.state !== 'playing') continue;
    room.matchTime += TICK_MS / 1000;
    if (room.matchTime >= 600) {
      room.state = 'ended';
      broadcastAll(room, { type: 'match_end', reason: 'timeout' });
      continue;
    }
    broadcastAll(room, {
      type: 'state',
      matchTime: room.matchTime,
      zone: room.zone,
      players: serializePlayers(room),
    });
  }
}

setInterval(tick, TICK_MS);

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ ok: true, rooms: rooms.size, queue: queue.length }));
    return;
  }
  res.writeHead(200);
  res.end('Survival Arena Server');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  const playerId = `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  let room = null;
  let player = null;

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      switch (msg.type) {
        case 'join':
          room = findOrCreateRoom();
          player = {
            id: playerId,
            ws,
            name: msg.name || 'Player',
            x: MAP_SIZE / 2 + Math.random() * 100,
            y: MAP_SIZE / 2 + Math.random() * 100,
            hp: 100,
            alive: true,
            weaponId: 'ar_alpha',
            kills: 0,
            lastShot: 0,
          };
          room.players.set(playerId, player);
          ws.send(JSON.stringify({
            type: 'joined',
            roomId: room.id,
            playerId,
            players: serializePlayers(room),
            state: room.state,
          }));
          if (room.players.size >= 4 && room.state === 'waiting') {
            setTimeout(() => startMatch(room), 3000);
          }
          break;

        case 'move':
          if (!player || !room || room.state !== 'playing') break;
          if (!validateMove(player, msg.x, msg.y)) {
            ws.send(JSON.stringify({ type: 'cheat_warn', reason: 'speed' }));
            break;
          }
          player.x = msg.x;
          player.y = msg.y;
          broadcast(room, { type: 'player_move', id: playerId, x: msg.x, y: msg.y }, playerId);
          break;

        case 'shoot':
          if (!player || !room || room.state !== 'playing') break;
          if (!validateShoot(player, Date.now())) {
            ws.send(JSON.stringify({ type: 'cheat_warn', reason: 'fire_rate' }));
            break;
          }
          broadcastAll(room, { type: 'shoot', id: playerId, angle: msg.angle, weaponId: player.weaponId });
          break;

        case 'hit':
          if (!player || !room) break;
          const target = room.players.get(msg.targetId);
          if (target && target.alive && msg.targetId !== playerId) {
            target.hp -= msg.damage || 20;
            if (target.hp <= 0) {
              target.alive = false;
              player.kills++;
            }
          }
          break;
      }
    } catch (e) {
      console.error('msg error', e);
    }
  });

  ws.on('close', () => {
    if (room && player) {
      room.players.delete(playerId);
      broadcastAll(room, { type: 'player_leave', id: playerId });
      if (room.players.size === 0) rooms.delete(room.id);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Survival Arena server on :${PORT}`);
});
