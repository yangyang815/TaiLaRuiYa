// 图鉴武器条目获取方式修正（对照官方 wiki 1.4.5.8，2026-09-28）
// 沙漠虎杖/星云奥秘/毒液法杖/寒霜九头蛇法杖/腐化者之戟/手枪/异域弯刀/夺命杖/火之花
const fs = require('fs');
const path = require('path');

// 按 en 锚点在窗口内正则替换字段值
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

function patchRaw(src, oldVal, newVal) {
  if (src.indexOf(oldVal) < 0) throw new Error('原文未找到: ' + oldVal);
  return src.replace(oldVal, newVal);
}

// ---------- 1. pkg-cat-3/data/data-v3.js（图鉴条目展示源，本批 9 条全在此） ----------
const v3Path = path.join(__dirname, '..', 'pkg-cat-3', 'data', 'data-v3.js');
let v3 = fs.readFileSync(v3Path, 'utf8');

// 沙漠虎杖
v3 = patchField(v3, 'Desert Tiger Staff', 'ob',
  '地牢的沙漠箱中必定找到（100%）；沙漠箱需在击败世纪之花后用沙漠钥匙开启，钥匙在沙漠生物群系击败敌怪有 1/2500 概率掉落');
// 星云奥秘：补碎片数量
v3 = patchField(v3, 'Nebula Arcanum', 'ob', '合成：星云碎片×18 @ 远古操纵机');
// 毒液法杖：补材料数量
v3 = patchField(v3, 'Venom Staff', 'ob', '合成：剧毒法杖 + 叶绿锭×14 @ 秘银砧/山铜砧');
// 寒霜九头蛇法杖
v3 = patchField(v3, 'Staff of the Frost Hydra', 'ob',
  '地牢的冰雪箱中必定找到（100%）；冰雪箱需在击败世纪之花后用冰冻钥匙开启，钥匙在雪原生物群系击败敌怪有 1/2500 概率掉落');
// 腐化者之戟
v3 = patchField(v3, 'Scourge of the Corruptor', 'ob',
  '地牢的腐化箱中必定找到（100%）；腐化箱需在击败世纪之花后用腐化钥匙开启，钥匙在腐化生物群系击败敌怪有 1/2500 概率掉落');
// 手枪
v3 = patchField(v3, 'Handgun', 'ob',
  '地牢的锁住金箱中有 1/7 (14.29%) 概率获得，或开启钓鱼所得地牢匣/围栏匣中的金锁盒（14.29% 概率）');
// 异域弯刀
v3 = patchField(v3, 'Exotic Scimitar', 'ob',
  '染料商掉落（1/8，12.5%）；城镇 NPC 不受玩家直接伤害，需用臭虫剑等外来伤害源将其击杀');
// 夺命杖
v3 = patchField(v3, 'Life Drain', 'ob', '困难模式下由猩红宝箱怪掉落（1/5，20%）');
// 火之花
v3 = patchField(v3, 'Flower of Fire', 'ob',
  '地狱的暗影箱中有 1/5 (20%) 概率找到，或开启钓鱼所得黑曜石匣/狱石匣中的黑曜石锁盒（20% 概率）；在 don\'t dig up/终极世界中改由红魔鬼掉落');
fs.writeFileSync(v3Path, v3);
console.log('data-v3.js OK');

// ---------- 2. pkg-recipe/data/recipes-wiki.js（obt 源表中已有键同步） ----------
const rwPath = path.join(__dirname, '..', 'pkg-recipe', 'data', 'recipes-wiki.js');
let rw = fs.readFileSync(rwPath, 'utf8');
rw = patchRaw(rw, '"Nebula Arcanum":"合成：星云碎片 @ 远古操纵机"',
  '"Nebula Arcanum":"合成：星云碎片×18 @ 远古操纵机"');
rw = patchRaw(rw, '"Venom Staff":"合成：剧毒法杖 + 叶绿锭 @ 秘银砧"',
  '"Venom Staff":"合成：剧毒法杖 + 叶绿锭×14 @ 秘银砧/山铜砧"');
rw = patchRaw(rw, '"Handgun":"开启宝藏袋获得"',
  '"Handgun":"地牢的锁住金箱中有 1/7 (14.29%) 概率获得，或开启钓鱼所得地牢匣/围栏匣中的金锁盒（14.29% 概率）"');
fs.writeFileSync(rwPath, rw);
console.log('recipes-wiki.js OK');
console.log('全部补丁完成');
