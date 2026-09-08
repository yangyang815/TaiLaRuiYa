// 首页：Banner / 功能宫格 / 今日热门 / 星空粒子 / 昼夜切换
const dex = require('../../utils/dex')
const fmt = require('../../utils/fmt')
const store = require('../../utils/store')
const achv = require('../../utils/achievements')
const remoteMsg = require('../../utils/remote-msg')
const { startClock } = require('../../utils/clock')
const fishUtil = require('../../utils/fishing')
const bossGuides = require('../../data/bossGuides')

const GRID = [
  { k: 'boss', n: 'Boss大全', art: 'boss_eye_cthulhu', go: 'list?type=boss' },
  { k: 'mon', n: '怪物图鉴', art: 'm_zombie', go: 'codex:mon' },
  { k: 'item', n: '物品百科', art: 'tab_book_on', go: 'codex:item' },
  { k: 'seed', n: '特殊种子', art: 'seed_zenith', url: '/pkgB-guide/pages/worldseeds/worldseeds' },
  { k: 'craft', n: '合成表', art: 'tab_anvil_on', go: 'tab:craft' },
  { k: 'weapon-rank', n: '武器排行', art: 'terra_blade', go: 'list?type=weapon-rank' },
  { k: 'accessory', n: '饰品推荐', art: 'ankh_shield', go: 'list?type=accessory' },
  { k: 'potion', n: '药水指南', art: 'healing_potion', go: 'list?type=potion' },
  { k: 'progress', n: '流程攻略', art: 'copper_pick', go: 'strategy:progress' },
  { k: 'event', n: '事件大全', art: 'boss_skeletron_prime', go: 'strategy:event' },
  { k: 'class', n: '职业养成', art: 'solar_armor', url: '/pkgA-tool/pages/career/career' },
  { k: 'build', n: '建造指南', art: 'workbench', url: '/pkgA-tool/pages/build/build' }
]

// 特色入口：与手册入口同款卡片结构，合并进宫格（共 17 个）
const ENTRIES = [
  { k: 'catalog', n: '全物品图鉴', art: 'stone', url: '/pkg-cat-1/pages/index/index' },
  { k: 'secrets', n: '隐藏知识库', art: 'gel_blue', url: '/pkgB-guide/pages/secrets/secrets' },
  { k: 'biomes', n: '生物群系', art: 'jungle_spore', url: '/pkgB-guide/pages/biomes/biomes' },
  { k: 'prefixes', n: '词条图鉴', art: 'npc_goblin', url: '/pkgB-guide/pages/prefixes/prefixes' }
]

// 本周挑战：标志性 Boss 一句话介绍（未命中时用通用文案）
const CHALLENGE_DESC = {
  duke_fishron: '水里来火里去的猪形飞龙',
  moon_lord: '月球领主，泰拉世界的最终考验',
  empress_of_light: '迅捷如光的精灵女王',
  wall_of_flesh: '地狱深处的血肉巨墙，肉前终点',
  plantera: '丛林深处暴走的食人花',
  golem: '神庙石像守卫，力量与雷电的化身',
  eye_of_cthulhu: '夜间袭来的克苏鲁之眼',
  skeletron: '地牢门口的诅咒骷髅老人',
  queen_bee: '丛林蜂巢中的蜂群女王',
  king_slime: '史莱姆之雨召唤的黏液之王',
  the_twins: '一对机械魔眼，注视即毁灭',
  destroyer: '钢铁长蛇，贯穿大地',
  lunatic_cultist: '拜月教首领，月光事件的开端',
  deerclops: '独眼巨鹿，寒冬的噩梦'
}

// 按周确定性轮换的本周挑战 Boss（以本地时区周一为一周起点）
function weekNumber () {
  const now = new Date()
  const day = (now.getDay() + 6) % 7 // 周一=0 … 周日=6
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day)
  return Math.floor(monday.getTime() / (7 * 86400000))
}

