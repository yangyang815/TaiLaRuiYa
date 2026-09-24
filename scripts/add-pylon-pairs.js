// 每座晶塔挑选"带群系亲和"的最优 NPC 搭档（优先至少一人喜爱该群系），写入 ob
const path = require("path")
const P = require(path.resolve("pkgA-tool/utils/npcplan.js"))
const D = require(path.resolve("data/npcplan.js"))
const fs = require("fs")

const EXCLUDE = new Set(["npc_tavernkeep", "npc_traveling_merchant", "npc_skeleton_merchant"])
const vendors = D.NPCS.filter(n => !EXCLUDE.has(n.id) && !n.skip)

function pairs (biomeId) {
  const out = []
  for (let i = 0; i < vendors.length; i++) {
    for (let j = i + 1; j < vendors.length; j++) {
      const a = vendors[i], b = vendors[j]
      if ((a.fix && a.fix !== biomeId) || (b.fix && b.fix !== biomeId)) continue
      const ra = P.evaluate(a, biomeId, [b.id])
      const rb = P.evaluate(b, biomeId, [a.id])
      const themed = P.biomeType(a, biomeId) === "love" || P.biomeType(a, biomeId) === "like" ||
        P.biomeType(b, biomeId) === "love" || P.biomeType(b, biomeId) === "like"
      out.push({ pair: [a.name, b.name], fa: ra.factor, fb: rb.factor, sum: ra.factor + rb.factor, themed })
    }
  }
  out.sort((x, y) => (y.themed - x.themed) || (x.sum - y.sum))
  return out[0]
}

// 群系 → 晶塔内部名
const MAP = [
  ["forest", "TeleportationPylonPurity"],
  ["snow", "TeleportationPylonSnow"],
  ["desert", "TeleportationPylonDesert"],
  ["jungle", "TeleportationPylonJungle"],
  ["cave", "TeleportationPylonUnderground"],
  ["ocean", "TeleportationPylonOcean"],
  ["hallow", "TeleportationPylonHallow"],
  ["mushroom", "TeleportationPylonMushroom"],
  ["hell", "TeleportationPylonUnderworld"]
]

const p = "pkg-cat-1/data/data-v1.js"
let s = fs.readFileSync(p, "utf8")
let n = 0
for (const [biome, f] of MAP) {
  const best = pairs(biome)
  const tag = "推荐搭档：" + best.pair[0] + " + " + best.pair[1] +
    "（两人一起住在该群系，快乐度均达晶塔线，价格系数 " +
    Math.round(best.fa * 100) + "% / " + Math.round(best.fb * 100) + "%）"
  const i = s.indexOf('"f":"' + f + '"')
  if (i < 0) { console.log("缺", f); process.exit(1) }
  const start = s.lastIndexOf("{", i), end = s.indexOf("}", i)
  let seg = s.slice(start, end + 1)
  if (seg.includes("推荐搭档")) continue
  seg = seg.replace(/"ob":"([^"]*)"/, '"ob":"$1。' + tag + '"')
  s = s.slice(0, start) + seg + s.slice(end + 1)
  n++
  console.log(f, "→", tag)
}
fs.writeFileSync(p, s)
console.log("写入", n, "处")

// 蘑菇晶塔追加松露人独居方案
let s2 = fs.readFileSync(p, "utf8")
const i2 = s2.indexOf('"f":"TeleportationPylonMushroom"')
const st2 = s2.lastIndexOf("{", i2), en2 = s2.indexOf("}", i2)
let seg2 = s2.slice(st2, en2 + 1)
if (!seg2.includes("松露人")) {
  seg2 = seg2.replace(/"ob":"([^"]*)"/, '"ob":"$1；最简方案：松露人独自住进蘑菇地即可直接购买"')
  s2 = s2.slice(0, st2) + seg2 + s2.slice(en2 + 1)
  fs.writeFileSync(p, s2)
  console.log("蘑菇晶塔补松露人方案")
}
