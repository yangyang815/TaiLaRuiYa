// 生成合成页全量配方索引：pkg-recipe/data/recipe-index.js
// 行：{n:名, en:英文名, cat:分类k, cl:分类中文, st:工作台名, spr:真图路径, art:像素图id, src:b内置/w全量, id:内置结果id}
const fs = require('fs')
const path = require('path')
const R = require('../data/recipes')
const dex = require('../utils/dex')
const catSearch = require('../utils/catalog-search')
const catGroups = require('../utils/cat-groups')
const wiki = require('../pkg-recipe/data/recipes-wiki.js')

let all = []
for (let i = 1; i <= require('../utils/cat-vols.js'); i++) all = all.concat(require('../pkg-cat-' + i + '/data/data-v' + i + '.js'))
const cats = catSearch.normalizeRows(all, 1)
const catByEn = {}
cats.forEach(r => { if (!catByEn[r.en]) catByEn[r.en] = r.c })

const CAT_LABEL = { weapon: '武器', tool: '工具', armor: '盔甲', accessory: '饰品', potion: '药水', material: '材料', mount: '坐骑', pet: '宠物', other: '其他' }
const lab = cat => CAT_LABEL[cat] || (catGroups.GROUPS.find(g => g.k === cat) || {}).n || cat || '其他'

const rows = []
// 内置配方（132 条，保留像素图标与配方 id）
R.RECIPES.forEach(r => {
  const e = dex.byId[r.result]
  const cat = (e && e.raw.cat) || 'other'
  rows.push({ n: r.name || (e && e.name) || r.result, en: (e && e.en) || '', cat: cat, cl: lab(cat), st: R.STATIONS[r.station] || r.station || '', spr: '', art: r.art || (e && e.artId) || 'stone', src: 'b', id: r.result })
})
// wiki 全量配方（跳过内置已覆盖同名结果）
const have = new Set(rows.map(r => r.n))
let merged = 0
Object.keys(wiki.rec).forEach(en => {
  const name = (wiki.zh && wiki.zh[en]) || en
  if (have.has(name)) return
  have.add(name)
  const c = catByEn[en] || ''
  const g = c ? catGroups.macroOf(c) : { k: 'other' }
  const ic = wiki.ico && wiki.ico[en]
  rows.push({ n: name, en: en, cat: g.k, cl: lab(g.k), st: (wiki.rec[en][0] && wiki.rec[en][0].s) || '', spr: ic ? '/pkg-cat-' + ic[1] + '/assets/' + ic[0] + '.png' : '', art: '', src: 'w' })
  merged++
})
fs.writeFileSync(path.join(__dirname, '../pkg-recipe/data/recipe-index.js'),
  '// 自动生成：合成页全量配方索引（勿手改）——内置+wiki全部可合成结果\nmodule.exports=' + JSON.stringify(rows) + ';')
console.log('配方索引生成:', rows.length, '条（内置', rows.length - merged, '+ wiki新增', merged, '）')
console.log('文件大小:', Math.round(fs.statSync(path.join(__dirname, '../pkg-recipe/data/recipe-index.js')).size / 1024) + 'KB')
// 分类覆盖检查
const cnt = {}
rows.forEach(r => { cnt[r.cl] = (cnt[r.cl] || 0) + 1 })
console.log('分类分布:', JSON.stringify(Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 16).map(e => e[0] + ':' + e[1])))
