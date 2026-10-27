// 兼容页 + 数据装载器：同步 require 本卷数据写入 globalData（主包经 globalData 读取，100% 兼容所有环境）
const batch = require('../../data/data-v2.js')
Page({
  data: { n: (batch || []).length },
  onLoad (q) {
    try { const app = getApp(); if (app) app.globalData['catVol' + 2] = batch } catch (e) {}
    if (q && q.loader) {
      // 装载模式：由图鉴页导航而来；带 next 队列时重定向到下一卷（整条链只进出页面栈一次，减少来回闪跳）
      const parts = ((q.next || '') + '').split(',')
      const next = parseInt(parts[0], 10) || 0
      const rest = parts.slice(1).join(',')
      setTimeout(() => {
        if (next > 0) {
          wx.redirectTo({
            url: '/pkg-cat-' + next + '/pages/index/index?loader=1&next=' + rest,
            fail: () => wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/codex/codex' }) })
          })
          return
        }
        wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/codex/codex' }) })
      }, 150)
      return
    }
    const qs = q && Object.keys(q).length
      ? '?' + Object.keys(q).map(k => k + '=' + encodeURIComponent(q[k])).join('&')
      : ''
    wx.redirectTo({ url: '/pages/catalog/catalog' + qs })
  }
})
