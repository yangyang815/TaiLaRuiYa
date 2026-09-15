// 全量审计 data/items.js：获得方式 vs drops.json，伤害 vs iteminfo
const fs = require('fs')
const path = require('path')
const STAGE = path.join(__dirname, 'catalog-stage')
const readJSON = n => JSON.parse(fs.readFileSync(path.join(STAGE, n), 'utf8'))

const items = require('../data/items.js')
const DROPS = readJSON('drops.json')

// en->zh NPC 词典（monster/boss + GTN NPCName，无空格键）
const npcZh = {}
try { require('../data/monsters.js').forEach(m => { if (m.en && m.name) npcZh[m.en] = m.name }) } catch (e) {}
try { require('../data/bosses.js').forEach(m => { if (m.en && m.name) npcZh[m.en] = m.name }) } catch (e) {}
try {
  const gt = readJSON('gametext-zh.json')
  if (gt.NPCName) Object.assign(npcZh, gt.NPCName)
  if (gt.SpecialNPCName) Object.assign(npcZh, gt.SpecialNPCName)
} catch (e) {}

// iteminfo
let II = null, nm2in = {}
try {
  const s = fs.readFileSync(path.join(STAGE, 'iteminfo-zh.txt'), 'utf8')
  const i1 = s.indexOf('[=====['), i2 = s.indexOf(']=====')
  const blob = JSON.parse(s.slice(i1 + 7, i2))
  II = {}
  Object.keys(blob).forEach(id => { const it = blob[id]; if (it && it.internalName && !II[it.internalName]) II[it.internalName] = it })
  Object.values(II).forEach(it => { if (it && it.name && it.internalName && !nm2in[it.name]) nm2in[it.name] = it.internalName })
  try { readJSON('raw.json').forEach(x => { if (x.en && x.internal && !nm2in[x.en]) nm2in[x.en] = x.internal }) } catch (e) {}
} catch (e) { console.log('iteminfo 解析失败:', e.message) }

const byZh = by => npcZh[by] || npcZh[by.replace(/ /g, '')] || (nm2in[by] && npcZh[nm2in[by]]) || by
const rates = r => { const m = String(r || '').match(/(\d+(?:\.\d+)?)\s*%/); return m ? parseFloat(m[1]) : null }

const problems = []
items.forEach(it => {
  if (!it || !it.en) return
  // ---- 获得方式 ----
  if (it.obtain && /掉落/.test(it.obtain)) {
    const dl = DROPS[it.en]
    if (!dl || !dl.length) {
      problems.push({ t: 'obtain-no-dropdata', id: it.id, en: it.en, obtain: it.obtain })
    } else {
      const zhSources = [...new Set(dl.map(d => byZh(d.by)))]
      const ratesArr = dl.map(d => ({ s: byZh(d.by), r: rates(d.rate) }))
      const mentioned = zhSources.filter(z => z && it.obtain.includes(z))
      if (!mentioned.length) {
        problems.push({ t: 'obtain-source-mismatch', id: it.id, en: it.en, obtain: it.obtain, official: zhSources.join(' / ') })
      } else {
        ratesArr.forEach(x => {
          if (!x.r || !x.s || !it.obtain.includes(x.s)) return
          const re = new RegExp(x.s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^。；，,]{0,12}?(\\d+(?:\\.\\d+)?)\\s*%')
          const m = it.obtain.match(re)
          if (m && Math.abs(parseFloat(m[1]) - x.r) > 0.01) {
            problems.push({ t: 'obtain-rate-mismatch', id: it.id, en: it.en, obtain: it.obtain, official: x.s + ' ' + x.r + '%' })
          }
        })
      }
    }
  }
  // ---- 伤害数值 ----
  if (Array.isArray(it.stats) && II) {
    const inn = nm2in[it.en]
    const rec = inn && II[inn]
    if (rec && typeof rec.damage === 'number' && rec.damage > 0) {
      const dmgRow = it.stats.find(r => r[0] === '伤害')
      if (dmgRow) {
        const m = String(dmgRow[1]).match(/(\d+(?:\.\d+)?)/)
        if (m && Math.abs(parseFloat(m[1]) - rec.damage) > 0.5) {
          problems.push({ t: 'damage-mismatch', id: it.id, en: it.en, stated: dmgRow[1], official: rec.damage })
        }
      }
    }
  }
})
console.log('共', items.length, '条，问题', problems.length, '处')
problems.forEach((p, i) => console.log(`${i + 1}. [${p.t}] ${p.en}(${p.id})`, JSON.stringify(p)))
fs.writeFileSync(path.join(__dirname, 'audit-items-full-report.json'), JSON.stringify(problems, null, 2))
