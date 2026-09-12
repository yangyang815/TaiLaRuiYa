// 非合成物品综合修复：恢复量错误 + 掉落者错误 + 来源/用途补全
const fs = require('fs')
const path = require('path')

const items = require('../data/items.js')
const drops = require('./catalog-stage/drops.json')
const raw = require('./catalog-stage/raw.json')
const zd = require('./catalog-stage/zhdetail.json')
const cs = require('../utils/catalog-search')

let all = []
for (let i = 1; i <= require('../utils/cat-vols.js'); i++) all = all.concat(require('../pkg-cat-' + i + '/data/data-v' + i + '.js'))
const catRows = cs.normalizeRows(all, 1)

// 官方译名
let GTI = {}, GTN = {}
try { const g = JSON.parse(fs.readFileSync(path.join(__dirname, 'catalog-stage/gametext-zh.json'), 'utf8')); GTI = g.ItemName || {}; GTN = g.NPCName || {} } catch (e) {}
const en2in = {}
raw.forEach(r => { if (r.en && r.internal && r.internal !== 'None' && en2in[r.en] === undefined) en2in[r.en] = r.internal })
const zhOf = en => {
  const c = catRows.find(r => r.en === en)
  if (c && cjk(c.n)) return c.n
  const iv = en2in[en]
  if (iv && cjk(GTI[iv] || '')) return GTI[iv]
  return null
}
const npcZh = en => {
  try { require('../data/monsters.js').forEach(m => { if (m.en && m.name) npcZh[m.en] = m.name }) } catch (e) {}
  try { require('../data/bosses.js').forEach(m => { if (m.en && m.name) npcZh[m.en] = m.name }) } catch (e) {}
  return npcZh[en] || GTN[en.replace(/[^A-Za-z0-9]/g, '')] || null
}
function cjk (s) { return /[\u4e00-\u9fa5]/.test(s || '') }

let text = fs.readFileSync(path.join(__dirname, '../data/items.js'), 'utf8')
let patchCount = 0

// 在 id 条目切片内做正则替换（防串位）
function patchItem (id, fn) {
  const start = text.indexOf('id:"' + id + '"')
  if (start < 0) { console.log('MISS id:', id); return }
  const next = text.indexOf('id:"', start + 10)
  const end = next < 0 ? text.length : next
  const slice = text.slice(start, end)
  const ns = fn(slice)
  if (ns !== slice) { text = text.slice(0, start) + ns + text.slice(end); patchCount++ }
  else console.log('NOCHANGE:', id)
}
// use 字段整体替换（切片内）
function setUse (slice, newUse) {
  return slice.replace(/use:"((?:[^"\\]|\\.)*)"/, 'use:' + JSON.stringify(newUse))
}
function setObtain (slice, newOb) {
  return slice.replace(/obtain:"((?:[^"\\]|\\.)*)"/, 'obtain:' + JSON.stringify(newOb))
}

// ============ Part A: 恢复量错误 ============
patchItem('super_mana_potion', s => s
  .replace('["恢复","300 魔力"]', '["恢复","400 魔力"]')
  .replace('300 魔力瞬间满上', '400 魔力瞬间满上'))
patchItem('restoration_potion', s => s
  .replace('["恢复","80 生命 + 80 魔力"]', '["恢复","90 生命 + 80 魔力"]'))
patchItem('mushroom', s => {
  if (s.includes('stats:')) return s
  return s.replace('desc:', 'stats:[["恢复","15 生命"]],desc:')
})
patchItem('bottled_water', s => {
  if (s.includes('stats:')) return s
  return s.replace('desc:', 'stats:[["恢复","30 生命"]],desc:')
})

// ============ Part B: 掉落者错误与来源补全 ============
patchItem('moon_stone', s => setObtain(s, '日食·吸血鬼 2.86% 掉落（专家 5.63%）'))
patchItem('lucky_coin', s => setObtain(s, '荷兰飞盗船 6.67% 掉落；海盗船长 0.2%、其余海盗 0.05% 极低概率掉落'))
patchItem('gold_ring', s => setObtain(s, '荷兰飞盗船 6.67% 掉落；海盗船长 0.8%、其余海盗 0.2% 掉落'))
patchItem('metal_detector', s => setObtain(s, '宁芙 50% 掉落（专家 100% · 洞穴层稀有生成）'))
patchItem('bone_pickaxe', s => s.replace('地下矿工', '不死矿工'))
patchItem('turtle_shell', s => s.replace('丛林巨龟', '巨型陆龟'))
patchItem('influx_waver', s => setObtain(s, '火星飞碟 16.66% 掉落'))
patchItem('keybrand', s => setObtain(s, '世纪之花后地牢：蓝装甲/地狱装甲/锈甲骷髅 0.5% 掉落（专家 1%）'))
patchItem('morning_star', s => setObtain(s, '世纪之花后地牢：蓝装甲/地狱装甲/锈甲骷髅 0.5% 掉落（专家 1%）'))
patchItem('greater_mana_potion', s => setObtain(s, '魔法师出售（5金）；困难模式宝箱怪掉落'))

// 锭：补匣子来源
const barIds = ['copper_bar', 'tin_bar', 'iron_bar', 'lead_bar', 'silver_bar', 'tungsten_bar', 'gold_bar', 'platinum_bar', 'cobalt_bar', 'palladium_bar', 'mythril_bar', 'orichalcum_bar', 'adamantite_bar', 'titanium_bar']
barIds.forEach(id => patchItem(id, s => {
  if (s.includes('匣子')) return s
  return s.replace(/(obtain:"[^"]*)"/, '$1；也可从各类宝箱/匣子中开出"')
}))
// 矿石：补史莱姆/匣子来源
const oreIds = ['copper_ore', 'tin_ore', 'iron_ore', 'lead_ore', 'silver_ore', 'tungsten_ore', 'gold_ore', 'platinum_ore', 'cobalt_ore', 'palladium_ore', 'mythril_ore', 'orichalcum_ore', 'adamantite_ore', 'titanium_ore']
oreIds.forEach(id => patchItem(id, s => {
  if (s.includes('史莱姆')) return s
  return s.replace(/(obtain:"[^"]*)"/, '$1；部分史莱姆与匣子也会掉落"')
}))

// ============ Part C: 用途补全（材料用途未提及的合成去向） ============
let useAdded = 0
const nonCraft = items.filter(x => !(x.obtain || '').includes('合成：') && !(x.obtain || '').includes('砧：'))
nonCraft.forEach(it => {
  const recs = zd.byIng && zd.byIng[it.en]
  if (!recs || !recs.length) return
  const use = it.use || ''
  // 已提到的结果不再列
  const zhResults = recs.map(zhOf).filter(Boolean)
  if (!zhResults.length) return
  const mentioned = zhResults.filter(z => use.includes(z)).length
  if (mentioned >= recs.length) return
  const unmentioned = recs.filter((en, i) => !use.includes(zhResults[i] || '\u0000'))
  if (!unmentioned.length) return
  const names = unmentioned.map(zhOf).filter(Boolean)
  if (!names.length) return
  const append = (use ? '此外' : '') + '可作材料合成：' + names.slice(0, 3).join('、') + (unmentioned.length > 3 ? ' 等 ' + unmentioned.length + ' 种物品' : '')
  const newUse = (use ? use.replace(/。$/, '') + '；' : '') + append + '。'
  patchItem(it.id, s => setUse(s, newUse))
  useAdded++
})

fs.writeFileSync(path.join(__dirname, '../data/items.js'), text)
console.log('patch 调用成功:', patchCount, '| 用途补全:', useAdded)
