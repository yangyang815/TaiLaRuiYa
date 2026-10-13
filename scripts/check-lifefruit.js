const fs = require('fs');
// 1. 三源现状
function loadV(p) { let s = fs.readFileSync(p, 'utf8'); s = s.slice(s.indexOf('[')).replace(/;\s*$/, ''); return JSON.parse(s); }
const v3 = loadV('D:/小程序库/泰拉瑞亚/pkg-cat-3/data/data-v3.js');
const items = require('D:/小程序库/泰拉瑞亚/data/items.js');
const acq = fs.readFileSync('D:/小程序库/泰拉瑞亚/data/acquisition.js', 'utf8');
const rw = fs.readFileSync('D:/小程序库/泰拉瑞亚/pkg-recipe/data/recipes-wiki.js', 'utf8');
const lf = v3.find(i => i.n === '生命果');
console.log('[v3] en=' + lf.en + '\n  ob: ' + lf.ob);
const it = items.find(i => i.name === '生命果');
console.log('[详情页] obtain: ' + (it ? it.obtain : '(无)'));
const i1 = acq.indexOf('life_fruit:[{t:');
console.log('[acq] ' + (i1 >= 0 ? acq.slice(i1, i1 + 400) : '(无键)'));
const oi = rw.indexOf('"obt":{');
const i2 = rw.indexOf('"Life Fruit":"', oi);
console.log('[obt] ' + (i2 >= 0 ? rw.slice(i2, i2 + 300) : '(无键)'));
// 2. 全库搜"世纪之花"出现且含生命果的
['pkg-cat-3/data/data-v3.js', 'data/items.js', 'data/acquisition.js', 'pkg-recipe/data/recipes-wiki.js'].forEach(p => {
  const s = fs.readFileSync('D:/小程序库/泰拉瑞亚/' + p, 'utf8');
  const re = /[^"]{0,60}生命果[^"]{0,80}世纪之花[^"]{0,40}|[^"]{0,60}世纪之花[^"]{0,80}生命果[^"]{0,40}/g;
  let m, c = 0;
  while ((m = re.exec(s)) && c < 5) { console.log('[' + p + '] …' + m[0].replace(/\s+/g, ' ') + '…'); c++; }
});
