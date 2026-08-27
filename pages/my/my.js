// 我的页：品牌区 / 用户信息卡 / 数据统计 / 功能列表
const dex = require('../../utils/dex')
const store = require('../../utils/store')
const achv = require('../../utils/achievements')

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
    favCount: 0, noteCount: 0,
    achvUnlocked: 0, achvTotal: 0,
    // 设置
    versions: VERSIONS, version: '1.4.4', versionIndex: 0, dark: true,
    // 弹窗
    showAvas: false, avatars: [],
    showAbout: false,
    editingNick: false, nickDraft: ''
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
    this._timer = setInterval(() => this.setData({ clock: fmtClock(new Date()) }), 30000)
  },

  onUnload () {
    if (this._timer) { clearInterval(this._timer); this._timer = null }
  },

  onShow () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) this.getTabBar().init(3)
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
    this.refresh()
  },

  refresh () {
    const p = store.getProfile()
    const bossN = Object.keys(store.getDefeated()).length
    const bossTotal = dex.ALL.filter(e => e.type === 'boss').length
    const sum = achv.summary()
    const v = store.getVersion()
    this.setData({
      profile: p,
      avatarArtId: p.avatar || 'ava_knight',
      level: store.getLevel(),
      signature: achv.signature(),
      bossN, bossTotal,
      favCount: store.getFavs().length,
      noteCount: store.getNotes().length,
      achvUnlocked: sum.unlocked, achvTotal: sum.total,
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
  goNotes () { wx.navigateTo({ url: '/pages/notes/notes' }) },
  goAchv () { wx.navigateTo({ url: '/pages/achv/achv' }) },
  goBosses () {
    const app = getApp()
    app.globalData.pendingCodex = { tab: 'boss' }
    wx.switchTab({ url: '/pages/codex/codex' })
  },

  /* ---------- 设置 ---------- */
  onVersion (e) {
    const v = VERSIONS[Number(e.detail.value)] || '1.4.4'
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
  resetData () {
    wx.showModal({
      title: '重置数据',
      content: '将清除收藏、笔记、成就、Boss击败记录等全部本地数据，确定继续吗？',
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
        stats: [['收藏', store.getFavs().length + ' 项'], ['笔记', store.getNotes().length + ' 篇'], ['冒险值', lv.pts + ' 分']],
        desc: '在泰拉瑞亚手册查询图鉴 · 追踪合成 · 攻略全流程'
      },
      posterShow: true
    })
  },
  closePoster () { this.setData({ posterShow: false }) }
})
