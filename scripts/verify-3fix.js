const fs = require('fs');
const items = fs.readFileSync('D:/小程序库/泰拉瑞亚/data/items.js', 'utf8');
['陨石锭', '叶绿锭', '飞翔之魂'].forEach(n => {
  const i = items.indexOf('name:"' + n + '"');
  const m = items.slice(i, i + 600).match(/obtain:"([^"]*)"/);
  console.log('[' + n + '] ' + m[1]);
});
