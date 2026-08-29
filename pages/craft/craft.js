// 合成页：品牌区 + 搜索 + 目标输入 + 材料标记 + 目标物品卡 + 所需材料 + 合成树
const dex = require('../../utils/dex')
const acq = require('../../utils/acq')
const store = require('../../utils/store')
const R = require('../../data/recipes')

function fmtClock (d) {
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return h + ':' + m
}

Page({
  data: {
    statusBarHeight: 20,
    navTop: 64,
    themeClass: '',
    clock: '',
    // 全局搜索（跳详情）
    searchKw: '', searchSuggests: [],
    // 目标输入
    kw: '', targetSuggests: [],
    target: null,       // {id,name,en,artId,glow,stats,station,count,fav}
    // 材料标记（选填）
    matKw: '', matSuggests: [],
    haveChips: [],      // [{id,name,artId}]
    mats: [],           // 目标的一级材料行
    matsOwned: 0,       // 已拥有的材料数
    rows: [],           // 扁平化树行
    missing: [],        // 缺失基础材料清单
    quick: []
  },
  _tree: null,
  _have: {},
  _matPool: [],         // 材料候选池
  _timer: null,

  onLoad () {
    const app = getApp()
    const pool = {}
    R.RECIPES.forEach(r => r.ingredients.forEach(g => { pool[g.id] = 1 }))
    Object.keys(R.EXTRA).forEach(k => { pool[k] = 1 })
    this._matPool = Object.keys(pool).map(id => {
      const info = dex.lookup(id)
      return { id, name: info.name, artId: info.artId }
    })

    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      navTop: app.globalData.navTop || 64,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : '',
      clock: fmtClock(new Date()),
      quick: R.QUICK.map(q => ({
        id: q.id, name: q.name,
        artId: (R.byId[q.id] && R.byId[q.id].art) || 'stone'
      }))
    })
    this._timer = setInterval(() => this.setData({ clock: fmtClock(new Date()) }), 30000)
  },

  onUnload () {
    if (this._timer) { clearInterval(this._timer); this._timer = null }
  },

  onShow () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) this.getTabBar().init(2)
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
    if (app.globalData.pendingCraft) {
      this.setTarget(app.globalData.pendingCraft)
      app.globalData.pendingCraft = null
    }
    // 收藏状态可能在外页变更
    if (this.data.target) this.setData({ 'target.fav': store.isFav(this.data.target.id) })
  },

  /* ---------- 全局搜索（跳详情） ---------- */
  onSearchKw (e) {
    const kw = e.detail.value
    this.setData({
      searchKw: kw,
      searchSuggests: kw ? dex.search(kw).slice(0, 6).map(s => ({
        id: s.id, name: s.name, en: s.en, type: s.type, artId: s.artId, glow: s.glow
      })) : []
    })
  },
  clearSearchKw () { this.setData({ searchKw: '', searchSuggests: [] }) },
  onSearchTap (e) { this.clearSearchKw(); dex.go(e.currentTarget.dataset.id) },

  /* ---------- 目标 ---------- */
  onKw (e) {
    const kw = e.detail.value
    this.setData({ kw, targetSuggests: kw ? dex.recipeSearch(kw).slice(0, 8) : [] })
  },
  clearKw () { this.setData({ kw: '', targetSuggests: [] }) },
  onSuggestTap (e) {
    this.setTarget(e.currentTarget.dataset.id)
  },
  onQuickTap (e) { this.setTarget(e.currentTarget.dataset.id) },

  setTarget (id) {
    const rec = R.byId[id]
    if (!rec) return
    store.markFlag('craftUsed')
    this._tree = dex.buildTree(id, this._haveSet())
    const entry = dex.byId[rec.result]
    let stats = []
    if (entry && entry.raw.stats) stats = entry.raw.stats.slice(0, 4)
    else if (entry) stats = dex.itemBaseStats(entry.raw).slice(0, 4)
    this.setData({
      kw: rec.name, targetSuggests: [],
      target: {
        id: rec.result, name: rec.name,
        en: entry ? entry.en : '',
        artId: rec.art || 'stone',
        glow: entry ? entry.glow : '#FFD700',
        stats, station: R.STATIONS[rec.station], count: rec.count,
        fav: store.isFav(rec.result)
      }
    })
    this.renderMats()
    this.renderRows()
  },

  toggleTargetFav () {
    const t = this.data.target
    if (!t) return
    const added = store.toggleFav(t.id, dex.byId[t.id] ? dex.byId[t.id].type : 'item')
    this.setData({ 'target.fav': added })
    wx.vibrateShort({ type: 'medium' })
    wx.showToast({ title: added ? '已收藏' : '已取消收藏', icon: 'none' })
  },

  /* ---------- 一级材料行 ---------- */
  renderMats () {
    const rec = this._tree && R.byId[this._tree.id]
    if (!rec) { this.setData({ mats: [] }); return }
    const have = this._haveSet()
    const mats = rec.ingredients.map(g => {
      const info = dex.lookup(g.id)
      const entry = dex.byId[g.id]
      return {
        id: g.id, name: info.name, artId: info.artId,
        count: g.count, craftable: !!R.byId[g.id],
        own: have.has(g.id),
        obtain: info.obtain || (entry ? entry.raw.obtain : '') || ''
      }
    })
    this.setData({ mats, matsOwned: mats.filter(m => m.own).length })
  },
  matObtain (e) {
    const id = e.currentTarget.dataset.id
    // 获取方式速查页优先
    if (acq.has(id)) { wx.navigateTo({ url: '/pages/acq/acq?id=' + id }); return }
    const entry = dex.byId[id]
    if (entry) { dex.go(id); return }
    const info = dex.lookup(id)
    wx.showModal({ title: info.name + ' · 获取方式', content: info.obtain || '未知来源', showCancel: false, confirmText: '知道了' })
  },
  matTap (e) {
    // 点材料行：可合成的切换为合成目标，不可合成的弹获取方式
    const id = e.currentTarget.dataset.id
    if (R.byId[id]) { this.setTarget(id); wx.pageScrollTo({ scrollTop: 0, duration: 200 }) }
    else this.matObtain(e)
  },
  matToggleHave (e) {
    const id = e.currentTarget.dataset.id
    if (this._have[id]) this.removeHave(e)
    else this.addHave(e)
  },

  /* ---------- 材料标记（选填） ---------- */
  onMatKw (e) {
    const kw = e.detail.value.trim().toLowerCase()
    this.setData({
      matKw: e.detail.value,
      matSuggests: kw
        ? this._matPool.filter(m => m.name.toLowerCase().includes(kw) && !this._have[m.id]).slice(0, 8)
        : []
    })
  },
  addHave (e) {
    const { id, name, artId } = e.currentTarget.dataset
    if (this._have[id]) return
    this._have[id] = 1
    this.setData({
      matKw: '', matSuggests: [],
      haveChips: [...this.data.haveChips, { id, name, artId: artId || (dex.lookup(id) || {}).artId }]
    })
    this.rebuildAll()
  },
  removeHave (e) {
    const id = e.currentTarget.dataset.id
    delete this._have[id]
    this.setData({ haveChips: this.data.haveChips.filter(c => c.id !== id) })
    this.rebuildAll()
  },
  clearHave () {
    this._have = {}
    this.setData({ haveChips: [] })
    this.rebuildAll()
  },
  _haveSet () { return new Set(Object.keys(this._have)) },
  rebuildAll () {
    if (!this._tree) return
    this._tree = dex.buildTree(this._tree.id, this._haveSet())
    this.renderMats()
    this.renderRows()
  },

  /* ---------- 树渲染 ---------- */
  renderRows () {
    const rows = []
    const walk = (node, depth) => {
      rows.push({
        id: node.id, name: node.name, artId: node.artId, count: node.count,
        station: node.station, craftable: node.craftable, obtain: node.obtain,
        kids: (node.kids || []).length,
        collapsed: !!node.collapsed,
        status: this._have[node.id] ? 'have' : 'lack',
        depth
      })
      if (!node.collapsed) (node.kids || []).forEach(k => walk(k, depth + 1))
    }
    if (this._tree) walk(this._tree, 0)
    const missing = dex.missingList(this._tree, this._haveSet())
    this.setData({ rows, missing })
  },
  onRowTap (e) {
    const i = e.currentTarget.dataset.index
    const row = this.data.rows[i]
    if (!row || !row.kids) return
    const find = n => {
      if (n.id === row.id) return n
      for (const k of (n.kids || [])) { const r = find(k); if (r) return r }
    }
    const node = find(this._tree)
    if (node) node.collapsed = !node.collapsed
    this.renderRows()
  },
  rowToTarget (e) {
    const i = e.currentTarget.dataset.index
    const row = this.data.rows[i]
    if (row && row.craftable) { this.setTarget(row.id); wx.pageScrollTo({ scrollTop: 0, duration: 200 }) }
    else if (row) wx.showToast({ title: row.name + ' 无法合成，需自行获取', icon: 'none' })
  },
  rowAddHave (e) {
    const i = e.currentTarget.dataset.index
    const row = this.data.rows[i]
    if (!row) return
    this.addHave({ currentTarget: { dataset: { id: row.id, name: row.name } } })
  },

  onShareAppMessage () {
    return { title: '泰拉瑞亚合成速查 · 向导都在用', path: '/pages/craft/craft' }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚合成速查 · 向导都在用' }
  },

  /* ---------- 分享海报（品牌版式 · 合成数据） ---------- */
  openPoster () {
    const nRec = Object.keys(R.byId).length
    const nSt = Object.keys(R.STATIONS).length
    this.setData({
      posterData: {
        mode: 'brand', tag: '合成速查',
        artId: 'tab_anvil_on', color: '#FFD700',
        title: '合成路线速查', sub: '向导为你展开每一层材料树',
        features: [['合成配方', nRec + ' 条'], ['制作站', nSt + ' 种'], ['材料核对', '缺料标红'], ['常用合成', '一键直达']],
        desc: '输入目标物品自动展开完整合成树，勾选已有材料即可盘点缺口'
      },
      posterShow: true
    })
  },
  closePoster () { this.setData({ posterShow: false }) }
})
