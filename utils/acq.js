// 获取方式聚合：合成（recipes 自动）+ 掉落（bosses/monsters 反查）+ 手写（acquisition.js）
// 页面：pages/acq/acq
const R = require('../data/recipes')
const bosses = require('../data/bosses')
const monsters = require('../data/monsters')
const items = require('../data/items')
const MANUAL = require('../data/acquisition').DATA

// 获取方式类型元数据
const TYPES = {
  craft: { n: '合成', icon: '🧱', order: 1 },
  drop: { n: '掉落', icon: '💀', order: 2 },
  buy: { n: '购买', icon: '💰', order: 3 },
  fish: { n: '钓鱼', icon: '🎣', order: 4 },
  chest: { n: '开宝箱', icon: '📦', order: 5 },
  gather: { n: '采集', icon: '🌳', order: 6 },
  special: { n: '特殊', icon: '🏆', order: 7 }
}

// 物品索引
const IDX = {}
items.forEach(i => { IDX[i.id] = i })

// 掉落反查索引（懒加载）
let dropIndex = null
function buildDropIndex () {
  if (dropIndex) return dropIndex
  dropIndex = {}
  const add = (itemId, src) => {
    if (!itemId) return
    ;(dropIndex[itemId] = dropIndex[itemId] || []).push(src)
  }
  bosses.forEach(b => (b.drops || []).forEach(d =>
    add(d.id, { from: b.name, rate: d.rate || '', monId: b.id, isBoss: true })))
  monsters.forEach(m => (m.drops || []).forEach(d =>
    add(d.id, { from: m.name, rate: d.rate || '', monId: m.id, isBoss: false })))
  return dropIndex
}

// 数量文本
function qty (n) { return n >= 1000 ? n.toLocaleString() : String(n) }

/**
 * 取物品的全部获取方式（规范化）
 * 返回 [{ t, icon, name, desc, extra... }]，按 TYPES.order 排序
 */
function get (id) {
  const out = []
  // 1. 合成（自动：配方表）
  const r = R.byId[id]
  if (r) {
    out.push({
      t: 'craft',
      station: R.STATIONS[r.station] || r.station,
      count: r.count,
      mats: (r.ingredients || []).map(m => ({
        id: m.id,
        name: (IDX[m.id] && IDX[m.id].name) || (R.EXTRA[m.id] && R.EXTRA[m.id].name) || m.id,
        artId: (IDX[m.id] && IDX[m.id].art) || (R.EXTRA[m.id] && R.EXTRA[m.id].art) || '',
        count: m.count
      }))
    })
  }
  // 2. 掉落（自动：Boss/敌怪反查）
  const drops = buildDropIndex()[id]
  if (drops && drops.length) {
    out.push({
      t: 'drop',
      sources: drops.map(d => ({
        from: d.from, rate: d.rate, monId: d.monId, isBoss: d.isBoss
      }))
    })
  }
  // 3. 手写数据（购买/钓鱼/开宝箱/采集/特殊/补充掉落/补充合成）
  const manual = MANUAL[id] || []
  manual.forEach(m => {
    if (m.t === 'drop') {
      // 补充掉落：合并进自动掉落卡
      const existed = out.find(x => x.t === 'drop')
      if (existed) existed.sources.push({ from: m.from, rate: m.rate || '', monId: '', isBoss: !!m.boss })
      else out.push({ t: 'drop', sources: [{ from: m.from, rate: m.rate || '', monId: '', isBoss: !!m.boss }] })
    } else if (m.t === 'craft') {
      out.push({
        t: 'craft',
        station: R.STATIONS[m.st] || m.st || '',
        count: m.count || 1,
        mats: (m.mats || []).map(x => ({
          id: x.id,
          name: (IDX[x.id] && IDX[x.id].name) || (R.EXTRA[x.id] && R.EXTRA[x.id].name) || x.id,
          artId: (IDX[x.id] && IDX[x.id].art) || (R.EXTRA[x.id] && R.EXTRA[x.id].art) || '',
          count: x.count
        })),
        desc: m.d || ''
      })
    } else {
      out.push({ t: m.t, npc: m.npc || '', price: m.price || '', where: m.where || '', d: m.d || '' })
    }
  })
  out.sort((a, b) => TYPES[a.t].order - TYPES[b.t].order)
  return out
}

// 是否有结构化获取数据
function has (id) {
  return !!(R.byId[id] || buildDropIndex()[id] || (MANUAL[id] && MANUAL[id].length))
}

/**
 * 一句话摘要（搜索结果/列表用）
 * 如 "合成（秘银砧）" / "掉落：月亮领主" / "购买：军火商"
 */
function summary (id) {
  const list = get(id)
  if (!list.length) return ''
  const m = list[0]
  const meta = TYPES[m.t]
  if (m.t === 'craft') return '合成（' + m.station + '）'
  if (m.t === 'drop') {
    const n = m.sources.length
    // 多来源时优先展示普通怪（Boss 之外更常见的来源）
    const common = m.sources.find(s => !s.isBoss) || m.sources[0]
    if (n > 1) return '掉落：' + (common.from || '') + ' 等 ' + n + ' 处来源'
    return '掉落：' + (common.from || '')
  }
  if (m.t === 'buy') return '购买：' + m.npc
  if (m.t === 'fish') return '钓鱼：' + (m.where || m.d || '')
  if (m.t === 'chest') return '开宝箱：' + (m.where || m.d || '')
  if (m.t === 'gather') return '采集：' + (m.d || '')
  return meta.n + (m.d ? '：' + m.d : '')
}

// 物品基础信息（页头用）
function itemInfo (id) {
  return IDX[id] || null
}

module.exports = { TYPES, get, has, summary, itemInfo, qty }
