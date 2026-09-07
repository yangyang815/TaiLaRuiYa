// 建造指南主页：搜索 + 建造基础入口 + 实用案例 + 建筑技巧 + 灵感画廊
const D = require('../../../data/building')
const B = require('../../../utils/building')
const store = require('../../../utils/store')

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: '',
    kw: '',
    cases: [],
    doneCount: 0,
    total: D.CASES.length,
    tips: [],
    expandedTip: '',
    gallery: [],
    results: null
  },

  onLoad () {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : ''
    })
    this.refresh()
  },

  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
    this.refresh()
  },

  refresh () {
    const done = new Set(store.getBuildDone())
    this.setData({
      cases: B.list(done),
      doneCount: done.size,
      tips: D.TIPS,
      gallery: D.GALLERY
    })
  },

  /* ---------- 搜索 ---------- */
  onKw (e) {
    const kw = e.detail.value
    this.setData({ kw, results: B.search(kw) })
  },
  clearKw () {
    this.setData({ kw: '', results: null })
  },

  /* ---------- 跳转 ---------- */
  goBasics () { wx.navigateTo({ url: '/pkgA-tool/pages/build/basics' }) },
  goCase (e) { wx.navigateTo({ url: '/pkgA-tool/pages/build/detail?id=' + e.currentTarget.dataset.id }) },
  goCaseByKw (e) { this.goCase(e) },

  /* ---------- 技巧手风琴 ---------- */
  onTip (e) {
    const id = e.currentTarget.dataset.id
    this.setData({ expandedTip: this.data.expandedTip === id ? '' : id })
  },

  back () { wx.navigateBack() },

  onShareAppMessage () {
    return { title: '泰拉瑞亚 · 建造指南', path: '/pages/home/home' }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚 · 建造指南' }
  }
})
