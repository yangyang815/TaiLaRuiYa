const gt = require('../scripts/catalog-stage/gametext-zh.json')
const N = gt.ItemName || {}
const zd = require('../scripts/catalog-stage/zhdetail.json')
const keys = ['ManaFlower', 'NatureGift', 'CelestialMagnet', 'MasterNinjaGear', 'TigerClimbingGear', 'BlackBelt', 'Tabi', 'MagnetFlower', 'MagnetSphere']
keys.forEach(k => console.log('GT:', k, '=', N[k] || '?'))

const tryKeys = ['Mana Flower', "Nature's Gift", 'Celestial Magnet', 'Master Ninja Gear', 'Tiger Climbing Gear', 'Black Belt', 'Tabi', 'Magnet Flower']
tryKeys.forEach(k => {
  if (zd.byResult[k] !== undefined) console.log('配方 [' + k + ']:', JSON.stringify(zd.byResult[k]))
})

// 精品条目正确读取
const items = require('../data/items.js')
;['magnet_flower', 'mana_flower', 'master_ninja_gear'].forEach(id => {
  const x = items.find(y => y.id === id)
  if (x) console.log('##', x.id, '|', x.name, '| obtain:', JSON.stringify(x.obtain), '| use:', JSON.stringify(x.use), '| desc:', JSON.stringify(x.desc))
})

// 饰品推荐里怎么写磁花（career/strategies/guide）
const fs = require('fs')
for (const f of ['data/career.js', 'data/strategies.js', 'pkgB-guide/data/guide.js']) {
  const s = fs.readFileSync(f, 'utf8')
  let p = 0
  while ((p = s.indexOf('磁花', p + 1)) > 0) {
    console.log('[' + f + '] ...' + s.slice(Math.max(0, p - 80), p + 60).replace(/\n/g, ' ') + '...')
  }
}

// recipes.js 相关
const R = require('../data/recipes.js')
const arr = Array.isArray(R) ? R : (R.recipes || [])
;['magnet_flower', 'mana_flower', 'master_ninja_gear', 'celestial_cuffs'].forEach(r => {
  const recs = arr.filter(x => x.result === r)
  recs.forEach(x => console.log('recipes:', r, '<-', JSON.stringify(x.ingredients)))
})
