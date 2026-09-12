// 最后三处修复
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

// 1) 强效魔力药水 效果行 300→200
patch('greater_mana_potion', s => s.replace('恢复 300 魔力', '恢复 200 魔力'))

// 2) 海龟壳 obtain 全局替换（desc 里也可能有）
patch('turtle_shell', s => s.split('丛林巨龟').join('巨型陆龟'))

// 3) discount_card 调试 + 修复
patch('discount_card', s => {
  const i = s.indexOf('use:')
  console.log('discount_card use 原文:', JSON.stringify(s.slice(i, i + 80)))
  if (s.includes('贪婪戒指')) return s
  return s.replace(/(use:"[^"]*资本家[^"]*")/, 'use:"配合幸运币打造资本家流派，买遍全提格拉；还可与幸运币合成贪婪戒指。"')
})

fs.writeFileSync('data/items.js', text)
console.log('修正:', n)
