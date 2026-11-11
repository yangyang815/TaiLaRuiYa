// 付费权益管理：道具配置、权益缓存、购买流程（个人主体虚拟支付·道具直购）
// 商品：去广告（永久）+ 全主题礼包；道具 ID 必须与后台「道具管理」一致，价格（分）须与后台一致
// 权益存储：云端 memberships 集合（以 openid 为键）+ 本地缓存 terr_pro（用于无网/云函数未部署时的降级读取）
const PRODUCTS = {
  noads: {
    productId: "VP_NOADS",
    name: "去广告（永久）",
    desc: "移除全部广告位与插屏，一次购买终身有效",
    priceText: "¥8",
    price: 800
  },
  themes: {
    productId: "VP_THEMES",
    name: "全主题礼包",
    desc: "解锁全部主题皮肤，无需再看激励视频",
    priceText: "¥3",
    price: 300
  }
};
const CACHE_KEY = "terr_pro";
let _ent = null; // 内存缓存 { noads, themes, ts }

function _readCache() {
  if (_ent) return _ent;
  try {
    const v = wx.getStorageSync(CACHE_KEY);
    _ent = v && typeof v === "object" ? v : { noads: false, themes: false };
  } catch (e) {
    _ent = { noads: false, themes: false };
  }
  return _ent;
}
function ent() {
  return _readCache();
}
function has(key) {
  const e = _readCache();
  return !!e[key];
}
function _saveCache(ent) {
  _ent = Object.assign({ ts: Date.now() }, ent);
  try {
    wx.setStorageSync(CACHE_KEY, _ent);
  } catch (e) {}
}
// 启动时刷新权益（云函数未部署/网络失败时静默降级为本地缓存）
function init() {
  if (!wx.cloud) return;
  wx.cloud.callFunction({ name: "payx", data: { action: "getEntitlements" } })
    .then((r) => {
      const d = r && r.result;
      if (d && d.ok && d.ent) _saveCache(d.ent);
    })
    .catch(() => {});
}
// iOS 版本校验：虚拟支付要求微信 8.0.68+
function _checkIos() {
  try {
    const sys = wx.getSystemInfoSync();
    if (sys.platform !== "ios") return true;
    const cur = String(sys.version || "0").split(".").map(Number);
    const base = [8, 0, 68];
    for (let i = 0; i < 3; i++) {
      if ((cur[i] || 0) > base[i]) return true;
      if ((cur[i] || 0) < base[i]) break;
    }
    wx.showModal({ title: "提示", content: "iOS 购买需微信 8.0.68 及以上版本，请更新微信后重试", showCancel: false });
    return false;
  } catch (e) {
    return true;
  }
}
// 购买入口：返回 Promise<{ok:true}|{ok:false,reason}>
function buy(key) {
  return new Promise((resolve) => {
    const prod = PRODUCTS[key];
    if (!prod) return resolve({ ok: false, reason: "badkey" });
    if (!wx.cloud) return resolve({ ok: false, reason: "nocloud" });
    if (typeof wx.requestVirtualPayment !== "function") {
      wx.showModal({ title: "提示", content: "当前微信版本过低，请更新微信后再购买", showCancel: false });
      return resolve({ ok: false, reason: "oldwx" });
    }
    if (!_checkIos()) return resolve({ ok: false, reason: "ios" });
    wx.login({
      success: ({ code }) => {
        if (!code) return resolve({ ok: false, reason: "nologin" });
        wx.cloud.callFunction({ name: "payx", data: { action: "createOrder", code, productId: prod.productId } })
          .then((r) => {
            const d = r && r.result;
            if (!d || !d.ok) {
              const err = (d && d.err) || "下单失败";
              wx.showToast({ title: err, icon: "none" });
              return resolve({ ok: false, reason: "order", err });
            }
            // 下单成功 → 拉起支付
            wx.requestVirtualPayment(Object.assign({}, d.payData, {
              success: () => {
                _saveCache(Object.assign({}, _readCache(), key === "noads" ? { noads: true } : { themes: true }));
                // 稍后由 init() 向云端核对权威状态；本地先行生效保证体验
                init();
                wx.showToast({ title: "购买成功", icon: "success" });
                resolve({ ok: true });
              },
              fail: (err) => {
                const msg = (err && err.errMsg) || "";
                console.warn("[pro] 支付失败(完整错误):", JSON.stringify(err));
                if (msg.indexOf("cancel") < 0) wx.showToast({ title: "支付未完成", icon: "none" });
                resolve({ ok: false, reason: "cancel", msg });
              }
            }));
          })
          .catch((e) => {
            console.warn("[pro] 下单异常(完整错误):", JSON.stringify(e));
            wx.showToast({ title: "服务暂不可用", icon: "none" });
            resolve({ ok: false, reason: "net" });
          });
      },
      fail: () => resolve({ ok: false, reason: "nologin" })
    });
  });
}
module.exports = { PRODUCTS, ent, has, init, buy };
