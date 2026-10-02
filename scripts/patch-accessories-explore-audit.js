// 饰品"可于世界中探索"占位全量修正（对照官方 wiki 1.4.5.8）
// 覆盖：pkg-cat-2/data/data-v2.js（图鉴 22 条）、data/items.js（鳍翼详情页微调）
const fs = require('fs');
const R = p => 'D:/小程序库/泰拉瑞亚/' + p;

function patchV2Ob(src, en, newOb, tag) {
  const anchor = '"en":"' + en + '"';
  const i = src.indexOf(anchor);
  if (i < 0) throw new Error('v2 未找到 anchor: ' + tag);
  const win = src.slice(i, i + 900);
  const m = win.match(/"ob":"[^"]*"/);
  if (!m) throw new Error('v2 未找到 ob: ' + tag);
  if (m[0] === '"ob":"' + newOb + '"') { console.log('  跳过(已是新值)', tag); return src; }
  return src.slice(0, i + m.index) + '"ob":"' + newOb + '"' + src.slice(i + m.index + m[0].length);
}

// ---------- 1. v2 图鉴 22 条 ----------
let v2 = fs.readFileSync(R('pkg-cat-2/data/data-v2.js'), 'utf8');

const VOICE = '自然生成的宝箱有 8.33% 概率包含一件随机语音配饰作为额外拾取物（14 种选 1，单个约 0.6%）；1.4.5 新增';
const CHAOS = '困难模式下由神圣宝箱怪掉落（1/5，20%）；各形态由物品右键切换；1.4.5.7 新增';

const FIX = [
  ['Chaos Cylinder', CHAOS],
  ['Chaos Cylinder (Full)', CHAOS],
  ['Chaos Cylinder (Random)', CHAOS],
  ['Chaos Cylinder (Simple)', CHAOS],
  ["Chippy's Headband", '由骷髅王的红帽变体必定掉落（与Chippy的时装套装一同获得）；1.4.5 新增'],
  ['Stress Ball', '由装甲步兵掉落（1/100，1%）；1.4.5 新增'],
  ['Balloony Beads', VOICE],
  ['Cat Chime', VOICE],
  ['Chicken Charm', VOICE],
  ['Cow Bell', VOICE],
  ["Crow's Beak", VOICE],
  ['Dog Collar', VOICE],
  ['Fairy Choker', VOICE],
  ['Froggy Neckband', VOICE],
  ["Goat's Tuft", VOICE],
  ['Grim Old Barb', VOICE],
  ["Mean Goblin's Spikes", VOICE],
  ['Old Companion Locket', VOICE],
  ['Turkey Wattle Necklace', VOICE],
  ['Vampire Pendant', VOICE],
  ['Fin Wings', '困难模式下完成 10 个渔夫任务后，每个任务奖励有 1/70（1.43%）基础概率获得'],
  ['Mothron Wings', '掉落自蛾怪（经典 1/20，5%；专家/大师 39/400，9.75%），蛾怪出现于世纪之花后的日食中'],
];
FIX.forEach(([en, ob]) => { v2 = patchV2Ob(v2, en, ob, en); });
fs.writeFileSync(R('pkg-cat-2/data/data-v2.js'), v2);
console.log('1) v2 图鉴 22 条 OK');

// ---------- 2. items.js 鳍翼表述微调 ----------
let it = fs.readFileSync(R('data/items.js'), 'utf8');
const anchor = 'name:"鳍翼"';
const i = it.indexOf(anchor);
if (i < 0) throw new Error('items 未找到 鳍翼');
const win = it.slice(i, i + 900);
const m = win.match(/obtain:"[^"]*"/);
if (!m) throw new Error('items 未找到 鳍翼 obtain');
const newFin = '困难模式下完成 10 个渔夫任务后，每个任务奖励有 1/70（1.43%）基础概率获得';
if (m[0] !== 'obtain:"' + newFin + '"') {
  it = it.slice(0, i + m.index) + 'obtain:"' + newFin + '"' + it.slice(i + m.index + m[0].length);
  fs.writeFileSync(R('data/items.js'), it);
  console.log('2) items.js 鳍翼 OK');
} else {
  console.log('2) items.js 鳍翼 跳过(已新值)');
}

console.log('全部补丁执行完成');
