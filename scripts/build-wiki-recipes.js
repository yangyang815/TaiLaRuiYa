// 从 zhdetail.json（zh wiki 配方全表）生成合成页 wiki 配方数据包
// 输出：pkg-cat-2/data/recipes-wiki.js —— [{ n: 中文名, en: 英文名, v: [{ s: 工作台中文, i: [配料中文名...] }] }]
const fs = require('fs')
const path = require('path')

const STAGE = path.join(__dirname, 'catalog-stage')
const zd = JSON.parse(fs.readFileSync(path.join(STAGE, 'zhdetail.json'), 'utf8'))
const zh = JSON.parse(fs.readFileSync(path.join(STAGE, 'zh.json'), 'utf8'))
const items = zd.items || {}
const byResult = zd.byResult || {}

// 工作站中文名（与 build-catalog 同款）
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
  'Solidifier': '固化机', SteampunkerBoiler: '蒸汽锅炉', ByHand: '徒手', 'By Hand': '徒手'
}
// 通配符/别名翻译
const WILD = {
  'Any Stone Block': '任意石块', 'Any Wood': '任意木材', 'Any Iron Bar': '任意铁锭（铁/铅）',
  'Any Silver Bar': '任意银锭（银/钨）', 'Any Gold Bar': '任意金锭（金/铂）',
  'Any Copper Bar': '任意铜锭（铜/锡）', 'Any Cobalt Bar': '任意钴锭（钴/钯金）',
  'Any Mythril Bar': '任意秘银锭（秘银/山铜）', 'Any Adamantite Bar': '任意精金锭（精金/钛金）',
  'Any Evil Bar': '任意邪恶金属锭（魔金/猩红）', 'Any Doom Bar': '任意魔矿锭',
  'Any Bird': '任意鸟', 'Any Butterfly': '任意蝴蝶', 'Any Snail': '任意蜗牛',
  'Any Firefly': '任意萤火虫', 'Any Fruit': '任意水果', 'Any Pylon': '任意晶塔'
}
let batchZh = null
let dexZh = null
function zName (en) {
  if (WILD[en]) return WILD[en]
  if (!batchZh) {
    batchZh = {}
    ;[1, 2].forEach(v => {
      try {
        require('../pkg-cat-' + v + '/data/batch.js').forEach(x => {
          if (x.en && x.n && !batchZh[x.en]) batchZh[x.en] = x.n
        })
      } catch (e) { /* 卷数据缺失时跳过 */ }
    })
  }
  if (batchZh[en]) return batchZh[en]
  if (!dexZh) {
    dexZh = {}
    try {
      require('../data/items.js').forEach(x => { if (x.en && x.name && !dexZh[x.en]) dexZh[x.en] = x.name })
    } catch (e) { /* 精品库缺失时跳过 */ }
  }
  if (dexZh[en]) return dexZh[en]
  if (items[en] && items[en].n) return items[en].n
  return zh[en] || en
}

const out = []
const seenName = {}
Object.keys(byResult).forEach(resEn => {
  const n = zName(resEn)
  const variants = []
  const seenVar = {}
  byResult[resEn].forEach(rc => {
    const st = STATION[rc.st] || rc.st || '徒手'
    // rc.i = 材料槽列表，每槽内为可替代选项（用 / 连接展示）
    const ings = (rc.i || []).map(slot => [...new Set((slot || []).map(zName))].join('/'))
    const key = st + '|' + ings.join('¦')
    if (seenVar[key]) return
    seenVar[key] = 1
    variants.push({ s: st, i: ings })
  })
  if (!variants.length) return
  // 同名 zh 结果（家具变体等）独立保留，重名靠 en 字段区分
  const entry = { n, en: resEn, v: variants }
  seenName[n] = entry
  out.push(entry)
})

// 紧凑 JSON（键名短化已由结构保证），一行一条避免超长行
const body = JSON.stringify(out)
  .replace(/\{"n":/g, '\n{"n":')
const js = '// wiki 全量配方（zh wiki Recipes 表生成，勿手改）——["n" 中文名, "en" 英文名, "v" 变体(工作台 s + 配料 i)]\nmodule.exports = ' + body + '\n'
const dest = path.join(__dirname, '..', 'pkg-cat-2', 'data', 'recipes-wiki.js')
fs.writeFileSync(dest, js)
const kb = Math.round(fs.statSync(dest).size / 1024)
console.log('生成 recipes-wiki.js:', out.length, '个结果 |', kb, 'KB')
console.log('样例 手机:', JSON.stringify((seenName['手机'] || {}).v && { en: seenName['手机'].en, v0: { s: seenName['手机'].v[0].s, ings: seenName['手机'].v[0].i.length } }))
