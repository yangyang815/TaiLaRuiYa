// 我的笔记页：列表 + 新建/编辑/删除
const store = require('../../utils/store')

Page({
  data: {
    statusBarHeight: 20,
    navTop: 64,
    themeClass: '',
    notes: [],
    noteDraft: null, noteTitle: '', noteContent: ''
  },

  onLoad () {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      navTop: app.globalData.navTop || 64,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : ''
    })
  },

  goBack () { wx.navigateBack() },

  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
    this.loadNotes()
  },

  loadNotes () {
    this.setData({
      notes: store.getNotes().map(n => ({ ...n, time: this.fmt(n.ts) }))
    })
  },

  fmt (ts) {
    const d = new Date(ts)
    const p = n => (n < 10 ? '0' + n : n)
    return d.getFullYear() + '/' + p(d.getMonth() + 1) + '/' + p(d.getDate())
  },

  /* ---------- 编辑 ---------- */
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
    this.loadNotes()
    wx.showToast({ title: '已保存', icon: 'success' })
  },
  closeNote () { this.setData({ noteDraft: null }) },
  delNote (e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除笔记',
      content: '确定要撕掉这一页吗？',
      confirmColor: '#E85555',
      success: r => {
        if (r.confirm) { store.delNote(id); this.loadNotes() }
      }
    })
  },
  noop () {},

  onShareAppMessage () {
    return { title: '泰拉瑞亚手册 · 我的笔记', path: '/pages/my/my' }
  }
})
