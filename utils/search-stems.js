// 中文类别词 → 英文词干（跨 dex 主包与 catalog 分包搜索共用）
const STEMS = {
  "法杖": "staff", "长杖": "staff", "杖": "staff",
  "魔杖": "wand",
  "弓": "bow",
  "枪": "gun",
  "剑": "sword",
  "镐": "pick",
  "斧": "axe",
  "锤": "hammer",
  "鞭": "whip",
  "钩": "hook",
  "鱼竿": "fishing rod", "钓竿": "fishing rod",
  "药水": "potion",
  "盔甲": "armor", "护甲": "armor", "套装": "armor",
  "翅膀": "wings", "翼": "wing",
  "坐骑": "mount",
  "回旋镖": "boomerang",
  "法书": "tome", "魔法书": "tome",
  "弹弓": "slingshot",
  "连弩": "repeater",
  "悠悠球": "yoyo"
};
const KEYS = Object.keys(STEMS).sort(function (a, b) { return b.length - a.length; });
// kw 中包含任一类别词即返回对应英文词干（长词优先，避免"魔杖"误命中"杖"）
function stemOf(kw) {
  kw = (kw || "").trim();
  if (!kw) return null;
  for (let i = 0; i < KEYS.length; i++) {
    if (kw.indexOf(KEYS[i]) >= 0) return STEMS[KEYS[i]];
  }
  return null;
}
module.exports = { STEMS: STEMS, stemOf: stemOf };
