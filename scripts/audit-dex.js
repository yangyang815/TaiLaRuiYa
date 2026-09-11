// 安全版修正：按 id 切片定位条目，只在条目内部替换
const fs = require('fs')
const items = require('../data/items.js')
const raw = require('./catalog-stage/raw.json')

const s0 = fs.readFileSync(__dirname + '/catalog-stage/iteminfo-zh.txt', 'utf8')
const II = {}
Object.values(JSON.parse(s0.slice(s0.indexOf('[=====') + 7, s0.indexOf(']=====')))).forEach(x => {
  if (x.internalName) II[x.internalName] = x
})
const en2in = {}
raw.forEach(r => { const iv = r.internal && r.internal !== 'None' ? r.internal : ''; if (r.en && iv && !en2in[r.en]) en2in[r.en] = iv })

function num (t) { const m = String(t).match(/(\d+(\.\d+)?)/); return m ? Number(m[1]) : null }

let text = fs.readFileSync(__dirname + '/../data/items.js', 'utf8')
let fixed = 0, manual = [], skipped = []

// 目标清单（含星尘龙文本修正）
items.forEach(it => {
  if (!it.en) return
  const row = en2in[it.en] ? II[en2in[it.en]] : null
  const dmgStat = (it.stats || []).find(x => x[0] === '伤害')
  if (it.id === 'stardust_dragon') {
    manual.push({ id: it.id, pairs: [['["伤害","40（可无限叠加）"]', '["伤害","40"],["特性","仅此一条龙 · 召唤栏越多龙身越长"]']] })
    return
  }
  if (!row || row.damage == null || !dmgStat) return
  const claimed = dmgStat[1]
  const v = num(claimed)
  if (v == null || v === row.damage) return
  const composite = /[×/+]|\d+\s*(落星|耗星|箭)/.test(String(claimed))
  const pure = /^-?\d+(\.\d+)?(（[^×/+\d）]*）)?$/.test(String(claimed).trim())
  if (composite) {
    // 复合描述：给出官方基准的改写
    const rewrite = {
      'Star Wrath': '["伤害","170"],["特效","三道落星跟随打击"]',
      'Chlorophyte Shotbow': '["伤害","34（×2~4 箭）"]',
      'Grenade Launcher': '["伤害","60（含爆炸）"]',
      'Unholy Trident': '["伤害","150（三叉齐发）"]'
    }[it.en]
    if (rewrite) manual.push({ id: it.id, pairs: [['["伤害","' + claimed + '"]', rewrite]] })
    else manual.push({ id: it.id, pairs: [], note: it.name + ' 复合无改写规则: ' + claimed })
    return
  }
  if (!pure) { skipped.push(it.name + ':' + claimed); return }
  const replaced = String(claimed).replace(/-?\d+(\.\d+)?/, String(row.damage))
  manual.push({ id: it.id, pairs: [['["伤害","' + claimed + '"]', '["伤害","' + replaced + '"]']], note: it.name + ' ' + claimed + '→' + row.damage })
})

// 执行切片替换
let applied = 0, fail = 0
manual.forEach(m => {
  const key = 'id:"' + m.id + '"'
  const start = text.indexOf(key)
  if (start < 0) { console.log('  [未找到条目]', m.id); fail++; return }
  const entryStart = text.lastIndexOf('{', start)
  const entryEnd = text.indexOf('},{', start)
  const slice = text.slice(entryStart, entryEnd < 0 ? undefined : entryEnd + 1)
  let ns = slice
  let okAll = true
  m.pairs.forEach(([o, n]) => {
    if (!ns.includes(o)) { console.log('  [条目内未命中]', m.id, o); okAll = false; return }
    ns = ns.split(o).join(n)
  })
  if (!okAll) { fail++; return }
  text = text.slice(0, entryStart) + ns + text.slice(entryEnd < 0 ? undefined : entryEnd + 1)
  applied++
})

fs.writeFileSync(__dirname + '/../data/items.js', text)
console.log('条目修正:', applied, '/', manual.length, '| 失败:', fail)
if (skipped.length) console.log('非纯数值跳过:', skipped.join(' | '))
