// NPC 规划器逻辑层：价格系数计算 + 最优分配（贪心配对）
const D = require('../../data/npcplan')

const byId = {}
D.NPCS.forEach(n => { byId[n.id] = n })

const MAX_G = 2 // 每个群落最多 2 组（4 人，两组相距 25 格以上避免拥挤）

/* 单个 NPC 在指定群落 + 邻居组合下的价格系数与明细
   neighbors: [npcId]（25 格内的其他 NPC，本规划器按每组 2 人无拥挤） */
function evaluate (npc, biomeId, neighbors) {
  let f = 1
  const why = []
  // 独居奖励：每组 2 人（1 个邻居）≤ 2，享 ×0.95
  f *= 0.95
  why.push({ t: '独居奖励（25格内≤2名邻居）', v: '-5%' })
  // 群落偏好
  const bt = biomeType(npc, biomeId)
  if (bt === 'love') { f *= 0.88; why.push({ t: '喜爱群落 ' + D.BIOME_N[biomeId], v: '-12%' }) }
  else if (bt === 'like') { f *= 0.94; why.push({ t: '喜欢群落 ' + D.BIOME_N[biomeId], v: '-6%' }) }
  else if (bt === 'dis') { f *= 1.06; why.push({ t: '不喜欢群落 ' + D.BIOME_N[biomeId], v: '+6%', bad: true }) }
  else if (bt === 'hate') { f *= 1.12; why.push({ t: '讨厌群落 ' + D.BIOME_N[biomeId], v: '+12%', bad: true }) }
  // 邻居偏好（每个独立乘区）
  neighbors.forEach(nid => {
    const n = byId[nid]
    if (!n) return
    const name = n.name
    if (npc.nLove === 'ALL') { f *= 0.88; why.push({ t: '喜爱邻居 ' + name, v: '-12%' }); return }
    if (matchN(npc.nLove, nid)) { f *= 0.88; why.push({ t: '喜爱邻居 ' + name, v: '-12%' }) }
    else if (matchN(npc.nLike, nid)) { f *= 0.94; why.push({ t: '喜欢邻居 ' + name, v: '-6%' }) }
    else if (matchN(npc.nDis, nid)) { f *= 1.06; why.push({ t: '不喜欢邻居 ' + name, v: '+6%', bad: true }) }
    else if (matchN(npc.nHate, nid)) { f *= 1.12; why.push({ t: '讨厌邻居 ' + name, v: '+12%', bad: true }) }
    // 公主：被所有 NPC 喜欢
    if (nid === 'npc_princess') { f *= 0.88; why.push({ t: '公主邻居（人人喜爱）', v: '-12%' }) }
  })
  if (f < D.PRICE_MIN) f = D.PRICE_MIN
  return { factor: Math.round(f * 1000) / 1000, pct: Math.round(f * 100), why }
}

function biomeType (npc, biomeId) {
  if (npc.fix === biomeId) return 'love' // 松露人住蘑菇群落视为喜爱
  if (has(npc.bLove, biomeId)) return 'love'
  if (has(npc.bLike, biomeId)) return 'like'
  if (has(npc.bDis, biomeId)) return 'dis'
  if (has(npc.bHate, biomeId)) return 'hate'
  return ''
}
function matchN (list, nid) {
  if (!list || list === 'ALL') return false
  return list.indexOf(nid) >= 0
}
function has (list, v) { return list && list.indexOf(v) >= 0 }

/* ---------- 最优分配（贪心配对） ----------
   可规划 NPC 两两配对入住群落（每组 2 人享独居奖励）；
   贪心：每轮枚举所有（群落 × 剩余 NPC 对），选双人价格系数之和最小者锁定；
   松露人固定蘑菇群落单独成组（独居，无邻居）。 */
