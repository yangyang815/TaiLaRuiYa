// DPS 武器库重建 v2：条目内字段替换
const fs = require('fs')
const path = require('path')
const GT = JSON.parse(fs.readFileSync(path.join(__dirname, 'catalog-stage/gametext-zh.json'), 'utf8')).ItemName || {}
const blobSrc = fs.readFileSync(path.join(__dirname, 'catalog-stage/iteminfo-zh.txt'), 'utf8')
const II = {}
Object.values(JSON.parse(blobSrc.slice(blobSrc.indexOf('[=====') + 7, blobSrc.indexOf(']=====')))).forEach(x => { if (x.internalName && II[x.internalName] === undefined) II[x.internalName] = x })

let text = fs.readFileSync('data/dps.js', 'utf8')
let fixed = 0
const unfixed = []
const alias = {
  '光之驱逐': 'LightsBane', '蜂王剑': 'BeeKeeper', '草薙剑': 'BladeofGrass', '永夜之刃': 'NightsEdge',
  '播种者': 'Seedler', '键刃': 'Keybrand', '真永夜之刃': 'TrueNightsEdge', '圣骑士之锤': 'PaladinHammer',
  '流波刃': 'InfluxWaver', '喵刃': 'Meowmere', '狱翼弓': 'HellwingBow', '糖果玉米步枪': 'CandyCornRifle',
  '木桩发射器': 'StakeLauncher', '巨型鲨鱼枪': 'Megashark', '外星泡泡枪': 'Xenopopper', '恶魔镰刀': 'DemonScythe',
  '诅咒之焰法杖': 'CursedFlames', '磁石球': 'MagnetSphere', '夜辉': 'Nightglow', '最后棱镜': 'LastPrism',
  '火山': 'FieryGreatsword'
}
const d = require('../data/dps.js')
d.WEAPONS.forEach(w => {
  const start = text.indexOf('id:"' + w.id + '"')
  if (start < 0) { unfixed.push(w.name + '(锚点)'); return }
  const next = text.indexOf('{id:"', start + 10)
  const end = next < 0 ? text.length : next
  let slice = text.slice(start, end)
  let iv = (GTrev => GTrev)(0) // noop
  // GT 反查当前名
  let revHit = null
  for (const k of Object.keys(GT)) { if (GT[k] === w.name) { revHit = k; break } }
  let internal = revHit || alias[w.name] || null
  const o = internal ? II[internal] : null
  if (!o) { unfixed.push(w.name + '(数值)'); return }
  const offName = GT[internal] || w.name
  // 名称
  slice = slice.replace(/name:"(?:[^"\\]|\\.)*"/, 'name:' + JSON.stringify(offName))
  // 数值
  if (o.damage != null) slice = slice.replace(/dmg:\s*\d+(?:\.\d+)?/, 'dmg:' + o.damage)
  if (o.useTime != null) slice = slice.replace(/\buse:\s*\d+(?:\.\d+)?/, 'use:' + o.useTime)
  if (o.crit != null) slice = slice.replace(/crit:\s*\d+(?:\.\d+)?/, 'crit:' + o.crit)
  text = text.slice(0, start) + slice + text.slice(end)
  fixed++
})
fs.writeFileSync('data/dps.js', text)
console.log('武器修正:', fixed, '/', d.WEAPONS.length)
unfixed.forEach(x => console.log('  未解析:', x))
