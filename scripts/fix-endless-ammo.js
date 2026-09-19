// 全量目录：无尽火枪袋/无尽箭袋 补 1.4.5 配方数量 + 官方名"火枪弹"
const fs = require('fs')
const p = 'pkg-cat-3/data/data-v3.js'
let s = fs.readFileSync(p, 'utf8')
const fixes = [
  ['"f":"EndlessMusketPouch"', '"合成：火枪子弹 @ 水晶球"', '"合成：火枪弹×9999 @ 水晶球"'],
  ['"f":"EndlessQuiver"', '"合成：木箭 @ 水晶球"', '"合成：木箭×9999 @ 水晶球"'],
]
for (const [anchor, oldOb, newOb] of fixes) {
  const i = s.indexOf(anchor)
  if (i < 0) { console.log('未找到', anchor); process.exit(1) }
  const seg = s.slice(i, i + 900)
  if (!seg.includes(oldOb)) { console.log('ob 未命中', anchor, JSON.stringify(seg.slice(0, 300))); process.exit(1) }
  s = s.slice(0, i) + seg.replace(oldOb, newOb) + s.slice(i + 900)
}
fs.writeFileSync(p, s)
// 复核
const v3 = JSON.parse(s.replace(/^[\s\S]*?module\.exports\s*=\s*/, '').replace(/;\s*$/, ''))
for (const f of ['EndlessMusketPouch', 'EndlessQuiver']) console.log(f, '→', JSON.stringify(v3.find(x => x.f === f).ob))
