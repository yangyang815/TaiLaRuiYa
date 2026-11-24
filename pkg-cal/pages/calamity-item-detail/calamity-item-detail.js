// 灾厄物品详情页：对齐原版图鉴详情页的结构与详细度
// 头图 hero（大图标+渐变光）→ 关键数据网格 → 物品效果 → 效果详解（36 条 Wiki 核录）→ 获取方式 → Boss 来源卡 → 悬浮分享
const cal = require("../../data/calamity-items")
const ICONS = require("../../data/calamity-item-icons")
const bosses = require("../../data/calamity-bosses")

const CAT_NAME = {
  weapon: "武器", accessory: "饰品", armor: "盔甲",
  potion: "药水", summon: "召唤物", pet: "宠物", mount: "坐骑"
}
const CLS_NAME = {
  melee: "近战", ranged: "远程", magic: "魔法",
  summon: "召唤", rogue: "盗贼", none: "无职业"
}
const STG_NAME = { pre: "困难模式前", hm: "困难模式", ml: "月亮领主后" }

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
    obText: ""
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
      stats.push(["物品类型", catName])
      if (clsName) stats.push(["职业定位", clsName])
      if (stgName) stats.push(["进度阶段", stgName])
      if (e.rate) stats.push(["掉落概率", e.rate])
      if (bossName && !e.rate) stats.push(["来源 Boss", bossName])
    }
    // 获取方式（对齐原版 obtain 区块）：ob 字段（Wiki 核录配方/购买/掉落）优先，Boss 掉落兜底
    let obText = e && e.ob ? e.ob : ""
    if (e && !obText && bossName) {
      obText = "击败「" + bossName + "」后掉落" + (e.rate ? "，掉率 " + e.rate : "") + "。"
    }
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
      obText: obText
    })
    if (e) wx.setNavigationBarTitle({ title: "灾厄图鉴 · " + e.n })
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
