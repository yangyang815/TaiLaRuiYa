// 防具/时装"击败敌怪掉落"16 条细化 + 靴子"开启宝藏袋"7 条修正（官方 wiki 1.4.5.8 逐条核对）
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

// ---------- 文案（全部来自官方 wiki 信息框/正文） ----------
const FIX = [
  // 盔甲/时装 16 条
  ["Bee set", "由蜂王掉落，每件 1/9 (11.11%)；专家模式下从蜂王的宝藏袋中每件有 1/3 (33.33%) 几率获得，且每袋必掉一件"],
  ["Buccaneer set", "海盗入侵事件中，除海盗船长和鹦鹉外的海盗敌怪（海盗弩手、海盗水手、海盗神射手、私船海盗）掉落，每件 10.2%"],
  ["Elf set", "霜月事件中的僵尸精灵掉落，每件 1/600 (0.17%)"],
  ["Lamia set", "困难模式下地下沙漠的光明拉弥亚或暗黑拉弥亚掉落，每件 1/120 (0.83%)"],
  ["Martian Costume set", "火星暴乱事件中的扰脑怪、激光枪手、灰咕噜和鳞甲怪枪手掉落，每件 10.5%"],
  ["Martian Uniform set", "火星暴乱事件中的火星军官、火星工程师和电击怪掉落，每件 10.5%"],
  ["Ocram Mask", "无法获取：奥库瑞姆是前代主机版/3DS 版独有 Boss，已在 1.3 版本移除，此面具作为遗留物品保留（旧存档中的会被替换为 10 金）"],
  ["Mummy set", "沙漠地区的木乃伊、光明木乃伊、暗黑木乃伊和血木乃伊掉落，每件 1.33%"],
  ["Pedguin's set", "血月期间腐化世界的腐化企鹅或猩红世界的毒企鹅掉落，1/50 (2%) 几率掉落三件中随机一件"],
  ["Rune set", "困难模式地下的稀有敌怪符文巫师必定掉落（符文帽或符文长袍二选一）"],
  ["Sailor set", "海盗入侵事件中的海盗弩手、海盗水手、海盗神射手和私船海盗掉落，每件 1/500 (0.2%)"],
  ["Scarecrow set", "南瓜月事件中的稻草人掉落，每件概率随波数提升（经典 0.28%~3.33%，专家 0.48%~3.33%）"],
  ["Wedding set", "僵尸新娘必定掉落（100%）：血月期间或墓地迷你生物群系中生成的稀有敌怪"],
  ["Gladiator armor", "大理石洞穴中的装甲步兵掉落，每件 1/7 (14.29%)；三件部件可通过微光互相转化"],
  ["Mining armor", "挖矿头盔：商人以 4 金出售，或不死矿工掉落（1/20，5%）；挖矿衣与挖矿裤：不死矿工掉落（3/25，12%）"],
  ["Rain armor", "雨天生成的雨衣僵尸掉落，每件 1/40 (2.5%)"],
  // 靴子 7 条
  ["Flower Boots", "地下丛林的常春藤箱中找到（14.57%），或从丛林匣（1/20，5%）和荆棘匣（1/20，5%）中获得"],
  ["Hermes Boots", "地下、洞穴和地狱地层中的金箱内找到"],
  ["Flurry Boots", "地下雪原的冰冻箱（14.29%）中找到，或从冰冻匣（16.67%）、针叶木匣（16.67%）中开出；冰雪宝箱怪（肉前变体）也会掉落（15.83%）"],
  ["Water Walking Boots", "海洋的水中箱中找到（1/10，10%；Celebrationmk10 世界为 1/7），或从海洋匣（1/10）和海边匣（1/10）中开出"],
  ["Dunerider Boots", "地下沙漠浅层 4/7 区域的沙岩箱中找到（1/4，25%），或从绿洲匣（12.5%）和幻象匣（12.5%）中开出"],
  ["Sailfish Boots", "钓鱼获得：木匣（1/40，2.5%）、珍珠木匣（2.49%）、铁匣（4.26%）、秘银匣（4.19%）"],
  ["Flame Waker Boots", "在熔岩中钓鱼获得：狱石匣或黑曜石匣中开出（各 19%）"]
];

