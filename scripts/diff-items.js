const fs = require('fs');
const R = p => 'D:/小程序库/泰拉瑞亚/' + p;
const mine = new Set(JSON.parse(fs.readFileSync(R('scripts/my-ens.json'), 'utf8')));
const wiki = JSON.parse(fs.readFileSync(R('scripts/wiki-all-items.json'), 'utf8'));
const wikiNames = new Set(Object.keys(wiki));

// wiki 有而库无
const missing = [...wikiNames].filter(n => !mine.has(n));
// 库有而 wiki 无（核对是否非物品条目）
const extra = [...mine].filter(n => !wikiNames.has(n));

console.log('wiki 物品总数:', wikiNames.size, '| 库内 en:', mine.size);
console.log('wiki 有而库无:', missing.length);
console.log('库有而 wiki 无:', extra.length);

fs.writeFileSync(R('scripts/missing-items.json'), JSON.stringify(missing, null, 1));
fs.writeFileSync(R('scripts/extra-items.json'), JSON.stringify(extra, null, 1));

// 缺失清单归类抽样
console.log('\n=== 缺失抽样（前 60）===');
console.log(missing.slice(0, 60).join(', '));
console.log('\n=== 库多出抽样（前 40）===');
console.log(extra.slice(0, 40).join(', '));
