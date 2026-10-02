// 图鉴工具/饰品 15 条获取方式修正（对照官方 wiki 1.4.5.8，2026-10-02）
const fs = require('fs');
const path = require('path');
const R = (p) => path.join(__dirname, '..', p);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 按 en 锚点在窗口内替换字段值
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

// ---------- 1. pkg-cat-2/data/data-v2.js ----------
let v2 = fs.readFileSync(R('pkg-cat-2/data/data-v2.js'), 'utf8');
const jobs = [
  ['Whoopie Cushion', 'ob', '地下/洞穴层的巨型蠕虫和挖掘怪掉落（2%，专家 4%）；或将僵尸臂丢入微光嬗变获得'],
  ['Guide to Plant Fiber Cordage', 'ob', '地表宝箱中有 9.09% 概率找到，或钓鱼开木匣/珍珠木匣获得（各 0.83%）；上弦月期间骷髅商人出售（2 金 50 银）'],
  ['Step Stool', 'ob', '地表宝箱中有 9.09% 概率找到，或钓鱼开木匣/珍珠木匣获得（各 0.83%）；残月期间骷髅商人出售（2 金 50 银）'],
  ['Treasure Magnet', 'ob', '地狱的暗影箱中有 20% 概率找到，或开启钓鱼所得黑曜石匣/狱石匣中的黑曜石锁盒（20%）'],
  ['Ancient Chisel', 'ob', '地下沙漠的沙岩箱中有 25% 概率找到，或钓鱼开绿洲匣/幻象匣获得（各 12.5%）'],
  ['Heavy Sling', 'ob', '困难模式下由冰雪宝箱怪掉落（19/80，23.75%）'],
  ['Hand Warmer', 'ob', '圣诞节事件期间开启礼物获得（肉前 0.62%，困难模式 0.58%）'],
  ["Gentleman's Beard", 'ob', '发型师出售（5 金）；也可将绅士长胡子徒手制作回短版本'],
  ["Gentleman's Magnificent Beard", 'ob', '佩戴绅士长胡子（配饰栏）自然生长而来（装备 12 分钟后每秒有 11.11% 几率升级）；可徒手制作回绅士长胡子'],
  ['Flying Carpet', 'ob', '沙漠金字塔内的宝箱中有 44.44% 概率找到；或将法老长袍丢入微光嬗变获得'],
  ['Panic Necklace', 'ob', '敲碎猩红之心有 20% 概率获得，或开启猩红匣/血匣（各 20%）；也可合成：星力手环 + 生命水晶 @ 工匠作坊和灵雾'],
  ['Guide to Old World Parkour', 'ob', '合成：书 + 夜明锭×10 @ 远古操纵机'],
  ['Guide to Old World Parkour (Inactive)', 'ob', '由旧世界跑酷指南按打开/激活键切换而来（非独立获得）'],
  ['Guide to Peaceful Coexistence (Inactive)', 'ob', '由和平共处指南按右键切换而来（非独立获得）'],
  ['Guide to Environmental Preservation (Inactive)', 'ob', '由环境保护指南按右键切换而来（非独立获得）'],
  ['Guide to Critter Companionship (Inactive)', 'ob', '由小动物友谊指南按右键切换而来（非独立获得）'],
];
jobs.forEach(([en, f, v]) => { v2 = patchField(v2, en, f, v); });
// 和平共处指南激活版：指南书名修正
v2 = patchField(v2, 'Guide to Peaceful Coexistence', 'ob', '合成：任意小动物友谊指南 + 任意环境保护指南 @ 工作台');

