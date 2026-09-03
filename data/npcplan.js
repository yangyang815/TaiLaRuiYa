// NPC 规划器数据层（基于官方 Wiki 1.4.4 偏好矩阵）
// 价格系数公式（购买价，越低越快乐，下限 75%）：
//   独居奖励(25格内≤2个其他NPC) ×0.95
//   拥挤惩罚(25格内第4个NPC起，每个 ×1.05)
//   喜爱群落 ×0.88 / 喜欢 ×0.94 / 不喜欢 ×1.06 / 讨厌 ×1.12
//   喜爱邻居(每个) ×0.88 / 喜欢 ×0.94 / 不喜欢 ×1.06 / 讨厌 ×1.12
// 晶塔出售条件：NPC 价格系数 ≤ 90%

/* ---------- 生物群落 ---------- */
const BIOMES = [
  { id: 'forest', name: '森林', icon: '🌳' },
  { id: 'desert', name: '沙漠', icon: '🏜️' },
  { id: 'jungle', name: '丛林', icon: '🌿' },
  { id: 'hallow', name: '神圣', icon: '💎' },
  { id: 'snow', name: '雪地', icon: '❄️' },
  { id: 'ocean', name: '海洋', icon: '🌊' },
  { id: 'cave', name: '地下', icon: '⛏️' },
  { id: 'mushroom', name: '蘑菇', icon: '🍄' }
]
const BIOME_N = {}
BIOMES.forEach(b => { BIOME_N[b.id] = b.name })

/* ---------- NPC 偏好数据（id 与图鉴 npc_* 对应）
   bLove/bLike/bDis/bHate: 群落偏好（love=喜爱 -12% / like=喜欢 -6% / dis=不喜欢 +6% / hate=讨厌 +12%）
   nLove/nLike/nDis/nHate: 邻居偏好（系数同上，25 格内生效）
   fix: 固定居所（不参与自由规划）
   skip: 不参与规划（旅商/骷髅商无住房；圣诞节日限定；公主任意位置） */
