// 掉落战利品分类剩余模糊条目修正 38 条（官方 wiki 1.4.5.8 核对）
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

function fixByEn(src, en, newOb, tag) {
  const anchor = '"en":"' + en + '"';
  let idx = -1, count = 0, changed = 0, skipped = 0;
  while ((idx = src.indexOf(anchor, idx + 1)) >= 0) {
    count++;
    const win = src.slice(idx, idx + 900);
    const m = win.match(/"ob":"[^"]*"/);
    if (!m) continue;
    if (m[0] === '"ob":"' + newOb + '"') { skipped++; continue; }
    src = src.slice(0, idx + m.index) + '"ob":"' + newOb + '"' + src.slice(idx + m.index + m[0].length);
    changed++;
  }
  if (!count) console.log('  [MISS] ' + tag);
  else if (changed) console.log('  [OK] ' + tag);
  else console.log('  [SKIP] ' + tag);
  return src;
}

const WIND = '，仅在大风天期间或风速超过 20 mph 时掉落';
const FIX = [];
// 7 款大风气球怪系彩色风筝（附着史莱姆掉落，同池同率）
['Blue and Yellow Kite', 'Blue Kite', 'Red and Yellow Kite', 'Red Kite', 'Yellow Kite', 'Bunny Kite', 'Goldfish Kite'].forEach(en =>
  FIX.push([en, '大风气球怪附着生成的史莱姆掉落（1/72，1.39%）' + WIND]));
// 9 款敌怪专属风筝
FIX.push(['Bone Serpent Kite', '由骨蛇掉落（1/15，6.67%）' + WIND]);
FIX.push(['Corrupt Bunny Kite', '由腐化之地的腐化兔兔掉落（4%）' + WIND]);
FIX.push(['Vicious Bunny Kite', '由猩红之地的毒兔兔掉落（4%）' + WIND]);
FIX.push(['Pigron Kite', '由猪龙掉落（4%）' + WIND]);
FIX.push(['Sand Shark Kite', '由地下沙漠的沙鲨掉落（4%）' + WIND]);
FIX.push(['Shark Kite', '由海洋的鲨鱼掉落（4%）' + WIND]);
FIX.push(['World Feeder Kite', '由腐化之地的吞世怪掉落（4%）' + WIND]);
FIX.push(['Wyvern Kite', '由困难模式高空的飞龙掉落（4%）' + WIND]);
// 19 个指定 Boss 宝藏袋（专家模式专属掉落）
const BOSSES = [
  ['Treasure Bag (Betsy)', '双足翼龙'],
  ['Treasure Bag (Brain of Cthulhu)', '克苏鲁之脑'],
  ['Treasure Bag (Deerclops)', '独眼巨鹿'],
  ['Treasure Bag (Duke Fishron)', '猪龙鱼公爵'],
  ['Treasure Bag (Eater of Worlds)', '世界吞噬怪'],
  ['Treasure Bag (Empress of Light)', '光之女皇'],
  ['Treasure Bag (Eye of Cthulhu)', '克苏鲁之眼'],
  ['Treasure Bag (Golem)', '石巨人'],
  ['Treasure Bag (King Slime)', '史莱姆王'],
  ['Treasure Bag (Moon Lord)', '月亮领主'],
  ['Treasure Bag (Plantera)', '世纪之花'],
  ['Treasure Bag (Queen Bee)', '蜂王'],
  ['Treasure Bag (Queen Slime)', '史莱姆皇后'],
  ['Treasure Bag (Skeletron Prime)', '机械骷髅王'],
  ['Treasure Bag (Skeletron)', '骷髅王'],
  ['Treasure Bag (The Destroyer)', '毁灭者'],
  ['Treasure Bag (The Twins)', '双子魔眼'],
  ['Treasure Bag (Wall of Flesh)', '血肉墙'],
];
BOSSES.forEach(([en, boss]) => FIX.push([en, '专家模式中击败' + boss + '后必定掉落']));
// 两个摸彩袋
FIX.push(['Can Of Worms', '在地表的宝箱中找到（16.67% 概率出现，以 1–4 个为一组）；与草药袋可通过微光互相转换']);
FIX.push(['Herb Bag', '在地表的宝箱中找到（16.67% 概率出现，以 1–4 个为一组）；与蠕虫罐头可通过微光互相转换']);

let v3 = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');
FIX.forEach(([en, ob]) => { v3 = fixByEn(v3, en, ob, en); });
fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3);

// obt 表同步（有键的）
let rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
const os = rw.indexOf('"obt":{');
function setObt(en, newOb) {
  const ki = rw.indexOf('"' + en + '":"', os);
  if (ki < 0) { console.log('  [obt 无键] ' + en); return; }
  const vs = ki + en.length + 4, ve = rw.indexOf('"', vs);
  if (rw.slice(vs, ve) === newOb) { console.log('  [obt SKIP] ' + en); return; }
  rw = rw.slice(0, vs) + newOb + rw.slice(ve);
  console.log('  [obt OK] ' + en);
}
setObt('Can Of Worms', '在地表的宝箱中找到（16.67% 概率出现，以 1–4 个为一组）；与草药袋可通过微光互相转换');
setObt('Herb Bag', '在地表的宝箱中找到（16.67% 概率出现，以 1–4 个为一组）；与蠕虫罐头可通过微光互相转换');
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), rw);
console.log('完成，共处理 ' + FIX.length + ' 条');
