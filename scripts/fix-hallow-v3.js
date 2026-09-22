// 神圣之地 v3：四色渐变（天蓝→淡紫→粉→薄荷）+ 顶部彩虹光带，与晨光（纯米色）彻底区分
const fs = require("fs")

// ---------- 1. app.wxss ----------
let wxss = fs.readFileSync("app.wxss", "utf8")
const start = wxss.indexOf("/* ---------- 主题皮肤：神圣之地")
const end = wxss.indexOf("/* ---------- 主题皮肤：月亮领主")
if (start < 0 || end < 0 || end <= start) { console.log("神圣块定位失败"); process.exit(1) }
const HALLOW = `/* ---------- 主题皮肤：神圣之地（彩虹圣域·亮色） ---------- */
.page-root.theme-hallow {
  --bg: #F4F0FA; --bg-deep: #E9E2F5; --bg-2: #FCFAFE;
  --card: rgba(255, 255, 255, 0.82); --card-solid: #FFFFFF;
  --gold: #C044C8; --gold-deep: #9830A8;
  --gold-soft: rgba(192, 68, 200, 0.42); --gold-faint: rgba(192, 68, 200, 0.18);
  --text: #40305C; --text-dim: #7E6E9A; --text-faint: #ACA0C4;
  --line: rgba(140, 110, 180, 0.32); --shadow: rgba(110, 80, 160, 0.25);
  --hero: linear-gradient(135deg, #9CC2F8 0%, #C8A8F4 45%, #F2B8DC 100%);
  background: linear-gradient(180deg, #B8D0FA 0%, #E4C6F6 38%, #F8D4E8 66%, #CDEEE4 100%);
}
/* 彩虹光带：神圣主题专属身份标识 */
.page-root.theme-hallow::before {
  content: "";
  position: fixed; top: 0; left: 0; right: 0; height: 8rpx; z-index: 50;
  background: linear-gradient(90deg, #F8A8C8 0%, #C8A0F0 25%, #8AB8F8 50%, #7CD8C8 75%, #F8E09A 100%);
}
.page-root.theme-hallow .sheet { background: linear-gradient(180deg, #FFFFFF 0%, #F2E4F6 100%); }
.page-root.theme-hallow .chip { background: rgba(192, 68, 200, 0.08); border-color: rgba(192, 68, 200, 0.2); }
.page-root.theme-hallow .input-dark { background: rgba(255, 255, 255, 0.78); }

`
wxss = wxss.slice(0, start) + HALLOW + wxss.slice(end)
fs.writeFileSync("app.wxss", wxss)
console.log("app.wxss 神圣块 v3 OK")

// ---------- 2. tabBar：粉调白底 + 兰花紫选中 ----------
let tc = fs.readFileSync("custom-tab-bar/index.wxss", "utf8")
tc = tc.replace(/\.tabbar\.theme-hallow[^{]*\{[^}]*\}\n?/g, "")
tc += `.tabbar.theme-hallow { background: rgba(252, 248, 253, 0.97); border-top-color: rgba(192, 68, 200, 0.35); box-shadow: 0 -6rpx 30rpx rgba(110, 80, 160, 0.2); }
.tabbar.theme-hallow .tab-text { color: #9488B0; }
.tabbar.theme-hallow .tab-text.on { color: #C044C8; text-shadow: 0 0 12rpx rgba(192, 68, 200, 0.4); }
.tabbar.theme-hallow .tab-icon.on { filter: drop-shadow(0 0 12rpx rgba(192, 68, 200, 0.55)); }
`
fs.writeFileSync("custom-tab-bar/index.wxss", tc)
console.log("tabBar OK")

// ---------- 3. 场景预览：四色天空 ----------
let tjs = fs.readFileSync("utils/theme.js", "utf8")
const re = /(id: "hallow", scene: \{)"[^}]*\}/
if (!re.test(tjs)) { console.log("场景锚点未命中"); process.exit(1) }
tjs = tjs.replace(re, '$1"sky":"linear-gradient(180deg,#9CC2F8 0%,#C8A8F4 40%,#F2B8DC 75%)","ground":"#D4C0EC","dot":"#C044C8","orb":"#FFE0F4"}')
fs.writeFileSync("utils/theme.js", tjs)
console.log("场景预览 OK")
