// 审计：物品获得方式中提到、但图鉴搜不到的敌怪
const items = require('../data/items.js')
const monsters = require('../data/monsters.js')
const bosses = require('../data/bosses.js')
const dex = require('../utils/dex.js')

const known = new Set()
monsters.forEach(m => { known.add(m.name); if (m.en) known.add(m.en) })
bosses.forEach(b => { known.add(b.name); if (b.en) known.add(b.en) })

// 从 obtain/use 里按已知敌怪名匹配剩余片段（匹配不到的连续中文片段即候选缺失敌怪）
const refCount = {}
const refItems = {}
const allText = []
items.forEach(it => {
  const txt = (it.obtain || '') + ' ' + (it.use || '') + ' ' + (it.desc || '')
  allText.push({ id: it.id, name: it.name, txt })
})
// 已知敌怪被引用统计
for (const n of known) {
  const re = new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const hits = allText.filter(x => re.test(x.txt))
  if (hits.length) { refCount[n] = hits.length; refItems[n] = hits.slice(0, 3).map(x => x.name).join('、') }
}
// 找 "由 X 掉落/X N% 掉落" 模式里不属于已知敌怪的主语
const candidates = {}
allText.forEach(x => {
  const re = /(?:由|来自)\s*([\u4e00-\u9fa5A-Za-z·0-9]{2,12}?)\s*(?:掉落|掉出|开出)/g
  let m
  while ((m = re.exec(x.txt))) {
    let name = m[1].trim()
    // 去掉前缀修饰（如 地牢敌怪骷髅李→骷髅李）
    let matched = known.has(name)
    if (!matched) {
      for (const n of known) { if (name.endsWith(n) || name.startsWith(n)) { matched = true; break } }
    }
    if (!matched && !/各类|任意|世界|地牢敌怪|海洋敌怪|沙漠敌怪|宝箱|匣子|敌怪|事件|怪物/.test(name)) {
      candidates[name] = candidates[name] || []
      if (candidates[name].length < 3) candidates[name].push(x.name)
    }
  }
})
console.log('===== 提及但搜不到的候选敌怪 =====')
Object.entries(candidates).forEach(([n, its]) => console.log(n, '←', its.join('、')))
console.log('===== 已知敌怪引用数 Top20 =====')
Object.entries(refCount).sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(([n, c]) => console.log(n, c))
console.log('===== 引用为 0 的敌怪（收录但从未被材料页引用）=====')
let zero = 0
for (const n of known) { if (!refCount[n] && /^[\u4e00-\u9fa5]/.test(n)) zero++ }
console.log('零引用敌怪名数:', zero)
