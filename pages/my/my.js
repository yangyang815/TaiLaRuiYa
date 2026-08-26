// 我的页：头像昵称 / 冒险等级 / 收藏 / 笔记 / 版本 / 夜间模式
const dex = require('../../utils/dex')
const store = require('../../utils/store')

const AVATARS = ['ava_knight', 'ava_wizard', 'ava_slime', 'ava_eye', 'ava_bunny', 'ava_moon']

Page({
  data: {
    statusBarHeight: 20,
    themeClass: '',
    profile: { avatar: 'ava_knight', nick: '无名冒险家' },
    avatarArt: null,
    level: { lv: 1, title: '见习冒险家', cur: 0, need: 60 },
    // 收藏
    favTab: 'all', favs: [], favCount: 0,
    // 笔记
    notes: [], noteDraft: null, noteTitle: '', noteContent: '',
    // 设置
    version: '1.4.4', dark: true,
    // 头像弹窗
    showAvas: false, avatars: [],
    showAbout: false,
    editingNick: false, nickDraft: ''
  },

  onLoad () {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      navTop: app.globalData.navTop || 64,
      avatars: AVATARS.map(a => ({ k: a }))
    })
  },

  onShow () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) this.getTabBar().init(3)
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
    this.refresh()
  },

  refresh () {
    const p = store.getProfile()
    this.setData({
      profile: p,
      avatarArtId: p.avatar || 'ava_knight',
      level: store.getLevel(),
      version: store.getVersion(),
      dark: store.getTheme() !== 'light',
      notes: store.getNotes().map(n => ({ ...n, time: this.fmt(n.ts) }))
    })
    this.loadFavs()
  },

  fmt (ts) {
    const d = new Date(ts)
    const p = n => (n < 10 ? '0' + n : n)
    return d.getFullYear() + '/' + p(d.getMonth() + 1) + '/' + p(d.getDate())
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

  /* ---------- 收藏 ---------- */
  loadFavs () {
    const TAGS = {
      boss: ['BOSS', 'tag-boss'], mon: ['敌怪', 'tag-mon'], seed: ['种子', 'tag-seed'],
      npc: ['NPC', 'tag-npc'], strategy: ['攻略', 'tag-strat'], item: ['物品', 'tag-item']
    }
    const favs = store.getFavs().map(f => {
      let base = null
      // 攻略收藏：id 形如 strat_xxx，需从攻略数据解析
      if (f.type === 'strategy' || f.id.indexOf('strat_') === 0) {
        const s = dex.strats.find(x => 'strat_' + x.id === f.id)
        if (s) base = { id: f.id, name: s.title, type: 'strategy', artId: s.cover || 'stone', glow: '#4CE0E0' }
      } else {
        const e = dex.byId[f.id]
        if (e) base = { id: f.id, name: e.name, type: e.type, artId: e.artId, glow: e.glow }
      }
      if (!base) return null
      const tag = TAGS[base.type] || TAGS.item
      return Object.assign(base, { label: tag[0], tagCls: tag[1] })
    }).filter(Boolean)
    this.setData({ favs, favCount: favs.length })
  },
  onFavTab (e) {
    const k = e.currentTarget.dataset.k
    this.setData({ favTab: k })
    this.loadFavs()
  },

  onFavTap (e) {
    const id = e.currentTarget.dataset.id
    if (id.indexOf('strat_') === 0) {
      wx.navigateTo({ url: '/pages/strategy/strategy?id=' + id.slice(6) })
      return
    }
    dex.go(id)
  },
  onFavRemove (e) {
    store.toggleFav(e.currentTarget.dataset.id)
    this.loadFavs()
    this.refresh()
  },

  /* ---------- 笔记 ---------- */
  newNote () { this.setData({ noteDraft: { id: '' }, noteTitle: '', noteContent: '' }) },
  editNote (e) {
    const n = this.data.notes.find(x => x.id === e.currentTarget.dataset.id)
    if (n) this.setData({ noteDraft: { id: n.id }, noteTitle: n.title, noteContent: n.content })
  },
  onNoteTitle (e) { this.setData({ noteTitle: e.detail.value }) },
  onNoteContent (e) { this.setData({ noteContent: e.detail.value }) },
  saveNote () {
    const t = (this.data.noteTitle || '').trim()
    const c = (this.data.noteContent || '').trim()
    if (!t && !c) { wx.showToast({ title: '写点什么吧', icon: 'none' }); return }
    store.saveNote({ id: this.data.noteDraft.id, title: t || '未命名笔记', content: c })
    this.setData({ noteDraft: null })
    this.refresh()
    wx.showToast({ title: '已保存', icon: 'success' })
  },
  delNote (e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除笔记',
      content: '确定要撕掉这一页吗？',
      confirmColor: '#E85555',
      success: r => {
        if (r.confirm) { store.delNote(id); this.refresh() }
      }
    })
  },
  closeNote () { this.setData({ noteDraft: null }) },
  noop () {},

  /* ---------- 设置 ---------- */
  onVersion (e) {
    const v = e.currentTarget.dataset.v
    if (!v || v === this.data.version) return
    getApp().setVersion(v)
    this.setData({ version: v })
    wx.showToast({ title: '数据版本：' + v, icon: 'none' })
  },
  onTheme (e) {
    const light = !e.detail.value
    getApp().setTheme(light ? 'light' : 'dark')
    this.setData({ themeClass: light ? 'theme-light' : '', dark: !light })
    // 底部导航栏同步换肤
    if (typeof this.getTabBar === 'function' && this.getTabBar() && this.getTabBar().syncTheme) {
      this.getTabBar().syncTheme()
    }
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
