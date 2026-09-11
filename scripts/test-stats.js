// 模拟详情页 stats 构建
const dex = require('../utils/dex')
function buildStats (e) {
  const r = e.raw
  return r.stats || (e.type !== 'item' ? (e.type === 'boss' && r.hp_e != null ? [['HP', String(r.hp)], ['专家HP', String(r.hp_e)], ['大师HP', String(r.hp_m)], ['伤害', String(r.dmg)], ['防御', String(r.def)], ['钱币', r.coins || '-']] : [['HP', String(r.hp)], ['伤害', String(r.dmg)], ['防御', String(r.def)], ['钱币', r.coins || '-']]) : dex.itemBaseStats(r))
}
;['king_slime', 'moon_lord', 'twins', 'mechdusa', 'hornet', 'slime_blue'].forEach(id => {
  const e = dex.byId[id]
  if (!e) { console.log(id, '→ 不存在'); return }
  const st = buildStats(e)
  console.log(e.name + '(' + e.type + '):', JSON.stringify(st).slice(0, 220))
})
