// 装备数值修正：按条目 id 切片定位，只改该条目 stats
const fs = require('fs')
const items = require('../data/items.js')
let text = fs.readFileSync(__dirname + '/../data/items.js', 'utf8')
const FIX = {
  ankh_shield: [['["防御","+4"]', '["防御","+5"]']],
  iron_pick: [['["镐力","45%"]', '["镐力","40%"]']],
  bone_pick: [['["镐力","35%"]', '["镐力","55%"]']],
  mythril_axe: [['["斧力","100%"]', '["斧力","85%"]']],
  adamantite_axe: [['["斧力","110%"]', '["斧力","100%"]']],
  titanium_axe: [['["斧力","110%"]', '["斧力","105%"]']],
  chlorophyte_axe: [['["斧力","125%"]', '["斧力","115%"]']],
  copper_hammer: [['["锤力","25%"]', '["锤力","35%"]']],
  hamush: [['["锤力","70%"]', '["锤力","85%"]']],
  zenith: [['["暴击","14%"]', '["暴击","10%"]']]
}
let applied = 0
Object.keys(FIX).forEach(id => {
  const start = text.indexOf('id:"' + id + '"')
  if (start < 0) { console.log('[未找到]', id); return }
  // 条目切片：到下一个 id:" 为止（items.js 是扁平对象数组）
  const next = text.indexOf('id:"', start + 10)
  const end = next < 0 ? text.length : next
  const slice = text.slice(start, end)
  let ns = slice, ok = true
  FIX[id].forEach(([o, n]) => {
    if (!ns.includes(o)) { console.log('[条目内未命中]', id, o); ok = false; return }
    ns = ns.split(o).join(n)
  })
  if (!ok) return
  text = text.slice(0, start) + ns + text.slice(end)
  applied++
})
fs.writeFileSync(__dirname + '/../data/items.js', text)
console.log('修正条目:', applied, '/', Object.keys(FIX).length)
