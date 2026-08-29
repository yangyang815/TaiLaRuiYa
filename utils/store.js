// 本地存储封装：收藏 / 笔记 / 设置 / 评论 / 冒险等级
const K = {
  fav: 'terr_favs',       // [{id, type}]
  notes: 'terr_notes',    // [{id, ts, title, content}]
  theme: 'terr_theme',
  ver: 'terr_ver',
  hist: 'terr_hist',      // 搜索历史
  cmts: 'terr_cmts',      // {pageId: [{name, avatar, ts, text}]}
  stats: 'terr_stats',    // {opens, firstTs}
  profile: 'terr_profile', // {avatar, nick}
  recent: 'terr_recent',  // 最近浏览 [{id, type, ts}]
  boss: 'terr_boss',      // Boss 击败记录 {bossId: ts}
  checks: 'terr_checks',  // 攻略清单打勾 {bossId: {itemId: 1}}
  gachv: 'terr_gachv',    // 泰拉成就完成标记 {achvId: ts}
  fish: 'terr_fish',      // 钓鱼图鉴收集标记 [fishId]
  flags: 'terr_flags'     // 行为标志 {themeSwitched, versionSwitched, craftUsed}
}

function get (key, def) {
  try {
    const v = wx.getStorageSync(key)
    return v === '' || v === undefined || v === null ? def : v
  } catch (e) { return def }
}
function set (key, val) {
  try { wx.setStorageSync(key, val) } catch (e) { }
}

/* ---------- 收藏 ---------- */
function getFavs () { return get(K.fav, []) }
function isFav (id) { return getFavs().some(f => f.id === id) }
function toggleFav (id, type) {
  const favs = getFavs()
  const idx = favs.findIndex(f => f.id === id)
  let added
  if (idx >= 0) { favs.splice(idx, 1); added = false }
  else { favs.unshift({ id, type, ts: Date.now() }); added = true }
  set(K.fav, favs)
  return added
}

/* ---------- 笔记 ---------- */
function getNotes () {
  // 兜底修复：过滤脏数据、补齐缺失的时间戳
  return get(K.notes, [])
    .filter(n => n && n.id && (n.title || n.content))
    .map(n => ({ ...n, ts: n.ts || Date.now() }))
}
function saveNote (note) {
  const notes = getNotes()
  if (note.id) {
    const i = notes.findIndex(n => n.id === note.id)
    // 合并保留原记录字段（ts 等），避免编辑后丢失时间
    if (i >= 0) notes[i] = Object.assign({}, notes[i], note)
  } else {
    note.id = 'n' + Date.now()
    note.ts = Date.now()
    notes.unshift(note)
  }
  set(K.notes, notes)
}
function delNote (id) {
  set(K.notes, getNotes().filter(n => n.id !== id))
}

/* ---------- 设置 ---------- */
function getTheme () { return get(K.theme, 'dark') }
function setTheme (t) { set(K.theme, t) }
function getVersion () { return get(K.ver, '1.4.4') }
function setVersion (v) { set(K.ver, v) }

/* ---------- 最近浏览 ---------- */
function getRecents () {
  return get(K.recent, []).filter(r => r && r.id)
}
function pushRecent (id, type) {
  if (!id) return
  let list = getRecents().filter(r => r.id !== id)
  list.unshift({ id, type: type || 'item', ts: Date.now() })
  set(K.recent, list.slice(0, 30))
}

/* ---------- 搜索历史 ---------- */
function getHist () { return get(K.hist, []) }
function pushHist (kw) {
  kw = (kw || '').trim()
  if (!kw) return
  let h = getHist().filter(x => x !== kw)
  h.unshift(kw)
  set(K.hist, h.slice(0, 10))
}
function clearHist () { set(K.hist, []) }

/* ---------- 评论（本地社区） ---------- */
function getCmts (pageId, seed) {
  const all = get(K.cmts, {})
  if (!all[pageId] && seed && seed.length) {
    all[pageId] = seed
    set(K.cmts, all)
  }
  return all[pageId] || []
}
function addCmt (pageId, cmt) {
  const all = get(K.cmts, {})
  all[pageId] = all[pageId] || []
  all[pageId].unshift(cmt)
  set(K.cmts, all)
}
function delCmt (pageId, ts) {
  const all = get(K.cmts, {})
  if (all[pageId]) {
    all[pageId] = all[pageId].filter(c => c.ts !== ts)
    set(K.cmts, all)
  }
}

