// 地图获取类 obtain 定向修正（按 en 定位条目）
const fs = require('fs')
const items = require('../data/items.js')
let text = fs.readFileSync(__dirname + '/../data/items.js', 'utf8')

const OVERRIDE = {
  'The Horseman\'s Blade': '南瓜月·南瓜王 2.5–12.5% 掉落',
  'Phantom Phoenix': '撒旦军队·食人魔 10%（大师 5%）掉落',
  'Xenopopper': '火星飞碟 16.66% 掉落',
  'Rocket Launcher': '骷髅突击手 5.56% 掉落，或 机器侠出售（世纪之花后）',
  'Razorpine': '霜月·常绿尖叫怪 3.46–10.37% 掉落',
  'Bone Pickaxe': '地下矿工 5% 掉落（洞穴层）',
  'Electrosphere Launcher': '火星飞碟 16.66% 掉落',
  'Dark Harvest': '南瓜月·南瓜王 2.5–12.5% 掉落',
  'Eventide': '光之女皇 25% 掉落',
  'Scourge of the Corruptor': '腐化之地生物宝箱开启（世纪之花后）',
  'Desert Tiger Staff': '沙漠生物宝箱开启（世纪之花后）',
  'Staff of the Frost Hydra': '冰雪生物宝箱开启（世纪之花后）',
  'Drippler Crippler': '血月·血鳗鱼 12.5% 掉落',
  'Blood Rain Bow': '血月钓鱼：游荡眼球怪鱼 / 僵尸人鱼 12.5% 掉落',
  'Frost Staff': '冰雪精 / 冰雪人鱼 2% 掉落（困难模式雪原）',
  'Flower of Frost': '冰雪宝箱怪 23.75% 掉落',
  'Bat Hook': '万圣节礼物袋 0.66% 开出',
  'Anti-Gravity Hook': '火星暴乱事件敌怪 0.13% 掉落',
  'Rod of Discord': '神圣之地地下 混沌精 0.2% 掉落',
  'Black Lens': '恶魔眼 / 游荡眼球怪 1% 掉落',
  'Inferno Fork': '地牢（世纪之花后）驱魔僧 5% 掉落',
  'Pink Gel': '粉史莱姆 100% 掉落',
  'Ice Blade': '冰雪箱 / 针叶木匣 14.29% 开启，或冰雪宝箱怪 11.88%',
  'Ice Boomerang': '冰雪箱 / 针叶木匣 14.29% 开启，或冰雪宝箱怪 11.88%',
  'Blizzard in a Bottle': '冰雪箱 / 针叶木匣 14.29% 开启，或冰雪宝箱怪 11.88%',
  'Muramasa': '地牢金箱 / 金锁箱 14.29% 开启',
  'Cobalt Shield': '地牢金箱 / 金锁箱 14.29% 开启',
  'Magic Missile': '地牢金箱 / 金锁箱 14.29% 开启',
  'Shoe Spikes': '地表/地下金箱 16.67% 或宝箱怪 16.67%',
  'Fast Clock': '木乃伊 / 妖精 / 幻灵 1% 掉落',
  'Adhesive Bandage': '琵琶鱼 / 锈甲装甲骷髅 / 狼人 1% 掉落',
  'Bezoar': '黄蜂 / 苔藓黄蜂 / 毒泥 1% 掉落',
  'Trifold Map': '小丑 / 巨型蝙蝠 / 木乃伊 1% 掉落',
  'Blindfold': '腐化史莱姆 / 猩红史莱姆 / 木乃伊 / 小史莱姆 / 恶翅史莱姆 1% 掉落',
  'Nazar': '诅咒锤 / 猩红斧 / 诅咒骷髅头 / 附魔剑(怪) / 巨型诅咒骷髅头 1% 掉落',
  'Frozen Turtle Shell': '雪原 冰雪陆龟 2% 掉落',
  'Bananaarang': '血月小丑 10% 掉落',
  'Enchanted Sword': '附魔剑冢挖掘 / 黄金匣 3.33%（钛金匣 6.67%）开启',
  'Shackle': '僵尸 / 冰冻僵尸 / 血雨伞僵尸 2% 掉落'
}
// 追加型（保留原文，补缺失来源）
const APPEND = {
  'Sandstorm in a Bottle': '；金箱 44.44% 也会开出',
  'Anklet of the Wind': '；另见 荆棘匣 19%',
  'Panic Necklace': '；腐化匣 / 血腥匣 20%',
  'Shadow Key': '地牢金箱 / 金锁箱 33.33% 开出',
  'Extractinator': '；金箱 / 宝箱怪 / 木匣 5% 或 1.86% 也会开出',
  'Solar Fragment': '月亮事件中击败日耀天界塔 100% 掉落',
  'Nebula Fragment': '月亮事件中击败星云天界塔 100% 掉落',
  'Vortex Fragment': '月亮事件中击败星旋天界塔 100% 掉落',
  'Stardust Fragment': '月亮事件中击败星尘天界塔 100% 掉落',
  'Greater Healing Potion': '猪龙鱼公爵 / 光之女皇 / 石巨人 / 拜月教邪教徒 / 火星飞碟 / 宝箱怪 100% 掉落',
  'Corrupt Flame': '；爬藤怪 / 吞世怪 100%、食尸鬼 33.3%',
  'Luminite Bar': ''
}
// 对应 entries：碎片/强效治疗用 en 定位
const enOverride = Object.assign({}, OVERRIDE)
enOverride['Solar Fragment'] = '月亮事件中击败日耀天界塔 100% 掉落'
enOverride['Nebula Fragment'] = '月亮事件中击败星云天界塔 100% 掉落'
enOverride['Vortex Fragment'] = '月亮事件中击败星旋天界塔 100% 掉落'
enOverride['Stardust Fragment'] = '月亮事件中击败星尘天界塔 100% 掉落'
enOverride['Greater Healing Potion'] = '猪龙鱼公爵 / 光之女皇 / 石巨人 / 拜月教邪教徒 / 火星飞碟 / 宝箱怪 100% 掉落'
enOverride['Ichor'] = '猩红之地敌怪掉落：灵液黏黏怪 100%、食尸鬼 33.3%；血腥匣 50%'
enOverride['Cursed Flame'] = '腐化之地敌怪掉落：爬藤怪 / 吞世怪 100%、食尸鬼 33.3%；腐化匣 50%'
enOverride['Snow Block'] = '雪原挖掘；雪人暴徒等雪原敌怪也会掉落'
enOverride['Black Lens'] = '恶魔眼 / 游荡眼球怪 1% 掉落'

