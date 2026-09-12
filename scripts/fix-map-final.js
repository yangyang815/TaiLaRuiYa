// 补全无 use 字段的材料 + 完成矿石/锭的 obtain 补充
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

let text = fs.readFileSync(path.join(__dirname, '../data/items.js'), 'utf8')
let n = 0
function patch (id, fn) {
  const start = text.indexOf('id:"' + id + '"')
  if (start < 0) { console.log('MISS', id); return }
  const next = text.indexOf('id:"', start + 10)
  const end = next < 0 ? text.length : next
  const slice = text.slice(start, end)
  const ns = fn(slice)
  if (ns !== slice) { text = text.slice(0, start) + ns + text.slice(end); n++ } else console.log('NOCHANGE', id)
}

// A) 为无 use 字段的材料添加 use
const noUse = items.filter(x => x.use === undefined || x.use === '')
noUse.forEach(it => {
  const recs = zd.byIng && zd.byIng[it.en]
  if (!recs || !recs.length) return
  const names = recs.map(zhOf).filter(Boolean)
  if (!names.length) return
  const use = '可作材料合成：' + names.slice(0, 3).join('、') + (recs.length > 3 ? ' 等 ' + recs.length + ' 种物品' : '') + '。'
  patch(it.id, s => {
    if (s.includes('use:')) return s
    // 在 obtain 字段后插入 use
    const m = s.match(/(obtain:"(?:[^"\\]|\\.)*")/)
    if (!m) return s
    return s.replace(m[1], m[1] + ',use:' + JSON.stringify(use))
  })
})

// B) 矿石/锭 obtain 补充（desc 含"史莱姆"误跳过的）
const oreBarIds = ['copper_bar', 'tin_bar', 'iron_bar', 'lead_bar', 'silver_bar', 'tungsten_bar', 'gold_bar', 'platinum_bar', 'cobalt_bar', 'palladium_bar', 'mythril_bar', 'orichalcum_bar', 'adamantite_bar', 'titanium_bar', 'copper_ore', 'tin_ore', 'iron_ore', 'lead_ore', 'silver_ore', 'tungsten_ore', 'gold_ore', 'platinum_ore', 'cobalt_ore', 'palladium_ore', 'mythril_ore', 'orichalcum_ore', 'adamantite_ore', 'titanium_ore']
oreBarIds.forEach(id => {
  const it = items.find(x => x.id === id)
  if (!it) return
  const isBar = id.endsWith('_bar')
  const add = isBar ? '；也可从各类宝箱/匣子中开出' : '；部分史莱姆与匣子也会掉落'
  if ((it.obtain || '').includes('匣子') || (it.obtain || '').includes('史莱姆')) return
  patch(id, s => s.replace(/(obtain:"(?:[^"\\]|\\.)*)"/, '$1' + add + '"'))
})

// C) discount_card 补贪婪戒指
patch('discount_card', s => {
  if (s.includes('贪婪戒指')) return s
  return s.replace(/use:"((?:[^"\\]|\\.)*)"/, (m, p1) => 'use:' + JSON.stringify(p1.replace(/。$/, '') + '；还可与幸运币合成贪婪戒指。'))
})

fs.writeFileSync(path.join(__dirname, '../data/items.js'), text)
console.log('本轮修正:', n)
