// 武器/工具/防具数值审计：data/items.js stats vs Iteminfo 官方数值
const fs = require('fs')
const items = require('../data/items.js')
const raw = require('./catalog-stage/raw.json')
const s = fs.readFileSync(__dirname + '/catalog-stage/iteminfo-zh.txt', 'utf8')
const II = {}
Object.values(JSON.parse(s.slice(s.indexOf('[=====') + 7, s.indexOf(']=====')))).forEach(x => {
  if (x.internalName) II[x.internalName] = x
})
const en2in = {}
raw.forEach(r => { const iv = r.internal && r.internal !== 'None' ? r.internal : ''; if (r.en && iv && !en2in[r.en]) en2in[r.en] = iv })

function num (t) { const m = String(t).match(/(\d+(\.\d+)?)/); return m ? Number(m[1]) : null }

const res = { def: [], pick: [], axe: [], hammer: [], knock: [], crit: [], mana: [], bait: [] }
let matched = 0
items.forEach(it => {
  if (!it.en) return
  const row = en2in[it.en] ? II[en2in[it.en]] : null
  if (!row) return
  matched++
  const st = it.stats || []
  const find = label => st.find(x => x[0] === label)
  // 防具防御
  const d = find('防御')
  if (d && row.defense != null) {
    const v = num(d[1])
    if (v != null && v !== row.defense) res.def.push(it.id + ' ' + it.name + '(' + it.en + '): 写' + d[1] + ' 官方' + row.defense)
  }
  // 工具力量
  const p = find('镐力')
  if (p && row.pick != null && num(p[1]) !== row.pick) res.pick.push(it.id + ' ' + it.name + ': 写' + p[1] + ' 官方' + row.pick)
  const a = find('斧力')
  if (a && row.axe != null && num(a[1]) !== row.axe) res.axe.push(it.id + ' ' + it.name + ': 写' + a[1] + ' 官方' + row.axe)
  const h = find('锤力')
  if (h && row.hammer != null && num(h[1]) !== row.hammer) res.hammer.push(it.id + ' ' + it.name + ': 写' + h[1] + ' 官方' + row.hammer)
  const bait = find('鱼饵力')
  if (bait && row.bait != null && num(bait[1]) !== row.bait) res.bait.push(it.id + ' ' + it.name + ': 写' + bait[1] + ' 官方' + row.bait)
  // 击退 / 暴击 / 魔力
  const k = find('击退')
  if (k && row.knockback != null) {
    const v = num(k[1])
    if (v != null && Math.abs(v - row.knockback) > 0.01) res.knock.push(it.id + ' ' + it.name + ': 写' + k[1] + ' 官方' + row.knockback)
  }
  const c = find('暴击')
  if (c && row.crit != null) {
    const v = num(c[1])
    if (v != null && v !== row.crit) res.crit.push(it.id + ' ' + it.name + ': 写' + c[1] + ' 官方' + row.crit)
  }
  const mn = find('魔力')
  if (mn && row.mana != null) {
    const v = num(mn[1])
    if (v != null && v !== row.mana) res.mana.push(it.id + ' ' + it.name + ': 写' + mn[1] + ' 官方' + row.mana)
  }
})
console.log('可核对条目:', matched, '/', items.length)
Object.keys(res).forEach(k => {
  console.log('\n== ' + k + ' (' + res[k].length + ') ==')
  res[k].slice(0, 40).forEach(x => console.log('  ' + x))
})
