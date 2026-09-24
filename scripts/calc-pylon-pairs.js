// 用官方好感数据（data/npcplan.js，经 npcplan 规划器同款公式）计算每座晶塔的最优 NPC 搭档
const path = require("path")
const P = require(path.resolve("pkgA-tool/utils/npcplan.js"))
const D = require(path.resolve("data/npcplan.js"))

// 出售晶塔的商贩排除：酒馆老板（1.4.5.4 起完全不出售，且商店易满）、旅商、骷髅商人（非固定入住）
const EXCLUDE = new Set(["npc_tavernkeep", "npc_traveling_merchant", "npc_skeleton_merchant"])
const vendors = D.NPCS.filter(n => !EXCLUDE.has(n.id) && !n.skip)

// 非商贩（不出售物品的 NPC 不能作为买家 NPC，但公主官方列表里可出售，保留）
function bestPairs (biomeId, topN) {
  const results = []
  for (let i = 0; i < vendors.length; i++) {
    for (let j = i + 1; j < vendors.length; j++) {
      const a = vendors[i], b = vendors[j]
      // 松露人固定蘑菇群系，不参与其他群系配对
      if ((a.fix && a.fix !== biomeId) || (b.fix && b.fix !== biomeId)) continue
      const ra = P.evaluate(a, biomeId, [b.id])
      const rb = P.evaluate(b, biomeId, [a.id])
      results.push({
        pair: [a.name, b.name],
        fa: ra.factor, fb: rb.factor,
        sum: ra.factor + rb.factor,
        canBuy: ra.factor <= D.PYLON_MAX && rb.factor <= D.PYLON_MAX
      })
    }
  }
  results.sort((x, y) => x.sum - y.sum)
  return results.slice(0, topN)
}

const PYLON_BIOMES = [
  ["forest", "森林晶塔"], ["snow", "雪原晶塔"], ["desert", "沙漠晶塔"],
  ["jungle", "丛林晶塔"], ["cave", "洞穴晶塔"], ["ocean", "海洋晶塔"],
  ["hallow", "神圣晶塔"], ["mushroom", "蘑菇晶塔"], ["hell", "地狱晶塔"]
]

console.log("PYLON_MAX =", D.PYLON_MAX)
for (const [biome, name] of PYLON_BIOMES) {
  const top = bestPairs(biome, 3)
  console.log("\n## " + name)
  top.forEach((r, i) => console.log("  " + (i + 1) + ". " + r.pair[0] + " + " + r.pair[1] +
    "  (系数 " + r.fa + " / " + r.fb + (r.canBuy ? "  ✅双方都达晶塔线" : "") + ")"))
}
