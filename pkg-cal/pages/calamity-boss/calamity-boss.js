// 灾厄 Boss 速查详情页：一个页面按 id 渲染全部 26 张卡
const cal = require("../../data/calamity-bosses")
const BOSS_ICONS = require("../../data/calamity-icons")
const ITEMS = require("../../data/calamity-items")

// 灾厄物品名 → id 索引（长度降序正则，对齐原版 dex.linkify 模式）：掉落文本里的物品名自动可点
let _lk = null
function calLinkIndex () {
  if (_lk) return _lk
  const names = []
  const map = {}
  ITEMS.items.forEach((i) => {
    if (i.n && i.n.length >= 2 && !map[i.n]) { map[i.n] = i.id; names.push(i.n) }
  })
  names.sort((a, b) => b.length - a.length)
  const re = new RegExp(
    "(" + names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")",
    "g"
  )
  _lk = { re: re, map: map }
  return _lk
}
function linkify (text) {
  const out = []
  if (!text) return out
  const s = String(text)
  const lk = calLinkIndex()
  lk.re.lastIndex = 0
  let last = 0
  let m
  while ((m = lk.re.exec(s)) !== null) {
    if (m.index > last) out.push({ ref: false, s: s.slice(last, m.index) })
    out.push({ ref: true, s: m[0], id: lk.map[m[0]] })
    last = m.index + m[0].length
  }
  if (last < s.length) out.push({ ref: false, s: s.slice(last) })
  return out
}

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: "",
    b: null,
    stageN: "",
    worldTag: "",
    next: null,
    dropLinks: [],
    hasDropLink: false
  },
  onLoad (options) {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.themeClass()
    })
    this.load(options.id)
  },
  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.themeClass() })
  },
  load (id) {
    const b = cal.bosses.find(x => x.id === id)
    if (!b) { wx.navigateBack(); return }
    const st = cal.stages.find(s => s.id === b.stage) || { n: "" }
    const nb = b.nextId ? cal.bosses.find(x => x.id === b.nextId) : null
    const dropLinks = (b.drops || []).map(line => linkify(line))
    this.setData({
      b: Object.assign({}, b, { icon: BOSS_ICONS[b.id] || "" }),
      stageN: st.n,
      worldTag: b.world ? cal.worldName[b.world] : "",
      next: nb ? { id: nb.id, n: nb.n, en: nb.en, icon: BOSS_ICONS[nb.id] || "" } : null,
      dropLinks: dropLinks,
      hasDropLink: dropLinks.some(row => row.some(seg => seg.ref))
    })
  },
  onLinkTap (e) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: "/pkg-cal/pages/calamity-item-detail/calamity-item-detail?id=" + id })
  },
  onNext (e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    this.load(id)
    wx.pageScrollTo({ scrollTop: 0, duration: 0 })
  },
  back () {
    const pages = getCurrentPages()
    if (pages.length > 1) wx.navigateBack()
    else wx.switchTab({ url: "/pages/home/home" })
  },
  onShareAppMessage () {
    // 分享卡片：灾厄红主题，Boss 官方图标 + 速查名（离屏 canvas 生成，失败回退截屏）
    // 注意：promise resolve 的对象会整体替换分享内容，必须带全 title/path
    const shareCard = require("../../../utils/share-card")
    const b = this.data.b
    const title = (b ? b.n : "灾厄 Boss") + "灾厄速查 · 打法要点与掉落物"
    const path = "/pkg-cal/pages/calamity-boss/calamity-boss?id=" + (b ? b.id : "")
    return {
      title: title,
      path: path,
      promise: shareCard.makeCard({
        title: b ? b.n : "灾厄 Boss",
        sub: "打法要点 · 掉落物 · 灾厄速查",
        icon: b ? b.icon : "",
        accent: "#E85555",
        style: "calamity"
      }).then((p) => {
        const r = { title: title, path: path }
        if (p) r.imageUrl = p
        return r
      })
    };
  },
  onShareTimeline () {
    return { title: (this.data.b ? this.data.b.n : "灾厄 Boss") + "灾厄速查 · 向导之书", query: this.data.b ? "id=" + this.data.b.id : "" };
  }
})
