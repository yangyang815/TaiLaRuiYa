// 云函数：trackPage —— 轻量使用统计上报（隐私最小化）
// 职责：校验聚合键、服务端生成自然日（东八区）、按 (日,键) 原子累加到 stats_daily
// 隐私承诺：
//   1. 不接收、不存储 openid / IP / 设备信息等任何个人数据（连 getWXContext 都不取）
//   2. 只接受 { items: [{ k: 聚合键, n: 次数 }] }，键由客户端白名单生成（路由+内容定位参数）
//   3. 数据只有"某天某页面被访问了多少次"一种语义，无法反推个人行为
// 集合：stats_daily（文档 _id = md5(日|键)，字段 d/k/n），由本函数自动创建
const cloud = require('wx-server-sdk');
const crypto = require('crypto');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;
const COLL = 'stats_daily';

// 聚合键格式：pv:路由?参数=值 或 ev:事件名（客户端已净化，这里再校验一次）
const RE_KEY = /^(pv|ev):[A-Za-z0-9_\-\/\?\=\&\.]{1,120}$/;

// 东八区自然日（云函数环境是 UTC，直接用 getFullYear 会差 8 小时）
function beijingDate() {
  return new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);
}

exports.main = async (event) => {
  const items = Array.isArray(event && event.items) ? event.items : null;
  if (!items || !items.length) return { ok: false, code: 'EMPTY' };
  if (items.length > 50) return { ok: false, code: 'TOO_MANY' };

  const d = beijingDate();

  // 集合不存在时自动创建（已存在则忽略报错）
  try { await db.createCollection(COLL); } catch (e) { /* 已存在 */ }

  let accepted = 0;
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const k = typeof (it && it.k) === 'string' ? it.k : '';
    const n = Math.floor(Number(it && it.n));
    if (!RE_KEY.test(k) || !(n >= 1 && n <= 99)) continue; // 非法键直接丢弃
    accepted++;

    const _id = crypto.createHash('md5').update(d + '|' + k).digest('hex');
    try {
      // 原子累加：文档存在则 n 自增
      const r = await db.collection(COLL).doc(_id).update({ data: { n: _.inc(n) } });
      if (!r.stats || r.stats.updated === 0) {
        // 文档不存在则首建
        await db.collection(COLL).add({ data: { _id, d, k, n } });
      }
    } catch (e) {
      // 并发首建撞 _id 等异常：降级重试一次累加
      try { await db.collection(COLL).doc(_id).update({ data: { n: _.inc(n) } }); } catch (e2) { /* 放弃该条，不影响其它 */ }
    }
  }

  return { ok: true, day: d, accepted };
};
