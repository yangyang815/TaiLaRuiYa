// 合成页：品牌区 + 搜索 + 目标输入 + 材料标记 + 目标物品卡 + 所需材料 + 合成树
const dex = require('../../utils/dex')
const fmt = require('../../utils/fmt')
const acq = require('../../utils/acq')
const store = require('../../utils/store')
const R = require('../../data/recipes')
const { startClock } = require('../../utils/clock')
const catSearch = require('../../utils/catalog-search')
const wikiCraft = require('../../utils/wiki-craft')

// wiki 全量配方（分包异步化懒加载，3457 条）
let _wikiP = null
function wikiRecipes () {
  if (!_wikiP) {
    try { _wikiP = require.async('../../pkg-recipe/data/recipes-wiki.js').catch(() => []) }
    catch (e) { _wikiP = Promise.resolve([]) }
  }
  return _wikiP
}
// 判断字符串本身是否为 wiki 配方的 EN 键（全量物品详情跳转闭环用）
function idxRecEn (en) {
  return typeof en === 'string' && /^[A-Za-z]/.test(en)
}
// v2 数据（{zh, rec,...}）→ 扁平列表 [{en, name}]（缓存）
let _wikiList = null
function wikiList () {
  return wikiRecipes().then(d => {
    if (_wikiList) return _wikiList
    _wikiList = (d && d.rec)
      ? Object.keys(d.rec).map(en => ({ en, name: d.zh[en] || en }))
      : []
    return _wikiList
  })
}

