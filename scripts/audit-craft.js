// 合成物品全字段审计：配方 vs 官方 Recipes 表 + stats vs Iteminfo + use 缺失
const fs = require('fs')
const path = require('path')
const items = require('../data/items.js')
const zd = require('./catalog-stage/zhdetail.json')
const raw = require('./catalog-stage/raw.json')
const cs = require('../utils/catalog-search')

let all = []
for (let i = 1; i <= require('../utils/cat-vols.js'); i++) all = all.concat(require('../pkg-cat-' + i + '/data/data-v' + i + '.js'))
const catRows = cs.normalizeRows(all, 1)

let GTI = {}
try { GTI = JSON.parse(fs.readFileSync(path.join(__dirname, 'catalog-stage/gametext-zh.json'), 'utf8')).ItemName || {} } catch (e) {}
const en2in = {}
raw.forEach(r => { if (r.en && r.internal && r.internal !== 'None' && en2in[r.en] === undefined) en2in[r.en] = r.internal })
function cjk (s) { return /[\u4e00-\u9fa5]/.test(s || '') }
const zhOf = en => {
  const c = catRows.find(r => r.en === en)
  if (c && cjk(c.n)) return c.n
  const iv = en2in[en]
  if (iv && cjk(GTI[iv] || '')) return GTI[iv]
  return null
}

// 官方 Iteminfo
const blobSrc = fs.readFileSync(path.join(__dirname, 'catalog-stage/iteminfo-zh.txt'), 'utf8')
const II = {}
Object.values(JSON.parse(blobSrc.slice(blobSrc.indexOf('[=====') + 7, blobSrc.indexOf(']=====')))).forEach(x => { if (x.internalName && II[x.internalName] === undefined) II[x.internalName] = x })
const num = t => { const m = String(t == null ? '' : t).replace(/,/g, '').match(/-?\d+(\.\d+)?/); return m ? Number(m[0]) : null }
const find = (st, label) => { const e = (st || []).find(x => x[0] === label); return e ? e[1] : null }

// 工作台常见对应（我们的文本 → 关键词）
const ST_KEYWORD = {
  'Mythril Anvil': ['秘银', '山铜'], 'Iron Anvil': ['铁砧'], 'Lead Anvil': ['铅砧'],
  'Work Bench': ['工作台'], 'Furnace': ['熔炉'], 'Hellforge': ['地狱熔炉'],
  'Altar': ['祭坛'], 'Crystal Ball': ['水晶球'], 'Placed Bottle': ['瓶子', '炼药桌'],
  'Alchemy Table': ['炼药桌', '瓶子'], "Tinkerer's Workshop": ['工匠'], 'Loom': ['织布'],
  'Cooking Pot': ['锅', '烹饪'], 'Sawmill': ['锯木'], 'Anvil': ['铁砧', '铅砧'],
  'Book Case': ['书架'], 'Keg': ['酒桶'], 'Bottle': ['瓶子'], 'Water': ['水源', '水边'],
  'Honey': ['蜂蜜'], 'Lava': ['岩浆'], 'Table': ['桌子'], 'Chair': ['椅子'],
  'Bone Welder': ['骨头焊机'], 'Flesh Cloning Vat': ['克隆'], 'Glass Kiln': ['玻璃窑'],
  'Living Loom': ['生命织布机'], 'Sky Mill': ['天空磨坊'], 'Ice Machine': ['冰雪机'],
  'Steam Scientist': ['蒸汽'], 'Lihzahrd Furnace': ['蜥蜴熔炉'], 'Dye Vat': ['染缸'],
  'Teapot': ['茶壶'], 'Meat Grinder': ['绞肉机'], 'Decay Chamber': ['腐化室'],
  'Autohammer': ['自动锤'], 'Blend-o-matic': ['搅拌机'], 'Ecto Mist': ['灵雾']
}

const craft = items.filter(x => /合成：|砧：|熔炉：|摆放的瓶子|水晶球|酿造|祭坛/.test(x.obtain || ''))
const res = { noRecipe: [], missingIng: [], stationMiss: [], extraIng: [], stats: [], noUse: [] }

