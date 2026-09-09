// 从 zhdetail.json 生成 wiki 全量配方数据包（递归合成树版）
// 输出：pkg-recipe/data/recipes-wiki.js
//   zh:  en → 中文显示名（页面全名优先）
//   rec: en → 配方变体 [{ s: 工作台中文, i: [[槽内选项...]...] }]
//   ico: en → [safeId, 卷号]（精灵图在 pkg-cat-N/assets/）
//   dexArt: en → 精品图鉴 artId（精品独有物品的图标回退）
//   obt: en → 获取方式文本（精品 obtain / 图鉴 ob，截断）
const fs = require('fs')
const path = require('path')

const STAGE = path.join(__dirname, 'catalog-stage')
const zd = JSON.parse(fs.readFileSync(path.join(STAGE, 'zhdetail.json'), 'utf8'))
const zhLL = JSON.parse(fs.readFileSync(path.join(STAGE, 'zh.json'), 'utf8'))
const items = zd.items || {}
const byResult = zd.byResult || {}

// 图鉴卷数据：en → 中文名 / 精灵图 / 获得方式
const batchZh = {}, batchIco = {}, batchObt = {}
;[1, 2].forEach(v => {
  try {
    require('../pkg-cat-' + v + '/data/batch.js').forEach(x => {
      if (x.en && x.n && /[\u4e00-\u9fa5]/.test(x.n) && !batchZh[x.en]) batchZh[x.en] = x.n
      if (x.en && x.f && !batchIco[x.en]) batchIco[x.en] = [x.f, v]
      if (x.en && x.ob && !batchObt[x.en]) batchObt[x.en] = String(x.ob).slice(0, 70)
    })
  } catch (e) { /* 卷缺失时跳过 */ }
})

// 精品图鉴：en → 中文名 / artId / obtain
const dexZh = {}, dexArt = {}, dexObt = {}
try {
  require('../data/items.js').forEach(x => {
    if (x.en && x.name && /[\u4e00-\u9fa5]/.test(x.name) && !dexZh[x.en]) dexZh[x.en] = x.name
    if (x.en && x.art && !dexArt[x.en]) dexArt[x.en] = x.art
    if (x.en && x.obtain && !dexObt[x.en]) dexObt[x.en] = String(x.obtain).slice(0, 70)
  })
} catch (e) { /* 缺失时跳过 */ }

// 通配符槽选项翻译
const WILD = {
  'Any Stone Block': '任意石块', 'Any Wood': '任意木材', 'Any Iron Bar': '任意铁锭（铁/铅）',
  'Any Silver Bar': '任意银锭（银/钨）', 'Any Gold Bar': '任意金锭（金/铂）',
  'Any Copper Bar': '任意铜锭（铜/锡）', 'Any Cobalt Bar': '任意钴锭（钴/钯金）',
  'Any Mythril Bar': '任意秘银锭（秘银/山铜）', 'Any Adamantite Bar': '任意精金锭（精金/钛金）',
  'Any Evil Bar': '任意邪恶金属锭（魔金/猩红）', 'Any Bird': '任意鸟', 'Any Butterfly': '任意蝴蝶',
  'Any Snail': '任意蜗牛', 'Any Firefly': '任意萤火虫', 'Any Fruit': '任意水果', 'Any Pylon': '任意晶塔'
}

