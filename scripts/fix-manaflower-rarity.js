// 魔力花稀有度按官方修正（wiki: Rarity level 4 Light Red）
const fs = require('fs')
const p = 'data/items.js'
let s = fs.readFileSync(p, 'utf8')
const re = /(id:"mana_flower",name:"魔力花",en:"Mana Flower",cat:"accessory",)rarity:3/
if (re.test(s)) {
  s = s.replace(re, '$1rarity:4')
  fs.writeFileSync(p, s)
  console.log('魔力花 rarity 3->4 OK')
} else console.log('无需修改或未命中')
