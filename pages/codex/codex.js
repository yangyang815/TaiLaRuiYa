// 图鉴页：搜索联想 + 筛选 + 瀑布流卡片 + 半屏详情弹窗 + 收藏
// 性能：分页渲染（滚动增量加载）、图标传 artId 字符串、onShow 脏检查
const dex = require('../../utils/dex')
const store = require('../../utils/store')

const TABS = [
  { k: 'all', n: '全部' }, { k: 'item', n: '物品' }, { k: 'mon', n: '敌怪' }, { k: 'boss', n: 'Boss' }, { k: 'seed', n: '种子' }, { k: 'npc', n: 'NPC' }
]
const NGRP = { svc: '服务型', shop: '肉前入住', post: '肉后入住', evt: '特殊到访' }
const LET = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const PAGE = 40 // 每页条数

Page({
  data: {
    statusBarHeight: 20,
    navTop: 64,
    themeClass: '',
    tabs: TABS, tab: 'all',
    cats: [], cat: '',
    kw: '', suggests: [],
    list: [], total: 0,
    letters: LET, letter: '',
    sheet: null, sheetFav: false
  },
  _all: [],    // 当前筛选全量（内存）
  _sig: '',    // 筛选签名（onShow 脏检查）

  onLoad () {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      navTop: app.globalData.navTop || 64,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : ''
    })
  },

  onShow () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) this.getTabBar().init(1)
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
    if (app.globalData.pendingCodex) {
      const { tab } = app.globalData.pendingCodex
      app.globalData.pendingCodex = null
      this.setData({ tab: tab || 'all' })
    }
    // 数据未变化时跳过重复刷新（从详情页返回等场景）
    const sig = this.data.tab + '|' + this.data.cat + '|' + this.data.letter
    if (sig !== this._sig) this.refresh()
    if (this.data.sheet) this.setData({ sheetFav: store.isFav(this.data.sheet.id) })
  },

  fmt (e) {
    return {
      id: e.id, name: e.name, en: e.en, type: e.type,
      artId: e.artId, glow: e.glow, rarity: e.rarity,
      subName: e.type === 'mon' ? (e.raw.biome || '')
        : (e.type === 'seed' ? ('种子 ' + (e.raw.code || ''))
        : (e.type === 'npc' ? (NGRP[e.raw.ngrp] || '城镇NPC')
        : (e.raw.cat === 'weapon' ? '武器 · ' + (e.raw.sub || '') : '')))
    }
  },

  refresh () {
    const { tab, cat, letter } = this.data
    let list = dex.ALL
    if (tab !== 'all') list = list.filter(e => e.type === tab)
    if (cat) list = list.filter(e => e.raw.cat === cat || ((tab === 'boss' || tab === 'mon') && e.raw.tier === cat) || (tab === 'seed' && e.raw.group === cat) || (tab === 'npc' && e.raw.ngrp === cat))
    if (letter) {
      if (letter === '#') list = list.filter(e => !/^[a-z]/i.test((e.en || '')[0] || ''))
      else list = list.filter(e => (e.en || '').toLowerCase().startsWith(letter.toLowerCase()))
    }
    this._all = list
    this._sig = tab + '|' + cat + '|' + letter
    this.setData({
      cats: dex.CATS[tab] || [{ k: '', n: '全部' }],
      list: list.slice(0, PAGE).map(e => this.fmt(e)),
      total: list.length
    })
  },

  onReachBottom () {
    const cur = this.data.list.length
    if (!this._all || cur >= this._all.length) return
    const more = this._all.slice(cur, cur + PAGE).map(e => this.fmt(e))
    this.setData({ list: this.data.list.concat(more) })
  },

  onTab (e) {
    this.setData({ tab: e.currentTarget.dataset.k, cat: '', letter: '' })
    this.refresh()
  },
  onCat (e) {
    const k = e.currentTarget.dataset.k
    this.setData({ cat: this.data.cat === k ? '' : k })
    this.refresh()
  },
  onLetter (e) {
    const l = e.currentTarget.dataset.l
    this.setData({ letter: this.data.letter === l ? '' : l })
    this.refresh()
  },

  onKw (e) {
    const kw = e.detail.value
    const suggests = kw ? dex.search(kw).slice(0, 8).map(s => ({
      id: s.id, name: s.name, en: s.en, type: s.type, artId: s.artId, glow: s.glow,
      tagsTxt: (s.tags || []).slice(0, 2).join(' · ')
    })) : []
    this.setData({ kw, suggests })
  },
  onSuggestTap (e) { dex.go(e.currentTarget.dataset.id) },
  clearKw () { this.setData({ kw: '', suggests: [] }) },

  onCardTap (e) {
    const id = e.currentTarget.dataset.id
    const entry = dex.byId[id]
    if (!entry) return
    const r = entry.raw
    const isBoss = entry.type === 'boss'
    const isMon = entry.type === 'mon'
    const isSeed = entry.type === 'seed'
    const isNpc = entry.type === 'npc'
    this.setData({
      sheet: {
        id: entry.id, name: entry.name, en: entry.en, type: entry.type,
        artId: entry.artId, glow: entry.glow, rarity: entry.rarity,
        desc: r.desc || '',
        stats: isSeed
          ? [['种子代码', r.code], ['加入版本', r.ver], ['难度', '★★★★★'.slice(0, r.diff) + '☆☆☆☆☆'.slice(0, 5 - r.diff)], ['特色', r.tag]]
          : (r.stats || (isBoss || isMon
            ? [['HP', String(r.hp)], ['伤害', String(r.dmg)], ['防御', String(r.def)], ['出现', r.biome || r.tier || '']]
            : dex.itemBaseStats(r))),
        obtainTitle: isBoss ? '召唤方式' : (isMon ? '出现地点' : (isNpc ? '入住条件' : (isSeed ? '使用方法' : '获取方式'))),
        obtain: isBoss ? r.spawn : (isMon ? r.biome : (isSeed ? '创建世界时在"种子"栏输入上述代码（区分大小写）' : r.obtain)),
        use: r.use || '',
        shop: isNpc ? (r.shop || []) : [],
        shopNote: isNpc ? (r.shopNote || '') : '',
        drops: (!isSeed && (isBoss || isMon)) ? (r.drops || []).map(d => ({ name: d.name, rate: d.rate })) : [],
        phases: isBoss ? (r.phases || []).map(p => ({ name: p.name, desc: p.desc })) : [],
        mechanics: isSeed ? (r.mechanics || []) : [],
        exclusives: isSeed ? (r.exclusives || []).map(x => ({ name: x.name, note: x.note })) : [],
        strategy: isSeed ? (r.tips || []) : (isBoss ? (r.strategy || []) : (isMon ? [r.tip || ''] : []))
      },
      sheetFav: store.isFav(id)
    })
  },
  closeSheet () { this.setData({ sheet: null }) },
  noop () {},

  onCardLong (e) {
    const id = e.currentTarget.dataset.id
    const entry = dex.byId[id]
    const added = store.toggleFav(id, entry ? entry.type : 'item')
    if (this.data.sheet && this.data.sheet.id === id) this.setData({ sheetFav: added })
    wx.vibrateShort({ type: 'medium' })
    wx.showToast({ title: added ? '已加入收藏' : '已取消收藏', icon: 'none' })
  },
  sheetFavToggle () { this.onCardLong({ currentTarget: { dataset: { id: this.data.sheet.id } } }) },
  sheetFull () {
    const s = this.data.sheet
    wx.navigateTo({ url: '/pages/detail/detail?type=' + s.type + '&id=' + s.id })
  },

  goSearch () { wx.navigateTo({ url: '/pages/search/search' }) },

  onShareAppMessage () {
    return { title: '泰拉瑞亚图鉴 · ' + this.data.total + ' 条条目一网打尽', path: '/pages/codex/codex' }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚图鉴 · ' + this.data.total + ' 条条目一网打尽' }
  },

  /* ---------- 分享海报（品牌版式 · 图鉴数据） ---------- */
  openPoster () {
    const cnt = t => dex.ALL.filter(e => e.type === t).length
    this.setData({
      posterData: {
        mode: 'brand', tag: '万物图鉴',
        artId: 'tab_book_on', color: '#FFD700',
        title: '泰拉瑞亚图鉴', sub: '一册在手 · 万物皆有档案',
        features: [['物品收录', cnt('item') + ' 件'], ['敌怪档案', cnt('mon') + ' 只'], ['Boss 全录', cnt('boss') + ' 位'], ['NPC 图鉴', cnt('npc') + ' 位']],
        desc: '支持中文/拼音/别名搜索，掉落、属性、出现地点一查便知'
      },
      posterShow: true
    })
  },
  closePoster () { this.setData({ posterShow: false }) }
})
