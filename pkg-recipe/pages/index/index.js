// 配方数据分包占位页：wiki 全量配方数据由合成页通过 require.async 加载
Page({
  data: { themeClass: '' },
  onLoad () {
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
  }
})
