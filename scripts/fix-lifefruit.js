const fs = require('fs');
// 1. 详情页 items.js
const itemsP = 'D:/小程序库/泰拉瑞亚/data/items.js';
let items = fs.readFileSync(itemsP, 'utf8');
const i = items.indexOf('name:"生命果"');
if (i < 0) { console.log('未找到生命果'); process.exit(1); }
const win = items.slice(i, i + 800);
const m = win.match(/obtain:"([^"]*)"/);
console.log('原 obtain:', m[1]);
const newOb = '击败任意机械 Boss 后自然生长于地下丛林的丛林草上，用任意武器或工具采集（每生命值上限 5 个，使用永久 +25 最大生命）';
if (m[1] !== newOb) {
  items = items.slice(0, i + m.index) + 'obtain:"' + newOb + '"' + items.slice(i + m.index + m[0].length);
  fs.writeFileSync(itemsP, items);
  console.log('详情页已更新');
} else console.log('详情页本已正确');

// 2. 获取方式页 acquisition.js
const acqP = 'D:/小程序库/泰拉瑞亚/data/acquisition.js';
let acq = fs.readFileSync(acqP, 'utf8');
const oldD = '世纪之花后地下丛林草地随机生成，镐力≥65开采';
const newD = '击败任意机械 Boss 后随机生长在地下丛林的丛林草上，用任意武器或工具采集（无需镐力）';
if (acq.indexOf(oldD) >= 0) {
  acq = acq.replace(oldD, newD);
  fs.writeFileSync(acqP, acq);
  console.log('获取方式页已更新');
} else if (acq.indexOf(newD) >= 0) {
  console.log('获取方式页本已正确');
} else {
  console.log('未找到旧文案，需人工检查');
  const j = acq.indexOf('life_fruit');
  console.log('life_fruit 现文:', acq.slice(j, j + 250));
}
