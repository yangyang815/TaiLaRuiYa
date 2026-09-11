// 敌怪数值批量修正：按条目切片，仅替换首个数值型 hp/dmg/def
const fs = require('fs')
let src = fs.readFileSync(__dirname + '/catalog-stage/npcinfo-zh.txt', 'utf8')
src = src.replace(/^--.*$/gm, '').replace(/\]\s*=\s*/g, ']: ').replace(/\bnil\b/g, 'null').replace(/\breturn\s*\{/, 'module.exports = {')
const M = { exports: {} }
new Function('module', 'exports', src)(M, M.exports)
const byName = {}
Object.values(M.exports).forEach(n => { if (n && n.internalName && byName[n.internalName] === undefined) byName[n.internalName] = n })

let text = fs.readFileSync(__dirname + '/../data/monsters.js', 'utf8')
const mon = require('../data/monsters.js')
let applied = 0, miss = 0
const edits = [] // 先计算全部修改，再从后往前应用（避免索引位移）
mon.forEach(m => {
  const key = (m.en || '').replace(/[^A-Za-z0-9]/g, '')
  const row = byName[key]
  if (!row) return
  const start = text.indexOf('id:"' + m.id + '"')
  if (start < 0) return
  const eStart = text.lastIndexOf('{', start)
  const eEnd = text.indexOf('},{', start)
  const end = eEnd < 0 ? text.length : eEnd + 1
  const slice = text.slice(eStart, end)
  let ns = slice, changed = false
  // 仅替换字段区（第一处数值型）
  const rep = (field, val) => {
    if (val == null) return
    const re = new RegExp(field + ':(\\d+(?:\\.\\d+)?(?:e\\d+)?)')
    const mm = ns.match(re)
    if (!mm) return
    if (Number(mm[1]) === val) return
    ns = ns.replace(re, field + ':' + val)
    changed = true
  }
  rep('hp', row.lifeMax)
  rep('dmg', row.damage)
  rep('def', row.defense)
  if (changed) edits.push({ eStart, end, ns })
})
// 从后往前应用
edits.sort((a, b) => b.eStart - a.eStart).forEach(e => {
  text = text.slice(0, e.eStart) + e.ns + text.slice(e.end)
  applied++
})
fs.writeFileSync(__dirname + '/../data/monsters.js', text)
console.log('敌怪条目修正:', applied, '| 目标异常:', edits.length)
