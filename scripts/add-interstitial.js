// 详情页/获取方式页接入插屏：onUnload 返回时触发频控展示
const fs = require("fs")
let ok = 0

// 1) 两页头部加 require
for (const f of ["pages/detail/detail.js", "pages/acq/acq.js"]) {
  let s = fs.readFileSync(f, "utf8")
  if (!s.includes("utils/ads")) {
    const anchor = "const dex=require(\"../../utils/dex\");"
    if (!s.includes(anchor)) { console.log("require 锚点未命中:", f); process.exit(1) }
    s = s.replace(anchor, "const ads=require(\"../../utils/ads\");" + anchor)
    fs.writeFileSync(f, s)
    ok++; console.log("require OK:", f)
  } else console.log("已有 require:", f)
}

// 2) 两页加 onUnload（插屏触发点）
for (const [f, scene] of [["pages/detail/detail.js", "detail"], ["pages/acq/acq.js", "acq"]]) {
  let s = fs.readFileSync(f, "utf8")
  if (s.includes("ads.maybeShow")) { console.log("已有 onUnload:", f); continue }
  const anchor = "onLoad(opts){"
  if (!s.includes(anchor)) { console.log("onLoad 锚点未命中:", f); process.exit(1) }
  s = s.replace(anchor, "onUnload(){ads.maybeShow(\"" + scene + "\")}," + anchor)
  fs.writeFileSync(f, s)
  ok++; console.log("onUnload OK:", f)
}
console.log("完成", ok, "处")
