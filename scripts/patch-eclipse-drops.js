// 日食敌怪掉落表全面修正（官方 wiki 1.4.5.8）：
// 1) monsters.js 十个日食敌怪 drops 重写（断裂英雄剑只归蛾怪，补全专属掉落与概率）
// 2) 图鉴条目概率修正：暗夜护符/月亮石/弹簧眼/断裂英雄剑/钉枪/死神镰刀/屠夫链锯
// 3) 图鉴新增"钱币"总条目（v3 钱币分类）+ 贴图
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

// ---------- 1) monsters.js：按敌怪 en 定位，整体替换 drops ----------
let mon = fs.readFileSync(R('data/monsters.js'), 'utf8');
const DROPS = {
  // en 名 → 新 drops 数组原文（只列图鉴已有条目+钱币，概率全部官方）
  Eyezor: 'drops:[{id:"eye_spring",name:"弹簧眼",rate:"6.67%"},{id:"coin",name:"钱币",rate:"100%"}]',
  Frankenstein: 'drops:[{id:"coin",name:"钱币",rate:"100%"}]',
  Vampire: 'drops:[{id:"broken_bat_wing",name:"破蝙蝠之翼",rate:"2.5%"},{id:"moon_stone",name:"月亮石",rate:"2.86%"},{id:"coin",name:"钱币",rate:"100%"}]',
  Fritz: 'drops:[{id:"coin",name:"钱币",rate:"100%"}]',
  Butcher: 'drops:[{id:"butchers_chainsaw",name:"屠夫链锯",rate:"2.5%"},{id:"butcher_mask",name:"屠夫面具",rate:"2%"},{id:"coin",name:"钱币",rate:"100%"}]',
  Nailhead: 'drops:[{id:"nail_gun",name:"钉枪",rate:"4%"},{id:"coin",name:"钱币",rate:"100%"}]',
  'Deadly Sphere': 'drops:[{id:"deadly_sphere_staff",name:"致命球法杖",rate:"3.33%"},{id:"coin",name:"钱币",rate:"100%"}]',
  'Creature from the Deep': 'drops:[{id:"neptune_shell",name:"海神贝壳",rate:"2%"},{id:"coin",name:"钱币",rate:"100%"}]',
  Reaper: 'drops:[{id:"death_sickle",name:"死神镰刀",rate:"2.5%"},{id:"coin",name:"钱币",rate:"100%"}]',
  Mothron: 'drops:[{id:"broken_hero_sword",name:"断裂英雄剑",rate:"25%"},{id:"mothron_wings",name:"蛾怪之翼",rate:"5%"},{id:"coin",name:"钱币",rate:"100%"}]'
};
let okA = 0;
Object.keys(DROPS).forEach(en => {
  const anchor = 'en:"' + en + '"';
  const i = mon.indexOf(anchor);
  if (i < 0) { console.log('[MISS]', en); return; }
  const after = mon.slice(i);
  const m = after.match(/drops:\[[^\]]*\]/);
  if (!m) { console.log('[NO DROPS]', en); return; }
  if (m[0] === DROPS[en]) { console.log('  [SKIP 已同值]', en); okA++; return; }
  mon = mon.slice(0, i + m.index) + DROPS[en] + mon.slice(i + m.index + m[0].length);
  okA++;
});
fs.writeFileSync(R('data/monsters.js'), mon);
console.log('1) monsters.js 日食 drops 重写', okA, '/10');

// ---------- 2) 图鉴条目概率修正 ----------
let v2 = fs.readFileSync(R('pkg-cat-2/data/data-v2.js'), 'utf8');
const V2FIX = [
  // [en锚点, 旧ob精确串(可空=窗口内首ob), 新ob]
  ['Amulet of the Night', null, '由日食期间的吸血鬼掉落（2.5%）；或在 Vampirism 秘密世界种子中自然生成的宝箱里找到（1/4，25%）；1.4.5 加入'],
  ['Moon Stone', null, '由日食中的吸血鬼掉落（2.86%，专家 5.63%）；夜晚与 underwater 时提供与太阳石对应的近战/远程属性加成'],
  ['Eye Spring', null, '由日食中的眼怪掉落（6.67%，专家 10%）；使用后召唤一只弹簧眼宠物'],
  ['Broken Hero Sword', null, '由日食中的蛾怪掉落（25%，专家 43.75%），只有蛾怪会掉落；用于制作真永夜刃、真断钢剑与泰拉刃'],
  ['Nail Gun', null, '由日食中的钉头掉落（4%，专家 7.84%），钉头同时掉落钉子 100–200 个；快速发射受重力影响的钉子'],
  ['Death Sickle', null, '由日食中的死神掉落（2.5%，专家 4.94%）；挥动时发射可穿墙的镰刀射弹'],
  ["Butcher's Chainsaw", null, '由日食中的屠夫掉落（2.5%）；链锯类近战武器，也可用于收割']
];
let okB = 0;
V2FIX.forEach(([en, oldS, newOb]) => {
  const anchor = '"en":"' + en + '"';
  const i = v2.indexOf(anchor);
  if (i < 0) { console.log('[MISS]', en); return; }
  const win = v2.slice(i, i + 1000);
  const m = win.match(/"ob":"[^"]*"/);
  if (!m) { console.log('[NO OB]', en); return; }
  if (m[0] === '"ob":"' + newOb + '"') { console.log('  [SKIP]', en); okB++; return; }
  v2 = v2.slice(0, i + m.index) + '"ob":"' + newOb + '"' + v2.slice(i + m.index + m[0].length);
  okB++;
});
fs.writeFileSync(R('pkg-cat-2/data/data-v2.js'), v2);
console.log('2) v2 概率修正', okB, '/', V2FIX.length);

// ---------- 3) v3 新增"钱币"总条目 + 贴图 ----------
let v3 = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');
if (v3.indexOf('"en":"Coin"') < 0) {
  const ci = v3.indexOf('"en":"Copper Coin"');
  if (ci < 0) throw new Error('Copper Coin 锚点未找到');
  // 找该条目的起始 {
  let start = v3.lastIndexOf('{', ci);
  const entry = '{"n":"钱币","en":"Coin","c":"钱币","f":"Coin","r":0,"ob":"由敌怪掉落、向 NPC 出售物品或开启罐子和宝箱获得；四种面额为铜币、银币、金币、铂金币，互相可徒手合成转换（100 个低面额合成 1 个高面额）","t":"游戏中的主要货币：用于与 NPC 交易；也可作为钱币枪的弹药投掷攻击（伤害随面额提升）；扔入微光会消失并提供钱币运气","u":""},';
  v3 = v3.slice(0, start) + entry + v3.slice(start);
  fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3);
  console.log('3) v3 新增钱币总条目 OK');
} else {
  console.log('  [SKIP] 钱币总条目已存在');
}
// 贴图：复制 CopperCoin.png → Coin.png
const srcPng = R('pkg-cat-3/assets/CopperCoin.png');
const dstPng = R('pkg-cat-3/assets/Coin.png');
if (!fs.existsSync(dstPng)) {
  fs.copyFileSync(srcPng, dstPng);
  console.log('   贴图 Coin.png 复制 OK');
} else {
  console.log('   [SKIP] Coin.png 已存在');
}
