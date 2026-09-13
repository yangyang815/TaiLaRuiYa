// DPS 最后两件武器修正
const fs = require('fs')
const cs = require('../utils/catalog-search')
let all = []
for (let i = 1; i <= require('../utils/cat-vols.js'); i++) all = all.concat(require('../pkg-cat-' + i + '/data/data-v' + i + '.js'))
const rows = cs.normalizeRows(all, 1)
const raw = require('./catalog-stage/raw.json')
const en2in = {}
raw.forEach(r => { if (r.en && r.internal && r.internal !== 'None' && en2in[r.en] === undefined) en2in[r.en] = r.internal })
const blobSrc = fs.readFileSync('scripts/catalog-stage/iteminfo-zh.txt', 'utf8')
const II = {}
Object.values(JSON.parse(blobSrc.slice(blobSrc.indexOf('[=====') + 7, blobSrc.indexOf(']=====')))).forEach(x => { if (x.internalName && II[x.internalName] === undefined) II[x.internalName] = x })

let text = fs.readFileSync('data/dps.js', 'utf8')
;[['圣骑士之锤', "Paladin's Hammer", 'paladin_hammer'], ['夜辉', 'Nightglow', 'nightglow']].forEach(([n, en, wid]) => {
  const row = rows.find(r => r.en === en)
  const iv = en2in[en]
  const o = iv ? II[iv] : null
  console.log(n, '| 目录名:', row ? row.n : '?', '| 官方:', o ? o.damage + '/' + o.useTime + '/' + o.crit : '无')
  if (!o) return
  const start = text.indexOf('id:"' + wid + '"')
  const next = text.indexOf('{id:"', start + 10)
  const end = next < 0 ? text.length : next
  let slice = text.slice(start, end)
  slice = slice.replace(/name:"(?:[^"\\]|\\.)*"/, 'name:' + JSON.stringify(row.n))
  slice = slice.replace(/dmg:\s*\d+(?:\.\d+)?/, 'dmg:' + o.damage)
  slice = slice.replace(/\buse:\s*\d+(?:\.\d+)?/, 'use:' + o.useTime)
  slice = slice.replace(/crit:\s*\d+(?:\.\d+)?/, 'crit:' + o.crit)
  text = text.slice(0, start) + slice + text.slice(end)
  console.log('  已修正')
})
fs.writeFileSync('data/dps.js', text)
