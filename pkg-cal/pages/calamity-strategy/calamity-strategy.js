// 灾厄 Boss 深度攻略页（二期模块 B）：6 段结构化呈现，武器推荐运行时反查图鉴
const S = require("../../data/calamity-strategies")
const cal = require("../../data/calamity-bosses")
const BOSS_ICONS = require("../../data/calamity-icons")
const ITEMS = require("../../data/calamity-items")
const ICONS = require("../../data/calamity-item-icons")

const CLS_ORDER = [
  { k: "melee", n: "近战" },
  { k: "ranged", n: "远程" },
  { k: "magic", n: "魔法" },
  { k: "summon", n: "召唤" },
  { k: "rogue", n: "盗贼" }
]

// 分职业武器推荐：本 Boss 掉落武器按职业分组（每组 2-3 件），可点击跳物品详情
function buildClassRecs (bossId) {
  const pool = ITEMS.items.filter((i) => i.boss === bossId && i.cat === "weapon" && i.cls)
  const byCls = {}
  pool.forEach((i) => { (byCls[i.cls] = byCls[i.cls] || []).push(i) })
  return CLS_ORDER
    .filter((c) => byCls[c.k] && byCls[c.k].length)
    .map((c) => ({
      clsName: c.n,
      items: byCls[c.k].slice(0, 3).map((i) => ({
        id: i.id,
        n: i.n,
        dmg: i.dmg || "",
        icon: ICONS[i.id] || ""
      }))
    }))
}

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: "",
    mode: "detail",
    indexRows: [],
    total: 0,
    b: null,
    icon: "",
    st: null,
    classRecs: [],
    next: null,
    attacks: []
  },
  onLoad (options) {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.themeClass()
    })
    // 无 id（从 BOSS 大全「相关内容」进入）→ 目录模式；有 id → 单篇详情
    if (options && options.id && S.strategies[options.id] && cal.bosses.find((x) => x.id === options.id)) {
      this.load(options.id)
    } else {
      this.loadIndex()
    }
  },
  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.themeClass() })
  },
  load (id) {
    const b = cal.bosses.find((x) => x.id === id)
    if (!b) { wx.navigateBack(); return }
    const st = S.strategies[id]
    if (!st) {
      wx.showModal({ title: "暂无攻略", content: "该 Boss 的深度攻略正在整理中", showCancel: false })
      wx.navigateBack()
      return
    }
    // 攻击表：行内拆出弹幕名（加粗展示）
    const attacks = st.attacks.map((a) => ({ name: a[0], dmg: a[1], dodge: a[2] }))
    const nb = b.nextId ? cal.bosses.find((x) => x.id === b.nextId) : null
    this.setData({
      b: Object.assign({}, b, { icon: BOSS_ICONS[b.id] || "" }),
      icon: BOSS_ICONS[b.id] || "",
      st: {
        phases: st.phases,
        attacks: attacks,
        prep: st.prep,
        deaths: st.deaths,
        after: st.after
      },
      classRecs: buildClassRecs(id),
      next: nb ? { id: nb.id, n: nb.n, icon: BOSS_ICONS[nb.id] || "" } : null
    })
    wx.setNavigationBarTitle && wx.setNavigationBarTitle({ title: "深度攻略 · " + b.n })
  },
  // 目录模式：26 篇按阶段分组（从 BOSS 大全「相关内容」进入）
  loadIndex () {
    const STG = { pre: "困难模式前", hm: "困难模式", ml: "月亮领主后" }
    const indexRows = []
    ;["pre", "hm", "ml"].forEach((stg) => {
      const stgInfo = (cal.stages || []).find((s) => s.id === stg)
      const rows = cal.bosses
        .filter((b) => b.stage === stg && S.strategies[b.id])
        .map((b) => ({ id: b.id, n: b.n, en: b.en, icon: BOSS_ICONS[b.id] || "" }))
      if (rows.length) indexRows.push({ stgN: (stgInfo && stgInfo.n) || STG[stg], rows: rows })
    })
    const total = indexRows.reduce((s, g) => s + g.rows.length, 0)
    this.setData({ mode: "index", indexRows: indexRows, total: total })
    wx.setNavigationBarTitle && wx.setNavigationBarTitle({ title: "Boss 深度攻略" })
  },
  onPick (e) {
    const id = e.currentTarget.dataset.id
    if (!id || !S.strategies[id]) return
    this.load(id)
    wx.pageScrollTo({ scrollTop: 0, duration: 0 })
  },
  onItem (e) {
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
    else if (this.data.mode === "index" || !this.data.b) wx.switchTab({ url: "/pages/home/home" })
    else wx.navigateTo({ url: "/pkg-cal/pages/calamity-boss/calamity-boss?id=" + this.data.b.id })
  },
  onShareAppMessage () {
    const b = this.data.b
    return {
      title: (b ? b.n : "灾厄 Boss") + "深度攻略 · 开战前 5 分钟阅读",
      path: "/pkg-cal/pages/calamity-strategy/calamity-strategy?id=" + (b ? b.id : "")
    }
  },
  onShareTimeline () {
    const b = this.data.b
    return { title: b ? b.n + "深度攻略 · 灾厄专区" : "灾厄 Boss 深度攻略" }
  }
})
