// 灾厄物品图鉴 · 材料补录：13 个高频配方材料（漏收补齐）
// 数据来源：灾厄官方汉化包 Materials（名称/风味提示）；use（用于合成）由全部药水 ob 文本反查生成
// 用法：node scripts/cal-patch-materials.js （幂等：已存在的跳过）
const fs = require("fs")
const path = require("path")
const FILE = path.join(__dirname, "../pkg-cal/data/calamity-items.js")

const cal = require(FILE)

const MATS = [
  { key: "BloodOrb", id: "blood_orb", n: "血珠", en: "Blood Orb", tip: "" },
  { key: "StarblightSoot", id: "starblight_soot", n: "凋星微尘", en: "Starblight Soot", tip: "" },
  { key: "AncientBoneDust", id: "ancient_bone_dust", n: "上古骨灰", en: "Ancient Bone Dust", tip: "" },
  { key: "DarkPlasma", id: "dark_plasma", n: "暗离子体", en: "Dark Plasma", tip: "" },
  { key: "AshesofCalamity", id: "ashes_of_calamity", n: "灾厄尘", en: "Ashes of Calamity", tip: "" },
  { key: "EssenceofSunlight", id: "essence_of_sunlight", n: "日光精华", en: "Essence of Sunlight", tip: "天空、圣光及风暴生物之精华" },
  { key: "UnholyEssence", id: "unholy_essence", n: "浊火精华", en: "Unholy Essence", tip: "亵渎生物的精华" },
  { key: "AscendantSpiritEssence", id: "ascendant_spirit_essence", n: "化神魂精", en: "Ascendant Spirit Essence", tip: "融合强大灵魂而制成的最高级催化剂" },
  { key: "Bloodstone", id: "bloodstone", n: "血石", en: "Bloodstone", tip: "" },
  { key: "Necroplasm", id: "necroplasm", n: "灵质", en: "Necroplasm", tip: "可怖恶意涌动不已" },
  { key: "PurifiedGel", id: "purified_gel", n: "纯净凝胶", en: "Purified Gel", tip: "" },
  { key: "TitanHeart", id: "titan_heart", n: "泰坦之心", en: "Titan Heart", tip: "可在星辉信标处供奉" },
  { key: "StormlionMandible", id: "stormlion_mandible", n: "风暴之颚", en: "Stormlion Mandible", tip: "" }
]

const esc = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")
let added = 0, skipped = 0
const have = new Set(cal.items.map((i) => i.id))
MATS.forEach((m) => {
  if (have.has(m.id)) { skipped++; return }
  // use 反查：哪些已有条目的 ob 里出现该材料名（"名×N" 或直接出现）
  const usedBy = cal.items.filter((i) => i.ob && i.ob.indexOf(m.n) >= 0).map((i) => i.n)
  const use = usedBy.length ? "用于合成：" + usedBy.join("、") : ""
  cal.items.push({
    id: m.id, n: m.n, en: m.en, cat: "material",
    tip: m.tip || "",
    use: use
  })
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
fs.writeFileSync(
  FILE,
  "// 灾厄物品图鉴 · 批次1（Boss 掉落武器/饰品/药水/召唤物）\n" +
  "// 名称与效果取自灾厄官方汉化包（github Koibumi/CalamityCN）；36 条数值类提示与效果详解（dts）自灾厄中文维基正文核对补录（2026-11-24）\n" +
  "// 64 条药水获取方式（ob，配方/购买/掉落）自灾厄中文维基合成表核对补录（2026-11-24）\n" +
  "// 138 条武器数值（dmg/use/kb/mana/crit）自英文官方 Wiki item infobox 抓取（2026-11-24，cal-patch-stats.js）\n" +
  "// 13 条高频配方材料补录（use 用于合成反查自动生成）（2026-11-25，cal-patch-materials.js）\n" +
  "// 掉落来源 2026-11-22 对维基全量核对；管线：cal-extract-weapons → cal-match-items → cal-gen-items → cal-fill-potions → cal-patch-details → cal-patch-ob → cal-patch-stats → cal-patch-materials\n" +
  '// ver: 2026-11-25\n' +
  "module.exports={\n  ver:\"2026-11-25\",\n  items:[\n" + lines.join(",\n") + "\n  ]\n}\n"
)
console.log("材料补录:", added, "新增 /", skipped, "已存在跳过")
const after = require(FILE)
console.log("数据集总数:", after.items.length)
const mats = after.items.filter((i) => i.cat === "material")
console.log("材料条目:", mats.length, "条 | 带 use:", mats.filter((i) => i.use).length)
console.log("血珠 use:", (after.items.find((i) => i.id === "blood_orb") || {}).use)
