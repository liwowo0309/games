/**
 * 疾锋战区 — 武器配置
 */
const WEAPONS = {
  ar_alpha: {
    id: 'ar_alpha',
    name: '阿尔法步枪',
    damage: 28,
    magSize: 30,
    fireRate: 0.12,
    reloadTime: 2.0,
    spread: 0.04,
    bulletSpeed: 900,
    range: 800,
    color: '#5ecfff',
  },
  smg_beta: {
    id: 'smg_beta',
    name: '贝塔冲锋',
    damage: 18,
    magSize: 25,
    fireRate: 0.07,
    reloadTime: 1.6,
    spread: 0.08,
    bulletSpeed: 750,
    range: 500,
    color: '#ffb347',
  },
};

const WEAPON_ORDER = ['ar_alpha', 'smg_beta'];

function getWeapon(id) {
  return WEAPONS[id] || WEAPONS.ar_alpha;
}
