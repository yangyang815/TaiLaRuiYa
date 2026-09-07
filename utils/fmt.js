// 共享格式化 / 小工具（收敛自各页面的复制粘贴实现）
// 命名约定：fmtClock 'HH:mm'；fmtDateCn 'M月D日 · 周X'；fmtDateIso 'YYYY-MM-DD'；fmtDateShort 'M/D'
function pad2 (n) { return String(n).padStart(2, '0') }
function toDate (d) { return d instanceof Date ? d : new Date(d) }

// 时钟：'HH:mm'
function fmtClock (d) {
  d = toDate(d)
  return pad2(d.getHours()) + ':' + pad2(d.getMinutes())
}

// 中文日期行：'M月D日 · 周X'（首页日期行）
function fmtDateCn (d) {
  d = toDate(d)
  const wk = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return (d.getMonth() + 1) + '月' + d.getDate() + '日 · 周' + wk
}

// ISO 日期：'YYYY-MM-DD'（消息时间戳等）
function fmtDateIso (d) {
  d = toDate(d)
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate())
}

// 短日期：'M/D'（成就列表等紧凑场景）
function fmtDateShort (d) {
  d = toDate(d)
  return (d.getMonth() + 1) + '/' + d.getDate()
}

// 字符串哈希（确定性轮换用，与 Java hashCode 同族）
function hash (s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

// 鱼系 emoji 稳定替代（精灵图缺鱼类贴图时按 id 哈希固定）
const FISH_EMOJI = ['🐟', '🐠', '🐡', '🦈', '🦐', '🦀', '🐋', '🐙']
function emojiOf (id) {
  return FISH_EMOJI[hash(id) % FISH_EMOJI.length]
}

module.exports = { fmtClock, fmtDateCn, fmtDateIso, fmtDateShort, hash, emojiOf }
