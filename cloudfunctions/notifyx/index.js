// 订阅消息：记录用户的发送额度（客户端每次授权成功 +1）
// 广播发送在 payCron 定时任务里完成（读取 notices 集合 → 逐个扣减额度发送）
// 集合：subscribers { openid, count, lastNoticeId, createdAt, updatedAt }（仅管理端可读写）
const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const wxCtx = cloud.getWXContext();
  const OPENID = wxCtx.OPENID || "";
  if (!OPENID) return { ok: false, err: "no openid" };
  const action = (event && event.action) || "subscribe";

  try {
    if (action === "subscribe") {
      // 客户端授权成功后调用：额度 +1（不设上限——用户愿意订阅多少次就存多少）
      await ensureCollections();
      const res = await db.collection("subscribers").where({ openid: OPENID }).limit(1).get();
      const now = Date.now();
      if (res.data && res.data[0]) {
        await db.collection("subscribers").doc(res.data[0]._id).update({
          data: { count: _.inc(1), updatedAt: now }
        });
      } else {
        await db.collection("subscribers").add({
          data: { openid: OPENID, count: 1, lastNoticeId: "", createdAt: now, updatedAt: now }
        });
      }
      return { ok: true };
    }

    if (action === "status") {
      // 查询当前用户剩余额度（调试用）
      const res = await db.collection("subscribers").where({ openid: OPENID }).limit(1).get();
      const doc = res.data && res.data[0];
      return { ok: true, count: doc ? doc.count : 0 };
    }

    return { ok: false, err: "未知 action: " + action };
  } catch (e) {
    console.error("[notifyx]", action, e.message);
    return { ok: false, err: e.message };
  }
};

async function ensureCollections() {
  for (const name of ["subscribers"]) {
    try { await db.createCollection(name); } catch (e) { /* 已存在 */ }
  }
}
