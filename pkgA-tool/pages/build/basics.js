// 建造基础：6 讲手风琴 + 合格房屋五要素速查
const D = require('../../../data/building')

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: '',
    basics: D.BASICS,
    expanded: 'b1' // 默认展开第一讲
  },

  onLoad () {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : ''
    })
  },

  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
  },

  onToggle (e) {
    const id = e.currentTarget.dataset.id
    this.setData({ expanded: this.data.expanded === id ? '' : id })
  },

  back () { wx.navigateBack() },

  onShareAppMessage () {
    return { title: '泰拉瑞亚 · 建造基础', path: '/pages/home/home' }
  }
})
