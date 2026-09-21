// 药水宝箱来源补全 + 岩浆石地狱掉落（官方 drops.json / wiki 核实）
const fs = require('fs')

// ① 精品药水 obtain 补宝箱来源（仅对当前未提及箱/匣的追加）
let s = fs.readFileSync('data/items.js', 'utf8')
const CHESTS = {
  lesser_healing: '金箱 50%、木匣/珍珠木匣 16.67%',
  regeneration: '金箱 9.52%',
  battle_potion: '暗影箱 8.33%',
  invisibility: '金箱 5.56%、暗影箱 9.38%',
  magic_power: '暗影箱 9.38%',
  mana_regen: '暗影箱 9.38%',
  archery: '金箱 9.52%',
  lifeforce: '暗影箱 8.33%',
  titan: '金箱 5.56%',
  restoration: '暗影箱 50%',
  recall: '金箱 66.67%、暗影箱 16.67%',
  featherfall_potion: '金箱 11.11%、暗影箱 9.38%',
  thorns_potion: '金箱 5.56%、暗影箱 8.33%',
}
let n = 0
for (const [id, chest] of Object.entries(CHESTS)) {
  const re = new RegExp('(id:"' + id + '"[^}]*?)obtain:"([^"]*)"')
  const m = s.match(re)
  if (!m) { console.log('MISS', id); continue }
  if (/箱|匣/.test(m[2])) { continue }
  s = s.replace(re, '$1obtain:"$2；另可从 ' + chest + ' 开启"')
  n++
}
// 重力药水：把笼统"各类匣子常备"升级为带主要箱源
const gOld = '合成；各类匣子常备"'
if (s.includes(gOld)) {
  s = s.replace(gOld, '合成；金箱 11.11%、暗影箱 8.33% 及各类匣子常备"')
  n++
}
fs.writeFileSync('data/items.js', s)
console.log('药水补宝箱来源:', n, '条')

// ② 全量岩浆石：补地狱敌怪掉落主来源
let v = fs.readFileSync('pkg-cat-2/data/data-v2.js', 'utf8')
const anchor = '"f":"MagmaStone"'
const i = v.indexOf(anchor)
if (i < 0) { console.log('MagmaStone 未找到'); process.exit(1) }
const oldOb = '"ob":"合成：熔岩护身符 @ 微光"'
if (!v.slice(i, i + 1200).includes(oldOb)) { console.log('岩浆石 ob 锚未命中'); process.exit(1) }
v = v.slice(0, i) + v.slice(i, i + 1200).replace(oldOb, '"ob":"地狱蝙蝠 / 熔岩蝙蝠 0.67~2% 掉落；熔岩护身符可在微光中转化获得"') + v.slice(i + 1200)
fs.writeFileSync('pkg-cat-2/data/data-v2.js', v)
console.log('全量岩浆石 OK')
