// 钓鱼助手：今日推荐 / 渔夫任务 / 图鉴收集 / 搜索
const F = require('../../data/fishing')
const U = require('../../utils/fishing')
const store = require('../../utils/store')

const CATS = [
  { k: '', n: '全部' },
  { k: 'quest', n: '任务鱼' },
  { k: 'food', n: '可钓获' },
  { k: 'gear', n: '钓具药水' },
  { k: 'bait', n: '鱼饵' },
  { k: 'crate', n: '宝匣' }
]
const KIND_N = { quest: '任务鱼', food: '可钓获', gear: '钓具', bait: '鱼饵', crate: '宝匣' }

// 精灵图缺鱼类贴图，用鱼系 emoji 稳定替代（按 id 哈希固定）
const FISH_EMOJI = ['🐟', '🐠', '🐡', '🦈', '🦐', '🦀', '🐋', '🐙']
function emojiOf (id) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return FISH_EMOJI[h % FISH_EMOJI.length]
}

// 全量图鉴条目（任务鱼 + 可钓获 + 钓具 + 鱼饵 + 宝匣）
function buildAll () {
  const list = []
  F.QUEST_FISH.forEach(f => list.push({
    id: f.id, kind: 'quest', kindN: KIND_N.quest, name: f.name, en: f.en || '',
    emoji: emojiOf(f.id),
    line1: (F.BIOME_N[f.biome] || f.biome) + ' · ' + (F.TIME_N[f.time] || f.time) + (f.weather === 'rain' ? ' · 雨天限定' : ''),
    line2: f.note || '',
    extra: f.reward ? '🎁 奖励：' + f.reward : '',
    checkable: true
  }))
  F.FOOD_FISH.forEach(f => list.push({
    id: f.id, kind: 'food', kindN: KIND_N.food, name: f.name, en: f.en || '',
    emoji: emojiOf(f.id),
    line1: (F.BIOME_N[f.biome] || f.biome) + ' · ' + (F.TIME_N[f.time] || f.time),
    line2: f.note || '',
    extra: f.power ? '渔力 +' + f.power : '',
    checkable: true
  }))
  F.GEAR.forEach(g => list.push({
    id: g.id, kind: 'gear', kindN: KIND_N.gear, name: g.name, en: g.en || '',
    emoji: '🎣',
    line1: (g.power ? '渔力 +' + g.power + ' · ' : '') + (g.tier || ''),
    line2: g.source || '',
    extra: '',
    checkable: false
  }))
  F.BAITS.forEach(b => list.push({
    id: b.id, kind: 'bait', kindN: KIND_N.bait, name: b.name, en: b.en || '',
    emoji: '🐛',
    line1: '饵力 ' + b.power,
    line2: b.source || '',
    extra: '',
    checkable: false
  }))
  F.CRATES.forEach(c => list.push({
    id: c.id, kind: 'crate', kindN: KIND_N.crate, name: c.name, en: c.en || '',
    emoji: '📦',
    line1: c.tier === 'post' ? '困难模式' : '困难模式前',
    line2: c.loot || '',
    extra: '',
    checkable: false
  }))
  return list
}
const ALL = buildAll()

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: '',
    // 今日推荐
    clock: '',
    timeNight: false, // 当前选择（初始跟随现实时间）
    rain: false,
    timeN: '白天',
    avail: [],
    availTotal: 0,
    // 渔夫任务
    quest: null,
    // 图鉴
    cats: CATS,
    cat: '',
    kw: '',
    shown: [],
    // 进度
    prog: null
  },

  onLoad () {
    const app = getApp()
    const now = new Date()
    const hour = now.getHours()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : '',
      clock: (hour < 10 ? '0' + hour : '' + hour) + ':00',
      timeNight: hour >= 19 || hour < 5
    })
    this.refresh()
  },

  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
    this.refresh()
  },

  refresh () {
    const { timeNight, rain } = this.data
    // 今日推荐（夜选 20 点、昼选 12 点代入）
    const t = U.today(timeNight ? 20 : 12, rain)
    // 渔夫任务（按日期轮换）
    const d = new Date()
    const quest = U.dailyQuest(d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate())
    const done = store.getFishDone()
    this.setData({
      timeN: t.timeN,
      avail: t.fishes,
      availTotal: t.total,
      quest: Object.assign({}, quest, { done: done.indexOf(quest.id) >= 0 }),
      prog: U.progress(done),
      shown: this.filterList()
    })
  },

  /* ---------- 今日推荐：时间 / 天气切换 ---------- */
  onTime (e) {
    this.setData({ timeNight: e.currentTarget.dataset.n === '1' })
    this.refresh()
  },
  onRain (e) {
    this.setData({ rain: e.currentTarget.dataset.r === '1' })
    this.refresh()
  },

  /* ---------- 渔夫任务打卡 ---------- */
  onQuestDone () {
    const id = this.data.quest.id
    const added = store.toggleFish(id)
    wx.vibrateShort && wx.vibrateShort({ type: 'light' })
    wx.showToast({ title: added ? '已记录钓到 ' + this.data.quest.name : '已取消打卡', icon: 'none' })
    this.refresh()
  },

  /* ---------- 图鉴筛选 / 搜索 ---------- */
  onCat (e) {
    this.setData({ cat: e.currentTarget.dataset.k })
    this.setData({ shown: this.filterList() })
  },
  onKw (e) {
    this.setData({ kw: e.detail.value })
    this.setData({ shown: this.filterList() })
  },
  clearKw () {
    this.setData({ kw: '' })
    this.setData({ shown: this.filterList() })
  },

  filterList () {
    const { cat, kw } = this.data
    const done = new Set(store.getFishDone())
    let list = ALL
    if (cat) list = list.filter(x => x.kind === cat)
    if (kw) {
      const k = kw.toLowerCase()
      list = list.filter(x =>
        x.name.indexOf(kw) >= 0 ||
        (x.en || '').toLowerCase().indexOf(k) >= 0 ||
        (x.line1 || '').indexOf(kw) >= 0 ||
        (x.line2 || '').indexOf(kw) >= 0
      )
    }
    return list.map(x => Object.assign({}, x, { done: done.has(x.id) }))
  },

  /* ---------- 收集打勾 ---------- */
  onCheck (e) {
    const id = e.currentTarget.dataset.id
    const item = ALL.find(x => x.id === id)
    if (!item || !item.checkable) {
      wx.showToast({ title: '钓具/鱼饵/宝匣无需收集打卡', icon: 'none' })
      return
    }
    const added = store.toggleFish(id)
    wx.vibrateShort && wx.vibrateShort({ type: 'light' })
    if (added) wx.showToast({ title: '已收集 · ' + item.name, icon: 'none' })
    this.refresh()
  },

  back () { wx.navigateBack() },

  onShareAppMessage () {
    return { title: '泰拉瑞亚 · 钓鱼助手', path: '/pages/home/home' }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚 · 钓鱼助手' }
  }
})
