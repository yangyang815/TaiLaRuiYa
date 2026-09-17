// 流程攻略（progress 3篇）+ 职业养成 数值核对修补（依据官方 wiki，2026-09-17）
const fs = require('fs')
let s = fs.readFileSync('data/strategies.js', 'utf8')
const errs = []
const rep = (o, n) => {
  const c = s.split(o).length - 1
  if (c !== 1) { errs.push('[' + c + '] ' + o.slice(0, 40)); return }
  s = s.replace(o, n)
}

// ===== 新手开荒指南 =====
rep('30×10 以下的封闭房间：木墙背景、桌子、椅子、光源、门。向导会第一个入住。',
    '封闭房间（含边框总面积 30~750 格）：玩家放置的背景墙、桌子、椅子、光源、入口一样不能少。向导开局就已入住，后续 NPC 也都认这个标准。')
rep('黄金镐 + 黄金阔剑 + 弓，备好 200+ 火把与平台，就能准备克苏鲁之眼了。',
    '黄金镐 + 黄金阔剑 + 弓，备足火把并搭好长平台，就能准备克苏鲁之眼了。')
rep('生命水晶前期最多吃到 400 HP 上限。',
    '生命水晶最多把生命上限吃到 200 HP，再往上要等困难模式的生命果。')

// ===== 肉前流程 =====
rep('肉前流程：八个 BOSS 的最佳讨伐顺序', '肉前流程：BOSS 最佳讨伐顺序')
rep('做熔岩套（狱石锭×36）与熔岩镐', '做熔岩套（狱石锭×45）与熔岩镐（再加 20 锭）')
rep('肉山掉的战士/游侠/法师/召唤徽章是毕业饰品线起点。',
    '肉山掉的战士/游侠/法师/召唤徽章是毕业饰品线起点。史莱姆王与独眼巨鹿是可选 Boss：前者掉粘鞍与固化机，后者四选一武器肉前就能用，建议顺手打掉。')

// ===== 肉后流程 =====
rep('铁/铅×6 + 晶状体/骨头/暗影材料合成机械 Boss 召唤物。',
    '铁/铅锭×5 配晶状体（魔眼）/骨头（骷髅王）/腐肉或椎骨（毁灭者），再加光明或暗影之魂合成对应召唤物。')
rep('地下丛林击杀世纪之花球茎召唤。战胜后地牢世纪之花球开启，掉落泰拉刃材料种子弯刀。',
    '地下丛林击杀世纪之花球茎召唤。战胜后掉神庙钥匙可开丛林神庙，地牢刷新新敌怪；日食的蛾怪掉断裂英雄剑——泰拉刃的关键材料。')

if (errs.length) {
  console.log('未全部命中，中止：')
  errs.forEach(e => console.log('  ' + e))
  process.exit(1)
}
fs.writeFileSync('data/strategies.js', s)
console.log('strategies.js 修补完成')

// ===== 职业养成 me4 狙石锭数 =====
let c = fs.readFileSync('data/career.js', 'utf8')
const o = '狱石锭×36 合成熔岩套与熔岩镐'
if (c.includes(o)) {
  c = c.replace(o, '狱石锭×65（熔岩套 45 + 熔岩镐 20）合成熔岩套与熔岩镐')
  fs.writeFileSync('data/career.js', c)
  console.log('career.js me4 炉石锭数已修正')
} else console.log('career.js me4 未匹配')
