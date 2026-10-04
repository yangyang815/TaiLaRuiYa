// 召唤物/Boss 修正：两个巫毒娃娃写清召唤 Boss + 机械美杜莎掉落表补全（官方 wiki 1.4.5.8 核对）
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

function fixByEn(src, en, fields, tag) {
  const anchor = '"en":"' + en + '"';
  const idx = src.indexOf(anchor);
  if (idx < 0) { console.log('  [MISS] ' + tag); return src; }
  Object.keys(fields).forEach(k => {
    // 每个字段都基于当前 src 重新截窗，避免前一次替换导致的长度偏移
    const win = src.slice(idx, idx + 1400);
    const re = new RegExp('"' + k + '":"[^"]*"');
    const m = win.match(re);
    if (!m) { console.log('  [MISS ' + k + '] ' + tag); return; }
    if (m[0] === '"' + k + '":"' + fields[k] + '"') { console.log('  [SKIP ' + k + '] ' + tag); return; }
    // m.index 是相对窗口的，窗口起点是 idx（锚点在字段之前，替换不会移动锚点位置）
    src = src.slice(0, idx + m.index) + '"' + k + '":"' + fields[k] + '"' + src.slice(idx + m.index + m[0].length);
    console.log('  [OK ' + k + '] ' + tag);
  });
  return src;
}

let v3 = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');

v3 = fixByEn(v3, 'Guide Voodoo Doll', {
  ob: '由地狱中的巫毒恶魔必定掉落（100%）',
  use: '召唤血肉墙：在地狱中将其丢入熔岩（向导必须存活）即可立即召唤血肉墙；也可作为配饰装备，让玩家和 NPC 能直接攻击向导；血肉墙存活时无法再次召唤'
}, '向导巫毒娃娃');

v3 = fixByEn(v3, 'Clothier Voodoo Doll', {
  ob: '由地牢中的愤怒骷髅怪、暗黑法师或图书管理员骷髅掉落（各 1/300，0.33%）',
  use: '召唤骷髅王：将其作为配饰装备后，在夜晚击杀服装商即可召唤骷髅王；配饰不会消耗，服装商白天重生后可再次召唤'
}, '服装商巫毒娃娃');

fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3);

// ---------- bosses.js：机械美杜莎掉落表补全 ----------
let bs = fs.readFileSync(R('data/bosses.js'), 'utf8');
const oldDrops = 'drops:[{id:"cat:WaffleIron",name:"华夫饼烘烤模",rate:"100%"}]';
const newDrops = 'drops:[' +
  '{id:"cat:WaffleIron",name:"华夫饼烘烤模",rate:"100%"},' +
  '{id:"soul_of_fright",name:"恐惧之魂×25~40",rate:"100%（机械骷髅王部位）"},' +
  '{id:"soul_of_sight",name:"视域之魂×25~40",rate:"100%（双子魔眼部位）"},' +
  '{id:"soul_of_might",name:"力量之魂×25~40",rate:"100%（毁灭者部位）"},' +
  '{id:"hallowed_bar",name:"神圣锭×45~90",rate:"100%（三部位合计，专家 60~105）"},' +
  '{id:"greater_healing_potion",name:"强效治疗药水×15~45",rate:"100%（三部位合计）"},' +
  '{id:"cat:SkeletronPrimeMask",name:"机械骷髅王面具",rate:"14.29%"},' +
  '{id:"cat:DestroyerMask",name:"毁灭者面具",rate:"14.29%"},' +
  '{id:"cat:TwinMask",name:"双子魔眼面具",rate:"14.29%"},' +
  '{id:"cat:SkeletronPrimeTrophy",name:"机械骷髅王纪念章",rate:"10%"},' +
  '{id:"cat:DestroyerTrophy",name:"毁灭者纪念章",rate:"10%"},' +
  '{id:"cat:RetinazerTrophy",name:"激光眼纪念章",rate:"10%"},' +
  '{id:"cat:SpazmatismTrophy",name:"魔焰眼纪念章",rate:"10%"},' +
  '{id:"cat:MechanicalBatteryPiece",name:"机械电池片",rate:"100%（专家宝藏袋）"},' +
  '{id:"cat:MechanicalWagonPiece",name:"机械车体片",rate:"100%（专家宝藏袋）"},' +
  '{id:"cat:MechanicalWheelPiece",name:"机械车轮片",rate:"100%（专家宝藏袋）"},' +
  '{id:"cat:SkeletronPrimeMasterTrophy",name:"机械骷髅王圣物",rate:"100%（大师）"},' +
  '{id:"cat:DestroyerMasterTrophy",name:"毁灭者圣物",rate:"100%（大师）"},' +
  '{id:"cat:TwinsMasterTrophy",name:"双子魔眼圣物",rate:"100%（大师）"},' +
  '{id:"cat:SkeletronPrimePetItem",name:"机器人骷髅头",rate:"25%（大师）"},' +
  '{id:"cat:DestroyerPetItem",name:"失效探测器",rate:"25%（大师）"},' +
  '{id:"cat:TwinsPetItem",name:"微型双子魔眼",rate:"25%（大师）"}' +
  ']';
if (bs.includes(oldDrops)) {
  bs = bs.replace(oldDrops, newDrops);
  console.log('  [OK] 机械美杜莎掉落表 1→22 条');
} else if (bs.includes('"恐惧之魂×25~40","rate":"100%（机械骷髅王部位）"')) {
  console.log('  [SKIP] 机械美杜莎掉落表已是新值');
} else {
  throw new Error('mechdusa drops 锚点未找到');
}
fs.writeFileSync(R('data/bosses.js'), bs);
console.log('完成');
