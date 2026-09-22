// 神圣之地主题重配色：从"灰粉+奶油"改为"珍珠蓝紫+兰花粉"（清爽彩虹圣域感）
// 覆盖三处：app.wxss 主题块 / tabBar 换装块 / utils/theme.js 场景预览
const fs = require("fs")

// ---------- 1. app.wxss ----------
let wxss = fs.readFileSync("app.wxss", "utf8")
const start = wxss.indexOf("/* ---------- 主题皮肤：神圣之地")
const end = wxss.indexOf("/* ---------- 主题皮肤：月亮领主")
if (start < 0 || end < 0 || end <= start) { console.log("神圣块定位失败"); process.exit(1) }
const HALLOW = `/* ---------- 主题皮肤：神圣之地（彩虹圣域·亮色） ---------- */
.page-root.theme-hallow {
  --bg: #F2F2FB; --bg-deep: #E6E6F4; --bg-2: #FBFBFF;
  --card: rgba(255, 255, 255, 0.85); --card-solid: #FFFFFF;
  --gold: #C84EC8; --gold-deep: #9E38A8;
  --gold-soft: rgba(200, 78, 200, 0.42); --gold-faint: rgba(200, 78, 200, 0.18);
  --text: #3A3054; --text-dim: #7A6E96; --text-faint: #A8A0C0;
  --line: rgba(150, 120, 190, 0.32); --shadow: rgba(110, 90, 160, 0.25);
  --hero: linear-gradient(180deg, #B8D4F8 0%, #E8C8F0 55%, #E6E2F6 100%);
  background: linear-gradient(180deg, #C8E0FA 0%, #F4E6F8 48%, #E6E6F4 100%);
}
.page-root.theme-hallow .sheet { background: linear-gradient(180deg, #FFFFFF 0%, #EEE8F8 100%); }
.page-root.theme-hallow .chip { background: rgba(200, 78, 200, 0.08); border-color: rgba(200, 78, 200, 0.2); }
.page-root.theme-hallow .input-dark { background: rgba(255, 255, 255, 0.78); }

`
wxss = wxss.slice(0, start) + HALLOW + wxss.slice(end)
fs.writeFileSync("app.wxss", wxss)
console.log("app.wxss 神圣块重写 OK")

// ---------- 2. tabBar hallow 换装 ----------
let tc = fs.readFileSync("custom-tab-bar/index.wxss", "utf8")
tc = tc.replace(/\.tabbar\.theme-hallow[^{]*\{[^}]*\}\n?/g, "")
tc += `.tabbar.theme-hallow { background: rgba(251, 251, 255, 0.97); border-top-color: rgba(200, 78, 200, 0.35); box-shadow: 0 -6rpx 30rpx rgba(110, 90, 160, 0.18); }
.tabbar.theme-hallow .tab-text { color: #9088AC; }
.tabbar.theme-hallow .tab-text.on { color: #C84EC8; text-shadow: 0 0 12rpx rgba(200, 78, 200, 0.4); }
.tabbar.theme-hallow .tab-icon.on { filter: drop-shadow(0 0 12rpx rgba(200, 78, 200, 0.55)); }
`
fs.writeFileSync("custom-tab-bar/index.wxss", tc)
console.log("tabBar 神圣换装 OK")

// ---------- 3. 场景预览色 ----------
let tjs = fs.readFileSync("utils/theme.js", "utf8")
const re = /(id: "hallow", scene: \{)"[^}]*\}/
if (!re.test(tjs)) { console.log("场景锚点未命中"); process.exit(1) }
tjs = tjs.replace(re, '$1"sky":"linear-gradient(180deg,#B8D4F8 0%,#E8C8F0 75%)","ground":"#DCC8EC","dot":"#C84EC8","orb":"#FFE8FA"}')
fs.writeFileSync("utils/theme.js", tjs)
console.log("场景预览 OK")