const NPCS = [
  { id: 'npc_guide', name: '向导', art: 'npc_guide',
    bLike: ['forest'], bDis: ['ocean'],
    nLike: ['npc_clothier', 'npc_zoologist'], nDis: ['npc_steampunker'], nHate: ['npc_painter'] },
  { id: 'npc_merchant', name: '商人', art: 'npc_merchant',
    bLike: ['forest'], bDis: ['desert'],
    nLike: ['npc_golfer', 'npc_nurse'], nDis: ['npc_tax_collector'], nHate: ['npc_angler'] },
  { id: 'npc_zoologist', name: '动物学家', art: 'npc_zoologist',
    bLike: ['forest'], bDis: ['desert'],
    nLove: ['npc_witch_doctor'], nLike: ['npc_golfer'], nDis: ['npc_angler'], nHate: ['npc_arms_dealer'] },
  { id: 'npc_golfer', name: '高尔夫球手', art: 'npc_golfer',
    bLike: ['forest'], bDis: ['cave'],
    nLove: ['npc_angler'], nLike: ['npc_painter', 'npc_zoologist'], nDis: ['npc_pirate'], nHate: ['npc_merchant'] },
  { id: 'npc_nurse', name: '护士', art: 'npc_nurse',
    bLike: ['hallow'], bDis: ['snow'],
    nLove: ['npc_arms_dealer'], nLike: ['npc_wizard', 'npc_party'], nDis: ['npc_dryad'], nHate: ['npc_zoologist'] },
  { id: 'npc_tavernkeep', name: '酒馆老板', art: 'npc_tavernkeep',
    bLike: ['hallow'], bDis: ['snow'],
    nLove: ['npc_demo'], nLike: ['npc_goblin'], nDis: ['npc_guide'], nHate: ['npc_dye_trader'] },
  { id: 'npc_party', name: '派对女孩', art: 'npc_party',
    bLike: ['hallow'], bDis: ['cave'],
    nLove: ['npc_wizard', 'npc_zoologist'], nLike: ['npc_stylist'], nDis: ['npc_merchant'], nHate: ['npc_tax_collector'] },
  { id: 'npc_wizard', name: '巫师', art: 'npc_wizard',
    bLike: ['hallow'], bDis: ['ocean'],
    nLove: ['npc_golfer'], nLike: ['npc_merchant'], nDis: ['npc_witch_doctor'], nHate: ['npc_cyborg'] },
  { id: 'npc_demo', name: '爆破专家', art: 'npc_demo',
    bLike: ['cave'], bDis: ['ocean'],
    nLove: ['npc_tavernkeep'], nLike: ['npc_mechanic'], nDis: ['npc_arms_dealer', 'npc_goblin'] },
  { id: 'npc_goblin', name: '哥布林工匠', art: 'npc_goblin',
    bLike: ['cave'], bDis: ['jungle'],
    nLove: ['npc_mechanic'], nLike: ['npc_dye_trader'], nDis: ['npc_clothier'], nHate: ['npc_stylist'] },
  { id: 'npc_clothier', name: '服装商', art: 'npc_clothier',
    bLike: ['cave'], bDis: ['hallow'],
    nLove: ['npc_truffle'], nLike: ['npc_tax_collector'], nDis: ['npc_nurse'], nHate: ['npc_mechanic'] },
  { id: 'npc_dye_trader', name: '染料商', art: 'npc_dye_trader',
    bLike: ['desert'], bDis: ['forest'],
    nLike: ['npc_arms_dealer', 'npc_painter'], nDis: ['npc_steampunker'], nHate: ['npc_pirate'] },
  { id: 'npc_arms_dealer', name: '军火商', art: 'npc_arms_dealer',
    bLike: ['desert'], bDis: ['snow'],
    nLove: ['npc_nurse'], nLike: ['npc_steampunker'], nDis: ['npc_golfer'], nHate: ['npc_demo'] },
  { id: 'npc_steampunker', name: '蒸汽朋克人', art: 'npc_steampunker',
    bLike: ['desert'], bDis: ['jungle'],
    nLove: ['npc_cyborg'], nLike: ['npc_painter'], nDis: ['npc_dryad', 'npc_wizard', 'npc_party'] },
  { id: 'npc_dryad', name: '树妖', art: 'npc_dryad',
    bLike: ['jungle'], bDis: ['desert'],
    nLike: ['npc_witch_doctor', 'npc_truffle'], nDis: ['npc_angler'], nHate: ['npc_golfer'] },
  { id: 'npc_painter', name: '油漆工', art: 'npc_painter',
    bLike: ['jungle'], bDis: ['forest'],
    nLove: ['npc_dryad'], nLike: ['npc_party'], nDis: ['npc_truffle', 'npc_cyborg'] },
  { id: 'npc_witch_doctor', name: '巫医', art: 'npc_witch_doctor',
    bLike: ['jungle'], bDis: ['hallow'],
    nLike: ['npc_dryad', 'npc_guide'], nDis: ['npc_nurse'], nHate: ['npc_truffle'] },
  { id: 'npc_stylist', name: '发型师', art: 'npc_stylist',
    bLike: ['ocean'], bDis: ['snow'],
    nLove: ['npc_dye_trader'], nLike: ['npc_pirate'], nDis: ['npc_tavernkeep'], nHate: ['npc_goblin'] },
  { id: 'npc_angler', name: '钓手', art: 'npc_angler',
    bLike: ['ocean'], bDis: ['desert'],
    nLike: ['npc_demo', 'npc_party', 'npc_tax_collector'], nHate: ['npc_tavernkeep'] },
  { id: 'npc_pirate', name: '海盗', art: 'npc_pirate',
    bLike: ['ocean'], bDis: ['cave'],
    nLove: ['npc_angler'], nLike: ['npc_tavernkeep'], nDis: ['npc_stylist'], nHate: ['npc_guide'] },
  { id: 'npc_mechanic', name: '机械师', art: 'npc_mechanic',
    bLike: ['snow'], bDis: ['cave'],
    nLove: ['npc_goblin'], nLike: ['npc_cyborg'], nDis: ['npc_arms_dealer'], nHate: ['npc_clothier'] },
  { id: 'npc_tax_collector', name: '税收官', art: 'npc_tax_collector',
    bLike: ['snow'], bDis: ['hallow'],
    nLove: ['npc_merchant'], nLike: ['npc_party'], nDis: ['npc_demo', 'npc_mechanic'], nHate: ['npc_santa'] },
  { id: 'npc_cyborg', name: '机器侠', art: 'npc_cyborg',
    bLike: ['snow'], bDis: ['jungle'],
    nLike: ['npc_steampunker', 'npc_pirate', 'npc_stylist'], nDis: ['npc_zoologist'], nHate: ['npc_wizard'] },
  { id: 'npc_santa', name: '圣诞老人', art: 'npc_santa', skip: true,
    bLove: ['snow'], bHate: ['desert'],
    nHate: ['npc_tax_collector'], note: '节日限定 NPC，平时不在世界中' },
  { id: 'npc_truffle', name: '松露人', art: 'npc_truffle', fix: 'mushroom',
    nLove: ['npc_guide'], nLike: ['npc_dryad'], nDis: ['npc_clothier'], nHate: ['npc_witch_doctor'],
    note: '只能住在发光蘑菇群落' },
  { id: 'npc_princess', name: '公主', art: 'npc_princess', skip: true,
    nLove: 'ALL', note: '喜爱所有 NPC，且被所有 NPC 喜爱，放哪都快乐' }
]

/* 晶塔可购阈值 */
const PYLON_MAX = 0.9   // 价格系数 ≤ 90% 时出售该群落晶塔
const PRICE_MIN = 0.75  // 购买价格下限 75%

/* 快乐等级（展示用） */
function moodOf (factor) {
  if (factor <= 0.88) return { t: '非常快乐', c: 'great' }
  if (factor <= 0.94) return { t: '快乐', c: 'good' }
  if (factor <= 1.0) return { t: '一般', c: 'ok' }
  if (factor <= 1.06) return { t: '不快乐', c: 'bad' }
  return { t: '非常不快乐', c: 'awful' }
}

module.exports = { BIOMES, BIOME_N, NPCS, PYLON_MAX, PRICE_MIN, moodOf }
