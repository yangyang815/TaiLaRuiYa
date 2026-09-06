// 消息中心：系统消息 / 更新公告列表（进入即标记已读）
const msgs = require('../../data/messages')
const store = require('../../utils/store')

function fmtDate (ts) {
  const d = new Date(ts)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: '',
    list: [],       // [{id, icon, tagInfo, title, body, ts, date, unread}]
    unread: 0
  },

  onLoad () {
    const app = getApp()
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : ''
    })
  },

  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
    this.loadMsgs()
  },

  loadMsgs () {
    const lastRead = store.getMsgRead()
    const list = msgs.all().map(m => ({ ...m, date: fmtDate(m.ts), unread: m.ts > lastRead }))
    const unread = list.filter(m => m.unread).length
    this.setData({ list, unread })
    // 标记全部已读（晚于当前时间的新消息到来时会重新出现红点）
    store.setMsgRead(Date.now())
  },

  goBack () { wx.navigateBack() }
})
