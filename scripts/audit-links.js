// 全量链接审计：所有可点击名称的目标必须可达
const fs = require('fs')
const path = require('path')
const dex = require('../utils/dex')
const cs = require('../utils/catalog-search')

let all = []
for (let i = 1; i <= require('../utils/cat-vols.js'); i++) all = all.concat(require('../pkg-cat-' + i + '/data/data-v' + i + '.js'))
const rows = cs.normalizeRows(all, 1)
dex.extendLinks(rows.map(r => [r.n, 'cat:' + r.f]))
const catIds = new Set(rows.map(r => 'cat:' + r.f))
const catByF = {}
rows.forEach(r => { catByF[r.f] = r })

const bad = []
const checked = new Set()

// 1) 精品图鉴条目文本
dex.ALL.forEach(e => {
  const r = e.raw
  const texts = [['获得', r.obtain], ['出现', r.spawn || r.biome], ['用途', r.use], ['描述', r.desc]]
  texts.forEach(([label, t]) => {
    if (!t) return
    const links = dex.linkify(String(t), e.id)
    links.filter(l => l.ref).forEach(l => {
      const ok = !!dex.byId[l.id] || catIds.has(l.id)
      if (!ok) bad.push('[精品·' + label + '] ' + e.name + ' → "' + l.s + '" id=' + l.id)
      else checked.add(l.id)
    })
  })
})

// 2) wiki 目录条目文本
rows.forEach(r => {
  const texts = [['获得', r.ob], ['用途', r.use]]
  texts.forEach(([label, t]) => {
    if (!t) return
    const links = dex.linkify(String(t), 'cat:' + r.f)
    links.filter(l => l.ref).forEach(l => {
      const ok = !!dex.byId[l.id] || catIds.has(l.id)
      if (!ok) bad.push('[目录·' + label + '] ' + r.n + ' → "' + l.s + '" id=' + l.id)
      else checked.add(l.id)
    })
  })
})

// 3) 落地页校验：cat: 目标的 f 是否真的有目录行（能打开弹窗）
Array.from(checked).filter(id => id.indexOf('cat:') === 0).forEach(id => {
  if (!catByF[id.slice(4)]) bad.push('[落地缺失] ' + id + ' 无对应目录行')
})

console.log('不同链接目标数:', checked.size, '| 断链:', bad.length)
bad.slice(0, 30).forEach(x => console.log('  ' + x))
if (bad.length > 30) console.log('  …共 ' + bad.length + ' 条')