function weeklyChallenge () {
  const bosses = dex.ALL.filter(e => e.type === 'boss')
  const week = weekNumber()
  const e = bosses[week % bosses.length]
  if (!e) return null
  return {
    id: e.id, name: e.name, artId: e.artId, glow: e.glow,
    desc: CHALLENGE_DESC[e.id] || '本周的挑战目标，去会一会这位强敌吧'
  }
}


// 动态时段问候：6-12 早上好 / 12-18 下午好 / 其余 晚上好
function helloOf (h) {
  if (h >= 6 && h < 12) return '🌅 早上好'
  if (h >= 12 && h < 18) return '☀️ 下午好'
  return '🌙 晚上好'
}

// 日期行：M月d日 · 周X
/* ---------- 宫格构建：自定义排序优先，否则按使用频率降序，最近使用的加高亮 ---------- */
function buildGrid () {
  const g = store.getGrid()
  let list = GRID.concat(ENTRIES).map(x => ({ ...x }))
  if (g.order && g.order.length) {
    // 用户拖动过的自定义顺序（新增入口自动补到末尾）
    const by = {}
    list.forEach(x => { by[x.k] = x })
    const ordered = []
    g.order.forEach(k => { if (by[k]) { ordered.push(by[k]); delete by[k] } })
    Object.keys(by).forEach(k => ordered.push(by[k]))
    list = ordered
  } else {
    // 按使用频率降序（次数相同保持默认顺序）
    const use = g.use || {}
    list.sort((a, b) => (use[b.k] || 0) - (use[a.k] || 0))
  }
  const rec = new Set(g.recent || [])
  list.forEach(x => { x.recent = rec.has(x.k) })
  return list
}

// 热门条目短标签：优先玩家俗称，否则用类型名
function hotTag (e) {
  const alias = dex.aliasOf(e.id)
  if (alias && alias !== e.name) return alias
  return { boss: 'Boss', mon: '敌怪', item: '物品', npc: 'NPC', seed: '种子' }[e.type] || '热门'
}

// 热门分类切换
const HOT_CATS = [
  { k: 'all', n: '全部' }, { k: 'item', n: '物品' }, { k: 'boss', n: 'Boss' }, { k: 'strategy', n: '攻略' }
]
// 攻略分类 → 标签名
const STRAT_TAG = { progress: '流程', class: '职业', build: '建造', event: '事件', boss: '专题' }
// 趋势 → [图标, 样式类]
const TREND_META = { up: ['↑🔥', 't-up'], down: ['↓', 't-down'], flat: ['—', 't-flat'], new: ['NEW', 't-new'] }

// 最近浏览条目类型元信息（小图标 + 类型名）
const RECENT_META = {
  item: { ico: '🗡️', label: '物品' }, npc: { ico: '🧙', label: 'NPC' },
  mon: { ico: '👾', label: '敌怪' }, boss: { ico: '👑', label: 'Boss' },
  seed: { ico: '🌱', label: '种子' }, strategy: { ico: '📖', label: '攻略' }
}

/* ---------- 轮播 Banner：版本更新 / 本周挑战 / 新手指南 ---------- */
function buildSlides (weekly) {
  const slides = [
    { k: 'ver', ico: '📢', tag: '版本更新', title: '1.4.5 新内容上线！', sub: '新Boss与物品数据已就绪', artId: 'moon_lord', glow: '#FFB300', go: 'msgs' },
    weekly
      ? { k: 'weekly', ico: '🏆', tag: '本周挑战', title: weekly.name, sub: weekly.desc, artId: weekly.artId, glow: weekly.glow, go: 'weekly' }
      : null,
    { k: 'guide', ico: '🆕', tag: '新手指南', title: '12篇从萌新到通关', sub: '创建世界 · 第一天生存 · 挖矿建家', artId: 'npc_guide', glow: '#4CE0E0', go: 'guide' }
  ]
  return slides.filter(Boolean)
}

