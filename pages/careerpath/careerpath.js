// 路线规划器：8 阶段进度 + 锁定 + 阶段详情（装备推荐 / Boss 跳转 / 攻略跳转）
const X = require('../../utils/career')
const store = require('../../utils/store')
const dex = require('../../utils/dex')

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: '',
    cls: 'melee',
    clsName: '战士',
    clsIcon: '⚔️',
    prog: null,
    stages: [],
    expanded: ''       // 展开详情的阶段 id
  },

  onLoad () {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : ''
    })
    this.refresh()
  },

  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
  },

  refresh () {
    const cls = X.curCls()
    const info = X.clsInfo(cls)
    const prog = X.progress(cls)
    this.setData({
      cls,
      clsName: info.name,
      clsIcon: info.icon,
      prog,
      stages: X.stages(cls)
    })
  },

  /* 展开阶段详情（锁定态不可展开） */
  onStage (e) {
    const id = e.currentTarget.dataset.id
    const st = this.data.stages.find(s => s.id === id)
    if (!st || st.status === 'locked') {
      if (st) wx.showToast({ title: st.unlockHint, icon: 'none' })
      return
    }
    this.setData({ expanded: this.data.expanded === id ? '' : id })
  },

  /* 标记完成 / 取消完成 */
  onToggleDone (e) {
    const id = e.currentTarget.dataset.id
    const added = store.toggleCareerStage(id)
    wx.showToast({ title: added ? '已标记完成' : '已取消完成', icon: 'none' })
    this.setData({ expanded: '' })
    this.refresh()
  },

  /* 跳转 Boss 攻略 */
  onBoss (e) {
    const id = e.currentTarget.dataset.id
    dex.go(id, 'boss')
  },

  /* 跳转关联攻略 */
  onStrat (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/strategy/strategy?id=' + id })
  },

  /* 双向联动：进入职业资料库 */
  goLib () {
    wx.navigateTo({ url: '/pages/careerlib/careerlib' })
  },

  back () { wx.navigateBack() }
})
