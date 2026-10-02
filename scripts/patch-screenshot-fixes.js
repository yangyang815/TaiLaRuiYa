// 截图反馈六项修正（对照官方 wiki 1.4.5.8，2026-10-02）
// 1) 三套整套盔甲配方数量 2) 禁戒碎片图标+获取方式 3) 鞋带束头效果
// 4) 哥布林术士战利品：补暗影焰弓/掉率/三件武器详情条目/跳转修复
const fs = require('fs');
const path = require('path');
const R = (p) => path.join(__dirname, '..', p);

// ---------- 1. data/recipes.js：整套盔甲数量 ----------
let rec = fs.readFileSync(R('data/recipes.js'), 'utf8');
// 幂等替换：已是新版则跳过
const rep = (src, oldS, newS, tag) => {
  if (src.indexOf(newS) >= 0) { console.log(tag, '已是新版，跳过'); return src; }
  if (src.indexOf(oldS) < 0) throw new Error('未找到: ' + tag);
  return src.replace(oldS, newS);
};
// 死灵：全套 150 骨头 + 135 蛛网（头40/40 胸60/50 腿50/45）
rec = rep(rec, 'ingredients:[{id:"bone",count:135},{id:"cobweb",count:190}]',
  'ingredients:[{id:"bone",count:150},{id:"cobweb",count:135}]', '死灵整套');
// 丛林：全套 32 孢子 + 10 毒刺 + 2 藤蔓（帽8 衣16+10刺 裤8+2藤）
rec = rep(rec, 'ingredients:[{id:"stinger",count:12},{id:"vine",count:2},{id:"jungle_spore",count:8}]',
  'ingredients:[{id:"stinger",count:10},{id:"vine",count:2},{id:"jungle_spore",count:32}]', '丛林整套');
// 禁戒：全套 3 碎片 + 46 锭（头10 胸20 腿16；精金或钛金，1.4.5 可混用）
rec = rep(rec, 'ingredients:[{id:"forbidden_fragment",count:3},{id:"adamantite_bar",count:18},{id:"titanium_bar",count:18}]',
  'ingredients:[{id:"forbidden_fragment",count:3},{id:"adamantite_bar",count:46}]', '禁戒整套');
fs.writeFileSync(R('data/recipes.js'), rec);
console.log('1) recipes.js 三套整套配方 OK');

// ---------- 2. EXTRA 表：禁戒碎片图标与获取方式（JS 字面量，键无引号） ----------
rec = fs.readFileSync(R('data/recipes.js'), 'utf8');
const oldExtra = 'forbidden_fragment:{name:"禁戒碎片",art:"solar_fragment",obtain:"沙尘暴敌怪掉落"}';
const newExtra = 'forbidden_fragment:{name:"禁戒碎片",art:"forbidden_fragment",obtain:"沙尘暴期间的沙尘精必定掉落"}';
if (rec.indexOf(newExtra) >= 0) {
  console.log('2) EXTRA 禁戒碎片 已是新版，跳过');
} else {
  rec = rep(rec, oldExtra, newExtra, 'EXTRA 禁戒碎片');
  fs.writeFileSync(R('data/recipes.js'), rec);
  console.log('2) EXTRA 禁戒碎片 OK');
}

// ---------- 3. utils/pixelart.js：新增 4 个像素画 ----------
let px = fs.readFileSync(R('utils/pixelart.js'), 'utf8');
if (px.indexOf('reg("forbidden_fragment"') >= 0) {
  console.log('3) pixelart 像素画已存在，跳过');
} else {
  const anchor = 'reg("solar_fragment",crystal("#FF9C40","#FFD8A0"));';
  if (px.indexOf(anchor) < 0) throw new Error('pixelart 锚点未找到');
  const add = anchor +
    'reg("forbidden_fragment",crystal("#B8E84C","#E9FFB8"));' +
    'reg("shadowflame_knife",sword("#9A6EE8","#5A38A8"));' +
    'reg("shadowflame_apparition",amulet("#B06EE8"));' +
    'reg("shadowflame_bow",bowT("#B06EE8"));';
  px = px.replace(anchor, add);
  fs.writeFileSync(R('utils/pixelart.js'), px);
  console.log('3) pixelart.js 新增 4 像素画 OK');
}

