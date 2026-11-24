// 灾厄物品图鉴列表页：分类 tab + 阶段筛选 + 本地搜索，卡片点进详情
// 数据：calamity-items（批次1：Boss 掉落武器/饰品/药水/召唤物），图标清单 calamity-item-icons
const cal = require("../../data/calamity-items")
const ICONS = require("../../data/calamity-item-icons")

const TABS = [
  { k: "", n: "全部" },
  { k: "weapon", n: "武器" },
  { k: "accessory", n: "饰品" },
  { k: "potion", n: "药水" },
  { k: "summon", n: "召唤宠物", cats: ["summon", "pet", "mount"] },
  { k: "armor", n: "盔甲" }
]
const STGS = [
  { k: "", n: "全部阶段" },
  { k: "pre", n: "肉前" },
  { k: "hm", n: "肉后" },
  { k: "ml", n: "月主后" }
]
const CAT_NAME = {
  weapon: "武器", accessory: "饰品", armor: "盔甲",
  potion: "药水", summon: "召唤物", pet: "宠物", mount: "坐骑"
}
const CLS_NAME = {
  melee: "近战", ranged: "远程", magic: "魔法",
  summon: "召唤", rogue: "盗贼", none: "无职业"
}

function buildRows(cat, stg, kw) {
  const k = (kw || "").trim().toLowerCase()
  const cats = cat === "summon" ? ["summon", "pet", "mount"] : null
  const rows = []
  cal.items.forEach(e => {
    if (cat && cats ? cats.indexOf(e.cat) < 0 : (cat && e.cat !== cat)) return
    if (stg && e.stg !== stg) return
    if (k && (e.n + " " + (e.en || "")).toLowerCase().indexOf(k) < 0) return
    rows.push({
      id: e.id,
      n: e.n,
      en: e.en || "",
      catName: CAT_NAME[e.cat] || e.cat,
      clsName: e.cls ? (CLS_NAME[e.cls] || "") : "",
      rate: e.rate || "",
      tip1: (e.tip || "").split("\n")[0],
      icon: ICONS[e.id] || "",
      hasIcon: !!ICONS[e.id],
      initial: e.n.charAt(0)
    })
  })
  return rows
}

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: "",
    ver: cal.ver,
    tabs: TABS,
    stgs: STGS,
    cat: "",
    stg: "",
    kw: "",
    rows: [],
    shown: 0,
    totalAll: cal.items.length
  },
  pageSize: 40,
  onLoad () {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.themeClass()
    })
    this.build()
  },
  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.themeClass() })
  },
  build () {
    const rows = buildRows(this.data.cat, this.data.stg, this.data.kw)
    this._rows = rows
    this.setData({ rows: rows.slice(0, this.pageSize), shown: Math.min(rows.length, this.pageSize) })
  },
  onCat (e) {
    this.setData({ cat: e.currentTarget.dataset.k })
    this.build()
  },
  onStg (e) {
    this.setData({ stg: e.currentTarget.dataset.k })
    this.build()
  },
  onKw (e) {
    this.setData({ kw: e.detail.value })
    this.build()
  },
  clearKw () {
    this.setData({ kw: "" })
    this.build()
  },
  onReachBottom () {
    const rows = this._rows || []
    if (this.data.shown >= rows.length) return
    const next = Math.min(rows.length, this.data.shown + this.pageSize)
    this.setData({ rows: rows.slice(0, next), shown: next })
  },
  onItem (e) {
    wx.navigateTo({ url: "/pkg-cal/pages/calamity-item-detail/calamity-item-detail?id=" + e.currentTarget.dataset.id })
  },
  back () {
    const pages = getCurrentPages()
    if (pages.length > 1) wx.navigateBack()
    else wx.switchTab({ url: "/pages/home/home" })
  },
  onShareAppMessage () {
    return { title: "灾厄物品图鉴 · " + cal.items.length + " 条官方译名速查", path: "/pkg-cal/pages/calamity-item/calamity-item" }
  },
  onShareTimeline () {
    return { title: "灾厄物品图鉴 · " + cal.items.length + " 条官方译名速查" }
  }
})
