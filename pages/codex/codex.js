const BT = require('../../utils/back-top-behavior')
// 图鉴页：搜索联想 + 筛选 + 瀑布流卡片 + 半屏详情弹窗 + 收藏
// 性能：分页渲染（滚动增量加载）、图标传 artId 字符串、onShow 脏检查
const dex = require('../../utils/dex')
const catSearch = require('../../utils/catalog-search')
const catGroups = require('../../utils/cat-groups')
const fmt = require('../../utils/fmt')
const store = require('../../utils/store')
const { startClock } = require('../../utils/clock')
const plantseeds = require('../../data/plantseeds')

// 种植种子 → 图鉴行伪条目（type: plantseed，点击走站内详情卡）
const PS_ENTRIES = plantseeds.map(p => ({
  id: p.id, name: p.name, en: p.en, type: 'plantseed',
  artId: p.art, glow: p.color, rarity: 0,
  raw: { cat: p.type, herbName: p.herbName, bloom: p.bloom, found: p.found,
    desc: p.desc, bloomDetail: p.bloomDetail, potions: p.potions || [] }
}))
const PS_BY_ID = {}
PS_ENTRIES.forEach(e => { PS_BY_ID[e.id] = e })

const TABS = [
  { k: 'all', n: '全部' }, { k: 'item', n: '物品' }, { k: 'allitem', n: '全物品' },
  { k: 'mon', n: '敌怪' }, { k: 'boss', n: 'Boss' }, { k: 'npc', n: 'NPC' }
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
  behaviors: [BT],
  onPageScroll (e) {
    const show = e && e.scrollTop > 600
    if (show !== this.data.showBackTop) this.setData({ showBackTop: show })
  },
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
    allLoading: false, allLoadFail: false,
    sheet: null, sheetFav: false
  },
  _all: [],    // 当前筛选全量（内存）
  _sig: '',    // 筛选签名（onShow 脏检查）
  _timer: null, // 时钟定时器
  _catEntries: [],  // 全物品条目（异步加载 6317 条）
  _catById: {},     // id → 条目（搜索联想点击用）
  _catLoaded: false,
  _catChips: null,  // 全物品二级分类 chips（缓存）

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
    this.loadAllItems()
  },

  /* ---------- 全物品（wiki 全量 6317 条，分包异步加载） ---------- */
  loadAllItems (attempt) {
    attempt = attempt || 0
    catSearch.load().then(items => {
      if ((!items || !items.length) && attempt < 3) {
        setTimeout(() => this.loadAllItems(attempt + 1), 1500 * (attempt + 1))
        return
      }
      if (!items || !items.length) { this.setData({ allLoadFail: true, allLoading: false }); return }
      this._catEntries = items.map(x => {
        const m = catGroups.macroOf(x.c)
        return {
          id: 'cat:' + x.f,
          name: x.n, en: x.en, type: 'catitem',
          sprite: x.sprite, glow: x.rcol, rarity: x.r || 0,
          macro: m.k,
          raw: { cat: x.c || '其他', dmg: x.d, dt: x.dt, df: x.df, u: x.u, k: x.k,
            t: x.t, ob: x.ob, use: x.use, s: x.s, hm: x.hm, r: x.r }
        }
      })
      this._catById = {}
      this._catEntries.forEach(e => { this._catById[e.id] = e })
      this._catLoaded = true
      this._catChips = null
      // 当前正在看全物品标签 → 立即刷新；全部标签也要并入
      if (this.data.tab === 'allitem' || this.data.tab === 'all') this.refresh()
    }).catch(() => {
      if (attempt < 3) setTimeout(() => this.loadAllItems(attempt + 1), 1500 * (attempt + 1))
      else this.setData({ allLoadFail: true, allLoading: false })
    })
  },
  retryAll () {
    this.setData({ allLoadFail: false, allLoading: true })
    this.loadAllItems()
  },

  /* 全物品二级分类 chips（按条目数降序，"其他"固定最后） */
  allItemChips () {
    if (this._catChips) return this._catChips
    const cnt = {}
    this._catEntries.forEach(e => { cnt[e.macro] = (cnt[e.macro] || 0) + 1 })
    const groups = catGroups.GROUPS
      .map(g => ({ k: g.k, n: g.n, cnt: cnt[g.k] || 0 }))
      .filter(g => g.cnt > 0)
      .sort((a, b) => b.cnt - a.cnt)
    const other = this._catEntries.filter(e => e.macro === 'other').length
    const chips = [{ k: '', n: '全部', cnt: this._catEntries.length }].concat(groups)
    if (other) chips.push({ k: 'other', n: '其他', cnt: other })
    this._catChips = chips
    return chips
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
    if (e.type === 'catitem') {
      return {
        id: e.id, name: e.name, en: e.en, type: e.type,
        sprite: e.sprite, glow: e.glow, rarity: e.rarity,
        starsOn: st.on, starsOff: st.off,
        subName: e.raw.cat
      }
    }
    return {
      id: e.id, name: e.name, en: e.en, type: e.type,
      artId: e.artId, glow: e.glow, rarity: e.rarity,
      starsOn: st.on, starsOff: st.off,
      subName: e.type === 'mon' ? (e.raw.biome || '')
        : (e.type === 'seed' ? ('种子 ' + (e.raw.code || ''))
        : (e.type === 'plantseed' ? (e.raw.cat === 'herb' ? '药草种子' : '环境草种')
        : (e.type === 'npc' ? (NGRP[e.raw.ngrp] || '城镇NPC')
        : (e.raw.cat === 'weapon' ? '武器 · ' + (e.raw.sub || '') : ''))))
    }
  },

  refresh () {
    const { tab, cat, letter } = this.data
    // 种子 = 种植种子（药草/环境草种），与其他分类一样在图鉴页内筛选展示
    const seedMode = tab === 'item' && cat === 'seed'
    // 全物品标签：wiki 全量 6317 条，按宏观分组二级筛选
    if (tab === 'allitem') {
      let list = this._catEntries
      if (cat) list = list.filter(e => e.macro === cat)
      if (letter) {
        if (letter === '#') list = list.filter(e => !/^[a-z]/i.test((e.en || '')[0] || ''))
        else list = list.filter(e => (e.en || '').toLowerCase().startsWith(letter.toLowerCase()))
      }
      this._all = list
      this._sig = tab + '|' + cat + '|' + letter
      this.setData({
        cats: this._catLoaded ? this.allItemChips() : [],
        list: list.slice(0, PAGE).map(e => this.fmt(e)),
        total: list.length,
        allLoading: !this._catLoaded
      })
      return
    }
    let list
    if (seedMode) {
      list = PS_ENTRIES.slice()
    } else {
      list = dex.ALL.filter(e => e.type !== 'seed') // 世界种子有独立"特殊种子"页，不进图览
      if (tab !== 'all') list = list.filter(e => e.type === tab)
      if (cat) list = list.filter(e => e.raw.cat === cat || e.type === cat || ((tab === 'boss' || tab === 'mon') && e.raw.tier === cat) || (tab === 'npc' && e.raw.ngrp === cat))
    }
    if (letter) {
      if (letter === '#') list = list.filter(e => !/^[a-z]/i.test((e.en || '')[0] || ''))
      else list = list.filter(e => (e.en || '').toLowerCase().startsWith(letter.toLowerCase()))
    }
    this._all = list
    this._sig = tab + '|' + cat + '|' + letter
    const cats = (dex.CATS[tab] || [{ k: '', n: '全部' }]).slice()
    this.setData({
      cats,
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
    // 全物品联想（异步分包数据，序号防过期）
    if (!kw.trim()) return
    const reqId = (this._sugReqId = (this._sugReqId || 0) + 1)
    catSearch.search(kw, 6).then(hits => {
      if (reqId !== this._sugReqId || this.data.kw !== kw) return
      const catSug = hits.map(x => {
        const id = 'cat:' + x.f
        return { id, name: x.n, en: x.en, type: 'catitem', sprite: x.sprite, glow: x.rcol, tagsTxt: x.c || '' }
      })
      this.setData({ suggests: this.data.suggests.concat(catSug) })
    })
  },
  onSuggestTap (e) {
    const id = e.currentTarget.dataset.id
    if (id && id.indexOf('cat:') === 0) {
      const entry = this._catById[id]
      if (entry) { this.setData({ kw: '', suggests: [] }); this.openCatSheet(entry) }
      return
    }
    dex.go(id)
  },
  clearKw () { this.setData({ kw: '', suggests: [] }) },

  onCardTap (e) {
    const id = e.currentTarget.dataset.id
    const entry = dex.byId[id] || PS_BY_ID[id] || this._catById[id]
    if (!entry) return
    if (entry.type === 'catitem') { this.openCatSheet(entry); return }
    if (entry.type === 'plantseed') {
      const r = entry.raw
      this.setData({
        sheet: {
          id: entry.id, name: entry.name, en: entry.en, type: 'plantseed',
          artId: entry.artId, glow: entry.glow, rarity: entry.rarity,
          desc: r.desc,
          stats: [['所属药草', r.herbName], ['开花时间', r.bloom], ['生长地点', r.found]],
          obtainTitle: '种植要点',
          obtain: r.bloomDetail || r.found,
          obtainLinks: [],
          use: r.potions && r.potions.length ? '可制作：' + r.potions.join('、') : '',
          shop: [], shopNote: '', drops: [], phases: [], mechanics: [], exclusives: [], strategy: []
        },
        sheetFav: store.isFav(id)
      })
      return
    }
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
  /* 全物品条目 → 半屏详情卡 */
  openCatSheet (entry) {
    const r = entry.raw
    const stats = [['分类', r.cat]]
    if (r.dmg) stats.push(['伤害', r.dmg + (r.dt ? '（' + r.dt + '）' : '')])
    if (r.df) stats.push(['防御', r.df])
    if (r.u) stats.push(['使用时间', r.u])
    if (r.k) stats.push(['击退', r.k])
    if (r.hm) stats.push(['模式', '困难模式'])
    this.setData({
      sheet: {
        id: entry.id, name: entry.name, en: entry.en, type: 'catitem',
        sprite: entry.sprite, glow: entry.glow, rarity: entry.rarity,
        catName: r.cat,
        desc: r.t || '',
        stats,
        obtainTitle: '获得方式',
        obtain: r.ob || '非合成物品 · 通过掉落 / 购买 / 采集获得',
        obtainLinks: [],
        use: r.use || '',
        shop: [], shopNote: '', drops: [], phases: [], mechanics: [], exclusives: [], strategy: []
      },
      sheetFav: false
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
    if (s.type === 'plantseed' || s.type === 'catitem') return // 详情已完整展示在卡内
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
        features: [['物品收录', '统计中…'], ['敌怪档案', cnt('mon') + ' 只'], ['Boss 全录', cnt('boss') + ' 位'], ['NPC 图鉴', cnt('npc') + ' 位']],
        desc: '支持中文/拼音/别名搜索，掉落、属性、出现地点一查便知'
      },
      posterShow: true
    })
    this._fillPosterCounts()
  },

  /* 异步统计全物品图鉴真实数量（5701+），就绪后回填海报 */
  _fillPosterCounts () {
    const fbItem = dex.ALL.filter(e => e.type === 'item').length
    if (!this._posterCountsP) {
      this._posterCountsP = catSearch.load().catch(() => null).then(cats => ({ nCat: cats && cats.length }))
    }
    this._posterCountsP.then(({ nCat }) => {
      if (!this.data.posterShow || !this.data.posterData) return
      const f = this.data.posterData.features.slice()
      f[0] = ['物品收录', (nCat || fbItem) + ' 件']
      this.setData({ posterData: Object.assign({}, this.data.posterData, { features: f }) })
    })
  },
  closePoster () { this.setData({ posterShow: false }) }
})
