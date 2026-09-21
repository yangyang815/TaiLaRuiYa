// 魔法手铐链条修正：官方名对齐 + 新增星力手环/再生手环/魔力再生手环 + 配方表同步
const fs = require('fs')

// ① items.js
let s = fs.readFileSync('data/items.js', 'utf8')
s = s.split('天云磁石').join('天界磁石')
s = s.split('魔能手环').join('魔法手铐')
s = s.split('再生之带').join('魔力再生手环')

// magic_cuffs obtain 更新（双配方）
const obOld = s.match(/(id:"magic_cuffs"[^}]*?)obtain:"[^"]*"/)
if (!obOld) { console.log('magic_cuffs 未命中'); process.exit(1) }
s = s.replace(/(id:"magic_cuffs"[^}]*?)obtain:"[^"]*"/, '$1obtain:"工匠作坊：星力手环 + 镣铐 合成；或 魔力再生手环 + 镣铐"')

// mana_cuffs 条目 → 魔力再生手环
const mcOld = s.match(/\{id:"mana_cuffs",name:"魔法手铐"[^}]*\}/)
if (!mcOld) { console.log('mana_cuffs 未命中'); process.exit(1) }
s = s.replace(mcOld[0], '{id:"mana_reg_band",name:"魔力再生手环",en:"Mana Regeneration Band",cat:"accessory",rarity:2,art:"mana_reg_band",stats:[["效果","提升魔力再生速率"]],desc:"星力与再生双重手环的融合体，蓝条回得飞快。",obtain:"工匠作坊：再生手环 + 星力手环 合成",use:"魔法手铐材料。"}')

// 新增 星力手环 / 再生手环（挂在镣铐条目后）
const anchor = '此外可作材料合成：魔法手铐、枭首者的胸甲。"}'
if (!s.includes(anchor)) { console.log('shackle 锚点未命中'); process.exit(1) }
const add = ',{id:"star_power_band",name:"星力手环",en:"Band of Starpower",cat:"accessory",rarity:1,art:"star_power_band",stats:[["效果","魔力上限 +40"]],desc:"暗影珠中孕育的星力手环，法师前期的魔力储备。",obtain:"腐化之地敲碎暗影珠获得；猩红世界可敲猩红之心得恐慌项链后经微光转化获得",use:"魔力再生手环 / 魔法手铐材料。"},{id:"band_of_regeneration",name:"再生手环",en:"Band of Regeneration",cat:"accessory",rarity:1,art:"band_of_regeneration",stats:[["效果","提升生命再生速率"]],desc:"猩红之心中凝出的生命手环，开荒续航神器。",obtain:"猩红之地敲碎猩红之心获得；腐化世界可经微光转化星力手环获得",use:"魔力再生手环 / 神话护身符材料。"}'
s = s.replace(anchor, anchor + add)
fs.writeFileSync('data/items.js', s)
console.log('items.js OK')

// ② spritemap + 图标
const fs2 = fs
let sm = fs2.readFileSync('data/spritemap.js', 'utf8')
const tail = 'red_potion:"png"};'
if (!sm.includes(tail)) { console.log('spritemap 尾锚异常'); process.exit(1) }
sm = sm.replace(tail, 'red_potion:"png",star_power_band:"png",band_of_regeneration:"png",mana_reg_band:"png"};')
fs2.writeFileSync('data/spritemap.js', sm)
for (const [src, dst] of [
  ['pkg-cat-2/assets/BandofStarpower.png', 'assets/sprites/star_power_band.png'],
  ['pkg-cat-2/assets/BandofRegeneration.png', 'assets/sprites/band_of_regeneration.png'],
  ['pkg-cat-2/assets/ManaRegenerationBand.png', 'assets/sprites/mana_reg_band.png'],
]) fs2.copyFileSync(src, dst)
console.log('spritemap + 图标 OK')

// ③ recipes.js
let r = fs2.readFileSync('data/recipes.js', 'utf8')
r = r.split('天云磁石').join('天界磁石')
r = r.split('魔能手环').join('魔法手铐')
r = r.split('再生之带').join('魔力再生手环')
const recOld = r.match(/\{result:"mana_cuffs",count:1,station:"tinkerer",name:"魔法手铐",art:"mana_cuffs",ingredients:\[\{id:"magic_cuffs",count:1\},\{id:"band_of_regeneration",count:1\}\]\}/)
if (!recOld) { console.log('recipes mana_cuffs 未命中'); process.exit(1) }
r = r.replace(recOld[0], '{result:"mana_reg_band",count:1,station:"tinkerer",name:"魔力再生手环",art:"mana_reg_band",ingredients:[{id:"band_of_regeneration",count:1},{id:"star_power_band",count:1}]}')
r = r.replace('{id:"mana_cuffs",count:1}', '{id:"magic_cuffs",count:1}')
fs2.writeFileSync('data/recipes.js', r)
console.log('recipes.js OK')

// ④ 全量目录：星力手环补暗影珠来源
let v = fs2.readFileSync('pkg-cat-2/data/data-v2.js', 'utf8')
const vb = '"ob":"合成：恐慌项链 + 魔力水晶 @ 工匠作坊和灵雾"'
if (v.includes(vb)) {
  v = v.replace(vb, '"ob":"腐化之地敲碎暗影珠获得；猩红世界可由恐慌项链经微光转化（恐慌项链 + 魔力水晶 @ 灵雾）"')
  fs2.writeFileSync('pkg-cat-2/data/data-v2.js', v)
  console.log('全量星力手环 OK')
} else console.log('全量星力手环锚点未命中（跳过）')
