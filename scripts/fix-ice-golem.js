// 冰雪巨人链路修复：寒霜核/冰雪镰刀补精品、敌怪掉落对齐官方、羽毛掉落关联修正
const fs = require('fs')

// ---------- 1) monsters.js ----------
const mp = 'data/monsters.js'
let m = fs.readFileSync(mp, 'utf8')
const mrep = (from, to, tag) => {
  if (!m.includes(from)) { console.log('monsters 未命中[' + tag + ']'); process.exit(1) }
  if (m.includes(to)) { console.log('已应用', tag); return }
  m = m.split(from).join(to)
  console.log('OK', tag)
}
// 冰雪巨人：寒霜核改名+补冰雪羽
mrep('drops:[{id:"frozen_core",name:"冰冻核心",rate:"100%"}],desc:"暴风雪中凝聚的冰巨人，激光眼加冰霜冲击。",tip:"冰冻核心做冰霜火花靴等毕业饰品，暴雪天蹲它。"',
  'drops:[{id:"frost_core",name:"寒霜核",rate:"100%"},{id:"ice_feather",name:"冰雪羽",rate:"33.3%"}],desc:"暴风雪中凝聚的冰巨人，激光眼加冰霜冲击。",tip:"100% 掉寒霜核（暴雪瓶/冰霜飞鞭/冰霜套材料），33.3% 掉冰雪羽（冰冻之翼材料），暴雪天蹲它。"', '冰雪巨人')
// 冰雪精：掉落改官方（寒霜法杖/冰雪镰刀，原来误写冰雪羽）
mrep('drops:[{id:"ice_feather",name:"冰雪羽",rate:"1%"}],desc:"雪原的冰晶精灵，远程丢冰刺。",tip:"寒冰羽是冰雪之翼材料，雪原肉后必刷。"',
  'drops:[{id:"frost_staff",name:"寒霜法杖",rate:"2%"},{id:"ice_sickle",name:"冰雪镰刀",rate:"1%"}],desc:"雪原的冰晶精灵，远程丢冰刺。",tip:"掉寒霜法杖（2%）和冰雪镰刀（1%），雪原肉后值得蹲。"', '冰雪精')
// 鸟妖：羽毛 40%→50%，补巨型鸟妖之羽
mrep('drops:[{id:"feather",name:"羽毛",rate:"40%"}]', 'drops:[{id:"feather",name:"羽毛",rate:"50%"},{id:"giant_harpy_feather",name:"巨型鸟妖之羽",rate:"0.67%"}]', '鸟妖')
// 红魔鬼：补火羽
mrep('drops:[{id:"unholy_trident",name:"邪恶三叉戟",rate:"3.33%"}],desc:"肉后的地狱恶魔', 'drops:[{id:"unholy_trident",name:"邪恶三叉戟",rate:"3.33%"},{id:"fire_feather",name:"火羽",rate:"2%"}],desc:"肉后的地狱恶魔', '红魔鬼')
// 装甲骷髅：补骨之羽 + tip 纠错（灵气出自地牢幽魂）
mrep('drops:[{id:"bone",name:"骨头",rate:"33%"}],desc:"肉后地牢的板甲骷髅，比肉前的瘦兄弟们壮多了。",tip:"世纪之花后刷灵气做幽灵套，这里是主产地。"',
  'drops:[{id:"bone",name:"骨头",rate:"33%"},{id:"bone_feather",name:"骨之羽",rate:"0.33%"}],desc:"肉后地牢的板甲骷髅，比肉前的瘦兄弟们壮多了。",tip:"0.33% 掉骨之羽（骨之翼材料），需要耐心；灵气要去刷地牢幽魂。"', '装甲骷髅')
fs.writeFileSync(mp, m)
console.log('monsters.js 完成')

// ---------- 2) items.js：新增寒霜核 + 冰雪镰刀 ----------
const ip = 'data/items.js'
let s = fs.readFileSync(ip, 'utf8')
if (!s.includes('id:"frost_core"')) {
  const add = ',{id:"frost_core",name:"寒霜核",en:"Frost Core",cat:"material",rarity:5,art:"frost_core",desc:"冰雪巨人胸腔里的极寒核心，摸一下指尖都要结霜。",obtain:"冰雪巨人 100% 掉落",use:"可作材料合成：暴雪瓶、冰霜飞鞭、冰霜套。"},{id:"ice_sickle",name:"冰雪镰刀",en:"Ice Sickle",cat:"weapon",sub:"melee",rarity:5,art:"ice_sickle",stats:[["伤害","50"],["使用时间","25"]],desc:"挥出一轮旋转滞留的冰雪飞镰，清怪利器。",obtain:"冰雪精 1%、冰雪陆龟 1%、装甲维京海盗 1%、冰雪美人鱼 1% 掉落",use:"肉后雪原过渡武器，弹幕可穿墙。"}]'
  s = s.replace(/\];\s*$/, add + ']')
  fs.writeFileSync(ip, s)
  console.log('items.js +2')
} else console.log('items.js 已有')

// ---------- 3) spritemap + 精灵图 ----------
const sp = 'data/spritemap.js'
let sm = fs.readFileSync(sp, 'utf8')
if (!sm.includes('frost_core')) {
  const i = sm.lastIndexOf('};')
  sm = sm.slice(0, i) + ',frost_core:"png",ice_sickle:"png"};'
  fs.writeFileSync(sp, sm)
  console.log('spritemap +2')
}
for (const [src, dst] of [['pkg-cat-3/assets/FrostCore.png', 'assets/sprites/frost_core.png'], ['pkg-cat-3/assets/IceSickle.png', 'assets/sprites/ice_sickle.png']]) {
  if (fs.existsSync(src) && !fs.existsSync(dst)) fs.copyFileSync(src, dst)
}
console.log('精灵图就绪')

// ---------- 4) pixelart ----------
const pp = 'utils/pixelart.js'
let px = fs.readFileSync(pp, 'utf8')
if (!px.includes('reg("frost_core"')) {
  const regs = 'reg("frost_core",cloth("#BFE8FF","#5FA8DC"));reg("ice_sickle",sword("#E8F8FF","#8FD0F0"));'
  const i = px.lastIndexOf('module.exports=')
  px = px.slice(0, i) + regs + px.slice(i)
  fs.writeFileSync(pp, px)
  console.log('pixelart +2')
}

// ---------- 5) acquisition.js：移除羽毛5条 MANUAL drop（monsters drops 已带 monId 覆盖，避免重复） ----------
const ap = 'data/acquisition.js'
let a = fs.readFileSync(ap, 'utf8')
const drops = [
  'feather:[{t:"drop",from:"鸟妖",rate:"50%"}],',
  'bone_feather:[{t:"drop",from:"地牢装甲骷髅（蓝/地狱/生锈）",rate:"0.33%"}],',
  'ice_feather:[{t:"drop",from:"冰雪巨人",rate:"33.3%"}],',
  'fire_feather:[{t:"drop",from:"红魔鬼",rate:"2%"}],',
  'giant_harpy_feather:[{t:"drop",from:"鸟妖",rate:"0.67%"}],',
]
let removed = 0
for (const d of drops) { if (a.includes(d)) { a = a.replace(d, ''); removed++ } }
fs.writeFileSync(ap, a)
console.log('acquisition 移除重复', removed)
