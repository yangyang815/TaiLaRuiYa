// 图鉴修正：药水增益残留2条 + 机械信息雕像105条 + 掉落战利品15条（官方 wiki 1.4.5.8 核对）
// 幂等：新值已存在时自动跳过。脚本位于 scripts/，从项目根运行。
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

// ---------- 工具 ----------
// 按 en 锚点替换条目内的 ob（窗口 900 字符内找第一个 "ob":"..."）
function fixByEn(src, en, newOb, tag) {
  const anchor = '"en":"' + en + '"';
  const results = [];
  let idx = -1, count = 0, changed = 0, skipped = 0, missing = 0;
  while ((idx = src.indexOf(anchor, idx + 1)) >= 0) {
    count++;
    const win = src.slice(idx, idx + 900);
    const m = win.match(/"ob":"[^"]*"/);
    if (!m) { missing++; continue; }
    if (m[0] === '"ob":"' + newOb + '"') { skipped++; continue; }
    src = src.slice(0, idx + m.index) + '"ob":"' + newOb + '"' + src.slice(idx + m.index + m[0].length);
    changed++;
  }
  if (!count) console.log('  [MISS] ' + tag + ' (en 未找到: ' + en + ')');
  else if (changed) console.log('  [OK] ' + tag + ' 更新 ' + changed + '/' + count + ' 处');
  else console.log('  [SKIP] ' + tag + ' 已是新值 (' + count + ' 处)');
  return src;
}

// ---------- A. 药水增益残留 2 条 ----------
console.log('A) 药水增益残留');
let v2 = fs.readFileSync(R('pkg-cat-2/data/data-v2.js'), 'utf8');
let v3 = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');

v2 = fixByEn(v2, 'Brain Scrambler', '由火星暴乱事件中的鳞甲怪枪手掉落（1/30，3.33%），召唤鳞甲怪坐骑', '扰脑器');
v3 = fixByEn(v3, "Torch God's Favor", '在洞穴层地下的狭小区域放置约 100 根火把触发火把神事件，在火把的攻击下存活（至少 95 根火把发射过）后作为奖励掉落', '火把神的恩宠');

