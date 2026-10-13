// 三源修复：陨石锭/叶绿锭/飞翔之魂（详情页 items.js + 合成页 obt + 图鉴 v3）
// 并扫描 items.js 全部"材料×N"与 wiki 缓存数量的不一致
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

const itemsP = 'data/items.js';
const obtP = 'pkg-recipe/data/recipes-wiki.js';
const v3P = 'pkg-cat-3/data/data-v3.js';

// ---------- 1. 详情页 items.js ----------
let items = fs.readFileSync(R(itemsP), 'utf8');
function fixObtain(src, name, newObtain) {
  const anchor = 'name:"' + name + '"';
  const idx = src.indexOf(anchor);
  if (idx < 0) { console.log('  [MISS] ' + name); return src; }
  const win = src.slice(idx, idx + 800);
  const m = win.match(/obtain:"[^"]*"/);
  if (!m) { console.log('  [无obtain] ' + name); return src; }
  if (m[0] === 'obtain:"' + newObtain + '"') { console.log('  [SKIP] ' + name); return src; }
  console.log('  [OK] ' + name);
  return src.slice(0, idx + m.index) + 'obtain:"' + newObtain + '"' + src.slice(idx + m.index + m[0].length);
}
console.log('=== 详情页 items.js ===');
items = fixObtain(items, '陨石锭', '熔炉：陨石×3（砸暗影珠或猩红之心后陨石坠落）；暗影箱中常见，靠近地狱的洞穴层金箱中较罕见');
items = fixObtain(items, '叶绿锭', '熔炉：叶绿矿×5（叶绿矿藏在地下丛林淤泥中，会向周围蔓延，可种植采集）');
items = fixObtain(items, '飞翔之魂', '击杀飞龙 100% 掉落（飞龙是困难模式在太空层飞行的敌怪）');
fs.writeFileSync(R(itemsP), items);

// ---------- 2. 合成页 obt 表 ----------
let rw = fs.readFileSync(R(obtP), 'utf8');
const obtStart = rw.indexOf('"obt":{');
function fixObt(src, en, newObt) {
  const idx = src.indexOf('"' + en + '":"', obtStart);
  if (idx < 0) { console.log('  [MISS] ' + en); return src; }
  const end = src.indexOf('"', idx + ('"' + en + '":"').length);
  const cur = src.slice(idx, end + 1);
  const target = '"' + en + '":"' + newObt + '"';
  if (cur === target) { console.log('  [SKIP] ' + en); return src; }
  console.log('  [OK] ' + en + ' :: ' + cur.slice(0, 60) + ' → ' + newObt.slice(0, 50));
  return src.slice(0, idx) + target + src.slice(end + 1);
}
console.log('=== 合成页 obt ===');
rw = fixObt(rw, 'Meteorite Bar', '合成：陨石×3 @ 熔炉');
rw = fixObt(rw, 'Chlorophyte Bar', '合成：叶绿矿×5 @ 钛金熔炉或精金熔炉');
rw = fixObt(rw, 'Soul of Flight', '由 飞龙 100% 掉落');
fs.writeFileSync(R(obtP), rw);

// ---------- 3. 图鉴 v3 ----------
let v3 = fs.readFileSync(R(v3P), 'utf8');
function fixV3(src, en, newOb) {
  const anchor = '"en":"' + en + '"';
  let idx = -1;
  while ((idx = src.indexOf(anchor, idx + 1)) >= 0) {
    let end = src.indexOf('},{"n":"', idx);
    if (end < 0) end = src.length;
    const win = src.slice(idx, end);
    const m = win.match(/"ob":"[^"]*"/);
    if (!m) continue;
    if (m[0] === '"ob":"' + newOb + '"') { console.log('  [SKIP] ' + en); return src; }
    console.log('  [OK] ' + en + ' :: ' + m[0].slice(0, 70) + ' → ' + newOb.slice(0, 50));
    return src.slice(0, idx + m.index) + '"ob":"' + newOb + '"' + src.slice(idx + m.index + m[0].length);
  }
  console.log('  [MISS] ' + en);
  return src;
}
console.log('=== 图鉴 v3 ===');
v3 = fixV3(v3, 'Chlorophyte Bar', '合成：叶绿矿×5 @ 钛金熔炉或精金熔炉');
v3 = fixV3(v3, 'Soul of Flight', '由 飞龙 100% 掉落（飞龙是困难模式翱翔于太空层的敌怪）');
fs.writeFileSync(R(v3P), v3);
console.log('陨石锭 v3 已正确，无需改动');

// ---------- 4. 系统扫描：items.js 材料数量 vs wiki 缓存 ----------
const zhTable = require(R('pkg-recipe/data/recipes-wiki.js')).zh;
const enByZh = {};
Object.entries(zhTable).forEach(([en, zh]) => { if (!enByZh[zh]) enByZh[zh] = en; });
const cache = JSON.parse(fs.readFileSync(__dirname + '/recipes-qty-cache.json', 'utf8'));

const arr = JSON.parse(items.slice(items.indexOf('[')).replace(/;\s*$/, ''));
const mismatch = [];
arr.forEach(it => {
  const ob = it.obtain || '';
  const m = ob.match(/^(熔炉|铁砧|铅砧|秘银砧|山铜砧|工匠作坊|工作台|自动锤炼机|晶体送入)：(.+)$/);
  if (!m) return;
  const station = m[1];
  const mats = m[2].split(' + ').map(x => x.trim()).filter(Boolean);
  const en = it.en;
  const list = cache[en];
  if (!list) return;
  const want = mats.map(x => x.replace(/×\d+$/g, '')).sort().join('|');
  const cand = list.find(r => r.mats.map(mm => (enByZh[mm.n] || mm.n)).sort().join('|') === want);
  if (!cand) return;
  cand.mats.forEach(mm => {
    const zhN = enByZh[mm.n] || mm.n;
    const obMat = mats.find(x => x.replace(/×\d+$/g, '') === zhN);
    if (!obMat) return;
    const obQ = obMat.includes('×') ? Number(obMat.split('×')[1]) : 1;
    if (obQ !== mm.q) mismatch.push([it.name, it.en, obMat, 'wiki应为 ' + mm.n + '×' + mm.q]);
  });
});
console.log('\n=== 详情页数量与 wiki 不一致的条目: ' + mismatch.length + ' ===');
mismatch.slice(0, 40).forEach(x => console.log('  [' + x[0] + '] ' + x[2] + ' → ' + x[3]));
fs.writeFileSync(__dirname + '/obtain-qty-mismatch.json', JSON.stringify(mismatch, null, 1));
