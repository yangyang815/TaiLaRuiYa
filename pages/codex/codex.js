// 图鉴页：搜索联想 + 筛选 + 瀑布流卡片 + 半屏详情弹窗 + 收藏
// 性能：分页渲染（滚动增量加载）、图标传 artId 字符串、onShow 脏检查
const dex = require('../../utils/dex')
const fmt = require('../../utils/fmt')
const store = require('../../utils/store')
const { startClock } = require('../../utils/clock')

const TABS = [
  { k: 'all', n: '全部' }, { k: 'item', n: '物品' }, { k: 'mon', n: '敌怪' }, { k: 'boss', n: 'Boss' }
]
const NGRP = { svc: '服务型', shop: '肉前入住', post: '肉后入住', evt: '特殊到访' }
const LET = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const PAGE = 40 // 每页条数
const RECENT_PAGE = 4 // 最近浏览默认展示数

// 稀有度 → 星级（1~5）：亮星 + 暗星
function starsOf (e) {
  const r = e.type === 'boss' ? 9 : (e.rarity || 0)
  const n = Math.min(5, Math.max(1, Math.ceil((r + 1) / 2)))
  return { n, on: '★★★★★'.slice(0, n), off: '★★★★★'.slice(0, 5 - n) }
}

Page({
  data: {
    statusBarHeight: 20,
    navTop: 64,
    themeClass: '',
    clock: '',
    tabs: TABS, tab: 'all',
    cats: [], cat: '',
    kw: '', suggests: [],
    list: [], total: 0,
    letters: LET, letter: '',
    recents: [], recentsAll: false,
    sheet: null, sheetFav: false
  },
  _all: [],    // 当前筛选全量（内存）
  _sig: '',    // 筛选签名（onShow 脏检查）
  _timer: null, // 时钟定时器

  onLoad () {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      navTop: app.globalData.navTop || 64,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : '',
      clock: fmt.fmtClock(new Date())
    })
    // 整分钟对齐刷新右上角时钟（与其它 Tab 页同相位，跨分钟即跳变）
    this._timer = startClock(() => this.setData({ clock: fmt.fmtClock(new Date()) }))
    this.loadRecents()
  },

  onUnload () {
    if (this._timer) { this._timer.stop(); this._timer = null }
  },

  onShow () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) this.getTabBar().init(1)
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '', clock: fmt.fmtClock(new Date()) })
    if (app.globalData.pendingCodex) {
      let { tab } = app.globalData.pendingCodex
      app.globalData.pendingCodex = null
      // 兼容旧入口：种子/NPC 归入物品标签下的二级筛选
      let cat = ''
      if (tab === 'seed' || tab === 'npc') { cat = tab; tab = 'item' }
      this.setData({ tab: tab || 'all', cat, letter: '' })
    }
    // 数据未变化时跳过重复刷新（从详情页返回等场景）
    const sig = this.data.tab + '|' + this.data.cat + '|' + this.data.letter
    if (sig !== this._sig) this.refresh()
    this.loadRecents()
    if (this.data.sheet) this.setData({ sheetFav: store.isFav(this.data.sheet.id) })
  },

  /* ---------- 最近浏览 ---------- */
  loadRecents () {
    const rs = store.getRecents()
      .map(r => dex.byId[r.id])
      .filter(Boolean)
      .map(e => ({ id: e.id, name: e.name, type: e.type, artId: e.artId, glow: e.glow }))
    this.setData({ recents: rs.slice(0, this.data.recentsAll ? 12 : RECENT_PAGE) })
  },
  toggleRecentsAll () {
    this.setData({ recentsAll: !this.data.recentsAll })
    this.loadRecents()
  },

  fmt (e) {
    const st = starsOf(e)
    return {
      id: e.id, name: e.name, en: e.en, type: e.type,
      artId: e.artId, glow: e.glow, rarity: e.rarity,
      starsOn: st.on, starsOff: st.off,
      subName: e.type === 'mon' ? (e.raw.biome || '')
        : (e.type === 'seed' ? ('种子 ' + (e.raw.code || ''))
        : (e.type === 'npc' ? (NGRP[e.raw.ngrp] || '城镇NPC')
        : (e.raw.cat === 'weapon' ? '武器 · ' + (e.raw.sub || '') : '')))
    }
  },

  refresh () {
    const { tab, cat, letter } = this.data
    let list = dex.ALL.filter(e => e.type !== 'seed') // 世界种子已独立成"特殊种子"页，图鉴不重复收录
    // 物品标签下的 NPC 二级筛选项
    if (tab === 'item' && cat === 'npc') list = list.filter(e => e.type === 'npc')
    else if (tab !== 'all') list = list.filter(e => e.type === tab)
    if (cat) list = list.filter(e => e.raw.cat === cat || e.type === cat || ((tab === 'boss' || tab === 'mon') && e.raw.tier === cat) || (cat === 'npc' && e.raw.ngrp === cat))
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
    store.pushRecent(id, entry.type)
    const r = entry.raw
    const isBoss = entry.type === 'boss'
    const isMon = entry.type === 'mon'
    const isSeed = entry.type === 'seed'
    const isNpc = entry.type === 'npc'
    // 获取方式文本 → 可跳转片段（提及的条目名/俗称自动变超链接）
    const obtainText = isBoss ? r.spawn : (isMon ? r.biome : (isSeed ? '创建世界时在"种子"栏输入上述代码（区分大小写）' : r.obtain))
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
        obtain: obtainText,
        obtainLinks: dex.linkify(obtainText, entry.id),
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
  // 半屏弹窗中的实体链接：关闭弹窗后跳转对应条目
  onSheetLink (e) {
    const id = e.currentTarget.dataset.id
    const entry = id && dex.byId[id]
    if (!entry) return
    this.setData({ sheet: null })
    this.loadRecents()
    store.pushRecent(entry.id, entry.type)
    dex.go(entry.id, entry.type)
  },
  closeSheet () { this.setData({ sheet: null }); this.loadRecents() },
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
  goSeedBook () { wx.navigateTo({ url: '/pages/seeds/seeds' }) },

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
