// 返回顶部按钮（长页面通用）
Component({
  methods: {
    go () {
      wx.pageScrollTo({ scrollTop: 0, duration: 300 })
      wx.vibrateShort({ type: 'light' })
    }
  }
})
