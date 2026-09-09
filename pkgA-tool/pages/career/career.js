const BT = require('../../../utils/back-top-behavior')
// 职业养成聚合页：当前职业 + 总进度 + 推荐阶段 + 双入口 + 最近更新
const X = require('../../../utils/career')
const D = require('../../../data/career')

Page({
  behaviors: [BT],
  onPageScroll (e) {
    const show = e && e.scrollTop > 600
    if (show !== this.data.showBackTop) this.setData({ showBackTop: show })
  },
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: '',
    classes: D.CLASSES,
    cls: 'melee',
    clsName: '战士',
    clsIcon: '⚔️',
    clsDesc: '',
    prog: null,          // {doneCount,total,pct,current}
    recents: []          // 最近更新文章
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
    // 从路线规划页返回时刷新进度
    this.refresh()
  },

  refresh () {
    const cls = X.curCls()
    const info = X.clsInfo(cls)
    this.setData({
      cls,
      clsName: info.name,
      clsIcon: info.icon,
      clsDesc: info.desc,
      prog: X.progress(cls),
      recents: X.recentArticles(4)
    })
  },

  /* 切换职业 */
  onCls (e) {
    const id = e.currentTarget.dataset.id
    if (id === this.data.cls) return
    const store = require('../../../utils/store')
    store.setCareerCls(id)
    this.refresh()
  },

  /* 进入路线规划 / 资料库 */
  goPath () { wx.navigateTo({ url: '/pkgA-tool/pages/careerpath/careerpath' }) },
  goCls () { wx.navigateTo({ url: '/pkgA-tool/pages/careerclass/careerclass?cls=' + this.data.cls }) },
  goLib () { wx.navigateTo({ url: '/pkgA-tool/pages/careerlib/careerlib' }) },

  /* 打开攻略文章 */
  openStrat (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/strategy/strategy?id=' + id })
  },

  back () { wx.navigateBack() },
  onShareAppMessage () {
    return { title: '泰拉瑞亚 · 职业养成路线（四职业全阶段打卡）', path: '/pkgA-tool/pages/career/career' }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚 · 职业养成路线（四职业全阶段打卡）' }
  }
})
