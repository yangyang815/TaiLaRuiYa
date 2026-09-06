// 系统消息 / 更新公告（倒序排列，ts 为毫秒时间戳）
// tag: update=数据更新 | notice=公告 | feature=新功能
const MSGS = [
  {
    id: 'm_v144',
    tag: 'update',
    icon: '📦',
    title: '1.4.4 数据版本上线',
    body: 'Boss、敌怪与物品数据全面对齐游戏 1.4.4 版本，新增天顶剑合成树、史莱姆皇后掉落表与旅行商人库存。在"我的-游戏版本"中可切换查看旧版数据。',
    ts: 1787241600000 // 2026-08-21
  },
  {
    id: 'm_npcplan',
    tag: 'feature',
    icon: '🏘️',
    title: 'NPC 规划器上线',
    body: '输入你的世界进度与可用 NPC，自动生成晶塔摆放方案与住房分配建议，让全地图传送网络一步到位。入口在"我的"页功能列表。',
    ts: 1787673600000 // 2026-08-26
  },
  {
    id: 'm_career',
    tag: 'feature',
    icon: '⚔️',
    title: '职业养成路线发布',
    body: '战士 / 射手 / 法师 / 召唤师四条养成路线全部完成，覆盖从木剑到毕业装备的每一阶段，支持逐阶段打卡记录进度。',
    ts: 1787932800000 // 2026-08-29
  },
  {
    id: 'm_weekly',
    tag: 'notice',
    icon: '🏆',
    title: '本周挑战已开启',
    body: '每周一 0 点轮换一位标志性 Boss 作为本周挑战目标，查看它的专属攻略、掉落与打法要点，去会一会这位强敌吧！',
    ts: 1788192000000 // 2026-09-01
  },
  {
    id: 'm_guide',
    tag: 'notice',
    icon: '📖',
    title: '新手指南全新扩写',
    body: '12 篇新手攻略重新校对：第一天生存流程、挖矿路线、家建标准与肉山前准备，全部按当前版本数据重写，萌新必读。',
    ts: 1788364800000 // 2026-09-03
  }
]

// 标签元信息：文案 + 样式类
const TAGS = {
  update: { n: '更新', cls: 'tg-update' },
  notice: { n: '公告', cls: 'tg-notice' },
  feature: { n: '新功能', cls: 'tg-feature' }
}

function all () {
  return MSGS.slice().sort((a, b) => b.ts - a.ts).map(m => ({ ...m, tagInfo: TAGS[m.tag] || TAGS.notice }))
}

// 未读数量：晚于上次已读时间的消息数
function unreadCount (lastReadTs) {
  return MSGS.filter(m => m.ts > (lastReadTs || 0)).length
}

module.exports = { all, unreadCount, TAGS }
