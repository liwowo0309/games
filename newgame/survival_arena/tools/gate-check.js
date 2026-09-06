#!/usr/bin/env node
/**
 * 疾锋战区 — 第 4 月收入门禁裁决
 * Usage: node tools/gate-check.js --data tools/sample-metrics.json
 */
const fs = require('fs');
const path = require('path');

const KPI = {
  d1_retention: { min: 28, label: 'D1 留存 (%)' },
  d7_retention: { min: 8, label: 'D7 留存 (%)' },
  session_length: { min: 18, label: '平均单次游戏时长 (分钟)' },
  matches_per_day: { min: 2.5, label: '人均日开局数' },
  ad_views_per_day: { min: 3, label: '激励视频人均日观看' },
  iap_conversion: { min: 2, label: '沙盒 IAP 转化率 (%)', alt: 'shop_click_rate', altMin: 8 },
  ad_ecpm: { min: 15, label: '7 日广告 eCPM (¥)' },
};

const KILL_RULES = [
  {
    id: 'KILL_D7_LOW',
    check: (m) => m.d7_retention < 5 && m.matches_per_day < 1.5,
    msg: 'D7 < 5% 且人均日开局 < 1.5',
  },
  {
    id: 'KILL_NO_MONETIZE',
    check: (m) => m.iap_conversion <= 0 && m.ad_views_per_day < 1,
    msg: '沙盒 0 付费且广告人均 < 1 次/日',
  },
];

function loadMetrics(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function evaluate(metrics) {
  const passed = [];
  const failed = [];

  for (const [key, rule] of Object.entries(KPI)) {
    const val = metrics[key];
    let ok = val >= rule.min;
    if (!ok && rule.alt && metrics[rule.alt] >= rule.altMin) ok = true;
    if (ok) passed.push({ key, label: rule.label, value: val, threshold: rule.min });
    else failed.push({ key, label: rule.label, value: val, threshold: rule.min });
  }

  const kills = KILL_RULES.filter((r) => r.check(metrics));

  let verdict;
  if (kills.length > 0) {
    verdict = 'KILL';
  } else if (passed.length >= 4) {
    verdict = 'PASS';
  } else {
    verdict = 'FAIL';
  }

  return { verdict, passed, failed, kills, passCount: passed.length };
}

function main() {
  const args = process.argv.slice(2);
  let dataPath = path.join(__dirname, 'sample-metrics.json');
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--data' && args[i + 1]) dataPath = args[i + 1];
  }

  if (!fs.existsSync(dataPath)) {
    console.error('Metrics file not found:', dataPath);
    process.exit(1);
  }

  const metrics = loadMetrics(dataPath);
  const result = evaluate(metrics);

  console.log('\n========================================');
  console.log('  疾锋战区 — 第 4 月收入门禁裁决');
  console.log('========================================\n');
  console.log(`样本用户: ${metrics.sampleUsers || 'N/A'}`);
  console.log(`导出日期: ${metrics.exportDate || 'N/A'}\n`);

  console.log('--- 达标项 (' + result.passed.length + '/7) ---');
  result.passed.forEach((p) => {
    console.log(`  ✓ ${p.label}: ${p.value} (≥ ${p.threshold})`);
  });

  if (result.failed.length) {
    console.log('\n--- 未达标项 ---');
    result.failed.forEach((f) => {
      console.log(`  ✗ ${f.label}: ${f.value} (需要 ≥ ${f.threshold})`);
    });
  }

  if (result.kills.length) {
    console.log('\n--- 立即停止条件 ---');
    result.kills.forEach((k) => console.log(`  ⚠ ${k.id}: ${k.msg}`));
  }

  console.log('\n========================================');
  console.log(`  裁决: ${result.verdict}`);
  if (result.verdict === 'PASS') {
    console.log('  → 继续：冲 DAU + 双周内容更新 + 小预算买量');
  } else if (result.verdict === 'KILL') {
    console.log('  → 立即停止或 pivot 到轻竞技 (2v2/4v4)');
  } else {
    console.log('  → 未过门禁：评估 pivot 或再观察 1 周');
  }
  console.log('========================================\n');

  process.exit(result.verdict === 'PASS' ? 0 : 1);
}

main();
