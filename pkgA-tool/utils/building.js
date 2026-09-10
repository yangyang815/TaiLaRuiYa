// 建造指南逻辑层：案例列表 / 案例详情 / 搜索 / 打卡进度
const D = require('../../data/building')

// 主页案例卡片
function list (doneSet) {
  return D.CASES.map(c => ({
    id: c.id,
    name: c.name,
    style: c.style,
    stageN: D.STAGE_N[c.stage],
    stars: D.DIFF_N[c.diff],
    artId: 'bld_' + c.id + '_' + c.thumb,
    pic: c.pic || '',
    video: c.video || '',
    done: doneSet ? doneSet.has(c.id) : false
  }))
}

// 案例详情（含图解步骤）
function getCase (id, doneSet) {
  const c = D.CASES.find(x => x.id === id)
  if (!c) return null
  const steps = (c.steps || []).map((s, i) => ({
    no: i + 1,
    t: s.t,
    d: s.d,
    tpl: s.tpl,
    artId: 'bld_' + c.id + '_' + s.tpl
  }))
  return {
    id: c.id,
    name: c.name,
    style: c.style,
    stageN: D.STAGE_N[c.stage],
    stars: D.DIFF_N[c.diff],
    diff: c.diff,
    size: c.size,
    npc: c.npc,
    artId: 'bld_' + c.id + '_' + c.thumb,
    pic: c.pic || '',
    video: c.video || '',
    author: c.author || '',
    mats: c.mats || [],
    steps,
    layout: c.layout,
    done: doneSet ? doneSet.has(c.id) : false
  }
}

// 搜索：案例（名称/风格/标签）+ 技巧标题 + 基础标题
function search (kw) {
  const k = (kw || '').trim().toLowerCase()
  if (!k) return { cases: [], tips: [], basics: [] }
  const has = s => (s || '').toLowerCase().indexOf(k) >= 0
  const cases = D.CASES
    .filter(c => has(c.name) || has(c.style) || has(c.tags) || has(D.STAGE_N[c.stage]))
    .map(c => ({
      id: c.id, name: c.name, style: c.style, stageN: D.STAGE_N[c.stage],
      stars: D.DIFF_N[c.diff], artId: 'bld_' + c.id + '_' + c.thumb,
      pic: c.pic || ''
    }))
  const tips = D.TIPS.filter(t => has(t.title) || has(t.points.join(',')))
    .map(t => ({ id: t.id, icon: t.icon, title: t.title }))
  const basics = D.BASICS.filter(b => has(b.title) || has(b.sub) || has(b.points.join(',')))
    .map(b => ({ id: b.id, icon: b.icon, title: b.title }))
  return { cases, tips, basics }
}

module.exports = { list, getCase, search }
