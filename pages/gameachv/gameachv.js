// 泰拉成就：游戏官方 115 个成就，手动打勾 + 分类筛选 + 数据统计
const store = require('../../utils/store')
const { CATS, LIST } = require('../../data/gameAchievements')

const SUBS = [
  { k: '', n: '全部' },
  { k: 'collector', n: '📦 收藏家' },
  { k: 'explorer', n: '🧭 探险家' },
  { k: 'challenger', n: '⚔️ 挑战者' },
  { k: 'slayer', n: '💀 杀手' }
]
const STATES = [
  { k: '', n: '全部' },
  { k: 'done', n: '已完成' },
  { k: 'todo', n: '未完成' }
]

function fmtDate (ts) {
  const d = new Date(ts)
  return (d.getMonth() + 1) + '/' + d.getDate()
}

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: '',
    subs: SUBS, states: STATES,
    cat: '', state: '',
    list: [],
    // 统计
    done: 0, total: 0, pct: 0,
    recent: [],           // 最近达成 [{n, date}]
    catStats: []          // 各分类统计 [{k,n,icon,done,total,pct}]
  },

  onLoad () {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      total: LIST.length
    })
  },

  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
    this.refresh()
  },

  refresh () {
    const done = store.getGameAchv()
    // 全量统计
    const doneN = LIST.filter(a => done[a.id]).length
    // 最近达成（按时间倒序取 3）
    const recent = LIST
      .map(a => a.id && done[a.id] ? { n: a.n, date: fmtDate(done[a.id]), ts: done[a.id] } : null)
      .filter(Boolean)
      .sort((x, y) => y.ts - x.ts)
      .slice(0, 3)
    // 各分类统计
    const catStats = Object.keys(CATS).map(k => {
      const all = LIST.filter(a => a.cat === k)
      const d = all.filter(a => done[a.id]).length
      return {
        k, n: CATS[k].n, icon: CATS[k].icon,
        done: d, total: all.length,
        pct: all.length ? Math.round(d / all.length * 100) : 0
      }
    })
    // 筛选列表
    const { cat, state } = this.data
    let list = LIST
    if (cat) list = list.filter(a => a.cat === cat)
    if (state === 'done') list = list.filter(a => done[a.id])
    else if (state === 'todo') list = list.filter(a => !done[a.id])
    this.setData({
      list: list.map(a => ({
        id: a.id, n: a.n, en: a.en, d: a.d, tip: a.tip || '',
        catN: CATS[a.cat].n, catIcon: CATS[a.cat].icon, ver: a.ver,
        done: !!done[a.id], date: done[a.id] ? fmtDate(done[a.id]) : ''
      })),
      done: doneN,
      pct: Math.round(doneN / LIST.length * 100),
      recent, catStats
    })
  },

  // 打勾 / 取消
  onToggle (e) {
    const id = e.currentTarget.dataset.id
    const added = store.toggleGameAchv(id)
    wx.vibrateShort({ type: 'light' })
    if (added) wx.showToast({ title: '达成！', icon: 'none', duration: 600 })
    this.refresh()
  },

  onCat (e) { this.setData({ cat: e.currentTarget.dataset.k }); this.refresh() },
  onState (e) { this.setData({ state: e.currentTarget.dataset.k }); this.refresh() },

  back () { wx.navigateBack() },

  onShareAppMessage () {
    return {
      title: '我已达成 ' + this.data.done + '/' + this.data.total + ' 个泰拉成就',
      path: '/pages/gameachv/gameachv'
    }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚手册 · 泰拉成就' }
  }
})
