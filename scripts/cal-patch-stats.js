// 灾厄武器数值补丁：写入 138 条武器的 dmg/use/kb/mana/crit 字段
// 数据来源：英文官方 Wiki（calamitymod.wiki.gg）item infobox（2026-11-24 抓取，138/138 全命中）
// 前置：node scripts/_tmp-fetch-weapon-stats.js 生成 $TEMP/cal_weapon_stats.json
// 用法：node scripts/cal-patch-stats.js （幂等）
const fs = require("fs")
const path = require("path")
const FILE = path.join(__dirname, "../pkg-cal/data/calamity-items.js")
const SRC = path.join(process.env.TEMP || "/tmp", "cal_weapon_stats.json")

const cal = require(FILE)
const { stats } = JSON.parse(fs.readFileSync(SRC, "utf8"))

const esc = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")
// 已知清洗：双模式数值原样保留为紧凑文案
const CLEAN = { "Vesuvius.mana": "8 / 9" }

let hit = 0, miss = []
cal.items.forEach((e) => {
  if (e.cat !== "weapon") return
  const st = stats[e.en]
  if (!st) { miss.push(e.n + "(" + e.en + ")"); return }
  hit++
  const num = (v, key) => {
    if (v === undefined) return undefined
    let s = String(v).replace(/<br\s*\/?>/g, " / ").replace(/\s*\((primary|secondary)\)/g, "").trim()
    const c = CLEAN[e.en + "." + key]
    if (c) s = c
    return s
  }
  e.dmg = num(st.damage, "damage")
  e.use = num(st.use, "use")
  e.kb = num(st.knockback, "knockback")
  e.mana = num(st.mana, "mana")
  e.crit = num(st.crit, "crit")
})

const lines = cal.items.map((e) =>
  '    { id:"' + esc(e.id) + '", n:"' + esc(e.n) + '", en:"' + esc(e.en) + '", cat:"' + e.cat + '"' +
  (e.cls ? ', cls:"' + e.cls + '"' : "") +
  (e.stg ? ', stg:"' + e.stg + '"' : "") +
  (e.boss ? ', boss:"' + e.boss + '"' : "") +
  (e.rate ? ', rate:"' + e.rate + '"' : "") +
  (e.dmg ? ', dmg:"' + esc(e.dmg) + '"' : "") +
  (e.use ? ', use:"' + esc(e.use) + '"' : "") +
  (e.kb ? ', kb:"' + esc(e.kb) + '"' : "") +
  (e.mana ? ', mana:"' + esc(e.mana) + '"' : "") +
  (e.crit ? ', crit:"' + esc(e.crit) + '"' : "") +
  (e.ob ? ', ob:"' + esc(e.ob) + '"' : "") +
  (e.dts ? ", dts:" + JSON.stringify(e.dts) : "") +
  ', tip:"' + esc(e.tip) + '" }'
)
fs.writeFileSync(
  FILE,
  "// 灾厄物品图鉴 · 批次1（Boss 掉落武器/饰品/药水/召唤物）\n" +
  "// 名称与效果取自灾厄官方汉化包（github Koibumi/CalamityCN）；36 条数值类提示与效果详解（dts）自灾厄中文维基正文核对补录（2026-11-24）\n" +
  "// 64 条药水获取方式（ob，配方/购买/掉落）自灾厄中文维基合成表核对补录（2026-11-24）\n" +
  "// 138 条武器数值（dmg/use/kb/mana/crit）自英文官方 Wiki item infobox 抓取（2026-11-24，cal-patch-stats.js）\n" +
  "// 掉落来源 2026-11-22 对维基全量核对；管线：cal-extract-weapons → cal-match-items → cal-gen-items → cal-fill-potions → cal-patch-details → cal-patch-ob → cal-patch-stats\n" +
  '// ver: 2026-11-24\n' +
  "module.exports={\n  ver:\"2026-11-24\",\n  items:[\n" + lines.join(",\n") + "\n  ]\n}\n"
)
console.log("武器数值补丁:", hit, "/ 138 命中")
if (miss.length) console.log("未命中:", miss.join("、"))
const after = require(FILE)
const ws = after.items.filter((i) => i.cat === "weapon")
console.log("武器 dmg 覆盖:", ws.filter((i) => i.dmg).length, "/", ws.length)
console.log("抽查:", JSON.stringify({ 海蛇尾: after.items.find(i => i.n === "海蛇尾召唤杖") && { dmg: after.items.find(i => i.n === "海蛇尾召唤杖").dmg, use: after.items.find(i => i.n === "海蛇尾召唤杖").use, kb: after.items.find(i => i.n === "海蛇尾召唤杖").kb } }))
