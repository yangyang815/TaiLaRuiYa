const fs = require('fs')
let s = fs.readFileSync('utils/cat-groups.js', 'utf8')
if (!s.includes('Minecart:"summon"')) {
  const add = '  Minecart:"summon",DiggingMoleMinecart:"summon",HellMinecart:"summon",MeowmereMinecart:"summon",FishMinecart:"summon",PartyMinecart:"summon",PigronMinecart:"summon",ShroomMinecart:"summon",SteampunkMinecart:"summon",\n  PeaceCandle:"furniture",Sunflower:"furniture",ShadowOrb:"pet",'
  s = s.replace('  DeadCellsPotionStation:"pet",CompanionCube:"pet",', '  DeadCellsPotionStation:"pet",CompanionCube:"pet",\n' + add)
  fs.writeFileSync('utils/cat-groups.js', s)
  console.log('OVERRIDE 补齐 OK')
} else console.log('已存在')
