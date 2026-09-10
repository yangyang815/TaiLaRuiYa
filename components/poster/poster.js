// 分享海报组件：Canvas 2D 绘制，支持 条目(entry) / 品牌(brand) / 名片(card) 三种版式
// 修复：wx:if 挂载确保 canvas 随弹层销毁（原生组件不再残留导致"关不掉"）；属性更名 info 避免保留字冲突
const SPRITES = require('../../data/spritemap')
const { ARTS } = require('../../utils/arts')
const { renderArt } = require('../../utils/png')

const W = 540, H = 900 // 海报逻辑尺寸（内部按 dpr 放大保证清晰）

/* ---------- 工具 ---------- */
function rgba (hex, a) {
  if (!hex || hex[0] !== '#' || hex.length < 7) hex = '#FFD700'
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'
}
// 固定种子伪随机：每次绘制星空一致
function rnd (seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}
function roundRect (ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
function wrapLines (ctx, text, maxW, maxLines) {
  const out = []
  let line = ''
  let cut = false
  for (const ch of String(text || '')) {
    if (ctx.measureText(line + ch).width > maxW) {
      out.push(line); line = ch
      if (out.length >= maxLines) { cut = true; break }
    } else line += ch
  }
  if (!cut && line && out.length < maxLines) out.push(line)
  if (out.length > maxLines) out.length = maxLines
  // 仅在确实发生截断时才补省略号
  if (cut && out.length) {
    let last = out[out.length - 1]
    while (last && ctx.measureText(last + '…').width > maxW) last = last.slice(0, -1)
    out[out.length - 1] = (last || '') + '…'
  }
  return out
}
function diamond (ctx, x, y, r, fill) {
  ctx.beginPath()
  ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
}

Component({
  properties: {
    show: { type: Boolean, value: false },
    info: { type: Object, value: null } // { mode, name/title/nick, artId/avatarId, color, desc, tag, stats/features, ... }
  },
  data: { saving: false, cw: 300, ch: 500, closing: false },
  observers: {
    'show, info' () {
      if (this.properties.show) {
        this.setData({ closing: false })
        this.redraw()
      }
    }
  },
  lifetimes: {
    attached () {
      // 弹层内画布显示尺寸：适配屏幕，保持 540:900 比例
      try {
        const win = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
        const sc = Math.min((win.windowWidth - 52) / W, (win.windowHeight - 210) / H)
        this.setData({ cw: Math.round(W * sc), ch: Math.round(H * sc) })
      } catch (e) {
        this.setData({ cw: 300, ch: 500 })
      }
    }
  },
  methods: {
    /* 每次打开都重新查询画布节点（wx:if 关闭时已销毁，节点是新的）
       _paintSeq 序号防并发：info 异步更新触发重绘时，丢弃上一轮未完成的绘制 */
    redraw () {
      wx.nextTick(() => {
        this.createSelectorQuery().select('#posterCanvas').fields({ node: true }).exec(res => {
          if (!res || !res[0] || !res[0].node) return
          const canvas = res[0].node
          const dpr = Math.min((wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()).pixelRatio || 2, 3)
          canvas.width = W * dpr
          canvas.height = H * dpr
          const ctx = canvas.getContext('2d')
          ctx.scale(dpr, dpr)
          this._canvas = canvas
          const seq = (this._paintSeq = (this._paintSeq || 0) + 1)
          this.paint(ctx, canvas, seq)
        })
      })
    },

    /* 加载精灵图（官方图优先，回退像素画） */
    loadArt (canvas, artId, box) {
      return new Promise(resolve => {
        const img = canvas.createImage()
        img.onload = () => resolve(img)
        img.onerror = () => resolve(null)
        const ext = artId && SPRITES[artId]
        if (ext) img.src = '/assets/sprites/' + artId + '.' + ext
        else {
          const art = (artId && ARTS[artId]) || ARTS.stone
          const per = Math.max(1, Math.round(box / Math.max(art.w, art.rows.length)))
          img.src = renderArt(art, Math.min(per, 24))
        }
      })
    },

    /* ================= 主绘制 ================= */
    async paint (ctx, canvas, seq) {
      const stale = () => seq !== undefined && seq !== this._paintSeq
      const d = this.properties.info || {}
      const mode = d.mode || 'entry'
      const color = d.color || '#FFD700'
      const cx = W / 2

      /* ---- 1. 夜空背景 ---- */
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#26134C')
      bg.addColorStop(0.45, '#160A2E')
      bg.addColorStop(1, '#1F0F3E')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      /* ---- 2. 双色星云 ---- */
      const neb1 = ctx.createRadialGradient(100, 200, 20, 100, 200, 220)
      neb1.addColorStop(0, 'rgba(255,190,90,0.09)')
      neb1.addColorStop(1, 'rgba(255,190,90,0)')
      ctx.fillStyle = neb1
      ctx.fillRect(0, 0, W, 460)
      const neb2 = ctx.createRadialGradient(W - 90, 640, 20, W - 90, 640, 240)
      neb2.addColorStop(0, 'rgba(90,220,210,0.07)')
      neb2.addColorStop(1, 'rgba(90,220,210,0)')
      ctx.fillStyle = neb2
      ctx.fillRect(0, 380, W, 520)
      // 中央幽光
      const halo = ctx.createRadialGradient(cx, 300, 40, cx, 300, 340)
      halo.addColorStop(0, rgba(color, 0.12))
      halo.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = halo
      ctx.fillRect(0, 0, W, H)
      // 底部渐暗
      const vg = ctx.createLinearGradient(0, H - 230, 0, H)
      vg.addColorStop(0, 'rgba(10,5,20,0)')
      vg.addColorStop(1, 'rgba(10,5,20,0.55)')
      ctx.fillStyle = vg
      ctx.fillRect(0, H - 230, W, 230)

      /* ---- 3. 星尘 + 十字星 ---- */
      const r = rnd(20260823)
      for (let i = 0; i < 52; i++) {
        const x = 36 + r() * (W - 72), y = 36 + r() * (H - 72)
        const s = 0.5 + r() * 1.3, a = 0.12 + r() * 0.5
        ctx.beginPath()
        ctx.arc(x, y, s, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,' + a.toFixed(2) + ')'
        ctx.fill()
      }
      for (let i = 0; i < 6; i++) {
        const x = 60 + r() * (W - 120), y = 50 + r() * (H - 140)
        const l = 3 + r() * 4, a = 0.25 + r() * 0.35
        ctx.strokeStyle = 'rgba(255,240,200,' + a.toFixed(2) + ')'
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(x - l, y); ctx.lineTo(x + l, y); ctx.moveTo(x, y - l); ctx.lineTo(x, y + l); ctx.stroke()
      }

      /* ---- 4. 流星 ---- */
      ;[[86, 168, 1], [318, 108, 0.8]].forEach(s => {
        const x = s[0], y = s[1], len = 44 * s[2]
        const x2 = x + len, y2 = y + len * 0.42
        const grad = ctx.createLinearGradient(x, y, x2, y2)
        grad.addColorStop(0, 'rgba(255,255,255,0)')
        grad.addColorStop(1, 'rgba(255,250,230,0.75)')
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.4
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke()
        ctx.beginPath(); ctx.arc(x2, y2, 1.7, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,252,240,0.95)'; ctx.fill()
      })

      /* ---- 5. 像素月亮 ---- */
      this.drawMoon(ctx, W - 96, 98)

      /* ---- 6. 金色画框 ---- */
      ctx.strokeStyle = 'rgba(255,215,0,0.6)'
      ctx.lineWidth = 2
      roundRect(ctx, 20, 20, W - 40, H - 40, 18)
      ctx.stroke()
      ctx.strokeStyle = 'rgba(255,215,0,0.22)'
      ctx.lineWidth = 1
      roundRect(ctx, 29, 29, W - 58, H - 58, 12)
      ctx.stroke()
      ;[[20, 20], [W - 20, 20], [20, H - 20], [W - 20, H - 20]].forEach(c => diamond(ctx, c[0], c[1], 5, '#FFD700'))

      /* ---- 7. 内容版式 ---- */
      if (stale()) return
      if (mode === 'brand') await this.paintBrand(ctx, canvas, d, color, seq)
      else if (mode === 'card') await this.paintCard(ctx, canvas, d, color)
      else await this.paintEntry(ctx, canvas, d, color)

      /* ---- 8. 底部品牌区 ---- */
      if (stale()) return
      this.drawFooter(ctx, mode)
    },

    /* 像素月亮（10×10 网格 + 陨石坑） */
    drawMoon (ctx, mx, my) {
      const g = ctx.createRadialGradient(mx, my, 6, mx, my, 48)
      g.addColorStop(0, 'rgba(245,235,197,0.22)')
      g.addColorStop(1, 'rgba(245,235,197,0)')
      ctx.fillStyle = g
      ctx.fillRect(mx - 50, my - 50, 100, 100)
      const N = 10, half = 4.5, cell = 4.4
      const craters = ['2,3', '6,2', '7,5', '3,6', '5,4']
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          const dx = x - half, dy = y - half
          if (dx * dx + dy * dy > half * half + 0.4) continue
          ctx.fillStyle = craters.indexOf(x + ',' + y) >= 0 ? '#D9C89E' : '#F5EBC5'
          ctx.fillRect(mx + (x - half) * cell - cell / 2, my + (y - half) * cell - cell / 2, cell, cell)
        }
      }
    },

    /* 顶部类型胶囊 + 两侧渐隐装饰线 */
    drawTag (ctx, tag, color, y) {
      if (!tag) return
      const cx = W / 2
      ctx.font = 'bold 15px sans-serif'
      const tw = ctx.measureText(tag).width
      const pw = tw + 40
      roundRect(ctx, cx - pw / 2, y - 18, pw, 36, 18)
      ctx.fillStyle = rgba(color, 0.14)
      ctx.fill()
      ctx.strokeStyle = rgba(color, 0.55)
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillStyle = color
      ctx.textAlign = 'center'
      ctx.fillText(tag, cx, y + 5)
      ;[[-1, cx - pw / 2 - 12], [1, cx + pw / 2 + 12]].forEach(s => {
        const lx = s[1], dir = s[0]
        const lg = ctx.createLinearGradient(lx, 0, lx + dir * 70, 0)
        lg.addColorStop(0, 'rgba(255,215,0,0.5)')
        lg.addColorStop(1, 'rgba(255,215,0,0)')
        ctx.strokeStyle = lg
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(lx + dir * 70, y); ctx.stroke()
        diamond(ctx, lx, y, 3, 'rgba(255,215,0,0.7)')
      })
    },

    /* 中央精灵图：光晕 + 虚线金环 + 台座 + 投影 */
    async drawSprite (ctx, canvas, artId, color, cx, cy, box, ringR) {
      const glow = ctx.createRadialGradient(cx, cy, 16, cx, cy, box * 0.62)
      glow.addColorStop(0, rgba(color, 0.32))
      glow.addColorStop(0.6, rgba(color, 0.1))
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.fillRect(cx - box, cy - box, box * 2, box * 2)
      ctx.strokeStyle = rgba(color, 0.35)
      ctx.lineWidth = 1.5
      ctx.setLineDash([2, 6])
      ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2); ctx.stroke()
      ctx.setLineDash([])
      // 台座阴影
      ctx.save()
      ctx.translate(cx, cy + box * 0.51)
      ctx.scale(1, 0.3)
      const ped = ctx.createRadialGradient(0, 0, 4, 0, 0, box * 0.32)
      ped.addColorStop(0, rgba(color, 0.3))
      ped.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = ped
      ctx.beginPath(); ctx.arc(0, 0, box * 0.32, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
      const img = await this.loadArt(canvas, artId, box)
      if (img) {
        const sc = Math.min(box / img.width, box / img.height)
        const dw = img.width * sc, dh = img.height * sc
        ctx.save()
        ctx.shadowColor = rgba(color, 0.5)
        ctx.shadowBlur = 24
        ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh)
        ctx.restore()
      }
    },

    /* 渐变鎏金大字 */
    shimmerText (ctx, text, x, y, fs, color) {
      ctx.font = 'bold ' + fs + 'px sans-serif'
      const g = ctx.createLinearGradient(0, y - fs, 0, y)
      g.addColorStop(0, '#FFF6D8')
      g.addColorStop(0.45, '#FFD700')
      g.addColorStop(1, '#E8A400')
      ctx.save()
      ctx.shadowColor = rgba(color, 0.6)
      ctx.shadowBlur = 16
      ctx.fillStyle = g
      ctx.fillText(text, x, y)
      ctx.restore()
    },

    fitFont (ctx, text, fs, maxW) {
      ctx.font = 'bold ' + fs + 'px sans-serif'
      while (ctx.measureText(text).width > maxW && fs > 20) {
        fs -= 2
        ctx.font = 'bold ' + fs + 'px sans-serif'
      }
      return fs
    },

    /* 菱形分隔线 */
    drawDivider (ctx, y) {
      const cx = W / 2, sw = 150
      ;[-1, 1].forEach(dir => {
        const lg = ctx.createLinearGradient(cx, 0, cx + dir * sw, 0)
        lg.addColorStop(0, 'rgba(255,215,0,0.55)')
        lg.addColorStop(1, 'rgba(255,215,0,0)')
        ctx.strokeStyle = lg
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(cx + dir * 14, y); ctx.lineTo(cx + dir * sw, y); ctx.stroke()
      })
      diamond(ctx, cx, y, 5, '#FFD700')
    },

    /* 键值数据卡（entry 版式） */
    drawStatCards (ctx, stats, y) {
      const sts = (stats || []).filter(s => s && s.length >= 2 && s[1] !== undefined && s[1] !== null && s[1] !== '').slice(0, 4)
      if (!sts.length) return
      const cols = sts.length === 1 ? 1 : 2
      const rows = Math.ceil(sts.length / cols)
      const gw = cols === 1 ? 320 : 214, gh = 48, gap = 10
      const sx = W / 2 - (cols * gw + (cols - 1) * gap) / 2
      sts.forEach((s, i) => {
        const c = i % cols, rr = Math.floor(i / cols)
        const bx = sx + c * (gw + gap), by = y + rr * (gh + gap)
        roundRect(ctx, bx, by, gw, gh, 10)
        ctx.fillStyle = 'rgba(255,255,255,0.05)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,215,0,0.16)'
        ctx.lineWidth = 1
        ctx.stroke()
        diamond(ctx, bx + 16, by + 24, 2.5, 'rgba(255,215,0,0.55)')
        ctx.textAlign = 'left'
        ctx.font = '11px sans-serif'
        ctx.fillStyle = 'rgba(157,139,192,0.9)'
        ctx.fillText(String(s[0]), bx + 26, by + 28)
        const kw = ctx.measureText(String(s[0])).width
        const avail = gw - 26 - kw - 30
        let vfs = 15
        ctx.font = 'bold ' + vfs + 'px sans-serif'
        while (ctx.measureText(String(s[1])).width > avail && vfs > 10) {
          vfs -= 1
          ctx.font = 'bold ' + vfs + 'px sans-serif'
        }
        // 最小字号仍放不下时截断加省略号，杜绝文字伸出卡片
        let val = String(s[1])
        if (ctx.measureText(val).width > avail) {
          while (val.length > 1 && ctx.measureText(val + '…').width > avail) val = val.slice(0, -1)
          val += '…'
        }
        ctx.fillStyle = '#FFE08A'
        ctx.textAlign = 'right'
        ctx.fillText(val, bx + gw - 14, by + 28)
      })
    },

    /* ============ 版式一：条目海报 ============ */
    async paintEntry (ctx, canvas, d, color) {
      const cx = W / 2
      this.drawTag(ctx, d.tag, color, 66)
      await this.drawSprite(ctx, canvas, d.artId, color, cx, 302, 244, 146)
      const fs = this.fitFont(ctx, d.name || '', 36, 440)
      this.shimmerText(ctx, d.name || '', cx, 500, fs, color)
      ctx.textAlign = 'center'
      if (d.en) {
        ctx.font = '13px sans-serif'
        ctx.fillStyle = 'rgba(157,139,192,0.85)'
        ctx.fillText(d.en, cx, 527)
      }
      this.drawDivider(ctx, 556)
      this.drawStatCards(ctx, d.stats, 574)
      if (d.desc) {
        ctx.font = '13px sans-serif'
        ctx.fillStyle = 'rgba(185,169,214,0.92)'
        const lines = wrapLines(ctx, d.desc, 380, 2)
        lines.forEach((l, i) => ctx.fillText(l, cx, 710 + i * 22))
      }
    },

    /* ============ 版式二：品牌海报（首页/图鉴/合成） ============ */
    async paintBrand (ctx, canvas, d, color, seq) {
      const cx = W / 2
      this.drawTag(ctx, d.tag || '泰拉瑞亚手册', color, 64)
      await this.drawSprite(ctx, canvas, d.artId, color, cx, 296, 230, 138)
      // 绘制期间 info 被异步更新（数据统计回填）时放弃本轮，交给新一轮重绘
      if (seq !== undefined && seq !== this._paintSeq) return
      const title = d.title || '泰拉瑞亚手册'
      const fs = this.fitFont(ctx, title, 40, 460)
      this.shimmerText(ctx, title, cx, 486, fs, color)
      ctx.textAlign = 'center'
      if (d.sub) {
        ctx.font = '15px sans-serif'
        ctx.fillStyle = 'rgba(185,169,214,0.95)'
        ctx.fillText(d.sub, cx, 522)
      }
      this.drawDivider(ctx, 556)
      const feats = (d.features || []).filter(f => f && f.length >= 2).slice(0, 4)
      let rows = 0
      if (feats.length) {
        const cols = feats.length >= 2 ? 2 : 1
        const gap = 10, gw = cols === 1 ? 320 : 214, gh = 58
        rows = Math.ceil(feats.length / cols)
        const sx = cx - (cols * gw + (cols - 1) * gap) / 2
        feats.forEach((s, i) => {
          const c = i % cols, rr = Math.floor(i / cols)
          const bx = sx + c * (gw + gap), by = 576 + rr * (gh + gap)
          roundRect(ctx, bx, by, gw, gh, 12)
          ctx.fillStyle = 'rgba(255,255,255,0.05)'
          ctx.fill()
          ctx.strokeStyle = 'rgba(255,215,0,0.16)'
          ctx.lineWidth = 1
          ctx.stroke()
          diamond(ctx, bx + gw / 2, by + 13, 3, rgba(color, 0.65))
          ctx.textAlign = 'center'
          ctx.font = '11px sans-serif'
          ctx.fillStyle = 'rgba(157,139,192,0.9)'
          ctx.fillText(String(s[0]), bx + gw / 2, by + 33)
          ctx.font = 'bold 21px sans-serif'
          ctx.fillStyle = '#FFE08A'
          ctx.fillText(String(s[1]), bx + gw / 2, by + 52)
        })
      }
      if (d.desc) {
        ctx.font = '13px sans-serif'
        ctx.fillStyle = 'rgba(185,169,214,0.92)'
        const lines = wrapLines(ctx, d.desc, 390, 2)
        const dy = 576 + rows * 58 + (rows - 1) * 10 + 26
        lines.forEach((l, i) => ctx.fillText(l, cx, dy + i * 22))
      }
    },

    /* ============ 版式三：冒险者名片（我的页） ============ */
    async paintCard (ctx, canvas, d, color) {
      const cx = W / 2
      this.drawTag(ctx, '冒险者名片', color, 64)
      // 头像：光晕 + 虚线环 + 圆角方框裁剪
      const ay = 288, as = 124
      const glow = ctx.createRadialGradient(cx, ay, 10, cx, ay, 110)
      glow.addColorStop(0, rgba(color, 0.28))
      glow.addColorStop(0.6, rgba(color, 0.09))
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.fillRect(cx - 115, ay - 115, 230, 230)
      ctx.strokeStyle = rgba(color, 0.35)
      ctx.lineWidth = 1.5
      ctx.setLineDash([2, 6])
      ctx.beginPath(); ctx.arc(cx, ay, 100, 0, Math.PI * 2); ctx.stroke()
      ctx.setLineDash([])
      const img = await this.loadArt(canvas, d.avatarId, as)
      if (img) {
        ctx.save()
        roundRect(ctx, cx - as / 2, ay - as / 2, as, as, 22)
        ctx.clip()
        const sc = Math.max(as / img.width, as / img.height)
        const dw = img.width * sc, dh = img.height * sc
        ctx.drawImage(img, cx - dw / 2, ay - dh / 2, dw, dh)
        ctx.restore()
        roundRect(ctx, cx - as / 2, ay - as / 2, as, as, 22)
        ctx.strokeStyle = rgba(color, 0.6)
        ctx.lineWidth = 2
        ctx.stroke()
      }
      // 昵称
      ctx.textAlign = 'center'
      const nick = d.nick || '无名冒险家'
      const fs = this.fitFont(ctx, nick, 30, 400)
      this.shimmerText(ctx, nick, cx, 442, fs, color)
      // 等级胶囊
      const lvTxt = 'Lv.' + d.lv + ' · ' + (d.lvTitle || '见习冒险家')
      ctx.font = 'bold 16px sans-serif'
      const tw = ctx.measureText(lvTxt).width
      const pw = tw + 52, py = 472
      const lg = ctx.createLinearGradient(cx - pw / 2, 0, cx + pw / 2, 0)
      lg.addColorStop(0, '#FFE55C')
      lg.addColorStop(1, '#E5B800')
      roundRect(ctx, cx - pw / 2, py, pw, 40, 20)
      ctx.fillStyle = lg
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,240,176,0.8)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillStyle = '#3A2400'
      ctx.fillText(lvTxt, cx, py + 26)
      // 冒险值进度条
      const trackW = 320, bx = cx - trackW / 2, by = 546, th = 12
      roundRect(ctx, bx, by, trackW, th, 6)
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.fill()
      const ratio = Math.min(1, (d.cur || 0) / (d.need || 60))
      if (ratio > 0) {
        const fw = Math.max(th, trackW * ratio)
        const fg = ctx.createLinearGradient(bx, 0, bx + fw, 0)
        fg.addColorStop(0, '#E5B800')
        fg.addColorStop(1, '#FFE55C')
        ctx.save()
        ctx.shadowColor = 'rgba(255,215,0,0.4)'
        ctx.shadowBlur = 8
        roundRect(ctx, bx, by, fw, th, 6)
        ctx.fillStyle = fg
        ctx.fill()
        ctx.restore()
        diamond(ctx, bx + fw, by + th / 2, 5, '#FFE55C')
      }
      ctx.font = '12px sans-serif'
      ctx.fillStyle = 'rgba(185,169,214,0.9)'
      const maxed = (d.lv || 1) >= 10
      ctx.fillText(maxed
        ? '冒险值 ' + (d.pts || d.cur || 0) + ' · 已达最高等级'
        : '冒险值 ' + (d.cur || 0) + ' / ' + (d.need || 60) + ' · 距下一级还差 ' + Math.max(0, (d.need || 60) - (d.cur || 0)) + ' 分',
        cx, 588)
      // 三格数据
      const sts = (d.stats || []).slice(0, 3)
      if (sts.length) {
        const n = sts.length, gap = 12
        const cw2 = (320 - (n - 1) * gap) / n
        const sx = cx - 160
        sts.forEach((s, i) => {
          const bx2 = sx + i * (cw2 + gap), by2 = 614
          roundRect(ctx, bx2, by2, cw2, 58, 10)
          ctx.fillStyle = 'rgba(255,255,255,0.05)'
          ctx.fill()
          ctx.strokeStyle = 'rgba(255,215,0,0.16)'
          ctx.lineWidth = 1
          ctx.stroke()
          ctx.font = '11px sans-serif'
          ctx.fillStyle = 'rgba(157,139,192,0.9)'
          ctx.fillText(String(s[0]), bx2 + cw2 / 2, by2 + 24)
          ctx.font = 'bold 17px sans-serif'
          ctx.fillStyle = '#FFE08A'
          ctx.fillText(String(s[1]), bx2 + cw2 / 2, by2 + 45)
        })
      }
      if (d.desc) {
        ctx.font = '13px sans-serif'
        ctx.fillStyle = 'rgba(185,169,214,0.92)'
        const lines = wrapLines(ctx, d.desc, 380, 2)
        lines.forEach((l, i) => ctx.fillText(l, cx, 712 + i * 22))
      }
    },

    /* 底部品牌区 */
    drawFooter (ctx, mode) {
      const cx = W / 2
      const by = mode === 'brand' ? H - 112 : H - 120
      const bgline = ctx.createLinearGradient(70, 0, W - 70, 0)
      bgline.addColorStop(0, 'rgba(255,215,0,0)')
      bgline.addColorStop(0.5, 'rgba(255,215,0,0.5)')
      bgline.addColorStop(1, 'rgba(255,215,0,0)')
      ctx.strokeStyle = bgline
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(70, by); ctx.lineTo(W - 70, by); ctx.stroke()
      diamond(ctx, 70, by, 4, 'rgba(255,215,0,0.6)')
      diamond(ctx, W - 70, by, 4, 'rgba(255,215,0,0.6)')
      ctx.textAlign = 'center'
      if (mode === 'brand') {
        ctx.font = 'bold 15px sans-serif'
        ctx.save()
        ctx.shadowColor = 'rgba(255,215,0,0.45)'
        ctx.shadowBlur = 10
        ctx.fillStyle = '#FFD700'
        ctx.fillText('T E R R A R I A · H A N D B O O K', cx, by + 32)
        ctx.restore()
        ctx.font = '11px sans-serif'
        ctx.fillStyle = 'rgba(142,127,166,0.95)'
        ctx.fillText('微信搜索小程序「泰拉瑞亚手册」', cx, by + 56)
      } else {
        ctx.font = 'bold 19px sans-serif'
        ctx.save()
        ctx.shadowColor = 'rgba(255,215,0,0.5)'
        ctx.shadowBlur = 12
        ctx.fillStyle = '#FFD700'
        ctx.fillText('泰拉瑞亚手册', cx, by + 34)
        ctx.restore()
        ctx.font = '11px sans-serif'
        ctx.fillStyle = 'rgba(142,127,166,0.95)'
        ctx.fillText('冒险者的随身百科 · 物品 / Boss / 合成一查便知', cx, by + 58)
        ctx.font = '10px sans-serif'
        ctx.fillStyle = 'rgba(142,127,166,0.5)'
        ctx.fillText('微信搜索小程序「泰拉瑞亚手册」', cx, by + 78)
      }
    },

    /* ---------- 交互 ---------- */
    save () {
      if (this.data.saving || !this._canvas) return
      this.setData({ saving: true })
      wx.canvasToTempFilePath({
        canvas: this._canvas,
        success: res => {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              this.setData({ saving: false })
              wx.showToast({ title: '已保存，快去晒图', icon: 'success' })
            },
            fail: err => this.saveFail(err)
          })
        },
        fail: () => {
          this.setData({ saving: false })
          wx.showToast({ title: '生成海报失败', icon: 'none' })
        }
      })
    },
    saveFail (err) {
      this.setData({ saving: false })
      const msg = (err && err.errMsg) || ''
      // 隐私协议未同意（首次调用会自动弹窗，此处兜底被拒场景）
      if (msg.indexOf('privacy') >= 0) {
        wx.showModal({
          title: '需要同意隐私协议',
          content: '保存海报到相册需同意《用户隐私保护指引》，同意后再次点击保存即可',
          confirmText: '查看协议',
          success: r => {
            if (!r.confirm) return
            if (wx.openPrivacyContract) wx.openPrivacyContract()
            else wx.showToast({ title: '当前版本暂不支持查看', icon: 'none' })
          }
        })
        return
      }
      if (msg.indexOf('auth') >= 0 || msg.indexOf('deny') >= 0 || msg.indexOf('denied') >= 0) {
        wx.showModal({
          title: '需要相册权限',
          content: '请在设置中允许「保存到相册」，即可保存海报',
          confirmText: '去设置',
          success: r => { if (r.confirm) wx.openSetting() }
        })
      } else {
        wx.showToast({ title: '保存失败', icon: 'none' })
      }
    },

    /* 关闭：先播退出动画，再通知父级卸载（wx:if 销毁 canvas，杜绝残留） */
    close () {
      if (this.data.closing) return
      this.setData({ closing: true })
      setTimeout(() => this.triggerEvent('close'), 210)
    },
    noop () { }
  }
})
