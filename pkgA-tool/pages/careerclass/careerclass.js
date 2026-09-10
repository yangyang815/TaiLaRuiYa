// 职业专属专题页：汇总该职业的攻略合集 / 配装推荐 / Boss 打法 / 阶段路线
const X = require('../../utils/career')
const D = require('../../../data/career')
const store = require('../../../utils/store')

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: '',
    classes: D.CLASSES,
    cls: 'melee',
    clsName: '战士',
    clsIcon: '⚔️',
    clsDesc: '',
    art: 'terra_blade',
    prog: null,
    articles: [],      // 该职业全部攻略
    gearStages: [],    // 按阶段汇总的配装推荐
    bosses: [],        // 路线涉及 Boss（去重）
    stageNames: []     // 阶段路线速览
  },

  onLoad (opts) {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : ''
    })
    if (opts && opts.cls) store.setCareerCls(opts.cls)
    this.refresh()
  },

  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
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
      art: info.art,
      prog: X.progress(cls),
      articles: X.classArticles(cls),
      gearStages: (D.PATHS[cls] || []).map(s => ({ id: s.id, name: s.name, brief: s.brief, gear: s.gear || [] })),
      bosses: X.classBosses(cls),
      stageNames: (D.PATHS[cls] || []).map(s => s.name)
    })
  },

  /* 切换职业 */
  onCls (e) {
    const id = e.currentTarget.dataset.id
    if (id === this.data.cls) return
    store.setCareerCls(id)
    this.refresh()
  },

  goPath () { wx.navigateTo({ url: '/pkgA-tool/pages/careerpath/careerpath' }) },
  onBoss (e) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: '/pages/detail/detail?type=boss&id=' + id })
  },
  onStrat (e) {
    wx.navigateTo({ url: '/pages/strategy/strategy?id=' + e.currentTarget.dataset.id })
  },
  back () { wx.navigateBack() },

  onShareAppMessage () {
    return { title: '泰拉瑞亚 · ' + this.data.clsName + '职业专题', path: '/pkgA-tool/pages/careerclass/careerclass?cls=' + this.data.cls }
  }
})
