// 虚拟支付：发货推送接收（云开发「消息推送」触发器，云函数模式）
// 配置：云开发控制台 → 消息推送 → 推送模式=云函数，类型=事件推送，绑定本函数
// 推送为已解析的明文事件，无需自行验签解密；发货以 wx_order_id 幂等去重
const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const PRODUCTS = {
  VP_NOADS: "noads",
  VP_THEMES: "themes"
};
async function grant(openid, ent, wxOrderId, outTradeNo) {
  const now = Date.now();
  const res = await db.collection("memberships").where({ openid }).limit(1).get();
  if (res.data && res.data[0]) {
    const doc = res.data[0];
    const patch = { updatedAt: now };
    if (ent === "noads") patch.noads = true;
    if (ent === "themes") patch.themes = true;
    patch.fromOrders = (doc.fromOrders || []).concat([wxOrderId]).slice(-50);
    await db.collection("memberships").doc(doc._id).update({ data: patch });
  } else {
    const init = { openid, noads: false, themes: false, createdAt: now, updatedAt: now, fromOrders: wxOrderId ? [wxOrderId] : [] };
    if (ent === "noads") init.noads = true;
    if (ent === "themes") init.themes = true;
    await db.collection("memberships").add({ data: init });
  }
  await db.collection("orders").where({ outTradeNo }).update({
    data: { status: "paid", wxOrderId, paidAt: now }
  });
}
exports.main = async (event) => {
  try {
    const ev = event || {};
    const evt = ev.Event || ev.event || "";
    if (evt !== "xpay_goods_deliver_notify") return { errcode: 0, errmsg: "ignore: " + evt };
    const openId = ev.OpenId || ev.openid || "";
    const outTradeNo = ev.OutTradeNo || ev.out_trade_no || "";
    const wpi = ev.WeChatPayInfo || {};
    const wxOrderId = wpi.MchOrderNo || wpi.wx_order_id || outTradeNo;
    const gi = ev.GoodsInfo || {};
    const productId = gi.ProductId || gi.product_id || "";
    const ent = PRODUCTS[productId];
    if (!openId || !outTradeNo || !ent) {
      console.warn("[payNotify] 字段缺失:", JSON.stringify(ev).slice(0, 300));
      return { errcode: 0, errmsg: "unknown fields" };
    }
    // 幂等：订单已 paid 则直接成功（同一订单重复推送只发一次货）
    const exist = await db.collection("orders").where({ outTradeNo }).limit(1).get();
    if (exist.data && exist.data[0] && exist.data[0].status === "paid") {
      return { errcode: 0, errmsg: "dup" };
    }
    await grant(openId, ent, wxOrderId, outTradeNo);
    console.log("[payNotify] 已发货:", openId, productId, outTradeNo);
    return { errcode: 0, errmsg: "OK" };
  } catch (e) {
    console.error("[payNotify] 发货失败:", e.message, "（返回非 0 平台将重试，最多 15 次）");
    return { errcode: 1, errmsg: e.message };
  }
};
