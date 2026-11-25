// 灾厄职业配装指南页（二期模块 C）：五职业 × 14 进度节点
// 物品名三级解析：①灾厄物品图鉴（模块 A）②原版精选图鉴（dex）③全量图鉴（catSearch，异步兜底）
// "A+B+C" 复合散搭串自动拆片，逐片解析渲染
const C = require("../../data/calamity-careers")
const CAL = require("../../data/calamity-items")
const dex = require("../../../utils/dex")
const cs = require("../../../utils/catalog-search")

const CLS_DESC = {
  melee: "高防高伤，近身缠斗",
  ranged: "弹药远程，走位输出",
  magic: "魔力弹幕，范围压制",
  summon: "鞭子增伤，仆从输出",
  rogue: "灾厄独有职业，潜伏爆发"
}

// 模块级链接索引（构建一次）+ 全量图鉴异步解析缓存
let _lk = null
let _cat = new Map()
let _catBusy = false
let _catDone = false

function linkIndex () {
  if (_lk) return _lk
  const cal = new Map()
  const v = new Map()
  CAL.items.forEach((i) => { if (i.n && !cal.has(i.n)) cal.set(i.n, i.id) })
  dex.ALL.forEach((e) => {
    if (e.name && !cal.has(e.name) && !v.has(e.name)) v.set(e.name, { type: e.type, id: e.id })
  })
  _lk = { cal: cal, v: v }
  return _lk
}

// 单片解析（同步两级 + 已缓存的全量图鉴第三级）
function piece (name) {
  const lk = linkIndex()
  if (lk.cal.has(name)) return { n: name, cal: lk.cal.get(name) }
  const vv = lk.v.get(name)
  if (vv) return { n: name, dex: vv.id, t: vv.type }
  if (_cat.has(name)) return { n: name, cat: _cat.get(name) }
  return { n: name }
}

// 条目解析："A+B+C" 拆片
function entry (name) {
  if (name.indexOf("+") >= 0) {
    return { parts: name.split("+").map((p) => piece(p.trim().replace(/（[^）]*）/g, ""))) }
  }
  return { parts: [piece(name)] }
}
function entryAll (arr) {
  return (arr || []).map(entry)
}

// 收集未解析片段名，批量走全量图鉴 findByName，完成后回调重渲染
function resolveCatAsync (names, onDone) {
  if (_catDone) return
  const todo = []
  names.forEach((n) => {
    if (!n || _cat.has(n) || linkIndex().cal.has(n) || linkIndex().v.has(n)) return
    if (todo.indexOf(n) < 0) todo.push(n)
  })
  if (!todo.length || _catBusy) return
  _catBusy = true
  Promise.all(
    todo.map((n) =>
      cs
        .findByName(n)
        .then((e) => {
          if (e && e.f) _cat.set(n, e.f)
        })
        .catch(() => {})
    )
  )
    .then(() => {
      _catBusy = false
      _catDone = true
      if (onDone) onDone()
    })
    .catch(() => {
      _catBusy = false
      _catDone = true
    })
}

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: "",
    classes: [],
    cls: "",
    clsN: "",
    clsEn: "",
    clsIco: "",
    clsDesc: "",
    groups: []
  },
  onLoad (q) {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.themeClass(),
      classes: C.classes.map((c) => ({ id: c.id, n: c.n, ico: c.ico }))
    })
    this.pick(q && q.cls && C.classes.find((x) => x.id === q.cls) ? q.cls : C.classes[0].id)
  },
  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.themeClass() })
  },
  onCls (e) {
    const id = e.currentTarget.dataset.id
    if (id) this.pick(id)
  },
  pick (id) {
    const c = C.classes.find((x) => x.id === id)
    if (!c) return
    const groups = C.groups.map((g) => ({
      k: g.k,
      n: g.n,
      nodes: c.nodes
        .filter((nd) => nd.g === g.k)
        .map((nd) => ({
          n: nd.n,
          armor: entryAll(nd.armor),
          weapons: entryAll(nd.weapons),
          accs: entryAll(nd.accs),
          buffs: entryAll(nd.buffs),
          tip: nd.tip
        }))
    }))
    this.setData({
      cls: c.id,
      clsN: c.n,
      clsEn: c.en,
      clsIco: c.ico,
      clsDesc: CLS_DESC[c.id] || "",
      groups: groups
    })
    // 未解析片段走全量图鉴兜底（异步，完成后重渲染一次）
    const allNames = []
    c.nodes.forEach((nd) => [].concat(nd.armor || [], nd.weapons || [], nd.accs || [], nd.buffs || []).forEach((n) => {
      if (n.indexOf("+") >= 0) n.split("+").forEach((p) => allNames.push(p.trim().replace(/（[^）]*）/g, "")))
      else allNames.push(n)
    }))
    resolveCatAsync(allNames, () => {
      if (this.data.cls === c.id) this.pick(c.id)
    })
    wx.pageScrollTo({ scrollTop: 0, duration: 0 })
  },
  onItem (e) {
    const d = e.currentTarget.dataset
    if (d.cal) {
      wx.navigateTo({ url: "/pkg-cal/pages/calamity-item-detail/calamity-item-detail?id=" + d.cal })
    } else if (d.dex) {
      wx.navigateTo({ url: "/pages/detail/detail?type=" + (d.t || "item") + "&id=" + d.dex })
    } else if (d.cat) {
      wx.navigateTo({ url: "/pages/catalog/catalog?id=" + encodeURIComponent(d.cat) })
    }
  },
  back () {
    const pages = getCurrentPages()
    if (pages.length > 1) wx.navigateBack()
    else wx.navigateTo({ url: "/pkg-cal/pages/calamity/calamity" })
  },
  onShareAppMessage () {
    const c = C.classes.find((x) => x.id === this.data.cls)
    return {
      title: (c ? c.n : "灾厄") + "配装指南 · 全进度节点推荐",
      path: "/pkg-cal/pages/calamity-career/calamity-career?cls=" + this.data.cls
    }
  },
  onShareTimeline () {
    return { title: "灾厄职业配装指南 · 五职业全进度推荐" }
  }
})
