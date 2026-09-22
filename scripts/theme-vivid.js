// 主题视觉大改版：每套主题=全屏渐变背景+专属头部渐变(--hero)+高对比配色+tabBar换装
// 1) app.wxss：替换六套biome主题块（新配色+--hero+全屏渐变），base与light补--hero
// 2) home.wxss：写死的紫色头部渐变改 var(--hero)
// 3) tabBar：支持 biome 主题换装（背景/边框/文字/辉光全套）
// 4) utils/theme.js：场景预览色同步新配色
const fs = require("fs")

// ---------- 1. app.wxss ----------
let wxss = fs.readFileSync("app.wxss", "utf8")

// 1a. 剪掉旧的六套 biome 块（从丛林标记到文件尾）
const mark = "/* ---------- 主题皮肤：丛林 ---------- */"
const i = wxss.indexOf(mark)
if (i < 0) { console.log("biome 标记未命中"); process.exit(1) }
wxss = wxss.slice(0, i)

// 1b. base .page-root 补 --hero（锚定 base 块的 shadow 行，旧 biome 块已剪掉故唯一）
const baseAnchor = "  --shadow: rgba(0, 0, 0, 0.45);"
if (!wxss.includes(baseAnchor)) { console.log("base shadow 锚点未命中"); process.exit(1) }
wxss = wxss.replace(baseAnchor,
  "  --shadow: rgba(0, 0, 0, 0.45);\n  --hero: linear-gradient(180deg, #3A2C58 0%, #1A0E2E 42%, #120925 100%);")

// 1c. light 块补 --hero
const lightAnchor = "  --shadow: rgba(90, 70, 30, 0.25);\n}"
if (!wxss.includes(lightAnchor)) { console.log("light shadow 锚点未命中"); process.exit(1) }
wxss = wxss.replace(lightAnchor,
  "  --shadow: rgba(90, 70, 30, 0.25);\n  --hero: linear-gradient(180deg, #C8E4FA 0%, #FFF3D6 60%, #F1EADA 100%);\n}")

