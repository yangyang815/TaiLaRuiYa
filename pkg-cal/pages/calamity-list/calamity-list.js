// 灾厄二级列表页：按 type 渲染对应分类
//   all → BOSS 大全（三阶段分区全部 Boss）；pre / hm / ml → 单阶段 Boss 卡片网格（点卡进速查详情）
//   minis → 小 Boss 与隐藏 Boss 清单；vpath → 原版 Boss 路标清单
const cal = require("../../data/calamity-bosses")
const BOSS_ICONS = require("../../data/calamity-icons")

const TITLES = {
  all: "BOSS 大全",
  pre: "困难模式前",
  hm: "困难模式",
  ml: "月亮领主后",
  minis: "小 Boss 与隐藏 Boss",
  vpath: "原版 Boss 路标"
}
const SUBS = {
  all: "全部 Boss · 按阶段分区",
  pre: "PRE-HARDMODE",
  hm: "HARDMODE",
  ml: "POST-MOON LORD",
  minis: "MINI / HIDDEN",
  vpath: "VANILLA PATH"
}
const STAGE_EN = { pre: "PRE-HARDMODE", hm: "HARDMODE", ml: "POST-MOON LORD" }
const MINI_SUB = "共 " + cal.minibosses.length + " 只小 Boss"

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: "",
    title: "灾厄专区",
    sub: "",
    kind: "boss", // all = 三阶段分区的全部 Boss | boss = 单阶段卡片网格 | list = 文本清单
    stages: [],
    bosses: [],
    rows: [],
    hiddenNote: "",
    miniSub: MINI_SUB
  },
  onLoad (options) {
    const app = getApp()
    const type = (options && options.type) || "all"
    const data = {
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.themeClass()
    }
    if (type === "all") {
      // BOSS 大全：三个阶段分区，各阶段内按推进顺序排 Boss 卡片
      data.kind = "all"
      data.title = TITLES.all
      data.sub = SUBS.all
      data.stages = cal.stages.map(s => ({
        id: s.id, n: s.n, en: STAGE_EN[s.id] || "",
        bosses: cal.bosses
          .filter(b => b.stage === s.id)
          .sort((a, b) => a.order - b.order)
          .map(b => ({
            id: b.id, n: b.n, en: b.en,
            icon: BOSS_ICONS[b.id] || "",
            worldTag: b.world ? cal.worldName[b.world] : "",
            worldCls: b.world || ""
          }))
      }))
    } else if (type === "pre" || type === "hm" || type === "ml") {
      data.kind = "boss"
      data.title = TITLES[type] || "灾厄 Boss"
      data.sub = SUBS[type] || ""
      data.bosses = cal.bosses
        .filter(b => b.stage === type)
        .sort((a, b) => a.order - b.order)
        .map(b => ({
          id: b.id, n: b.n, en: b.en,
          icon: BOSS_ICONS[b.id] || "",
          worldTag: b.world ? cal.worldName[b.world] : "",
          worldCls: b.world || ""
        }))
    } else if (type === "minis") {
      data.kind = "list"
      data.title = TITLES.minis
      data.sub = SUBS.minis
      data.rows = cal.minibosses
      data.hiddenNote = cal.hiddenNote
    } else {
      data.kind = "list"
      data.title = TITLES.vpath
      data.sub = SUBS.vpath
      data.rows = cal.vanillaPath
    }
    this.setData(data)
  },
  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.themeClass() })
  },
  onBoss (e) {
    wx.navigateTo({ url: "/pkg-cal/pages/calamity-boss/calamity-boss?id=" + e.currentTarget.dataset.id })
  },
  // 相关内容入口（BOSS 大全页底部）：小 Boss / 原版路标 → 本页其它 type；机制 FAQ → 独立页
  onMinor (e) {
    const type = e.currentTarget.dataset.type
    if (type === "strategy") {
      // 无 id → 攻略页目录模式（26 篇分组列表）
      wx.navigateTo({ url: "/pkg-cal/pages/calamity-strategy/calamity-strategy" })
    } else if (type === "guide") {
      wx.navigateTo({ url: "/pkg-cal/pages/calamity-guide/calamity-guide" })
    } else {
      wx.navigateTo({ url: "/pkg-cal/pages/calamity-list/calamity-list?type=" + type })
    }
  },
  back () {
    const pages = getCurrentPages()
    if (pages.length > 1) wx.navigateBack()
    else wx.switchTab({ url: "/pages/home/home" })
  }
})
