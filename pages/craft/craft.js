// 合成页：双输入 + 合成树 + 材料核对高亮 + 常用合成
const dex = require('../../utils/dex')
const R = require('../../data/recipes')

Page({
  data: {
    statusBarHeight: 20,
    navTop: 64,
    themeClass: '',
    // 目标输入
    kw: '', targetSuggests: [],
    target: null,       // {id,name,art,station,count}
    // 材料核对
    checkMode: false,
    matKw: '', matSuggests: [],
    haveChips: [],      // [{id,name,art}]
    rows: [],           // 扁平化树行
    missing: [],        // 缺失基础材料清单
    quick: []
  },
  _tree: null,
  _have: {},
  _matPool: [],         // 材料候选池

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
      guideArtId: 'npc_guide',
      quick: R.QUICK.map(q => ({
        id: q.id, name: q.name,
        artId: (R.byId[q.id] && R.byId[q.id].art) || 'stone'
      }))
    })
  },

  onShow () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) this.getTabBar().init(2)
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
    if (app.globalData.pendingCraft) {
      this.setTarget(app.globalData.pendingCraft)
      app.globalData.pendingCraft = null
    }
  },

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
    this._tree = dex.buildTree(id, this.data.checkMode ? this._haveSet() : null)
    this.setData({
      kw: rec.name, targetSuggests: [],
      target: { id: rec.result, name: rec.name, station: R.STATIONS[rec.station], count: rec.count }
    })
    this.renderRows()
  },

  /* ---------- 材料核对 ---------- */
  toggleCheck (e) {
    const on = e.detail.value
    this.setData({ checkMode: on })
    if (this._tree) this.rebuild()
    this.renderRows()
  },
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
      haveChips: [...this.data.haveChips, { id, name, artId }]
    })
    if (this._tree) this.rebuild()
    this.renderRows()
  },
  removeHave (e) {
    const id = e.currentTarget.dataset.id
    delete this._have[id]
    this.setData({ haveChips: this.data.haveChips.filter(c => c.id !== id) })
    if (this._tree) this.rebuild()
    this.renderRows()
  },
  clearHave () {
    this._have = {}
    this.setData({ haveChips: [] })
    if (this._tree) this.rebuild()
    this.renderRows()
  },
  _haveSet () { return new Set(Object.keys(this._have)) },
  rebuild () {
    if (!this._tree) return
    const have = this.data.checkMode ? this._haveSet() : null
    this._tree = dex.buildTree(this._tree.id, have)
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
        status: this.data.checkMode ? node.status : '',
        depth
      })
      if (!node.collapsed) (node.kids || []).forEach(k => walk(k, depth + 1))
    }
    if (this._tree) walk(this._tree, 0)
    const missing = this.data.checkMode ? dex.missingList(this._tree, this._haveSet()) : []
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
    if (!this.data.checkMode) { this.setData({ checkMode: true }) }
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
