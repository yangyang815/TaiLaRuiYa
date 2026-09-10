// 兼容页：旧版分享/收藏链接仍指向 /pkg-cat-N/pages/index/index，统一重定向到主包统一图鉴
// 关键：require 本卷数据，确保 batch.js 被编译进分包模块表（否则主包 require.async 报 module not defined）
const batch = require('../../data/batch.js')
Page({
  data: { n: (batch || []).length },
  onLoad (q) {
    const qs = q && Object.keys(q).length
      ? '?' + Object.keys(q).map(k => k + '=' + encodeURIComponent(q[k])).join('&')
      : ''
    wx.redirectTo({ url: '/pages/catalog/catalog' + qs })
  }
})
