// 消息中心远程加载：内置兜底 + 缓存 + 多镜像拉取（无需发版即可更新公告）
// 数据源：仓库 data/remote-messages.json（编辑后 push，jsDelivr 自动分发）
// 优先级：24h 内缓存 → 内置兜底 → 远程刷新成功后覆盖显示
const msgs = require('../data/messages')

// 镜像列表（依次尝试）；jsDelivr 对国内相对友好，GitHub raw 作为备用
const REMOTE_URLS = [
  'https://cdn.jsdelivr.net/gh/yangyang815/TaiLaRuiYa@main/data/remote-messages.json',
  'https://raw.githubusercontent.com/yangyang815/TaiLaRuiYa/main/data/remote-messages.json'
]
const CACHE_KEY = 'terr_msg_remote'
const MAX_AGE = 24 * 3600 * 1000 // 缓存 24 小时，过期后仍可用但会尝试刷新

// 规范化：过滤非法项 + 倒序 + 标签元信息 + 来源标记
function normalize (list, src) {
  return (Array.isArray(list) ? list : [])
    .filter(m => m && m.id && m.title && m.ts)
    .sort((a, b) => b.ts - a.ts)
    .map(m => ({ ...m, tagInfo: msgs.TAGS[m.tag] || msgs.TAGS.notice, src }))
}

// 当前可用列表（同步）：24h 内的远程缓存 → 内置兜底
function currentList () {
  try {
    const c = wx.getStorageSync(CACHE_KEY)
    if (c && Date.now() - c.ts < MAX_AGE && Array.isArray(c.list) && c.list.length) {
      return normalize(c.list, 'cache')
    }
  } catch (e) { /* 存储异常走兜底 */ }
  return normalize(msgs.all(), 'builtin')
}

// 未读数（基于当前可用列表）
function unreadCount (lastReadTs) {
  return currentList().filter(m => m.ts > (lastReadTs || 0)).length
}

// 异步刷新：成功且内容有效 → 写缓存并回调新列表；全部失败 → 静默（已有兜底，不打扰用户）
function refresh (onUpdate) {
  tryFetch(0)
  function tryFetch (i) {
    if (i >= REMOTE_URLS.length) return
    wx.request({
      url: REMOTE_URLS[i] + '?t=' + Date.now(), // 时间戳参数击穿 CDN 缓存，保证拿到最新公告
      timeout: 6000,
      success: res => {
        const d = res.data
        if (d && d.app === 'terra-handbook-remote' && Array.isArray(d.list) && d.list.length) {
          try { wx.setStorageSync(CACHE_KEY, { ts: Date.now(), list: d.list }) } catch (e) { /* 忽略 */ }
          onUpdate(normalize(d.list, 'remote'))
        } else {
          tryFetch(i + 1)
        }
      },
      fail: () => tryFetch(i + 1)
    })
  }
}

module.exports = { currentList, unreadCount, refresh }
