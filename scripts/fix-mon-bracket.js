const fs = require('fs');
let s = fs.readFileSync('D:/小程序库/泰拉瑞亚/data/monsters.js', 'utf8');
const i = s.indexOf('{id:"m_wyvern"');
let j = i - 1;
while (j >= 0 && /\s/.test(s[j])) j--;
// s[j] 应为 ','，s[j-1] 应为多余的 ']'
console.log('上下文:', JSON.stringify(s.slice(j - 30, i + 20)));
if (s[j] === ',' && s[j - 1] === ']') {
  s = s.slice(0, j - 1) + s.slice(j);
  fs.writeFileSync('D:/小程序库/泰拉瑞亚/data/monsters.js', s);
  console.log('已删除多余 ]');
}
try {
  const arr = require('D:/小程序库/泰拉瑞亚/data/monsters.js');
  console.log('语法 OK, 条目数:', arr.length, '| 飞龙:', JSON.stringify(arr.find(x => x.id === 'm_wyvern') ? { name: '飞龙', drops: arr.find(x => x.id === 'm_wyvern').drops.length } : null));
} catch (e) {
  console.log('仍报错:', e.message.slice(0, 150));
}
