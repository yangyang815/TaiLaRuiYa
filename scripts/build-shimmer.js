// 微光嬗变数据构建脚本：拉取中文 wiki 微光页 → 解析嬗变表 → 生成 data/shimmer.js
// 用法：node scripts/build-shimmer.js（版本更新后重跑即可刷新转化表）
const fs = require("fs");
const path = require("path");
process.chdir(path.join(__dirname, ".."));

async function main() {
  const url =
    "https://terraria.wiki.gg/zh/api.php?action=parse&page=%E5%BE%AE%E5%85%89&prop=text&format=json&formatversion=2";
  const res = await fetch(url);
  const j = await res.json();
  const h = j.parse.text;
  console.log("已拉取微光页 HTML:", (h.length / 1024).toFixed(0) + "KB");

  // 章节切分
  const marks = [];
  const re2 = /<h2[^>]*>([\s\S]*?)<\/h2>/g;
  let m;
  while ((m = re2.exec(h))) marks.push({ text: m[1].replace(/<[^>]*>/g, "").trim(), pos: m.index });
  const secRange = (title) => {
    const idx = marks.findIndex((s) => s.text.indexOf(title) >= 0);
    if (idx < 0) throw new Error("未找到章节: " + title);
    return { start: marks[idx].pos, end: idx + 1 < marks.length ? marks[idx + 1].pos : h.length };
  };

  const strip = (t) => (t || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const firstTitle = (td) => {
    const mm = td.match(/title="([^"]+)"/);
    return mm ? mm[1] : "";
  };
  function parseRows(secText) {
    const out = [];
    const trs = secText.match(/<tr[\s\S]*?<\/tr>/g) || [];
    trs.forEach((tr) => {
      if (tr.indexOf("<th") >= 0) return;
      const tds = tr.match(/<td[\s\S]*?<\/td>/g) || [];
      if (tds.length < 2) return;
      out.push({
        from: firstTitle(tds[0]) || strip(tds[0]),
        to: firstTitle(tds[1]) || strip(tds[1]),
        cond: strip(tds[2] || "")
      });
    });
    return out;
  }

  // 物品嬗变（主章节）
  const mainSec = secRange("嬗变");
  const mainSeg = h.slice(mainSec.start, mainSec.end);
  const pairs = parseRows(mainSeg);

  // NPC 转化 / 小动物和敌怪嬗变
  const npcSec = secRange("NPC 转化");
  const npcs = parseRows(h.slice(npcSec.start, npcSec.end));
  const mobSec = secRange("小动物和敌怪嬗变");
  const mobs = parseRows(h.slice(mobSec.start, mobSec.end));

  const out = {
    updated: new Date().toISOString().slice(0, 10),
    source: "中文 wiki 微光页（1.4.5.8）",
    aether:
      "微光位于以太生物群系：每个世界仅一个，生成在地下/洞穴层，总与丛林同侧。将物品投入微光液体即可嬗变。",
    pairs: pairs,
    npcs: npcs,
    mobs: mobs
  };
  fs.writeFileSync(
    "data/shimmer.js",
    "// 自动生成：微光嬗变数据（" +
      out.updated +
      " 抓取自中文 wiki 1.4.5.8，勿手改；更新请重跑本脚本）\n" +
      "module.exports = " +
      JSON.stringify(out) +
      "\n"
  );
  console.log("data/shimmer.js 已生成: pairs=" + pairs.length + " npcs=" + npcs.length + " mobs=" + mobs.length);
}

main().catch((e) => {
  console.error("build-shimmer 失败:", e && e.message);
  process.exit(1);
});
