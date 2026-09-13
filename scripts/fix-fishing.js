// 任务鱼清单重建：对齐官方 41 条
const fs = require('fs')
const cs = require('../utils/catalog-search')
let all = []
for (let i = 1; i <= require('../utils/cat-vols.js'); i++) all = all.concat(require('../pkg-cat-' + i + '/data/data-v' + i + '.js'))
const rows = cs.normalizeRows(all, 1)
const zhOf = en => { const r = rows.find(x => x.en === en); return r ? r.n : null }

let f = require('../data/fishing.js')
let Q = f.QUEST_FISH
const byEn = {}
Q.forEach(q => { byEn[q.en] = q })

// 1) 原位修正错误条目
function fix (en, patch) {
  const q = byEn[en]
  if (!q) { console.log('MISS:', en); return }
  Object.assign(q, patch)
}
fix('Damselfish', { en: 'Angelfish', name: zhOf('Angelfish') || '天使鱼', note: '漂浮岛/地表水域（需先击败任一前置Boss）' })
fix('Demonic Hellfish', { biome: 'cavern', note: '洞穴层及以下纯净水域（不在地狱！）' })
fix('Derpfish', { biome: 'jungle', time: 'any', note: '地表丛林水域（困难模式）' })
fix('Dynamite Fish', { biome: 'forest', note: '地表纯净水域' })
fix('Eyefish', { en: 'Harpyfish', name: zhOf('Harpyfish') || '鸟妖鱼', biome: 'sky', note: '漂浮岛/地表水域' })
fix('Fallen Starfish', { biome: 'sky', time: 'any', note: '漂浮岛/地表水域' })
fix('Fishron', { note: '冰雪群系地下及以下水域（困难模式）' })
fix('Fox Fish', { en: 'The Fish of Cthulhu', name: zhOf('The Fish of Cthulhu') || '克苏鲁之鱼', note: '漂浮岛/地表水域' })
fix('Hungerfish', { biome: 'cavern', note: '洞穴层及以下纯净水域（困难模式）' })
fix('Mirage Fish', { biome: 'hallowed', note: '神圣之地地下水域（困难模式）' })
fix('Mutant Flish', { en: 'Mutant Flinxfin', name: zhOf('Mutant Flinxfin') || '变异小雪怪鳍鱼', biome: 'tundra', note: '冰雪群系地下及以下水域' })
fix('Penumbra Fish', { en: 'Pengfish', name: zhOf('Pengfish') || '企鹅鱼', biome: 'snow', time: 'any', note: '雪原地表/漂浮岛水域' })
fix('Royal Goldfish', { en: 'Golden Carp', name: zhOf('Golden Carp') || '黄金鲤', weather: 'any', note: '任意水域' })
fix('Sharkfin', { en: 'Zombie Fish', name: zhOf('Zombie Fish') || '僵尸鱼', biome: 'forest', note: '地表森林/纯净水域' })
fix('Vulture Fish', { en: 'Scarab Fish', name: zhOf('Scarab Fish') || '圣甲虫鱼', note: '沙漠水域' })
fix('Fish (quest)', { en: "Cap'n Tunabeard", name: zhOf("Cap'n Tunabeard") || '金枪鱼船长', biome: 'ocean', note: '海洋水域（困难模式）' })
fix('Wyvernkin', { en: 'Wyverntail', name: zhOf('Wyverntail') || '飞龙尾', note: '漂浮岛天空湖（困难模式）' })

// 2) 补缺失的 6 条
const have = new Set(Q.map(q => q.en))
const addDefs = [
  { en: 'Bunnyfish', biome: 'forest', note: '地表森林/纯净水域' },
  { en: 'Bonefish', biome: 'cavern', note: '洞穴层及以下纯净水域' },
  { en: 'Guide Voodoo Fish', biome: 'cavern', note: '洞穴层及以下纯净水域' },
  { en: 'Clownfish', biome: 'ocean', note: '海洋水域' },
  { en: 'Scorpio Fish', biome: 'desert', note: '沙漠水域' },
  { en: 'Infected Scabbardfish', biome: 'corrupt', note: '腐化之地任意水域' }
]
addDefs.forEach(d => {
  if (have.has(d.en)) return
  Q.push({ id: 'q_' + d.en.toLowerCase().replace(/[^a-z]+/g, '_').replace(/_+$/, ''), name: zhOf(d.en) || d.en, en: d.en, biome: d.biome, time: 'any', weather: 'any', reward: '', note: d.note })
})

// 3) 补充困难模式标注
;['Cursedfish', 'Ichorfish', 'Unicorn Fish', 'Pixiefish'].forEach(en => {
  const q = byEn[en]
  if (q && !/困难模式/.test(q.note)) q.note += '（困难模式）'
})

fs.writeFileSync('data/fishing.js', 'module.exports=' + JSON.stringify(f, null, 1))
console.log('任务鱼数:', Q.length, '/ 41')
