// 临时脚本：扫描数据中的汉字，输出 pinyin-mini 表缺失的字
const items = require('../data/items')
const monsters = require('../data/monsters')
const bosses = require('../data/bosses')
const seeds = require('../data/seeds')
const strats = require('../data/strategies')
const { py } = require('../utils/pinyin-mini')

const texts = []
;[...items, ...monsters, ...bosses, ...seeds].forEach(e => {
  texts.push(e.name || '')
  if (e.drops) e.drops.forEach(d => texts.push(d.name || ''))
  if (e.obtain) texts.push(e.obtain)
})
strats.forEach(s => texts.push(s.title || ''))

const miss = new Set()
for (const t of texts) {
  for (const ch of t) {
    if (/[\u4e00-\u9fff]/.test(ch)) {
      const r = py(ch)
      if (r.full === ch.toLowerCase()) miss.add(ch) // 未命中（原样返回）
    }
  }
}
console.log('缺失汉字: ' + [...miss].join(''))
console.log('数量: ' + miss.size)
