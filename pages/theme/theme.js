const app = getApp()
const theme = require("../../utils/theme")
const store = require("../../utils/store")

Page({
  data: {
    statusBarHeight: 20,
    navTop: 64,
    themeClass: "",
    themes: [],
    current: "dark",
    unlockedCount: 0,
  },

  onLoad() {
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      navTop: app.globalData.navTop || 64,
    })
    this.render()
  },

  onShow() {
    this.setData({ themeClass: app.themeClass() })
    this.render()
  },

  render() {
    const current = theme.getCurrent()
    const unlocked = theme.getUnlocked()
    const themes = theme.THEMES.map(t => ({
      id: t.id,
      name: t.name,
      en: t.en,
      desc: t.desc,
      scene: t.scene,
      free: !!t.free,
      unlocked: theme.isUnlocked(t.id),
      using: t.id === current,
    }))
    const lockedLeft = themes.filter(t => !t.free && !t.unlocked).length
    this.setData({
      themes: themes,
      current: current,
      unlockedCount: unlocked.length,
      lockedLeft: lockedLeft,
    })
    // 首页入口角标：看过主题页即不再提示
    theme.markThemeSeen()
  },

  goBack() { wx.navigateBack() },

  onThemeTap(e) {
    const id = e.currentTarget.dataset.id
    const t = theme.THEMES.find(x => x.id === id)
    if (!t) return
    const current = theme.getCurrent()
    if (id === current) { wx.showToast({ title: "正在使用该主题", icon: "none" }); return }

    // 免费或已解锁 → 直接应用
    if (theme.isUnlocked(id)) {
      this.apply(id)
      return
    }

    // 锁定 → 确认后看激励视频
    wx.showModal({
      title: "解锁「" + t.name + "」主题",
      content: "观看一段短视频即可永久解锁该主题，确定要继续吗？",
      confirmText: "看视频解锁",
      confirmColor: "#C8A84B",
      success: r => {
        if (!r.confirm) return
        wx.showLoading({ title: "加载中", mask: true })
        theme.unlockByAd(id).then(res => {
          wx.hideLoading()
          if (res && res.ok) {
            this.apply(id)
            if (res.test) wx.showToast({ title: "已解锁（测试模式）", icon: "none" })
            else wx.showToast({ title: "解锁成功！", icon: "success" })
          } else if (res && res.skip) {
            wx.showToast({ title: "需完整观看视频才能解锁", icon: "none" })
          } else {
            wx.showToast({ title: "广告暂不可用，稍后再试", icon: "none" })
          }
          this.render()
        })
      },
    })
  },

  apply(id) {
    theme.setCurrent(id)
    app.setTheme(id)
    if (typeof this.getTabBar === "function" && this.getTabBar() && this.getTabBar().syncTheme) this.getTabBar().syncTheme()
    this.setData({ themeClass: app.themeClass() })
    this.render()
    wx.showToast({ title: "主题已切换", icon: "none" })
  },
})