// ---------- B. 雕像（v2 机械物品） ----------
console.log('B) 雕像');
// 巴斯特
v2 = fixByEn(v2, 'Bast Statue', '地下沙漠较深处的沙岩箱中找到（1/3，33.33%），或从钓鱼获得的绿洲匣、幻象匣中开出（各 12.5%）；1.4.4 起还会作为家具自然出现于地下沙漠小屋中', '巴斯特雕像');
// 特殊雕像
v2 = fixByEn(v2, 'Angel Statue', '自然生成于地下（地下小屋/洞穴层），偶尔也出现在宝箱中；用任意镐或钻头采集；丢入微光会变为以太天塔柱', '天使雕像');
v2 = fixByEn(v2, 'Armor Statue', '自然生成于地下（地下小屋/洞穴层），用任意镐或钻头采集；也可在工作台用石块×50 合成（唯一可在工作台制作的雕像）', '盔甲雕像');
v2 = fixByEn(v2, 'Boulder Statue', '无法自然生成；合成：石块×50 + 巨石 @ 灵雾中的重型装配台', '巨石雕像');
v2 = fixByEn(v2, 'Owl Statue', '无法自然生成；合成：石块×50 + 猫头鹰×5 @ 灵雾中的重型装配台', '猫头鹰雕像');
v2 = fixByEn(v2, 'Turtle Statue', '无法自然生成；合成：石块×50 + 任意乌龟×5 @ 灵雾中的重型装配台', '龟雕像');
// 小动物雕像（可自然生成 + 可合成）
const CRITTERS = [
  ['Bird Statue', '任意鸟'], ['Buggy Statue', '任意丛林虫'], ['Bunny Statue', '兔兔'],
  ['Butterfly Statue', '任意蝴蝶'], ['Cockatiel Statue', '任意玄凤鹦鹉'], ['Dragonfly Statue', '任意蜻蜓'],
  ['Duck Statue', '任意鸭'], ['Firefly Statue', '任意萤火虫'], ['Fish Statue', '金鱼'],
  ['Frog Statue', '青蛙'], ['Grasshopper Statue', '蚱蜢'], ['Macaw Statue', '任意金刚鹦鹉'],
  ['Mouse Statue', '老鼠'], ['Penguin Statue', '企鹅'], ['Scorpion Statue', '任意蝎子'],
  ['Seagull Statue', '海鸥'], ['Snail Statue', '任意蜗牛'], ['Squirrel Statue', '任意松鼠'],
  ['Toucan Statue', '巨嘴鸟'], ['Worm Statue', '蠕虫'],
];
CRITTERS.forEach(([en, critter]) => {
  v2 = fixByEn(v2, en, '自然生成于地下（地下小屋/洞穴层）；也可合成：石块×50 + ' + critter + '×5 @ 灵雾中的重型装配台', '小动物雕像');
});
// 丛林蜥蜴三种（神庙专属）
['Lihzahrd Guardian Statue', 'Lihzahrd Statue', 'Lihzahrd Watcher Statue'].forEach(en => {
  v2 = fixByEn(v2, en, '只生成于丛林神庙中，用任意镐或钻头采集', '丛林蜥蜴雕像');
});
// 剩余装饰/敌怪/功能雕像：批量替换旧文案
const oldPot = '"ob":"敲碎陶罐 / 探索获得"';
const newGen = '"ob":"自然生成于地下（最常见于地牢和地下小屋，其次洞穴层），用任意镐或钻头采集"';
let potCnt = (v2.match(/"ob":"敲碎陶罐 \/ 探索获得"/g) || []).length;
v2 = v2.split(oldPot).join(newGen);
console.log('  [OK] 装饰/敌怪/功能雕像批量替换 ' + potCnt + ' 条 → 自然生成文案');
// 字母/数字雕像批量
const oldLetter = '"ob":"合成：石块 @ 重型装配器"';
const newLetter = '"ob":"合成：石块×50 @ 重型装配台"';
let letterCnt = (v2.match(/"ob":"合成：石块 @ 重型装配器"/g) || []).length;
v2 = v2.split(oldLetter).join(newLetter);
console.log('  [OK] 字母/数字雕像批量替换 ' + letterCnt + ' 条');
// 站名统一：重型装配器 → 重型装配台（官方译名）
const asmCnt = (v2.match(/重型装配器/g) || []).length;
v2 = v2.split('重型装配器').join('重型装配台');
console.log('  [OK] v2 站名统一 重型装配器→重型装配台 ' + asmCnt + ' 处');

fs.writeFileSync(R('pkg-cat-2/data/data-v2.js'), v2);

// ---------- C. 掉落战利品（v3） ----------
console.log('C) 掉落战利品');
v3 = fixByEn(v3, 'Coal', '由丛林宝箱怪掉落（1/3，33.33%）；圣诞节期间开启礼物获得（肉前 1/30，3.33%、困难模式 7/225，3.11%）', '煤');
v3 = fixByEn(v3, 'Defender Medal', '旧日军团（撒旦军队）事件中完成波次后由永恒水晶掉落；开启双足翼龙的专家模式宝藏袋可获 30–49 个；与酒馆老板对话选择「永恒水晶」选项另可获 10 个（每人物仅一次）', '护卫奖章');
v3 = fixByEn(v3, 'Goodie Bag', '万圣节期间由任意敌怪掉落（1/80，1.25%）', '礼袋');
const KITE = '，仅在大风天期间或风速超过 20 mph 时掉落';
v3 = fixByEn(v3, 'Angry Trapper Kite', '由丛林的愤怒捕手掉落（4%）' + KITE, '愤怒捕手风筝');
v3 = fixByEn(v3, 'Blue Jellyfish Kite', '由蓝水母掉落（2%）' + KITE, '蓝水母风筝');
v3 = fixByEn(v3, 'Man Eater Kite', '由食人怪掉落（4%）' + KITE, '食人怪风筝');
v3 = fixByEn(v3, 'Pink Jellyfish Kite', '由粉水母掉落（2%）' + KITE, '粉水母风筝');
v3 = fixByEn(v3, 'Unicorn Kite', '由困难模式的独角兽掉落（4%）' + KITE, '独角兽风筝');
v3 = fixByEn(v3, 'Wandering Eye Kite', '由游荡眼球怪掉落（4%）' + KITE, '游荡眼球怪风筝');
// 宝藏袋×2（重复条目同文案）
v3 = fixByEn(v3, 'Treasure Bag', '专家模式中由 Boss 掉落，每个 Boss 对应一种专属宝藏袋；大师模式下还会额外掉落 Boss 圣物', '宝藏袋');
v3 = fixByEn(v3, 'Treasure Bag (Lunatic Cultist)', '专家模式中击败拜月教邪教徒后掉落；大师模式下还会额外掉落 Boss 圣物', '宝藏袋（拜月教邪教徒）');
v3 = fixByEn(v3, 'Used Gas Trap', '由毒气陷阱触发后变化而来（毒气陷阱可由整蛊坐垫丢入微光获得，也出现在 No traps 和终极世界的宝箱中）；丢入微光可重新装填为新的毒气陷阱', '用过的毒气陷阱');
v3 = fixByEn(v3, 'Golden Lock Box', '在地牢中钓鱼获得的围栏匣或地牢匣中必定获得（100%）；物品栏中有金钥匙时右键打开，可开出地牢金箱中的稀有物品', '金锁盒');
v3 = fixByEn(v3, 'Obsidian Lock Box', '在地狱中钓鱼获得的黑曜石匣或狱石匣中必定获得（100%）；物品栏中有暗影钥匙时右键打开，可开出地狱暗影箱中的稀有物品', '黑曜石锁盒');

