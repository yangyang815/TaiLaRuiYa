// 种子目录：种植种子速查（药草种子 + 环境草种）
const plantseeds = require('../../data/plantseeds')

const CATS = [
  { k: '', n: '全部' }, { k: 'herb', n: '药草种子' }, { k: 'grass', n: '环境草种' }
]
const TYPE_NAME = { herb: '药草种子', grass: '环境草种' }

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: '',
    cats: CATS,
    cat: '',
    total: 0,
    herbCount: 0,
    grassCount: 0,
    list: [],
    sheet: null
  },

  onLoad () {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : '',
      total: plantseeds.length,
      herbCount: plantseeds.filter(s => s.type === 'herb').length,
      grassCount: plantseeds.filter(s => s.type === 'grass').length
    })
    this.load()
  },

  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
  },

  load () {
    const { cat } = this.data
    const list = (cat ? plantseeds.filter(s => s.type === cat) : plantseeds).map(s => ({
      id: s.id, name: s.name, en: s.en, type: s.type, typeName: TYPE_NAME[s.type],
      art: s.art, color: s.color, herbName: s.herbName,
      bloom: s.bloom, found: s.found,
      potions: s.potions, potionCount: s.potions.length,
      factCount: s.facts.length
    }))
    this.setData({ list })
  },

  onCat (e) {
    this.setData({ cat: e.currentTarget.dataset.k })
    this.load()
  },

  onCard (e) {
    const id = e.currentTarget.dataset.id
    const s = plantseeds.find(x => x.id === id)
    if (!s) return
    this.setData({
      sheet: {
        id: s.id, name: s.name, en: s.en, type: s.type, typeName: TYPE_NAME[s.type],
        art: s.art, color: s.color, herbName: s.herbName,
        bloom: s.bloom, found: s.found,
        desc: s.desc, bloomDetail: s.bloomDetail, foundDetail: s.foundDetail,
        potions: s.potions, potionCount: s.potions.length,
        facts: s.facts, factCount: s.facts.length
      }
    })
  },

  closeSheet () { this.setData({ sheet: null }) },
  noop () {},
  back () { wx.navigateBack() },

  onShareAppMessage () {
    return { title: '泰拉瑞亚 · 种植种子图鉴', path: '/pages/home/home' }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚 · 种植种子图鉴' }
  }
})
