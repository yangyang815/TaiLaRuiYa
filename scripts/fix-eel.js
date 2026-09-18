// 修复电鳗获得方式（在正确卷中定位）
const fs = require('fs')
const e = require('../pkg-cat-3/data/data-v3.js').find(x => x.f === 'EelWhip')
if (!e) { console.log('未找到电鳗'); process.exit(1) }
console.log('原文 ob:', JSON.stringify(e.ob))
e.ob = '由 猪龙鱼公爵 掉落（七选一 14.29%）'
const p = 'pkg-cat-3/data/data-v3.js'
const raw = fs.readFileSync(p, 'utf8')
const header = raw.slice(0, raw.indexOf('module.exports='))
fs.writeFileSync(p, header + 'module.exports=' + JSON.stringify(require('../' + p)) + ';')
console.log('已修:', JSON.stringify(e.ob))
