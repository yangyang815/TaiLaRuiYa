// v2：为全部 Boss 添加专家/大师血量（安全版——按条目切片 + 精确 token 匹配）
const fs = require('fs')
let src = fs.readFileSync(__dirname + '/catalog-stage/npcinfo-zh.txt', 'utf8')
src = src.replace(/^--.*$/gm, '').replace(/\]\s*=\s*/g, ']: ').replace(/\bnil\b/g, 'null').replace(/\breturn\s*\{/, 'module.exports = {')
const M = { exports: {} }
new Function('module', 'exports', src)(M, M.exports)
const byName = {}
Object.values(M.exports).forEach(n => { if (n && n.internalName && byName[n.internalName] === undefined) byName[n.internalName] = n })

const boss = require('../data/bosses.js')
const SPECIAL = {
  brain_of_cthulhu: { hp_e: '本体 2125 + 爬行者×20 3400', hp_m: '本体 2709 + 爬行者×20 4340' },
  eater_of_worlds: { hpFix: ['hp:"7486（67 节）"', 'hp:"10050（67 节）"'], hp_e: '15120（72 节）', hp_m: '19296（72 节）' },
  twins: { hpFix: ['hp:"24000（2×12000）"', 'hp:"43000（20000+23000）"'], hp_e: '64500（30000+34500）', hp_m: '82238（38250+43988）' },
  golem: { hp_e: '头 37500 / 身体 22500（+拳 15000×2）', hp_m: '头 47812 / 身体 28687（+拳 19125×2）' },
  martian_saucer: { hpFix: ['hp:"15000（+四炮塔）"', 'hp:"核心 10000 + 四炮塔 17000"'], hp_e: '核心 17000 + 四炮塔 28900', hp_m: '核心 25500 + 四炮塔 43350' }
}
const dest = byName.TheDestroyer, prime = byName.SkeletronPrime
if (dest && prime) {
  SPECIAL.mechdusa = {
    hp_e: '三王合计 ' + (dest.lifeMax_e + 64500 + prime.lifeMax_e),
    hp_m: '三王合计 ' + (dest.lifeMax_m + 82238 + prime.lifeMax_m)
  }
}

let text = fs.readFileSync(__dirname + '/../data/bosses.js', 'utf8')
// 收集每个条目的替换（entry 切片内操作）
const jobs = []
boss.forEach(b => {
  const start = text.indexOf('id:"' + b.id + '"')
  if (start < 0) { console.log('[未找到条目]', b.id); return }
  // 条目窗口：id 起始到 "spawn" 字段之前都足够涵盖 hp
  const winEnd = text.indexOf('spawn:', start)
  const win = text.slice(start, winEnd)
  let nwin = win
  const sp = SPECIAL[b.id]
  let hpE = null, hpM = null
  if (sp) { hpE = sp.hp_e; hpM = sp.hp_m }
  else {
    const row = byName[(b.en || '').replace(/[^A-Za-z0-9]/g, '')]
    if (row && row.lifeMax_e != null) { hpE = row.lifeMax_e; hpM = row.lifeMax_m }
  }
  if (hpE == null) { console.log('[无专家值]', b.id); return }
  if (sp && sp.hpFix) {
    if (!nwin.includes(sp.hpFix[0])) { console.log('[hp修正未命中]', b.id); return }
    nwin = nwin.replace(sp.hpFix[0], sp.hpFix[1])
  }
  // 在 hp:TOKEN 后插入（TOKEN = 带引号字符串 或 数字含 e 计数法）
  const re = /hp:("[^"]*"|\d+(?:\.\d+)?(?:e\d+)?)/
  const mm = nwin.match(re)
  if (!mm) { console.log('[窗口内未定位hp]', b.id); return }
  const q = typeof hpE === 'string' ? '"' : ''
  nwin = nwin.replace(re, 'hp:' + mm[1] + ',hp_e:' + q + hpE + q + ',hp_m:' + q + hpM + q)
  jobs.push({ start, win, nwin })
})
// 逐个应用（每次都在当前 text 上做子串替换，窗口内容唯一）
jobs.forEach(j => {
  if (!text.includes(j.win)) { console.log('[窗口不再匹配，跳过]', j.win.slice(0, 40)); return }
  text = text.replace(j.win, j.nwin)
})
fs.writeFileSync(__dirname + '/../data/bosses.js', text)
console.log('完成:', jobs.length, '/', boss.length)
