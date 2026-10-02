// 饰品"开启宝箱"占位全量修正（对照官方 wiki 1.4.5.8）
// 覆盖：pkg-cat-2/data/data-v2.js（图鉴）、pkg-recipe/data/recipes-wiki.js（obt 源表）、data/items.js（详情页）
const fs = require('fs');
const R = p => 'D:/小程序库/泰拉瑞亚/' + p;

// 幂等替换：找到 anchor 后，在其后 window 范围内把 "ob":"..." 整体替换
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

// ---------- 1. v2 图鉴 15 条 ----------
let v2 = fs.readFileSync(R('pkg-cat-2/data/data-v2.js'), 'utf8');
const FIX = [
  ['Cloud in a Bottle', '地下、洞穴和地狱地层的金箱中找到'],
  ['Cross Necklace', '困难模式下由宝箱怪掉落（1/6，16.67%）'],
  ["Philosopher's Stone", '困难模式下由宝箱怪掉落（1/6，16.67%）'],
  ['Titan Glove', '困难模式下由宝箱怪掉落（1/6，16.67%）'],
  ['Star Cloak', '困难模式下由宝箱怪掉落（1/6，16.67%）'],
  ['Band of Regeneration', '地下与洞穴地层的金箱中找到（地下 16.67%、洞穴 13.33%），地下丛林的生命红木树中也有；肉前的宝箱怪变体 16.67% 掉落'],
  ['Magic Quiver', '困难模式下由骷髅弓箭手掉落（1/40，2.5%）'],
  ['Jetpack', '蒸汽朋克人出售（40 金）：需击败任一机械 Boss，且月相为新月至盈凸月期间'],
  ['Spectre Goggles', '墓地中的机器侠出售（10 金，1.4.5 起机械师也出售）；仅回声世界秘密种子中可从任意宝箱以 4% 概率获得'],
  ['Yoyo Glove', '困难模式期间由骷髅商人出售（50 金）'],
  ['Ram Rune', '地牢锁住的金箱中获得（1/8，12.5%）；或地牢匣/围栏匣开出的金锁盒（1/8，12.5%）；1.4.5 新增'],
  ['Silver Bracer', '骷髅王后地牢锁住的金箱中获得（1/4，25%）；或地牢匣/围栏匣开出的金锁盒（1/4，25%）；1.4.5.7 新增'],
  ['Snake Band', '困难模式下由地下沙漠的拉弥亚（光明/暗黑）掉落（1/40，2.5%）；1.4.5.7 新增'],
  ['Snapping Stone', '由花岗岩巨人和花岗精掉落（1/80，1.25%）；1.4.5.7 新增'],
  ['Wicked Armlet', '困难模式下由诅咒锤和猩红斧掉落（1/25，4%）；1.4.5.7 新增'],
];
FIX.forEach(([en, ob]) => { v2 = patchV2Ob(v2, en, ob, en); });
fs.writeFileSync(R('pkg-cat-2/data/data-v2.js'), v2);
console.log('1) v2 图鉴 15 条 OK');

// ---------- 2. obt 源表 12 键同步 ----------
let rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
const OBT = FIX.filter(([en]) => !['Jetpack', 'Spectre Goggles', 'Ram Rune'].includes(en));
let obtOk = 0;
OBT.forEach(([en, ob]) => {
  const re = new RegExp('"' + en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '":"[^"]*"');
  const m = rw.match(re);
  if (!m) { console.log('  obt 无键跳过:', en); return; }
  if (m[0] === '"' + en + '":"' + ob + '"') { console.log('  obt 跳过(已新值)', en); obtOk++; return; }
  rw = rw.replace(m[0], '"' + en + '":"' + ob + '"');
  obtOk++;
});
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), rw);
console.log('2) obt 同步', obtOk, '键 OK');

// ---------- 3. items.js 详情页 2 条 ----------
let it = fs.readFileSync(R('data/items.js'), 'utf8');
function patchItemOb(src, name, newOb, tag) {
  const anchor = 'name:"' + name + '"';
  const i = src.indexOf(anchor);
  if (i < 0) throw new Error('items 未找到 anchor: ' + tag);
  const win = src.slice(i, i + 900);
  const m = win.match(/obtain:"[^"]*"/);
  if (!m) throw new Error('items 未找到 obtain: ' + tag);
  if (m[0] === 'obtain:"' + newOb + '"') { console.log('  跳过(已新值)', tag); return src; }
  return src.slice(0, i + m.index) + 'obtain:"' + newOb + '"' + src.slice(i + m.index + m[0].length);
}
it = patchItemOb(it, '云朵瓶', '地下、洞穴和地狱地层的金箱中找到', '云朵瓶');
it = patchItemOb(it, '魔法箭袋', '困难模式下由骷髅弓箭手掉落（1/40，2.5%）', '魔法箭袋');
fs.writeFileSync(R('data/items.js'), it);
console.log('3) items.js 2 条 OK');

console.log('全部补丁执行完成');
