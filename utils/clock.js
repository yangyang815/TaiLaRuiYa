// 整分钟对齐的时钟滴答：四个 Tab 页共用
// 与 30 秒 setInterval 的区别：
// 1. 跳变发生在整分钟边界（跨分钟立即更新，不再最多滞后 30 秒）
// 2. 递归 setTimeout 每次重新对齐下一整分——后台节流/休眠后不积累漂移
// 3. 四个页面 tick 相位一致（同一算法对齐同一边界），显示完全统一
function startClock (onTick) {
  let handle = null
  // +120ms 容差：避免毫秒截断导致 tick 落在上一分钟最后一瞬
  const delay = () => 60000 - (Date.now() % 60000) + 120
  const tick = () => {
    onTick(new Date())
    handle = setTimeout(tick, delay())
  }
  handle = setTimeout(tick, delay())
  return {
    stop () {
      if (handle) { clearTimeout(handle); handle = null }
    }
  }
}

// 立即刷新一次（onShow 校准用）
function nowClock () {
  const d = new Date()
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return h + ':' + m
}

module.exports = { startClock, nowClock }