// 1d. 追加全新六套主题块（高对比配色 + 全屏渐变 + --hero）
const THEMES_CSS = `
/* ---------- 主题皮肤：丛林（苍翠秘境） ---------- */
.page-root.theme-jungle {
  --bg: #122B12; --bg-deep: #0A1D0C; --bg-2: #1C3D1C;
  --card: rgba(46, 94, 36, 0.5); --card-solid: #1C3D18;
  --gold: #C8E85A; --gold-deep: #8FB02E;
  --gold-soft: rgba(200, 232, 90, 0.5); --gold-faint: rgba(200, 232, 90, 0.22);
  --text: #D8E8B8; --text-dim: #8FB060; --text-faint: #5C7A3E;
  --line: rgba(200, 232, 90, 0.28); --shadow: rgba(0, 0, 0, 0.5);
  --hero: linear-gradient(180deg, #3E7A30 0%, #1E4418 46%, #0A1D0C 100%);
  background: linear-gradient(180deg, #2E5A24 0%, #142E12 46%, #0A1D0C 100%);
}
.page-root.theme-jungle .sheet { background: linear-gradient(180deg, #1C3D1C 0%, #0A1D0C 100%); }
.page-root.theme-jungle .chip { background: rgba(200, 232, 90, 0.08); border-color: rgba(200, 232, 90, 0.2); }

/* ---------- 主题皮肤：腐化之地（魔紫深渊） ---------- */
.page-root.theme-corruption {
  --bg: #1D1030; --bg-deep: #120A20; --bg-2: #2E1B4A;
  --card: rgba(90, 50, 150, 0.5); --card-solid: #2A1846;
  --gold: #C77DFF; --gold-deep: #8A45D8;
  --gold-soft: rgba(199, 125, 255, 0.5); --gold-faint: rgba(199, 125, 255, 0.22);
  --text: #DCC8F5; --text-dim: #9B7FC8; --text-faint: #65508C;
  --line: rgba(199, 125, 255, 0.28); --shadow: rgba(0, 0, 0, 0.5);
  --hero: linear-gradient(180deg, #4A2A7E 0%, #2A1550 46%, #120A20 100%);
  background: linear-gradient(180deg, #3D2266 0%, #241243 46%, #120A20 100%);
}
.page-root.theme-corruption .sheet { background: linear-gradient(180deg, #2E1B4A 0%, #120A20 100%); }
.page-root.theme-corruption .chip { background: rgba(199, 125, 255, 0.08); border-color: rgba(199, 125, 255, 0.2); }

/* ---------- 主题皮肤：猩红之地（血肉梦魇） ---------- */
.page-root.theme-crimson {
  --bg: #2A0F14; --bg-deep: #1B080C; --bg-2: #40161E;
  --card: rgba(110, 32, 44, 0.5); --card-solid: #341019;
  --gold: #FF9E6B; --gold-deep: #C86438;
  --gold-soft: rgba(255, 158, 107, 0.5); --gold-faint: rgba(255, 158, 107, 0.22);
  --text: #F0D4C8; --text-dim: #B88478; --text-faint: #7E564C;
  --line: rgba(255, 158, 107, 0.28); --shadow: rgba(0, 0, 0, 0.5);
  --hero: linear-gradient(180deg, #7A2832 0%, #461520 46%, #1B080C 100%);
  background: linear-gradient(180deg, #5E1E28 0%, #38121A 46%, #1B080C 100%);
}
.page-root.theme-crimson .sheet { background: linear-gradient(180deg, #40161E 0%, #1B080C 100%); }
.page-root.theme-crimson .chip { background: rgba(255, 158, 107, 0.08); border-color: rgba(255, 158, 107, 0.2); }

/* ---------- 主题皮肤：神圣之地（珍珠圣域·亮色） ---------- */
.page-root.theme-hallow {
  --bg: #F7ECF7; --bg-deep: #EDDFED; --bg-2: #FCF4FC;
  --card: rgba(255, 255, 255, 0.85); --card-solid: #FDF8FD;
  --gold: #B85CA8; --gold-deep: #8A3E80;
  --gold-soft: rgba(184, 92, 168, 0.45); --gold-faint: rgba(184, 92, 168, 0.2);
  --text: #46284A; --text-dim: #86688A; --text-faint: #B09CB4;
  --line: rgba(160, 80, 150, 0.35); --shadow: rgba(120, 60, 110, 0.25);
  --hero: linear-gradient(180deg, #E8C8F0 0%, #FDF6E8 60%, #F0E2F0 100%);
  background: linear-gradient(180deg, #F0D8F0 0%, #FDF4F0 55%, #EDDFED 100%);
}
.page-root.theme-hallow .sheet { background: linear-gradient(180deg, #FDF8FD 0%, #F0E2F0 100%); }
.page-root.theme-hallow .chip { background: rgba(184, 92, 168, 0.08); border-color: rgba(184, 92, 168, 0.2); }
.page-root.theme-hallow .input-dark { background: rgba(255, 255, 255, 0.75); }

/* ---------- 主题皮肤：月亮领主（深空夜明） ---------- */
.page-root.theme-lunar {
  --bg: #081426; --bg-deep: #040B18; --bg-2: #10233E;
  --card: rgba(24, 52, 92, 0.5); --card-solid: #0E1C33;
  --gold: #62E0F0; --gold-deep: #2EA4BC;
  --gold-soft: rgba(98, 224, 240, 0.5); --gold-faint: rgba(98, 224, 240, 0.2);
  --text: #C8DEF2; --text-dim: #6E96C0; --text-faint: #426084;
  --line: rgba(98, 224, 240, 0.28); --shadow: rgba(0, 0, 0, 0.55);
  --hero: linear-gradient(180deg, #1A3E74 0%, #0E2244 46%, #040B18 100%);
  background: linear-gradient(180deg, #12305E 0%, #0A1B36 46%, #040B18 100%);
}
.page-root.theme-lunar .sheet { background: linear-gradient(180deg, #10233E 0%, #040B18 100%); }
.page-root.theme-lunar .chip { background: rgba(98, 224, 240, 0.08); border-color: rgba(98, 224, 240, 0.2); }

/* ---------- 主题皮肤：万圣节（南瓜夜） ---------- */
.page-root.theme-halloween {
  --bg: #261708; --bg-deep: #180E05; --bg-2: #3A240E;
  --card: rgba(110, 72, 22, 0.5); --card-solid: #30200E;
  --gold: #FFAE42; --gold-deep: #CC7E1E;
  --gold-soft: rgba(255, 174, 66, 0.5); --gold-faint: rgba(255, 174, 66, 0.22);
  --text: #F2DFC0; --text-dim: #BC9660; --text-faint: #7E643E;
  --line: rgba(255, 174, 66, 0.28); --shadow: rgba(0, 0, 0, 0.5);
  --hero: linear-gradient(180deg, #7A4E18 0%, #462A10 46%, #180E05 100%);
  background: linear-gradient(180deg, #5E3A12 0%, #36200C 46%, #180E05 100%);
}
.page-root.theme-halloween .sheet { background: linear-gradient(180deg, #3A240E 0%, #180E05 100%); }
.page-root.theme-halloween .chip { background: rgba(255, 174, 66, 0.08); border-color: rgba(255, 174, 66, 0.2); }
`
wxss = wxss + THEMES_CSS
fs.writeFileSync("app.wxss", wxss)
console.log("app.wxss 六套主题重写 OK")

