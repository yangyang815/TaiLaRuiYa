const fs = require('fs');
const s = fs.readFileSync('D:/小程序库/泰拉瑞亚/data/items.js', 'utf8');
['陨石锭', '叶绿锭', '飞翔之魂'].forEach(n => {
  const i = s.indexOf('name:"' + n + '"');
  if (i < 0) { console.log('[' + n + '] 主包无此条'); return; }
  const seg = s.slice(i, i + 600);
  const m = seg.match(/obtain:"([^"]*)"/);
  console.log('[' + n + '] 详情页 obtain: ' + (m ? m[1] : '(无)'));
});
const rw = fs.readFileSync('D:/小程序库/泰拉瑞亚/pkg-recipe/data/recipes-wiki.js', 'utf8');
const oi = rw.indexOf('"obt":{');
['Meteorite Bar', 'Chlorophyte Bar', 'Soul of Flight'].forEach(en => {
  const i = rw.indexOf('"' + en + '":"', oi);
  console.log('[obt ' + en + '] ' + (i >= 0 ? rw.slice(i, i + 160) : '(无键)'));
});
// acquisition.js
const acq = fs.readFileSync('D:/小程序库/泰拉瑞亚/data/acquisition.js', 'utf8');
['meteorite_bar', 'chlorophyte_bar'].forEach(k => {
  const i = acq.indexOf(k + ':[{t:');
  console.log('[acq ' + k + '] ' + (i >= 0 ? acq.slice(i, i + 300) : '(无键)'));
});
