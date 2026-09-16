// 检查星怒/狂星之怒图标资源现状
const fs = require('fs')
const s = fs.readFileSync('data/items.js', 'utf8')
console.log('art:"starfury" 出现次数:', (s.match(/art:"starfury"/g) || []).length)
const vols = []
for (const [vol, f] of [['pkg-cat-1', 'data/data-v1.js'], ['pkg-cat-2', 'data/data-v2.js'], ['pkg-cat-3', 'data/data-v3.js']]) {
  vols.push(...require('../' + vol + '/' + f).map(x => ({ ...x, _vol: vol })))
}
const sw = vols.find(x => x.en === 'Star Wrath')
console.log('全量 StarWrath:', sw ? sw._vol + ' f=' + sw.f : '无')
console.log('pkg-cat-1/assets/StarWrath.png:', fs.existsSync('pkg-cat-1/assets/StarWrath.png'))
console.log('assets/sprites/starfury.png:', fs.existsSync('assets/sprites/starfury.png'))
const sm = require('../data/spritemap.js')
console.log('spritemap starfury:', sm['starfury'], '| star_wrath:', sm['star_wrath'])
const arts = require('../utils/arts.js')
console.log('像素画 starfury:', !!arts.ARTS['starfury'], '| star_wrath:', !!arts.ARTS['star_wrath'])
if (arts.ARTS['starfury']) console.log('starfury 像素画:', JSON.stringify(arts.ARTS['starfury']).slice(0, 400))
