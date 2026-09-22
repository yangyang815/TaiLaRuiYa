// 主题皮肤系统：主题定义 + 本地存储 + 激励视频解锁
// 广告位说明：上线前请在 mp后台-流量主 新建「激励视频」广告位，
// 并将 adUnitId 填入下方 REWARDED_AD_UNIT（当前为空 = 测试模式，点击直接解锁）。
const AD_UNIT_ID = "" // TODO: 替换为 mp后台 创建的激励视频广告位 ID（如 adunit-xxxx）

const STORE_KEY_UNLOCKED = "terr_theme_unlocked"
const STORE_KEY_CURRENT = "terr_theme"

// 主题清单：swatch 用于选择页预览色条
const THEMES = [
  { id: "dark", name: "暗夜紫", en: "Corrupt Night", desc: "默认主题，深邃的紫夜。", free: true, swatch: ["#1A0E2E", "#2A1B45", "#FFD700"] },
  { id: "light", name: "晨光", en: "Daylight", desc: "柔和的羊皮纸亮色。", free: true, swatch: ["#F1EADA", "#FFFBE9", "#A8790A"] },
  { id: "jungle", name: "丛林", en: "Jungle", desc: "藤蔓与苔藓的深绿秘境。", locked: true, swatch: ["#12240F", "#1E3D1A", "#B8D44A"] },
  { id: "corruption", name: "腐化之地", en: "Corruption", desc: "魔矿紫雾弥漫的诅咒之地。", locked: true, swatch: ["#170E22", "#2C1B44", "#B86AE0"] },
  { id: "crimson", name: "猩红之地", en: "Crimson", desc: "血肉与骨骼编织的红色梦魇。", locked: true, swatch: ["#260D12", "#38141C", "#E07050"] },
  { id: "hallow", name: "神圣之地", en: "Hallow", desc: "彩虹与珍珠铺成的圣洁国度。", locked: true, swatch: ["#F5EAF5", "#FDF8FD", "#B85CA8"] },
  { id: "lunar", name: "月亮领主", en: "Lunar", desc: "夜明青光笼罩的深空终局。", locked: true, swatch: ["#06090F", "#0E1A2C", "#5AD8E8"] },
  { id: "halloween", name: "万圣节", en: "Halloween", desc: "南瓜灯与糖果的橙夜狂欢。", locked: true, swatch: ["#1E140A", "#2E1E0E", "#FFA030"] },
]

function getUnlocked() {
  try {
    const arr = wx.getStorageSync(STORE_KEY_UNLOCKED)
    return Array.isArray(arr) ? arr : ["dark", "light"]
  } catch (e) { return ["dark", "light"] }
}

function isUnlocked(id) {
  const t = THEMES.find(x => x.id === id)
  if (t && t.free) return true
  return getUnlocked().indexOf(id) >= 0
}

function unlock(id) {
  const arr = getUnlocked()
  if (arr.indexOf(id) < 0) {
    arr.push(id)
    try { wx.setStorageSync(STORE_KEY_UNLOCKED, arr) } catch (e) { }
  }
  return true
}

function getCurrent() {
  try {
    const t = wx.getStorageSync(STORE_KEY_CURRENT)
    return t || "dark"
  } catch (e) { return "dark" }
}

function setCurrent(id) {
  try { wx.setStorageSync(STORE_KEY_CURRENT, id) } catch (e) { }
}

// 主题 id → 页面根 class（dark 走默认变量，其余 theme-xxx）
function classOf(t) {
  t = t || getCurrent()
  return t === "dark" ? "" : "theme-" + t
}

// 自定义 tabBar 只有明暗两套：亮色系主题映射到 light
function tabbarIsLight(t) {
  t = t || getCurrent()
  return t === "light" || t === "hallow"
}

// ---------- 激励视频 ----------
let rewarded = null

function getAd() {
  if (rewarded) return rewarded
  if (!wx.createRewardedVideoAd) return null
  rewarded = wx.createRewardedVideoAd({ adUnitId: AD_UNIT_ID })
  return rewarded
}

// 观看激励视频并解锁主题
// 返回 Promise<{ok:true}> 已解锁 / {ok:false,skip:true} 中途关闭 / {ok:false,fail:true} 加载失败
function unlockByAd(themeId) {
  return new Promise(resolve => {
    // 测试模式：广告位未配置时直接解锁（上线前务必填入正式 adUnitId）
    if (!AD_UNIT_ID) {
      unlock(themeId)
      resolve({ ok: true, test: true })
      return
    }
    const ad = getAd()
    if (!ad) { resolve({ ok: false, fail: true }); return }
    const onClose = r => {
      ad.offClose(onClose)
      if (r && (r.isEnded || r.isEnded === undefined)) {
        unlock(themeId)
        resolve({ ok: true })
      } else {
        resolve({ ok: false, skip: true })
      }
    }
    ad.onClose(onClose)
    ad.show().catch(() => {
      // 首次 show 失败 → 重新拉取后再试一次
      ad.load().then(() => ad.show()).catch(() => {
        ad.offClose(onClose)
        resolve({ ok: false, fail: true })
      })
    })
  })
}

module.exports = {
  THEMES: THEMES,
  AD_UNIT_ID: AD_UNIT_ID,
  getUnlocked: getUnlocked,
  isUnlocked: isUnlocked,
  unlock: unlock,
  getCurrent: getCurrent,
  setCurrent: setCurrent,
  classOf: classOf,
  tabbarIsLight: tabbarIsLight,
  unlockByAd: unlockByAd,
}
