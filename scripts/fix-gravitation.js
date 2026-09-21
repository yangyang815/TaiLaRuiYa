// 调试并修正重力药水匣子文案
const fs = require('fs')
let s = fs.readFileSync('data/items.js', 'utf8')
const i = s.indexOf('id:"gravitation"')
const seg = s.slice(i, i + 500)
const m = seg.match(/obtain:"[^"]*"/)
console.log('原文:', m && m[0])
const fixed = 'obtain:"摆放的瓶子：瓶装水 + 火焰花 + 死亡草 + 闪耀根 + 羽毛 合成；金箱 11.11%、暗影箱 8.33% 及各类匣子常备"'
s = s.slice(0, i) + seg.replace(/obtain:"[^"]*"/, fixed) + s.slice(i + 500)
fs.writeFileSync('data/items.js', s)
const g = require('../data/items.js').find(x => x.id === 'gravitation')
console.log('修正后:', g.obtain)
