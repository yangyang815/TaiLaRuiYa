// 消息中心远程加载：云开发数据库（主通道，免域名白名单）→ jsDelivr 镜像（仅开发调试）→ 内置兜底
// 云开发一次性配置（mp 后台）：
//   1. 开通云开发（免费基础版即可），得到环境 ID
//   2. 数据库 → 创建集合 messages → 权限设为"所有用户可读"
//   3. 导入 data/messages.import.jsonl（JSON Lines 格式）
//   4. 将环境 ID 填到下方 CLOUD_ENV（只有一个环境可留空）
const msgs = require('../data/messages')

const CLOUD_ENV = '' // ← 云开发环境 ID 填这里（留空 = 默认环境）
const COLLECTION = 'messages'

// jsDelivr / raw 镜像：真机受白名单限制（未备案域名加不进合法域名），
// 开发者工具勾选"不校验合法域名"时可用，作为调试期备用通道
const MIRRORS = [
  'https://cdn.jsdelivr.net/gh/yangyang815/TaiLaRuiYa@main/data/remote-messages.json',
  'https://raw.githubusercontent.com/yangyang815/TaiLaRuiYa/main/data/remote-messages.json'
]
const CACHE_KEY = 'terr_msg_remote'
const MAX_AGE = 24 * 3600 * 1000 // 缓存 24 小时，过期后仍可用但会尝试刷新

// 规范化：过滤非法项 + 倒序 + 标签元信息 + 来源标记
function normalize (list, src) {
  return (Array.isArray(list) ? list : [])
    .filter(m => m && (m.id || m._id) && m.title && m.ts)
    .sort((a, b) => b.ts - a.ts)
    .map(m => ({ ...m, id: m.id || m._id, ts: Number(m.ts) || 0, tagInfo: msgs.TAGS[m.tag] || msgs.TAGS.notice, src }))
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

// 异步刷新总入口：云开发 → 镜像 → 静默
// 成功（任一通道拿到非空列表）→ 写缓存并回调；全部失败 → 静默（内置兜底一直在）
function refresh (onUpdate) {
  const done = []
  let settled = false
  const settle = list => {
    if (settled) return
    settled = true
    try { wx.setStorageSync(CACHE_KEY, { ts: Date.now(), list }) } catch (e) { /* 忽略 */ }
    onUpdate && onUpdate(normalize(list, 'remote'))
  }

  // ---- 主通道：云开发数据库 ----
  try {
    if (typeof wx.cloud !== 'undefined') {
      if (!wx.cloud._terraInited) {
        wx.cloud.init(CLOUD_ENV ? { env: CLOUD_ENV } : {})
        wx.cloud._terraInited = true
      }
      const deadline = setTimeout(() => { settled || tryMirror(0) }, 6000) // 云通道 6s 超时
      wx.cloud.database().collection(COLLECTION)
        .orderBy('ts', 'desc').limit(20).get()
        .then(res => {
          clearTimeout(deadline)
          if (settled) return
          const list = (res.data || []).map(d => ({
            id: d.id || d._id, tag: d.tag, icon: d.icon || '📢',
            title: d.title, body: d.body || '', ts: Number(d.ts) || 0
          })).filter(x => x.title)
          if (list.length) settle(list)
          else tryMirror(0)
        })
        .catch(() => {
          clearTimeout(deadline)
          settled || tryMirror(0)
        })
      return
    }
  } catch (e) { /* 云通道异常走镜像 */ }

  tryMirror(0)

  // ---- 备用通道：HTTP 镜像（开发者工具调试用） ----
  function tryMirror (i) {
    if (settled) return
    if (i >= MIRRORS.length) return
    wx.request({
      url: MIRRORS[i] + '?t=' + Date.now(),
      timeout: 6000,
      success: res => {
        const d = res.data
        if (d && d.app === 'terra-handbook-remote' && Array.isArray(d.list) && d.list.length) {
          settle(d.list)
        } else {
          tryMirror(i + 1)
        }
      },
      fail: () => tryMirror(i + 1)
    })
  }
}

module.exports = { currentList, unreadCount, refresh }
