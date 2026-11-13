// 虚拟支付：定时兜底查单（发货推送丢失时补发货）+ 订阅消息广播（notices 集合）
// 定时触发器 config.json：每 5 分钟
// 任务①：pending 超时订单 → xpay/query_order → 已支付则发货
// 任务②：notices 集合里 sent:false 的公告 → 推送给所有有额度的订阅者（订阅消息）
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

// 订阅消息广播：notices 集合里 sent:false 的公告 → 推给所有有额度的订阅者
// 文档结构：{ type:"broadcast", tmplId:"", page:"pages/home/home", fields:{...}, sent:false }
// fields 键名必须与所选订阅消息模板字段一致（thing 类 ≤20 字符，time 类为 YYYY-MM-DD HH:mm）
// 发送成功扣减订阅者 count；43101（用户拒收/额度耗尽）→ count 清零；tmplId 也可用环境变量 TMPL_SUB_ID 兜底
async function runBroadcast(token) {
  let notices;
  try {
    notices = await db.collection("notices").where({ sent: false }).limit(3).get();
  } catch (e) {
    return { skip: "notices 集合未创建" }; // 未使用广播功能时静默跳过
  }
  if (!notices.data || !notices.data.length) return { sent: 0 };
  const results = [];
  for (const n of notices.data) {
    const tmplId = n.tmplId || process.env.TMPL_SUB_ID || "";
    if (!tmplId) { results.push({ id: n._id, skip: "模板ID未配置" }); continue; }
    const page = n.page || "pages/home/home";
    const fields = n.fields || {};
    const data = {};
    Object.keys(fields).forEach((k) => { data[k] = { value: String(fields[k]) }; });
    // 只发给：有额度 且 没收到过这条公告的订阅者（lastNoticeId 过滤保证分批续发不重复）
    const subs = await db.collection("subscribers")
      .where({ count: db.command.gt(0), lastNoticeId: db.command.neq(n._id) })
      .limit(200).get();
    let ok = 0, fail = 0;
    for (const s of subs.data || []) {
      try {
        const body = JSON.stringify({ touser: s.openid, template_id: tmplId, page, data, miniprogram_state: "formal" });
        const r = await httpsPostJson("https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=" +
          encodeURIComponent(token), body);
        if (r && r.errcode === 0) {
          ok++;
          await db.collection("subscribers").doc(s._id).update({
            data: { count: db.command.inc(-1), lastNoticeId: n._id, lastSentAt: Date.now() }
          });
        } else if (r && r.errcode === 43101) {
          fail++;
          await db.collection("subscribers").doc(s._id).update({
            data: { count: 0, lastNoticeId: n._id }
          });
        } else {
          fail++;
          console.warn("[payCron] 广播单笔失败:", s.openid, JSON.stringify(r).slice(0, 120));
        }
      } catch (e) { fail++; }
      await new Promise((res) => setTimeout(res, 60)); // 频控保护
    }
    // 每批最多 200 人；订阅者更多时保持 sent:false，下一轮靠 lastNoticeId 续发
    const hasMore = (subs.data || []).length >= 200;
    await db.collection("notices").doc(n._id).update({
      data: { sent: !hasMore, sentAt: Date.now(), sentCount: db.command.inc(ok), failCount: db.command.inc(fail) }
    });
    results.push({ id: n._id, ok, fail, more: hasMore });
  }
  return { notices: results };
}

exports.main = async () => {
  if (!OFFER_ID || !APP_KEY || !APP_SECRET) {
    console.log("[payCron] 环境变量未配置，跳过兜底查单");
    return { ok: true, skip: true };
  }
  let checked = 0, paid = 0, broadcast = null;
  try {
    const tokenRes = await httpsGetJson("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" +
      encodeURIComponent(cloud.getWXContext().APPID || "") + "&secret=" + encodeURIComponent(APP_SECRET));
    const token = tokenRes.access_token || "";
    if (!token) console.error("[payCron] 获取 access_token 失败:", JSON.stringify(tokenRes).slice(0, 160));

    // 任务①：订单兜底查单——下单超 10 分钟仍 pending 才查
    const cutoff = Date.now() - 10 * 60 * 1000;
    const pend = await db.collection("orders")
      .where({ status: "pending", createdAt: db.command.lt(cutoff) })
      .orderBy("createdAt", "desc").limit(20).get();
    for (const o of pend.data || []) {
      if (!token) break;
      checked++;
      try {
        const body = JSON.stringify({ openid: o.openid, env: 0, order_id: o.outTradeNo });
        const sig = calcPaySig("/xpay/query_order", body);
        const r = await httpsPostJson("https://api.weixin.qq.com/xpay/query_order?access_token=" +
          encodeURIComponent(token) + "&pay_sig=" + encodeURIComponent(sig), { openid: o.openid, env: 0, order_id: o.outTradeNo });
        // 已支付判定与 payx 一致：实测 status:3=已支付（含 paid_fee）、status:6=已关闭未支付（无 paid_fee）
        // 兼容 status / paid_status 两种字段名；严禁匹配信封层 "SUCCESS"——未支付订单同样返回 SUCCESS
        const order = (r && r.order) || {};
        const paidTime = Number(order.paid_time || 0);
        const st = Math.max(Number(order.status) || 0, Number(order.paid_status) || 0);
        if (paidTime > 0 || (st >= 2 && st <= 4)) {
          const wxOrderId = order.wx_order_id || r.wx_order_id || o.outTradeNo;
          const ent = PRODUCTS[o.productId];
          if (ent) { await grant(o.openid, ent, wxOrderId, o.outTradeNo); paid++; }
        } else if (Date.now() - (o.createdAt || 0) > 24 * 3600 * 1000) {
          // 查单确认未支付 + 下单超 24h → 过期落定，不再重复查询
          await db.collection("orders").where({ outTradeNo: o.outTradeNo }).update({
            data: { status: "expired", expiredAt: Date.now() }
          });
          console.log("[payCron] 订单过期:", o.outTradeNo);
        }
      } catch (e) {
        console.warn("[payCron] 单笔查单异常:", o.outTradeNo, e.message);
      }
      await new Promise((r) => setTimeout(r, 120));
    }

    // 任务②：订阅消息广播——notices 集合里待发的公告推给订阅者
    const broadcast = token ? await runBroadcast(token) : null;
    return { ok: true, checked, paid, broadcast };
  } catch (e) {
    console.error("[payCron] 异常:", e.message);
    return { ok: false, err: e.message };
  }
};
