/**
 * 聚合多个用户导出的埋点 JSON
 * Usage: node tools/aggregate-metrics.js
 */
const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, 'raw');
const OUT = path.join(__dirname, 'aggregated-metrics.json');

function loadFiles() {
  if (!fs.existsSync(RAW_DIR)) {
    fs.mkdirSync(RAW_DIR, { recursive: true });
    console.log('Created tools/raw/ — place exported JSON files there');
    return [];
  }
  return fs.readdirSync(RAW_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(RAW_DIR, f), 'utf8')));
}

function aggregate(list) {
  if (!list.length) {
    return {
      exportDate: new Date().toISOString().slice(0, 10),
      sampleUsers: 0,
      d1_retention: 0,
      d7_retention: 0,
      session_length: 0,
      matches_per_day: 0,
      ad_views_per_day: 0,
      iap_conversion: 0,
      shop_click_rate: 0,
      ad_ecpm: 20,
    };
  }

  const n = list.length;
  const sum = (key) => list.reduce((s, x) => s + (x[key] || 0), 0);

  return {
    exportDate: new Date().toISOString().slice(0, 10),
    sampleUsers: n,
    d1_retention: sum('d1_retention') / n,
    d7_retention: sum('d7_retention') / n,
    session_length: sum('session_length') / n,
    matches_per_day: sum('matches_per_day') / n,
    ad_views_per_day: sum('ad_views_per_day') / n,
    iap_conversion: sum('iap_conversion') / n,
    shop_click_rate: sum('shop_click_rate') / n,
    ad_ecpm: sum('ad_ecpm') / n,
  };
}

const files = loadFiles();
const result = aggregate(files);
fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
console.log('Written:', OUT);
console.log(JSON.stringify(result, null, 2));