const STATION = {
  'Work Bench': '工作台', Furnace: '熔炉', Anvil: '铁砧', 'Mythril Anvil': '秘银砧',
  'Adamantite Forge': '精金熔炉', Hellforge: '地狱熔炉', 'Demon Altar': '恶魔祭坛',
  'Crimson Altar': '猩红祭坛', Altar: '祭坛', 'Heavy Work Bench': '重型工作台',
  'Heavy Assembler': '重型装配器', 'Book Case': '书架', 'Crystal Ball': '水晶球',
  Loom: '织布机', 'Cooking Pot': '烹饪锅', Keg: '酒桶', Sawmill: '锯木机',
  'Imbuing Station': '灌注站', 'Dye Vat': '染缸', DyeVat: '染缸',
  "Tinkerer's Workshop": '工匠作坊', 'Water Source': '水源', Sink: '水槽', Honey: '蜂蜜',
  'Ice Machine': '冰雪机', 'Living Loom': '生命织布机', 'Sky Mill': '天空磨坊',
  'Ancient Manipulator': '远古操纵机', 'Blend-o-matic': '搅拌机', 'Meat Grinder': '绞肉机',
  'Solidifier': '固化机', SteampunkerBoiler: '蒸汽锅炉', ByHand: '徒手', 'By Hand': '徒手',
  Shimmer: '微光', 'Lihzahrd Furnace': '蜥蜴熔炉', 'Sky Mill': '天空磨坊'
}
function zhName (en) {
  if (WILD[en]) return WILD[en]
  if (batchZh[en]) return batchZh[en]
  if (dexZh[en]) return dexZh[en]
  if (items[en] && /[\u4e00-\u9fa5]/.test(items[en].n)) return items[en].n
  return zhLL[en] || en
}

// 盔甲套装 → 部件（Cargo Recipes 只登记部件，套装总称页手动映射；部件名均为游戏内标准名）
const SET_PIECES = {
  'Cactus Armor': [['Cactus Helmet', '仙人掌头盔'], ['Cactus Breastplate', '仙人掌胸甲'], ['Cactus Leggings', '仙人掌护腿']],
  'Copper Armor': [['Copper Helmet', '铜头盔'], ['Copper Chainmail', '铜链甲'], ['Copper Greaves', '铜护腿']],
  'Iron Armor': [['Iron Helmet', '铁头盔'], ['Iron Chainmail', '铁链甲'], ['Iron Greaves', '铁护腿']],
  'Silver Armor': [['Silver Helmet', '银头盔'], ['Silver Chainmail', '银链甲'], ['Silver Greaves', '银护腿']],
  'Gold Armor': [['Gold Helmet', '金头盔'], ['Gold Chainmail', '金链甲'], ['Gold Greaves', '金护腿']],
  'Platinum Armor': [['Platinum Helmet', '铂金头盔'], ['Platinum Chainmail', '铂金链甲'], ['Platinum Greaves', '铂金护腿']],
  'Meteor Armor': [['Meteor Helmet', '流星头盔'], ['Meteor Suit', '流星战甲'], ['Meteor Leggings', '流星护腿']],
  'Jungle Armor': [['Jungle Helmet', '丛林头盔'], ['Jungle Shirt', '丛林衬衫'], ['Jungle Pants', '丛林护腿']],
  'Bee Armor': [['Bee Headgear', '蜜蜂头饰'], ['Bee Breastplate', '蜜蜂胸甲'], ['Bee Greaves', '蜜蜂护腿']],
  'Obsidian Armor': [['Obsidian Helm', '黑曜石头盔'], ['Obsidian Longcoat', '黑曜石长外套'], ['Obsidian Pants', '黑曜石护腿']],
  'Cobalt Armor': [['Cobalt Helmet', '钴头盔'], ['Cobalt Breastplate', '钴胸甲'], ['Cobalt Leggings', '钴护腿']],
  'Palladium Armor': [['Palladium Headgear', '钯金头饰'], ['Palladium Breastplate', '钯金胸甲'], ['Palladium Leggings', '钯金护腿']],
  'Orichalcum Armor': [['Orichalcum Headgear', '山铜头饰'], ['Orichalcum Breastplate', '山铜胸甲'], ['Orichalcum Leggings', '山铜护腿']],
  'Adamantite Armor': [['Adamantite Headgear', '精金头饰'], ['Adamantite Breastplate', '精金胸甲'], ['Adamantite Leggings', '精金护腿']],
  'Titanium Armor': [['Titanium Headgear', '钛金头饰'], ['Titanium Breastplate', '钛金胸甲'], ['Titanium Leggings', '钛金护腿']],
  'Forbidden Armor': [['Forbidden Mask', '禁戒面具'], ['Forbidden Robe', '禁戒长袍'], ['Forbidden Treads', '禁戒护胫']],
  'Shroomite Armor': [['Shroomite Headgear', '蘑菇矿头饰'], ['Shroomite Breastplate', '蘑菇矿胸甲'], ['Shroomite Leggings', '蘑菇矿护腿']],
  'Spectre Armor': [['Spectre Mask', '幽灵面具'], ['Spectre Robe', '幽灵长袍'], ['Spectre Pants', '幽灵护腿']]
}
// Cargo 表缺行的可合成物品补丁（配料经 zhName 翻译）
const REC_PATCH = {
  Hammush: [{ s: 'Mythril Anvil', i: [['Chlorophyte Bar'], ['Glowing Mushroom'], ['Mushroom Spear?']] }]
}
delete REC_PATCH.Hammush // 蘑菇锤配方待核，先不写死，避免引入错误

