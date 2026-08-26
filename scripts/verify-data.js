// 临时脚本：验证数据完整性（语法 / 精灵图命中 / 搜索）
const path = require('path')
process.chdir(path.join(__dirname, '..'))

// 1. 语法验证
const items = require('../data/items')
const monsters = require('../data/monsters')
const bosses = require('../data/bosses')
const seeds = require('../data/seeds')
const strats = require('../data/strategies')
const SPRITES = require('../data/spritemap')
const dex = require('../utils/dex')
console.log('[OK] 语法加载: items=' + items.length + ' monsters=' + monsters.length + ' bosses=' + bosses.length + ' seeds=' + seeds.length)

// 2. id 唯一性
const ids = new Set()
let dup = 0
;[...items, ...monsters, ...bosses, ...seeds].forEach(e => {
  if (ids.has(e.id)) { dup++; console.log('  [DUP]', e.id) }
  ids.add(e.id)
})
console.log(dup === 0 ? '[OK] id 无重复' : '[FAIL] 重复 id: ' + dup)

// 3. 精灵图命中（有 art 且文件存在）
let miss = 0
const missList = []
;[...items, ...monsters, ...bosses, ...seeds].forEach(e => {
  if (!e.art) return
  if (!SPRITES[e.art]) { miss++; missList.push(e.id + '->' + e.art) }
})
if (miss === 0) console.log('[OK] 精灵图 100% 命中')
else { console.log('[MISS] ' + miss + ' 条未命中:'); missList.forEach(x => console.log('  ', x)) }

// 4. 新增条目抽查：精灵图在磁盘上存在
const fs = require('fs')
let diskMiss = 0
;[...bosses.filter(b => b.tier === 'event'), ...monsters.filter(m => m.tier === 'event')].forEach(e => {
  const f = 'assets/sprites/' + e.art + '.' + (SPRITES[e.art] || 'png')
  if (!fs.existsSync(f)) { diskMiss++; console.log('  [DISK-MISS]', f) }
})
console.log(diskMiss === 0 ? '[OK] 事件条目精灵图磁盘文件全部存在' : '[FAIL] 磁盘缺失 ' + diskMiss)

// 5. 搜索验证
const q = (kw) => {
  const r = dex.search(kw, 30)
  const names = r.slice(0, 5).map(x => x.name)
  console.log('搜索「' + kw + '」→ ' + r.length + ' 条: ' + names.join(' / '))
}
q('南瓜王')
q('贝茜')
q('火星')
q('雪女王')
q('feidie')
q('hp')  // 拼音首字母：海螺
q('荷兰人')
q('蝙蝠权杖')

// 6. dex 统计
const all = dex.ALL || []
console.log('[OK] dex.ALL 总条目: ' + all.length)

// 7. boss 分类筛选
const cats = dex.CATS || null
console.log('[OK] boss 分类: ' + (cats && cats.boss ? cats.boss.map(c => c.n).join(',') : 'N/A'))
console.log('[OK] mon 分类: ' + (cats && cats.mon ? cats.mon.map(c => c.n).join(',') : 'N/A'))
