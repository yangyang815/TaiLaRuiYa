// 钓鱼助手：今日推荐 / 渔夫任务 / 图鉴收集 / 搜索
const F = require('../../data/fishing')
const U = require('../../utils/fishing')
const store = require('../../utils/store')
const { py } = require('../../utils/pinyin-mini')

const CATS = [
  { k: '', n: '全部' },
  { k: 'quest', n: '任务鱼' },
  { k: 'food', n: '可钓获' },
  { k: 'gear', n: '钓具药水' },
  { k: 'bait', n: '鱼饵' },
  { k: 'crate', n: '宝匣' }
]
const KIND_N = { quest: '任务鱼', food: '可钓获', gear: '钓具', bait: '鱼饵', crate: '宝匣' }

// 分组板块定义（顺序即页面展示顺序）
const GROUP_META = [
  { k: 'quest', n: '任务鱼', icon: '🎣', desc: '需先向渔夫接任务才会上钩', checkable: true },
  { k: 'food', n: '可钓获', icon: '🐟', desc: '随时可钓，用于料理与药水材料', checkable: true },
  { k: 'gear', n: '钓具与药水', icon: '🧪', desc: '提升渔力与钓获品质', checkable: false },
  { k: 'bait', n: '鱼饵', icon: '🐛', desc: '饵力越高，上钩越快', checkable: false },
  { k: 'crate', n: '宝匣', icon: '📦', desc: '钓上后开启可获取物资', checkable: false }
]

// 地形排序（组内按此顺序归拢，相近水域的鱼挨在一起）
const BIOME_ORDER = ['forest', 'snow', 'desert', 'jungle', 'ocean', 'sky', 'cavern', 'mushroom', 'honey', 'hallowed', 'corrupt', 'crimson', 'tundra', 'hell', 'any']
const biomeRank = b => { const i = BIOME_ORDER.indexOf(b); return i < 0 ? 99 : i }

// 精灵图缺鱼类贴图，用鱼系 emoji 稳定替代（按 id 哈希固定）
const FISH_EMOJI = ['🐟', '🐠', '🐡', '🦈', '🦐', '🦀', '🐋', '🐙']
function emojiOf (id) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return FISH_EMOJI[h % FISH_EMOJI.length]
}

