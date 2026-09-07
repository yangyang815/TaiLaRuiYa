// 职业资料库：职业筛选 + 分类筛选 + 攻略列表
const X = require('../../../utils/career')
const D = require('../../../data/career')

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: '',
    classes: D.CLASSES,
    topics: D.LIB_TOPICS,
    cls: '',           // 空 = 全部职业
    topic: '',         // 空 = 全部分类
    list: []
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
  },

  refresh () {
    this.setData({
      list: X.libArticles(this.data.cls, this.data.topic)
    })
  },

  onCls (e) {
    const id = e.currentTarget.dataset.id
    this.setData({ cls: this.data.cls === id ? '' : id })
    this.refresh()
  },

  /* 双向联动：跳转所选职业的路线规划 */
  goPath () {
    if (this.data.cls) {
      const store = require('../../../utils/store')
      store.setCareerCls(this.data.cls)
    }
    wx.navigateTo({ url: '/pkgA-tool/pages/careerpath/careerpath' })
  },
  onTopic (e) {
    const k = e.currentTarget.dataset.k
    this.setData({ topic: k })
    this.refresh()
  },

  openStrat (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/strategy/strategy?id=' + id })
  },

  back () { wx.navigateBack() },
  onShareAppMessage () {
    return { title: '泰拉瑞亚 · 职业资料库（攻略技巧一页通）', path: '/pkgA-tool/pages/careerlib/careerlib' }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚 · 职业资料库（攻略技巧一页通）' }
  }
})
