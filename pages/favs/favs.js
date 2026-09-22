const dex = require("../../utils/dex")
const store = require("../../utils/store")
const catSearch = require("../../utils/catalog-search")
const TABS = [{ k: "all", n: "全部" }, { k: "item", n: "物品" }, { k: "mon", n: "敌怪" }, { k: "boss", n: "Boss" }, { k: "npc", n: "NPC" }, { k: "strategy", n: "攻略" }]
const TAGS = { boss: ["BOSS", "tag-boss"], mon: ["敌怪", "tag-mon"], seed: ["种子", "tag-seed"], npc: ["NPC", "tag-npc"], strategy: ["攻略", "tag-strat"], item: ["物品", "tag-item"] }
Page({
  data: { statusBarHeight: 20, navTop: 64, themeClass: "", tabs: TABS, tab: "all", favs: [], favCount: 0 },
  onLoad() {
    const app = getApp()
    this.setData({ statusBarHeight: app.globalData.sys && app.globalData.sys.statusBarHeight || 20, navTop: app.globalData.navTop || 64, capsuleRight: app.globalData.capsuleRight || 100, themeClass: app.themeClass() })
  },
  goBack() { wx.navigateBack() },
  onShow() {
    const app = getApp()
    this.setData({ themeClass: app.themeClass() })
    this.loadFavs()
  },
  loadFavs() {
    const raw = store.getFavs()
    // 同步部分：精品图鉴与攻略
    const sync = {}
    raw.forEach(f => {
      let base = null
      if (f.type === "strategy" || f.id.indexOf("strat_") === 0) {
        const s = dex.strats.find(x => "strat_" + x.id === f.id)
        if (s) base = { id: f.id, name: s.title, type: "strategy", artId: s.cover || "stone", glow: "#4CE0E0" }
      } else if (f.id.indexOf("cat:") !== 0) {
        const e = dex.byId[f.id]
        if (e) base = { id: f.id, name: e.name, type: e.type, artId: e.artId, glow: e.glow }
      }
      if (!base) return
      const tag = TAGS[base.type] || TAGS.item
      sync[f.id] = Object.assign(base, { label: tag[0], tagCls: tag[1] })
    })
    this.setData({ favs: raw.map(f => sync[f.id]).filter(Boolean), favCount: raw.map(f => sync[f.id]).filter(Boolean).length })
    // 全量目录物品（cat:）异步解析后按收藏顺序合并
    const catIds = raw.filter(f => f.id.indexOf("cat:") === 0).map(f => f.id)
    if (!catIds.length) return
    Promise.all(catIds.map(id => catSearch.getById(id.slice(4)).then(x => ({ id: id, entry: x })).catch(() => ({ id: id, entry: null })))).then(res => {
      const map = {}
      res.forEach(r => {
        if (r.entry) map[r.id] = { id: r.id, name: r.entry.n, type: "item", sprite: r.entry.sprite, glow: r.entry.rcol || "", label: "物品", tagCls: "tag-item" }
      })
      const list = raw.map(f => sync[f.id] || map[f.id]).filter(Boolean)
      this.setData({ favs: list, favCount: list.length })
    })
  },
  onTab(e) { this.setData({ tab: e.currentTarget.dataset.k }) },
  onFavTap(e) {
    const id = e.currentTarget.dataset.id
    if (id.indexOf("strat_") === 0) { wx.navigateTo({ url: "/pages/strategy/strategy?id=" + id.slice(6) }); return }
    if (id.indexOf("cat:") === 0) {
      getApp().globalData.pendingCatSheet = id
      wx.switchTab({ url: "/pages/codex/codex" })
      return
    }
    dex.go(id)
  },
  onFavRemove(e) { store.toggleFav(e.currentTarget.dataset.id); this.loadFavs() },
  onShareAppMessage() { return { title: "泰拉瑞亚手册 · 我的收藏", path: "/pages/my/my" } }
})
