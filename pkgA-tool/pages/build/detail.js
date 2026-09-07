// 案例详情：成品图 / 规格 / 材料 / 分步图解 / 布局 / 相关案例 / 建成打卡
const B = require('../../../utils/building')
const store = require('../../../utils/store')
const qrcode = require('../../../utils/qrcode')

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: '',
    id: '',
    info: null,
    videoModal: false, // 视频二维码弹窗
    qrImg: ''          // 二维码临时图片
  },

  onLoad (q) {
    const app = getApp()
    this.setData({
      id: q.id || '',
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : ''
    })
    this.refresh()
  },

  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
    this.refresh()
  },

  refresh () {
    const done = new Set(store.getBuildDone())
    const info = B.getCase(this.data.id, done)
    if (info) {
      wx.setNavigationBarTitle && wx.setNavigationBarTitle({ title: info.name })
      this.setData({ info })
    }
  },

  /* ---------- 建造视频：直接跳转B站小程序 ---------- */
  onVideo () {
    const url = this.data.info && this.data.info.video
    if (!url) return
    const m = url.match(/BV[a-zA-Z0-9]+/)
    if (!m) { this.showQrFallback(); return }
    wx.navigateToMiniProgram({
      appId: 'wx7564fd5313d24844', // 哔哩哔哩官方小程序
      path: 'pages/video/video?bvid=' + m[0],
      // 跳转失败（非用户取消）时回退到二维码弹窗
      fail: err => {
        if (err && /cancel/i.test(err.errMsg || '')) return
        this.showQrFallback()
      }
    })
  },

  /* 兜底：二维码弹窗（长按识别跳转） */
  showQrFallback () {
    this.setData({ videoModal: true, qrImg: this._qrImg || '' })
    if (!this._qrImg) wx.nextTick(() => this.drawQr())
  },

  /* 生成B站链接二维码（本地计算，无网络依赖） */
  drawQr () {
    const url = this.data.info && this.data.info.video
    if (!url) return
    this.createSelectorQuery()
      .select('#qrCanvas')
      .fields({ node: true, size: true })
      .exec(res => {
        if (!res || !res[0] || !res[0].node) return
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const size = res[0].width
        const dpr = ((wx.getWindowInfo && wx.getWindowInfo()) || {}).pixelRatio || 2
        canvas.width = size * dpr
        canvas.height = size * dpr
        const qr = qrcode(0, 'M')
        qr.addData(url)
        qr.make()
        const count = qr.getModuleCount()
        const quiet = 2 // 四周留白（识别率保障）
        const cell = canvas.width / (count + quiet * 2)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#000000'
        for (let r = 0; r < count; r++) {
          for (let c = 0; c < count; c++) {
            if (qr.isDark(r, c)) {
              ctx.fillRect(
                Math.floor((c + quiet) * cell),
                Math.floor((r + quiet) * cell),
                Math.ceil(cell), Math.ceil(cell)
              )
            }
          }
        }
        wx.canvasToTempFilePath({
          canvas,
          success: rt => {
            this._qrImg = rt.tempFilePath
            this.setData({ qrImg: rt.tempFilePath })
          },
          fail: () => {
            this.setData({ videoModal: true })
            wx.showToast({ title: '二维码生成失败，请用下方复制链接', icon: 'none' })
          }
        })
      })
  },

  closeVideo () { this.setData({ videoModal: false }) },

  noop () {},

  /* 复制链接（备用通道） */
  onCopyLink () {
    const url = this.data.info && this.data.info.video
    if (!url) return
    wx.setClipboardData({
      data: url,
      success: () => wx.showToast({ title: '链接已复制', icon: 'success' })
    })
  },

  /* ---------- 成品图点击放大 ---------- */
  onPreview () {
    const pic = this.data.info && this.data.info.pic
    if (!pic) return
    wx.previewImage({ urls: [pic] })
  },

  /* ---------- 建成打卡 ---------- */
  onDone () {
    const added = store.toggleBuild(this.data.id)
    wx.vibrateShort && wx.vibrateShort({ type: 'light' })
    wx.showToast({ title: added ? '恭喜建成 🎉' : '已取消打卡', icon: 'none' })
    this.refresh()
  },

  back () { wx.navigateBack() },

  onShareAppMessage () {
    const n = this.data.info ? this.data.info.name : '建造案例'
    return { title: '泰拉瑞亚 · ' + n + ' 建造图解', path: '/pages/home/home' }
  },
  onShareTimeline () {
    const n = this.data.info ? this.data.info.name : '建造案例'
    return { title: '泰拉瑞亚 · ' + n + ' 建造图解' }
  }
})
