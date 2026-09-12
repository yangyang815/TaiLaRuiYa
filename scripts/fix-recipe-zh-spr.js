// 修补配方索引与 recipes-wiki 的中文名/图标：
// 1) 用当前目录数据（6297 件，含 GameText 官方译名）优先解析
// 2) 非目录物品回退 GameText（internal→中文名）
// 3) 同步增补 recipes-wiki.js 的 zh/ico（合成详情页/材料名共用）
const fs = require('fs')
const path = require('path')
const catSearch = require('../utils/catalog-search')
const catGroups = require('../utils/cat-groups')

// 目录行（按卷规范化，vol 必须正确才能拼出 sprite 路径）
const cats = []
for (let i = 1; i <= require('../utils/cat-vols.js'); i++) {
  catSearch.normalizeRows(require('../pkg-cat-' + i + '/data/data-v' + i + '.js'), i).forEach(r => cats.push(r))
}
const byEn = {}
cats.forEach(r => { if (!byEn[r.en]) byEn[r.en] = r })

// GameText 官方译名（internal→zh）
let GT = {}
try { GT = JSON.parse(fs.readFileSync(path.join(__dirname, 'catalog-stage/gametext-zh.json'), 'utf8')).ItemName || {} } catch (e) {}
// 英文名 → internal
let raw = []
try { raw = require('./catalog-stage/raw.json') } catch (e) {}
const en2in = {}
raw.forEach(r => { if (r.en && r.internal && r.internal !== 'None' && !en2in[r.en]) en2in[r.en] = r.internal })
const guessInternal = en => en.replace(/[^A-Za-z0-9]/g, '')
function pngVol (en) { const g = guessInternal(en); for (const v of [1, 2, 3]) { if (fs.existsSync(path.join(__dirname, '../pkg-cat-' + v + '/assets/' + g + '.png'))) return [g, v] } return null }

const cjk = s => /[\u4e00-\u9fa5]/.test(s || '')
const CAT_LABEL = { weapon: '武器', tool: '工具', armor: '盔甲', accessory: '饰品', potion: '药水', material: '材料', mount: '坐骑', pet: '宠物', other: '其他' }
function lab (cat) { return CAT_LABEL[cat] || (catGroups.GROUPS.find(g => g.k === cat) || {}).n || cat || '其他' }

// ---------- 1) 增补 recipes-wiki.js 的 zh / ico ----------
const wp = path.join(__dirname, '../pkg-recipe/data/recipes-wiki.js')
const wiki = require('../pkg-recipe/data/recipes-wiki.js')
let zhFixed = 0, icoFixed = 0
Object.keys(wiki.rec).forEach(en => {
  const c = byEn[en]
  if (c) {
    if (!cjk(wiki.zh[en]) && cjk(c.n)) { wiki.zh[en] = c.n; zhFixed++ }
    if (!wiki.ico[en] && c.f) { wiki.ico[en] = [c.f, c.vol]; icoFixed++ }
  } else {
    const iv = en2in[en] || guessInternal(en)
    if (!cjk(wiki.zh[en]) && cjk(GT[iv] || '')) { wiki.zh[en] = GT[iv]; zhFixed++ }
    if (!wiki.ico[en]) { const pv = pngVol(en); if (pv) { wiki.ico[en] = pv; icoFixed++ } }
  }
})
fs.writeFileSync(wp, '// 自动生成：wiki全量配方库（zh/ico 已按当前目录增补）\nmodule.exports=' + JSON.stringify(wiki) + ';')
console.log('recipes-wiki 增补: 中文名', zhFixed, '处 | 图标', icoFixed, '处')

// ---------- 2) 重建 recipe-index.js（目录优先解析名称/图标） ----------
const R = require('../data/recipes')
const dex = require('../utils/dex')
const rows = []
R.RECIPES.forEach(r => {
  const e = dex.byId[r.result]
  const cat = (e && e.raw.cat) || 'other'
  rows.push({ n: r.name || (e && e.name) || r.result, en: (e && e.en) || '', cat: cat, cl: lab(cat), st: R.STATIONS[r.station] || r.station || '', spr: '', art: r.art || (e && e.artId) || 'stone', src: 'b', id: r.result })
})
const have = new Set(rows.map(r => r.n))
let merged = 0, stillEn = 0, noSpr = 0
const enSamples = []
Object.keys(wiki.rec).forEach(en => {
  const c = byEn[en]
  const iv = en2in[en] || guessInternal(en)
  const name = (c && cjk(c.n) && c.n) || (cjk(wiki.zh[en]) && wiki.zh[en]) || (cjk(GT[iv] || '') && GT[iv]) || en
  if (!cjk(name)) { stillEn++; if (enSamples.length < 10) enSamples.push(en) }
  const ic = (c && c.f) ? [c.f, c.vol] : (wiki.ico && wiki.ico[en]) || pngVol(en)
  const spr = ic ? '/pkg-cat-' + ic[1] + '/assets/' + ic[0] + '.png' : ''
  if (!spr) noSpr++
  const name2 = name
  if (have.has(name2)) return
  have.add(name2)
  const catK = c ? catGroups.macroOf(c.c).k : 'other'
  rows.push({ n: name2, en: en, cat: catK, cl: lab(catK), st: (wiki.rec[en][0] && wiki.rec[en][0].s) || '', spr: spr, art: '', src: 'w' })
  merged++
})
fs.writeFileSync(path.join(__dirname, '../pkg-recipe/data/recipe-index.js'),
  '// 自动生成：合成页全量配方索引（勿手改）——内置+wiki全部可合成结果，名称/图标已按当前目录解析\nmodule.exports=' + JSON.stringify(rows) + ';')
console.log('recipe-index 重建:', rows.length, '条（wiki新增', merged, '）| 仍英文:', stillEn, '| 无图标:', noSpr)
if (enSamples.length) console.log('英文残留:', enSamples.join(', '))
