// 本地存储封装：收藏 / 设置 / 评论 / 冒险等级
const K = {
  fav: 'terr_favs',       // [{id, type}]
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
  build: 'terr_build',    // 建造案例已建成打卡 [caseId]
  career: 'terr_career',  // 职业养成进度 {cls: 'melee', done: {stageId: ts}}
  flags: 'terr_flags',    // 行为标志 {themeSwitched, versionSwitched, craftUsed}
  grid: 'terr_grid',      // 首页宫格 {use:{k:n}, recent:[k], order:[k]|null, open:bool}
  msgRead: 'terr_msg_read' // 系统消息已读时间戳（晚于该时间的消息视为未读）
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

/* ---------- 设置 ---------- */
function getTheme () { return get(K.theme, 'dark') }
function setTheme (t) { set(K.theme, t) }
function getVersion () {
  let v = get(K.ver, '')
  if (!v) v = '1.4.5'
  if (v === '1.4.4') {
    // 一次性迁移：口径统一为 1.4.5（用户手动切换过版本则尊重其选择）
    const f = get(K.flags, {})
    if (!f.versionSwitched) { v = '1.4.5'; set(K.ver, v) }
  }
  return v
}
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

/* ---------- 建造案例打卡（已建成） ---------- */
function getBuildDone () {
  return get(K.build, []) // [caseId]
}
function isBuildDone (id) {
  return getBuildDone().indexOf(id) >= 0
}
function toggleBuild (id) {
  const all = getBuildDone()
  const i = all.indexOf(id)
  if (i >= 0) all.splice(i, 1)
  else all.push(id)
  set(K.build, all)
  return i < 0
}

/* ---------- 职业养成进度 ---------- */
function getCareer () {
  return get(K.career, { cls: 'melee', done: {} }) // {cls, done:{stageId: ts}}
}
function setCareerCls (cls) {
  const c = getCareer()
  c.cls = cls
  set(K.career, c)
}
function toggleCareerStage (stageId) {
  const c = getCareer()
  const added = !c.done[stageId]
  if (added) c.done[stageId] = Date.now()
  else delete c.done[stageId]
  set(K.career, c)
  return added
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
// 积分 = 启动×5 + 收藏×15，每 60 分升一级
function getLevel () {
  const stats = getStats()
  const pts = stats.opens * 5 + getFavs().length * 15
  const lv = Math.min(LEVELS.length, Math.floor(pts / 60) + 1)
  const cur = pts - (lv - 1) * 60
  return { lv, title: LEVELS[lv - 1], pts, cur, need: 60 }
}

/* ---------- 首页宫格（使用频率 / 最近使用 / 自定义排序 / 展开状态） ---------- */
function getGrid () {
  const g = get(K.grid, null)
  if (!g || typeof g !== 'object') return { use: {}, recent: [], order: null, open: false }
  return { use: g.use || {}, recent: g.recent || [], order: Array.isArray(g.order) ? g.order : null, open: !!g.open }
}
// 点击入口：计数 + 记录最近使用（最多 3 个）
function tapGrid (k) {
  const g = getGrid()
  g.use[k] = (g.use[k] || 0) + 1
  g.recent = [k].concat(g.recent.filter(x => x !== k)).slice(0, 3)
  set(K.grid, g)
}
function saveGridOrder (order) {
  const g = getGrid()
  g.order = order
  set(K.grid, g)
}
function resetGridOrder () {
  const g = getGrid()
  g.order = null
  set(K.grid, g)
}
function toggleGridOpen (open) {
  const g = getGrid()
  g.open = !!open
  set(K.grid, g)
}

/* ---------- 系统消息已读标记 ---------- */
function getMsgRead () {
  return get(K.msgRead, 0)
}
function setMsgRead (ts) {
  set(K.msgRead, ts || Date.now())
}

/* ---------- 存档导出 / 导入（跨设备迁移） ---------- */
// 纳入存档的键（主题与数据版本也在内，导入后自动应用）
const SAVE_KEYS = ['fav', 'recent', 'boss', 'checks', 'gachv', 'fish', 'build',
  'career', 'grid', 'profile', 'flags', 'msgRead', 'ver', 'theme', 'stats', 'hist']
const SAVE_TAG = 'terra-handbook-save'
const SAVE_VER = 1

// 导出全部进度为可序列化对象（空值跳过）
function exportAll () {
  const data = {}
  SAVE_KEYS.forEach(k => {
    let v
    try { v = wx.getStorageSync(K[k]) } catch (e) { return }
    if (v !== '' && v !== undefined && v !== null) data[k] = v
  })
  return {
    app: SAVE_TAG,
    ver: SAVE_VER,
    time: new Date().toLocaleString('zh-CN', { hour12: false }),
    data
  }
}

// 校验导入内容（不写入）：{ok, err, keys, time}
function checkSave (obj) {
  if (!obj || typeof obj !== 'object' || obj.app !== SAVE_TAG || !obj.data) {
    return { ok: false, err: '不是本小程序的存档' }
  }
  const keys = SAVE_KEYS.filter(k => obj.data[k] !== undefined)
  if (!keys.length) return { ok: false, err: '存档内容为空' }
  return { ok: true, keys, time: obj.time || '' }
}

// 应用导入（覆盖写入；仅写入存档中存在的键）
function applySave (obj) {
  const chk = checkSave(obj)
  if (!chk.ok) return chk
  chk.keys.forEach(k => set(K[k], obj.data[k]))
  return chk
}

module.exports = {
  getFavs, isFav, toggleFav,
  getTheme, setTheme, getVersion, setVersion,
  getHist, pushHist, clearHist,
  getRecents, pushRecent,
  getDefeated, isDefeated, toggleDefeated,
  getChecks, getBossChecks, toggleCheck,
  getGameAchv, isGameAchvDone, toggleGameAchv,
  getFishDone, isFishDone, toggleFish,
  getBuildDone, isBuildDone, toggleBuild,
  getCareer, setCareerCls, toggleCareerStage,
  getFlags, markFlag,
  getGrid, tapGrid, saveGridOrder, resetGridOrder, toggleGridOpen,
  exportAll, checkSave, applySave,
  getCmts, addCmt, delCmt,
  getProfile, setProfile,
  getStats, trackOpen, getLevel,
  getMsgRead, setMsgRead
}
