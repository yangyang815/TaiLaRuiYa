// 自定义底部导航：像素图标 + 金色光效 + 主题同步
const LIST = [
  { pagePath: 'pages/home/home', text: '首页', icon: 'tab_home', iconOn: 'tab_home_on' },
  { pagePath: 'pages/codex/codex', text: '图鉴', icon: 'tab_book', iconOn: 'tab_book_on' },
  { pagePath: 'pages/craft/craft', text: '合成', icon: 'tab_anvil', iconOn: 'tab_anvil_on' },
  { pagePath: 'pages/my/my', text: '我的', icon: 'tab_me', iconOn: 'tab_me_on' }
]

Component({
  data: {
    selected: 0,
    light: false,
    list: LIST.map(l => ({
      ...l,
      artId: l.icon,
      artIdOn: l.iconOn
    }))
  },
  lifetimes: {
    attached () { this.syncTheme() }
  },
  pageLifetimes: {
    // 每次所在页面显示时同步主题（跨页切换/返回）
    show () { this.syncTheme() }
  },
  methods: {
    // 读取全局主题；"我的"页切换主题时会主动调用
    syncTheme () {
      const app = getApp()
      this.setData({ light: !!(app && app.globalData && app.globalData.theme === 'light') })
    },
    // 各 Tab 页 onShow 时调用，同步选中项 + 主题
    // （custom-tab-bar 的 pageLifetimes.show 不可靠，主题必须在这里同步）
    init (index) {
      this.setData({ selected: index })
      this.syncTheme()
    },
    switchTab (e) {
      const i = e.currentTarget.dataset.index
      const item = LIST[i]
      wx.switchTab({ url: '/' + item.pagePath })
    }
  }
})