// ---------- 4. data/items.js：鞋带束头效果 + 错别字 + 三件暗影焰武器 ----------
let it = fs.readFileSync(R('data/items.js'), 'utf8');
it = rep(it, 'stats:[["效果","+20% 加速度上限"]]', 'stats:[["效果","+5% 移动速度"]]', '鞋带束头效果');
it = rep(it, '禁忌碎片×3 + 精金锭或钛金锭×46', '禁戒碎片×3 + 精金锭或钛金锭×46', '禁戒碎片错别字');
const trio =
  '{id:"shadowflame_apparition",name:"暗影焰妖娃",en:"Shadowflame Apparition",cat:"weapon",sub:"magic",rarity:5,art:"shadowflame_apparition",stats:[["伤害","32"],["魔力","6"],["暴击率","7%"],["使用时间","21（快速度）"]],desc:"每次使用发射三根弯曲的暗影焰触手，可穿透 2 个目标，命中必定施加暗影焰。",obtain:"困难模式哥布林入侵中的哥布林术士掉落（16.7%，专家 33.3%）",use:"狭窄地形与群体敌怪表现出色，肉后魔法过渡神器。"},' +
  '{id:"shadowflame_knife",name:"暗影焰刀",en:"Shadowflame Knife",cat:"weapon",sub:"melee",rarity:5,art:"shadowflame_knife",stats:[["伤害","43"],["暴击率","7%"],["使用时间","12（很快速度）"],["击退","5.75"]],desc:"自动开火的射弹飞刀，可在敌怪身上弹射两次，第三次撞击消失，命中必定施加暗影焰。",obtain:"困难模式哥布林入侵中的哥布林术士掉落（16.7%，专家 33.3%）",use:"肉后近战过渡利器，弹射特性对毁灭者等大型敌怪尤其有效。"},' +
  '{id:"shadowflame_bow",name:"暗影焰弓",en:"Shadowflame Bow",cat:"weapon",sub:"ranged",rarity:5,art:"shadowflame_bow",stats:[["伤害","47"],["暴击率","7%"],["使用时间","20（很快速度）"],["击退","4.5"]],desc:"把任何箭转化为暗影焰箭，可穿透 2 个目标，箭矢弧度极高，命中施加暗影焰。",obtain:"困难模式哥布林入侵中的哥布林术士掉落（16.7%，专家 33.3%）",use:"配无尽箭袋无需备箭；箭速偏慢可用魔法箭袋弥补。"},';
if (it.indexOf('{id:"aglet"') < 0) throw new Error('aglet 锚点未找到');
it = it.replace('{id:"aglet"', trio + '{id:"aglet"');
fs.writeFileSync(R('data/items.js'), it);
console.log('4) items.js OK（鞋带效果+错别字+3 条暗影焰武器）');

// ---------- 5. data/monsters.js：哥布林术士战利品 ----------
let mon = fs.readFileSync(R('data/monsters.js'), 'utf8');
const oldDrops = 'drops:[{id:"shadowflame_staff",name:"暗影焰妖娃",rate:"低"},{id:"shadowflame_knife",name:"暗影焰刀",rate:"低"}]';
const newDrops = 'drops:[{id:"shadowflame_apparition",name:"暗影焰妖娃",rate:"16.7%"},{id:"shadowflame_knife",name:"暗影焰刀",rate:"16.7%"},{id:"shadowflame_bow",name:"暗影焰弓",rate:"16.7%"}]';
mon = rep(mon, oldDrops, newDrops, '哥布林术士 drops');
mon = rep(mon, 'tip:"暗影焰系列是召唤师肉后过渡神器。"', 'tip:"暗影焰三件套覆盖近战/魔法/远程，都是肉后过渡的实用武器。"', '哥布林术士 tip');
fs.writeFileSync(R('data/monsters.js'), mon);
console.log('5) monsters.js OK');

console.log('全部补丁完成');
