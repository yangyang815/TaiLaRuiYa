// 敌怪掉落审计：monsters.js drops vs 官方 Drops 表（物品→掉落者/概率）
const fs = require('fs')
const mon = require('../data/monsters.js')
const dex = require('../utils/dex.js')
const official = require('./catalog-stage/drops.json')

// drop id → 精品图鉴 en
const id2en = {}
dex.ALL.forEach(e => { if (e.type === 'item' && e.id) id2en[e.id] = e.en })

// 清洗官方 rate（wiki 标记 → 数字%）
function rates (raw) {
  if (!raw) return []
  const out = []
  const cleaned = String(raw).replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2').replace(/<[^>]+>/g, ' ')
  const m = cleaned.match(/(\d+(?:\.\d+)?)\s*%/g)
  if (m) m.forEach(x => out.push(parseFloat(x)))
  return out
}
// 官方表：NPC en → {item: [rates]}
const byNpc = {}
Object.keys(official).forEach(item => {
  official[item].forEach(d => {
    const npc = d.by
    if (!byNpc[npc]) byNpc[npc] = {}
    byNpc[npc][item] = rates(d.rate)
  })
})

let checked = 0
const issues = []
mon.forEach(m => {
  if (!m.en || !m.drops) return
  m.drops.forEach(d => {
    const en = id2en[d.id]
    if (!en) return // 钱币/非图鉴物品跳过
    const list = official[en]
    if (!list) return // 官方掉落表未收录该物品（宝箱/钓鱼类），跳过
    checked++
    const entry = list.find(x => x.by === m.en)
    if (!entry) {
      issues.push('[掉落者不符] ' + m.name + '(' + m.en + ') 掉 "' + d.name + '" 官方掉落者: ' + list.map(x => x.by).join('、'))
      return
    }
    // 概率比对
    const or = rates(entry.rate)
    const mr = String(d.rate).match(/(\d+(?:\.\d+)?)\s*%/)
    if (or.length && mr) {
      const mv = parseFloat(mr[1])
      // 允许区间型（如 1%~5%）与多模式值
      const ok = or.some(v => Math.abs(v - mv) < 0.6)
      if (!ok) issues.push('[概率不符] ' + m.name + ' → ' + d.name + ': 写 ' + d.rate + ' | 官方 ' + entry.rate.replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2').replace(/<[^>]+>/g, '').trim())
    }
  })
})
console.log('可核对掉落条目:', checked)
console.log('异常:', issues.length)
issues.slice(0, 50).forEach(x => console.log('  ' + x))
if (issues.length > 50) console.log('  … 共', issues.length, '条')
