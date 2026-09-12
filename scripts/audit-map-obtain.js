// 审计：精品图鉴中“非合成（地图获取）”物品的来源 vs 官方 Drops 表
const fs = require('fs')
const items = require('../data/items.js')
const drops = require('./catalog-stage/drops.json')
const dex = require('../utils/dex')

const clean = s => String(s || '').replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
const isCraftOb = ob => /合成|砧|祭坛|熔炉|^[^：]*：.*×/.test(ob || '')

// 官方掉落者按 NPC 归并（同一 NPC 可能多行，如专家/普通）
const byItem = {}
Object.keys(drops).forEach(item => {
  const m = {}
  drops[item].forEach(d => {
    if (!m[d.by]) m[d.by] = []
    const r = clean(d.rate)
    if (r && m[d.by].indexOf(r) < 0) m[d.by].push(r)
  })
  byItem[item] = Object.entries(m).map(([by, rates]) => by + ' ' + rates.join('/')).join('；')
})

let checked = 0
const flags = []
items.forEach(it => {
  if (!it.en) return
  const ob = it.obtain || ''
  if (!ob) { flags.push('[无obtain] ' + it.name + '(' + it.en + ') cat=' + (it.cat || '')); return }
  if (isCraftOb(ob)) return // 合成类不在本次范围
  const official = byItem[it.en]
  checked++
  if (!official) return // 官方表未收录（矿石/钓取等），跳过
  // 简单对照：官方掉落者关键词是否出现在 obtain 中
  const obL = ob.toLowerCase()
  const droppers = official.split('；').map(x => x.split(' ')[0])
  const missing = droppers.filter(d => {
    // 排除箱子类通用词与 mode 修饰
    const dL = d.toLowerCase()
    return dL !== 'slimes' && obL.indexOf(dL) < 0 && obL.indexOf('宝箱') < 0 && !(dL.indexOf('crate') >= 0 && obL.indexOf('匣') >= 0)
  })
  const allChest = droppers.every(d => /chest|crate/i.test(d))
  if (missing.length && !allChest) {
    flags.push('[来源不全] ' + it.name + '(' + it.en + ')\n    写: ' + ob.slice(0, 70) + '\n    官方: ' + official.slice(0, 110))
  }
})
console.log('非合成可核对条目:', checked)
console.log('异常:', flags.length)
flags.forEach(f => console.log(f))
fs.writeFileSync(__dirname + '/audit-map-obtain.json', JSON.stringify(flags, null, 1))
