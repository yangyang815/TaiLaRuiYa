// 冒险成就：基于本地使用数据自动判定解锁
const store = require('./store')
const dex = require('./dex')

// id: 唯一标识 icon: 图标 n: 名称 d: 描述 cond: 判定函数(ctx) → bool
// ctx: { opens, favs, notes, bossN, bossTotal, viewed, searched, lv, flags }
const LIST = [
  { id: 'first_open', icon: '🚪', n: '初次冒险', d: '第一次打开手册', cond: c => c.opens >= 1 },
  { id: 'regular', icon: '🚶', n: '常客', d: '累计启动 10 次', cond: c => c.opens >= 10 },
  { id: 'hardcore', icon: '🎮', n: '铁杆玩家', d: '累计启动 50 次', cond: c => c.opens >= 50 },
  { id: 'first_fav', icon: '❤️', n: '心动时刻', d: '收藏第 1 个条目', cond: c => c.favs >= 1 },
  { id: 'collector', icon: '📦', n: '收藏家', d: '收藏 10 个条目', cond: c => c.favs >= 10 },
  { id: 'collector_master', icon: '🏆', n: '收藏大师', d: '收藏 30 个条目', cond: c => c.favs >= 30 },
  { id: 'first_note', icon: '📝', n: '第一页手记', d: '写下第 1 篇笔记', cond: c => c.notes >= 1 },
  { id: 'note_master', icon: '📖', n: '笔记达人', d: '累计写下 5 篇笔记', cond: c => c.notes >= 5 },
  { id: 'first_blood', icon: '⚔️', n: '首杀', d: '击败第 1 个 Boss', cond: c => c.bossN >= 1 },
  { id: 'hunter', icon: '🗡️', n: 'Boss 猎人', d: '击败 5 个 Boss', cond: c => c.bossN >= 5 },
  { id: 'slayer', icon: '💥', n: '屠戮者', d: '击败 10 个 Boss', cond: c => c.bossN >= 10 },
  { id: 'godslayer', icon: '👑', n: '弑神者', d: '击败全部 Boss', cond: c => c.bossTotal > 0 && c.bossN >= c.bossTotal },
  { id: 'scholar', icon: '🔍', n: '求知者', d: '浏览 20 个不同条目', cond: c => c.viewed >= 20 },
  { id: 'seeker', icon: '🧭', n: '搜索者', d: '累计搜索 10 次', cond: c => c.searched >= 10 },
  { id: 'alchemist', icon: '⚗️', n: '炼金术士', d: '在合成页查询过配方', cond: c => !!c.flags.craftUsed },
  { id: 'lv5', icon: '⭐', n: '小有名气', d: '冒险等级达到 Lv.5', cond: c => c.lv >= 5 },
  { id: 'lv10', icon: '🌟', n: '传奇冒险家', d: '冒险等级达到 Lv.10', cond: c => c.lv >= 10 },
  { id: 'night_owl', icon: '🌙', n: '夜行者', d: '切换过昼/夜主题', cond: c => !!c.flags.themeSwitched },
  { id: 'versioneer', icon: '⚙️', n: '版本控', d: '切换过数据版本', cond: c => !!c.flags.versionSwitched },
  { id: 'all_rounder', icon: '🛡️', n: '全能勇士', d: '收藏+笔记+击败Boss 均有记录', cond: c => c.favs >= 1 && c.notes >= 1 && c.bossN >= 1 }
]

// 汇总本地数据 → 成就列表 [{id,icon,n,d,unlocked,ts}]
function computeAll () {
  const stats = store.getStats()
  const bossTotal = dex.ALL.filter(e => e.type === 'boss').length
  const ctx = {
    opens: stats.opens || 0,
    favs: store.getFavs().length,
    notes: store.getNotes().length,
    bossN: Object.keys(store.getDefeated()).length,
    bossTotal,
    viewed: store.getRecents().length,
    searched: store.getHist().length,
    lv: store.getLevel().lv,
    flags: store.getFlags()
  }
  return LIST.map(a => ({
    id: a.id, icon: a.icon, n: a.n, d: a.d,
    unlocked: !!a.cond(ctx)
  }))
}

// 已解锁数 / 总数
function summary () {
  const all = computeAll()
  return { unlocked: all.filter(a => a.unlocked).length, total: all.length }
}

// 签名语：根据击败 Boss 数动态生成
function signature () {
  const n = Object.keys(store.getDefeated()).length
  if (n <= 0) return '尚未击败 Boss 的见习冒险者'
  if (n === 1) return '初尝胜果的冒险者'
  if (n < 5) return '已击败 ' + n + ' 个 Boss 的冒险者'
  if (n < 10) return '令 Boss 闻风丧胆的猎人'
  if (n < 15) return '屠戮众神的传奇冒险者'
  return '威震泰拉世界的弑神者'
}

module.exports = { computeAll, summary, signature }
