const fs = require('fs')
let s = fs.readFileSync('data/items.js', 'utf8')
let done = 0
for (const [id, from, to, tag] of [
  ['calm', ' 合成', ' 合成；铁匣/秘银匣 3.13% 开出', '镇静补宝箱'],
  ['teleportation', '水中宝箱/水匣钓鱼开出', '摆放的瓶子：瓶装水 + 混沌鱼 + 火焰花 合成；水中宝箱/水匣钓鱼开出', '传送补配方'],
]) {
  const re = new RegExp('(id:"' + id + '"[\\s\\S]{0,600}?obtain:")([^"]*)(")')
  const m = s.match(re)
  if (!m) { console.log('未命中', tag); process.exit(1) }
  if (m[2].includes(to)) { done++; continue }
  if (!m[2].includes(from)) { console.log('预期不符', tag, JSON.stringify(m[2])); process.exit(1) }
  s = s.replace(re, '$1' + m[2].replace(from, to) + '$3')
  done++
  console.log('OK', tag)
}
fs.writeFileSync('data/items.js', s)
console.log('完成', done)
const items = require('../data/items.js')
console.log('镇静:', items.find(x => x.id === 'calm').obtain)
console.log('传送:', items.find(x => x.id === 'teleportation').obtain)
