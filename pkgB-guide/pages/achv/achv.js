const BT = require('../../../utils/back-top-behavior')
// 冒险成就页：网格展示全部成就 + 解锁状态
const achv = require('../../../utils/achievements')

Page({
  behaviors: [BT],
  data: {
    statusBarHeight: 20,
    navTop: 64,
    themeClass: '',
    list: [],
    unlocked: 0, total: 0
  },

  onLoad () {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      navTop: app.globalData.navTop || 64,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : ''
    })
  },

  goBack () { wx.navigateBack() },

  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
    const list = achv.computeAll()
    this.setData({
      list,
      unlocked: list.filter(a => a.unlocked).length,
      total: list.length
    })
  },

  onShareAppMessage () {
    return {
      title: '我已解锁 ' + this.data.unlocked + '/' + this.data.total + ' 个成就 · 泰拉瑞亚手册',
      path: '/pages/my/my'
    }
  }
})
