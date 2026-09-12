// 为 21 件无用途物品生成基于官方 tooltip 的用途描述
const fs = require('fs')
const path = require('path')
const items = require('../data/items.js')

const USE = {
  'Nimbus Rod': '召唤雨云持续降下大雨攻击，肉前末期/肉后早期魔法武器。',
  'Frost Staff': '发射寒霜流攻击，有几率使敌人冻结，肉后雪原生物群系魔法武器。',
  'Flower of Frost': '发射寒霜球攻击，肉后地牢魔法武器。',
  'Unholy Trident': '召唤恶魔三叉戟从天刺击，肉后腐化之地魔法武器。',
  'Inferno Fork': '发射火球，撞击后爆炸成熊熊狱火灼烧，肉后地牢魔法武器。',
  'Venom Staff': '发射可刺穿多个敌人的毒液尖牙并施加剧毒减益，世纪之花后魔法武器。',
  'Cursed Flames': '召唤邪恶火球并施加诅咒地狱减益（持续掉血），腐化世界肉后魔法武器。',
  'Sky Fracture': '挥剑同时发射魔法光刃，肉后神圣之地魔法武器。',
  'Nebula Arcanum': '召唤大量星体能量追杀敌人，清群利器，月亮事件魔法武器。',
  'Arcane Flower': '魔力消耗降低 8%，魔法伤害和暴击各提高 5%，魔力不足时自动使用魔力药水，并降低敌人仇恨。',
  'Deadly Sphere Staff': '召唤致命球仆从撞击敌人，万圣节事件召唤武器。',
  'Desert Tiger Staff': '召唤沙漠白虎仆从，召唤栏越多虎身越长，1.4 起由沙漠生物宝箱获得。',
  'Staff of the Frost Hydra': '召唤哨兵寒霜九头蛇朝敌人喷吐冰雪，撒旦军队终极哨兵武器。',
  'Morning Star': '召唤标记伤害 +8、标记暴击 +10% 的鞭子，世纪之花后地牢获得。',
  'Dark Harvest': '南瓜月鞭子，鞭击提升召唤物攻速并触发黑暗能量爆发，南瓜王掉落。',
  'Lunar Portal Staff': '召唤月亮传送门哨兵，持续向敌人发射激光，月亮事件哨兵武器。',
  'Eventide': '一次射出四支箭的月亮事件长弓，月主后远程武器。',
  'Phantasm': '月亮事件远程毕业弓之一，66% 概率不消耗弹药，蓄力后射速极快。',
  'Onyx Blaster': '发射黑曜石爆破弹（命中后爆发弹片），腐化世界肉后远程武器。',
  'Falcon Blade': '高攻速宽刃剑（快速攻击加成），前中期近战过渡，地牢与各类宝箱可获得。',
  'Ironskin Potion': '提升 8 点防御的战斗药水，打 Boss 与事件前常备。'
}

let text = fs.readFileSync(path.join(__dirname, '../data/items.js'), 'utf8')
let n = 0
const noUse = items.filter(x => !x.use)
noUse.forEach(it => {
  const use = USE[it.en]
  if (!use) { console.log('无描述模板:', it.id, it.en); return }
  const start = text.indexOf('id:"' + it.id + '"')
  if (start < 0) { console.log('MISS', it.id); return }
  const next = text.indexOf('id:"', start + 10)
  const end = next < 0 ? text.length : next
  const slice = text.slice(start, end)
  if (slice.includes('use:')) return
  const m = slice.match(/(obtain:"(?:[^"\\]|\\.)*")/)
  if (!m) { console.log('无obtain锚点:', it.id); return }
  const ns = slice.replace(m[1], m[1] + ',use:' + JSON.stringify(use))
  text = text.slice(0, start) + ns + text.slice(end)
  n++
})
fs.writeFileSync(path.join(__dirname, '../data/items.js'), text)
console.log('用途补全:', n, '/', noUse.length)
