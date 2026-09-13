// DPS 武器库重建：名称→官方译名，数值→官方 Iteminfo
const fs = require('fs')
const path = require('path')
const GT = JSON.parse(fs.readFileSync(path.join(__dirname, 'catalog-stage/gametext-zh.json'), 'utf8')).ItemName || {}
const blobSrc = fs.readFileSync(path.join(__dirname, 'catalog-stage/iteminfo-zh.txt'), 'utf8')
const II = {}
Object.values(JSON.parse(blobSrc.slice(blobSrc.indexOf('[=====') + 7, blobSrc.indexOf(']=====')))).forEach(x => { if (x.internalName && II[x.internalName] === undefined) II[x.internalName] = x })
const raw = require('./catalog-stage/raw.json')
const en2in = {}
raw.forEach(r => { if (r.en && r.internal && r.internal !== 'None' && en2in[r.en] === undefined) en2in[r.en] = r.internal })

// GT 反查：zh → internal（首个）
const rev = {}
Object.keys(GT).forEach(k => { const z = GT[k]; if (z && !rev[z]) rev[z] = k })

let text = fs.readFileSync('../data/dps.js', 'utf8')
let fixed = 0, unfixed = []
const d = require('../data/dps.js')
d.WEAPONS.forEach(w => {
  // 找 internal：先 GT 反查当前名，再按 en 线索
  let iv = rev[w.name]
  if (!iv) {
    // 尝试旧译名/别名反查表
    const alias = {
      '光之驱逐': 'LightsBane', '蜂王剑': 'BeeKeeper', '草薙剑': 'BladeofGrass', '永夜之刃': 'NightsEdge',
      '播种者': 'Seedler', '键刃': 'Keybrand', '真永夜之刃': 'TrueNightsEdge', '圣骑士之锤': 'PaladinHammer',
      '流波刃': 'InfluxWaver', '喵刃': 'Meowmere', '狱翼弓': 'HellwingBow', '糖果玉米步枪': 'CandyCornRifle',
      '木桩发射器': 'StakeLauncher', '巨型鲨鱼枪': 'Megashark', '外星泡泡枪': 'Xenopopper', '恶魔镰刀': 'DemonScythe',
      '诅咒之焰法杖': 'CursedFlames', '磁石球': 'MagnetSphere', '夜辉': 'Nightglow', '最后棱镜': 'LastPrism',
      '火山': 'FieryGreatsword'
    }
    iv = alias[w.name] || null
  }
  if (!iv || !II[iv]) { unfixed.push(w.name); return }
  const o = II[iv]
  const offName = GT[iv] || w.name
  // 生成该条目的新对象（dmg/use/crit 官方化）
  const start = text.indexOf('{"id":"' + w.id + '"')
  if (start < 0) { console.log('锚点MISS', w.id); return }
  const end = text.indexOf('}', start) + 1
  const seg = text.slice(start, end)
  let obj = JSON.parse(seg)
  obj.name = offName
  if (o.damage != null) obj.dmg = o.damage
  if (o.useTime != null) obj.use = o.useTime
  if (o.crit != null) obj.crit = o.crit
  const ns = JSON.stringify(obj)
  if (ns !== seg) { text = text.slice(0, start) + ns + text.slice(end); fixed++ }
})
fs.writeFileSync('../data/dps.js', text)
console.log('武器修正:', fixed, '/', d.WEAPONS.length, '| 无法解析:', unfixed.length)
unfixed.forEach(x => console.log('  未解析:', x))
