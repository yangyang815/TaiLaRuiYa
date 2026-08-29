// Boss 攻略详情：召唤方式 / 准备清单（可打勾）/ 战后收获
const dex = require('../../utils/dex')
const store = require('../../utils/store')
const { GUIDES, CATS } = require('../../data/bossGuides')

const CAT_ORDER = ['场地', '战士', '射手', '法师', '召唤师', '盔甲', '饰品', '药水', '技巧']
const CLASS_CATS = ['战士', '射手', '法师', '召唤师']
const CLASSES = [
  { k: '', n: '全部' },
  { k: '战士', n: '⚔️ 战士' },
  { k: '射手', n: '🏹 射手' },
  { k: '法师', n: '🔮 法师' },
  { k: '召唤师', n: '🪄 召唤师' }
]

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: '',
    id: '', name: '', en: '', artId: '', color: '#FFD700',
    summon: null,
    classes: CLASSES, cls: '',
    hasClassCats: true,
    groups: [],
    unlocks: [], next: '', nextId: '', nextName: '',
    done: 0, total: 0, pct: 0,
    defeated: false
  },

  onLoad (opts) {
    const app = getApp()
    const id = opts.id || ''
    const g = GUIDES[id]
    if (!g) { wx.showToast({ title: '攻略不存在', icon: 'none' }); setTimeout(() => wx.navigateBack(), 600); return }
    const e = dex.byId[id] || {}
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : '',
      id,
      name: e.name || id,
      en: e.en || '',
      artId: e.artId || 'boss_eye_cthulhu',
      color: (e.raw && e.raw.color) || '#FFD700',
      summon: g.summon,
      unlocks: g.post.unlocks || [],
      next: g.post.next || '',
      nextId: g.post.nextId || '',
      nextName: g.post.nextId ? ((dex.byId[g.post.nextId] || {}).name || '') : ''
    })
    this.refresh()
  },

  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
    if (this.data.id && GUIDES[this.data.id]) this.refresh()
  },

  // 重建分组清单 + 进度（按职业过滤）
  refresh () {
    const g = GUIDES[this.data.id]
    const checked = store.getBossChecks(this.data.id)
    const cls = this.data.cls
    const hasClassCats = g.prep.some(p => CLASS_CATS.indexOf(p.cat) >= 0)
    // 职业过滤：选职业时隐藏其他职业的推荐条目
    const visible = cls
      ? g.prep.filter(p => CLASS_CATS.indexOf(p.cat) < 0 || p.cat === cls)
      : g.prep
    const byCat = {}
    visible.forEach(p => {
      (byCat[p.cat] = byCat[p.cat] || []).push(Object.assign({}, p, { checked: !!checked[p.id] }))
    })
    const groups = CAT_ORDER.filter(c => byCat[c]).map(c => ({
      cat: c,
      icon: CATS[c] || '📌',
      items: byCat[c],
      done: byCat[c].filter(i => i.checked).length
    }))
    const total = visible.length
    const done = visible.filter(p => checked[p.id]).length
    this.setData({
      hasClassCats,
      groups,
      total, done,
      pct: total ? Math.round(done / total * 100) : 0,
      defeated: store.isDefeated(this.data.id)
    })
  },

  // 切换职业
  onCls (e) {
    const k = e.currentTarget.dataset.k || ''
    if (k === this.data.cls) return
    this.setData({ cls: k })
    this.refresh()
  },

  // 打勾 / 取消
  onToggle (e) {
    const gi = +e.currentTarget.dataset.g
    const ii = +e.currentTarget.dataset.i
    const item = this.data.groups[gi] && this.data.groups[gi].items[ii]
    if (!item) return
    store.toggleCheck(this.data.id, item.id)
    wx.vibrateShort({ type: 'light' })
    this.refresh()
  },

  // 跳转物品图鉴
  onLink (e) {
    const id = e.currentTarget.dataset.link
    if (!id) return
    if (dex.byId[id]) { dex.go(id); return }
    wx.showToast({ title: '该物品暂无图鉴页', icon: 'none' })
  },

  // 下一个 Boss
  goNext () {
    if (this.data.nextId) wx.redirectTo({ url: '/pages/bossguide/detail?id=' + this.data.nextId })
  },

  // 查看 Boss 图鉴
  goBoss () {
    dex.go(this.data.id)
  },

  toggleDefeated () {
    const added = store.toggleDefeated(this.data.id)
    this.setData({ defeated: added })
    wx.vibrateShort({ type: 'medium' })
    wx.showToast({ title: added ? '已标记击败！' : '已取消击败标记', icon: 'none' })
  },

  back () { wx.navigateBack() },

  onShareAppMessage () {
    return { title: '泰拉瑞亚攻略 · ' + this.data.name, path: '/pages/bossguide/detail?id=' + this.data.id }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚攻略 · ' + this.data.name }
  }
})
