// 图鉴饰品分类"开启宝藏袋"占位清理（对照官方 wiki 1.4.5.8，2026-10-02）
// 31 条 ob 修正 + obt 表同步（已有键）
const fs = require('fs');
const path = require('path');
const R = (p) => path.join(__dirname, '..', p);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function patchField(src, enAnchor, field, newVal) {
  const ai = src.indexOf('"en":"' + enAnchor + '"');
  if (ai < 0) throw new Error('锚点未找到: ' + enAnchor);
  const win = src.slice(ai, ai + 600);
  const re = new RegExp('"' + field + '":"[^"]*"');
  const m = win.match(re);
  if (!m) throw new Error('字段未找到: ' + enAnchor + ' -> ' + field);
  const at = ai + m.index;
  return src.slice(0, at) + '"' + field + '":"' + newVal + '"' + src.slice(at + m[0].length);
}

const DEV_TXT = '困难模式 Boss 的宝藏袋（史莱姆皇后的除外）有 6.25% 概率开出随机开发者物品（Celebrationmk10 世界为 12.5%）';

const jobs = [
  ['Aglet', '地表宝箱中有 9.09% 概率找到，或钓鱼开木匣/珍珠木匣获得（各 0.83%）；新月期间骷髅商人出售（2 金 50 银）'],
  ['Anklet of the Wind', '丛林匣/荆棘匣中各有 19% 概率出现；丛林神龛与地下丛林的常春藤箱中为 21.72%'],
  ['Bone Glove', '开启骷髅王的宝藏袋获得（专家模式专属，100%）'],
  ['Celestial Magnet', '漂浮岛的天域箱中有 25% 概率找到，或钓鱼开天空匣/天蓝匣获得（各 25%）'],
  ['Feral Claws', '丛林匣/荆棘匣中各有 19% 概率出现；丛林神龛与地下丛林的常春藤箱中为 21.72%'],
  ['Fledgling Wings', '漂浮岛的天域箱中有 2.5% 概率作为次要物品出现，或钓鱼开天空匣/天蓝匣获得（各 2.5%）'],
  ['Flipper', '水中箱、海洋匣、海边匣中各有 22.5% 概率找到'],
  ['Ginger Beard', '铁匣中有 4% 概率找到，困难模式的秘银匣中为 3.93%（任意生物群系钓鱼获得）'],
  ['Hive Pack', '开启蜂王的宝藏袋获得（专家模式专属，100%）'],
  ['Inner Tube', '水中箱、海洋匣、海边匣中各有 22.5% 概率找到'],
  ['Lavaproof Fishing Hook', '在熔岩中钓鱼获得的狱石匣/黑曜石匣中发现（各 19%）'],
  ['Lucky Horseshoe', '漂浮岛的天域箱中找到，或开启太空钓鱼获得的天空匣'],
  ['Poison Barb', '地表宝箱中有 9.09% 概率找到，或钓鱼开木匣/珍珠木匣获得（各 0.83%）'],
  ['Rainbow Cursor', '由光之女皇掉落（5%）；专家模式下从其宝藏袋中亦可获得'],
  ['Soaring Insignia', '开启光之女皇的宝藏袋获得（专家模式专属，100%）'],
  ['Sun Stone', '由石巨人掉落（14.29%）；专家模式下开启石巨人的宝藏袋亦可获得'],
  ['Eye of the Golem', '由石巨人掉落（14.29%）；专家模式下开启石巨人的宝藏袋亦可获得'],
  ['Toolbox', '圣诞节事件期间开启礼物获得（肉前 0.31%，困难模式 0.29%）'],
  ['Tsunami in a Bottle', '钓鱼开木匣（2.44%）、珍珠木匣（12.24%）、铁匣（14.04%）或秘银匣（13.98%）获得'],
  ['Worm Scarf', '开启世界吞噬怪的宝藏袋获得（专家模式专属，100%）'],
  ['Fishron Wings', '由猪龙鱼公爵掉落（经典 6.67%，专家模式 10%）'],
];
['Arkhalis\' Lightwings', 'Cenx\'s Wings', 'Chicken Bones\' Wings', 'Crowno\'s Wings', 'D-Town\'s Wings',
 'FoodBarbarian\'s Tattered Dragon Wings', 'Ghostar\'s Infinity Eight', 'Grox The Great\'s Wings',
 'Jim\'s Wings', 'Kazzymodus\' Wings', 'Lazure\'s Barrier Platform', 'Leinfors\' Prehensile Cloak',
 'Loki\'s Wings', 'Luna\'s Runic Pixie Wings', 'Red\'s Wings', 'Safeman\'s Blanket Cape',
 'Skiphs\' Paws', 'Will\'s Wings'].forEach(en => jobs.push([en, DEV_TXT]));

// ---------- 1. data-v2.js ----------
let v2 = fs.readFileSync(R('pkg-cat-2/data/data-v2.js'), 'utf8');
let ok = 0, skip = 0;
jobs.forEach(([en, v]) => {
  const cur = '"' + en + '":"' + v + '"';
  if (v2.indexOf(cur) >= 0) { skip++; return; }
  v2 = patchField(v2, en, 'ob', v);
  ok++;
});
fs.writeFileSync(R('pkg-cat-2/data/data-v2.js'), v2);
console.log('data-v2.js 修正', ok, '条，跳过', skip);

// ---------- 2. obt 表同步（存在才改） ----------
const rwPath = R('pkg-recipe/data/recipes-wiki.js');
let rw = fs.readFileSync(rwPath, 'utf8');
let ob = 0, mis = 0;
jobs.forEach(([en, v]) => {
  const re = new RegExp('"' + esc(en) + '":"[^"]*"');
  const m = rw.match(re);
  if (!m) { mis++; return; }
  const nv = '"' + en + '":"' + v + '"';
  if (m[0] === nv) return;
  rw = rw.replace(m[0], nv);
  ob++;
});
fs.writeFileSync(rwPath, rw);
console.log('obt 同步', ob, '条，无键跳过', mis);