// ---------- 2. home.wxss 写死渐变 → var(--hero) ----------
let home = fs.readFileSync("pages/home/home.wxss", "utf8")
const hOld = "linear-gradient(180deg, #3A2C58 0%, #1A0E2E 40%, #120925 100%);"
if (home.includes(hOld)) {
  home = home.replace(hOld, "var(--hero);")
  console.log("home 头部渐变 → var(--hero) OK")
} else console.log("home 渐变锚点未命中（可能已改）")
home = home.split("border: 2rpx solid #1A0E2E;").join("border: 2rpx solid var(--bg-deep);")
fs.writeFileSync("pages/home/home.wxss", home)

// ---------- 3. tabBar 换装 ----------
let tj = fs.readFileSync("custom-tab-bar/index.js", "utf8")
const tOld = "this.setData({ light: th === 'light' || th === 'hallow' })"
if (!tj.includes(tOld)) { console.log("tabBar js 锚点未命中"); process.exit(1) }
tj = tj.replace(tOld, "this.setData({ light: th === 'light' || th === 'hallow', themeCls: (th !== 'dark' && th !== 'light') ? 'theme-' + th : '' })")
fs.writeFileSync("custom-tab-bar/index.js", tj)

let tw = fs.readFileSync("custom-tab-bar/index.wxml", "utf8")
if (!tw.includes("themeCls")) {
  tw = tw.replace('<view class="tabbar {{light ? \'theme-light\' : \'\'}}">',
    '<view class="tabbar {{light ? \'theme-light\' : \'\'}} {{themeCls}}">')
  fs.writeFileSync("custom-tab-bar/index.wxml", tw)
  console.log("tabBar wxml OK")
}

