// 虚拟支付：定时兜底查单（发货推送丢失时补发货）
// 定时触发器 config.json：每 5 分钟；查 pending 超时订单 → xpay/query_order → 已支付则发货
const cloud = require("wx-server-sdk");
const https = require("https");
const crypto = require("crypto");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const OFFER_ID = process.env.VP_OFFER_ID || "";
const APP_KEY = process.env.VP_APP_KEY || "";
const APP_SECRET = process.env.MP_APP_SECRET || "";
const PRODUCTS = {
  VP_NOADS: "noads",
  VP_THEMES: "themes"
};
function httpsGetJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let s = "";
      res.on("data", (c) => (s += c));
      res.on("end", () => {
        try { resolve(JSON.parse(s)); } catch (e) { reject(new Error("bad json: " + s.slice(0, 160))); }
      });
    }).on("error", reject);
  });
}
function httpsPostJson(url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: u.hostname, path: u.pathname + u.search, method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) }
    }, (res) => {
      let s = "";
      res.on("data", (c) => (s += c));
      res.on("end", () => {
        try { resolve(JSON.parse(s)); } catch (e) { reject(new Error("bad json: " + s.slice(0, 160))); }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}
function calcPaySig(uri, postBody) {
  return crypto.createHmac("sha256", APP_KEY).update(uri + "&" + postBody, "utf8").digest("hex");
}
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
exports.main = async () => {
  if (!OFFER_ID || !APP_KEY || !APP_SECRET) {
    console.log("[payCron] 环境变量未配置，跳过兜底查单");
    return { ok: true, skip: true };
  }
  try {
    const cutoff = Date.now() - 10 * 60 * 1000; // 下单超 10 分钟仍 pending 才查
    const pend = await db.collection("orders")
      .where({ status: "pending", createdAt: db.command.lt(cutoff) })
      .orderBy("createdAt", "desc").limit(20).get();
    if (!pend.data || !pend.data.length) return { ok: true, checked: 0 };
    const tokenRes = await httpsGetJson("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" +
      encodeURIComponent(cloud.getWXContext().APPID || "") + "&secret=" + encodeURIComponent(APP_SECRET));
    if (!tokenRes.access_token) {
      console.error("[payCron] 获取 access_token 失败:", JSON.stringify(tokenRes).slice(0, 160));
      return { ok: false, err: "token" };
    }
    let paid = 0;
    for (const o of pend.data) {
      try {
        const body = JSON.stringify({ openid: o.openid, env: 0, order_id: o.outTradeNo });
        const sig = calcPaySig("/xpay/query_order", body);
        const r = await httpsPostJson("https://api.weixin.qq.com/xpay/query_order?access_token=" +
          encodeURIComponent(tokenRes.access_token) + "&pay_sig=" + encodeURIComponent(sig), { openid: o.openid, env: 0, order_id: o.outTradeNo });
        // 平台已支付则补发货；响应字段以真单为准，先宽容解析常见形态
        const st = r && (r.pay_status || (r.order && r.order.pay_status) || (r.order && r.order.status) || r.status);
        if (String(st).toUpperCase().indexOf("PAID") >= 0 || String(st).toUpperCase() === "SUCCESS") {
          const wxOrderId = (r.order && (r.order.wx_order_id || r.order.MchOrderNo)) || r.wx_order_id || o.outTradeNo;
          const ent = PRODUCTS[o.productId];
          if (ent) { await grant(o.openid, ent, wxOrderId, o.outTradeNo); paid++; }
        }
      } catch (e) {
        console.warn("[payCron] 单笔查单异常:", o.outTradeNo, e.message);
      }
      await new Promise((r) => setTimeout(r, 120));
    }
    return { ok: true, checked: pend.data.length, paid };
  } catch (e) {
    console.error("[payCron] 异常:", e.message);
    return { ok: false, err: e.message };
  }
};
