// 兼容页 + 数据装载器：同步 require 本卷数据写入 globalData（主包经 globalData 读取，100% 兼容所有环境）
const batch = require('../../data/batch.js')
Page({
  data: { n: (batch || []).length },
  onLoad (q) {
    try { const app = getApp(); if (app) app.globalData['catVol' + 1] = batch } catch (e) {}
    if (q && q.loader) {
      // 装载模式：由图鉴页导航而来，写完数据即返回
      setTimeout(() => wx.navigateBack({ fail: () => wx.switchTab({ url: "/pages/codex/codex" }) }), 500)
      return
    }
    const qs = q && Object.keys(q).length
      ? '?' + Object.keys(q).map(k => k + '=' + encodeURIComponent(q[k])).join('&')
      : ''
    wx.redirectTo({ url: '/pages/catalog/catalog' + qs })
  }
})
