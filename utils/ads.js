// 插屏广告：物品详情页/获取方式页返回时触发，带频控
// 上线前在 mp后台-流量主-自主接入 新建「插屏广告」，把 ID 填入下方（空 = 功能关闭）
const AD_UNIT_ID = "adunit-990db9bb1f7174ce" // 插屏广告位（mp后台-流量主-自主接入）
const LAUNCH_TS = Date.now()      // 模块加载时刻 ≈ 小程序启动
const MIN_AGE_MS = 30 * 1000      // 启动 30 秒内不弹
const MAX_PER_SESSION = 2         // 每次启动最多展示 2 次
const MIN_GAP_MS = 60 * 1000      // 两次展示至少间隔 60 秒

let ad = null
let shown = 0
let lastShow = 0

function getAd () {
  if (ad) return ad
  if (!AD_UNIT_ID || !wx.createInterstitialAd) return null
  ad = wx.createInterstitialAd({ adUnitId: AD_UNIT_ID })
  ad.onError(err => console.warn("[ads] 插屏错误:", (err && err.errMsg) || err))
  ad.load().catch(() => { })
  return ad
}

// 频控判断 + 展示（在页面 onUnload 中调用，异步展示不影响导航）
function maybeShow (scene) {
  try {
    if (!AD_UNIT_ID) return
    const now = Date.now()
    if (now - LAUNCH_TS < MIN_AGE_MS) return
    if (shown >= MAX_PER_SESSION) return
    if (now - lastShow < MIN_GAP_MS) return
    const a = getAd()
    if (!a) return
    const onShown = () => {
      shown++
      lastShow = Date.now()
      console.log("[ads] 插屏已展示:", scene, "第", shown, "次")
    }
    a.show().then(onShown).catch(() => {
      // 首次展示失败 → 拉取后重试一次
      a.load().then(() => a.show()).then(onShown).catch(() => { })
    })
  } catch (e) { }
}

module.exports = { maybeShow }
