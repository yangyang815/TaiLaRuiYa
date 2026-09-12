// 补修3个id + gold_ore 调试
const fs = require('fs')
let text = fs.readFileSync('data/items.js', 'utf8')
let n = 0
function patch (id, fn) {
  const start = text.indexOf('id:"' + id + '"')
  if (start < 0) { console.log('MISS', id); return }
  const next = text.indexOf('id:"', start + 10)
  const end = next < 0 ? text.length : next
  const slice = text.slice(start, end)
  const ns = fn(slice)
  if (ns !== slice) { text = text.slice(0, start) + ns + text.slice(end); n++ } else console.log('NOCHANGE', id)
}
patch('super_mana', s => s.replace('300 魔力', '400 魔力'))
patch('restoration', s => s.replace('80 生命 + 80 魔力', '90 生命 + 80 魔力'))
patch('bone_pick', s => s.replace('地下矿工', '不死矿工'))
// gold_ore 调试
const i = text.indexOf('id:"gold_ore"')
const seg = text.slice(i, i + 400)
const m = seg.match(/obtain:.{0,60}/)
console.log('gold_ore obtain 原文:', m && m[0])
fs.writeFileSync('data/items.js', text)
console.log('本轮修正:', n)
