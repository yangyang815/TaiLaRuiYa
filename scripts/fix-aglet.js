// 鞋带束头 obtain 按官方更新
const fs = require('fs')
let s = fs.readFileSync('data/items.js', 'utf8')
const re = /(id:"aglet"[^}]*?)obtain:"[^"]*"/
if (!re.test(s)) { console.log('未命中'); process.exit(1) }
s = s.replace(re, '$1obtain:"地表宝箱 9.09% 开启；钓鱼木匣/珍珠木匣 0.83%；骷髅商人于新月夜出售（2 金 50 银）"')
fs.writeFileSync('data/items.js', s)
const it = require('../data/items.js').find(x => x.id === 'aglet')
console.log('鞋带束头 obtain:', it.obtain)
