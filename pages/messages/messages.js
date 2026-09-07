// 消息中心：系统消息 / 更新公告列表（进入即标记已读）
const store = require('../../utils/store')
const remoteMsg = require('../../utils/remote-msg')

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
    const render = list => {
      const lastRead = store.getMsgRead()
      const rows = list.map(m => ({ ...m, date: fmtDate(m.ts), unread: m.ts > lastRead }))
      this.setData({ list: rows, unread: rows.filter(r => r.unread).length, msgSrc: list.src || 'builtin' })
      // 标记全部已读（晚于当前时间的新消息到来时会重新出现红点）
      store.setMsgRead(Date.now())
    }
    render(remoteMsg.currentList())      // 立即渲染（缓存/内置兜底）
    remoteMsg.refresh(list => render(list))  // 远程到达后覆盖显示
  },

  goBack () { wx.navigateBack() }
})
