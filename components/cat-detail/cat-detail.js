// 全物品图鉴 · 站内详情弹窗组件（首页/搜索页共用）
Component({
  properties: {
    // 完整条目：{ n, en, c, d, dt, df, r, rcol, rlab, u, k, t, ob, use, s, hm, sprite }
    item: { type: Object, value: null }
  },
  methods: {
    onClose () { this.triggerEvent('close') },
    noop () {}
  }
})
