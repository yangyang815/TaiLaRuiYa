// 修复主题解锁弹窗：wx.showModal 的 confirmText 上限 4 个字符，"看视频解锁"(5字) 导致
// 整个 API 调用失败且走未处理的 fail 回调 → 点击静默无反应。改为 "看视频" 并补 fail 显错。
const fs = require("fs")
const p = "pages/theme/theme.js"
let js = fs.readFileSync(p, "utf8")

const oldBlk = `      confirmText: "看视频解锁",
      confirmColor: "#C8A84B",
      success: r => {
        if (!r.confirm) return`
const newBlk = `      confirmText: "看视频",
      confirmColor: "#C8A84B",
      fail: err => {
        console.error("[theme] showModal 失败:", err)
        wx.showToast({ title: "弹窗失败:" + (err && err.errMsg || "未知"), icon: "none" })
      },
      success: r => {
        if (!r.confirm) return`
if (!js.includes(oldBlk)) { console.log("锚点未命中"); process.exit(1) }
js = js.replace(oldBlk, newBlk)
fs.writeFileSync(p, js)
console.log("confirmText 修复 OK")