// 新增缺失的"绅士长胡子"条目（贴图 WilsonBeardLong.png 已在 pkg-cat-2/assets）
if (v2.indexOf('"n":"绅士长胡子"') < 0) {
  const ai = v2.indexOf('"n":"绅士胡子"');
  if (ai < 0) throw new Error('绅士胡子锚点未找到');
  const end = v2.indexOf('}', ai);
  const entry = ',{"n":"绅士长胡子","en":"Gentleman\'s Long Beard","f":"WilsonBeardLong","c":"饰品","d":"","dt":"","df":"","r":1,"u":"","k":"","t":"“这是人的面部毛发。”","b":"","s":"售价 1金","ob":"佩戴绅士胡子（配饰栏）自然生长而来（装备 12 分钟后每秒有 11.11% 几率升级）；也可将绅士大胡子徒手制作回长胡子","use":"可用于合成：绅士胡子","hm":0}';
  v2 = v2.slice(0, end + 1) + entry + v2.slice(end + 1);
  console.log('新增条目: 绅士长胡子');
}
fs.writeFileSync(R('pkg-cat-2/data/data-v2.js'), v2);
console.log('data-v2.js OK（16 条 ob + 1 新增 + 1 名称修正）');

// ---------- 2. recipes-wiki.js obt 表同步（已有键） ----------
const rwPath = R('pkg-recipe/data/recipes-wiki.js');
let rw = fs.readFileSync(rwPath, 'utf8');
const obtJobs = [
  ['Whoopie Cushion', '地下/洞穴层的巨型蠕虫和挖掘怪掉落（2%，专家 4%）；或将僵尸臂丢入微光嬗变获得'],
  ['Step Stool', '地表宝箱中有 9.09% 概率找到，或钓鱼开木匣/珍珠木匣获得（各 0.83%）；残月期间骷髅商人出售（2 金 50 银）'],
  ['Treasure Magnet', '地狱的暗影箱中有 20% 概率找到，或开启钓鱼所得黑曜石匣/狱石匣中的黑曜石锁盒（20%）'],
  ['Ancient Chisel', '地下沙漠的沙岩箱中有 25% 概率找到，或钓鱼开绿洲匣/幻象匣获得（各 12.5%）'],
  ['Heavy Sling', '困难模式下由冰雪宝箱怪掉落（19/80，23.75%）'],
  ["Gentleman's Beard", '发型师出售（5 金）；也可将绅士长胡子徒手制作回短版本'],
  ["Gentleman's Magnificent Beard", '佩戴绅士长胡子（配饰栏）自然生长而来（装备 12 分钟后每秒有 11.11% 几率升级）；可徒手制作回绅士长胡子'],
  ['Flying Carpet', '沙漠金字塔内的宝箱中有 44.44% 概率找到；或将法老长袍丢入微光嬗变获得'],
  ['Panic Necklace', '敲碎猩红之心有 20% 概率获得，或开启猩红匣/血匣（各 20%）；也可合成：星力手环 + 生命水晶 @ 工匠作坊和灵雾'],
  ['Guide to Old World Parkour', '合成：书 + 夜明锭×10 @ 远古操纵机'],
];
obtJobs.forEach(([en, v]) => {
  const re = new RegExp('"' + esc(en) + '":"[^"]*"');
  const m = rw.match(re);
  if (!m) { console.log('obt 跳过（无键）:', en); return; }
  if (m[0] === '"' + en + '":"' + v + '"') { console.log('obt 已是新版:', en); return; }
  rw = rw.replace(m[0], '"' + en + '":"' + v + '"');
});
fs.writeFileSync(rwPath, rw);
console.log('recipes-wiki.js obt OK');

// ---------- 3. data/items.js 恐慌项链（删无据的"巫医出售"） ----------
let it = fs.readFileSync(R('data/items.js'), 'utf8');
const oldP = '猩红之心 / 血腥匣、猩红匣 20% 开出；墓地夜晚巫医出售';
const newP = '敲碎猩红之心有 20% 概率获得，或开启血匣/猩红匣（各 20%）；也可用星力手环 + 生命水晶在灵雾中的工匠作坊合成';
if (it.indexOf(oldP) >= 0) { it = it.replace(oldP, newP); console.log('items.js 恐慌项链 OK'); }
else if (it.indexOf(newP) >= 0) console.log('items.js 恐慌项链已是新版，跳过');
else throw new Error('items.js 恐慌项链未找到');
fs.writeFileSync(R('data/items.js'), it);
console.log('全部补丁完成');
