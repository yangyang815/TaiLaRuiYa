const fs = require('fs');
const itemsP = 'D:/小程序库/泰拉瑞亚/data/items.js';
let items = fs.readFileSync(itemsP, 'utf8');
const i = items.indexOf('name:"生命果"');
const win = items.slice(i, i + 900);
const m = win.match(/obtain:"([^"]*)"/);
const old = m[1];
const newOb = '击败任意机械 Boss 后自然生长于地下丛林的丛林草上，用任意武器或工具采集；每使用 1 个永久 +5 最大生命并恢复 5 生命（生命条单位变金色），需生命值达 400 后才能使用，最多 20 个将上限提升至 500';
if (old === newOb) { console.log('本已正确'); process.exit(0); }
items = items.slice(0, i + m.index) + 'obtain:"' + newOb + '"' + items.slice(i + m.index + m[0].length);
fs.writeFileSync(itemsP, items);
console.log('旧:', old);
console.log('新:', newOb);
