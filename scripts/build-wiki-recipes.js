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
      if (x.en && x.n && !batchZh[x.en]) batchZh[x.en] = x.n
      if (x.en && x.f && !batchIco[x.en]) batchIco[x.en] = [x.f, v]
      if (x.en && x.ob && !batchObt[x.en]) batchObt[x.en] = String(x.ob).slice(0, 70)
    })
  } catch (e) { /* 卷缺失时跳过 */ }
})

// 精品图鉴：en → 中文名 / artId / obtain
const dexZh = {}, dexArt = {}, dexObt = {}
try {
  require('../data/items.js').forEach(x => {
    if (x.en && x.name && !dexZh[x.en]) dexZh[x.en] = x.name
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

function zhName (en) {
  if (WILD[en]) return WILD[en]
  if (batchZh[en]) return batchZh[en]
  if (dexZh[en]) return dexZh[en]
  if (items[en] && items[en].n) return items[en].n
  return zhLL[en] || en
}

// ---- 组装 ----
const zh = {}, rec = {}, ico = {}, dexArtOut = {}, obt = {}
Object.keys(byResult).forEach(en => {
  zh[en] = zhName(en)
  // 槽内保留 EN 名（递归键），显示时经 zh 映射翻译
  rec[en] = byResult[en].map(rc => ({
    s: rc.st || '徒手',
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

const data = { zh, rec, ico, dexArt: dexArtOut, obt }
const dest = path.join(__dirname, '..', 'pkg-recipe', 'data', 'recipes-wiki.js')
fs.mkdirSync(path.dirname(dest), { recursive: true })
fs.writeFileSync(dest, '// wiki 全量配方索引（自动生成，勿手改）\nmodule.exports = ' + JSON.stringify(data) + '\n')
console.log('生成:', Object.keys(rec).length, '配方 |', Object.keys(ico).length, '图标 |', Object.keys(obt).length, '获取 |', Math.round(fs.statSync(dest).size / 1024) + 'KB')