// 全量图鉴条目（任务鱼 + 可钓获 + 钓具 + 鱼饵 + 宝匣，组内已排序）
function buildAll () {
  const list = []
  // 任务鱼：按地形归拢（森林→雪原→沙漠→丛林→海洋→天空→地下…）
  F.QUEST_FISH.slice()
    .sort((a, b) => biomeRank(a.biome) - biomeRank(b.biome) || a.name.localeCompare(b.name, 'zh'))
    .forEach(f => list.push({
    id: f.id, kind: 'quest', kindN: KIND_N.quest, name: f.name, en: f.en || '',
    emoji: emojiOf(f.id),
    line1: (F.BIOME_N[f.biome] || f.biome) + ' · ' + (F.TIME_N[f.time] || f.time) + (f.weather === 'rain' ? ' · 雨天限定' : ''),
    line2: f.note || '',
    extra: f.reward ? '🎁 奖励：' + f.reward : '',
    checkable: true
  }))
  // 可钓获：按地形归拢，同地形渔力高的在前
  F.FOOD_FISH.slice()
    .sort((a, b) => biomeRank(a.biome) - biomeRank(b.biome) || b.power - a.power)
    .forEach(f => list.push({
    id: f.id, kind: 'food', kindN: KIND_N.food, name: f.name, en: f.en || '',
    emoji: emojiOf(f.id),
    line1: (F.BIOME_N[f.biome] || f.biome) + ' · ' + (F.TIME_N[f.time] || f.time),
    line2: f.note || '',
    extra: f.power ? '渔力 +' + f.power : '',
    checkable: true
  }))
  // 钓具：按渔力从高到低
  F.GEAR.slice()
    .sort((a, b) => (b.power || 0) - (a.power || 0))
    .forEach(g => list.push({
    id: g.id, kind: 'gear', kindN: KIND_N.gear, name: g.name, en: g.en || '',
    emoji: '🎣',
    line1: (g.power ? '渔力 +' + g.power + ' · ' : '') + (g.tier || ''),
    line2: g.source || '',
    extra: '',
    checkable: false
  }))
  // 鱼饵：饵力从高到低
  F.BAITS.slice()
    .sort((a, b) => (b.power || 0) - (a.power || 0))
    .forEach(b => list.push({
    id: b.id, kind: 'bait', kindN: KIND_N.bait, name: b.name, en: b.en || '',
    emoji: '🐛',
    line1: '饵力 ' + b.power,
    line2: b.source || '',
    extra: '',
    checkable: false
  }))
  // 宝匣：困难模式前在前，困难模式在后
  F.CRATES.slice()
    .sort((a, b) => (a.tier === 'post' ? 1 : 0) - (b.tier === 'post' ? 1 : 0))
    .forEach(c => list.push({
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

/* ---------- 模糊搜索（拼音 / 英文 / 子序列 / 无序匹配，同图鉴页打分规则） ---------- */
// 子序列：kw 各字符按顺序出现在 s 中
function isSubseq (kw, s) {
  let i = 0
  for (const c of s) { if (c === kw[i]) { i++; if (i === kw.length) return true } }
  return false
}
// 无序包含：kw 每个字符都在 s 中出现
function hasAll (kw, s) {
  for (const c of kw) if (!s.includes(c)) return false
  return true
}

// 拼音索引（懒加载，减少启动开销）
let _pyIdx = null
function pyIndex () {
  if (_pyIdx) return _pyIdx
  _pyIdx = new Map()
  ALL.forEach(x => {
    const p = py(x.name)
    _pyIdx.set(x.id, { full: p.full, init: p.init, en: (x.en || '').toLowerCase() })
  })
  return _pyIdx
}

// 单条打分：0 为不命中
function scoreItem (x, kw) {
  const p = pyIndex().get(x.id)
  let sc = 0
  if (x.name.startsWith(kw)) sc = 100
  else if (x.name.includes(kw)) sc = 88
  else if (p.en === kw) sc = 84
  else if (p.en.startsWith(kw)) sc = 82
  else if (p.en.includes(kw)) sc = 72
  else if (p.full === kw) sc = 80
  else if (p.full.startsWith(kw)) sc = 74
  else if (p.full.includes(kw)) sc = 62
  else if (p.init === kw) sc = 70
  else if (kw.length >= 2 && p.init.startsWith(kw)) sc = 56
  else if (kw.length >= 2 && isSubseq(kw, x.name)) sc = 38
  else if (kw.length >= 3 && isSubseq(kw, p.en)) sc = 32
  else if (kw.length >= 2 && kw.length <= 6 && hasAll(kw, x.name)) sc = 25
  // 详情字段包含（地形 / 时间 / 来源等中文直搜）
  if (!sc) {
    if ((x.line1 || '').includes(kw)) sc = 40
    else if ((x.line2 || '').includes(kw)) sc = 30
  }
  return sc
}

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
    groups: [],
    shownTotal: 0,
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
      prog: U.progress(done)
    })
    this.setData(this.filterList())
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
    this.setData(this.filterList())
  },
  onKw (e) {
    this.setData({ kw: e.detail.value })
    this.setData(this.filterList())
  },
  clearKw () {
    this.setData({ kw: '' })
    this.setData(this.filterList())
  },

  /* 生成分组列表：每个类别一个板块，带收集进度；搜索时按相关度排序 */
  filterList () {
    const { cat, kw } = this.data
    const done = new Set(store.getFishDone())
    const k = (kw || '').trim().toLowerCase()
    const groups = GROUP_META
      .filter(m => !cat || cat === m.k)
      .map(m => {
        let items = ALL.filter(x => x.kind === m.k)
        if (k) {
          items = items
            .map(x => ({ x, sc: scoreItem(x, k) }))
            .filter(t => t.sc > 0)
            .sort((a, b) => b.sc - a.sc)
            .map(t => t.x)
        }
        items = items.map(x => Object.assign({}, x, { done: done.has(x.id) }))
        return Object.assign({}, m, {
          items,
          total: items.length,
          doneN: items.filter(x => x.done).length
        })
      })
      .filter(g => g.items.length)
    const shownTotal = groups.reduce((s, g) => s + g.total, 0)
    return { groups, shownTotal }
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