// ---------- 1. v2 图鉴条目 ob 字段 ----------
let v2 = fs.readFileSync(R('pkg-cat-2/data/data-v2.js'), 'utf8');
let ok1 = 0, skip1 = 0;
FIX.forEach(([en, ob]) => {
  const anchor = '"en":"' + en + '"';
  const i = v2.indexOf(anchor);
  if (i < 0) { console.log('v2 未找到:', en); return; }
  const win = v2.slice(i, i + 800);
  const m = win.match(/"ob":"[^"]*"/);
  if (!m) { console.log('v2 ob 未匹配:', en); return; }
  if (m[0] === '"ob":"' + ob + '"') { skip1++; return; }
  v2 = v2.slice(0, i + m.index) + '"ob":"' + ob + '"' + v2.slice(i + m.index + m[0].length);
  ok1++;
});
fs.writeFileSync(R('pkg-cat-2/data/data-v2.js'), v2);
console.log('1) v2 ob 更新', ok1, '条，跳过(已同值)', skip1, '条');

// ---------- 1b. v3 图鉴条目（靴子在 v3 分包） ----------
let v3 = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');
let ok1b = 0;
FIX.slice(16).forEach(([en, ob]) => {
  const anchor = '"en":"' + en + '"';
  const i = v3.indexOf(anchor);
  if (i < 0) { console.log('v3 未找到:', en); return; }
  const win = v3.slice(i, i + 800);
  const m = win.match(/"ob":"[^"]*"/);
  if (!m) { console.log('v3 ob 未匹配:', en); return; }
  if (m[0] === '"ob":"' + ob + '"') { return; }
  v3 = v3.slice(0, i + m.index) + '"ob":"' + ob + '"' + v3.slice(i + m.index + m[0].length);
  ok1b++;
});
fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3);
console.log('1b) v3 ob 更新', ok1b, '条');

// ---------- 2. obt 表（限定范围替换，obt 是最后一个表） ----------
let rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
const obtStart = rw.indexOf('"obt":{');
if (obtStart < 0) { console.log('obt 表定位失败'); process.exit(1); }
const bootEns = FIX.slice(16);
let ok2 = 0;
bootEns.forEach(([en, ob]) => {
  const keyIdx = rw.indexOf('"' + en + '":"', obtStart);
  if (keyIdx < 0) { console.log('obt 无键:', en); return; }
  const valStart = keyIdx + ('"' + en + '":"').length;
  const valEnd = rw.indexOf('"', valStart);
  const oldVal = rw.slice(valStart, valEnd);
  if (oldVal === ob) { return; }
  rw = rw.slice(0, valStart) + ob + rw.slice(valEnd);
  ok2++;
});
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), rw);
console.log('2) obt 表更新', ok2, '键（范围限定于 obt 表内）');

// ---------- 3. items.js 详情页同步（靴子 3 条） ----------
let it = fs.readFileSync(R('data/items.js'), 'utf8');
const ITEM_SYNC = [
  ['赫尔墨斯靴', '地下、洞穴和地狱地层中的金箱内找到'],
  ['水上漂靴', '海洋的水中箱中找到（1/10，10%），或从海洋匣和海边匣中开出（各 1/10，10%）'],
  ['沙丘行者靴', '地下沙漠浅层 4/7 区域的沙岩箱中找到（1/4，25%），或从绿洲匣和幻象匣中开出（各 12.5%）']
];
let ok3 = 0;
ITEM_SYNC.forEach(([nm, ob]) => {
  const i = it.indexOf('name:"' + nm + '"');
  if (i < 0) { console.log('items 未找到:', nm); return; }
  const win = it.slice(i, i + 600);
  const m = win.match(/obtain:"[^"]*"/);
  if (!m) { console.log('items obtain 未匹配:', nm); return; }
  it = it.slice(0, i + m.index) + 'obtain:"' + ob + '"' + it.slice(i + m.index + m[0].length);
  ok3++;
});
fs.writeFileSync(R('data/items.js'), it);
console.log('3) items.js 更新', ok3, '条');
console.log('DONE');
