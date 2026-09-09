const BT = require('../../utils/back-top-behavior')
// 攻略页：无 id 显示列表，有 id 显示攻略详情
const dex = require('../../utils/dex')
const store = require('../../utils/store')

const CATS = [
  { k: '', n: '全部' }, { k: 'progress', n: '流程' }, { k: 'class', n: '职业' },
  { k: 'build', n: '建造' }, { k: 'event', n: '事件' }
]
const CAT_NAME = { progress: '流程', class: '职业', build: '建造', event: '事件' }

Page({
  behaviors: [BT],
  data: {
    statusBarHeight: 20,
    themeClass: '',
    mode: 'list',        // list | detail
    cat: '',
    cats: CATS,
    list: [],
    // 详情
    s: null,
    relEntries: [],
    fav: false
  },

  onLoad (opts) {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : '',
      cat: opts.cat || ''
    })
    if (opts.id) this.openDetail(opts.id)
    else this.loadList()
  },

  loadList () {
    this.setData({
      mode: 'list',
      list: dex.strats
        .filter(s => !this.data.cat || s.cat === this.data.cat)
        .map(s => ({ id: s.id, title: s.title, summary: s.summary, time: s.time,
          catName: CAT_NAME[s.cat], artId: s.cover || 'stone' }))
    })
  },

  onCat (e) {
    this.setData({ cat: e.currentTarget.dataset.k })
    this.loadList()
  },
  open (e) { this.openDetail(e.currentTarget.dataset.id) },

  openDetail (id) {
    const s = dex.strats.find(x => x.id === id)
    if (!s) return
    const CAREER = require('../../data/career')
    const clsInfo = s.cls ? CAREER.CLASSES.find(c => c.id === s.cls) : null
    this.setData({
      mode: 'detail',
      s: {
        id: s.id, title: s.title, summary: s.summary, time: s.time,
        catName: CAT_NAME[s.cat], artId: s.cover || 'stone',
        cls: s.cls || '', clsName: clsInfo ? clsInfo.name : '', clsIcon: clsInfo ? clsInfo.icon : '',
        steps: s.steps.map((x, i) => ({ i: i + 1, t: x.t, d: x.d })),
        tips: s.tips
      },
      relEntries: s.related.map(r => {
        const e = dex.byId[r.id]
        if (!e) return null
        return { id: r.id, type: r.type, name: e.name, artId: e.artId, glow: e.glow }
      }).filter(Boolean),
      fav: store.isFav('strat_' + id)
    })
  },

  /* 双向联动：跳转该职业的路线规划 */
  goCareerPath () {
    const store = require('../../utils/store')
    store.setCareerCls(this.data.s.cls)
    wx.navigateTo({ url: '/pkgA-tool/pages/careerpath/careerpath' })
  },

  back () {
    if (this.data.mode === 'detail') this.loadList()
    else wx.navigateBack()
  },
  onRel (e) {
    const { id, type } = e.currentTarget.dataset
    if (type === 'strategy') this.openDetail(id)
    else dex.go(id, type)
  },
  toggleFav () {
    const added = store.toggleFav('strat_' + this.data.s.id, 'strategy')
    this.setData({ fav: added })
    wx.showToast({ title: added ? '已收藏' : '已取消收藏', icon: 'none' })
  },

  onShareAppMessage () {
    const s = this.data.s
    return {
      title: s ? '泰拉瑞亚攻略 · ' + s.title : '泰拉瑞亚攻略合集',
      path: s ? '/pages/strategy/strategy?id=' + s.id : '/pages/strategy/strategy'
    }
  },
  onShareTimeline () {
    const s = this.data.s
    if (this.data.mode === 'detail' && s) {
      return { title: s.title + ' · 泰拉瑞亚攻略', query: 'id=' + s.id }
    }
    return { title: '泰拉瑞亚冒险攻略合集 · 从开荒到毕业' }
  }
})
