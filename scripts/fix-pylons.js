// 晶塔获得方式细化：依据官方中文 wiki 晶塔页（1.4.5 现行机制）
// 1.4.5 机制：任意商贩 NPC 出售"玩家当前所处群系"对应的晶塔；快乐度门槛已移除（1.4.5.0）；
// 需附近至少 2 个 NPC、玩家不在邪恶群系；酒馆老板 1.4.5.4 起不再出售；
// 万能晶塔=动物学家（1铂金，需完成完整怪物图鉴）；以太晶塔不可购买，仅微光嬗变。
const fs = require("fs")

// 通用购买条件（生物群系晶塔共用）
const BUY = cond => `${cond}：任意有商店的 NPC（商人/军火商/树妖/染料商/哥布林工匠/机械师/发型师/巫师等）出售（10 金）；需附近至少有 2 个入住 NPC、玩家不处于腐化/猩红群系（1.4.5 起不再要求快乐度）`

const FIX = {
  // pkg-cat-1 生物群系晶塔
  TeleportationPylonPurity:    [BUY("玩家处于森林（地表且不处于其他群系）"), "放置于森林中使用；附近 2 个城镇居民即可组网传送"],
  TeleportationPylonSnow:      [BUY("玩家处于雪原"), "放置于雪原中使用"],
  TeleportationPylonDesert:    [BUY("玩家处于沙漠"), "放置于沙漠中使用"],
  TeleportationPylonJungle:    [BUY("玩家处于丛林"), "放置于丛林中使用"],
  TeleportationPylonUnderground: [BUY("玩家处于洞穴层（地表以下）"), "放置于洞穴层中使用（含地狱层上方）"],
  TeleportationPylonOcean:     [BUY("玩家处于海洋"), "放置于海洋中使用"],
  TeleportationPylonHallow:    [BUY("玩家处于神圣之地"), "放置于神圣之地中使用"],
  TeleportationPylonMushroom:  [BUY("玩家处于发光蘑菇群系"), "放置于发光蘑菇群系中使用"],
  TeleportationPylonUnderworld: [BUY("玩家处于地狱"), "放置于地狱中使用（1.4.5 新增晶塔）"],
  // 以太晶塔：不可购买
  TeleportationPylonShimmer: ["不可购买：将任意其他晶塔（丛林/沙漠/雪原/蘑菇/万能/海洋/神圣/洞穴/森林/地狱）浸入微光嬗变获得", "放置在以太中（附近 300 格微光）即可生效，是唯一不要求群系之外条件的晶塔之一"],
  // 万能晶塔：动物学家，1 铂金，需完整图鉴
  TeleportationPylonVictory: ["动物学家出售（1 铂金），需完成完整的怪物图鉴（100% 研究，需击败月亮领主）解锁", "任意位置生效，且无需附近 NPC——可当作无限次使用的回城"],
}

let ok = 0, miss = []
// 按 f 定位所在卷并替换 ob/use
const vols = { "pkg-cat-1": null, "pkg-cat-2": null, "pkg-cat-3": null }
for (const vol of Object.keys(vols)) {
  const p = vol + "/data/data-v" + vol.slice(-1) + ".js"
  let s = fs.readFileSync(p, "utf8")
  let changed = 0
  for (const [f, [ob, use]] of Object.entries(FIX)) {
    // 定位 "f":"<f>" 所在条目，替换该条目内的 "ob":"..." 与 "use":"..."
    const fIdx = s.indexOf('"f":"' + f + '"')
    if (fIdx < 0) { continue }
    // 条目范围：向前找 { 向后找 }
    let start = s.lastIndexOf("{", fIdx)
    let end = s.indexOf("}", fIdx)
    let seg = s.slice(start, end + 1)
    if (!seg.includes('"ob":"')) { miss.push(f); continue }
    let newSeg = seg.replace(/"ob":"[^"]*"/, '"ob":"' + ob + '"')
    if (/"use":"[^"]*"/.test(newSeg)) newSeg = newSeg.replace(/"use":"[^"]*"/, '"use":"' + use + '"')
    s = s.slice(0, start) + newSeg + s.slice(end + 1)
    changed++
  }
  if (changed) { fs.writeFileSync(p, s); ok += changed }
  console.log(vol, "替换", changed, "条")
}
console.log("完成", ok, "| 未找到:", miss.join(",") || "无")
