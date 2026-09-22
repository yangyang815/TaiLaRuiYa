// 神圣之地 v4：作为亮色主题全站生效——挂 theme-light 类继承全部亮色样式
const fs = require("fs")
let ok = 0
function patch(file, oldS, newS, tag) {
  const s = fs.readFileSync(file, "utf8")
  if (s.includes(newS)) { console.log("已修过:", tag); ok++; return }
  if (!s.includes(oldS)) { console.log("锚点未命中:", tag); process.exit(1) }
  fs.writeFileSync(file, s.replace(oldS, newS))
  ok++; console.log("OK:", tag)
}

// 1) app.js：hallow 的 themeClass 追加 theme-light（继承全站亮色样式）
patch("app.js",
  'themeClass(){const t=this.globalData.theme||"dark";return t==="dark"?"":"theme-"+t}',
  'themeClass(){const t=this.globalData.theme||"dark";return t==="dark"?"":"theme-"+t+(t==="hallow"?" theme-light":"")}',
  "app.js themeClass 追加 theme-light")

// 2) home.wxss：.night 硬编码深紫 → 主题变量（夜半点亮的主题也用各自底色）
patch("pages/home/home.wxss",
  "    radial-gradient(60% 30% at 8% 2%, rgba(94, 60, 154, 0.28), transparent 72%),\n    #120925;",
  "    radial-gradient(60% 30% at 8% 2%, rgba(255, 255, 255, 0.07), transparent 72%),\n    var(--bg-deep);",
  "home .night 改主题变量")

// 3) my.js：dark 标志识别 hallow 为亮色
patch("pages/my/my.js",
  'dark:store.getTheme()!=="light"',
  'dark:["light","hallow"].indexOf(store.getTheme())<0',
  "my.js dark 标志")

// 4) detail/strategy 底部按钮条补亮色覆盖（晨光与神圣共用）
const lightBar = ".page-root.theme-light .fb.collect { background: rgba(233, 226, 245, 0.95); }\n.page-root.theme-light .fb.defeated { background: rgba(233, 226, 245, 0.95); }\n"
for (const f of ["pages/detail/detail.wxss", "pages/strategy/strategy.wxss"]) {
  const s = fs.readFileSync(f, "utf8")
  if (!s.includes(".fb.collect")) { console.log("fb 锚点缺失:", f); process.exit(1) }
  if (!s.includes(".page-root.theme-light .fb.collect")) {
    fs.writeFileSync(f, s + "\n/* 亮色主题底部按钮条 */\n" + lightBar)
    console.log("OK: 底部按钮条亮色覆盖 →", f); ok++
  } else console.log("已修过:", f)
}

// 5) cat-detail 组件：内部自判亮色（hallow 视同 light），不再依赖未传的 theme 属性
patch("components/cat-detail/cat-detail.js",
  "  data: { vm: null, fav: false },",
  "  data: { vm: null, fav: false, light: false },\n  lifetimes: {\n    attached() { this.syncLight() }\n  },\n  pageLifetimes: {\n    show() { this.syncLight() }\n  },",
  "cat-detail 生命周期挂载")
patch("components/cat-detail/cat-detail.js",
  "  methods: {\n    build(v) {",
  "  methods: {\n    syncLight() {\n      const app = getApp()\n      const t = app && app.globalData && app.globalData.theme\n      this.setData({ light: this.data.theme === \"light\" || t === \"light\" || t === \"hallow\" })\n    },\n    build(v) {",
  "cat-detail syncLight")
patch("components/cat-detail/cat-detail.wxml",
  "{{theme === 'light' ? 'cd-light' : ''}}",
  "{{light ? 'cd-light' : ''}}",
  "cat-detail wxml light 类")

console.log("完成", ok, "处")
