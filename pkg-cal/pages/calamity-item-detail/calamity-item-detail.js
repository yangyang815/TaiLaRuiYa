// 灾厄物品详情页：对齐原版图鉴详情页的结构与详细度
// 头图 hero（大图标+渐变光）→ 关键数据网格 → 物品效果 → 效果详解（36 条 Wiki 核录）→ 获取方式 → Boss 来源卡 → 悬浮分享
const cal = require("../../data/calamity-items")
const ICONS = require("../../data/calamity-item-icons")
const bosses = require("../../data/calamity-bosses")
const dex = require("../../../utils/dex")

const CAT_NAME = {
  weapon: "武器", accessory: "饰品", armor: "盔甲",
  potion: "药水", summon: "召唤物", pet: "宠物", mount: "坐骑", material: "材料"
}
const CLS_NAME = {
  melee: "近战", ranged: "远程", magic: "魔法",
  summon: "召唤", rogue: "盗贼", none: "无职业"
}
const STG_NAME = { pre: "困难模式前", hm: "困难模式", ml: "月亮领主后" }

// 灾厄物品名索引（对齐 Boss 页 linkify 模式）：获取方式文本里的灾厄物品名可点
let _lk = null
function calLinkIndex () {
  if (_lk) return _lk
  const names = []
  const map = {}
  cal.items.forEach((i) => {
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
function calLinkify (text) {
  const out = []
  if (!text) return out
  const s = String(text)
  const lk = calLinkIndex()
  lk.re.lastIndex = 0
  let last = 0
  let m
  while ((m = lk.re.exec(s)) !== null) {
    if (m.index > last) out.push({ s: s.slice(last, m.index) })
    out.push({ s: m[0], cal: lk.map[m[0]] })
    last = m.index + m[0].length
  }
  if (last < s.length) out.push({ s: s.slice(last) })
  return out
}
// 两级混合：灾厄物品优先，未命中的纯文本段再匹配原版图鉴（材料如玻璃瓶/暗影之魂跳原版详情页）
function buildObLinks (text) {
  const out = []
  calLinkify(text).forEach((seg) => {
    if (seg.cal) { out.push({ s: seg.s, cal: seg.cal }); return }
    dex.linkify(seg.s).forEach((v) => {
      if (v.ref) out.push({ s: v.s, dex: v.id })
      else if (out.length && !out[out.length - 1].cal && !out[out.length - 1].dex) out[out.length - 1].s += v.s
      else out.push({ s: v.s })
    })
  })
  return out
}

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: "",
    e: null,
    catName: "",
    clsName: "",
    stgName: "",
    bossName: "",
    icon: "",
    initial: "",
    tipLines: [],
    detailLines: [],
    stats: [],
    obText: "",
    obLinks: []
  },
  onLoad (options) {
    const app = getApp()
    const id = (options && options.id) || ""
    const e = cal.items.find(x => x.id === id) || cal.items.find(x => x.n === id) || null
    const boss = e && e.boss ? bosses.bosses.find(b => b.id === e.boss) : null
    const catName = e ? (CAT_NAME[e.cat] || e.cat) : ""
    const clsName = e && e.cls ? (CLS_NAME[e.cls] || "") : ""
    const stgName = e && e.stg ? (STG_NAME[e.stg] || "") : ""
    const bossName = boss ? boss.n : ""
    const tipLines = e && e.tip ? e.tip.split("\n") : []
    const detailLines = e && e.dts ? e.dts : []

    // 关键数据网格：武器数值打头（伤害/使用时间/击退/魔力/暴击），再按可用字段补分类信息
    const stats = []
    if (e) {
      if (e.dmg) stats.push(["伤害", e.dmg])
      if (e.use) stats.push(["使用时间", e.use])
      if (e.kb) stats.push(["击退", e.kb])
      if (e.mana) stats.push(["魔力消耗", e.mana])
      if (e.crit) stats.push(["暴击率", e.crit + "%"])
      if (e.rare) {
        const r = String(e.rare)
        const rareName = r === "rainbow" ? "彩虹" : r.indexOf("级") >= 0 || r.indexOf("专属") >= 0 || r === "A" ? r : r + " 级"
        stats.push(["稀有度", rareName])
      }
      stats.push(["物品类型", catName])
      if (clsName) stats.push(["职业定位", clsName])
      if (stgName) stats.push(["进度阶段", stgName])
      if (e.rate) stats.push(["掉落概率", e.rate])
      if (bossName && !e.rate) stats.push(["来源 Boss", bossName])
    }
    // 获取方式（对齐原版 obtain 区块）：ob 字段（Wiki 核录配方/购买/掉落）优先，Boss 掉落兜底
    // 文本做两级链接化：灾厄物品名跳灾厄详情，原版材料名跳原版图鉴详情
    let obText = e && e.ob ? e.ob : ""
    if (e && !obText && bossName) {
      obText = "击败「" + bossName + "」后掉落" + (e.rate ? "，掉率 " + e.rate : "") + "。"
    }
    const obLinks = buildObLinks(obText)
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.themeClass(),
      e: e,
      catName: catName,
      clsName: clsName,
      stgName: stgName,
      bossName: bossName,
      icon: e ? (ICONS[e.id] || "") : "",
      initial: e ? e.n.charAt(0) : "",
      tipLines: tipLines,
      detailLines: detailLines,
      stats: stats,
      obText: obText,
      obLinks: obLinks
    })
    if (e) wx.setNavigationBarTitle({ title: "灾厄图鉴 · " + e.n })
  },
  onLinkTap (e) {
    const d = e.currentTarget.dataset
    if (d.cal) wx.navigateTo({ url: "/pkg-cal/pages/calamity-item-detail/calamity-item-detail?id=" + d.cal })
    else if (d.dex) {
      const de = dex.byId[d.dex]
      if (de) wx.navigateTo({ url: "/pages/detail/detail?type=" + de.type + "&id=" + de.id })
    }
  },
  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.themeClass() })
  },
  onBoss () {
    const e = this.data.e
    if (e && e.boss) wx.navigateTo({ url: "/pkg-cal/pages/calamity-boss/calamity-boss?id=" + e.boss })
  },
  back () {
    const pages = getCurrentPages()
    if (pages.length > 1) wx.navigateBack()
    else wx.navigateTo({ url: "/pkg-cal/pages/calamity-item/calamity-item" })
  },
  onShareAppMessage () {
    const e = this.data.e
    return {
      title: e ? e.n + " · 灾厄物品速查" : "灾厄物品图鉴",
      path: "/pkg-cal/pages/calamity-item-detail/calamity-item-detail?id=" + (e ? e.id : "")
    }
  },
  onShareTimeline () {
    const e = this.data.e
    return { title: e ? e.n + " · 灾厄物品速查" : "灾厄物品图鉴" }
  }
})
