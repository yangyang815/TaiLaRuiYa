// 订阅消息助手：数据更新召回（一次性订阅）
// 模板：版本更新通知（thing2=更新内容≤20字，character_string1=版本编号≤32字）
//       已于 2026-11-13 在 mp后台-订阅消息-我的模板 选用（编号 10973）
// 机制说明：一次性订阅 = 用户授权一次获得一条发送额度；弹窗勾选"总是保持以上选择"后，
//          后续调用不再弹窗并静默续额——所以在自然节点重复调用是安全的、且鼓励
const TMPL_ID = "sbRiWraUh5_03e7WVB10Jfhr5ZPgB1P059n0RK6Vq6U";

function requestUpdate() {
  return new Promise((resolve) => {
    if (!TMPL_ID) return resolve({ ok: false, reason: "unconfig" });
    if (!wx.requestSubscribeMessage) return resolve({ ok: false, reason: "oldwx" });
    wx.requestSubscribeMessage({
      tmplIds: [TMPL_ID],
      success: (res) => {
        console.log("[notify] 授权结果:", JSON.stringify(res));
        const st = res[TMPL_ID];
        if (st === "accept") {
          // 授权成功 → 云端记录一条发送额度（+1），供广播时扣减
          if (wx.cloud) {
            wx.cloud.callFunction({ name: "notifyx", data: { action: "subscribe" } })
              .catch((e) => console.warn("[notify] 额度记录失败（不影响订阅）:", e && e.message));
          }
          return resolve({ ok: true });
        }
        if (st === "reject") return resolve({ ok: false, reason: "reject" });
        resolve({ ok: false, reason: st || "unknown" }); // ban=被主开关拉黑 / filter
      },
      fail: (e) => {
        console.error("[notify] requestSubscribeMessage 失败:", JSON.stringify(e));
        const msg = (e && e.errMsg) || "";
        if (msg.indexOf("20004") >= 0) {
          // 订阅消息主开关被用户关闭
          wx.showModal({ title: "无法订阅", content: "你在微信设置里关闭了订阅消息开关，请到 微信→设置→订阅消息 中开启后重试", showCancel: false });
          return resolve({ ok: false, reason: "off" });
        }
        // 失败原因透传到界面（模板ID无效/工具不支持等都会显示具体 errMsg）
        resolve({ ok: false, reason: "fail", msg: msg || "unknown" });
      }
    });
  });
}

module.exports = { TMPL_ID, requestUpdate };
