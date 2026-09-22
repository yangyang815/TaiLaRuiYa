const fs = require('fs')
let s = fs.readFileSync('utils/cat-groups.js', 'utf8')
// 修复上一条命令被 bash 转义损坏的 macroOf，并写入完整版细分规则
const broken = s.match(/function macroOf\(c,f,t\)\{[\s\S]*?return MAP\[cs\]\|\|LAST\}/)
if (!broken) { console.log('未找到损坏的 macroOf'); process.exit(1) }
const good = [
  'function macroOf(c,f,t){',
  '  if(f&&OVERRIDE[f])return{k:OVERRIDE[f]};',
  '  var cs=String(c||"").trim();',
  '  if(f&&cs==="增益物品"){',
  '    var txt=(t||"")+" "+f;',
  '    if(/篝火/.test(f))return{k:"furniture"};',
  '    if(/PetItem$/.test(f))return{k:"pet"};',
  '    if(/可骑乘|坐骑/.test(txt))return{k:"summon"};',
  '    if(/召唤/.test(txt)&&/宝宝|宠物|照明/.test(txt))return{k:"pet"};',
  '    if(/放置后/.test(txt))return{k:"furniture"};',
  '  }',
  '  if(!c)return LAST;',
  '  return MAP[cs]||LAST}',
].join('')
s = s.replace(broken[0], good)
fs.writeFileSync('utils/cat-groups.js', s)
console.log('macroOf 重建 OK')
