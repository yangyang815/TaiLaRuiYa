// 瓶装蜂蜜补充蜂王掉落来源
const fs = require('fs')
const p = 'pkg-cat-3/data/data-v3.js'
const s = fs.readFileSync(p, 'utf8')
const re = /("f":"BottledHoney"(?:(?!}\]).)*?"ob":")([^"]*)(")/
const m = s.match(re)
if (!m) { console.log('未找到'); process.exit(1) }
if (m[2].includes('蜂王')) { console.log('已含蜂王来源'); process.exit(0) }
fs.writeFileSync(p, s.replace(re, '$1' + '由 蜂王 掉落；也可合成：玻璃瓶 @ 蜂蜜' + '$3'))
const v3 = require('../' + p)
console.log('已修:', JSON.stringify(v3.find(x => x.f === 'BottledHoney').ob))