Page({
  data: {
    statusBarHeight: 20,
    navTop: 64,
    themeClass: '',
    daytime: false,
    greet: '',
    hello: '',       // 动态时段问候（🌅 早上好 / ☀️ 下午好 / 🌙 晚上好）
    clock: '',
    dateStr: '',     // 日期行：M月d日 · 周X
    hasMsgs: false,  // 消息中心有未读（铃铛红点）
    achvN: 0,        // 已解锁冒险成就数（成就入口角标）
    stars: [],
    weekly: null,
    grid: [],
    gridOpen: false,   // 宫格展开状态（默认收起 8 个）
    hasCustom: false,  // 是否为用户自定义排序
    dragging: false,   // 拖动排序中（锁定页面滚动）
    snapping: false,   // 松手落位瞬间（禁用过渡防反向滑动）
    hot: [],
    hotCats: HOT_CATS,
    hotCat: 'all',   // 当前热门分类：all | item | boss | strategy
    version: '1.4.5',
    // 轮播 Banner
    slides: [], slideCur: 0,
    // 最近浏览（横向滚动区）
    recents: [],
    // 全局搜索（首页内联面板）
    searchKw: '', searchFocus: false, searchPanel: null,
    hist: [], hotWords: [],
    // 分享海报
    posterShow: false, posterData: null
  },
  _timer: null,
  _drag: null,       // 拖动排序状态
  _touchActive: false,

  onLoad () {
    const app = getApp()
    const hour = new Date().getHours()
    const daytime = hour >= 6 && hour < 18
    const gs = store.getGrid()
    const weekly = weeklyChallenge()

    // 星空粒子：随机位置/时长/延迟（控制在 14 颗，避免与轮播争抢渲染帧）
    const stars = []
    for (let i = 0; i < 14; i++) {
      stars.push({
        left: (Math.random() * 100).toFixed(1) + '%',
        size: 4 + Math.floor(Math.random() * 5),
        dur: (6 + Math.random() * 8).toFixed(1) + 's',
        delay: -(Math.random() * 12).toFixed(1) + 's',
        op: (0.4 + Math.random() * 0.6).toFixed(2)
      })
    }

    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      navTop: app.globalData.navTop || 64,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : '',
      daytime,
      greet: daytime ? '白昼の泰拉' : '夜幕の泰拉',
      hello: helloOf(hour) + '，冒险者！',
      clock: fmt.fmtClock(new Date()),
      dateStr: fmt.fmtDateCn(new Date()),
      stars,
      weekly,
      grid: buildGrid(),
      gridOpen: gs.open,
      hasCustom: !!(gs.order && gs.order.length),
      hotDate: dex.hotDate(),
      version: store.getVersion(),
      slides: buildSlides(weekly),
      recents: this.buildRecents(),
      hist: store.getHist(),
      hotWords: dex.hotWordsSafe()
    })
    // 整分钟对齐刷新时钟 + 日期 + 时段问候（与其它 Tab 页同相位，跨分钟即跳变）
    this._timer = startClock(() => {
      const now = new Date()
      this.setData({
        clock: fmt.fmtClock(now),
        dateStr: fmt.fmtDateCn(now),
        hello: helloOf(now.getHours()) + '，冒险者！'
      })
    })
    this.loadHot()
    this.loadTopBadges()
  },

  // 最近浏览：最多记录 10 条，首页横滑展示 5 条
  buildRecents () {
    return store.getRecents().slice(0, 10).map(r => {
      const e = dex.byId[r.id]
      const meta = RECENT_META[r.type] || RECENT_META.item
      return {
        id: r.id, type: r.type,
        name: e ? e.name : r.id,
        artId: e ? e.artId : 'stone',
        glow: e ? e.glow : '#FFD700',
        ico: meta.ico, label: meta.label
      }
    }).slice(0, 5)
  },

  // 刷新顶部入口角标：消息未读红点 + 已解锁成就数
  loadTopBadges () {
    this.setData({
      hasMsgs: remoteMsg.unreadCount(store.getMsgRead()) > 0,
      achvN: achv.summary().unlocked
    })
    // 远程公告异步到达后，若带来新未读则即时亮起红点
    remoteMsg.refresh(list => {
      const n = list.filter(m => m.ts > store.getMsgRead()).length
      if ((n > 0) !== this.data.hasMsgs) this.setData({ hasMsgs: n > 0 })
    })
  },

  // 加载今日热门（支持分类过滤 + 热度趋势）
  loadHot (cat) {
    cat = cat || this.data.hotCat || 'all'
    let list
    if (cat === 'strategy') {
      list = dex.hotStrats(4).map(s => {
        const t = TREND_META[dex.hotStratTrend(s.id)] || TREND_META.flat
        return {
          id: s.id, name: s.title, type: 'strategy', artId: s.cover || 'stone', glow: '#FFB300',
          tag: STRAT_TAG[s.cat] || '攻略', trendIco: t[0], trendCls: t[1]
        }
      })
    } else {
      list = dex.hotByCat(4, cat).map(h => {
        const t = TREND_META[dex.hotTrend(h.id)] || TREND_META.flat
        return {
          id: h.id, name: h.name, type: h.type, artId: h.artId, glow: h.glow,
          tag: hotTag(h), trendIco: t[0], trendCls: t[1]
        }
      })
    }
    this.setData({ hotCat: cat, hot: list })
  },

  // 切换热门分类
  onHotCat (e) {
    const cat = e.currentTarget.dataset.cat
    if (cat && cat !== this.data.hotCat) this.loadHot(cat)
  },

  onUnload () {
    if (this._timer) { this._timer.stop(); this._timer = null }
    if (this._blurTimer) { clearTimeout(this._blurTimer); this._blurTimer = null }
  },

  onShow () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) this.getTabBar().init(0)
    const app = getApp()
    // 频率排序即时反馈：每次回到首页按最新使用情况重排
    if (!this._drag) this.setData({ grid: buildGrid() })
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
    // 跨周自动刷新本周挑战（页面缓存期间周一轮换）
    const weekly = weeklyChallenge()
    if (weekly && (!this.data.weekly || this.data.weekly.id !== weekly.id)) {
      this.setData({ weekly, slides: buildSlides(weekly) })
    }
    // 图鉴页跳转意图（宫格直达）
    const pending = app.globalData.pendingCodex
    if (pending) {
      app.globalData.pendingCodex = null
      wx.switchTab({ url: '/pages/codex/codex' })
    }
    // 跨天自动刷新今日热门 + 热门搜索词
    const today = dex.hotDate()
    if (today !== this.data.hotDate) {
      this.setData({ hotDate: today, hotWords: dex.hotWordsSafe() })
      this.loadHot()
    }
    // 问候语跨时段刷新 + 时钟校准 + 顶部角标 + 最近浏览（从详情页返回后同步）
    const now = new Date()
    this.setData({
      hello: helloOf(now.getHours()) + '，冒险者！',
      clock: fmt.fmtClock(now),
      dateStr: fmt.fmtDateCn(now),
      hist: store.getHist()
    })
    this.loadTopBadges()
    this.setData({ recents: this.buildRecents() })
  },

  /* ---------- 全局搜索（首页内联面板） ---------- */
  onSearchKw (e) {
    const kw = e.detail.value
    this.setData({ searchKw: kw })
    if (!kw.trim()) { this.setData({ searchPanel: null }); return }
    const hits = dex.search(kw)
    const items = hits.slice(0, 6).map(x => ({
      id: x.id, name: x.name, type: x.type, artId: x.artId, glow: x.glow,
      tag: { boss: 'Boss', mon: '敌怪', item: '物品', npc: 'NPC', seed: '种子' }[x.type] || '条目'
    }))
    const strats = dex.searchStrats(kw).slice(0, 3).map(s => ({ id: s.id, title: s.title }))
    const recipes = dex.recipeSearch(kw).slice(0, 3).map(r => ({ id: r.id, name: r.name, artId: r.artId }))
    const fishingHits = fishUtil.searchAll(kw).slice(0, 3)
    const guideHits = bossGuides.searchGuides(kw).slice(0, 3)
    this.setData({ searchPanel: { items, strats, recipes, fishingHits, guideHits, total: hits.length } })
  },
  onSearchFocus () {
    if (this._blurTimer) { clearTimeout(this._blurTimer); this._blurTimer = null }
    this.setData({ searchFocus: true })
  },
  onSearchBlur () {
    // 延迟收起：给面板内 chip 的点击留出触发窗口
    this._blurTimer = setTimeout(() => {
      this.setData({ searchFocus: false })
      this._blurTimer = null
    }, 260)
  },
  clearSearchKw () { this.setData({ searchKw: '', searchPanel: null }) },
  onHistClear () { store.clearHist(); this.setData({ hist: [] }) },
  _closePanel () {
    this.setData({ searchKw: '', searchPanel: null, searchFocus: false })
  },
  onPanelItem (e) {
    if (this.data.searchKw.trim()) store.pushHist(this.data.searchKw.trim())
    const id = e.currentTarget.dataset.id
    this._closePanel()
    dex.go(id)
  },
  onPanelStrat (e) {
    if (this.data.searchKw.trim()) store.pushHist(this.data.searchKw.trim())
    const id = e.currentTarget.dataset.id
    this._closePanel()
    wx.navigateTo({ url: '/pages/strategy/strategy?id=' + id })
  },
  onPanelRecipe (e) {
    if (this.data.searchKw.trim()) store.pushHist(this.data.searchKw.trim())
    const id = e.currentTarget.dataset.id
    this._closePanel()
    const app = getApp()
    app.globalData.pendingCraft = id
    wx.switchTab({ url: '/pages/craft/craft' })
  },
  // 钓鱼结果 → 钓鱼助手（带关键词直达筛选结果）
  onPanelFish (e) {
    if (this.data.searchKw.trim()) store.pushHist(this.data.searchKw.trim())
    const kw = e.currentTarget.dataset.kw
    this._closePanel()
    wx.navigateTo({ url: '/pkgA-tool/pages/fishing/fishing?kw=' + encodeURIComponent(kw) })
  },
  // Boss 攻略清单 → 深度攻略页
  onPanelGuide (e) {
    if (this.data.searchKw.trim()) store.pushHist(this.data.searchKw.trim())
    const id = e.currentTarget.dataset.id
    this._closePanel()
    wx.navigateTo({ url: '/pages/bossguide/detail?id=' + id })
  },
  // 面板中的历史/热门词：填入关键词即时搜索
  onPanelWord (e) {
    const w = e.currentTarget.dataset.w
    this.setData({ searchKw: w })
    this.onSearchKw({ detail: { value: w } })
  },
  // 查看全部 → 全屏搜索页（带关键词，历史已记录）
  goSearch () {
    const kw = this.data.searchKw.trim()
    if (kw) store.pushHist(kw)
    this.setData({ searchKw: '', searchPanel: null, searchFocus: false, hist: store.getHist() })
    wx.navigateTo({ url: '/pages/search/search' + (kw ? '?kw=' + encodeURIComponent(kw) : '') })
  },

  // 消息入口 → 消息中心
  goMsgs () { wx.navigateTo({ url: '/pages/messages/messages' }) },
  // 成就入口 → 冒险成就
  goAchv () { wx.navigateTo({ url: '/pkgB-guide/pages/achv/achv' }) },

  /* ---------- 轮播 Banner ---------- */
  onSlideChange (e) {
    this.setData({ slideCur: e.detail.current })
  },
  onSlideTap (e) {
    const slide = this.data.slides[e.currentTarget.dataset.k]
    if (!slide) return
    if (slide.go === 'msgs') this.goMsgs()
    else if (slide.go === 'weekly') this.onWeeklyTap()
    else if (slide.go === 'guide') this.goGuide()
  },

  /* ---------- 最近浏览 ---------- */
  onRecentTap (e) {
    const id = e.currentTarget.dataset.id
    const type = e.currentTarget.dataset.type
    store.pushRecent(id, type)
    dex.go(id, type)
  },
  // 查看全部 → 图鉴页（含最近浏览区块）
  onRecentsMore () { wx.switchTab({ url: '/pages/codex/codex' }) },

  onWeeklyTap () {
    if (this.data.weekly) dex.go(this.data.weekly.id, 'boss')
  },
  onGridTap (e) {
    const item = this.data.grid[e.currentTarget.dataset.index]
    if (!item) return
    store.tapGrid(item.k) // 记录使用频率 + 最近使用
    if (item.url) { wx.navigateTo({ url: item.url }); return }
    if (item.go.startsWith('list')) wx.navigateTo({ url: '/pages/list/list?' + item.go.split('?')[1] })
    else if (item.go.startsWith('codex')) {
      const tab = item.go.split(':')[1]
      getApp().globalData.pendingCodex = { tab }
      wx.switchTab({ url: '/pages/codex/codex' })
    } else if (item.go.startsWith('tab')) wx.switchTab({ url: '/pages/craft/craft' })
    else if (item.go.startsWith('strategy')) wx.navigateTo({ url: '/pages/strategy/strategy?cat=' + item.go.split(':')[1] })
  },
  onHotTap (e) { dex.go(e.currentTarget.dataset.id, e.currentTarget.dataset.type) },
  // 热门"更多"入口 → 搜索页（含热门搜索词）
  onHotMore () { wx.navigateTo({ url: '/pages/search/search' }) },
  goGuide () { wx.navigateTo({ url: '/pkgB-guide/pages/guide/guide' }) },

  /* ---------- 宫格：展开 / 收起 / 重置排序 ---------- */
  toggleGrid () {
    const open = !this.data.gridOpen
    store.toggleGridOpen(open)
    this.setData({ gridOpen: open })
  },
  resetOrder () {
    store.resetGridOrder()
    this.setData({ grid: buildGrid(), hasCustom: false })
    wx.showToast({ title: '已恢复按使用频率排序', icon: 'none' })
  },

  /* ---------- 宫格：长按拖动自定义排序（仅展开状态） ---------- */
  onCellTouchStart (e) {
    this._touchActive = true
    const t = e.touches && e.touches[0]
    if (t) this._lastTouch = { x: t.clientX, y: t.clientY }
    this._press(e, true)
  },
  onCellTouchEnd (e) {
    this._touchActive = false
    this._press(e, false)
    if (this._drag) this.endDrag()
  },
  onDragStart (e) {
    if (!this.data.gridOpen || this._drag) return
    const idx = e.currentTarget.dataset.index
    this.createSelectorQuery().selectAll('.g-cell').boundingClientRect(rects => {
      // 查询回调时手指可能已松开
      if (!rects || rects.length !== this.data.grid.length || !this._touchActive) return
      // 以最新触点为基准：消除异步查询期间手指移动造成的起手跳变
      const t = this._lastTouch || (e.touches && e.touches[0])
      if (!t) return
      this._drag = { from: idx, to: idx, sx: t.x, sy: t.y, rects, off: rects.map(() => ({ dx: 0, dy: 0 })) }
      this.setData({ dragging: true, ['grid[' + idx + '].dragging']: true })
      wx.vibrateShort && wx.vibrateShort({ type: 'light' })
      wx.showToast({ title: '拖到目标位置松手', icon: 'none', duration: 900 })
    }).exec()
  },
  onDragMove (e) {
    const t = e.touches && e.touches[0]
    if (!t) return
    // 拖拽未初始化（长按后的异步空窗）时持续记录触点
    if (!this._drag) {
      this._lastTouch = { x: t.clientX, y: t.clientY }
      return
    }
    const d = this._drag
    this._lastTouch = { x: t.clientX, y: t.clientY }
    // 卡片全程贴手指：偏移 = 当前触点 - 起手触点（永不重置基准，杜绝换槽跳格）
    const fdx = t.clientX - d.sx
    const fdy = t.clientY - d.sy
    // 目标槽位按"卡片中心"命中：中心须进入槽位内缩 10px 区域（迟滞容差，防止边界抖动来回切换）
    const fr = d.rects[d.from]
    const cx = fr.left + fr.width / 2 + fdx
    const cy = fr.top + fr.height / 2 + fdy
    let to = d.to
    for (let i = 0; i < d.rects.length; i++) {
      const r = d.rects[i]
      if (cx >= r.left + 10 && cx <= r.right - 10 && cy >= r.top + 10 && cy <= r.bottom - 10) {
        to = i
        break
      }
    }
    // 全量计算目标偏移：被拖卡片贴手指，区间内其余卡片平移一格让位（CSS 过渡平滑）
    const off = d.rects.map(() => ({ dx: 0, dy: 0 }))
    off[d.from].dx = fdx
    off[d.from].dy = fdy
    if (to > d.from) {
      for (let j = d.from + 1; j <= to; j++) {
        off[j].dx = d.rects[j - 1].left - d.rects[j].left
        off[j].dy = d.rects[j - 1].top - d.rects[j].top
      }
    } else if (to < d.from) {
      for (let j = to; j < d.from; j++) {
        off[j].dx = d.rects[j + 1].left - d.rects[j].left
        off[j].dy = d.rects[j + 1].top - d.rects[j].top
      }
    }
    // 只提交发生变化的项，降低 setData 开销（纯移动时仅被拖卡片 2 个键）
    const patch = {}
    let changed = false
    for (let i = 0; i < off.length; i++) {
      if (off[i].dx !== d.off[i].dx || off[i].dy !== d.off[i].dy) {
        patch['grid[' + i + ']._dx'] = off[i].dx
        patch['grid[' + i + ']._dy'] = off[i].dy
        changed = true
      }
    }
    d.off = off
    d.to = to
    if (changed) this.setData(patch)
  },
  endDrag () {
    const d = this._drag
    this._drag = null
    if (!d) return
    if (d.to !== d.from) {
      const grid = this.data.grid.slice()
      const item = grid.splice(d.from, 1)[0]
      grid.splice(d.to, 0, item)
      const clean = grid.map(x => ({ ...x, _dx: 0, _dy: 0, dragging: false }))
      store.saveGridOrder(clean.map(x => x.k))
      // 落位瞬间禁用过渡：让位卡片直接归位，避免过渡引起反向滑一格
      this.setData({ dragging: false, snapping: true, grid: clean, hasCustom: true })
      setTimeout(() => this.setData({ snapping: false }), 200)
      wx.vibrateShort && wx.vibrateShort({ type: 'light' })
      wx.showToast({ title: '排序已保存', icon: 'none' })
    } else {
      const patch = { dragging: false }
      this.data.grid.forEach((x, i) => {
        patch['grid[' + i + ']._dx'] = 0
        patch['grid[' + i + ']._dy'] = 0
        patch['grid[' + i + '].dragging'] = false
      })
      // 未换槽：保留过渡，卡片从手指处平滑弹回原位
      this.setData(patch)
    }
  },

  pressIn (e) { this._press(e, true) },
  pressOut (e) { this._press(e, false) },
  _press (e, on) {
    const k = 'grid[' + e.currentTarget.dataset.index + '].pressed'
    this.setData({ [k]: on })
  },

  onShareAppMessage () {
    return { title: '泰拉瑞亚手册 · 冒险者的随身百科', path: '/pages/home/home' }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚手册 · 冒险者的随身百科' }
  },

  /* ---------- 分享海报（品牌版式） ---------- */
  openPoster () {
    const nItem = dex.ALL.filter(e => e.type === 'item').length
    const nMon = dex.ALL.filter(e => e.type === 'mon').length
    const nBoss = dex.ALL.filter(e => e.type === 'boss').length
    const nRec = Object.keys(dex.R.byId).length
    this.setData({
      posterData: {
        mode: 'brand', tag: '随身百科',
        artId: 'zenith', color: '#FFD700',
        title: '泰拉瑞亚手册', sub: '冒险者的随身百科',
        features: [['物品图鉴', nItem + ' 收录'], ['敌怪档案', nMon + ' 收录'], ['Boss 图鉴', nBoss + ' 全录'], ['合成配方', nRec + ' 条']],
        desc: '查物品、看掉落、追合成路线，从开荒到毕业的全流程助手'
      },
      posterShow: true
    })
  },
  closePoster () { this.setData({ posterShow: false }) }
})
