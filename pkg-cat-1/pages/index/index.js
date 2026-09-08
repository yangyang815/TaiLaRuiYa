// 全物品图鉴 · 卷 1（自动生成页面）
const NAV = [{"root":"pkg-cat-1","vol":1,"cats":"可合成物品 / 战利品"},{"root":"pkg-cat-2","vol":2,"cats":"掉落物品 / 家具"}]
const ROOT = 'pkg-cat-1'
// 官方稀有度配色（游戏内同款）
const RCOL = { '-13': '#B57BFF', '-12': '#FF4CE0', '-1': '#B4B4B4', 0: '#FFFFFF', 1: '#9696FF', 2: '#96FF96', 3: '#FFC896', 4: '#FF9696', 5: '#FF96FF', 6: '#D2A0FF', 7: '#96FF0A', 8: '#FFFF32', 9: '#32FFFF', 10: '#FF3232' }
const RLAB = { '-13': '大师', '-12': '专家', '-1': '任务', 0: '白色', 1: '蓝色', 2: '绿色', 3: '橙色', 4: '浅红', 5: '粉色', 6: '浅紫', 7: '青柠', 8: '黄色', 9: '青色', 10: '红色' }
Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: '',
    vol: 1,
    cats: '可合成物品 / 战利品',
    total: 2963,
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
      .map(x => {
        const r = Number(x.r)
        return {
          ...x,
          sprite: '/' + ROOT + '/assets/' + x.f + '.png',
          rcol: RCOL[r] || '#FFFFFF',
          rlab: RLAB[r] || '',
          meta: (x.t ? x.t.slice(0, 50) : '')
        }
      })
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
    const it = this._hit[Number(e.currentTarget.dataset.i)]
    this.setData({ detail: it ? { ...it, rcol2: it.rcol, rlab2: it.rlab } : null })
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
    return { title: '泰拉瑞亚全物品图鉴 · 卷1（可合成物品 / 战利品）', path: '/' + ROOT + '/pages/index/index' }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚全物品图鉴 · 卷1（可合成物品 / 战利品）' }
  }
})
