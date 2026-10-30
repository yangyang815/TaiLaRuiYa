// 轻量使用统计（隐私最小化设计）
// 只做一件事：把"页面访问次数"按 路由+白名单参数 聚合计数，低频批量上报云函数 trackPage
//
// 隐私红线（本文件承诺）：
// 1. 不采集 openid / 设备号 / 位置 / 相册等任何个人数据
// 2. 不采集搜索词（kw 参数被明确排除，只记"发生过一次搜索"这件事本身）
// 3. 本地聚合成计数器再上报，服务端按 自然日+键 聚合成一条文档，无法反推任何个人行为轨迹
// 4. 统计对用户完全不可见、无感知；全部逻辑 try/catch 包裹，绝不影响正常功能

// 上报白名单参数：只允许内容定位类参数（攻略 id / 分类等）
// 明确排除：kw（搜索词）、loader（装载页标记）、t 等一切其它参数
const PARAM_WL = ["id", "cat", "cls", "type", "bvid"];

// 黑名单路由：数据卷装载链（会自动连续跳转，计进去全是噪音）
const BLACKLIST = [/^pkg-cat-\d+\/pages\/index\/index$/, /\/pages\/blank\/blank$/];

// 缓冲阈值：累计 16 条触发一次上报（一次典型会话约 3~8 条 → 每会话约 1 次请求）
const FLUSH_THRESHOLD = 16;
// 单次上报键数上限
const MAX_ITEMS = 50;
// 缓冲区键数上限（上报持续失败时防止无限膨胀）
const MAX_BUFFER_KEYS = 80;
// 存储键（仅用于上报失败时暂存计数器，不含任何内容数据）
const BUF_KEY = "trackBuf";

let buf = {}; // key -> count

function safeKey(route, options) {
  if (!route) return null;
  const r = String(route);
  for (let i = 0; i < BLACKLIST.length; i++) {
    if (BLACKLIST[i].test(r)) return null;
  }
  let k = r;
  if (options && typeof options === "object") {
    const extra = [];
    for (let j = 0; j < PARAM_WL.length; j++) {
      const p = PARAM_WL[j];
      const raw = options[p];
      if (raw !== undefined && raw !== null && raw !== "") {
        // 参数值只保留安全字符并限长，杜绝把自由文本带进统计
        const v = String(raw).replace(/[^A-Za-z0-9_\-]/g, "").slice(0, 24);
        if (v) extra.push(p + "=" + v);
      }
    }
    if (extra.length) k += "?" + extra.join("&");
  }
  k = "pv:" + k;
  return k.length > 120 ? null : k;
}

function bump(k) {
  buf[k] = (buf[k] || 0) + 1;
  let total = 0;
  const keys = Object.keys(buf);
  for (let i = 0; i < keys.length; i++) total += buf[keys[i]];
  if (total >= FLUSH_THRESHOLD) flush("threshold");
  // 上报持续失败时的兜底：超过上限就丢弃最早的计数（统计可容忍，内存/存储必须可控）
  if (keys.length > MAX_BUFFER_KEYS) {
    buf = {};
  }
}

// 页面访问计数（由 app.js 的全局 Page 包装自动调用，业务代码无需关心）
function track(route, options) {
  try {
    const k = safeKey(route, options);
    if (!k) return;
    bump(k);
  } catch (e) {
    /* 统计绝不抛错 */
  }
}

// 内容事件计数（业务代码在关键动作后调用，例如 track.event("search")）
// 只记事件名本身，禁止携带任何用户输入内容
function event(name) {
  try {
    if (typeof name !== "string") return;
    const k = "ev:" + name.replace(/[^A-Za-z0-9_\-]/g, "").slice(0, 40);
    if (k.length < 4) return;
    bump(k);
  } catch (e) {
    /* 统计绝不抛错 */
  }
}

// 批量上报：成功则清掉已上报部分；失败则整缓冲暂存到本地，下次启动恢复
function flush(reason) {
  try {
    const keys = Object.keys(buf);
    if (!keys.length) return;
    if (!wx.cloud || !wx.cloud.callFunction) return; // 云不可用时静默留在缓冲
    const items = [];
    const sent = [];
    for (let i = 0; i < keys.length && items.length < MAX_ITEMS; i++) {
      const n = buf[keys[i]];
      if (n > 0) {
        items.push({ k: keys[i], n: Math.min(n, 99) });
        sent.push(keys[i]);
      }
    }
    if (!items.length) return;
    wx.cloud.callFunction({
      name: "trackPage",
      data: { items: items },
      success: () => {
        for (let i = 0; i < sent.length; i++) delete buf[sent[i]];
        try {
          wx.removeStorageSync(BUF_KEY);
        } catch (e) {}
      },
      fail: () => {
        try {
          wx.setStorageSync(BUF_KEY, buf);
        } catch (e) {}
      }
    });
  } catch (e) {
    /* 统计绝不抛错 */
  }
}

// 启动时恢复上次上报失败暂存的计数
function restore() {
  try {
    const saved = wx.getStorageSync(BUF_KEY);
    if (saved && typeof saved === "object") {
      const keys = Object.keys(saved);
      for (let i = 0; i < keys.length; i++) {
        if (typeof saved[keys[i]] === "number" && saved[keys[i]] > 0) {
          buf[keys[i]] = (buf[keys[i]] || 0) + saved[keys[i]];
        }
      }
      wx.removeStorageSync(BUF_KEY);
    }
  } catch (e) {}
}

module.exports = {
  track: track,
  event: event,
  flush: flush,
  restore: restore,
  safeKey: safeKey
};
