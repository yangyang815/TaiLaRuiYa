// 精品图鉴：磁花/魔力花/忍者大师装备/黑腰带/分趾厚底袜/大自然的恩赐 修正
// 官方依据（terraria.wiki.gg 1.4.5 + GT 官方名 + 本地配方表 zhdetail.byResult）：
//  - Magnet Flower = Mana Flower + Celestial Magnet @ 工匠作坊
//  - Mana Flower = Nature's Gift + Mana Potion @ 工匠作坊（各×1）
//  - Master Ninja Gear = Tiger Climbing Gear + Tabi + Black Belt @ 工匠作坊
//  - Black Belt / Tabi：Bone Lee(骷髅李) 8.33% 掉落（专家 15.97%）
//  - Nature's Gift：地下丛林丛林草上生长的稀有蓝花，任意工具采集
const fs = require('fs')
const p = 'data/items.js'
let s = fs.readFileSync(p, 'utf8')
const orig = s.length
let n = 0
const rep = (from, to, tag) => {
  if (!s.includes(from)) { console.log('未命中[' + tag + ']:', JSON.stringify(from.slice(0, 60))); process.exitCode = 1; return }
  if (s.includes(to)) { return } // 幂等
  s = s.split(from).join(to)
  n++
  console.log('OK', tag)
}

// 1. 磁花
rep('obtain:"工匠作坊：天界磁石+天然恩赐"',
  'obtain:"工匠作坊：魔力花 + 天界磁石 合成"', '磁花.obtain')
rep('desc:"天界磁石与天然恩赐的合体花，魔力星自动飞进口袋。"',
  'desc:"魔力花与天界磁石的合体花，魔力星自动飞进口袋，蓝条见底还会自动嗑药。"', '磁花.desc')
rep('stats:[["效果","远距离拾取魔力星"]],desc:"魔力花与天界磁石的合体花"',
  'stats:[["效果","自动拾取魔力星"],["效果","魔力不足自动喝药水"]],desc:"魔力花与天界磁石的合体花"', '磁花.stats')
rep('id:"magnet_flower",name:"磁花",en:"Magnet Flower",cat:"accessory",rarity:2',
  'id:"magnet_flower",name:"磁花",en:"Magnet Flower",cat:"accessory",rarity:4', '磁花.rarity')
rep('id:"magnet_flower",name:"磁花",en:"Magnet Flower",cat:"accessory",rarity:4,art:"magnet_flower",stats:[["效果","自动拾取魔力星"],["效果","魔力不足自动喝药水"]]',
  'id:"magnet_flower",name:"磁花",en:"Magnet Flower",cat:"accessory",rarity:4,art:"magnet_flower",stats:[["效果","自动拾取魔力星"],["效果","魔力不足自动喝药水"]],obtainX:1', '磁花占位')
s = s.replace(',obtainX:1', '')
rep('use:"天界手铐材料。"',
  'use:"法师续航毕业件，与天界手铐、天界壳搭配成型。"', '磁花.use')

// 2. 魔力花
rep('obtain:"工匠作坊：天然恩赐+魔力水晶×3"',
  'obtain:"工匠作坊：大自然的恩赐 + 魔力药水 合成"', '魔力花.obtain')
rep('use:"法师续航；此外可作材料合成：奥术花、磁花、魔力斗篷。"',
  'use:"法师续航核心；可再合成奥术花、磁花、魔力斗篷。"', '魔力花.use')

// 3. 忍者大师装备
rep('obtain:"工匠作坊：黑腰带+虎足+爬墙爪等合成"',
  'obtain:"工匠作坊：猛虎攀爬装备 + 分趾厚底袜 + 黑腰带 合成"', '忍者大师.obtain')

// 4. 黑腰带 / 分趾厚底袜（官方名骷髅李 + 概率）
rep('id:"black_belt"', 'id:"black_belt"', '黑腰带锚点')
s = s.replace(/(id:"black_belt"[^}]*?)obtain:"[^"]*"/, '$1obtain:"地牢敌怪骷髅李 8.33% 掉落（专家 15.97%）"')
s = s.replace(/(id:"tabi"[^}]*?)obtain:"[^"]*"/, '$1obtain:"地牢敌怪骷髅李 8.33% 掉落（专家 15.97%）"')

fs.writeFileSync(p, s)
console.log('items.js', orig, '->', s.length, '处数', n)

// 5. 全量目录 大自然的恩赐 兜底文案具体化
const fp = 'pkg-cat-2/data/data-v2.js'
let raw = fs.readFileSync(fp, 'utf8')
const m = raw.match(/("f":"NaturesGift"[\s\S]{0,600}?"ob":")([^"]*)(")/)
if (m) {
  raw = raw.replace(m[0], m[1] + '地下丛林丛林草上生长的稀有蓝花（丛林玫瑰的蓝色变种），用任意工具或武器采集获得' + m[3])
  fs.writeFileSync(fp, raw)
  console.log('OK 全量NaturesGift')
} else console.log('全量NaturesGift 未匹配')
