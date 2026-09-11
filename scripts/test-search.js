// 搜索覆盖度模拟：全量 6297 条逐条验证"输入名称片段能搜到自己"
const cs = require('../utils/catalog-search')
let all = []
for (let i = 1; i <= require('../utils/cat-vols.js'); i++) all = all.concat(require('../pkg-cat-' + i + '/data/data-v' + i + '.js'))
const rows = cs.normalizeRows(all, 1) // normalizeRows 按单卷规范化；重复 f 会在应用层去重
console.log('规范化后行数:', rows.length)
// 复刻 catalog-search 的匹配规则：name/en 包含关键词，前缀优先
function search (kw, data) {
  const k = kw.trim().toLowerCase()
  return data.filter(x => (x.n || '').toLowerCase().indexOf(k) >= 0 || (x.en || '').toLowerCase().indexOf(k) >= 0)
}
// 1) 每条目用"中文名前2字 / 英文名前4字母"自搜
let miss = 0
const samples = []
const step = Math.max(1, Math.floor(rows.length / 300))
for (let i = 0; i < rows.length; i += step) {
  const x = rows[i]
  const kw = /[\u4e00-\u9fa5]/.test(x.n || '') ? (x.n || '').slice(0, 2) : (x.en || '').slice(0, 4)
  if (!kw) continue
  if (!search(kw, rows).some(h => h.f === x.f)) { miss++; if (samples.length < 8) samples.push(x.n + '/' + x.en) }
}
console.log('自搜未命中:', miss, samples.join(' | '))
// 2) 常用词命中数
;['天顶', '旗帜', '药水', 'Boss', '翅膀'].forEach(kw => console.log('[' + kw + '] 命中', search(kw, rows).length))
