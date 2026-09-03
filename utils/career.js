// 职业养成逻辑层：进度计算 / 阶段状态 / 资料库筛选
const D = require('../data/career')
const store = require('./store')
const dex = require('./dex')

const byId = {}
D.CLASSES.forEach(c => { byId[c.id] = c })

/* 当前选中职业 */
function curCls () {
  return store.getCareer().cls || 'melee'
}

/* 职业信息 */
function clsInfo (id) {
  return byId[id] || byId.melee
}

/* 某职业的路线阶段（带状态）
   状态：done=已完成 current=进行中(第一个未完成) locked=未解锁 */
function stages (clsId) {
  const path = D.PATHS[clsId]
  if (!path) return null
  const done = store.getCareer().done || {}
  let firstUndone = -1
  return path.map((s, i) => {
    let status
    if (done[s.id]) status = 'done'
    else {
      if (firstUndone < 0) { firstUndone = i; status = 'current' }
      else status = 'locked'
    }
    return Object.assign({}, s, {
      no: i + 1,
      status,
      statusText: status === 'done' ? '✅ 已完成' : status === 'current' ? '🔥 进行中' : '🔒 未解锁',
      unlockHint: status === 'locked' ? '完成阶段 ' + i + ' 后解锁' : '',
      bossName: (dex.byId[s.boss] && dex.byId[s.boss].name) || '',
      bossArt: (dex.byId[s.boss] && dex.byId[s.boss].artId) || ''
    })
  })
}

/* 汇总进度：{doneCount, total, pct, current} */
function progress (clsId) {
  const path = D.PATHS[clsId]
  if (!path) return { doneCount: 0, total: 0, pct: 0, current: null, ready: false }
  const st = stages(clsId)
  const doneCount = st.filter(s => s.status === 'done').length
  const cur = st.find(s => s.status === 'current')
  return {
    doneCount,
    total: st.length,
    pct: Math.round(doneCount / st.length * 100),
    current: cur || null,
    ready: true
  }
}

/* 资料库文章列表（cat=class 的攻略）
   clsId 为空 = 全部职业；topic 为空 = 全部分类 */
function libArticles (clsId, topic) {
  return dex.strats
    .filter(s => s.cat === 'class')
    .filter(s => !clsId || s.cls === clsId)
    .filter(s => !topic || s.topic === topic)
    .map(s => ({
      id: s.id, title: s.title, summary: s.summary, time: s.time,
      isNew: !!s.isNew,
      clsName: clsInfo(s.cls).name,
      clsIcon: clsInfo(s.cls).icon,
      topicName: D.TOPIC_NAME[s.topic] || '指南',
      artId: s.cover || 'stone'
    }))
}

/* 最近更新（聚合页展示）：新文章优先，最多 n 条 */
function recentArticles (n) {
  return libArticles('', '')
    .sort((a, b) => (b.isNew - a.isNew))
    .slice(0, n || 4)
}

module.exports = { curCls, clsInfo, stages, progress, libArticles, recentArticles }
