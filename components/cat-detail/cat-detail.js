// 全物品弹窗组件：与图鉴页弹窗（openCatSheet catitem 分支）完全一致的渲染
const dex = require("../../utils/dex")
const store = require("../../utils/store")
const catSearch = require("../../utils/catalog-search")
Component({
  properties: {
    item: { type: Object, value: null },
    theme: { type: String, value: "dark" },
    lift: { type: Boolean, value: false }
  },
  data: { vm: null, fav: false },
  observers: {
    item: function (v) {
      if (v && v.f) this.build(v)
      else this.setData({ vm: null })
    }
  },
  methods: {
    build(v) {
      const stats = [["分类", v.c]]
      if (v.d) stats.push(["伤害", v.d + (v.dt ? "（" + v.dt + "）" : "")])
      if (v.df) stats.push(["防御", v.df])
      if (v.u) stats.push(["使用时间", v.u])
      if (v.k) stats.push(["击退", v.k])
      if (v.hm) stats.push(["模式", "困难模式"])
      if (v.s) stats.push(["备注", v.s])
      const id = "cat:" + v.f
      const ob = v.ob || "非合成物品 · 通过掉落 / 购买 / 采集获得"
      this.setData({
        vm: {
          id: id, f: v.f, name: v.n, en: v.en, sprite: v.sprite, glow: v.rcol,
          catName: v.c, desc: v.t || "", stats: stats,
          obtain: ob, obtainLinks: dex.linkify(ob, id),
          use: v.use || "", useLinks: v.use ? dex.linkify(v.use, id) : []
        },
        fav: store.isFav(id)
      })
    },
    onClose() { this.triggerEvent("close") },
    onGo(e) { this.triggerEvent("go", { id: e.currentTarget.dataset.id }) },
    onFav() {
      const vm = this.data.vm
      if (!vm) return
      const added = store.toggleFav(vm.id, "item")
      this.setData({ fav: added })
      wx.vibrateShort && wx.vibrateShort({ type: "medium" })
    },
    onSheetLink(e) {
      const id = e.currentTarget.dataset.id
      if (!id) return
      if (id.indexOf("cat:") === 0) {
        const f = id.slice(4)
        wx.showLoading({ title: "加载中", mask: true })
        catSearch.getById(f).then(x => {
          wx.hideLoading()
          if (x) this.build(x)
          else wx.showToast({ title: "未找到该物品", icon: "none" })
        }).catch(() => { wx.hideLoading(); wx.showToast({ title: "加载失败，请重试", icon: "none" }) })
        return
      }
      const en = dex.byId[id]
      if (!en) return
      store.pushRecent(id, en.type)
      this.triggerEvent("go", { id: id })
    },
    noop() { }
  }
})
