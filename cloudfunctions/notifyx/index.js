// 订阅消息：记录用户的发送额度（客户端每次授权成功 +1）
// 广播发送在 payCron 定时任务里完成（读取 notices 集合 → 逐个扣减额度发送）
// 集合：subscribers { openid, count, lastNoticeId, createdAt, updatedAt }（仅管理端可读写）
//       notices    { type, tmplId, page, fields, sent, createdAt, ... }  （仅管理端可读写）
const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
// 订阅消息模板：版本更新通知（编号 10973）
const TMPL_ID = "sbRiWraUh5_03e7WVB10Jfhr5ZPgB1P059n0RK6Vq6U";

exports.main = async (event) => {
  const wxCtx = cloud.getWXContext();
  const OPENID = wxCtx.OPENID || "";
  const action = (event && event.action) || "subscribe";

  try {
    if (action === "subscribe") {
      // 客户端授权成功后调用：额度 +1（不设上限——用户愿意订阅多少次就存多少）
      if (!OPENID) return { ok: false, err: "no openid" };
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
      if (!OPENID) return { ok: false, err: "no openid" };
      const res = await db.collection("subscribers").where({ openid: OPENID }).limit(1).get();
      const doc = res.data && res.data[0];
      return { ok: true, count: doc ? doc.count : 0 };
    }

    if (action === "seedNotice") {
      // 运维入口：云端测试调用，服务端创建广播公告（绕开控制台添加记录丢字段的 UI 问题）
      // 可选参数：event.fields（默认测试文案）、event.page
      // 自动清理历史空文档（无 fields 字段的废记录）
      await ensureCollections();
      const cleaned = await db.collection("notices").where({ fields: _.exists(false) }).remove();
      const doc = {
        type: "broadcast",
        tmplId: TMPL_ID,
        page: (event && event.page) || "pages/home/home",
        fields: (event && event.fields) || {
          thing2: "图鉴秒开+微光嬗变上线",
          character_string1: "1.1.0"
        },
        sent: false,
        createdAt: Date.now()
      };
      const added = await db.collection("notices").add({ data: doc });
      console.log("[notifyx] seedNotice 已创建:", added._id, JSON.stringify(doc.fields));
      return { ok: true, id: added._id, doc };
    }

    return { ok: false, err: "未知 action: " + action };
  } catch (e) {
    console.error("[notifyx]", action, e.message);
    return { ok: false, err: e.message };
  }
};

async function ensureCollections() {
  for (const name of ["subscribers", "notices"]) {
    try { await db.createCollection(name); } catch (e) { /* 已存在 */ }
  }
}
