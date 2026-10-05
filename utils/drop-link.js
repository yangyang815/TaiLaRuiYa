// 掉落物 → 图鉴条目解析器
// 敌怪掉落物的 id 不在主包 dex 时，按名字（清洗后）在分包图鉴中精确匹配，
// 命中后由页面打开 cat: 弹窗（detail.showCatDetail / codex.openCatSheet）。
const catSearch = require("./catalog-search");

// monsters.js 历史掉落物名 → 图鉴官方名
const ALIAS = {
  "守护者勋章": "护卫奖章",
  "诡异木": "阴森木",
  "蜘蛛毒牙": "蜘蛛牙",
  "僵尸手臂": "僵尸臂",
  "血腥鱼饵桶": "鱼饵桶",
  "符文法师帽": "符文帽",
  "符文法师袍": "符文长袍",
  "花岗岩": "花岗岩块"
};

// 清洗掉落物名："蜘蛛牙×2~5"→"蜘蛛牙"、"符文帽（时装）"→"符文帽"
function clean(n) {
  let x = (n || "").trim();
  x = x.replace(/×\s*\d+(?:\s*[~～-]\s*\d+)?$/, "").replace(/×若干$/, "");
  x = x.replace(/（[^）]*）$/, "").replace(/\([^)]*\)$/, "");
  return x.trim();
}

// 依次尝试：清洗名 → 原名 → 别名；返回 Promise<图鉴条目|null>
function resolve(name) {
  const cands = [];
  const c = clean(name);
  if (c) cands.push(c);
  const r = (name || "").trim();
  if (r && cands.indexOf(r) < 0) cands.push(r);
  return cands.reduce((acc, n) => acc.then(hit => {
    if (hit) return hit;
    const t = ALIAS[n];
    return catSearch.findByName(t || n).then(e => e || null).catch(() => null);
  }), Promise.resolve(null));
}

module.exports = { resolve: resolve, clean: clean, ALIAS: ALIAS };
