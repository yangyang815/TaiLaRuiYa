// 核对 dps.js 武器排行伤害/攻速/暴击 vs iteminfo-zh.txt（官方 1.4.5.8 数据）
const fs = require('fs')
const path = require('path')
const STAGE = path.join(__dirname, 'catalog-stage')
const readJSON = n => JSON.parse(fs.readFileSync(path.join(STAGE, n), 'utf8'))

const dps = require('../data/dps.js')
const items = require('../data/items.js')

// id → en（精品图鉴）
const id2en = {}
items.forEach(x => { if (x.id) id2en[x.id] = x.en })
// en → internal
let nm2in = {}
try {
  const s = fs.readFileSync(path.join(STAGE, 'iteminfo-zh.txt'), 'utf8')
  const i1 = s.indexOf('[=====['), i2 = s.indexOf(']=====')
  const blob = JSON.parse(s.slice(i1 + 7, i2))
  II = {}
  Object.values(blob).forEach(it => { if (it && it.internalName && !II[it.internalName]) II[it.internalName] = it })
  Object.values(II).forEach(it => { if (it && it.name && it.internalName && !nm2in[it.name]) nm2in[it.name] = it.internalName })
} catch (e) { console.log('iteminfo 解析失败', e.message) }
var II = II || {}
try { readJSON('raw.json').forEach(x => { if (x.en && x.internal && !nm2in[x.en]) nm2in[x.en] = x.internal }) } catch (e) {}

const issues = []
const misses = []
dps.WEAPONS.forEach(w => {
  const en = id2en[w.id]
  const internal = (en && nm2in[en]) || null
  const rec = internal ? II[internal] : null
  if (!rec) { misses.push(w.id + '(' + w.name + ') en=' + en); return }
  const cmp = (label, stated, official) => {
    if (stated == null || official == null) return
    if (Math.abs(Number(stated) - Number(official)) > 0.01) {
      issues.push(`${w.cls} ${w.name}(${w.id}) ${label}: 排行=${stated} 官方=${official}`)
    }
  }
  cmp('伤害', w.dmg, rec.damage)
  cmp('攻速', w.use, rec.useTime)
  cmp('暴击', w.crit, rec.crit)
})
console.log('武器总数:', dps.WEAPONS.length, '| 无法解析:', misses.length, '| 不一致:', issues.length)
if (misses.length) console.log('未解析:', misses.join(' , '))
issues.forEach((x, i) => console.log((i + 1) + '. ' + x))
fs.writeFileSync(path.join(__dirname, 'dps-audit-report.json'), JSON.stringify({ misses, issues }, null, 2))
