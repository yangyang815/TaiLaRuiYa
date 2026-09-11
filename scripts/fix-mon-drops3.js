// 最终补充：移除事件小怪身上错误标注的 Boss 专属武器
const fs = require('fs')
const mon = require('../data/monsters.js')
let text = fs.readFileSync(__dirname + '/../data/monsters.js', 'utf8')
const FIX = {
  m_poltergeist: ['bat_scepter'],
  m_headless_horseman: ['horseman'],
  m_yeti: ['chain_gun']
}
let applied = 0
Object.keys(FIX).forEach(id => {
  const m = mon.find(x => x.id === id)
  if (!m) { console.log('[无条目]', id); return }
  const start = text.indexOf('id:"' + id + '"')
  if (start < 0) { console.log('[文本未找到]', id); return }
  const winEnd = text.indexOf('spawn:', start)
  const oldWin = text.slice(start, winEnd)
  const mm = oldWin.match(/drops:\[[^\]]*\]/)
  if (!mm) { console.log('[未定位drops]', id); return }
  const list = (m.drops || []).filter(d => !FIX[id].includes(d.id)).map(d => ({ id: d.id, name: d.name, rate: d.rate }))
  const ser = 'drops:[' + list.map(d => '{id:"' + d.id + '",name:"' + d.name + '",rate:"' + d.rate + '"}').join(',') + ']'
  text = text.replace(oldWin, oldWin.replace(mm[0], ser))
  applied++
})
fs.writeFileSync(__dirname + '/../data/monsters.js', text)
console.log('applied', applied)
