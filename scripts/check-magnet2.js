const gt = require('../scripts/catalog-stage/gametext-zh.json')
const N = gt.ItemName || {}
// 反查大自然的恩赐
Object.keys(N).forEach(k => { if (/恩赐|大自然的/.test(N[k])) console.log('GT:', k, '=', N[k]) })
// 奥术花/魔力斗篷 GT
;['ArcaneFlower','ManaCloak','StarCloak','ManaRegenerationBand'].forEach(k => console.log('GT:', k, '=', N[k] || '?'))

const zd = require('../scripts/catalog-stage/zhdetail.json')
console.log("Arcane Flower 配方:", JSON.stringify(zd.byResult['Arcane Flower']))
console.log("Mana Cloak 配方:", JSON.stringify(zd.byResult['Mana Cloak']))
console.log("Nature's Gift 配方:", JSON.stringify(zd.byResult["Nature's Gift"]))
// 哪些配方用 Magnet Flower 当材料
Object.entries(zd.byResult).forEach(([k, v]) => {
  const s = JSON.stringify(v)
  if (/Magnet Flower/.test(s)) console.log('用磁花的配方:', k, s.slice(0, 160))
})

// 全量目录三条现状
let all = []
for (const [vol, f] of [['pkg-cat-1', 'data-v1'], ['pkg-cat-2', 'data-v2'], ['pkg-cat-3', 'data-v3']]) {
  all.push(...require('../' + vol + '/data/' + f + '.js').map(x => ({ ...x, _vol: vol })))
}
;['ManaFlower', 'MagnetFlower', 'MasterNinjaGear', 'NatureGift', 'NaturesGift', 'TigerClimbingGear', 'BlackBelt', 'Tabi'].forEach(f => {
  const x = all.find(y => y.f === f)
  if (x) console.log('全量', x._vol, '|', x.f, '|', x.n, '| ob=', JSON.stringify(x.ob).slice(0, 100))
})

// 精品是否有 大自然的恩赐/猛虎攀爬装备/分趾厚底袜/黑腰带
const items = require('../data/items.js')
;["Nature's Gift", 'Tiger Climbing Gear', 'Tabi', 'Black Belt', 'Arcane Flower'].forEach(en => {
  const x = items.find(y => y.en === en)
  console.log('精品[' + en + ']:', x ? x.id + ' | ' + x.name + ' | ' + JSON.stringify(x.obtain).slice(0, 90) : '无')
})