let applied = 0, missed = []
const jobs = []
items.forEach(it => {
  const en = it.en
  if (!en) return
  const newOb = enOverride[en]
  if (!newOb || newOb === it.obtain) return
  jobs.push({ en: en, newOb: newOb })
})
// 应用（按 id 切片）
jobs.forEach(j => {
  const it = items.find(x => x.en === j.en)
  const start = text.indexOf('id:"' + it.id + '"')
  if (start < 0) { missed.push(j.en); return }
  const next = text.indexOf('id:"', start + 10)
  const end = next < 0 ? text.length : next
  const slice = text.slice(start, end)
  const re = /obtain:"((?:[^"\\]|\\.)*)"/
  if (!slice.match(re)) { missed.push(j.en + '(无obtain)'); return }
  const ns = slice.replace(re, 'obtain:' + JSON.stringify(j.newOb))
  text = text.slice(0, start) + ns + text.slice(end)
  applied++
})
// APPEND 型（追加到 obtain 末尾）
Object.keys(APPEND).forEach(en => {
  if (!APPEND[en]) return
  const it = items.find(x => x.en === en)
  if (!it || !it.obtain || it.obtain.indexOf(APPEND[en].slice(0, 6)) >= 0) return
  const start = text.indexOf('id:"' + it.id + '"')
  if (start < 0) return
  const next = text.indexOf('id:"', start + 10)
  const end = next < 0 ? text.length : next
  const slice = text.slice(start, end)
  const re = /obtain:"((?:[^"\\]|\\.)*)"/
  const mm = slice.match(re)
  if (!mm) return
  const ns = slice.replace(re, 'obtain:' + JSON.stringify(mm[1] + APPEND[en]))
  text = text.slice(0, start) + ns + text.slice(end)
  applied++
})
fs.writeFileSync(__dirname + '/../data/items.js', text)
console.log('应用修改:', applied, '| 未命中:', missed.length, missed.join(', '))
