// 稀有度入库：307 条 rare 字段（英文 Wiki 全量）+ 详情页 stat 卡展示
const fs = require("fs")
const path = require("path")
const FILE = path.join(__dirname, "../pkg-cal/data/calamity-items.js")
const cal = require(FILE)
const { result } = JSON.parse(fs.readFileSync(path.join(process.env.TEMP || "/tmp", "cal_full_check.json"), "utf8"))

const esc = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")
let hit = 0
cal.items.forEach((e) => {
  const r = (result[e.id] || {}).rare
  if (!r) return
  let v = String(r)
  if (v === "-12") v = "12（专家专属）"   // -12 为灾厄专家模式专属稀有度标注
  else if (v === "a") v = "A（灾厄专属）" // a 为灾厄自定义稀有度等级
  e.rare = v
  hit++
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
  (e.rare ? ', rare:"' + esc(e.rare) + '"' : "") +
  (e.ob ? ', ob:"' + esc(e.ob) + '"' : "") +
  (e.dts ? ", dts:" + JSON.stringify(e.dts) : "") +
  ', tip:"' + esc(e.tip) + '" }'
)
const head = fs.readFileSync(FILE, "utf8").split("items:[")[0]
fs.writeFileSync(FILE, head + "items:[\n" + lines.join(",\n") + "\n  ]\n}\n")
console.log("rare 入库:", hit + "/" + cal.items.length)
const after = require(FILE)
console.log("抽查:", ["海蛇尾召唤杖", "彩虹", "血珠"].map((x) => {
  const e = x === "彩虹" ? after.items.find((i) => i.rare === "彩虹") : after.items.find((i) => i.n === x)
  return e ? e.n + "=" + e.rare : x + "=?"
}).join(" | "))
