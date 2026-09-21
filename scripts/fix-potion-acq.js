// 药水"获取方式页"(acq) 与图鉴 obtain 一致性修复
// 数据源：官方 wiki（Flask of Fire 页原文核实 狱石×3@灌注站；zhdetail.byResult 其余配方）
const fs = require('fs')

// ---------- 1) data/acquisition.js：替换指定 id 的整段数组 ----------
const ap = 'data/acquisition.js'
let a = fs.readFileSync(ap, 'utf8')

const NEW = {
  obsidian_skin: [{ t: 'craft', st: 'bottle', d: '瓶装水+火焰花+水叶草+黑曜石' }],
  builder: [{ t: 'craft', st: 'bottle', d: '瓶装水+闪耀根+寒颤棘+月光草' }],
  miner: [{ t: 'craft', st: 'bottle', d: '瓶装水+蚁狮上颚+闪耀根' }],
  hunter: [{ t: 'craft', st: 'bottle', d: '瓶装水+太阳花+闪耀根+鲨鱼鳍' }],
  night_owl: [{ t: 'craft', st: 'bottle', d: '瓶装水+太阳花+闪耀根' }],
  magic_power: [{ t: 'craft', st: 'bottle', d: '瓶装水+月光草+死亡草+坠落之星' }],
  mana_regen: [{ t: 'craft', st: 'bottle', d: '瓶装水+月光草+太阳花+坠落之星' }],
  archery: [{ t: 'craft', st: 'bottle', d: '瓶装水+太阳花+晶状体' }],
  ammo_reservation: [{ t: 'craft', st: 'bottle', d: '瓶装水+双鳍鳕鱼+月光草' }],
  endurance: [{ t: 'craft', st: 'bottle', d: '瓶装水+装甲洞穴鱼+闪耀根' }],
  lifeforce: [{ t: 'craft', st: 'bottle', d: '瓶装水+七彩矿鱼+月光草+寒颤棘+水叶草' }],
  rage: [{ t: 'craft', st: 'bottle', d: '瓶装水+血腥食人鱼+死亡草' }],
  wrath: [{ t: 'craft', st: 'bottle', d: '瓶装水+黑檀锦鲤+死亡草' }],
  warmth: [{ t: 'craft', st: 'bottle', d: '瓶装水+寒霜鲦鱼+寒颤棘' }],
  calm: [{ t: 'craft', st: 'bottle', d: '瓶装水+雀鲷+太阳花' }, { t: 'chest', d: '铁匣/秘银匣 3.13% 开出' }],
  heartreach: [{ t: 'craft', st: 'bottle', d: '瓶装水+猩红虎鱼+太阳花（或月光草）' }],
  sonar: [{ t: 'craft', st: 'bottle', d: '瓶装水+水叶草+珊瑚' }],
  crate: [{ t: 'craft', st: 'bottle', d: '瓶装水+琥珀+月光草+死亡草（或琥珀+月光草+寒颤棘+水叶草）' }],
  gravitation: [{ t: 'craft', st: 'bottle', d: '瓶装水+火焰花+死亡草+闪耀根+羽毛' }],
  flipper: [{ t: 'craft', st: 'bottle', d: '瓶装水+寒颤棘+水叶草' }],
  water_walking: [{ t: 'craft', st: 'bottle', d: '瓶装水+水叶草+鲨鱼鳍' }],
  titan: [{ t: 'craft', st: 'bottle', d: '瓶装水+骨头+死亡草+寒颤棘' }],
  dangersense: [{ t: 'craft', st: 'bottle', d: '瓶装水+寒颤棘+蛛网' }],
  biome_sight: [{ t: 'craft', st: 'bottle', d: '瓶装水+火焰花+闪耀根+月光草+草种子' }],
  super_healing: [{ t: 'craft', st: 'bottle', d: '强效治疗药水+星云/日耀/星尘/星旋碎片各1' }],
  super_mana: [{ t: 'craft', st: 'bottle', d: '强效魔力药水+坠落之星+水晶碎块+独角兽角（或+灵气）' }],
  restoration: [{ t: 'craft', st: 'bottle', d: '魔力药水+治疗药水（或蘑菇+发光蘑菇+粉凝胶+玻璃瓶）' }],
  inferno: [{ t: 'craft', st: 'bottle', d: '瓶装水+闪鳍锦鲤+黑曜石鱼+火焰花' }],
  recall: [{ t: 'craft', st: 'bottle', d: '瓶装水+镜面鱼+太阳花（或死亡草）' }],
  wormhole: [{ t: 'craft', st: 'bottle', d: '瓶装水+镜面鱼+闪耀根（多人传送）' }],
  love: [{ t: 'craft', st: 'bottle', d: '瓶装水+公主鱼+寒颤棘' }],
  gender_change: [{ t: 'craft', st: 'bottle', d: '瓶装水+七种药草各1（太阳花/月光草/闪耀根/水叶草/死亡草/寒颤棘/火焰花）' }],
  flask_fire: [{ t: 'craft', st: 'imbuing', d: '瓶装水+狱石×3' }],
  flask_poison: [{ t: 'craft', st: 'imbuing', d: '瓶装水+毒刺×2' }],
  flask_gold: [{ t: 'craft', st: 'imbuing', d: '瓶装水+金尘×5' }],
  flask_party: [{ t: 'craft', st: 'imbuing', d: '瓶装水+彩纸×5' }],
  flask_cursed: [{ t: 'craft', st: 'imbuing', d: '瓶装水+诅咒焰×2' }],
  flask_ichor: [{ t: 'craft', st: 'imbuing', d: '瓶装水+灵液×2' }],
  flask_venom: [{ t: 'craft', st: 'imbuing', d: '瓶装水+小瓶毒液×2' }],
  teleportation: [{ t: 'craft', st: 'bottle', d: '瓶装水+混沌鱼+火焰花' }, { t: 'fish', where: '任意水域', d: '水中宝箱/水匣钓出' }],
}

