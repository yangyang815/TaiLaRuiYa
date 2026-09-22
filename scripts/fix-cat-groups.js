// 分类映射修正：绳子/链条→工具、鱼饵桶→掉落战利品、混乱之脑→饰品、
// 蜡烛→家具光源、坐骑/宠物召唤物归位、永久增益独立成组
const fs = require('fs')
const p = 'utils/cat-groups.js'
let s = fs.readFileSync(p, 'utf8')

// 1) 追加内部名精确覆盖表 + macroOf 支持 f
if (!s.includes('OVERRIDE')) {
  const override = [
    '// 内部名精确覆盖：修正 wiki 泛分类导致的错位',
    'const OVERRIDE={',
    '  Chain:"tool",Rope:"tool",SilkRope:"tool",VineRope:"tool",WebRope:"tool",',
    '  RopeCoil:"tool",SilkRopeCoil:"tool",VineRopeCoil:"tool",WebRopeCoil:"tool",',
    '  ChumBucket:"drop",BrainOfConfusion:"accessory",RodofDiscord:"tool",',
    '  WaterCandle:"furniture",ShadowCandle:"furniture",',
    '  BlessedApple:"summon",GummyWorm:"pet",MinecartPowerup:"tech",ShrimpyTruffle:"summon"',
    '};',
  ].join('\n')
  s = s.replace('const LAST=', override + '\nconst LAST=')
  s = s.replace(
    'function macroOf(c){if(!c)return LAST;return MAP[String(c).trim()]||LAST}',
    'function macroOf(c,f){if(f&&OVERRIDE[f])return{k:OVERRIDE[f]};if(!c)return LAST;return MAP[String(c).trim()]||LAST}'
  )
  console.log('OVERRIDE + macroOf(f) OK')
} else console.log('OVERRIDE 已存在')

// 2) potion 组移除"永久增益""减益物品"，新增 perm 组
if (!s.includes('k:"perm"')) {
  s = s.replace(
    '{k:"potion",n:"药水增益",cats:["药水","药水配料","增益物品","减益物品","永久增益","治疗物品"]},',
    '{k:"potion",n:"药水增益",cats:["药水","药水配料","增益物品","治疗物品"]},'
  )
  s = s.replace(
    '{k:"seed",n:"种子",cats:["种子"]},',
    '{k:"seed",n:"种子",cats:["种子"]},{k:"perm",n:"永久提升",cats:["永久增益"]},'
  )
  console.log('potion 拆分 + perm 组 OK')
} else console.log('perm 已存在')
fs.writeFileSync(p, s)

// ---------- 3) dex.js 物品 chips 追加 永久提升 ----------
const dp = 'utils/dex.js'
let d = fs.readFileSync(dp, 'utf8')
if (!d.includes('"perm:永久提升"')) {
  d = d.replace(
    '"other:其他"',
    '"perm:永久提升","other:其他"'
  )
  fs.writeFileSync(dp, d)
  console.log('dex chips +perm OK')
} else console.log('dex 已有 perm')
