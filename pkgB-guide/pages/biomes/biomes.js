const BT = require('../../../utils/back-top-behavior')
// 生物群系：地图各大环境分区速查
const biomes = require('../../../data/biomes')

const CATS = [
  { k: '', n: '全部' }, { k: 'surface', n: '地表层' }, { k: 'under', n: '地下层' },
  { k: 'spread', n: '蔓延群系' }, { k: 'hard', n: '困难模式' }
]
const CAT_NAME = { surface: '地表层', under: '地下层', spread: '蔓延群系', hard: '困难模式' }
const DANGER_NAME = ['', '安全', '低危', '中危', '高危', '极危']

function dotsOf (danger) {
  return [1, 2, 3, 4, 5].map(i => ({ i, on: i <= danger ? 1 : 0 }))
}

Page({
  behaviors: [BT],
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
      total: biomes.length,
      factTotal: biomes.reduce((s, x) => s + x.facts.length, 0)
    })
    this.load()
  },

  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
  },

  load () {
    const { cat } = this.data
    const list = (cat ? biomes.filter(b => b.cat === cat) : biomes).map(b => ({
      id: b.id, name: b.name, en: b.en, layer: b.layer, intro: b.intro, art: b.art,
      catName: CAT_NAME[b.cat], danger: b.danger, dangerName: DANGER_NAME[b.danger],
      dots: dotsOf(b.danger), count: b.facts.length
    }))
    this.setData({ list })
  },

  onCat (e) {
    this.setData({ cat: e.currentTarget.dataset.k })
    this.load()
  },

  onCard (e) {
    const id = e.currentTarget.dataset.id
    const b = biomes.find(x => x.id === id)
    if (!b) return
    this.setData({
      sheet: {
        id: b.id, name: b.name, en: b.en, layer: b.layer, intro: b.intro, art: b.art,
        catName: CAT_NAME[b.cat], danger: b.danger, dangerName: DANGER_NAME[b.danger],
        dots: dotsOf(b.danger), facts: b.facts, count: b.facts.length
      }
    })
  },

  closeSheet () { this.setData({ sheet: null }) },
  noop () {},
  back () { wx.navigateBack() },

  onShareAppMessage () {
    return { title: '泰拉瑞亚 · 生物群系图鉴', path: '/pages/home/home' }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚 · 生物群系图鉴' }
  }
})
