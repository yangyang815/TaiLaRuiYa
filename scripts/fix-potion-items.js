const fs = require('fs')
const ip = 'data/items.js'
let s = fs.readFileSync(ip, 'utf8')
const obRep = (id, from, to, tag) => {
  const re = new RegExp('(id:"' + id + '"[\\s\\S]{0,600}?obtain:")([^"]*)(")')
  const m = s.match(re)
  if (!m) { console.log('未命中', tag); process.exit(1) }
  if (!m[2].includes(from)) { console.log('obtain 内容与预期不符', tag, JSON.stringify(m[2])); process.exit(1) }
  s = s.replace(re, '$1' + m[2].replace(from, to) + '$3')
  console.log('OK', tag)
}
obRep('flask_fire', '狱石', '狱石×3', '烈火药剂×3')
obRep('flask_poison', '毒刺', '毒刺×2', '毒药剂×2')
obRep('flask_gold', '金尘', '金尘×5', '金药剂×5')
obRep('flask_party', '彩纸', '彩纸×5', '派对药剂×5')
obRep('flask_cursed', '诅咒焰', '诅咒焰×2', '诅咒焰药剂×2')
obRep('flask_ichor', '灵液', '灵液×2', '灵液药剂×2')
obRep('flask_venom', '小瓶毒液', '小瓶毒液×2', '毒液药剂×2')
obRep('thorns_potion', ' + 蠕虫毒牙 + 毒刺', '', '荆棘药水去错料')
fs.writeFileSync(ip, s)
console.log('items.js 完成')
const items = require('../data/items.js')
;['flask_fire', 'thorns_potion', 'calm', 'teleportation'].forEach(id => {
  const x = items.find(y => y.id === id)
  console.log('##', x.name, ':', x.obtain)
})
