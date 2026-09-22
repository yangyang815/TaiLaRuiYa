const fs = require('fs')
let s = fs.readFileSync('utils/cat-groups.js', 'utf8')

// 1) 扩充 OVERRIDE
const add = [
  '  FrozenTurtleShell:"accessory",MoonCharm:"accessory",NeptunesShell:"accessory",PaladinsShield:"accessory",PanicNecklace:"accessory",',
  '  WitchBroom:"summon",DeadCellsSwarmGrenade:"weapon",EnchantedPixieDust:"material",',
  '  NebulaPickup1:"other",NebulaPickup2:"other",NebulaPickup3:"other",',
  '  DeadCellsPotionStation:"pet",CompanionCube:"pet",',
].join('\n')
if (!s.includes('NebulaPickup1:"other"')) {
  s = s.replace('  BlessedApple:"summon",GummyWorm:"pet",MinecartPowerup:"tech",ShrimpyTruffle:"summon"',
    '  BlessedApple:"summon",GummyWorm:"pet",MinecartPowerup:"tech",ShrimpyTruffle:"summon",\n' + add)
  console.log('OVERRIDE 扩充 OK')
} else console.log('OVERRIDE 已扩充')

// 2) 重建 macroOf（支持整行对象，中文名规则）
const re = /function macroOf\(c,f,t\)\{[\s\S]*?return MAP\[cs\]\|\|LAST\}/
if (!re.test(s)) { console.log('macroOf 未找到'); process.exit(1) }
const good = [
  'function macroOf(c, it){',
  '  var f = it && it.f, n = (it && it.n) || "", t = (it && it.t) || "";',
  '  if(f&&OVERRIDE[f])return{k:OVERRIDE[f]};',
  '  var cs=String(c||"").trim();',
  '  if(f&&cs==="增益物品"){',
  '    if(/篝火$/.test(n))return{k:"furniture"};',
  '    if(/MountItem$/.test(f))return{k:"summon"};',
  '    if(/Pet/.test(f)||/召唤/.test(t))return{k:"pet"};',
  '    if(/盔甲$/.test(n))return{k:"armor"};',
  '    if(/放置后/.test(t))return{k:"furniture"};',
  '  }',
  '  if(!c)return LAST;',
  '  return MAP[cs]||LAST}',
].join('')
s = s.replace(re, good)
fs.writeFileSync('utils/cat-groups.js', s)
console.log('macroOf 重建 OK')

// 3) codex.js 调用传整行
let c = fs.readFileSync('pages/codex/codex.js', 'utf8')
if (c.includes('catGroups.macroOf(x.c,x.f);')) {
  c = c.replace('catGroups.macroOf(x.c,x.f);', 'catGroups.macroOf(x.c,x);')
  fs.writeFileSync('pages/codex/codex.js', c)
  console.log('codex 调用传整行 OK')
} else console.log('codex 调用现状:', c.includes('macroOf(x.c,x)'))
