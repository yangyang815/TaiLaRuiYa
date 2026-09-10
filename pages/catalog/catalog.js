// 全物品图鉴（主包统一页）：三卷数据经 catalog-search 异步合并，用户无感分卷
const BT = require('../../utils/back-top-behavior')
const catSearch = require('../../utils/catalog-search')
const ALIAS = catSearch.ALIAS || {}

Page({
  behaviors: [BT],
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: '',
    kw: '',
    rows: [],
    shown: 0,
    hitCount: 0,
    total: 0,
    loading: true,
    loadFail: false,
    diag: '',
    detail: null,
    cat: '',
    catChips: []
  },
  _all: [],
  _hit: [],
  _cat: '',
  _mainSet: null,
  _opts: {},

  onLoad (opts) {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : ''
    })
    this._opts = opts || {}
    this.loadData()
  },

  /* 加载三卷全量数据（preloadRule 已链式预下载，基本无感）；空结果自动重试一次；带超时与分卷诊断 */
  loadData (isRetry) {
    this.setData({ loading: true, loadFail: false })
    // 15s 超时保护：require.async 异常挂起时不再无限转圈
    const timeout = new Promise(res => setTimeout(() => res([]), 15000))
    Promise.race([catSearch.load(), timeout]).then(all => {
      if (!all || !all.length) {
        const st = catSearch.lastStats()
        const diag = st ? Object.keys(st).map(k => k + ':' + (st[k] === -1 ? '失败' : st[k])).join(' ') : '未发起加载'
        if (!isRetry) { setTimeout(() => this.loadData(true), 600); return }
        this.setData({ loading: false, loadFail: true, diag: '诊断 ' + diag })
        return
      }
      this._all = all.slice().sort((a, b) => (a.n < b.n ? -1 : 1))
      // 分类 chips（全量统计；长尾合并为"其他"，最多 24 个主分类）
      const cnt = {}
      this._all.forEach(x => { const c = x.c || '其他'; cnt[c] = (cnt[c] || 0) + 1 })
      const sorted = Object.keys(cnt).map(c => ({ k: c, n: c, cnt: cnt[c] })).sort((a, b) => b.cnt - a.cnt)
      const main = sorted.filter(x => x.cnt >= 10).slice(0, 24)
      const mainCnt = main.reduce((a, x) => a + x.cnt, 0)
      const catChips = [{ k: '', n: '全部', cnt: this._all.length }].concat(main)
      this._mainSet = new Set(main.map(x => x.k))
      if (this._all.length - mainCnt > 0) catChips.push({ k: '__other__', n: '其他', cnt: this._all.length - mainCnt })
      this.setData({ loading: false, total: this._all.length, catChips })
      const o = this._opts
      if (o.kw) this.applyFilter(decodeURIComponent(o.kw))
      else this.applyFilter('')
      if (o.id) {
        const it = this._all.find(x => x.f === o.id)
        if (it) this.setData({ detail: { ...it, rcol2: it.rcol, rlab2: it.rlab } })
      }
      this._opts = {}
    }).catch(() => this.setData({ loading: false, loadFail: true, diag: '诊断 加载异常' }))
  },
  retry () { this.loadData() },

  applyFilter (kw) {
    const k = (kw || '').trim().toLowerCase()
    const cat = this._cat || ''
    const terms = [k]
    const aliased = ALIAS[(kw || '').trim()]
    if (aliased && k) terms.push(aliased.toLowerCase())
    const inX = (x, t) => (x.n || '').toLowerCase().indexOf(t) >= 0 || (x.en || '').toLowerCase().indexOf(t) >= 0
    this._hit = this._all.filter(x =>
      (!k || terms.some(t => inX(x, t))) &&
      (!cat || (cat === '__other__' ? !(this._mainSet && this._mainSet.has(x.c)) : x.c === cat)))
    this.setData({
      kw,
      rows: this._hit.slice(0, 80),
      shown: Math.min(80, this._hit.length),
      hitCount: this._hit.length
    })
  },

  onPageScroll (e) {
    const show = e && e.scrollTop > 600
    if (show !== this.data.showBackTop) this.setData({ showBackTop: show })
  },
  onKw (e) { this.applyFilter(e.detail.value) },
  onCat (e) {
    this._cat = e.currentTarget.dataset.k || ''
    this.setData({ cat: this._cat })
    this.applyFilter(this.data.kw)
  },
  more () {
    const next = Math.min(this._hit.length, this.data.rows.length + 80)
    this.setData({ rows: this._hit.slice(0, next), shown: next })
  },
  onRow (e) {
    const it = this._hit[Number(e.currentTarget.dataset.i)]
    this.setData({ detail: it ? { ...it, rcol2: it.rcol, rlab2: it.rlab } : null })
  },
  closeDetail () { this.setData({ detail: null }) },
  noop () {},
  back () {
    if (getCurrentPages().length > 1) wx.navigateBack()
    else wx.switchTab({ url: '/pages/home/home' })
  },
  onShareAppMessage () {
    return { title: '泰拉瑞亚全物品图鉴 · ' + this.data.total + ' 条全收录', path: '/pages/catalog/catalog' }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚全物品图鉴 · ' + this.data.total + ' 条全收录' }
  }
})
