// 图鉴「家具光源」分类占位修正 11 条（官方 wiki 1.4.5.8 核对）
// v2: 利器站/向日葵；v3: 五种梳妆台/死亡草/月光草/丛林蜥蜴熔炉/荧光棒；obt 同步 3 键
const fs = require('fs');
const R = p => require('path').resolve(__dirname, '..', p);

function fixOb(src, en, ob, tag) {
  const anchor = '"en":"' + en + '"';
  const idx = src.indexOf(anchor);
  if (idx < 0) { console.log('  [MISS] ' + tag + ' (' + en + ')'); return [src, 'miss']; }
  const win = src.slice(idx, idx + 900);
  const m = win.match(/"ob":"[^"]*"/);
  if (!m) { console.log('  [MISS ob] ' + tag + ' (' + en + ')'); return [src, 'miss']; }
  const old = m[0];
  if (old === '"ob":"' + ob + '"') return [src, 'skip'];
  const pos = idx + m.index;
  return [src.slice(0, pos) + '"ob":"' + ob + '"' + src.slice(pos + old.length), 'ok'];
}

// ---------- v2 两条 ----------
const V2 = [
  ['Sharpening Station', '自然生成于地下丛林的地下小屋中，用镐或钻头采集；困难模式期间由商人出售（10 金）'],
  ['Sunflower', '自然生成于地表森林的草地上，用镐或钻头采集；非血月期间由树妖出售（50 银）'],
];

// ---------- v3 九条 ----------
const V3 = [
  ['Blue Dungeon Dresser', '自然生成于地牢的蓝砖区域，用镐或钻头采集'],
  ['Green Dungeon Dresser', '自然生成于地牢的绿砖区域，用镐或钻头采集'],
  ['Pink Dungeon Dresser', '自然生成于地牢的粉砖区域，用镐或钻头采集'],
  ['Golden Dresser', '困难模式海盗入侵期间由海盗敌怪掉落（官方未给出具体概率）'],
  ['Obsidian Dresser', '自然生成于地狱的废墟建筑中（放入熔岩也不会被摧毁），用镐或钻头采集'],
  ['Deathweed', '天然生长于腐化/猩红之地的黑檀石、猩红石与腐化/猩红草上，几乎任何武器或工具均可采集；血月或满月期间的夜晚（19:30–4:29）开花并发出紫色发光粒子，收割开花株额外掉落 1–3 个种子；可用死亡草种子种在粘土盆、种植盆或对应土壤上；草药袋也有几率开出（2–40 个，21.698%）'],
  ['Moonglow', '天然生长于丛林生物群系的丛林草上，几乎任何武器或工具均可采集；夜晚（19:30–4:29）开花并发出蓝白色发光粒子，收割开花株额外掉落 1–3 个种子；可用月光草种子种在粘土盆、种植盆或丛林草上；草药袋也有几率开出（2–40 个，21.698%）'],
  ['Lihzahrd Furnace', '总是出现在丛林神庙的丛林蜥蜴箱中（100%，1.3.0.1 起保证）；1.4.5 起击败石巨人后可由身处丛林的蒸汽朋克人出售（10 金）'],
  ['Glowstick', '夜晚由商人出售（10 铜）；除满月外任意月相的白天由骷髅商人出售（10 铜）；100% 掉落自蓝水母、粉水母、绿水母、飞鱼和雨衣僵尸；罐子和宝箱中也常会出现'],
];

let ok = 0, skip = 0, miss = 0;

let v2 = fs.readFileSync(R('pkg-cat-2/data/data-v2.js'), 'utf8');
V2.forEach(([en, ob]) => {
  const [ns, st] = fixOb(v2, en, ob, 'v2');
  v2 = ns; st === 'ok' ? ok++ : st === 'skip' ? skip++ : miss++;
});
fs.writeFileSync(R('pkg-cat-2/data/data-v2.js'), v2);

let v3 = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');
V3.forEach(([en, ob]) => {
  const [ns, st] = fixOb(v3, en, ob, 'v3');
  v3 = ns; st === 'ok' ? ok++ : st === 'skip' ? skip++ : miss++;
});
fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3);

// ---------- obt 表同步 3 键（范围限定，从 obt:{ 起查，防误伤 zh 表） ----------
let rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
const os = rw.indexOf('"obt":{');
let nObt = 0;
['Deathweed', 'Moonglow', 'Glowstick'].forEach(en => {
  const ob = V3.find(x => x[0] === en)[1];
  const ki = rw.indexOf('"' + en + '":"', os);
  if (ki < 0) { console.log('obt 无键:', en); return; }
  const vs = ki + en.length + 4, ve = rw.indexOf('"', vs);
  if (rw.slice(vs, ve) !== ob) { rw = rw.slice(0, vs) + ob + rw.slice(ve); nObt++; }
});
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), rw);

console.log('ob 更新 ' + ok + ' 条，跳过 ' + skip + ' 条，未命中 ' + miss + ' 条（共 11 条）；obt 同步 ' + nObt + ' 键');

// ---------- 校验 ----------
delete require.cache[require.resolve(R('pkg-cat-2/data/data-v2.js'))];
delete require.cache[require.resolve(R('pkg-cat-3/data/data-v3.js'))];
require(R('pkg-cat-2/data/data-v2.js'));
require(R('pkg-cat-3/data/data-v3.js'));
require(R('utils/dex.js'));
console.log('v2/v3/dex 语法 OK');
