// Boss 攻略清单：主线流程 + 事件 Boss，展示准备进度
const dex = require('../../utils/dex')
const store = require('../../utils/store')
const { GUIDES } = require('../../data/bossGuides')

const TIER_N = { pre: '困难前', mech: '机械', post: '花后', lunar: '月亮', event: '事件' }

function buildRow (id) {
  const g = GUIDES[id]
  const e = dex.byId[id] || {}
  const checked = store.getBossChecks(id)
  const total = g.prep.length
  const done = g.prep.filter(p => checked[p.id]).length
  return {
    id,
    order: g.order,
    name: e.name || id,
    en: e.en || '',
    artId: e.artId || 'boss_eye_cthulhu',
    tierN: TIER_N[(e.raw && e.raw.tier) || 'event'],
    total, done,
    pct: total ? Math.round(done / total * 100) : 0,
    defeated: store.isDefeated(id)
  }
}

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: '',
    main: [], event: [],
    sumDone: 0, sumTotal: 0, sumPct: 0,
    defeatedN: 0, mainN: 0
  },

  onLoad () {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100
    })
  },

  onShow () {
    const app = getApp()
    const rows = Object.keys(GUIDES).map(buildRow)
    const main = rows.filter(r => r.order > 0).sort((a, b) => a.order - b.order)
    const event = rows.filter(r => r.order === 0)
    const sumDone = rows.reduce((s, r) => s + r.done, 0)
    const sumTotal = rows.reduce((s, r) => s + r.total, 0)
    this.setData({
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : '',
      main, event,
      sumDone, sumTotal,
      sumPct: sumTotal ? Math.round(sumDone / sumTotal * 100) : 0,
      defeatedN: main.filter(r => r.defeated).length,
      mainN: main.length
    })
  },

  onItem (e) {
    wx.navigateTo({ url: '/pages/bossguide/detail?id=' + e.currentTarget.dataset.id })
  },
  back () { wx.navigateBack() },

  onShareAppMessage () {
    return { title: '泰拉瑞亚手册 · Boss 攻略清单', path: '/pages/bossguide/bossguide' }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚手册 · Boss 攻略清单' }
  }
})
