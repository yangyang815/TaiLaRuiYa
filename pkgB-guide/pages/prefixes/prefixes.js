const BT = require('../../../utils/back-top-behavior')
// 词条图鉴：武器与饰品重铸前缀
const { PREFIXES, ACCESSORY_LINES, TIPS } = require('../../../data/prefixes')

const CATS = [
  { k: '', n: '全部' }, { k: 'best', n: '毕业词条' }, { k: 'common', n: '通用词条' },
  { k: 'bad', n: '负面词条' }, { k: 'acc', n: '饰品词条' }
]
const CAT_NAME = { best: '毕业词条', common: '通用词条', bad: '负面词条', acc: '饰品词条' }
const CLS_NAME = { melee: '近战', ranged: '远程', magic: '魔法', summon: '召唤', all: '通用' }

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
    wTotal: 0,
    list: [],
    accLines: ACCESSORY_LINES,
    showAcc: true,
    tips: TIPS,
    sheet: null
  },

  onLoad () {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : '',
      wTotal: PREFIXES.length
    })
    this.load()
  },

  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
  },

  load () {
    const { cat } = this.data
    const list = (cat && cat !== 'acc' ? PREFIXES.filter(p => p.cat === cat) : PREFIXES)
      .map(p => ({
        id: p.id, name: p.name, en: p.en, cat: p.cat, catName: CAT_NAME[p.cat],
        cls: p.cls, clsName: CLS_NAME[p.cls], art: p.art,
        stats: p.stats, note: p.note,
        bad: p.cat === 'bad'
      }))
    this.setData({ list, showAcc: cat === '' || cat === 'acc' })
  },

  onCat (e) {
    this.setData({ cat: e.currentTarget.dataset.k })
    this.load()
  },

  onCard (e) {
    const id = e.currentTarget.dataset.id
    const p = PREFIXES.find(x => x.id === id)
    if (!p) return
    this.setData({
      sheet: {
        id: p.id, name: p.name, en: p.en, art: p.art,
        catName: CAT_NAME[p.cat], clsName: CLS_NAME[p.cls],
        stats: p.stats, note: p.note, detail: p.detail,
        bad: p.cat === 'bad'
      }
    })
  },

  closeSheet () { this.setData({ sheet: null }) },
  noop () {},
  back () { wx.navigateBack() },

  onShareAppMessage () {
    return { title: '泰拉瑞亚 · 重铸词条图鉴', path: '/pages/home/home' }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚 · 重铸词条图鉴' }
  }
})
