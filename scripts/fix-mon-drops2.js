// 补充修正：愤怒骷髅怪骨剑、螃蟹三折地图、腐化者诅咒焰→维生素
const fs = require('fs')
const mon = require('../data/monsters.js')
let text = fs.readFileSync(__dirname + '/../data/monsters.js', 'utf8')
const FIX = {
  m_angry_bones: { remove: ['bone_sword'] },
  m_crab: { remove: ['trifold_map'] },
  m_corruptor: { remove: ['cursed_flame_item'], add: [{ id: 'vitamin', name: '维生素', rate: '1%' }] }
}
let applied = 0
Object.keys(FIX).forEach(id => {
  const m = mon.find(x => x.id === id)
  const start = text.indexOf('id:"' + id + '"')
  if (start < 0 || !m) { console.log('[未找到]', id); return }
  const winEnd = text.indexOf('spawn:', start)
  const oldWin = text.slice(start, winEnd)
  const mm = oldWin.match(/drops:\[[^\]]*\]/)
  if (!mm) { console.log('[未定位drops]', id); return }
  let list = (m.drops || []).filter(d => !FIX[id].remove.includes(d.id)).map(d => ({ id: d.id, name: d.name, rate: d.rate }))
  ;(FIX[id].add || []).forEach(a => { if (!list.some(x => x.id === a.id)) list.push(a) })
  const ser = 'drops:[' + list.map(d => '{id:"' + d.id + '",name:"' + d.name + '",rate:"' + d.rate + '"}').join(',') + ']'
  text = text.replace(oldWin, oldWin.replace(mm[0], ser))
  applied++
})
fs.writeFileSync(__dirname + '/../data/monsters.js', text)
console.log('补充修正:', applied)
