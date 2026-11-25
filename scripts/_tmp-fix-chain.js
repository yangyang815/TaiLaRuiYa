// calamity-bosses.js 下一站链路修正（对齐 Boss Rush 官方推荐流程顺序，2026-11-25）
const fs = require("fs");
const FILE = "pkg-cal/data/calamity-bosses.js";
let s = fs.readFileSync(FILE, "utf8");

// 收集灾厄 Boss id（id: "cal_xxx" 形式）
const ID_LIST = [];
{
  const m = s.match(/id: "(cal_[a-z_]+)"/g);
  if (m) m.forEach((x) => ID_LIST.push(x.slice(6, -1)));
  if (!ID_LIST.length) { console.error("!! 未找到任何灾厄 Boss id"); process.exit(1); }
}
console.log("Boss 条目:", ID_LIST.length);

function segmentOf(id) {
  const start = s.indexOf('id: "' + id + '"');
  if (start < 0) return null;
  let end = s.length;
  for (const other of ID_LIST) {
    if (other === id) continue;
    const p = s.indexOf('id: "' + other + '"', start + 1);
    if (p >= 0 && p < end) end = p;
  }
  return { start: start, end: end };
}

const FIX = [
  ["cal_desert_scourge", "史莱姆之神（灾厄肉前收尾）", "菌生蟹（Crabulon）", "cal_slime_god", "cal_crabulon"],
  ["cal_profaned_guardians", "亵渎天神（Providence）", "痴愚金龙（Dragonfolly）", "cal_providence", "cal_dragonfolly"],
  ["cal_providence", "风暴编织者 / 无尽虚空 / 神之使徒西格纳斯（三选一顺序自由）", "无尽虚空（Ceaseless Void），三使徒顺序可自由选择", "cal_storm_weaver", "cal_ceaseless_void"],
  ["cal_storm_weaver", "无尽虚空（Ceaseless Void）", "神之使徒西格纳斯（Signus）", "cal_ceaseless_void", "cal_signus"],
  ["cal_ceaseless_void", "神之使徒西格纳斯（Signus）", "风暴编织者（Storm Weaver）", "cal_signus", "cal_storm_weaver"],
  ["cal_signus", "神明吞噬者（The Devourer of Gods）", "噬魂幽花（Polterghast）", "cal_devourer", "cal_polterghast"],
  ["cal_polterghast", "硫海遗爵（酸雨/钓鱼，可选）或 神明吞噬者", "硫海遗爵（The Old Duke）", "cal_devourer", "cal_old_duke"]
];

let ok = 0;
FIX.forEach(([id, oldT, newT, oldI, newI]) => {
  const seg = segmentOf(id);
  if (!seg) { console.log("!! 未找到 " + id); return; }
  let segText = s.slice(seg.start, seg.end);
  const idAnchor = 'nextId: "' + oldI + '"';
  if (segText.indexOf(idAnchor) < 0) { console.log("!! " + id + " 段内未找到 nextId: " + oldI); return; }
  segText = segText.replace(idAnchor, 'nextId: "' + newI + '"');
  const tAnchor = 'nextText: "' + oldT + '"';
  if (segText.indexOf(tAnchor) >= 0) {
    segText = segText.replace(tAnchor, 'nextText: "' + newT + '"');
  } else {
    console.log("  ~~ " + id + " nextText 未命中（仅改 nextId）");
  }
  s = s.slice(0, seg.start) + segText + s.slice(seg.end);
  ok++;
  console.log("  " + id + ": " + oldI + " → " + newI);
});

fs.writeFileSync(FILE, s);
console.log("完成 " + ok + "/" + FIX.length);
