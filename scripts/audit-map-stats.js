// 非合成物品全字段审计：stats vs 官方 Iteminfo（1.4.5.7）
const fs = require('fs')
const path = require('path')

const items = require('../data/items.js')
const raw = require('./catalog-stage/raw.json')

// 解析 Iteminfo blob
const blobSrc = fs.readFileSync(path.join(__dirname, 'catalog-stage/iteminfo-zh.txt'), 'utf8')
const II = {}
Object.values(JSON.parse(blobSrc.slice(blobSrc.indexOf('[=====') + 7, blobSrc.indexOf(']=====')))).forEach(x => { if (x.internalName && II[x.internalName] === undefined) II[x.internalName] = x })

const en2in = {}
raw.forEach(r => { if (r.en && r.internal && r.internal !== 'None' && en2in[r.en] === undefined) en2in[r.en] = r.internal })

const num = t => { const m = String(t == null ? '' : t).replace(/,/g, '').match(/-?\d+(\.\d+)?/); return m ? Number(m[0]) : null }
const cjk = s => /[\u4e00-\u9fa5]/.test(s || '')
const find = (st, label) => { const e = (st || []).find(x => x[0] === label); return e ? e[1] : null }

// 非合成物品
const nonCraft = items.filter(x => !(x.obtain || '').includes('合成：') && !(x.obtain || '').includes('砧：') && !(x.obtain || '').includes('水晶球') && !(x.obtain || '').includes('熔炉'))
const res = { dmg: [], def: [], pick: [], axe: [], hammer: [], bait: [], kb: [], crit: [], speed: [], heal: [], noRow: [] }

nonCraft.forEach(it => {
  const iv = en2in[it.en]
  const row = iv != null ? II[iv] : null
  if (!row) { res.noRow.push(it.id + '/' + it.en); return }
  const st = it.stats || []
  const d = find(st, '伤害')
  if (d != null && row.damage != null) { const c = num(d); if (c != null && c !== row.damage) res.dmg.push(it.id + ' ' + it.name + ': 写' + c + ' 官方' + row.damage) }
  const df = find(st, '防御')
  if (df != null && row.defense != null) { const c = num(df); if (c != null && c !== row.defense) res.def.push(it.id + ' ' + it.name + ': 写' + c + ' 官方' + row.defense) }
  const p = find(st, '镐力')
  if (p != null && row.pick != null) { const c = num(p); if (c != null && c !== row.pick) res.pick.push(it.id + ' ' + it.name + ': 写' + c + ' 官方' + row.pick) }
  const a = find(st, '斧力')
  if (a != null && row.axe != null) { const c = num(a); if (c != null && c !== row.axe * 5) res.axe.push(it.id + ' ' + it.name + ': 写' + c + ' 官方' + row.axe * 5) }
  const h = find(st, '锤力')
  if (h != null && row.hammer != null) { const c = num(h); if (c != null && c !== row.hammer) res.hammer.push(it.id + ' ' + it.name + ': 写' + c + ' 官方' + row.hammer) }
  const b = find(st, '鱼饵力')
  if (b != null && row.bait != null) { const c = num(b); if (c != null && c !== row.bait) res.bait.push(it.id + ' ' + it.name + ': 写' + c + ' 官方' + row.bait) }
  const k = find(st, '击退')
  if (k != null && row.knockback != null) { const c = num(k); if (c != null && Math.abs(c - row.knockback) > 0.01) res.kb.push(it.id + ' ' + it.name + ': 写' + c + ' 官方' + row.knockback) }
  const cr = find(st, '暴击')
  if (cr != null && row.crit != null) { const c = num(cr); if (c != null && c !== row.crit) res.crit.push(it.id + ' ' + it.name + ': 写' + c + '% 官方' + row.crit + '%') }
  // 药水回复量（hheal 生命 / mheal 魔力）
  const full = JSON.stringify({ st: st, desc: it.desc, use: it.use })
  if (row.hheal != null && row.hheal > 0) {
    const m = full.match(/恢复(\d+)点生命|回复(\d+)点生命|生命值\+?(\d+)/)
    const claimed = m ? Number(m[1] || m[2] || m[3]) : null
    // hheal 是半瓶口径的 1.5 倍存储？官方 hheal 直接是恢复值
    if (claimed != null && claimed !== row.hheal) res.heal.push(it.id + ' ' + it.name + ': 写恢复' + claimed + '生命 官方' + row.hheal)
  }
})

let total = 0
Object.keys(res).forEach(k => {
  if (k === 'noRow') return
  if (res[k].length) { console.log('== ' + k + ' (' + res[k].length + '):'); res[k].forEach(x => console.log('  ' + x)); total += res[k].length }
})
console.log('---')
console.log('非合成物品:', nonCraft.length, '| 无官方行:', res.noRow.length, '| 数值不一致:', total)
