/**
 * 疾锋战区 — 玩法模式
 */
const GAME_MODES = {
  br_8v8: {
    id: 'br_8v8',
    name: '经典 8v8',
    icon: '🪂',
    desc: '跳伞 · 搜刮 · 缩圈 · 分队作战',
    rewardMult: 1,
    type: 'br',
  },
  br_fast: {
    id: 'br_fast',
    name: '快速对决',
    icon: '⚡',
    desc: '8v8 缩圈更快 · 6 分钟一局',
    rewardMult: 0.85,
    type: 'br',
    lootPhase: 45,
    matchDuration: 360,
    zoneSpeed: 1.4,
  },
  training: {
    id: 'training',
    name: '靶场训练',
    icon: '🎯',
    desc: '60 秒打移动靶 · 赚战区币',
    rewardMult: 1,
    type: 'alt',
  },
  scavenge: {
    id: 'scavenge',
    name: '夺宝冲刺',
    icon: '📦',
    desc: '3 分钟建筑搜刮 · 无敌人追杀',
    rewardMult: 1,
    type: 'alt',
  },
  tdm_4v4: {
    id: 'tdm_4v4',
    name: '4v4 团竞',
    icon: '⚔️',
    desc: '小地图枪战 · 5 分钟人头赛',
    rewardMult: 1.1,
    type: 'alt',
  },
};

let selectedModeId = 'br_8v8';

function getSelectedMode() {
  return GAME_MODES[selectedModeId] || GAME_MODES.br_8v8;
}

function setSelectedMode(id) {
  if (GAME_MODES[id]) selectedModeId = id;
}

function getModeList() {
  return Object.values(GAME_MODES);
}
