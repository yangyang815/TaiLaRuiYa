const fs = require('fs');
const f = 'D:/小程序库/泰拉瑞亚/data/spritemap.js';
const buf = fs.readFileSync(f);
console.log('文件字节数:', buf.length);
let s = buf.toString('utf8');
console.log('m_wyvern 原文:', JSON.stringify(s.slice(s.indexOf('m_wyvern'), s.indexOf('m_wyvern') + 30)));
// 修复正则字面量为字符串
if (s.indexOf('m_wyvern:/png/') >= 0) {
  s = s.replace('m_wyvern:/png/', 'm_wyvern:"png"');
  fs.writeFileSync(f, s);
  console.log('已修复为 m_wyvern:"png"');
}
// 全文件扫描：值不是 "xxx" 引号形式的裸值
const re = /,([A-Za-z_0-9]+):([A-Za-z\/][A-Za-z0-9\/]*)[,\n}]/g;
let m, bad = [];
while ((m = re.exec(s))) bad.push(m[1] + ':' + m[2]);
console.log('其他无引号值:', bad.length ? bad.join(' | ') : '(无)');
// 终验
delete require.cache[require.resolve(f)];
const sm = require(f);
console.log('终验 SPRITES[m_wyvern] =', JSON.stringify(sm['m_wyvern']), '| 类型:', typeof sm['m_wyvern']);
