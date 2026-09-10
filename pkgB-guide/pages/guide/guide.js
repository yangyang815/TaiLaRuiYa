const BT = require('../../../utils/back-top-behavior')
// 新手指南：新玩家的完整上手路线
const guide = require('../../data/guide')

const CATS = [
  { k: '', n: '全部' }, { k: 'start', n: '初见泰拉' }, { k: 'live', n: '生存发展' },
  { k: 'fight', n: '战斗进阶' }, { k: 'grow', n: '成长之路' }
]
const CAT_NAME = { start: '初见泰拉', live: '生存发展', fight: '战斗进阶', grow: '成长之路' }

Page({
  behaviors: [BT],
  onPageScroll (e) {
    const show = e && e.scrollTop > 600
    if (show !== this.data.showBackTop) this.setData({ showBackTop: show })
  },
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: '',
    cats: CATS,
    cat: '',
    total: 0,
    factTotal: 0,
    list: [],
    sheet: null
  },

  onLoad () {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : '',
      total: guide.length,
      factTotal: guide.reduce((s, x) => s + x.facts.length, 0)
    })
    this.load()
  },

  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
  },

  load () {
    const { cat } = this.data
    const list = (cat ? guide.filter(g => g.cat === cat) : guide).map((g, i) => ({
      id: g.id, title: g.title, intro: g.intro, art: g.art,
      catName: CAT_NAME[g.cat], no: i + 1, count: g.facts.length
    }))
    this.setData({ list })
  },

  onCat (e) {
    this.setData({ cat: e.currentTarget.dataset.k })
    this.load()
  },

  onCard (e) {
    const id = e.currentTarget.dataset.id
    const g = guide.find(x => x.id === id)
    if (!g) return
    this.setData({
      sheet: {
        id: g.id, title: g.title, intro: g.intro, art: g.art,
        catName: CAT_NAME[g.cat], facts: g.facts, count: g.facts.length
      }
    })
  },

  closeSheet () { this.setData({ sheet: null }) },
  noop () {},
  back () { wx.navigateBack() },

  onShareAppMessage () {
    return { title: '泰拉瑞亚 · 新手指南', path: '/pages/home/home' }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚 · 新手指南' }
  }
})