// 通配符槽 → 代表物品（图标/详情兜底用）
const WILD_REP = {
  'Any Iron Bar': 'Iron Bar', 'Any Silver Bar': 'Silver Bar', 'Any Gold Bar': 'Gold Bar',
  'Any Copper Bar': 'Copper Bar', 'Any Cobalt Bar': 'Cobalt Bar', 'Any Mythril Bar': 'Mythril Bar',
  'Any Adamantite Bar': 'Adamantite Bar', 'Any Evil Bar': 'Demonite Bar', 'Any Doom Bar': 'Demonite Bar',
  'Any Wood': 'Wood', 'Any Stone Block': 'Stone Block', 'Any Torch': 'Torch'
}

// ---- 组装 ----
const zh = {}, rec = {}, ico = {}, dexArtOut = {}, obt = {}
Object.keys(byResult).forEach(en => {
  zh[en] = zhName(en)
  // 槽内保留 EN 名（递归键），显示时经 zh 映射翻译
  rec[en] = byResult[en].map(rc => ({
    s: STATION[rc.st] || rc.st || '徒手',
    i: (rc.i || []).map(slot => [...new Set(slot)])
  }))
})
// 全部出现的 EN 名（配方结果 + 槽选项）→ 图标与获取方式
const allEn = new Set()
Object.keys(rec).forEach(en => {
  allEn.add(en)
  rec[en].forEach(rc => (rc.i || []).forEach(slot => slot.forEach(x => allEn.add(x))))
})
allEn.forEach(en => {
  const name = zh[en] || zhName(en)
  if (name && !zh[en]) zh[en] = name
  if (batchIco[en]) ico[en] = batchIco[en]
  if (dexArt[en]) dexArtOut[en] = dexArt[en]
  const o = batchObt[en] || dexObt[en]
  if (o) obt[en] = o
})

// 套装条目注入：套装为根，部件为槽（部件在 Cargo 有自身配方 → 递归树可展开）
Object.keys(SET_PIECES).forEach(setEn => {
  if (rec[setEn]) return // Cargo 已有则不覆盖
  const pieces = SET_PIECES[setEn].filter(p => ico[p[0]] || dexArtOut[p[0]] || rec[p[0]])
  if (pieces.length) {
    rec[setEn] = [{ s: '部件合成', i: pieces.map(p => [p[0]]) }]
    // 部件官方中文名（langlinks 可能指向套装页导致污染，此处用标准译名覆盖）
    pieces.forEach(p => { zh[p[0]] = p[1] })
  }
})
// 通配符槽图标别名（代表物品的图标/精品 artId）
Object.keys(WILD_REP).forEach(w => {
  const rep = WILD_REP[w]
  if (ico[rep]) ico[w] = ico[rep]
  else if (dexArtOut[rep]) dexArtOut[w] = dexArtOut[rep]
})

const data = { zh, rec, ico, dexArt: dexArtOut, obt }
const dest = path.join(__dirname, '..', 'pkg-recipe', 'data', 'recipes-wiki.js')
fs.mkdirSync(path.dirname(dest), { recursive: true })
fs.writeFileSync(dest, '// wiki 全量配方索引（自动生成，勿手改）\nmodule.exports = ' + JSON.stringify(data) + '\n')
console.log('生成:', Object.keys(rec).length, '配方 |', Object.keys(ico).length, '图标 |', Object.keys(obt).length, '获取 |', Math.round(fs.statSync(dest).size / 1024) + 'KB')
