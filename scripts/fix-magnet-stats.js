const fs = require('fs')
const p = 'data/items.js'
let s = fs.readFileSync(p, 'utf8')
const re = /(id:"magnet_flower",name:"磁花",en:"Magnet Flower",cat:"accessory",rarity:4,art:"magnet_flower",stats:\[\["效果","远距离拾取魔力星"\]\])/
if (re.test(s)) {
  s = s.replace(re, 'id:"magnet_flower",name:"磁花",en:"Magnet Flower",cat:"accessory",rarity:4,art:"magnet_flower",stats:[["效果","自动拾取魔力星"],["效果","魔力不足自动喝药水"]]')
  fs.writeFileSync(p, s)
  console.log('stats OK')
} else console.log('regex 未命中')
const it = require('../data/items.js').find(x => x.id === 'magnet_flower')
console.log(JSON.stringify(it))
