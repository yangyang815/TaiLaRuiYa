// 材料补录 II：22 个（二次差集扫描发现，全部在官方 Materials 语言文件）
// use 由全部 ob 反查生成；图标另行下载
const fs = require("fs")
const path = require("path")
const CALLOC = path.join(process.env.TEMP || "/tmp", "calloc")
const FILE = path.join(__dirname, "../pkg-cal/data/calamity-items.js")

function parseHjson (file) {
  const s = fs.readFileSync(file, "utf8")
  const out = {}
  const re = /^([A-Za-z0-9_]+): \{([\s\S]*?)^\}/gm
  let m
  while ((m = re.exec(s))) {
    const dnM = m[2].match(/\tDisplayName: (.+)/)
    const tipM = m[2].match(/\tTooltip: (.+)/)
    if (dnM) out[m[1]] = { dn: dnM[1].trim().replace(/^\"|\"$/g, ""), tip: tipM ? tipM[1].trim().replace(/^\"|\"$/g, "") : "" }
  }
  return out
}
const zh = parseHjson(path.join(CALLOC, "zh-Hans.Items.Materials.hjson"))
const en = parseHjson(path.join(CALLOC, "en-US.Items.Materials.hjson"))

const KEYS = [
  "PlagueCellCanister", "MysteriousCircuitry", "DubiousPlating", "AerialiteBar", "SulphuricScale",
  "AshesofAnnihilation", "EssenceofHavoc", "UnholyCore", "ArmoredShell", "TwistingNether", "MeldBlob",
  "EssenceofEleum", "LifeAlloy", "Lumenyl", "BlightedGel", "LivingShard", "CoreofCalamity", "AstralBar",
  "EffulgentFeather", "NightmareFuel", "EndothermicEnergy", "DarksunFragment"
]
const ID = (k) => k.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase()

const cal = require(FILE)
const esc = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")
const have = new Set(cal.items.map((i) => i.id))
let added = 0, skipped = 0
const newIds = []
KEYS.forEach((k) => {
  const id = ID(k)
  if (have.has(id) || !zh[k] || !en[k]) { if (zh[k]) console.log("跳过(已存在或缺 en):", k); skipped++; return }
  const n = zh[k].dn
  // use 反查：全部 ob 出现该材料名
  const usedBy = cal.items.filter((i) => i.ob && i.ob.indexOf(n) >= 0).map((i) => i.n)
  cal.items.push({
    id: id, n: n, en: en[k].dn, cat: "material",
    tip: zh[k].tip || "",
    use: usedBy.length ? "用于合成：" + usedBy.join("、") : ""
  })
  newIds.push({ id: id, en: en[k].dn })
  added++
})

const lines = cal.items.map((e) =>
  '    { id:"' + esc(e.id) + '", n:"' + esc(e.n) + '", en:"' + esc(e.en) + '", cat:"' + e.cat + '"' +
  (e.cls ? ', cls:"' + e.cls + '"' : "") +
  (e.stg ? ', stg:"' + e.stg + '"' : "") +
  (e.boss ? ', boss:"' + e.boss + '"' : "") +
  (e.rate ? ', rate:"' + e.rate + '"' : "") +
  (e.dmg ? ', dmg:"' + esc(e.dmg) + '"' : "") +
  (e.use ? ', use:"' + esc(e.use) + '"' : "") +
  (e.ob ? ', ob:"' + esc(e.ob) + '"' : "") +
  (e.dts ? ", dts:" + JSON.stringify(e.dts) : "") +
  ', tip:"' + esc(e.tip) + '" }'
)
const head = fs.readFileSync(FILE, "utf8").split("items:[")[0]
fs.writeFileSync(FILE, head + "items:[\n" + lines.join(",\n") + "\n  ]\n}\n")
console.log("补录:", added, "| 跳过:", skipped)
fs.writeFileSync(path.join(__dirname, "../scripts/_tmp-material2-ids.json"), JSON.stringify(newIds))
const after = require(FILE)
console.log("数据集总数:", after.items.length)
newIds.forEach((x) => {
  const e = after.items.find((i) => i.id === x.id)
  console.log("◆ " + e.n + " (en=" + e.en + ") use=" + (e.use || "").slice(0, 40))
})
