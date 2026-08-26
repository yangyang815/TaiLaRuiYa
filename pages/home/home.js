// 首页：Banner / 功能宫格 / 今日热门 / 星空粒子 / 昼夜切换
const dex = require('../../utils/dex')
const store = require('../../utils/store')

const GRID = [
  { k: 'boss', n: 'Boss大全', art: 'boss_eye_cthulhu', go: 'list?type=boss' },
  { k: 'mon', n: '怪物图鉴', art: 'm_zombie', go: 'codex:mon' },
  { k: 'item', n: '物品百科', art: 'tab_book_on', go: 'codex:item' },
  { k: 'seed', n: '特殊种子', art: 'seed_zenith', go: 'codex:seed' },
  { k: 'craft', n: '合成表', art: 'tab_anvil_on', go: 'tab:craft' },
  { k: 'weapon-rank', n: '武器排行', art: 'terra_blade', go: 'list?type=weapon-rank' },
  { k: 'accessory', n: '饰品推荐', art: 'ankh_shield', go: 'list?type=accessory' },
  { k: 'potion', n: '药水指南', art: 'healing_potion', go: 'list?type=potion' },
  { k: 'progress', n: '流程攻略', art: 'copper_pick', go: 'strategy:progress' },
  { k: 'event', n: '事件大全', art: 'boss_skeletron_prime', go: 'strategy:event' },
  { k: 'class', n: '职业养成', art: 'solar_armor', go: 'strategy:class' },
  { k: 'build', n: '建造教程', art: 'workbench', go: 'strategy:build' }
]

// 特色入口：与手册入口同款卡片结构，合并进宫格（共 16 个）
const ENTRIES = [
  { k: 'secrets', n: '隐藏知识库', art: 'gel_blue', url: '/pages/secrets/secrets' },
  { k: 'biomes', n: '生物群系', art: 'jungle_spore', url: '/pages/biomes/biomes' },
  { k: 'seeds', n: '种子目录', art: 'daybloom_herb', url: '/pages/seeds/seeds' },
  { k: 'prefixes', n: '词条图鉴', art: 'npc_goblin', url: '/pages/prefixes/prefixes' }
]

Page({
  data: {
    statusBarHeight: 20,
    navTop: 64,
    themeClass: '',
    daytime: false,
    greet: '',
    stars: [],
    banners: [],
    bannerIdx: 0,
    grid: [],
    hot: [],
    version: '1.4.4',
    showUpdate: true,
    // 分享海报
    posterShow: false, posterData: null
  },

  onLoad () {
    const app = getApp()
    const hour = new Date().getHours()
    const daytime = hour >= 6 && hour < 18

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
      stars,
      banners: dex.BANNERS.map(b => ({ ...b })),
      grid: GRID.concat(ENTRIES).map(g => ({ ...g })),
      hotDate: dex.hotDate(),
      hot: dex.hotToday().map(h => ({ id: h.id, name: h.name, type: h.type, artId: h.artId, glow: h.glow })),
      version: store.getVersion()
    })
  },

  onShow () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) this.getTabBar().init(0)
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
    // 图鉴页跳转意图（宫格直达）
    const pending = app.globalData.pendingCodex
    if (pending) {
      app.globalData.pendingCodex = null
      wx.switchTab({ url: '/pages/codex/codex' })
    }
    // 跨天自动刷新今日热门
    const today = dex.hotDate()
    if (today !== this.data.hotDate) {
      this.setData({
        hotDate: today,
        hot: dex.hotToday().map(h => ({ id: h.id, name: h.name, type: h.type, artId: h.artId, glow: h.glow }))
      })
    }
  },

  onBannerChange (e) {
    const cur = e.detail.current
    if (cur !== this.data.bannerIdx) this.setData({ bannerIdx: cur })
  },
  onBannerTap (e) {
    const { type, ref } = e.currentTarget.dataset
    dex.go(ref, type)
  },
  onGridTap (e) {
    const item = this.data.grid[e.currentTarget.dataset.index]
    if (!item) return
    if (item.url) { wx.navigateTo({ url: item.url }); return }
    if (item.go.startsWith('list')) wx.navigateTo({ url: '/pages/list/list?' + item.go.split('?')[1] })
    else if (item.go.startsWith('codex')) {
      const tab = item.go.split(':')[1]
      getApp().globalData.pendingCodex = { tab }
      wx.switchTab({ url: '/pages/codex/codex' })
    } else if (item.go.startsWith('tab')) wx.switchTab({ url: '/pages/craft/craft' })
    else if (item.go.startsWith('strategy')) wx.navigateTo({ url: '/pages/strategy/strategy?cat=' + item.go.split(':')[1] })
  },
  onHotTap (e) { dex.go(e.currentTarget.dataset.id) },
  goSearch () { wx.navigateTo({ url: '/pages/search/search' }) },
  goGuide () { wx.navigateTo({ url: '/pages/guide/guide' }) },
  dismissUpdate () { this.setData({ showUpdate: false }) },
  syncUpdate () {
    this.setData({ showUpdate: false })
    wx.showToast({ title: '数据已是最新', icon: 'success' })
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
