// 职业养成 + 特殊种子 核对修补（依据官方 wiki/游戏数据 1.4.5，2026-09-16）
const fs = require('fs')

// ---------- 1. 复制火花魔棒/紫水晶法杖官方图标 ----------
fs.copyFileSync('pkg-cat-3/assets/WandofSparking.png', 'assets/sprites/spark_wand.png')
fs.copyFileSync('pkg-cat-3/assets/AmethystStaff.png', 'assets/sprites/amethyst_staff.png')
console.log('图标已复制: spark_wand / amethyst_staff')

// ---------- 2. spritemap 追加（用精确尾串，避免上次丢逗号的问题） ----------
let sm = fs.readFileSync('data/spritemap.js', 'utf8')
if (!sm.includes('spark_wand:')) {
  const tail = 'star_wrath:"png"};'
  if (!sm.includes(tail)) { console.log('spritemap 尾部异常，中止'); process.exit(1) }
  sm = sm.replace(tail, 'star_wrath:"png",spark_wand:"png",amethyst_staff:"png"};')
  fs.writeFileSync('data/spritemap.js', sm)
  console.log('spritemap 已追加 2 键')
} else console.log('spritemap 已有 spark_wand')

// ---------- 3. 像素画追加（复用 staff 模板） ----------
let px = fs.readFileSync('utils/pixelart.js', 'utf8')
if (!px.includes('reg("spark_wand"')) {
  const regs = 'reg("spark_wand",staff("#FFD700","#FFEC8A"));reg("amethyst_staff",staff("#A864D8","#D8B0FF"));'
  px = px.replace('module.exports=', regs + 'module.exports=')
  fs.writeFileSync('utils/pixelart.js', px)
  console.log('像素画已追加 2 个')
} else console.log('像素画已有 spark_wand')

// ---------- 4. career.js 事实修正 ----------
let c = fs.readFileSync('data/career.js', 'utf8')
const errs = []
const rep = (o, n) => {
  const cnt = c.split(o).length - 1
  if (cnt !== 1) { errs.push('[' + cnt + '] ' + o.slice(0, 40)); return }
  c = c.replace(o, n)
}
// 战士
rep('顺手拿下虚空之刃等暗影武器', '顺手拿下暗夜战斧等暗影武器')
rep('name:"光之驱逐",why:"魔金锭合成，永夜之刃材料"', 'name:"魔光剑",why:"魔金锭合成，永夜之刃材料"')
rep('name:"蜂王剑",why:"蜂王掉落，天顶剑材料"', 'name:"养蜂人",why:"蜂王掉落，天顶剑材料"')
rep('name:"草薙剑",why:"丛林材料合成，永夜材料"', 'name:"草剑",why:"丛林材料合成，永夜之刃材料"')
rep('why:"空岛星匣产出，天降星剑"', 'why:"空岛天域箱产出，天降星剑"')
rep('日食刷勇者断剑，合成真断钢剑/真永夜之刃', '日食刷断裂英雄剑，合成真断钢剑/真永夜之刃')
rep('name:"真永夜之刃",why:"永夜+英雄断剑升级"', 'name:"真永夜之刃",why:"永夜之刃+断裂英雄剑升级"')
rep('name:"真断钢剑",why:"断钢剑+英雄断剑升级"', 'name:"真断钢剑",why:"断钢剑+断裂英雄剑升级"')
rep('世纪之花掉落的种子弯刀等材料合成泰拉刃', '真断钢剑+真永夜之刃+断裂英雄剑合成泰拉刃')
// 射手
rep('name:"凤凰爆破枪",why:"手枪+黑曜石合成，肉前顶级枪械"', 'name:"凤凰爆破枪",why:"手枪+狱石锭×10 合成，肉前顶级枪械"')
// 法师
rep('goal:"做出魔法飞弹，击败克苏鲁之眼"', 'goal:"做出火花魔棒，击败克苏鲁之眼"')
rep('{art:"magic_missile",name:"魔法飞弹",why:"可控弹幕，开荒主力法术"}', '{art:"spark_wand",name:"火花魔棒",why:"1.4.4 新增的早期法术，可控火花"}')
rep('地牢拿水晶风暴书', '地牢金箱搜刮魔法飞弹、蓝月与钴护盾')
rep('name:"暗影束法杖",why:"地牢幽魂掉落，弹射光束"', 'name:"暗影束法杖",why:"世纪之花后地牢暗影箱开出，弹射光束"')
// 召唤
rep('name:"皮鞭",why:"皮匠出售，指挥宝宝集火"', 'name:"皮鞭",why:"动物学家出售，指挥宝宝集火"')
rep('name:"荆棘鞭",why:"蜂王材料，给仆从上加成"', 'name:"荆棘鞭",why:"蜂刺+蜂蜜块+藤蔓合成，给仆从上加成"')
rep('name:"小鬼法杖",why:"地狱小鬼掉落，火焰弹幕"', 'name:"小鬼法杖",why:"狱石锭合成，火焰弹幕"')
rep('name:"杜兰达尔",why:"地牢掉落，鞭子升级"', 'name:"杜兰达尔",why:"神圣锭×12 合成，鞭子升级"')
rep('name:"血红法杖",why:"血月掉落，追爆发强"', 'name:"猩红魔杖",why:"猩红匣/猩红之心 20% 开出（1.4.5 新增）"')
rep('name:"侏儒法杖",why:"石巨人掉落，部落军团"', 'name:"侏儒法杖",why:"世纪之花掉落，部落军团"')
if (errs.length) {
  console.log('career.js 存在未命中，中止：')
  errs.forEach(e => console.log('  ' + e))
  process.exit(1)
}
fs.writeFileSync('data/career.js', c)
console.log('career.js 修补完成')

// ---------- 5. seeds.js 修正 ----------
let s = fs.readFileSync('data/seeds.js', 'utf8')
const errs2 = []
const rep2 = (o, n) => {
  const cnt = s.split(o).length - 1
  if (cnt !== 1) { errs2.push('[' + cnt + '] ' + o.slice(0, 40)); return }
  s = s.replace(o, n)
}
rep2('tag:"地狱开局",diff:3', 'tag:"墓地血月开局",diff:3') // 夜之死者（dontdigup 是"地狱开局反转世界"，不受影响）
rep2('name:"空岛世界",en:"Skyblock",code:"skyblock",tag:"孤岛求生",diff:5,ver:"1.4.5"', 'name:"空岛世界",en:"Skyblock",code:"skyblock",tag:"孤岛求生",diff:5,ver:"1.4.4"')
if (errs2.length) {
  console.log('seeds.js 存在未命中，中止：')
  errs2.forEach(e => console.log('  ' + e))
  process.exit(1)
}
fs.writeFileSync('data/seeds.js', s)
console.log('seeds.js 修补完成')
