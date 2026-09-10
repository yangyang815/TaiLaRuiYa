// 兼容页：旧版分享/收藏链接仍指向 /pkg-cat-N/pages/index/index，统一重定向到主包统一图鉴
Page({
  onLoad (q) {
    const qs = q && Object.keys(q).length
      ? '?' + Object.keys(q).map(k => k + '=' + encodeURIComponent(q[k])).join('&')
      : ''
    wx.redirectTo({ url: '/pages/catalog/catalog' + qs })
  }
})
