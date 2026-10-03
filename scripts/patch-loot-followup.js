// 图鉴补漏 7 条：精确复查发现的同类占位（官方 wiki 1.4.5.8 核对）
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

function fixByEn(src, en, newOb, tag) {
  const anchor = '"en":"' + en + '"';
  let idx = src.indexOf(anchor);
  if (idx < 0) { console.log('  [MISS] ' + tag); return src; }
  const win = src.slice(idx, idx + 900);
  const m = win.match(/"ob":"[^"]*"/);
  if (!m) { console.log('  [MISS ob] ' + tag); return src; }
  if (m[0] === '"ob":"' + newOb + '"') { console.log('  [SKIP] ' + tag); return src; }
  src = src.slice(0, idx + m.index) + '"ob":"' + newOb + '"' + src.slice(idx + m.index + m[0].length);
  console.log('  [OK] ' + tag);
  return src;
}

let v3 = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');
v3 = fixByEn(v3, 'Lihzahrd Pressure Plate', '自然生成于丛林神庙的各处机关中，用任意锤子敲下收集', '丛林蜥蜴压力板');
v3 = fixByEn(v3, 'Coral', '自然生长于海洋底部的沙块上，用任意工具或武器采集即可收集', '珊瑚');
v3 = fixByEn(v3, 'Vicious Mushroom', '自然生长于猩红之地的草地上，用任意武器或工具一击割下收集', '毒蘑菇');
v3 = fixByEn(v3, 'Vile Mushroom', '自然生长于腐化之地的草地上，用任意武器或工具一击割下收集', '魔菇');
v3 = fixByEn(v3, 'Life Fruit', '击败任意机械 Boss 后自然生长于地下丛林的丛林草上，用任意武器或工具采集', '生命果');
v3 = fixByEn(v3, 'Huge Dragon Egg', '稀有自然生成于洞穴层的空腔中，打破后必定掉落幻兽帕鲁联动的坐骑召唤物（疾旋鼬或桃旋鼬，各 50%）', '巨型龙蛋');
v3 = fixByEn(v3, 'Red Envelope', '无法获取：原计划作为中国新年事件的摸彩袋由所有敌怪掉落，但从未实装，随移动版 1.3.0.7 移除', '红包');
fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3);

// obt 同步检查
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
setObt('Lihzahrd Pressure Plate', '自然生成于丛林神庙的各处机关中，用任意锤子敲下收集');
setObt('Coral', '自然生长于海洋底部的沙块上，用任意工具或武器采集即可收集');
setObt('Vicious Mushroom', '自然生长于猩红之地的草地上，用任意武器或工具一击割下收集');
setObt('Vile Mushroom', '自然生长于腐化之地的草地上，用任意武器或工具一击割下收集');
setObt('Life Fruit', '击败任意机械 Boss 后自然生长于地下丛林的丛林草上，用任意武器或工具采集');
setObt('Huge Dragon Egg', '稀有自然生成于洞穴层的空腔中，打破后必定掉落幻兽帕鲁联动的坐骑召唤物（疾旋鼬或桃旋鼬，各 50%）');
setObt('Red Envelope', '无法获取：原计划作为中国新年事件的摸彩袋由所有敌怪掉落，但从未实装，随移动版 1.3.0.7 移除');
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), rw);
console.log('完成');
