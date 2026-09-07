// NPC 规划器：最优配对推荐 + 偏好速查表
const X = require('../../../utils/npcplan')
const D = require('../../../data/npcplan')

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: '',
    tab: 'plan',          // plan=推荐规划 prefs=偏好速查
    plan: null,           // 最优规划结果
    expanded: '',         // 展开明细的成员 id
    prefs: [],            // 速查表
    prefKw: ''
  },

  onLoad () {
    const app = getApp()
    this._prefs = X.prefTable() // 速查表全量（内存）
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : '',
      plan: X.planBest(),
      prefs: this._prefs
    })
  },

  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
  },

  back () { wx.navigateBack() },

  onTab (e) { this.setData({ tab: e.currentTarget.dataset.k }) },

  /* 展开成员价格明细 */
  onExpand (e) {
    const id = e.currentTarget.dataset.id
    this.setData({ expanded: this.data.expanded === id ? '' : id })
  },

  /* 速查表搜索（JS 层过滤，WXML 不支持 indexOf 方法调用） */
  onPrefKw (e) {
    const kw = (e.detail.value || '').trim()
    const prefs = kw ? this._prefs.filter(p => p.name.indexOf(kw) >= 0) : this._prefs
    this.setData({ prefKw: kw, prefs })
  },
  onShareAppMessage () {
    return { title: '泰拉瑞亚 · NPC 规划器（晶塔摆放一步到位）', path: '/pkgA-tool/pages/npcplan/npcplan' }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚 · NPC 规划器（晶塔摆放一步到位）' }
  }
})
