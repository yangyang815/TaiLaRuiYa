// Boss 数值修正：对齐 zh wiki Npcinfo 官方数值（1.4.5.7 经典模式）
const fs = require('fs')
const boss = require('../data/bosses.js')
// id → 补丁 [原串, 新串]
const PATCH = {
  king_slime: [['hp:2800', 'hp:2000']],
  brain_of_cthulhu: [['hp:2250', 'hp:1250（一阶段本体）'], ['dmg:20', 'dmg:30']],
  queen_bee: [['dmg:26', 'dmg:30']],
  deerclops: [['dmg:45', 'dmg:20'], ['def:14', 'def:10']],
  the_destroyer: [['dmg:60', 'dmg:70']],
  skeletron_prime: [['dmg:62', 'dmg:47']],
  plantera: [['dmg:70', 'dmg:50'], ['def:20', 'def:14']],
  golem: [['hp:34000', 'hp:40000（头 25000 / 身体 15000）'], ['dmg:80', 'dmg:80（头部离体）'], ['def:"体 30 / 头 40"', 'def:"体 26 / 头 20（离体 32）"']],
  duke_fishron: [['hp:50000', 'hp:60000']],
  mourning_wood: [['hp:9000', 'hp:14000'], ['dmg:70', 'dmg:120'], ['def:20', 'def:34']],
  pumpking: [['hp:14000', 'hp:26000'], ['dmg:90', 'dmg:50'], ['def:24', 'def:40']],
  everscream: [['hp:8000', 'hp:13000'], ['dmg:80', 'dmg:110'], ['def:20', 'def:38']],
  santa_nk1: [['hp:8000', 'hp:18000'], ['dmg:70', 'dmg:120'], ['def:20', 'def:56']],
  ice_queen: [['hp:17000', 'hp:34000'], ['dmg:90', 'dmg:120'], ['def:26', 'def:38']],
  martian_saucer: [['dmg:90', 'dmg:60（炮塔/炮身）'], ['def:30', 'def:"炮塔 20 / 核心 100"']]
}
let text = fs.readFileSync(__dirname + '/../data/bosses.js', 'utf8')
let applied = 0, miss = 0
boss.forEach(b => {
  const pairs = PATCH[b.id]
  if (!pairs) return
  const start = text.indexOf('id:"' + b.id + '"')
  if (start < 0) { console.log('[未找到]', b.id); miss++; return }
  const eStart = text.lastIndexOf('{', start)
  const eEnd = text.indexOf('},{', start)
  const slice = text.slice(eStart, eEnd < 0 ? undefined : eEnd + 1)
  let ns = slice, ok = true
  pairs.forEach(([o, n]) => {
    if (!ns.includes(o)) { console.log('[条目内未命中]', b.id, o); ok = false; return }
    ns = ns.split(o).join(n)
  })
  if (!ok) { miss++; return }
  text = text.slice(0, eStart) + ns + text.slice(eEnd < 0 ? undefined : eEnd + 1)
  applied++
})
fs.writeFileSync(__dirname + '/../data/bosses.js', text)
console.log('Boss 修正:', applied, '个 | 失败:', miss)