const TAB_CSS = `
/* ---------- biome 主题换装 ---------- */
.tabbar.theme-jungle { background: rgba(10, 29, 12, 0.97); border-top-color: rgba(200, 232, 90, 0.35); }
.tabbar.theme-jungle .tab-text { color: #8FB060; }
.tabbar.theme-jungle .tab-text.on { color: #C8E85A; text-shadow: 0 0 12rpx rgba(200, 232, 90, 0.5); }
.tabbar.theme-jungle .tab-icon.on { filter: drop-shadow(0 0 12rpx rgba(200, 232, 90, 0.65)); }
.tabbar.theme-corruption { background: rgba(18, 10, 32, 0.97); border-top-color: rgba(199, 125, 255, 0.35); }
.tabbar.theme-corruption .tab-text { color: #9B7FC8; }
.tabbar.theme-corruption .tab-text.on { color: #C77DFF; text-shadow: 0 0 12rpx rgba(199, 125, 255, 0.5); }
.tabbar.theme-corruption .tab-icon.on { filter: drop-shadow(0 0 12rpx rgba(199, 125, 255, 0.65)); }
.tabbar.theme-crimson { background: rgba(27, 8, 12, 0.97); border-top-color: rgba(255, 158, 107, 0.35); }
.tabbar.theme-crimson .tab-text { color: #B88478; }
.tabbar.theme-crimson .tab-text.on { color: #FF9E6B; text-shadow: 0 0 12rpx rgba(255, 158, 107, 0.5); }
.tabbar.theme-crimson .tab-icon.on { filter: drop-shadow(0 0 12rpx rgba(255, 158, 107, 0.65)); }
.tabbar.theme-lunar { background: rgba(4, 11, 24, 0.97); border-top-color: rgba(98, 224, 240, 0.35); }
.tabbar.theme-lunar .tab-text { color: #6E96C0; }
.tabbar.theme-lunar .tab-text.on { color: #62E0F0; text-shadow: 0 0 12rpx rgba(98, 224, 240, 0.5); }
.tabbar.theme-lunar .tab-icon.on { filter: drop-shadow(0 0 12rpx rgba(98, 224, 240, 0.65)); }
.tabbar.theme-halloween { background: rgba(24, 14, 5, 0.97); border-top-color: rgba(255, 174, 66, 0.35); }
.tabbar.theme-halloween .tab-text { color: #BC9660; }
.tabbar.theme-halloween .tab-text.on { color: #FFAE42; text-shadow: 0 0 12rpx rgba(255, 174, 66, 0.5); }
.tabbar.theme-halloween .tab-icon.on { filter: drop-shadow(0 0 12rpx rgba(255, 174, 66, 0.65)); }
.tabbar.theme-hallow { background: rgba(253, 248, 253, 0.97); border-top-color: rgba(184, 92, 168, 0.35); box-shadow: 0 -6rpx 30rpx rgba(120, 60, 110, 0.18); }
.tabbar.theme-hallow .tab-text { color: #A080A4; }
.tabbar.theme-hallow .tab-text.on { color: #B85CA8; text-shadow: 0 0 12rpx rgba(184, 92, 168, 0.4); }
.tabbar.theme-hallow .tab-icon.on { filter: drop-shadow(0 0 12rpx rgba(184, 92, 168, 0.55)); }
`
let tc = fs.readFileSync("custom-tab-bar/index.wxss", "utf8")
if (!tc.includes("biome 主题换装")) { tc += TAB_CSS; fs.writeFileSync("custom-tab-bar/index.wxss", tc); console.log("tabBar wxss OK") }

// ---------- 4. utils/theme.js 场景预览色同步 ----------
let tjs = fs.readFileSync("utils/theme.js", "utf8")
const SCENES = {
  jungle:     '"sky":"linear-gradient(180deg,#4E8E3C 0%,#142E12 75%)","ground":"#0A1D0C","dot":"#C8E85A","orb":"#D8E86A"',
  corruption: '"sky":"linear-gradient(180deg,#4A2A7E 0%,#241243 75%)","ground":"#120A20","dot":"#C77DFF","orb":"#9B5CF0"',
  crimson:    '"sky":"linear-gradient(180deg,#7A2832 0%,#38121A 75%)","ground":"#1B080C","dot":"#FF9E6B","orb":"#E8704A"',
  hallow:     '"sky":"linear-gradient(180deg,#F0C8F0 0%,#FDF6E8 75%)","ground":"#E8C8E0","dot":"#C868B8","orb":"#FFD8F0"',
  lunar:      '"sky":"linear-gradient(180deg,#1A3E74 0%,#0A1B36 75%)","ground":"#040B18","dot":"#62E0F0","orb":"#A0ECF8"',
  halloween:  '"sky":"linear-gradient(180deg,#7A4E18 0%,#36200C 75%)","ground":"#180E05","dot":"#FFAE42","orb":"#FFC96A"',
}
let n = 0
Object.entries(SCENES).forEach(([id, scene]) => {
  const re = new RegExp('(id: "' + id + '", scene: \\{)"[^}]*\\}')
  if (re.test(tjs)) { tjs = tjs.replace(re, "$1" + scene + "}"); n++ }
  else console.log("scene 未命中:", id)
})
fs.writeFileSync("utils/theme.js", tjs)
console.log("场景预览色同步:", n + "/6")
