/**
 * 疾锋战区 — 缩圈（大地图 2800）
 */
const ZONE_STAGES = [
  { time: 0, radius: 1300, dps: 0 },
  { time: 120, radius: 950, dps: 1 },
  { time: 240, radius: 650, dps: 2 },
  { time: 360, radius: 400, dps: 4 },
  { time: 480, radius: 200, dps: 7 },
  { time: 600, radius: 55, dps: 10 },
];

class Zone {
  constructor() {
    this.centerX = MAP_SIZE / 2;
    this.centerY = MAP_SIZE / 2;
    this.radius = ZONE_STAGES[0].radius;
    this.stage = 0;
    this.dps = 0;
    this.matchTime = 0;
  }

  reset() {
    this.centerX = MAP_SIZE / 2;
    this.centerY = MAP_SIZE / 2;
    this.radius = ZONE_STAGES[0].radius;
    this.stage = 0;
    this.dps = 0;
    this.matchTime = 0;
  }

  update(dt) {
    this.matchTime += dt;
    let nextStage = this.stage;
    for (let i = ZONE_STAGES.length - 1; i >= 0; i--) {
      if (this.matchTime >= ZONE_STAGES[i].time) {
        nextStage = i;
        break;
      }
    }
    if (nextStage !== this.stage) {
      this.stage = nextStage;
      this.dps = ZONE_STAGES[this.stage].dps;
    }
    const target = ZONE_STAGES[this.stage].radius;
    this.radius += (target - this.radius) * Math.min(1, dt * 0.08);
  }

  isOutside(x, y) {
    const dx = x - this.centerX;
    const dy = y - this.centerY;
    return Math.hypot(dx, dy) > this.radius;
  }

  getDamagePerSecond() {
    return this.dps;
  }

  getTimeToNextStage() {
    if (this.stage >= ZONE_STAGES.length - 1) return 0;
    return Math.max(0, ZONE_STAGES[this.stage + 1].time - this.matchTime);
  }
}
