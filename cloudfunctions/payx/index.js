// 虚拟支付：下单 + 权益查询（个人主体道具直购）
// 环境变量（云开发控制台 → 云函数 payx → 配置）：
//   VP_OFFER_ID   虚拟支付 → 基本配置 里的 OfferID
//   VP_APP_KEY    虚拟支付 → 基本配置 里的 现网 AppKey
//   MP_APP_SECRET mp后台 → 设置 → 开发管理 里的 AppSecret（用于 code2Session）
// 商品：后台「道具管理」创建，道具 ID 必须与下方 PRODUCTS 的键一致，价格（分）必须与 goodsPrice 一致
const cloud = require("wx-server-sdk");
const https = require("https");
const crypto = require("crypto");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const OFFER_ID = process.env.VP_OFFER_ID || "";
const APP_KEY = process.env.VP_APP_KEY || "";
const APP_SECRET = process.env.MP_APP_SECRET || "";
// 商品表：键=道具ID（后台道具管理创建时用同名 ID），price=单价（分，须与后台一致），ent=发货权益标记
const PRODUCTS = {
  VP_NOADS: { price: 800, ent: "noads" },
  VP_THEMES: { price: 300, ent: "themes" }
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
    const data = JSON.stringify(body); // 签名与发送必须共享同一份序列化结果
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
function calcSignature(postBody, sessionKey) {
  return crypto.createHmac("sha256", sessionKey).update(postBody, "utf8").digest("hex");
}
async function ensureCollections() {
  for (const name of ["orders", "memberships"]) {
    try { await db.createCollection(name); } catch (e) { /* 已存在 */ }
  }
}
async function code2Session(code) {
  const wxCtx = cloud.getWXContext();
  const url = "https://api.weixin.qq.com/sns/jscode2session?appid=" + wxCtx.APPID +
    "&secret=" + encodeURIComponent(APP_SECRET) + "&js_code=" + encodeURIComponent(code) + "&grant_type=authorization_code";
  const r = await httpsGetJson(url);
  if (!r.openid || !r.session_key) throw new Error("code2Session 失败: " + JSON.stringify(r).slice(0, 120));
  return r; // { openid, session_key }
}
async function getEntitlements(openid) {
  await ensureCollections();
  const res = await db.collection("memberships").where({ openid }).limit(1).get();
  const doc = res.data && res.data[0];
  return { noads: !!(doc && doc.noads), themes: !!(doc && doc.themes) };
}
async function grantEntitlement(openid, ent, wxOrderId) {
  await ensureCollections();
  const now = Date.now();
  const res = await db.collection("memberships").where({ openid }).limit(1).get();
  if (res.data && res.data[0]) {
    const doc = res.data[0];
    const patch = { updatedAt: now };
    if (ent === "noads") patch.noads = true;
    if (ent === "themes") patch.themes = true;
    if (wxOrderId) patch.fromOrders = (doc.fromOrders || []).concat([wxOrderId]).slice(-50);
    await db.collection("memberships").doc(doc._id).update({ data: patch });
  } else {
    const init = { openid, noads: false, themes: false, createdAt: now, updatedAt: now, fromOrders: wxOrderId ? [wxOrderId] : [] };
    if (ent === "noads") init.noads = true;
    if (ent === "themes") init.themes = true;
    await db.collection("memberships").add({ data: init });
  }
}
async function queryOrderAndGrant(openid, outTradeNo) {
  // 服务端查单：xpay/query_order（带 pay_sig），已支付则补发货（兜底推送丢失）
  // 实测响应结构（2026-11-12 真单验证）：
  //   已支付 = order.status:3 + paid_fee:800（实付金额，未付订单无此字段）+ wx_trans_id/channel_order_id + settle_state:3
  //   未支付/已关闭 = order.status:6 + 无 paid_fee + settle_state:0
  // 注意：官方文档写的 paid_time 字段实测不存在，status 枚举与文档亦有出入——以真机响应为准
  if (!APP_KEY || !APP_SECRET) throw new Error("VP_APP_KEY/MP_APP_SECRET 未配置");
  const wxCtx = cloud.getWXContext();
  const tokenRes = await httpsGetJson("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" +
    encodeURIComponent(wxCtx.APPID || "") + "&secret=" + encodeURIComponent(APP_SECRET));
  if (!tokenRes.access_token) throw new Error("获取 access_token 失败: " + JSON.stringify(tokenRes).slice(0, 120));
  const body = JSON.stringify({ openid, env: 0, order_id: outTradeNo });
  const sig = calcPaySig("/xpay/query_order", body);
  const r = await httpsPostJson("https://api.weixin.qq.com/xpay/query_order?access_token=" +
    encodeURIComponent(tokenRes.access_token) + "&pay_sig=" + encodeURIComponent(sig), { openid, env: 0, order_id: outTradeNo });
  const order = (r && r.order) || {};
  const paidTime = Number(order.paid_time || 0);
  // 兼容 status / paid_status 两种字段名（不同版本响应可能二选一）；2~4 = 已支付类状态，6 = 已关闭未支付
  const st = Math.max(Number(order.status) || 0, Number(order.paid_status) || 0);
  const paid = paidTime > 0 || (st >= 2 && st <= 4);
  return { raw: r, paid };
}

exports.main = async (event) => {
  const wxCtx = cloud.getWXContext();
  const OPENID = wxCtx.OPENID || "";
  const action = event.action || "";
  try {
    if (!OFFER_ID || !APP_KEY) return { ok: false, err: "VP_OFFER_ID/VP_APP_KEY 未配置（云函数环境变量）" };

    if (action === "getEntitlements") {
      console.log("[payx] getEntitlements 调用者 openid:", OPENID);
      const ent = await getEntitlements(OPENID);
      console.log("[payx] getEntitlements 返回:", JSON.stringify(ent));
      return { ok: true, ent };
    }

    if (action === "createOrder") {
      const prod = PRODUCTS[event.productId];
      if (!prod) return { ok: false, err: "未知道具: " + event.productId };
      if (!event.code) return { ok: false, err: "缺少 wx.login code" };
      const sess = await code2Session(event.code);
      if (sess.openid !== OPENID) return { ok: false, err: "登录态与当前用户不一致" };
      await ensureCollections();
      const outTradeNo = "T" + Date.now() + Math.floor(Math.random() * 9000 + 1000);
      // signData：字段与官方文档一致；JSON.stringify 仅此一次，签名与前端透传共享同一份字符串
      const signData = JSON.stringify({
        offerId: OFFER_ID,
        buyQuantity: 1,
        env: 0,
        currencyType: "CNY",
        productId: event.productId,
        goodsPrice: prod.price,
        outTradeNo,
        attach: OPENID
      });
      const paySig = calcPaySig("requestVirtualPayment", signData);
      const signature = calcSignature(signData, sess.session_key);
      await db.collection("orders").add({
        data: {
          outTradeNo, openid: OPENID, productId: event.productId,
          price: prod.price, status: "pending", createdAt: Date.now()
        }
      });
      return {
        ok: true,
        payData: {
          mode: "short_series_goods",
          signData,
          paySig,
          signature
        }
      };
    }

    if (action === "confirmOrder") {
      // 支付成功后客户端主动确认：查该用户所有 pending 订单 → 已支付则补发货（不依赖发货推送）
      console.log("[payx] confirmOrder 调用者 openid:", OPENID);
      await ensureCollections();
      const pend = await db.collection("orders")
        .where({ openid: OPENID, status: "pending" })
        .orderBy("createdAt", "desc").limit(10).get();
      console.log("[payx] confirmOrder 待处理订单:", JSON.stringify((pend.data || []).map((o) => ({ t: o.outTradeNo, p: o.productId }))));
      const granted = [];
      const DAY = 24 * 3600 * 1000;
      for (const o of pend.data || []) {
        try {
          const q = await queryOrderAndGrant(OPENID, o.outTradeNo);
          // 全量打印 query_order 原始响应（上线排查后可移除）
          console.log("[payx] query_order 原始响应:", o.outTradeNo, JSON.stringify(q.raw).slice(0, 600));
          if (q.paid) {
            const ent = PRODUCTS[o.productId] && PRODUCTS[o.productId].ent;
            const wxOid = (q.raw && (q.raw.wx_order_id || (q.raw.order && q.raw.order.wx_order_id))) || o.outTradeNo;
            if (ent) {
              await grantEntitlement(OPENID, ent, wxOid);
              granted.push(o.productId);
            }
            // 订单落定为 paid：避免每次冷启动重复查询同一笔已支付订单
            await db.collection("orders").doc(o._id).update({ data: { status: "paid", paidAt: Date.now(), wxOrderId: wxOid } });
          } else if (Date.now() - (o.createdAt || 0) > DAY) {
            // 查单权威确认未支付 + 下单超 24h → 标记过期，不再重复查询
            await db.collection("orders").doc(o._id).update({ data: { status: "expired", expiredAt: Date.now() } });
            console.log("[payx] 订单过期:", o.outTradeNo);
          }
        } catch (e) {
          console.error("[payx] confirmOrder 单笔失败:", o.outTradeNo, e.message);
        }
      }
      const ent = await getEntitlements(OPENID);
      console.log("[payx] confirmOrder 完成: granted=" + granted.join(",") + " ent=" + JSON.stringify(ent));
      return { ok: true, granted, ent };
    }

    return { ok: false, err: "未知 action: " + action };
  } catch (e) {
    console.error("[payx] ", action, e.message);
    return { ok: false, err: e.message };
  }
};
