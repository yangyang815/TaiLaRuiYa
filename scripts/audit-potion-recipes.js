// 药水配方专项审计：items.js(cat:potion) 的 obtain vs 官方配方表 zhdetail.byResult
const fs = require('fs')
const path = require('path')
const STAGE = path.join(__dirname, 'catalog-stage')
const readJSON = n => JSON.parse(fs.readFileSync(path.join(STAGE, n), 'utf8'))

const items = require('../data/items.js')
const gt = readJSON('gametext-zh.json')
const GTN = gt.ItemName || {}
let nm2in = {}
try {
  const s = fs.readFileSync(path.join(STAGE, 'iteminfo-zh.txt'), 'utf8')
  const i1 = s.indexOf('[=====['), i2 = s.indexOf(']=====')
  const blob = JSON.parse(s.slice(i1 + 7, i2))
  Object.values(blob).forEach(it => { if (it && it.name && it.internalName && !nm2in[it.name]) nm2in[it.name] = it.internalName })
} catch (e) { console.log('iteminfo 解析失败', e.message) }
try { readJSON('raw.json').forEach(x => { if (x.en && x.internal && !nm2in[x.en]) nm2in[x.en] = x.internal }) } catch (e) {}
let volsEn = {}
for (const [vol, f] of [['pkg-cat-1', 'data/data-v1.js'], ['pkg-cat-2', 'data/data-v2.js'], ['pkg-cat-3', 'data/data-v3.js']]) {
  try { require('../' + vol + '/' + f).forEach(x => { if (x.en && !volsEn[x.en]) volsEn[x.en] = x.n }) } catch (e) {}
}
const WILD = { 'Any Iron Bar': '任意铁锭（铁/铅）', 'Any Silver Bar': '任意银锭（银/钨）', 'Any Gold Bar': '任意金锭（金/铂）', 'Any Copper Bar': '任意铜锭（铜/锡）', 'Any Cobalt Bar': '任意钴锭（钴/钯金）', 'Any Mythril Bar': '任意秘银锭（秘银/山铜）', 'Any Adamantite Bar': '任意精金锭（精金/钛金）', 'Any Evil Bar': '任意邪恶金属锭' }
const zName = en => WILD[en] || (nm2in[en] && GTN[nm2in[en]]) || volsEn[en] || en

const zd = readJSON('zhdetail.json')
const STATION_ZH = { 'Placed Bottle': '摆放的瓶子', 'Alchemy Table': '炼药台', 'Crystal Ball': '水晶球', 'Imbuing Station': '灌注站', 'Keg': '酒桶' }
const stZh = st => STATION_ZH[st] || (nm2in[st] && GTN[nm2in[st]]) || st

// 解析 obtain 的合成段：取出"摆放的瓶子："之后、"；"之前的成分串
function parseObtain (ob) {
  const seg = ob.split('；')[0]
  const m = seg.match(/(?:摆放的瓶子|炼药台|水晶球)：(.+)/)
  if (!m) return null
  const parts = m[1].split('+').map(x => x.trim().replace(/\s*\(合成材料\)\s*$/, ''))
  // 第一个可能是合成站前缀已剥离
  return parts
}

const problems = []
let noRecipe = 0, checked = 0
items.filter(x => x.cat === 'potion').forEach(it => {
  const rec = zd.byResult[it.en]
  if (!rec || !rec.length) { noRecipe++; problems.push('[无官方配方] ' + it.name + '(' + it.en + ') obtain=' + it.obtain); return }
  checked++
  const obParts = parseObtain(it.obtain || '')
  if (!obParts) { problems.push('[格式异常] ' + it.name + ' obtain=' + it.obtain); return }
  // 官方配方集合（第一个配方即可；多配方时任一匹配成分即可，宽松比对：成分并集）
  const offIng = new Set()
  let offStation = null
  rec.forEach(rc => {
    if (rc.st && !offStation) offStation = stZh(rc.st)
    rc.i.forEach(slot => slot.forEach(ing => offIng.add(zName(ing))))
  })
  // 比对 1：obtain 中列出的成分必须都能在官方成分集中找到（除"瓶装水"官方为 Bottled Water）
  obParts.forEach(p => {
    const clean = p.replace(/×\d+/g, '').replace(/（[^）]*）/g, '')
    const hit = [...offIng].some(o => o.includes(clean) || clean.includes(o))
    if (!hit && clean !== '瓶装水' && clean !== '玻璃瓶' && clean !== '花' && clean !== '水叶') {
      problems.push('[成分存疑] ' + it.name + '：obtain 写 "' + p + '"，官方成分只有 ' + [...offIng].join('/'))
    }
  })
  // 比对 2：官方成分是否都出现在 obtain（缺失成分）
  offIng.forEach(o => {
    const hit = obParts.some(p => p.includes(o) || o.includes(p.replace(/×\d+/g, '').replace(/（[^）]*）/g, '')))
    if (!hit && o !== '瓶装水') {
      problems.push('[官方成分缺失] ' + it.name + '：官方需要 "' + o + '"，obtain 未提及 | obtain=' + it.obtain)
    }
  })
  // 比对 3：合成站
  if (offStation && !it.obtain.includes(offStation) && !it.obtain.includes('放置的瓶子') && !(offStation === '摆放的瓶子' && it.obtain.includes('放置的瓶子'))) {
    problems.push('[合成站] ' + it.name + '：官方 ' + offStation + '，obtain=' + it.obtain.slice(0, 50))
  }
})
console.log('药水总数:', items.filter(x => x.cat === 'potion').length, '| 有官方配方:', checked, '| 无配方:', noRecipe, '| 问题:', problems.length)
problems.forEach((p, i) => console.log((i + 1) + '. ' + p))
fs.writeFileSync(path.join(__dirname, 'potion-recipe-report.json'), JSON.stringify(problems, null, 2))
