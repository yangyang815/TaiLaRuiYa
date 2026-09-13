// 种子与事件补全：用可靠锚点插入
const fs = require('fs')

// ===== A. seeds.js =====
let seeds = fs.readFileSync('data/seeds.js', 'utf8')
let n = 0
function rep (s, o, nw) {
  if (!s.includes(o)) { console.log('  MISS:', String(o).slice(0, 50)); return s }
  return s.split(o).join(nw)
}
seeds = rep(seeds, 'code:"dual dungeons / double daring dangers"', 'code:"double daring dangers"')
seeds = rep(seeds, 'code:"xray vision"', 'code:"x-ray vision"')

// 在数组最后的 `]` 前插入两个新种子：锚点 = 文件末尾
const lastBracket = seeds.lastIndexOf(']')
if (seeds.slice(lastBracket - 1, lastBracket) !== '}') { console.log('锚点异常，停止'); process.exit(1) }
const addSeeds = ',{id:"seed_electric",name:"电闪雷鸣",en:"Electric Boogaloo",code:"electric boogaloo",tag:"雷暴常驻",diff:1,ver:"1.4.5.7",group:"casual",art:"fallen_star",color:"#7FD1E8",desc:"1.4.5.7 新增彩蛋种子：雷暴天气更常来，闪电更密集——观察天象党的福利，也是木制基地的噩梦。",mechanics:["雷暴天气出现频率大幅提升","闪电打击更密集，被劈中会起火","其余生成与普通世界一致"],tips:["木质建筑注意防火，或干脆改用石材","想看闪电瀑布景观，这是最好的世界"]},{id:"seed_calm",name:"风平浪静",en:"Calm before the storm",code:"calm before the storm",tag:"禁用闪电",diff:1,ver:"1.4.5.7",group:"casual",art:"cloud",color:"#A8C8E8",desc:"与电闪雷鸣相反的宁静种子：这个世界彻底告别闪电，怕火的建筑党和裸奔党安心了。",mechanics:["完全禁用闪电打击","雷暴天气不再劈雷起火","其余生成与普通世界一致"],tips:["木屋党/森林基地玩家的舒适选择","想体验闪电请改用电闪雷鸣种子"]}'
seeds = seeds.slice(0, lastBracket) + addSeeds + seeds.slice(lastBracket)
fs.writeFileSync('data/seeds.js', seeds)
n++
console.log('seeds.js 完成')

// ===== B. strategies.js：补史莱姆雨与沙尘暴事件 =====
let strat = fs.readFileSync('data/strategies.js', 'utf8')
const anchor = '];const BANNERS'
if (!strat.includes(anchor)) { console.log('strategies 锚点异常'); process.exit(1) }
const addEvents = ',{id:"s_event_slime_rain",title:"史莱姆雨：从天而降的凝胶风暴",cat:"event",cover:"m_blue_slime",time:"3 分钟",summary:"白天随机降临的软绵绵事件：杀满史莱姆召唤史莱姆王收尾，凝胶量产与史莱姆法杖看脸圣地。",steps:[{t:"触发条件",d:"白天随机自然触发（任何进度都可能），屏幕提示史莱姆从天而降，绿色/蓝色/紫色史莱姆成群从天上摔下来。"},{t:"事件机制",d:"击杀进度条按击杀数推进，杀满约 150 只（小世界约 75 只）会当场刷出史莱姆王收尾；放任不管约一整个白天后自然结束，没有奖励。"},{t:"核心收益",d:"凝胶量产（合成火把/Slime Crown 材料）；所有史莱姆有极低概率掉史莱姆法杖（前期召唤神器）；史莱姆王掉史莱姆鞍与史莱姆枪。"},{t:"打法要点",d:"站高处横扫即可——从天而降的史莱姆落地有摔伤，高台输出又安全又快；药剂台刷史莱姆雨顺便挂机捡凝胶。"}],tips:["史莱姆法杖掉率极低（约万分之一），刷 史莱姆雨 是主要来源之一。","若史莱姆王已被击败过，事件结束后不会重复召唤。"],related:[{id:"king_slime",type:"boss"},{id:"slime_staff",type:"item"}]},{id:"s_event_sandstorm",title:"沙尘暴：沙漠里的狂风试炼",cat:"event",cover:"m_sand_elemental",time:"3 分钟",summary:"沙漠专属的天气事件：强风推人、能见度骤降，肉后刷沙尘精拿禁忌碎片合成禁忌套装。",steps:[{t:"触发条件",d:"风速超过 30mph 时沙漠随机刮起（肉前较少、困难模式频率翻倍），持续 8~24 分钟；无法手动召唤，天气收音机可查询。"},{t:"敌怪阵容",d:"肉前：愤怒滚球/蚁狮/秃鹫；肉后追加沙鲨三兄弟、沙尘精、沙丘蠕虫——神圣/腐化/猩红沙漠还有专属变体。"},{t:"核心收益",d:"沙尘精掉禁忌碎片（合成禁忌法师套装：法术+召唤双修）；沙鲨掉鲨鱼鳍与沙鲨风筝；滚球怪掉玉米片（食物）。"},{t:"应对要点",d:"强风会持续推人：用轮滑鞋（滚行状态免疫强风）、抓钩钉地或背景墙挡风；能见度差，沿地表跑图注意陷坑。"}],tips:["禁忌碎片只在肉后沙尘暴的沙尘精身上掉，刷不到先去推进度。","躲在地下或飞离沙漠就能完全规避事件。"],related:[{id:"sand_elemental",type:"mon"},{id:"forbidden_fragment",type:"item"}]}]'
strat = strat.replace(anchor, addEvents + anchor)
fs.writeFileSync('data/strategies.js', strat)
n++
console.log('strategies.js 完成')
console.log('完成:', n)
