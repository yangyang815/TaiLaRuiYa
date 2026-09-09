// 长页面返回顶部 Behavior：滚动超过阈值浮现按钮（页面引入后 wxml 挂 <back-top show="{{showBackTop}}" />）
const THRESHOLD = 600
const bt = typeof Behavior === 'function'
  ? Behavior({
      data: { showBackTop: false },
      onPageScroll (e) {
        const show = e.scrollTop > THRESHOLD
        if (show !== this.data.showBackTop) this.setData({ showBackTop: show })
      }
    })
  : {
      // 无头测试/异常环境兜底
      data: { showBackTop: false },
      onPageScroll (e) {
        const show = e.scrollTop > THRESHOLD
        if (show !== this.data.showBackTop) this.setData({ showBackTop: show })
      }
    }
module.exports = bt
