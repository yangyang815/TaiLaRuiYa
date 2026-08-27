// 我的收藏页：分类标签 + 收藏列表
const dex = require('../../utils/dex')
const store = require('../../utils/store')

const TABS = [
  { k: 'all', n: '全部' }, { k: 'item', n: '物品' }, { k: 'mon', n: '敌怪' },
  { k: 'boss', n: 'Boss' }, { k: 'npc', n: 'NPC' }, { k: 'strategy', n: '攻略' }
]
const TAGS = {
  boss: ['BOSS', 'tag-boss'], mon: ['敌怪', 'tag-mon'], seed: ['种子', 'tag-seed'],
  npc: ['NPC', 'tag-npc'], strategy: ['攻略', 'tag-strat'], item: ['物品', 'tag-item']
}

Page({
  data: {
    statusBarHeight: 20,
    navTop: 64,
    themeClass: '',
    tabs: TABS, tab: 'all',
    favs: [], favCount: 0
  },

  onLoad () {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      navTop: app.globalData.navTop || 64,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : ''
    })
  },

  goBack () { wx.navigateBack() },

  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
    this.loadFavs()
  },

  loadFavs () {
    const favs = store.getFavs().map(f => {
      let base = null
      if (f.type === 'strategy' || f.id.indexOf('strat_') === 0) {
        const s = dex.strats.find(x => 'strat_' + x.id === f.id)
        if (s) base = { id: f.id, name: s.title, type: 'strategy', artId: s.cover || 'stone', glow: '#4CE0E0' }
      } else {
        const e = dex.byId[f.id]
        if (e) base = { id: f.id, name: e.name, type: e.type, artId: e.artId, glow: e.glow }
      }
      if (!base) return null
      const tag = TAGS[base.type] || TAGS.item
      return Object.assign(base, { label: tag[0], tagCls: tag[1] })
    }).filter(Boolean)
    this.setData({ favs, favCount: favs.length })
  },

  onTab (e) { this.setData({ tab: e.currentTarget.dataset.k }) },

  onFavTap (e) {
    const id = e.currentTarget.dataset.id
    if (id.indexOf('strat_') === 0) {
      wx.navigateTo({ url: '/pages/strategy/strategy?id=' + id.slice(6) })
      return
    }
    dex.go(id)
  },

  onFavRemove (e) {
    store.toggleFav(e.currentTarget.dataset.id)
    this.loadFavs()
  },

  onShareAppMessage () {
    return { title: '泰拉瑞亚手册 · 我的收藏', path: '/pages/my/my' }
  }
})
