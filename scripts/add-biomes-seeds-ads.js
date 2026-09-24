// 群系页/特殊种子页底部接入原生模板广告（复用详情页同一位 adunit-15985168d5e58c19）
// 群系页内容在 scroll-view 内：广告放 scroll-view 内、sh-pad 之前（随内容滚动到真实底部）
// 种子页是普通流式布局：广告放 pad-bottom 之前
// 两页 js 增加空 onAdError 日志方法
const fs = require("fs")
let ok = 0

// 1) biomes.wxml
let bw = fs.readFileSync("pkgB-guide/pages/biomes/biomes.wxml", "utf8")
if (!bw.includes("adunit-15985168d5e58c19")) {
  const anchor = '      <view class="sh-pad" />'
  if (!bw.includes(anchor)) { console.log("biomes wxml 锚点未命中"); process.exit(1) }
  bw = bw.replace(anchor,
    '      <!-- 原生模板广告：群系列表末尾 -->\n' +
    '      <view class="ad-slot">\n        <ad unit-id="adunit-15985168d5e58c19" binderror="onAdError" />\n      </view>\n\n' + anchor)
  fs.writeFileSync("pkgB-guide/pages/biomes/biomes.wxml", bw)
  ok++; console.log("biomes.wxml OK")
} else console.log("biomes.wxml 已有")

// 2) biomes.js onAdError（Page 方法，插在 onShow 前后的任意安全位置：用 Page({data 之后? 直接找 onLoad））
let bj = fs.readFileSync("pkgB-guide/pages/biomes/biomes.js", "utf8")
if (!bj.includes("onAdError")) {
  // 找第一个 "  onLoad" 或 "onLoad" 方法前插入同级方法
  const m = bj.match(/(\n  )(onLoad ?\()/)
  if (!m) { console.log("biomes js onLoad 锚点未命中"); process.exit(1) }
  bj = bj.replace(m[0], m[1] + "onAdError (e) { console.warn('[biomes] 原生模板广告错误:', (e && e.detail && e.detail.errMsg) || e) },\n" + m[1] + m[2])
  fs.writeFileSync("pkgB-guide/pages/biomes/biomes.js", bj)
  ok++; console.log("biomes.js OK")
} else console.log("biomes.js 已有")

// 3) biomes.wxss
let bc = fs.readFileSync("pkgB-guide/pages/biomes/biomes.wxss", "utf8")
if (!bc.includes(".ad-slot")) {
  bc += "\n/* 原生模板广告槽 */\n.ad-slot { margin: 20rpx 30rpx 0; border-radius: 16rpx; overflow: hidden; }\n"
  fs.writeFileSync("pkgB-guide/pages/biomes/biomes.wxss", bc)
  ok++; console.log("biomes.wxss OK")
} else console.log("biomes.wxss 已有")

// 4) worldseeds.wxml
let ww = fs.readFileSync("pkgB-guide/pages/worldseeds/worldseeds.wxml", "utf8")
if (!ww.includes("adunit-15985168d5e58c19")) {
  const anchor = "  <view class=\"pad-bottom\" />"
  if (!ww.includes(anchor)) { console.log("worldseeds wxml 锚点未命中"); process.exit(1) }
  ww = ww.replace(anchor,
    '  <!-- 原生模板广告：种子列表末尾 -->\n' +
    '  <view class="ad-slot">\n    <ad unit-id="adunit-15985168d5e58c19" binderror="onAdError" />\n  </view>\n\n' + anchor)
  fs.writeFileSync("pkgB-guide/pages/worldseeds/worldseeds.wxml", ww)
  ok++; console.log("worldseeds.wxml OK")
} else console.log("worldseeds.wxml 已有")

// 5) worldseeds.js onAdError
let wj = fs.readFileSync("pkgB-guide/pages/worldseeds/worldseeds.js", "utf8")
if (!wj.includes("onAdError")) {
  const m = wj.match(/(\n  )(onLoad ?\()/)
  if (!m) { console.log("worldseeds js onLoad 锚点未命中"); process.exit(1) }
  wj = wj.replace(m[0], m[1] + "onAdError (e) { console.warn('[worldseeds] 原生模板广告错误:', (e && e.detail && e.detail.errMsg) || e) },\n" + m[1] + m[2])
  fs.writeFileSync("pkgB-guide/pages/worldseeds/worldseeds.js", wj)
  ok++; console.log("worldseeds.js OK")
} else console.log("worldseeds.js 已有")

// 6) worldseeds.wxss
let wc = fs.readFileSync("pkgB-guide/pages/worldseeds/worldseeds.wxss", "utf8")
if (!wc.includes(".ad-slot")) {
  wc += "\n/* 原生模板广告槽 */\n.ad-slot { margin: 20rpx 30rpx 0; border-radius: 16rpx; overflow: hidden; }\n"
  fs.writeFileSync("pkgB-guide/pages/worldseeds/worldseeds.wxss", wc)
  ok++; console.log("worldseeds.wxss OK")
} else console.log("worldseeds.wxss 已有")

console.log("完成", ok, "处")
