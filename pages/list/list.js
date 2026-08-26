// 列表页：Boss 大全 / 敌怪 / 武器排行 / 饰品 / 药水 / 材料
const dex = require('../../utils/dex')
const { RARITY } = require('../../utils/arts')

const CONF = {
  boss: {
    title: 'Boss 大全', sub: '从史莱姆王到月亮领主',
    subs: [{ k: '', n: '全部' }, { k: 'pre', n: '困难前' }, { k: 'mech', n: '机械三王' }, { k: 'post', n: '花后' }, { k: 'lunar', n: '月亮事件' }]
  },
  monster: { title: '怪物图鉴', sub: '小心夜晚与洞穴', subs: [{ k: '', n: '全部' }] },
  'weapon-rank': {
    title: '武器排行榜', sub: '按面板伤害排序', rank: true,
    subs: [{ k: '', n: '全部' }, { k: 'melee', n: '近战' }, { k: 'ranged', n: '远程' }, { k: 'magic', n: '魔法' }, { k: 'summon', n: '召唤' }]
  },
  accessory: { title: '饰品推荐', sub: '毕业之路的左膀右臂', subs: [{ k: '', n: '全部' }] },
  potion: { title: '药水指南', sub: '炼金台前必备', subs: [{ k: '', n: '全部' }] },
  material: { title: '材料百科', sub: '合成的基础颗粒', subs: [{ k: '', n: '全部' }] }
}

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: '',
    conf: null, type: 'boss',
    sub: '',
    list: []
  },

  onLoad (opts) {
    const app = getApp()
    const type = CONF[opts.type] ? opts.type : 'boss'
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : '',
      type, conf: CONF[type]
    })
    this.load()
  },

  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
  },

  load () {
    const { type, sub } = this.data
    let entries = []
    if (type === 'boss') entries = dex.ALL.filter(e => e.type === 'boss')
    else if (type === 'monster') entries = dex.ALL.filter(e => e.type === 'mon')
    else if (type === 'weapon-rank') entries = dex.weaponRank(sub || '')
    else if (type === 'accessory') entries = dex.ALL.filter(e => e.raw.cat === 'accessory')
    else if (type === 'potion') entries = dex.ALL.filter(e => e.raw.cat === 'potion')
    else if (type === 'material') entries = dex.ALL.filter(e => e.raw.cat === 'material')

    if (type === 'boss' && sub) entries = entries.filter(e => e.raw.tier === sub)

    const isRank = type === 'weapon-rank'
    this.setData({
      list: entries.map((e, i) => ({
        id: e.id, name: e.name, en: e.en, type: e.type,
        artId: e.artId, glow: e.glow || RARITY[e.rarity || 0],
        rank: isRank ? i + 1 : 0,
        rankV: isRank ? e.dmgNum : '',
        meta: type === 'boss' ? (e.raw.coins || '') : (type === 'monster' ? (e.raw.biome || '') : '')
      }))
    })
  },

  onSub (e) {
    this.setData({ sub: e.currentTarget.dataset.k })
    this.load()
  },
  onItem (e) { dex.go(e.currentTarget.dataset.id) },
  back () { wx.navigateBack() },

  onShareAppMessage () {
    return { title: '泰拉瑞亚手册 · ' + (this.data.conf ? this.data.conf.title : ''), path: '/pages/home/home' }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚手册 · ' + (this.data.conf ? this.data.conf.title : '') }
  }
})
