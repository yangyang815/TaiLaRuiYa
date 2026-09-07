// 全屏搜索页：实时联想 + 历史 + 热门
const dex = require('../../utils/dex')
const store = require('../../utils/store')
const acq = require('../../utils/acq')
const fishUtil = require('../../utils/fishing')
const bossGuides = require('../../data/bossGuides')

// 热门词安全获取：开发者工具编译缓存未更新（旧 dex.js 无 hotWords）时回退静态热词
function hotWordsSafe () {
  return dex.hotWords ? dex.hotWords() : dex.HOT_WORDS.slice(0, 14)
}

Page({
  data: {
    statusBarHeight: 20,
    navTop: 70,        // 胶囊按钮下沿（搜索栏定位基准，避免被胶囊遮挡）
    capsuleRight: 100,
    themeClass: '',
    kw: '',
    results: [], stratHits: [], recipeHits: [],
    hist: [], hotWords: []
  },

  onLoad (opts) {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      navTop: (app.globalData.navTop || 64) + 6,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : '',
      hist: store.getHist(),
      hotWords: hotWordsSafe()
    })
    // 首页搜索面板"查看全部"带入关键词，直接出结果
    if (opts && opts.kw) {
      const kw = decodeURIComponent(opts.kw)
      this.setData({ kw })
      this.onKw({ detail: { value: kw } })
    }
  },

  onKw (e) {
    const kw = e.detail.value
    this.setData({ kw })
    if (!kw.trim()) { this.setData({ results: [], stratHits: [], recipeHits: [], fishingHits: [], guideHits: [] }); return }
    const results = dex.search(kw).slice(0, 12).map(x => ({
      id: x.id, name: x.name, en: x.en, type: x.type, artId: x.artId, glow: x.glow,
      tagsTxt: (x.tags || []).slice(0, 2).join(' · '),
      acqTxt: x.type === 'item' ? acq.summary(x.id) : ''
    }))
    const stratHits = dex.searchStrats(kw).map(s => ({ id: s.id, title: s.title }))
    const recipeHits = dex.recipeSearch(kw).slice(0, 4).map(r => ({ id: r.id, name: r.name, artId: r.artId }))
    const fishingHits = fishUtil.searchAll(kw).slice(0, 5).map(x => ({
      id: x.id, kind: x.kind, kindN: x.kindN, name: x.name, info: x.info || ''
    }))
    const guideHits = bossGuides.searchGuides(kw).slice(0, 4)
    this.setData({ results, stratHits, recipeHits, fishingHits, guideHits })
  },

  confirmSearch () {
    const kw = this.data.kw.trim()
    if (kw) {
      store.pushHist(kw)
      this.setData({ hist: store.getHist() })
    }
  },

  onResult (e) {
    this.confirmSearch()
    dex.go(e.currentTarget.dataset.id)
  },
  onRecipe (e) {
    this.confirmSearch()
    dex.go(e.currentTarget.dataset.id, 'recipe')
  },
  onStrat (e) {
    this.confirmSearch()
    wx.navigateTo({ url: '/pages/strategy/strategy?id=' + e.currentTarget.dataset.id })
  },
  onFish (e) {
    this.confirmSearch()
    wx.navigateTo({ url: '/pkgA-tool/pages/fishing/fishing?kw=' + encodeURIComponent(e.currentTarget.dataset.kw) })
  },
  onGuide (e) {
    this.confirmSearch()
    wx.navigateTo({ url: '/pages/bossguide/detail?id=' + e.currentTarget.dataset.id })
  },
  onWord (e) {
    const w = e.currentTarget.dataset.w
    this.setData({ kw: w })
    this.onKw({ detail: { value: w } })
  },
  clearKw () {
    this.setData({ kw: '', results: [], stratHits: [], recipeHits: [], fishingHits: [], guideHits: [] })
  },
  clearHist () {
    store.clearHist()
    this.setData({ hist: [] })
  },
  back () { wx.navigateBack() },

  onShareAppMessage () {
    return { title: '泰拉瑞亚手册 · 搜你想搜', path: '/pages/home/home' }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚手册 · 搜你想搜' }
  }
})
