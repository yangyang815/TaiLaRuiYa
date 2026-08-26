// 泰拉瑞亚手册 · App 入口
const store = require('./utils/store')

App({
  globalData: {
    sys: null,
    theme: 'dark',            // dark | light
    version: '1.4.4',         // 数据版本
    pendingCodex: null        // 首页宫格 → 图鉴页的跳转意图 {tab, cat}
  },

  onLaunch () {
    // 系统信息（状态栏高度 / 视口宽度 / 胶囊按钮位置）
    try {
      const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
      this.globalData.sys = info
      // 页面内容顶部安全线：低于右上角胶囊按钮（"···"和退出按钮）
      let navTop = (info.statusBarHeight || 20) + 44
      let capsuleRight = 100
      try {
        const rect = wx.getMenuButtonBoundingClientRect && wx.getMenuButtonBoundingClientRect()
        if (rect && rect.bottom) navTop = rect.bottom + 8
        if (rect && rect.left) capsuleRight = (info.windowWidth || 375) - rect.left + 8
      } catch (e2) { }
      this.globalData.navTop = navTop
      this.globalData.capsuleRight = capsuleRight
    } catch (e) {
      this.globalData.sys = { windowWidth: 375, windowHeight: 812, pixelRatio: 2 }
      this.globalData.navTop = 64
      this.globalData.capsuleRight = 100
    }

    // 读取用户设置
    this.globalData.theme = store.getTheme()
    this.globalData.version = store.getVersion()

    // 记录一次启动，用于冒险等级成长
    store.trackOpen()
  },

  // 供各页面切换主题后同步
  setTheme (t) {
    this.globalData.theme = t
    store.setTheme(t)
  },
  setVersion (v) {
    this.globalData.version = v
    store.setVersion(v)
  }
})
