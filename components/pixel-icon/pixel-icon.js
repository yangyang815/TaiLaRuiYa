// 像素图标组件：官方精灵图优先（assets/sprites），否则回退纯 JS 编码像素画
// artId 传字符串（setData 传输量小），兼容旧 art 对象
const { renderArt } = require('../../utils/png')
const { ARTS } = require('../../utils/arts')
const SPRITES = require('../../data/spritemap')

let dpr = 2, winW = 375
try {
  const si = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
  dpr = Math.min(si.pixelRatio || 2, 3)
  winW = si.windowWidth || 375
} catch (e) { }

Component({
  properties: {
    art: { type: Object, value: null },
    artId: { type: String, value: '' },
    size: { type: Number, value: 96 } // rpx 期望尺寸（按短边）
  },
  data: { src: '', w: 0, h: 0, fit: false },
  observers: {
    'art, artId, size': function () { this.render() }
  },
  lifetimes: {
    attached () { this.render() }
  },
  methods: {
    render () {
      const p = this.properties
      const cssPx = Math.max(2, ((p.size || 96) / 750) * winW)
      // 官方精灵图：方形框 aspectFit 等比缩放
      if (p.artId && SPRITES[p.artId]) {
        const src = '/assets/sprites/' + p.artId + '.' + SPRITES[p.artId]
        if (src !== this.data.src || cssPx !== this.data.w) this.setData({ src, w: cssPx, h: cssPx, fit: true })
        return
      }
      // 回退：内存像素画 → PNG base64（缓存命中时零成本）
      const art = p.artId ? (ARTS[p.artId] || ARTS.stone) : p.art
      if (!art || !art.rows) return
      const per = Math.max(1, Math.round((cssPx * dpr) / art.w))
      const w = (art.w * per) / dpr
      const h = (art.h * per) / dpr
      const src = renderArt(art, per)
      if (src !== this.data.src) this.setData({ src, w, h, fit: false })
      else if (w !== this.data.w || h !== this.data.h) this.setData({ w, h })
    }
  }
})
