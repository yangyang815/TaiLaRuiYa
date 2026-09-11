// 补齐剩余 10 个 Boss 的专家/大师血量，并修正错误经典值（v2 正确写回）
const fs = require('fs')
let text = fs.readFileSync(__dirname + '/../data/bosses.js', 'utf8')
const PATCH = {
  skeletron: { add: { hp_e: '8800', hp_m: '11220' } },
  queen_slime: { hpFix: ['hp:17e3', 'hp:18e3'], add: { hp_e: 28800, hp_m: 36720 } },
  empress_of_light: { add: { hp_e: 98000, hp_m: 124950 } },
  lunatic_cultist: { add: { hp_e: 48000, hp_m: 61200 } },
  moon_lord: { add: { hp_e: '头 67500 / 双手 37500×2 / 心脏 75000', hp_m: '头 86062 / 双手 47812×2 / 心脏 95625' } },
  flying_dutchman: { hpFix: ['hp:6e3', 'hp:"船体 50 + 四炮台 8000"'], add: { hp_e: '船体 100 + 四炮台 13600', hp_m: '船体 150 + 四炮台 20400' } },
  dreadnautilus: { hpFix: ['hp:3500', 'hp:7000'], add: { hp_e: 14000, hp_m: 21000 } },
  dark_mage: { hpFix: ['hp:6e3', 'hp:"T1 800 / T3 4000"'], add: { hp_e: 'T1 1600 / T3 8000', hp_m: 'T1 2040 / T3 10200' } },
  ogre: { hpFix: ['hp:8e3', 'hp:"T2 5000 / T3 13000"'], add: { hp_e: 'T2 10000 / T3 26000', hp_m: 'T2 12750 / T3 33150' } },
  betsy: { hpFix: ['hp:32e3', 'hp:50e3'], add: { hp_e: 75000, hp_m: 95625 } }
}
let applied = 0
Object.keys(PATCH).forEach(id => {
  const start = text.indexOf('id:"' + id + '"')
  if (start < 0) { console.log('[未找到]', id); return }
  const winEnd = text.indexOf('spawn:', start)
  const oldWin = text.slice(start, winEnd)
  let win = oldWin
  const p = PATCH[id]
  if (p.hpFix) {
    if (!win.includes(p.hpFix[0])) { console.log('[hp未命中]', id, p.hpFix[0]); return }
    win = win.replace(p.hpFix[0], p.hpFix[1])
  }
  const q = typeof p.add.hp_e === 'string' ? '"' : ''
  const q2 = typeof p.add.hp_m === 'string' ? '"' : ''
  const re = /hp:("[^"]*"|\d+(?:\.\d+)?(?:e\d+)?)/
  const mm = win.match(re)
  if (!mm) { console.log('[未定位hp]', id); return }
  win = win.replace(re, 'hp:' + mm[1] + ',hp_e:' + q + p.add.hp_e + q + ',hp_m:' + q2 + p.add.hp_m + q2)
  text = text.replace(oldWin, win)
  applied++
})
fs.writeFileSync(__dirname + '/../data/bosses.js', text)
console.log('applied', applied)
