// 灾厄专区首页：主体只有一张「BOSS 大全」入口卡（点进 calamity-list?type=all，按阶段看全部 Boss 卡片）；
// 小 Boss / 原版路标 / 机制 FAQ 三个入口已移入 BOSS 大全页底部
// 独立分包 pkg-cal：与原版内容完全分离（mode:"calamity"）
const cal = require("../../data/calamity-bosses")

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: "",
    ver: cal.ver,
    base: cal.base,
    itemIcon: "/pkg-cal/assets/item/draedons_heart.png"
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
  onBossAll () {
    wx.navigateTo({ url: "/pkg-cal/pages/calamity-list/calamity-list?type=all" })
  },
  onItems () {
    wx.navigateTo({ url: "/pkg-cal/pages/calamity-item/calamity-item" })
  },
  back () {
    const pages = getCurrentPages()
    if (pages.length > 1) wx.navigateBack()
    else wx.switchTab({ url: "/pages/home/home" })
  }
})
