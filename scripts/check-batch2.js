const fs = require('fs');
function loadV(p) { let s = fs.readFileSync(p, 'utf8'); s = s.slice(s.indexOf('[')).replace(/;\s*$/, ''); return JSON.parse(s); }
const v3 = loadV('D:/小程序库/泰拉瑞亚/pkg-cat-3/data/data-v3.js');
['蘑菇矿锭', '飞翔之魂', '蓝玉', '红玉', '黄玉', '钻石', '翡翠', '紫晶', '玉'].forEach(n => {
  const it = v3.find(i => i.n === n);
  if (it) console.log('[' + n + '] en=' + it.en + ' :: ' + it.ob);
});
console.log('--- 详情页 ---');
const items = require('D:/小程序库/泰拉瑞亚/data/items.js');
['蘑菇矿锭', '飞翔之魂', '蓝玉', '红玉', '黄玉', '钻石', '翡翠', '紫晶'].forEach(n => {
  const it = items.find(i => i.name === n);
  if (it) console.log('[' + n + '] obtain: ' + it.obtain);
});
console.log('--- obt 表 ---');
const rw = fs.readFileSync('D:/小程序库/泰拉瑞亚/pkg-recipe/data/recipes-wiki.js', 'utf8');
const oi = rw.indexOf('"obt":{');
['Shroomite Bar', 'Soul of Flight', 'Sapphire', 'Ruby', 'Topaz', 'Diamond', 'Emerald', 'Amethyst'].forEach(en => {
  const i = rw.indexOf('"' + en + '":"', oi);
  if (i >= 0) console.log('[' + en + '] ' + rw.slice(i + en.length + 3, i + en.length + 120));
});
console.log('--- 怪物跳转检查：monsters.js 中的飞龙 ---');
const mon = fs.readFileSync('D:/小程序库/泰拉瑞亚/data/monsters.js', 'utf8');
['飞龙', '白龙', 'Wyvern'].forEach(k => {
  const i = mon.indexOf(k);
  console.log(k + ': ' + (i >= 0 ? mon.slice(Math.max(0, i - 80), i + 80).replace(/\s+/g, ' ') : '(无)'));
});
