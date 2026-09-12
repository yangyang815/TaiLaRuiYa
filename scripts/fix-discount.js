// discount_card：单引号风格的 use 字段
const fs = require('fs')
let text = fs.readFileSync('data/items.js', 'utf8')
const start = text.indexOf('id:"discount_card"')
const next = text.indexOf('id:"', start + 10)
const end = next < 0 ? text.length : next
const slice = text.slice(start, end)
const ns = slice.replace(
  /use:'((?:[^'\\]|\\.)*)'/,
  "use:'配合幸运币打造资本家流派，买遍全提格拉；还可与幸运币合成贪婪戒指。'"
)
if (ns !== slice) {
  text = text.slice(0, start) + ns + text.slice(end)
  fs.writeFileSync('data/items.js', text)
  console.log('已修正（单引号字段）')
} else console.log('仍失败')
