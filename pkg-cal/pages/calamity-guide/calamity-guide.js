// 灾厄机制说明与新手 FAQ
const mech = require("../../data/calamity-mechanics")

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: "",
    guides: mech.guides,
    faq: mech.faq,
    ver: mech.ver
  },
  onLoad () {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.themeClass()
    })
  },
  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.themeClass() })
  },
  back () {
    const pages = getCurrentPages()
    if (pages.length > 1) wx.navigateBack()
    else wx.switchTab({ url: "/pages/home/home" })
  },
  goCareer () {
    wx.navigateTo({ url: "/pkg-cal/pages/calamity-career/calamity-career" })
  }
})
