// 重名消歧：多件套/新套装按部件或材质命名，同步 recipes-wiki
const fs = require('fs')
const path = require('path')
const idxPath = path.join(__dirname, '../pkg-recipe/data/recipe-index.js')
const idx = require('../pkg-recipe/data/recipe-index.js')
const NAME = {
  'Aquarium Candelabra': '水族馆烛台',
  'Aquarium Candle': '水族馆蜡烛',
  'Aquarium Door': '水族馆门',
  'Duskware Candelabra': '月盘烛台',
  'Duskware Candle': '月盘蜡烛',
  'Duskware Door': '月盘门',
  'Desert Chest': '沙漠箱',
  'Dragon Mask': '龙盔甲面具',
  'Dragon Breastplate': '龙盔甲胸甲',
  'Dragon Greaves': '龙盔甲护腿',
  'Monokuma Head': '黑白熊头',
  'Monokuma Body': '黑白熊身体',
  'Monokuma Legs': '黑白熊腿',
  'Spectral Headgear': '灵能头饰',
  'Spectral Armor': '灵能盔甲',
  'Spectral Subligar': '灵能护腿',
  'Titan Helmet': '泰坦头盔',
  'Titan Mail': '泰坦胸甲',
  'Titan Leggings': '泰坦护腿',
  'Granite Block': '花岗岩块',
  'Marble Block': '大理石块',
  'Spider Wall': '蜘蛛墙'
}
let n = 0
idx.forEach(r => {
  const zh = NAME[r.en]
  if (zh && r.n !== zh) { r.n = zh; n++ }
})
fs.writeFileSync(idxPath, '// 自动生成：合成页全量配方索引（勿手改）——内置+wiki全部可合成结果，名称/图标已按当前目录解析\nmodule.exports=' + JSON.stringify(idx) + ';')

// 同步 recipes-wiki zh
const wp = path.join(__dirname, '../pkg-recipe/data/recipes-wiki.js')
const wiki = require('../pkg-recipe/data/recipes-wiki.js')
let w = 0
Object.keys(NAME).forEach(en => {
  if (wiki.rec[en] && wiki.zh[en] !== NAME[en]) { wiki.zh[en] = NAME[en]; w++ }
})
fs.writeFileSync(wp, '// 自动生成：wiki全量配方库（zh/ico 已按当前目录增补）\nmodule.exports=' + JSON.stringify(wiki) + ';')
console.log('消歧重命名:', n, '| recipes-wiki 同步:', w)

// 复核
const cnt = {}
idx.forEach(r => { cnt[r.n] = (cnt[r.n] || 0) + 1 })
const dups = Object.entries(cnt).filter(e => e[1] > 1)
console.log('剩余重名:', dups.length, dups.map(e => e[0] + 'x' + e[1]).join(', '))
const cjk = s2 => /[\u4e00-\u9fa5]/.test(s2 || '')
console.log('英文残留:', idx.filter(r => !cjk(r.n)).map(r => r.en).join(', '))