// v3 站名统一
const asmCnt3 = (v3.match(/重型装配器/g) || []).length;
if (asmCnt3) { v3 = v3.split('重型装配器').join('重型装配台'); console.log('  [OK] v3 站名统一 ' + asmCnt3 + ' 处'); }
fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3);

// ---------- D. obt 表同步（范围限定 + 站名统一） ----------
console.log('D) obt 表同步');
let rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
const os = rw.indexOf('"obt":{');
const obEnd = rw.indexOf('}', rw.lastIndexOf('module.exports')); // 不用；obt 是最后一张表
// 用 obt:{ 起点到文件中下一个顶层键或文件尾的范围：obt 之后一般无其他表，取至文件末尾前的 } 前即可
// 稳妥做法：从 os 起找每个键
function setObt(en, newOb) {
  const ki = rw.indexOf('"' + en + '":"', os);
  if (ki < 0) { console.log('  [obt MISS] ' + en); return; }
  const vs = ki + en.length + 4;
  const ve = rw.indexOf('"', vs);
  const old = rw.slice(vs, ve);
  if (old === newOb) { console.log('  [obt SKIP] ' + en); return; }
  rw = rw.slice(0, vs) + newOb + rw.slice(ve);
  console.log('  [obt OK] ' + en);
}
setObt('Used Gas Trap', '由毒气陷阱触发后变化而来（毒气陷阱可由整蛊坐垫丢入微光获得，也出现在 No traps 和终极世界的宝箱中）；丢入微光可重新装填为新的毒气陷阱');
setObt('Angel Statue', '自然生成于地下（地下小屋/洞穴层），偶尔也出现在宝箱中；用任意镐或钻头采集；丢入微光会变为以太天塔柱');
setObt('Armor Statue', '自然生成于地下（地下小屋/洞穴层），用任意镐或钻头采集；也可在工作台用石块×50 合成（唯一可在工作台制作的雕像）');
setObt('Boulder Statue', '无法自然生成；合成：石块×50 + 巨石 @ 灵雾中的重型装配台');
setObt('Owl Statue', '无法自然生成；合成：石块×50 + 猫头鹰×5 @ 灵雾中的重型装配台');
setObt('Turtle Statue', '无法自然生成；合成：石块×50 + 任意乌龟×5 @ 灵雾中的重型装配台');
CRITTERS.forEach(([en, critter]) => setObt(en, '自然生成于地下（地下小屋/洞穴层）；也可合成：石块×50 + ' + critter + '×5 @ 灵雾中的重型装配台'));
// 字母/数字 36 键
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const NUMS = '0123456789'.split('');
LETTERS.forEach(l => setObt("'" + l + "' Statue", '合成：石块×50 @ 重型装配台'));
NUMS.forEach(n => setObt("'" + n + "' Statue", '合成：石块×50 @ 重型装配台'));
// obt 站名统一
const asmCntRw = (rw.match(/重型装配器/g) || []).length;
if (asmCntRw) { rw = rw.split('重型装配器').join('重型装配台'); console.log('  [OK] obt 站名统一 ' + asmCntRw + ' 处'); }
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), rw);

console.log('全部完成');
