// 批量修复：①monsters.js 新增飞龙 ②dex 怪物优先占名 ③蘑菇矿锭三源 ④六种宝石三源补主来源
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

// ---------- 1. monsters.js 新增飞龙 ----------
let mon = fs.readFileSync(R('data/monsters.js'), 'utf8');
if (mon.indexOf('"m_wyvern"') < 0) {
  const wyvern = '{id:"m_wyvern",name:"飞龙",en:"Wyvern",hp:4000,dmg:60,def:10,biome:"太空/困难模式",rarity:4,tier:"post",art:"m_wyvern",drops:[{id:"soul_of_flight",name:"飞翔之魂",rate:"100%（5–10 个）"},{id:"wyvern_kite",name:"飞龙风筝",rate:"4%（大风天）"}],desc:"困难模式翱翔于太空层的巨型白龙，沿弧线绕圈冲撞，是翅膀与飞翔之魂的核心来源。",tip:"贴地飞行引它俯冲后横向闪避，身体很长，用穿透武器最省力。"}';
  mon = mon.replace(/;\s*$/, '') + ',' + wyvern + '];';
  fs.writeFileSync(R('data/monsters.js'), mon);
  console.log('[monsters] 飞龙条目已新增');
} else console.log('[monsters] 飞龙已存在，跳过');

// ---------- 2. dex.js 怪物优先占名 ----------
let dex = fs.readFileSync(R('utils/dex.js'), 'utf8');
const oldLine = 'ALL.forEach(e=>{if(e.name&&e.name.length>=2)names.push([e.name,e.id])})';
const newLine = 'const PRIO={mon:0,boss:0,npc:1,item:2,seed:3};ALL.slice().sort((a,b)=>(PRIO[a.type]??2)-(PRIO[b.type]??2)).forEach(e=>{if(e.name&&e.name.length>=2)names.push([e.name,e.id])})';
if (dex.indexOf(oldLine) >= 0) {
  dex = dex.replace(oldLine, newLine);
  fs.writeFileSync(R('utils/dex.js'), dex);
  console.log('[dex] 名称注册改为怪物/BOSS/NPC 优先');
} else console.log('[dex] 已应用或结构变化，跳过');

// ---------- 3. 蘑菇矿锭三源 ----------
const GEM_MAIN = '地下与洞穴层天然生成（越深的层越易出现高阶宝石）；泥沙、雪泥或沙漠化石放入提炼机可提炼；宝石果种出的宝石树砍伐可收获；花岗岩元素与花岗岩傀儡掉落的晶洞砸开也会出宝石';
// 详情页 items.js（require 后重新读文本）
let items = fs.readFileSync(R('data/items.js'), 'utf8');
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
console.log('=== 详情页：蘑菇矿锭 + 六种宝石 ===');
items = fixObtain(items, '蘑菇矿锭', '自动锤炼机：叶绿锭×1 + 发光蘑菇×15（自动锤炼机由蘑菇人出售，需入住发光蘑菇生物群系房屋）');
['蓝玉', '红玉', '黄玉', '钻石', '翡翠', '紫晶'].forEach(n => {
  items = fixObtain(items, n, GEM_MAIN + '；相邻等级宝石可在微光中互相转换');
});
fs.writeFileSync(R('data/items.js'), items);

// obt 表
let rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
const obtStart = rw.indexOf('"obt":{');
function fixObt(src, en, newObt) {
  const idx = src.indexOf('"' + en + '":"', obtStart);
  if (idx < 0) { console.log('  [MISS obt] ' + en); return src; }
  const keyLen = ('"' + en + '":"').length;
  const end = src.indexOf('"', idx + keyLen);
  const cur = src.slice(idx, end + 1);
  const target = '"' + en + '":"' + newObt + '"';
  if (cur === target) { console.log('  [SKIP obt] ' + en); return src; }
  console.log('  [OK obt] ' + en);
  return src.slice(0, idx) + target + src.slice(end + 1);
}
console.log('=== obt：蘑菇矿锭 + 六种宝石 ===');
rw = fixObt(rw, 'Shroomite Bar', '合成：叶绿锭 + 发光蘑菇×15 @ 自动锤炼机');
['Sapphire', 'Ruby', 'Topaz', 'Diamond', 'Emerald', 'Amethyst'].forEach(en => {
  const idx = rw.indexOf('"' + en + '":"', obtStart);
  if (idx < 0) return;
  const keyLen = ('"' + en + '":"').length;
  const end = rw.indexOf('"', idx + keyLen);
  const cur = rw.slice(idx + keyLen + 1, end);
  const newObt = GEM_MAIN + '；' + cur;
  rw = fixObt(rw, en, newObt);
});
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), rw);

// v3 图鉴：六种宝石补主来源（保留各自微光链）
console.log('=== v3：六种宝石 ===');
function loadV(p) { let s = fs.readFileSync(p, 'utf8'); s = s.slice(s.indexOf('[')).replace(/;\s*$/, ''); return JSON.parse(s); }
let v3raw = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');
const v3 = loadV(R('pkg-cat-3/data/data-v3.js'));
['蓝玉', '红玉', '黄玉', '钻石', '翡翠', '紫晶'].forEach(n => {
  const it = v3.find(i => i.n === n);
  if (!it) return;
  const newOb = GEM_MAIN + '；' + it.ob;
  const anchor = '"en":"' + it.en + '"';
  let idx = v3raw.indexOf(anchor);
  while (idx >= 0) {
    let end = v3raw.indexOf('},{"n":"', idx);
    if (end < 0) end = v3raw.length;
    const win = v3raw.slice(idx, end);
    const m = win.match(/"ob":"[^"]*"/);
    if (m && m[0] !== '"ob":"' + newOb + '"') {
      v3raw = v3raw.slice(0, idx + m.index) + '"ob":"' + newOb + '"' + v3raw.slice(idx + m.index + m[0].length);
      console.log('  [OK] ' + n);
      break;
    }
    idx = v3raw.indexOf(anchor, idx + 1);
  }
});
fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3raw);
console.log('全部完成');
