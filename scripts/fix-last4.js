// 最后 4 条泛化文案精确化
const fs = require('fs')
const items = require('../data/items.js')
let text = fs.readFileSync(__dirname + '/../data/items.js', 'utf8')
const FIX = {
  sanguine_staff: '血月·恐惧鹦鹉螺 50% 掉落',
  raven_staff: '南瓜月·南瓜王 2.5–12.5% 掉落',
  elf_melter: '霜月·圣诞坦克 6.25–16.67% 掉落',
  dual_hook: '宝箱怪 16.67% 掉落（困难模式）'
}
let ok = 0
Object.keys(FIX).forEach(id => {
  const start = text.indexOf('id:"' + id + '"')
  if (start < 0) return
  const next = text.indexOf('id:"', start + 10)
  const end = next < 0 ? text.length : next
  const slice = text.slice(start, end)
  const re = /obtain:"((?:[^"\\]|\\.)*)"/
  if (!slice.match(re)) return
  const ns = slice.replace(re, 'obtain:' + JSON.stringify(FIX[id]))
  text = text.slice(0, start) + ns + text.slice(end)
  ok++
})
fs.writeFileSync(__dirname + '/../data/items.js', text)
console.log('修正:', ok)
