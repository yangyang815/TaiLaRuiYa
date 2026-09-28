// 删除 items.js 两条重复条目 + 修正 acquisition.js 相关获取方式（2026-09-28）
const fs = require('fs');
const path = require('path');

// ---------- 1. items.js：删除重复条目 ----------
const itPath = path.join(__dirname, '..', 'data', 'items.js');
let it = fs.readFileSync(itPath, 'utf8');
const before = it.length;

// 条目内无嵌套 {}（stats 用方括号），可安全匹配
const re1 = /,?\{id:"desert_tiger_staff",[^{}]*\}/;
if (!re1.test(it)) throw new Error('desert_tiger_staff 条目未匹配');
it = it.replace(re1, '');
const re2 = /,?\{id:"frost_hydra",[^{}]*\}/;
if (!re2.test(it)) throw new Error('frost_hydra 条目未匹配');
it = it.replace(re2, '');
fs.writeFileSync(itPath, it);
console.log('items.js 删除 2 条，len', before, '->', it.length);

// ---------- 2. acquisition.js：删除错误 frost_hydra 条目 + 修正 desert_tiger ----------
const acqPath = path.join(__dirname, '..', 'data', 'acquisition.js');
let acq = fs.readFileSync(acqPath, 'utf8');
const acqBefore = acq.length;

const bad = 'frost_hydra:[{t:"buy",npc:"酒馆老板",price:"守护者勋章×15"}],';
if (acq.indexOf(bad) < 0) throw new Error('acquisition frost_hydra 原文未找到');
acq = acq.replace(bad, '');

const oldTiger = 'desert_tiger:[{t:"chest",where:"地下沙漠砂岩宝箱",d:"砂岩宝箱开启（需沙漠钥匙）"}]';
const newTiger = 'desert_tiger:[{t:"chest",where:"地牢的沙漠箱",d:"沙漠箱中必定找到（100%）；需在击败世纪之花后用沙漠钥匙开启，钥匙在沙漠生物群系击败敌怪有 1/2500 概率掉落"}]';
if (acq.indexOf(oldTiger) < 0) throw new Error('acquisition desert_tiger 原文未找到');
acq = acq.replace(oldTiger, newTiger);
fs.writeFileSync(acqPath, acq);
console.log('acquisition.js 修正完成，len', acqBefore, '->', acq.length);
