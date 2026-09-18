// 重写 18 条 obtain：未翻译匣名 → 官方 GT 译名；"等 N 处来源"堆砌 → 可读概括
const fs = require('fs')
const p = 'data/items.js'
let s = fs.readFileSync(p, 'utf8')

const FIX = [
  ['undertaker', '打碎猩红之心获得（猩红世界）；血腥匣 20% 开出'],
  ['torch', '徒手：木材×1 + 凝胶×1（×3）；罐子与宝箱里也常能捡到天然火把'],
  ['gel_blue', '击杀各类史莱姆掉落（几乎必掉）'],
  ['hellstone_bar', '地狱熔炉：狱石×3 + 黑曜石×1（需熔岩镐采集）；黑曜石匣 25%、狱石匣 8.33% 开出'],
  ['life_crystal', '洞穴层开采；金匣 12.5%、钛金匣 11.88% 等匣子开出，部分史莱姆也会掉落'],
  ['sturdy_fossil', '提炼机处理沙漠化石；绿洲匣 50%、幻象匣 50% 开出'],
  ['cloud', '漂浮岛挖掘；天空匣/天蓝匣 50% 开出，天域箱内也有'],
  ['hellstone_ore', '地狱挖掘（需梦魇镐/死亡使者镐）；黑曜石匣 14.29%、狱石匣 7.14% 开出'],
  ['healing_potion', '摆放的瓶子：弱效治疗药水 + 发光蘑菇 合成；罐子与各类匣子常备，多数 Boss 也会掉落'],
  ['mana_potion', '摆放的瓶子：弱效魔力药水 + 发光蘑菇 合成；各类匣子（腐化匣/荆棘匣/天蓝匣等，均 25%）与宝箱常备'],
  ['iron_skin', '摆放的瓶子：瓶装水 + 太阳花 + 铁/铅矿 合成；罐子与匣子常备，部分敌怪掉落'],
  ['swiftness', '摆放的瓶子：瓶装水 + 闪耀根 + 仙人掌 合成；罐子与匣子常备，部分敌怪掉落'],
  ['spelunker', '摆放的瓶子：瓶装水 + 闪耀根 + 月光草 + 金矿/铂金矿 合成；罐子与各类匣子常备'],
  ['hunter', '摆放的瓶子：瓶装水 + 太阳花 + 闪耀根 + 鲨鱼鳍 合成；各类匣子常备'],
  ['heartreach', '摆放的瓶子：瓶装水 + 猩红虎鱼 + 太阳花（或加月光草）合成；各类匣子常备'],
  ['gravitation', '摆放的瓶子：瓶装水 + 火焰花 + 死亡草 + 闪耀根 + 羽毛 合成；各类匣子常备'],
  ['flipper', '摆放的瓶子：瓶装水 + 寒颤棘 + 水叶草 合成；铁匣 3.13%、秘银匣 3.13% 开出'],
  ['falcon_blade', '骷髅商人出售；铁匣 6.08%、秘银匣 5.98% 开出'],
]

let ok = 0
for (const [id, ob] of FIX) {
  const key = 'id:"' + id + '"'
  const i = s.indexOf(key)
  if (i < 0) { console.log('MISS', id); continue }
  const oi = s.indexOf('obtain:"', i)
  const oe = s.indexOf('"', oi + 8)
  if (oi < 0 || oe < 0 || oi - i > 600) { console.log('OB-FAIL', id); continue }
  s = s.slice(0, oi) + 'obtain:"' + ob + s.slice(oe)
  ok++
}
fs.writeFileSync(p, s)
console.log('完成', ok + '/' + FIX.length)
