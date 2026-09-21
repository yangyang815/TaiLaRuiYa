// 靴链+罗盘+再生手环修正（官方 1.4.5 数据核实）
const fs = require('fs')

// ① items.js 五条 obtain
let s = fs.readFileSync('data/items.js', 'utf8')
function repOb(id, ob) {
  const re = new RegExp('(id:"' + id + '"[^}]*?)obtain:"[^"]*"')
  if (!re.test(s)) { console.log('MISS', id); process.exitCode = 1; return }
  s = s.replace(re, '$1obtain:"' + ob + '"')
}
// 魔法手铐：双配方保持（文本已对，微调措辞统一）
repOb('magic_cuffs', '工匠作坊：星力手环 + 镣铐 合成；或 魔力再生手环 + 镣铐 合成')
// 再生手环：开箱（用户指正，官方核实）
repOb('band_of_regeneration', '洞穴层金箱（12.67~16.67%）与地下丛林生命红木树中的箱开启；肉前宝箱怪 16.67% 掉落')
// 罗盘：来源补全
repOb('compass_acc', '蝾螈 / 巨型卷壳怪 / 龙虾 1.23%、食人鱼 1.33%、史莱姆之母 / 雪地佛林克斯 / 不死维京海盗 / 装甲维京海盗 2% 掉落')
// 幽灵靴：三种基础跑鞋任选其一
repOb('spectre_boots', '工匠作坊：火箭靴 + 赫尔墨斯靴 / 疾风雪靴 / 沙丘行者靴（三种基础跑鞋任选其一）')
// 闪电靴：官方成分名
repOb('lightning_boots', '工匠作坊：幽灵靴 + 疾风脚镯 + 鞋带束头 合成')
fs.writeFileSync('data/items.js', s)
console.log('items.js OK')

// ② recipes.js：补幽灵靴/闪电靴配方 + 魔法手铐第二配方
let r = fs.readFileSync('data/recipes.js', 'utf8')
if (!r.includes('result:"spectre_boots"')) {
  r = r.replace('{result:"frostspark_boots"', '{result:"spectre_boots",count:1,station:"tinkerer",name:"幽灵靴",art:"spectre_boots",ingredients:[{id:"hermes_boots",count:1},{id:"rocket_boots",count:1}]},\n{result:"lightning_boots",count:1,station:"tinkerer",name:"闪电靴",art:"lightning_boots",ingredients:[{id:"spectre_boots",count:1},{id:"anklet_of_wind",count:1},{id:"aglet",count:1}]},\n{result:"frostspark_boots"')
  console.log('recipes 补幽灵靴/闪电靴')
} else console.log('recipes 已有幽灵靴配方')
if (!r.includes('result:"magic_cuffs"')) {
  console.log('magic_cuffs 配方缺失!'); process.exitCode = 1
} else {
  // 追加魔法手铐第二配方（魔力再生手环+镣铐）
  const mcre = /(\{result:"magic_cuffs",count:1,station:"tinkerer",name:"[^"]*",art:"magic_cuffs",ingredients:\[\{id:"shackle",count:1\},\{id:"star_power_band",count:1\}\]\})/
  if (!r.match(mcre)) { console.log('magic_cuffs 配方锚未命中'); process.exitCode = 1 }
  else {
    r = r.replace(mcre, '$1,\n{result:"magic_cuffs",count:1,station:"tinkerer",name:"魔法手铐",art:"magic_cuffs",ingredients:[{id:"mana_reg_band",count:1},{id:"shackle",count:1}]}')
    console.log('recipes 补魔法手铐第二配方')
  }
}
fs.writeFileSync('data/recipes.js', r)

// ③ 新增精品条目：鞋带束头（闪电靴材料，骷髅商人出售）
if (!s.includes('id:"aglet"')) {
  const anchor = '此外可作材料合成：魔法手铐、枭首者的胸甲。"}'
  if (!s.includes(anchor)) { console.log('shackle 锚点未命中'); process.exit(1) }
  s = fs.readFileSync('data/items.js', 'utf8')
  s = s.replace(anchor, anchor + ',{id:"aglet",name:"鞋带束头",en:"Aglet",cat:"accessory",rarity:1,art:"aglet",stats:[["效果","移动速度 +5%"]],desc:"系紧鞋带的小金属头，小小的速度提升。",obtain:"骷髅商人出售（2 金 50 银）；宝物袋开启",use:"闪电靴材料。"}')
  fs.writeFileSync('data/items.js', s)
  console.log('新增鞋带束头条目')
}
// spritemap + 图标
let sm = fs.readFileSync('data/spritemap.js', 'utf8')
const tail = 'mana_reg_band:"png"};'
if (sm.includes(tail) && !sm.includes('aglet:"png"')) {
  sm = sm.replace(tail, 'mana_reg_band:"png",aglet:"png"};')
  fs.writeFileSync('data/spritemap.js', sm)
  fs.copyFileSync('pkg-cat-2/assets/Aglet.png', 'assets/sprites/aglet.png')
  console.log('spritemap + 鞋带束头图标 OK')
} else console.log('spritemap 跳过')

// ④ 全量：再生手环具体化、罗盘补蝙蝠修正
let v = fs.readFileSync('pkg-cat-2/data/data-v2.js', 'utf8')
const brOld = '"f":"BandofRegeneration"'
let i = v.indexOf(brOld)
if (i >= 0) {
  const seg = v.slice(i, i + 1200).replace('"ob":"开启宝箱获得"', '"ob":"洞穴层金箱、丛林生命红木树中的箱开启；肉前宝箱怪 16.67% 掉落"')
  v = v.slice(0, i) + seg + v.slice(i + 1200)
  fs.writeFileSync('pkg-cat-2/data/data-v2.js', v)
  console.log('全量再生手环 OK')
}