function replaceSegment(src, id, replacement) {
  const anchor = id + ':['
  const start = src.indexOf(anchor)
  if (start < 0) { console.log('未找到', id); return src, 0 }
  let i = start + id.length // 指向 '['
  let depth = 0
  for (; i < src.length; i++) {
    if (src[i] === '[') depth++
    else if (src[i] === ']') { depth--; if (depth === 0) { i++; break } }
  }
  return src.slice(0, start) + id + ':' + JSON.stringify(replacement) + src.slice(i)
}
let n = 0
for (const [id, val] of Object.entries(NEW)) {
  const before = a.length
  a = replaceSegment(a, id, val)
  if (a.length !== before || a !== null) n++
}
fs.writeFileSync(ap, a)
console.log('acquisition.js 替换', Object.keys(NEW).length, '项')

// ---------- 2) data/recipes.js：STATIONS 增加灌注站 ----------
const rp = 'data/recipes.js'
let r = fs.readFileSync(rp, 'utf8')
if (!r.includes('"imbuing"') && !r.includes("'imbuing'")) {
  const old = '"bottle":"摆放的瓶子"'
  if (!r.includes(old)) { console.log('STATIONS 锚点未命中'); process.exit(1) }
  r = r.replace(old, old + ',"imbuing":"灌注站"')
  fs.writeFileSync(rp, r)
  console.log('STATIONS 增加 imbuing OK')
} else console.log('STATIONS 已有 imbuing')

// ---------- 3) data/items.js：烈火系药剂补数量、荆棘去错料、镇静/传送补来源 ----------
const ip = 'data/items.js'
let s = fs.readFileSync(ip, 'utf8')
const obRep = (id, from, to, tag) => {
  const re = new RegExp('(id:"' + id + '"[\\s\\S]{0,600}?obtain:")([^"]*)(")')
  const m = s.match(re)
  if (!m) { console.log('未命中', tag); process.exit(1) }
  if (!m[2].includes(from)) { console.log('obtain 内容与预期不符', tag, JSON.stringify(m[2])); process.exit(1) }
  s = s.replace(re, '$1' + m[2].replace(from, to) + '$3')
  console.log('OK', tag)
}
obRep('flask_fire', '狱石', '狱石×3', '烈火药剂×3')
obRep('flask_poison', '毒刺', '毒刺×2', '毒药剂×2')
obRep('flask_gold', '金尘', '金尘×5', '金药剂×5')
obRep('flask_party', '彩纸', '彩纸×5', '派对药剂×5')
obRep('flask_cursed', '诅咒焰', '诅咒焰×2', '诅咒焰药剂×2')
obRep('flask_ichor', '灵液', '灵液×2', '灵液药剂×2')
obRep('flask_venom', '小瓶毒液', '小瓶毒液×2', '毒液药剂×2')
obRep('thorns_potion', ' + 蠕虫毒牙 + 毒刺', '', '荆棘药水去错料')
obRep('calm', ' 合成"', ' 合成；铁匣/秘银匣 3.13% 开出"', '镇静药水补宝箱')
obRep('teleportation', '水中宝箱/水匣钓鱼开出', '摆放的瓶子：瓶装水 + 混沌鱼 + 火焰花 合成；水中宝箱/水匣钓鱼开出', '传送药水补配方')
fs.writeFileSync(ip, s)
console.log('items.js 完成')