// 物品分类 → 中文标签（配方筛选用）
const CAT_LABEL = {
  weapon: '武器', tool: '工具', armor: '盔甲', accessory: '饰品',
  potion: '药水', material: '材料', mount: '坐骑', pet: '宠物'
}
const CAT_CHIPS = [
  { k: '', n: '全部' }, { k: 'weapon', n: '武器' }, { k: 'tool', n: '工具' },
  { k: 'armor', n: '盔甲' }, { k: 'accessory', n: '饰品' }, { k: 'potion', n: '药水' },
  { k: 'material', n: '材料' }
]

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
    quick: [],
    // 配方筛选（分类 + 工作台）
    catChips: CAT_CHIPS,
    stationChips: [],
    fCat: '', fStation: '',
    fRecipes: [], fCount: 0
  },
  _tree: null,
  _have: {},
  _matPool: [],         // 材料候选池
  _recipes: [],         // 全部配方的展示元数据
  _timer: null,

  onLoad () {
    wikiRecipes() // 预载 wiki 全量配方（我要合成联想即时可用）
    const app = getApp()
    const pool = {}
    R.RECIPES.forEach(r => r.ingredients.forEach(g => { pool[g.id] = 1 }))
    Object.keys(R.EXTRA).forEach(k => { pool[k] = 1 })
    this._matPool = Object.keys(pool).map(id => {
      const info = dex.lookup(id)
      return { id, name: info.name, artId: info.artId }
    })

    // 配方元数据 + 站点筛选 chips
    this._recipes = R.RECIPES.map(r => {
      const e = dex.byId[r.result]
      const cat = (e && e.raw.cat) || ''
      return {
        rid: r.result,
        name: r.name || (e && e.name) || r.result,
        artId: r.art || (e && e.artId) || 'stone',
        station: r.station,
        stationName: R.STATIONS[r.station] || r.station,
        cat,
        catLabel: CAT_LABEL[cat] || ''
      }
    })
    const stationChips = [{ k: '', n: '全部工作台' }].concat(
      Object.keys(R.STATIONS).map(k => ({ k, n: R.STATIONS[k] }))
    )

    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      navTop: app.globalData.navTop || 64,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : '',
      clock: fmt.fmtClock(new Date()),
      stationChips,
      quick: R.QUICK.map(q => ({
        id: q.id, name: q.name,
        artId: (R.byId[q.id] && R.byId[q.id].art) || 'stone'
      }))
    })
    this.applyFilterRecipes()
    // 整分钟对齐刷新右上角时钟（与其它 Tab 页同相位，跨分钟即跳变）
    this._timer = startClock(() => this.setData({ clock: fmt.fmtClock(new Date()) }))
  },

  onUnload () {
    if (this._timer) { this._timer.stop(); this._timer = null }
  },

  onShow () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) this.getTabBar().init(2)
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '', clock: fmt.fmtClock(new Date()) })
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
    // 联想：模糊命中配方 → 附上工作台/分类信息 → 应用当前筛选维度
    let sug = kw ? dex.recipeSearch(kw).slice(0, 10) : []
    sug = sug.map(s => {
      const r = R.byId[s.id]
      const cat = r ? ((dex.byId[r.result] && dex.byId[r.result].raw.cat) || '') : ''
      return {
        ...s,
        stationName: r ? (R.STATIONS[r.station] || '') : '',
        catLabel: CAT_LABEL[cat] || ''
      }
    })
    if (this.data.fCat) sug = sug.filter(s => {
      const r = R.byId[s.id]
      const entry = r && dex.byId[r.result]
      return (entry && entry.raw.cat) === this.data.fCat
    })
    if (this.data.fStation) sug = sug.filter(s => {
      const r = R.byId[s.id]
      return r && r.station === this.data.fStation
    })
    this.setData({ kw, targetSuggests: sug })
    // wiki 全量配方联想（异步回填，请求序号防过期；本地已命中的名字不重复出现）
    const reqId = (this._wReqId = (this._wReqId || 0) + 1)
    if (kw.trim()) {
      const k = kw.trim().toLowerCase()
      wikiRecipes().then(data => {
        if (reqId !== this._wReqId) return
        const idx = wikiCraft.buildIndex(data)
        const localNames = {}
        ;(this.data.targetSuggests || []).forEach(x => { localNames[x.name] = 1 })
        const wikiSug = Object.keys(idx.rec)
          .map(en => ({ en, name: idx.zh[en] || en }))
          .filter(r => r.name.toLowerCase().includes(k) || r.en.toLowerCase().includes(k))
          .sort((a, b) => (a.name.startsWith(k) || a.en.toLowerCase().startsWith(k) ? 0 : 1) - (b.name.startsWith(k) || b.en.toLowerCase().startsWith(k) ? 0 : 1))
          .slice(0, 6)
          .map(r => {
            const icon = wikiCraft.iconOf(idx, r.en)
            return { id: 'w_' + r.en, name: r.name, en: r.en, wiki: true, artId: (icon && icon.artId) || 'stone', sprite: (icon && icon.sprite) || '' }
          })
          .filter(x => !localNames[x.name])
        if (!wikiSug.length) return
        this.setData({ targetSuggests: (this.data.targetSuggests || []).concat(wikiSug) })
      })
    }
  },
  clearKw () { this.setData({ kw: '', targetSuggests: [] }) },
  onSuggestTap (e) {
    if (e.currentTarget.dataset.wiki) { this.setWikiTarget(e.currentTarget.dataset.name, e.currentTarget.dataset.en); return }
    this.setTarget(e.currentTarget.dataset.id)
  },
  onQuickTap (e) { this.setTarget(e.currentTarget.dataset.id) },

  /* ---------- 配方筛选（分类 + 工作台） ---------- */
  onCatChip (e) {
    this.setData({ fCat: e.currentTarget.dataset.k })
    this.applyFilterRecipes()
    if (this.data.kw) this.onKw({ detail: { value: this.data.kw } })
  },
  onStationChip (e) {
    this.setData({ fStation: e.currentTarget.dataset.k })
    this.applyFilterRecipes()
    if (this.data.kw) this.onKw({ detail: { value: this.data.kw } })
  },
  applyFilterRecipes () {
    const list = this._recipes.filter(r =>
      (!this.data.fCat || r.cat === this.data.fCat) &&
      (!this.data.fStation || r.station === this.data.fStation))
    this.setData({ fRecipes: list, fCount: list.length })
  },
  onRecipeTap (e) {
    this.setTarget(e.currentTarget.dataset.id)
    wx.pageScrollTo({ scrollTop: 0, duration: 250 })
  },

  // wiki 配方目标：递归合成树（点击材料逐级展开到不可再合成为止）
  setWikiTarget (name, en, varI) {
    store.markFlag('craftUsed')
    wikiRecipes().then(data => {
      const idx = wikiCraft.buildIndex(data)
      const rootEn = en || Object.keys(idx.rec).find(k => idx.zh[k] === name)
      if (!rootEn || !idx.rec[rootEn]) return
      this._wikiIdx = idx
      this._wikiOpen = new Set()
      this._wikiEn = rootEn
      this._wikiVarI = varI || 0
      const icon = wikiCraft.iconOf(idx, rootEn)
      const rec = idx.rec[rootEn]
      const v = rec[Math.min(this._wikiVarI, rec.length - 1)]
      this.setData({
        kw: idx.zh[rootEn] || name, targetSuggests: [], mats: [], rows: [],
        target: {
          wiki: true, name: idx.zh[rootEn] || name, en: rootEn,
          glow: '#4CE0E0', station: v.s || '徒手', count: 1, fav: false,
          sprite: (icon && icon.sprite) || '',
          artId: (icon && icon.artId) || '',
          varN: rec.length,
          varI: this._wikiVarI
        },
        wikiRows: wikiCraft.rows(idx, rootEn, this._wikiOpen, this._wikiVarI)
      })
    })
  },
  // 切换配方变体（多工作站/多配比时）
  onWikiVariant () {
    const rec = this._wikiIdx && this._wikiIdx.rec[this._wikiEn]
    if (!rec || rec.length < 2) return
    this.setWikiTarget(this.data.target.name, this._wikiEn, (this._wikiVarI + 1) % rec.length)
  },
  // 展开/收起材料节点
  onWikiRowTap (e) {
    const key = e.currentTarget.dataset.key
    if (!e.currentTarget.dataset.expandable) return
    if (this._wikiOpen.has(key)) this._wikiOpen.delete(key)
    else this._wikiOpen.add(key)
    this.setData({ wikiRows: wikiCraft.rows(this._wikiIdx, this._wikiEn, this._wikiOpen) })
  },
  // 配料详情（精灵图行 → 图鉴卷完整条目；精品行 → dex 跳转）
  onWikiMatTap (e) {
    const { f, en } = e.currentTarget.dataset
    if (f) {
      catSearch.getById(f).then(entry => { if (entry) this.setData({ catDetail: entry }) })
      return
    }
    const entry = en && dex.ALL.find(x => (x.en || '').toLowerCase() === String(en).toLowerCase())
    if (entry) { this.setData({ catDetail: null }); dex.go(entry.id) }
  },
  onCatDetailClose () { this.setData({ catDetail: null }) },

  setTarget (id) {
    const rec = R.byId[id]
    if (!rec) {
      // 闭环回退：精品/全量物品没有手造配方时，按 EN 名查 wiki 全量配方
      const entry = dex.byId[id]
      const en = (entry && entry.en) || (idxRecEn(id) ? id : '')
      if (!en) { wx.showToast({ title: '暂未收录该物品的合成配方', icon: 'none' }); return }
      wikiList().then(list => {
        const hit = list.some(r => r.en === en)
        if (hit) this.setWikiTarget(entry ? entry.name : en, en)
        else wx.showToast({ title: '暂未收录该物品的合成配方', icon: 'none' })
      })
      return
    }
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
