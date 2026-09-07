// 我的页：品牌区 / 用户信息卡 / 数据统计 / 功能列表
const dex = require('../../utils/dex')
const store = require('../../utils/store')
const achv = require('../../utils/achievements')
const fishing = require('../../utils/fishing')
const { startClock } = require('../../utils/clock')
const { CASES: BUILD_CASES } = require('../../data/building')
const { LIST: GACHV_LIST } = require('../../data/gameAchievements')

const AVATARS = ['ava_knight', 'ava_wizard', 'ava_slime', 'ava_eye', 'ava_bunny', 'ava_moon']
const VERSIONS = ['1.4.4', '1.4.5', '1.4.6']

function fmtClock (d) {
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return h + ':' + m
}

Page({
  data: {
    statusBarHeight: 20,
    navTop: 64,
    themeClass: '',
    clock: '',
    profile: { avatar: 'ava_knight', nick: '无名冒险家' },
    avatarArtId: 'ava_knight',
    level: { lv: 1, title: '见习冒险家', cur: 0, need: 60 },
    signature: '',
    // 统计
    bossN: 0, bossTotal: 0,
    favCount: 0,
    achvUnlocked: 0, achvTotal: 0,
    gAchvDone: 0, gAchvTotal: 0,
    // 设置
    versions: VERSIONS, version: '1.4.5', versionIndex: 1, dark: true,
    // 弹窗
    showAvas: false, avatars: [],
    showAbout: false,
    editingNick: false, nickDraft: '',
    // 存档备份
    showImport: false, importText: '', qrShow: false, qrBig: false
  },
  _timer: null,

  onLoad () {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      navTop: app.globalData.navTop || 64,
      avatars: AVATARS.map(a => ({ k: a })),
      clock: fmtClock(new Date())
    })
    // 整分钟对齐刷新右上角时钟（与其它 Tab 页同相位，跨分钟即跳变）
    this._timer = startClock(() => this.setData({ clock: fmtClock(new Date()) }))
  },

  onUnload () {
    if (this._timer) { this._timer.stop(); this._timer = null }
  },

  onShow () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) this.getTabBar().init(3)
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '', clock: fmtClock(new Date()) })
    this.refresh()
  },

  refresh () {
    const p = store.getProfile()
    const bossN = Object.keys(store.getDefeated()).length
    const bossTotal = dex.ALL.filter(e => e.type === 'boss').length
    const sum = achv.summary()
    const doneAchv = store.getGameAchv()
    const gAchvDone = GACHV_LIST.filter(a => doneAchv[a.id]).length
    const v = store.getVersion()
    const fprog = fishing.progress(store.getFishDone())
    this.setData({
      fishDone: fprog.done, fishTotal: fprog.total,
      buildDone: store.getBuildDone().length, buildTotal: BUILD_CASES.length,
      profile: p,
      avatarArtId: p.avatar || 'ava_knight',
      level: store.getLevel(),
      signature: achv.signature(),
      bossN, bossTotal,
      favCount: store.getFavs().length,
      achvUnlocked: sum.unlocked, achvTotal: sum.total,
      gAchvDone, gAchvTotal: GACHV_LIST.length,
      version: v,
      versionIndex: Math.max(0, VERSIONS.indexOf(v)),
      dark: store.getTheme() !== 'light'
    })
  },

  /* ---------- 头像 / 昵称 ---------- */
  openAvas () { this.setData({ showAvas: true }) },
  closeAvas () { this.setData({ showAvas: false }) },
  pickAva (e) {
    store.setProfile({ avatar: e.currentTarget.dataset.k })
    this.setData({ showAvas: false })
    this.refresh()
  },
  startEditNick () { this.setData({ editingNick: true, nickDraft: this.data.profile.nick }) },
  onNick (e) { this.setData({ nickDraft: e.detail.value }) },
  saveNick () {
    const nick = (this.data.nickDraft || '').trim().slice(0, 12) || '无名冒险家'
    store.setProfile({ nick })
    this.setData({ editingNick: false })
    this.refresh()
  },
  noop () {},

  /* ---------- 跳转 ---------- */
  goFavs () { wx.navigateTo({ url: '/pages/favs/favs' }) },
  goAchv () { wx.navigateTo({ url: '/pkgB-guide/pages/achv/achv' }) },
  goGameAchv () { wx.navigateTo({ url: '/pkgB-guide/pages/gameachv/gameachv' }) },
  goFishing () { wx.navigateTo({ url: '/pkgA-tool/pages/fishing/fishing' }) },
  goBuild () { wx.navigateTo({ url: '/pkgA-tool/pages/build/build' }) },
  goDps () { wx.navigateTo({ url: '/pkgA-tool/pages/dps/dps' }) },
  goNpcPlan () { wx.navigateTo({ url: '/pkgA-tool/pages/npcplan/npcplan' }) },
  goBosses () {
    const app = getApp()
    app.globalData.pendingCodex = { tab: 'boss' }
    wx.switchTab({ url: '/pages/codex/codex' })
  },

  /* ---------- 设置 ---------- */
  onVersion (e) {
    const v = VERSIONS[Number(e.detail.value)] || '1.4.5'
    if (v === this.data.version) return
    store.markFlag('versionSwitched')
    getApp().setVersion(v)
    this.refresh()
    wx.showToast({ title: '数据版本：' + v, icon: 'none' })
  },
  onTheme (e) {
    const light = !e.detail.value
    store.markFlag('themeSwitched')
    getApp().setTheme(light ? 'light' : 'dark')
    this.setData({ themeClass: light ? 'theme-light' : '', dark: !light })
    // 底部导航栏同步换肤
    if (typeof this.getTabBar === 'function' && this.getTabBar() && this.getTabBar().syncTheme) {
      this.getTabBar().syncTheme()
    }
  },
  /* ---------- 存档备份（导出 / 导入） ---------- */
  // 紧凑表示：去掉时间戳等冗余（导入时重建），让满进度存档也能塞进二维码
  buildCompact (data) {
    const c = {}
    if (data.fav) c.fav = data.fav.map(f => f.id)
    if (data.boss) c.boss = Object.keys(data.boss)
    if (data.gachv) c.gachv = Object.keys(data.gachv)
    if (data.fish) c.fish = data.fish
    if (data.career) c.career = { cls: data.career.cls, done: Object.keys(data.career.done || {}) }
    if (data.recent) c.recent = data.recent.map(r => r.id)
    ;['checks', 'build', 'grid', 'profile', 'flags', 'ver', 'theme', 'stats', 'hist']
      .forEach(k => { if (data[k] !== undefined) c[k] = data[k] })
    return { app: 'terra-handbook-save', ver: 2, time: new Date().toLocaleString('zh-CN', { hour12: false }), data: c }
  },
  // 紧凑存档展开为标准结构（type/ts 以导入时刻重建；fav 类型由图鉴反查）
  expandCompact (obj) {
    const d = obj.data
    const now = Date.now()
    const out = {}
    Object.keys(d).forEach(k => { out[k] = d[k] })
    const typeOf = id => (dex.byId[id] && dex.byId[id].type) || 'item'
    if (d.fav) out.fav = d.fav.map(id => ({ id, type: typeOf(id), ts: now }))
    if (d.boss) { const b = {}; d.boss.forEach(id => { b[id] = now }); out.boss = b }
    if (d.gachv) { const g = {}; d.gachv.forEach(id => { g[id] = now }); out.gachv = g }
    if (d.career && d.career.done) {
      const dn = {}
      d.career.done.forEach(id => { dn[id] = now })
      out.career = { cls: d.career.cls || 'melee', done: dn }
    }
    if (d.recent) out.recent = d.recent.map(id => ({ id, type: typeOf(id), ts: now }))
    return { app: 'terra-handbook-save', ver: 2, time: obj.time, data: out }
  },
  // 导出：JSON 全量复制到剪贴板；超容量时自动转紧凑表示生成二维码
  onExportSave () {
    const full = store.exportAll()
    const fullJson = JSON.stringify(full)
    wx.setClipboardData({ data: fullJson })
    let qrJson = fullJson.length <= 2800 ? fullJson : null
    if (!qrJson) {
      const compact = JSON.stringify(this.buildCompact(full.data))
      if (compact.length <= 2800) qrJson = compact
    }
    if (qrJson) {
      this.setData({ qrShow: true }, () => this.drawQr(qrJson))
      wx.showToast({ title: '已复制 · 二维码已生成', icon: 'none', duration: 2000 })
    } else {
      wx.showModal({
        title: '存档已复制',
        content: '存档内容较大（' + fullJson.length + ' 字节），超出二维码容量，请在另一台设备上使用"粘贴导入"。',
        showCancel: false, confirmText: '知道了'
      })
    }
  },
  // 二维码绘制：qrcode 矩阵 → canvas 2d
  drawQr (text) {
    const QR = require('../../utils/qrcode')
    try {
      const qr = QR(0, 'L')
      qr.addData(text)
      qr.make()
      const n = qr.getModuleCount()
      this.createSelectorQuery().select('#saveQr').fields({ node: true, size: true }).exec(res => {
        if (!res || !res[0] || !res[0].node) return
        const { node, width } = res[0]
        const dpr = (wx.getWindowInfo ? wx.getWindowInfo() : { pixelRatio: 2 }).pixelRatio || 2
        node.width = width * dpr
        node.height = width * dpr
        const ctx = node.getContext('2d')
        ctx.scale(dpr, dpr)
        const quiet = 2
        const cell = width / (n + quiet * 2)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, width)
        ctx.fillStyle = '#1A1A1A'
        for (let r = 0; r < n; r++) {
          for (let c = 0; c < n; c++) {
            if (qr.isDark(r, c)) ctx.fillRect((c + quiet) * cell, (r + quiet) * cell, Math.ceil(cell), Math.ceil(cell))
          }
        }
      })
    } catch (e) {
      this.setData({ qrShow: false })
      wx.showModal({
        title: '二维码生成失败',
        content: '存档内容超出二维码容量，请使用"复制到剪贴板"方式在新设备导入。',
        showCancel: false, confirmText: '知道了'
      })
    }
  },
  closeQr () { this.setData({ qrShow: false }) },
  toggleImport () {
    this.setData({ showImport: !this.data.showImport, importText: '' })
  },
  onImportText (e) { this.setData({ importText: e.detail.value }) },
  // 扫另一台设备上的存档二维码，结果填入文本框
  onScanImport () {
    wx.scanCode({
      success: r => {
        if (r && r.result) this.setData({ importText: r.result })
      },
      fail: () => wx.showToast({ title: '已取消扫码', icon: 'none' })
    })
  },
  // 确认导入：解析 → 校验（兼容紧凑格式）→ 二次确认 → 覆盖写入 → 应用主题/版本
  onImportConfirm () {
    const raw = (this.data.importText || '').trim()
    if (!raw) { wx.showToast({ title: '请先粘贴存档内容', icon: 'none' }); return }
    let obj = null
    try { obj = JSON.parse(raw) } catch (err) { obj = null }
    if (obj && obj.ver === 2) obj = this.expandCompact(obj)  // 紧凑格式展开
    const chk = store.checkSave(obj)
    if (!chk.ok) { wx.showToast({ title: '导入失败：' + chk.err, icon: 'none' }); return }
    wx.showModal({
      title: '确认导入',
      content: '将覆盖当前全部进度（收藏 / Boss 击败 / 成就 / 打卡等' + (chk.time ? '，存档时间 ' + chk.time : '') + '），确定继续吗？',
      confirmText: '导入',
      confirmColor: '#E85555',
      success: r => {
        if (!r.confirm) return
        store.applySave(obj)
        this.applyImportedEnv()
        this.setData({ showImport: false, importText: '' })
        wx.showToast({ title: '导入成功', icon: 'success' })
      }
    })
  },
  // 导入后同步主题 / 数据版本 / 全页数据
  applyImportedEnv () {
    const app = getApp()
    const theme = store.getTheme()
    app.setTheme(theme === 'light' ? 'light' : 'dark')
    this.setData({
      themeClass: theme === 'light' ? 'theme-light' : '',
      dark: theme !== 'light'
    })
    if (typeof this.getTabBar === 'function' && this.getTabBar() && this.getTabBar().syncTheme) {
      this.getTabBar().syncTheme()
    }
    const v = store.getVersion()
    const vi = VERSIONS.indexOf(v)
    this.setData({ version: v, versionIndex: vi < 0 ? 0 : vi })
    this.refresh()
  },

  resetData () {
    wx.showModal({
      title: '重置数据',
      content: '将清除收藏、成就、Boss击败记录等全部本地数据，确定继续吗？',
      confirmText: '清除',
      confirmColor: '#E85555',
      success: r => {
        if (!r.confirm) return
        try { wx.clearStorageSync() } catch (err) { /* 忽略 */ }
        this.refresh()
        wx.showToast({ title: '已重置', icon: 'success' })
      }
    })
  },
  openAbout () { this.setData({ showAbout: true }) },
  closeAbout () { this.setData({ showAbout: false }) },

  onShareAppMessage () {
    return { title: '泰拉瑞亚手册 · 我的冒险等级 Lv.' + this.data.level.lv, path: '/pages/home/home' }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚手册 · 我的冒险等级 Lv.' + this.data.level.lv }
  },

  /* ---------- 分享海报（冒险者名片版式） ---------- */
  openPoster () {
    const p = store.getProfile()
    const lv = store.getLevel()
    this.setData({
      posterData: {
        mode: 'card',
        avatarId: p.avatar || 'ava_knight',
        nick: p.nick || '无名冒险家',
        color: '#FFD700',
        lv: lv.lv, lvTitle: lv.title, cur: lv.cur, need: lv.need, pts: lv.pts,
        stats: [['收藏', store.getFavs().length + ' 项'], ['击败Boss', Object.keys(store.getDefeated()).length + ' 只'], ['冒险值', lv.pts + ' 分']],
        desc: '在泰拉瑞亚手册查询图鉴 · 追踪合成 · 攻略全流程'
      },
      posterShow: true
    })
  },
  closePoster () { this.setData({ posterShow: false }) }
})
