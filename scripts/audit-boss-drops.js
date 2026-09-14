// 全量审计：30 个 Boss 的 drops vs 官方 Drops 表（zh 名 → en 反查 → droppers 归属核对）
const fs = require('fs')
const boss = require('../data/bosses.js')
const drops = require('./catalog-stage/drops.json')
const raw = require('./catalog-stage/raw.json')
const cs = require('../utils/catalog-search')
const dex = require('../utils/dex')

// 目录 zh 名 → en
let all = []
for (let i = 1; i <= require('../utils/cat-vols.js'); i++) all = all.concat(require('../pkg-cat-' + i + '/data/data-v' + i + '.js'))
const rows = cs.normalizeRows(all, 1)
const zh2en = {}
rows.forEach(r => { if (r.n && r.en && zh2en[r.n] === undefined) zh2en[r.n] = r.en })
dex.ALL.forEach(e => { if (e.name && e.en && zh2en[e.name] === undefined) zh2en[e.name] = e.en })

const clean = s => String(s || '').replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
// 掉落名拆分：去数量（×30~87、(腐化) 等）
function splitNames (name) {
  return String(name).split(/[\/、]/).map(x => x.replace(/[（(][^）)]*[）)]/g, '').replace(/[×x][\d~]+.*$/, '').replace(/\d+~\d+$/, '').trim()).filter(Boolean)
}
let checked = 0, wrong = 0, missing = 0
const out = []
boss.forEach(b => {
  ;(b.drops || []).forEach(d => {
    checked++
    const names = splitNames(d.name)
    const ens = names.map(n => zh2en[n]).filter(Boolean)
    if (!ens.length) { out.push('[无法反查] ' + b.name + ' → ' + d.name); return }
    // 任一对应物品的官方 droppers 含本 boss 即算归属成立
    const droppers = new Set()
    ens.forEach(en => { (drops[en] || []).forEach(r => droppers.add(clean(r.by))) })
    const bossL = b.en.toLowerCase()
    const bossIn = [...droppers].some(by => by.toLowerCase().includes(bossL))
    if (droppers.size && !bossIn) {
      wrong++
      out.push('[归属错误] ' + b.name + ' 的 ' + d.name + ' | 官方掉落者: ' + [...droppers].slice(0, 4).join(', '))
    } else if (!droppers.size) {
      missing++
      out.push('[官方表无] ' + b.name + ' → ' + d.name)
    }
  })
  // 反向：官方表中由本 Boss 掉落、但我们没列的物品
  if (!b.en) return
  const bossL = b.en.toLowerCase()
  Object.keys(drops).forEach(en => {
    const by = (drops[en] || []).some(r => clean(r.by).toLowerCase().includes(bossL))
    if (!by) return
    const have = (b.drops || []).some(d => {
      const names = splitNames(d.name)
      return names.some(n => zh2en[n] === en)
    })
    if (!have) { missing++; out.push('[缺失] ' + b.name + ' 官方还掉: ' + en) }
  })
})
fs.writeFileSync(__dirname + '/boss-drops-audit.txt', out.join('\n'))
console.log('核对条目:', checked, '| 归属错误:', wrong, '| 缺失/无记录:', missing)
console.log(out.slice(0, 40).join('\n'))
