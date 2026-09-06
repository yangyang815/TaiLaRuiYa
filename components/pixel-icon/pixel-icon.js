// 像素图标组件：官方精灵图优先（assets/sprites），否则回退纯 JS 编码像素画
// artId 传字符串（setData 传输量小），兼容旧 art 对象
// 性能说明：
//  - 精灵图路径走原生 <image>（微信按 src 缓存解码结果，同图多实例零重复成本）
//  - ARTS 回退路径由 utils/png.renderArt 按 (art, per) 模块级缓存，base64 全 app 只生成一次
//  - observers 在组件创建时即以初始值触发一次渲染，attached 不再重复执行（_done 防重入）
//  - image 开启 lazy-load：长列表视口外图标延迟加载
//  - 精灵图加载失败自动回退 ARTS/stone，杜绝破图
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
    attached () {
      // observers 已在创建时渲染过；个别基础库版本不触发时此处兜底（_done 防重入）
      if (!this._done) this.render()
    }
  },
  methods: {
    render () {
      this._done = true
      const p = this.properties
      // artId 变化时重置加载失败标记（新图可能正常）
      if (this._lastArtId !== p.artId) { this._err = false; this._lastArtId = p.artId }
      const cssPx = Math.max(2, ((p.size || 96) / 750) * winW)
      // 官方精灵图：方形框 aspectFit 等比缩放
      if (p.artId && SPRITES[p.artId] && !this._err) {
        const src = '/assets/sprites/' + p.artId + '.' + SPRITES[p.artId]
        if (src !== this.data.src || cssPx !== this.data.w) this.setData({ src, w: cssPx, h: cssPx, fit: true })
        return
      }
      // 回退：内存像素画 → PNG base64（renderArt 内置 (art, per) 模块级缓存，命中零成本）
      const art = p.artId ? (ARTS[p.artId] || ARTS.stone) : p.art
      if (!art || !art.rows) return
      const per = Math.max(1, Math.round((cssPx * dpr) / art.w))
      const w = (art.w * per) / dpr
      const h = (art.h * per) / dpr
      const src = renderArt(art, per)
      if (src !== this.data.src) this.setData({ src, w, h, fit: false })
      else if (w !== this.data.w || h !== this.data.h) this.setData({ w, h })
    },
    // 精灵图加载失败 → 回退 ARTS 像素画（或 stone），避免破图
    onImgError () {
      const p = this.properties
      if (this._err || !p.artId) return
      this._err = true
      this.render()
    }
  }
})
