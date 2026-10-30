const app = getApp();
Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: "",
    faqs: [
      {
        ico: "🗂️",
        t: "全物品图鉴为什么要装载？",
        d: "全物品图鉴收录 6300+ 条数据，分三卷存放在独立分包中。首次打开会自动装载（视网络几秒到十几秒），完成后本地缓存，之后秒开。我们更新图鉴数据后会重新装载一次。"
      },
      {
        ico: "🔍",
        t: "搜索支持什么？",
        d: "首页顶部全局搜索支持中文、拼音和别名，可搜物品、敌怪、Boss、配方与攻略；图鉴页内还可按分类和首字母筛选。"
      },
      {
        ico: "❤️",
        t: "收藏与进度怎么用？",
        d: "物品与 Boss 详情页可收藏、Boss 可标记击败；我的页汇总收藏数、冒险成就、泰拉成就、钓鱼与建造收集进度，支持导出存档迁移设备。"
      },
      {
        ico: "🗺️",
        t: "冒险攻略在哪？",
        d: "首页宫格冒险手册进入：职业养成路线、事件攻略、钓鱼指南、建造指南等。攻略内的条目名可以直接点击，跳转到对应详情。"
      },
      {
        ico: "🎨",
        t: "主题皮肤怎么解锁？",
        d: "我的 → 主题皮肤，部分主题观看一段激励视频即可解锁，解锁后可长期使用。"
      },
      {
        ico: "🎮",
        t: "为什么我看到的和攻略不一样？",
        d: "游戏版本差异。小程序数据基准为最新版（1.4.5.8），部分机制在近期版本有调整，例如克拉肯球 1.4.5.7 起不再由地牢掉落、改为猪龙鱼公爵七选一。建议把游戏更新到最新版后再对照攻略。"
      },
      {
        ico: "🔄",
        t: "图鉴数据多久更新一次？",
        d: "跟随官方 Wiki 持续修正，玩家反馈会逐条双源核对后发布。更新图鉴数据后，全物品图鉴会重新装载一次（有加载动画提示），之后恢复秒开。"
      },
      {
        ico: "📺",
        t: "为什么会有广告？",
        d: "广告用于支持小程序持续更新：底部横幅、从详情页返回时的插屏、解锁主题的激励视频三类。页面顶部永远不会挂广告，广告收益全部用于内容维护。"
      },
      {
        ico: "💬",
        t: "发现问题或内容有误？",
        d: "我的 → 关于与反馈给我们留言；物品详情页也有信息/数据有误？的快捷纠错入口，数据参考官方 Wiki 持续修正。"
      }
    ]
  },
  onLoad() {
    const a = getApp();
    this.setData({
      statusBarHeight: (a.globalData.sys && a.globalData.sys.statusBarHeight) || 20,
      capsuleRight: a.globalData.capsuleRight || 100,
      themeClass: a.themeClass()
    });
  },
  back() {
    if (getCurrentPages().length > 1) wx.navigateBack();
    else wx.switchTab({ url: "/pages/my/my" });
  },
  goCodex() {
    wx.switchTab({ url: "/pages/codex/codex" });
  },
  goFeedback() {
    wx.navigateTo({
      url: "/pages/feedback/feedback",
      fail: () => wx.showToast({ title: "页面打开失败", icon: "none" })
    });
  },
  noop() {}
});
