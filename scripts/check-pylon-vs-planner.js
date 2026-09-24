// 双向核对：NPC规划器的晶塔标记 vs 晶塔数据里的推荐搭档
// 官方规则：卖晶塔的必须是商贩 NPC（排除酒馆老板/旅商/骷髅商人），其快乐度系数 ≤0.9（1.4.4 移动版）
const path = require("path")
const P = require(path.resolve("pkgA-tool/utils/npcplan.js"))
const D = require(path.resolve("data/npcplan.js"))

// 官方可出售晶塔的商贩名单（wiki 晶塔页，21 人）
const VENDOR_NAMES = new Set(["军火商", "服装商", "机器侠", "爆破专家", "树妖", "染料商", "哥布林工匠", "高尔夫球手",
  "机械师", "商人", "油漆工", "派对女孩", "海盗", "公主", "圣诞老人", "蒸汽朋克人", "发型师", "松露人", "巫医", "巫师", "动物学家"])
const byName = {}
D.NPCS.forEach(n => { byName[n.name] = n })
const isVendor = name => VENDOR_NAMES.has(name)

console.log("===== ① NPC规划器 planBest() 分组核对 =====")
const plan = P.planBest()
let issues = 0
plan.groups.forEach(g => {
  const vendorOk = g.members.some(m => isVendor(m.name) && m.factor <= D.PYLON_MAX)
  const label = g.members.map(m => m.name + "(" + m.pct + "%" + (isVendor(m.name) ? ",商贩" : ",非商贩") + ")").join(" + ")
  const flag = g.pylon ? "标记可买晶塔" : "不可买晶塔"
  const real = vendorOk
  if (g.pylon !== real) { issues++; console.log("❌ [" + g.biomeName + "] " + label + " → " + flag + " 但实际" + (real ? "可以（有商贩≤90%）" : "不可以（无商贩达线）")) }
  else console.log("✓ [" + g.biomeName + "] " + label + " → " + flag)
})
console.log("规划器标记问题数:", issues)

console.log("\n===== ② 晶塔数据里的推荐搭档核对 =====")
const v1 = require(path.resolve("pkg-cat-1/data/data-v1.js"))
const pylons = v1.filter(x => /晶塔/.test(x.n) && x.ob.includes("推荐搭档"))
const BIOME_OF = { 森林晶塔: "forest", 雪原晶塔: "snow", 沙漠晶塔: "desert", 丛林晶塔: "jungle", 洞穴晶塔: "cave", 海洋晶塔: "ocean", 神圣晶塔: "hallow", 蘑菇晶塔: "mushroom", 地狱晶塔: "hell" }
let recIssues = 0
pylons.forEach(p => {
  const m = p.ob.match(/推荐搭档：(.+?) \+ (.+?)（/)
  if (!m) return
  const a = byName[m[1]], b = byName[m[2]]
  if (!a || !b) { console.log("❌", p.n, "找不到 NPC:", m[1], m[2]); recIssues++; return }
  const biome = BIOME_OF[p.n]
  const ra = P.evaluate(a, biome, [b.id])
  const rb = P.evaluate(b, biome, [a.id])
  const vendorOk = (isVendor(a.name) && ra.factor <= D.PYLON_MAX) || (isVendor(b.name) && rb.factor <= D.PYLON_MAX)
  if (vendorOk) console.log("✓ [" + p.n + "] " + a.name + "(" + ra.pct + "%" + (isVendor(a.name) ? ",商贩" : "") + ") + " + b.name + "(" + rb.pct + "%" + (isVendor(b.name) ? ",商贩" : "") + ") → 商贩达线，可购买")
  else { console.log("❌ [" + p.n + "] 无商贩达线！", a.name, b.name); recIssues++ }
})
console.log("\n晶塔搭档问题数:", recIssues)