function planBest () {
  // 可自由规划的 NPC（排除固定/跳过）
  const free = D.NPCS.filter(n => !n.fix && !n.skip).map(n => n.id)
  const used = new Set()
  const groups = []

  // 每个群落最多 2 组（4 人，两组相距 25 格以上即可避免拥挤）
  const biomeGroups = {}
  D.BIOMES.forEach(b => { biomeGroups[b.id] = 0 })
  const MAX_G = 2

  // 松露人：固定蘑菇群落（独居无邻居最优）
  const truffle = byId.npc_truffle
  if (truffle) {
    groups.push(makeGroup('mushroom', [truffle.id]))
    biomeGroups.mushroom++
    used.add(truffle.id)
  }

  while (used.size < free.length + (truffle ? 1 : 0)) {
    // 剩余未分配
    const rest = free.filter(id => !used.has(id))
    if (!rest.length) break
    // 单人兜底（奇数时最后剩 1 人）
    if (rest.length === 1) {
      const best = bestSolo(rest[0], biomeGroups)
      groups.push(makeGroup(best.biome, rest))
      used.add(rest[0])
      biomeGroups[best.biome]++
      break
    }
    // 枚举所有群落 × NPC 对
    let best = null
    for (const b of D.BIOMES) {
      if (biomeGroups[b.id] >= MAX_G) continue
      for (let i = 0; i < rest.length; i++) {
        for (let j = i + 1; j < rest.length; j++) {
          const a = rest[i], c = rest[j]
          const ra = evaluate(byId[a], b.id, [c])
          const rc = evaluate(byId[c], b.id, [a])
          const score = ra.factor + rc.factor
          if (!best || score < best.score) best = { biome: b.id, pair: [a, c], score }
        }
      }
    }
    if (!best) break
    groups.push(makeGroup(best.biome, best.pair))
    best.pair.forEach(id => used.add(id))
    biomeGroups[best.biome]++
  }

  return decorate(groups)
}

/* 单人最优群落（奇数兜底） */
function bestSolo (npcId, biomeGroups) {
  let best = { biome: 'forest', score: 99 }
  for (const b of D.BIOMES) {
    if (biomeGroups[b.id] >= MAX_G) continue
    const r = evaluate(byId[npcId], b.id, [])
    if (r.factor < best.score) best = { biome: b.id, score: r.factor }
  }
  return best
}

/* 构造展示组 */
function makeGroup (biomeId, npcIds) {
  const members = npcIds.map(id => {
    const others = npcIds.filter(x => x !== id)
    const r = evaluate(byId[id], biomeId, others)
    const npc = byId[id]
    return {
      id,
      name: npc.name,
      art: npc.art || '',
      emoji: npc.emoji || '',
      factor: r.factor,
      pct: r.pct,
      why: r.why,
      pylon: r.factor <= D.PYLON_MAX,
      mood: D.moodOf(r.factor)
    }
  })
  return {
    biome: biomeId,
    biomeName: D.BIOME_N[biomeId],
    biomeIcon: (D.BIOMES.find(b => b.id === biomeId) || {}).icon || '🏠',
    members,
    pylon: members.some(m => m.pylon) // 任一成员 ≤90% 即可买晶塔
  }
}

/* 汇总统计 */
function decorate (groups) {
  let all = []
  groups.forEach(g => { all = all.concat(g.members) })
  const avg = all.length ? all.reduce((s, m) => s + m.factor, 0) / all.length : 1
  const pylonCount = D.BIOMES.filter(b => {
    const g = groups.find(x => x.biome === b.id)
    return g && g.pylon
  }).length
  // 同群落可能有 2 组，key 加序号保证唯一（避免 wx:key 重复警告）
  const seen = {}
  groups.forEach(g => {
    seen[g.biome] = (seen[g.biome] || 0) + 1
    g.key = g.biome + '-' + seen[g.biome]
  })
  return {
    groups: groups.sort((a, b) => D.BIOMES.findIndex(x => x.id === a.biome) - D.BIOMES.findIndex(x => x.id === b.biome)),
    avgPct: Math.round(avg * 100),
    pylonCount,
    pylonTotal: D.BIOMES.length
  }
}

/* 速查表：全部 NPC 偏好（含圣诞/公主，排除旅商/骷髅商）
   注意：WXML 不支持 .join() 方法调用，这里直接输出展示字符串 */
function prefTable () {
  const J = a => (a && a.length) ? a.join('、') : '—'
  const N = ids => (ids || []).map(id => (byId[id] || {}).name || id)
  return D.NPCS.map(n => ({
    id: n.id,
    name: n.name,
    art: n.art || '',
    emoji: n.emoji || '',
    fix: n.fix || '',
    note: n.note || '',
    bLove: J((n.bLove || []).map(b => D.BIOME_N[b])),
    bLike: J((n.bLike || []).map(b => D.BIOME_N[b])),
    bDis: J((n.bDis || []).map(b => D.BIOME_N[b])),
    bHate: J((n.bHate || []).map(b => D.BIOME_N[b])),
    nLove: n.nLove === 'ALL' ? '所有NPC' : J(N(n.nLove)),
    nLike: J(N(n.nLike)),
    nDis: J(N(n.nDis)),
    nHate: J(N(n.nHate))
  }))
}

/* 指定群落下的推荐配对（用于群落详情页展示） */
function biomeGroups (plan, biomeId) {
  return plan.groups.filter(g => g.biome === biomeId)
}

module.exports = { evaluate, planBest, prefTable, biomeGroups, byId, biomeType }
