// 全物品图鉴 · 卷 1（自动生成页面）
const NAV = [{"root":"pkg-cat-1","vol":1,"cats":"craftable items / drop items"},{"root":"pkg-cat-2","vol":2,"cats":"plunder items / furniture"}]
const ROOT = 'pkg-cat-1'
Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: '',
    vol: 1,
    cats: 'craftable items / drop items',
    total: 2688,
    kw: '',
    rows: [],
    shown: 0,
    hitCount: 0,
    detail: null,
    nav: NAV.slice()
  },
  _all: [],
  _hit: [],

  onLoad () {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : ''
    })
    const batch = require('../../data/batch.js')
    this._all = batch
      .map(x => ({ ...x, sprite: ROOT + '/assets/' + x.f + '.png' }))
      .sort((a, b) => (a.n < b.n ? -1 : 1))
    this.setData({ total: this._all.length })
    this.applyFilter('')
  },

  applyFilter (kw) {
    const k = (kw || '').trim().toLowerCase()
    this._hit = k
      ? this._all.filter(x => x.n.toLowerCase().includes(k) || x.en.toLowerCase().includes(k))
      : this._all
    this.setData({
      kw,
      rows: this._hit.slice(0, 80),
      shown: Math.min(80, this._hit.length),
      hitCount: this._hit.length
    })
  },

  onKw (e) { this.applyFilter(e.detail.value) },
  more () {
    const next = Math.min(this._hit.length, this.data.rows.length + 80)
    this.setData({ rows: this._hit.slice(0, next), shown: next })
  },
  onRow (e) {
    this.setData({ detail: this._hit[Number(e.currentTarget.dataset.i)] })
  },
  closeDetail () { this.setData({ detail: null }) },
  noop () {},
  goVol (e) {
    const root = e.currentTarget.dataset.root
    if (root === ROOT) return
    wx.navigateTo({ url: '/' + root + '/pages/index/index' })
  },
  back () { wx.navigateBack() },
  onShareAppMessage () {
    return { title: '泰拉瑞亚全物品图鉴 · 卷1（craftable items / drop items）', path: '/' + ROOT + '/pages/index/index' }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚全物品图鉴 · 卷1（craftable items / drop items）' }
  }
})