craft.forEach(it => {
  const recs = zd.byResult && zd.byResult[it.en]
  // 1) 官方无配方但我们声称可合成
  if (!recs || !recs.length) { res.noRecipe.push(it.name + '(' + it.en + ') | obtain: ' + (it.obtain || '').slice(0, 60)); return }
  // 2) 材料比对（取第一条配方）
  const ob = it.obtain || ''
  const rec = recs[0]
  const missing = []
  rec.i.forEach(slot => {
    // 槽内任一替代品被提到即算覆盖
    const names = slot.map(zhOf).filter(Boolean)
    if (!names.length) return
    const hit = names.some(n => ob.includes(n) || (it.en || '').toLowerCase().includes(n.toLowerCase()))
    if (!hit) missing.push(names[0] + (slot.length > 1 ? '/' + slot.map(zhOf).join('/') : ''))
  })
  if (missing.length) res.missingIng.push(it.name + '(' + it.en + ') 缺材料: ' + missing.join('、') + ' | 写: ' + ob.slice(0, 60))
  // 3) 工作台比对
  if (rec.st) {
    const kws = ST_KEYWORD[rec.st]
    if (kws && !kws.some(k => ob.includes(k))) res.stationMiss.push(it.name + '(' + it.en + ') 官方站: ' + rec.st + ' | 写: ' + ob.slice(0, 50))
  }
  // 4) 我们文本括号里列的材料是否官方没有（粗查：括号内顿号分段，逐个反查）
  const paren = ob.match(/（([^）]+)）/)
  if (paren && paren[1].length > 8 && recs.length === 1) {
    const listed = paren[1].split(/[、,，]/).map(s => s.trim()).filter(s => s.length >= 2)
    const officialNames = []
    rec.i.forEach(slot => slot.forEach(x => { const z = zhOf(x); if (z) officialNames.push(z) }))
    const extras = listed.filter(l => !officialNames.some(o => l.includes(o) || o.includes(l)))
    // 只报告明显多余（≥2个未匹配且数量超过官方）
    if (extras.length >= 2 && listed.length > officialNames.length + 1) res.extraIng.push(it.name + '(' + it.en + ') 多列: ' + extras.join('、').slice(0, 60))
  }
  // 5) stats 数值
  const iv = en2in[it.en]
  const row = iv != null ? II[iv] : null
  if (row) {
    const st = it.stats || []
    const d = find(st, '伤害')
    if (d != null && row.damage != null) { const c = num(d); if (c != null && c !== row.damage) res.stats.push(it.id + ' ' + it.name + ' 伤害: 写' + c + ' 官方' + row.damage) }
    const df = find(st, '防御')
    if (df != null && row.defense != null) { const c = num(df); if (c != null && c !== row.defense) res.stats.push(it.id + ' ' + it.name + ' 防御: 写' + c + ' 官方' + row.defense) }
    const k = find(st, '击退')
    if (k != null && row.knockback != null) { const c = num(k); if (c != null && Math.abs(c - row.knockback) > 0.01) res.stats.push(it.id + ' ' + it.name + ' 击退: 写' + c + ' 官方' + row.knockback) }
    const cr = find(st, '暴击')
    if (cr != null && row.crit != null) { const c = num(cr); if (c != null && c !== row.crit) res.stats.push(it.id + ' ' + it.name + ' 暴击: 写' + c + '% 官方' + row.crit + '%') }
    const p = find(st, '镐力')
    if (p != null && row.pick != null) { const c = num(p); if (c != null && c !== row.pick) res.stats.push(it.id + ' ' + it.name + ' 镐力: 写' + c + ' 官方' + row.pick) }
    const a = find(st, '斧力')
    if (a != null && row.axe != null) { const c = num(a); if (c != null && c !== row.axe * 5) res.stats.push(it.id + ' ' + it.name + ' 斧力: 写' + c + ' 官方' + row.axe * 5) }
    const h = find(st, '锤力')
    if (h != null && row.hammer != null) { const c = num(h); if (c != null && c !== row.hammer) res.stats.push(it.id + ' ' + it.name + ' 锤力: 写' + c + ' 官方' + row.hammer) }
    if (row.healLife != null && row.healLife > 0) {
      const full = JSON.stringify({ s: st, d: it.desc, u: it.use })
      const m = full.match(/[恢回][复]?[^0-9]{0,4}(\d+)\s*点?\s*生命/)||full.match(/(\d+)\s*生命/)
      const claimed = m ? Number(m[1]) : null
      if (claimed != null && claimed !== row.healLife) res.stats.push(it.id + ' ' + it.name + ' 回复: 写' + claimed + '生命 官方' + row.healLife)
    }
  }
  // 6) use 缺失
  if (!it.use) res.noUse.push(it.id + ' ' + it.name)
})

let total = 0
Object.keys(res).forEach(k => {
  console.log('== ' + k + ' (' + res[k].length + ')')
  res[k].forEach(x => console.log('  ' + x))
  total += res[k].length
})
console.log('---')
console.log('合成物品:', craft.length, '| 异常总数:', total)