/* ---------- 用户资料 ---------- */
function getProfile () {
  return get(K.profile, { avatar: 'ava_knight', nick: '无名冒险家' })
}
function setProfile (p) {
  set(K.profile, Object.assign(getProfile(), p))
}

/* ---------- Boss 击败追踪 ---------- */
function getDefeated () {
  return get(K.boss, {}) // { bossId: ts }
}
function isDefeated (id) {
  return !!getDefeated()[id]
}
function toggleDefeated (id) {
  const all = getDefeated()
  const added = !all[id]
  if (added) all[id] = Date.now()
  else delete all[id]
  set(K.boss, all)
  return added
}

/* ---------- 攻略清单打勾 ---------- */
function getChecks () {
  return get(K.checks, {}) // {bossId: {itemId: 1}}
}
function getBossChecks (bossId) {
  return getChecks()[bossId] || {}
}
function toggleCheck (bossId, itemId) {
  const all = getChecks()
  const m = all[bossId] || {}
  const added = !m[itemId]
  if (added) m[itemId] = 1
  else delete m[itemId]
  all[bossId] = m
  set(K.checks, all)
  return added
}

/* ---------- 泰拉成就（游戏成就手动打勾） ---------- */
function getGameAchv () {
  return get(K.gachv, {}) // {achvId: ts}
}
function isGameAchvDone (id) {
  return !!getGameAchv()[id]
}
function toggleGameAchv (id) {
  const all = getGameAchv()
  const added = !all[id]
  if (added) all[id] = Date.now()
  else delete all[id]
  set(K.gachv, all)
  return added
}

/* ---------- 钓鱼图鉴收集 ---------- */
function getFishDone () {
  return get(K.fish, []) // [fishId]
}
function isFishDone (id) {
  return getFishDone().indexOf(id) >= 0
}
function toggleFish (id) {
  const all = getFishDone()
  const i = all.indexOf(id)
  if (i >= 0) all.splice(i, 1)
  else all.push(id)
  set(K.fish, all)
  return i < 0
}

/* ---------- 行为标志（成就判定用） ---------- */
function getFlags () {
  return get(K.flags, {}) // { themeSwitched, versionSwitched, craftUsed, ... }
}
function markFlag (key) {
  const f = getFlags()
  if (f[key]) return
  f[key] = Date.now()
  set(K.flags, f)
}

/* ---------- 冒险等级 ---------- */
const LEVELS = ['见习冒险家', '铜镐矿工', '银甲剑士', '金冠勇士', '暗影猎手', '神圣骑士', '丛林之主', '月主终结者', '泰拉传奇', '天顶大师']
function getStats () {
  const s = get(K.stats, { opens: 0, firstTs: Date.now() })
  return s
}
function trackOpen () {
  const s = getStats()
  s.opens += 1
  set(K.stats, s)
}
// 积分 = 启动×5 + 收藏×15 + 笔记×10，每 60 分升一级
function getLevel () {
  const stats = getStats()
  const pts = stats.opens * 5 + getFavs().length * 15 + getNotes().length * 10
  const lv = Math.min(LEVELS.length, Math.floor(pts / 60) + 1)
  const cur = pts - (lv - 1) * 60
  return { lv, title: LEVELS[lv - 1], pts, cur, need: 60 }
}

module.exports = {
  getFavs, isFav, toggleFav,
  getNotes, saveNote, delNote,
  getTheme, setTheme, getVersion, setVersion,
  getHist, pushHist, clearHist,
  getRecents, pushRecent,
  getDefeated, isDefeated, toggleDefeated,
  getChecks, getBossChecks, toggleCheck,
  getGameAchv, isGameAchvDone, toggleGameAchv,
  getFishDone, isFishDone, toggleFish,
  getFlags, markFlag,
  getCmts, addCmt, delCmt,
  getProfile, setProfile,
  getStats, trackOpen, getLevel
}
