const BT = require('../../../utils/back-top-behavior')
// 特殊种子页：秘密种子大全（分组筛选 + 列表 + 跳转详情）
const dex = require('../../../utils/dex')
const store = require('../../../utils/store')

const CHIPS = [
  { k: '', n: '全部' }, { k: 'hard', n: '挑战向' }, { k: 'casual', n: '休闲向' }, { k: 'visual', n: '趣味视觉' }
]
const GROUP_META = {
  hard: { n: '挑战向', cls: 'g-hard' },
  casual: { n: '休闲向', cls: 'g-casual' },
  visual: { n: '趣味视觉', cls: 'g-visual' }
}

Page({
  behaviors: [BT],
  onPageScroll (e) {
    const show = e && e.scrollTop > 600
    if (show !== this.data.showBackTop) this.setData({ showBackTop: show })
  },
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: '',
    chips: CHIPS, chip: '',
    list: [], total: 0, verNote: ''
  },
  _all: [],

  onLoad () {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : ''
    })
    this._all = dex.ALL.filter(e => e.type === 'seed').map(e => {
      const r = e.raw
      const diff = r.diff || 1
      const gm = GROUP_META[r.group] || GROUP_META.casual
      return {
        id: e.id, name: e.name, en: e.en, code: r.code || '', tag: r.tag || '',
        group: r.group, groupName: gm.n, groupCls: gm.cls,
        ver: r.ver || '', diff,
        artId: e.artId, glow: e.glow,
        starsOn: '★★★★★'.slice(0, diff), starsOff: '☆☆☆☆☆'.slice(0, 5 - diff)
      }
    })
    // 版本跨度提示（取数据里的最高版本）
    const vers = this._all.map(s => s.ver)
    this.setData({ total: this._all.length, verNote: vers.includes('1.4.5') ? '覆盖 1.4.0 ~ 1.4.5 全部秘密种子' : '' })
    this.applyFilter()
  },

  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
  },

  goBack () { wx.navigateBack() },

  applyFilter () {
    const k = this.data.chip
    const list = k ? this._all.filter(s => s.group === k) : this._all
    this.setData({ list })
  },

  onChip (e) {
    const k = e.currentTarget.dataset.k
    if (k === this.data.chip) return
    this.setData({ chip: k })
    this.applyFilter()
  },

  // 长按复制种子代码
  onCodeCopy (e) {
    const code = e.currentTarget.dataset.code
    if (!code) return
    wx.setClipboardData({
      data: code,
      success: () => wx.showToast({ title: '代码已复制', icon: 'success' })
    })
  },

  onSeedTap (e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    store.pushRecent(id, 'seed')
    wx.navigateTo({ url: '/pages/detail/detail?type=seed&id=' + id })
  },

  onShareAppMessage () {
    return { title: '泰拉瑞亚特殊种子大全 · 输入代码解锁异世界', path: '/pkgB-guide/pages/worldseeds/worldseeds' }
  }
})
