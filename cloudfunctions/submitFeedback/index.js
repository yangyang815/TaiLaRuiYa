// 云函数：submitFeedback —— 用户反馈提交入口
// 职责：频控校验、内容净化、写 feedback 集合
// 集合：feedback（首次部署后需在云开发控制台确认集合已创建，或由本函数自动创建）
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

// 每用户每天最多提交条数
const DAILY_LIMIT = 5;
// 单条内容长度上限
const MAX_LEN = 500;
// 合法类型
const TYPES = ['suggest', 'bug', 'correction', 'other'];

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const type = TYPES.includes(event.type) ? event.type : 'other';
  const content = String(event.content || '').trim();

  // 1. 内容校验
  if (content.length < 2) return { ok: false, code: 'TOO_SHORT', msg: '内容太短啦' };
  if (content.length > MAX_LEN) return { ok: false, code: 'TOO_LONG', msg: '内容超过 ' + MAX_LEN + ' 字上限' };

  // 2. 频控：当日提交数
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  try {
    const cnt = await db.collection('feedback')
      .where({ openid: OPENID, createdAt: _.gte(dayStart) })
      .count();
    if (cnt.total >= DAILY_LIMIT) {
      return { ok: false, code: 'RATE_LIMIT', msg: '今天已经提交 ' + DAILY_LIMIT + ' 条啦，明天再来' };
    }
  } catch (e) {
    // 集合不存在等情况：尝试创建
    try { await db.createCollection('feedback'); } catch (e2) { /* 已存在则忽略 */ }
  }

  // 3. 组装文档
  const doc = {
    openid: OPENID,
    type,
    content,
    // 物品纠错上下文（仅纠错类携带）
    ctx: event.ctx && typeof event.ctx === 'object' ? {
      itemId: String(event.ctx.itemId || '').slice(0, 64),
      name: String(event.ctx.name || '').slice(0, 64),
      cat: String(event.ctx.cat || '').slice(0, 32),
      currentText: String(event.ctx.currentText || '').slice(0, 200),
    } : null,
    // 截图（云存储 fileID，客户端先 uploadFile）
    screenshot: typeof event.screenshot === 'string' && event.screenshot.indexOf('cloud://') === 0 ? event.screenshot : '',
    // 环境信息（客户端传入，用于排查 Bug）
    meta: {
      version: String(event.version || '').slice(0, 16),
      model: String(event.model || '').slice(0, 64),
      system: String(event.system || '').slice(0, 64),
      platform: String(event.platform || '').slice(0, 16),
    },
    status: 'pending', // pending / accepted / replied / closed
    createdAt: now,
  };

  // 4. 入库
  const res = await db.collection('feedback').add({ data: doc });
  return { ok: true, id: res._id };
};
