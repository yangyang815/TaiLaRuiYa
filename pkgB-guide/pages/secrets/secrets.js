// 隐藏知识库：冷知识/隐藏机制/彩蛋玩法
const secrets = require('../../../data/secrets')

const CATS = [
  { k: '', n: '全部' }, { k: 'mech', n: '隐藏机制' }, { k: 'event', n: '隐藏事件' },
  { k: 'easter', n: '彩蛋梗' }, { k: 'life', n: '隐藏玩法' }, { k: 'world', n: '世界秘密' },
  { k: 'pro', n: '高手技巧' }
]
const CAT_NAME = { mech: '隐藏机制', event: '隐藏事件', easter: '彩蛋梗', life: '隐藏玩法', world: '世界秘密', pro: '高手技巧' }
const RARE_NAME = ['', '入门', '进阶', '稀有', '传说']

Page({
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
      total: secrets.length,
      factTotal: secrets.reduce((s, x) => s + x.facts.length, 0)
    })
    this.load()
  },

  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
  },

  load () {
    const { cat } = this.data
    const list = (cat ? secrets.filter(s => s.cat === cat) : secrets).map(s => ({
      id: s.id, title: s.title, intro: s.intro, art: s.art,
      catName: CAT_NAME[s.cat], rareName: RARE_NAME[s.rare] || '进阶',
      rare: s.rare, count: s.facts.length
    }))
    this.setData({ list })
  },

  onCat (e) {
    this.setData({ cat: e.currentTarget.dataset.k })
    this.load()
  },

  onCard (e) {
    const id = e.currentTarget.dataset.id
    const s = secrets.find(x => x.id === id)
    if (!s) return
    this.setData({
      sheet: {
        id: s.id, title: s.title, intro: s.intro, art: s.art, rare: s.rare,
        catName: CAT_NAME[s.cat], rareName: RARE_NAME[s.rare] || '进阶',
        facts: s.facts, count: s.facts.length
      }
    })
  },

  closeSheet () { this.setData({ sheet: null }) },
  noop () {},
  back () { wx.navigateBack() },

  onShareAppMessage () {
    return { title: '泰拉瑞亚 · 隐藏知识库', path: '/pages/home/home' }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚 · 隐藏知识库' }
  }
})
