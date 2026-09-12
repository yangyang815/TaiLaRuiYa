// bosses.js 掉落概率对齐官方（血肉墙/世纪之花/月亮领主）——唯一字符串全局替换
const fs = require('fs')
let s = fs.readFileSync(__dirname + '/../data/bosses.js', 'utf8')
const P = [
  // 血肉墙：徽章 25%×4、激光步枪 25%
  ['rate:"16.7%×4"', 'rate:"25%×4"'],
  ['{id:"laser_rifle",name:"激光步枪",rate:"16.7%"}', '{id:"laser_rifle",name:"激光步枪",rate:"25%"}'],
  // 月亮领主武器：20%
  ['{id:"meowmere",name:"彩虹猫之刃",rate:"22.2%"}', '{id:"meowmere",name:"彩虹猫之刃",rate:"20%"}'],
  ['{id:"star_wrath",name:"狂星之怒",rate:"22.2%"}', '{id:"star_wrath",name:"狂星之怒",rate:"20%"}'],
  ['{id:"terrarian",name:"泰拉悠悠球",rate:"22.2%"}', '{id:"terrarian",name:"泰拉悠悠球",rate:"20%"}'],
  ['{id:"last_prism",name:"终极棱镜",rate:"12.5%"}', '{id:"last_prism",name:"终极棱镜",rate:"20%"}'],
  ['{id:"sdmg",name:"太空海豚机枪",rate:"12.5%"}', '{id:"sdmg",name:"太空海豚机枪",rate:"20%"}'],
  // 世纪之花：12.5% ×6、吉他斧 2%、矮人法杖 25%
  ['{id:"seedler",name:"种子弯刀",rate:"14.3%"}', '{id:"seedler",name:"种子弯刀",rate:"12.5%"}'],
  ['{id:"grenade_launcher",name:"榴弹发射器",rate:"14.3%"}', '{id:"grenade_launcher",name:"榴弹发射器",rate:"12.5%"}'],
  ['{id:"venus_magnum",name:"维纳斯万能枪",rate:"14.3%"}', '{id:"venus_magnum",name:"维纳斯万能枪",rate:"12.5%"}'],
  ['{id:"leaf_blower",name:"吹叶机",rate:"14.3%"}', '{id:"leaf_blower",name:"吹叶机",rate:"12.5%"}'],
  ['{id:"flower_pow",name:"花之力",rate:"14.3%"}', '{id:"flower_pow",name:"花之力",rate:"12.5%"}'],
  ['{id:"wasp_gun",name:"胡蜂枪",rate:"14.3%"}', '{id:"wasp_gun",name:"胡蜂枪",rate:"12.5%"}'],
  ['{id:"the_axe",name:"吉他斧",rate:"5%"}', '{id:"the_axe",name:"吉他斧",rate:"2%"}'],
  ['{id:"pygmy_staff",name:"矮人法杖",rate:"50%"}', '{id:"pygmy_staff",name:"矮人法杖",rate:"25%"}']
]
let ok = 0
P.forEach(([o, n]) => {
  const c = (s.match(new RegExp(o.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
  if (c !== 1) { console.log('[异常] 出现', c, '次:', o.slice(0, 50)); return }
  s = s.replace(o, n)
  ok++
})
fs.writeFileSync(__dirname + '/../data/bosses.js', s)
console.log('替换:', ok, '/', P.length)
