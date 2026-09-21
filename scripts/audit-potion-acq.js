// 药水获取方式一致性审计：items.js obtain vs acquisition.js MANUAL vs 官方配方(zhdetail)
const fs = require('fs')
const items = require('../data/items.js')
const M = require('../data/acquisition.js').DATA
const R = require('../data/recipes.js')
const zd = require('../scripts/catalog-stage/zhdetail.json')
const RW = require('../pkg-recipe/data/recipes-wiki.js')
const zhName = RW.zh || {}

const pots = items.filter(x => x.cat === 'potion')

function parseObtain(txt) {
  // 取 station 与材料串
  const t = (txt || '').split('；')[0]
  const i = t.indexOf('：')
  const st = i >= 0 ? t.slice(0, i) : ''
  const matsStr = (i >= 0 ? t.slice(i + 1) : t).replace(/合成|获得/g, '')
  const mats = matsStr.split(/[+＋、]/).map(s => s.trim()).filter(Boolean).map(s => s.replace(/×\d+$/, '').trim()).filter(Boolean)
  return { st, mats }
}
function official(en) {
  const recs = zd.byResult[en] || []
  const seen = new Set()
  const out = []
  recs.forEach(r => {
    const mats = (r.i || []).map(x => {
      const en0 = Array.isArray(x) ? x[0] : x
      return zhName[en0] || en0
    })
    const key = r.st + '|' + mats.join('+')
    if (seen.has(key)) return
    seen.add(key)
    out.push({ st: r.st, mats })
  })
  return out
}
const ST_ZH = { 'Tinkerer\'s Workshop': '工匠作坊', 'Placed Bottle': '摆放的瓶子', 'Imbuing Station': '灌注站', 'Alchemy Station': '炼药台' }

console.log('===== 全部 66 瓶药水对照 =====')
let issues = 0
pots.forEach(p => {
  const ob = parseObtain(p.obtain)
  const man = (M[p.id] || []).filter(m => m.t === 'craft')
  const off = official(p.en)
  // official 主配方（第一个）
  const o0 = off[0]
  // 材料集合比对（忽略瓶装水差异标记，全部比对）
  const norm = arr => [...arr].map(s => s.replace(/强化?/g, '')).sort().join('|')
  const lines = []
  // 1. items vs MANUAL
  man.forEach(m => {
    const manMats = m.d ? parseObtain(m.d).mats : (m.mats || []).map(x => { const it = items.find(y => y.id === x.id); return it ? it.name : x.id })
    const same = norm(ob.mats) === norm(manMats) || (m.mats && m.mats.length && false)
    if (!same && m.d) {
      lines.push('    MANUAL: [' + (R.STATIONS[m.st] || m.st) + '] ' + m.d)
    }
  })
  // 2. items vs official（仅当官方有配方时）
  if (o0) {
    const offZh = o0.mats.map(s => s)
    const obSet = new Set(ob.mats)
    const missing = offZh.filter(s => !obSet.has(s) && ![...obSet].some(x => x.includes(s) || s.includes(x)))
    const extra = [...obSet].filter(s => !offZh.includes(s) && !offZh.some(x => x.includes(s) || s.includes(x)))
    if (missing.length || extra.length) lines.push('    官方: [' + (ST_ZH[o0.st] || o0.st) + '] ' + offZh.join(' + ') + '  | obtain缺:' + missing.join(',') + ' obtain多:' + extra.join(','))
  }
  if (lines.length) {
    issues++
    console.log('## ' + p.id + ' (' + p.name + ')')
    console.log('    obtain: [' + ob.st + '] ' + ob.mats.join(' + '))
    lines.forEach(l => console.log(l))
  }
})
console.log('===== 有差异条目:', issues, '=====')
