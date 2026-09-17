// 补齐精品图鉴缺失的 9 瓶药水（对照官方 1.4.5 数据，2026-09-17）
const fs = require('fs')

// [internal, id, 名称, en, rarity, 药水色1, 药水色2, stats, obtain, desc]
const POTIONS = [
  ['FeatherfallPotion', 'featherfall_potion', '羽落药水', 'Featherfall Potion', 1, '#8AC8FF', '#D8EFFF',
   [['时长', '10 分钟']], '摆放的瓶子：瓶装水 + 太阳花 + 闪耀根 + 羽毛 合成',
   '减缓坠落速度并免疫摔落伤害——跑酷、打飞行 Boss 的保命神器。'],
  ['ThornsPotion', 'thorns_potion', '荆棘药水', 'Thorns Potion', 1, '#4E8A4E', '#8FD08F',
   [['时长', '2 分钟']], '摆放的瓶子：瓶装水 + 死亡草 + 仙人掌 合成',
   '荆棘反伤：近战攻击你的敌人也会跟着掉血。'],
  ['MiningPotion', 'mining_potion', '挖矿药水', 'Mining Potion', 1, '#C88A3C', '#E8B070',
   [['效果', '挖矿速度 +25%']], '摆放的瓶子：瓶装水 + 蚁狮上颚 + 闪耀根 合成',
   '挖掘速度提升 25%，开荒挖矿期必备。'],
  ['StinkPotion', 'stink_potion', '臭味药水', 'Stink Potion', 1, '#7A8F3B', '#B8C86A',
   [['类型', '可投掷']], '摆放的瓶子：瓶装水 + 臭味鱼 + 死亡草 合成',
   '投掷后让被命中者臭气熏天——整蛊专用，效果谁闻谁知道。'],
  ['LuckPotionLesser', 'lesser_luck_potion', '弱效幸运药水', 'Lesser Luck Potion', 1, '#C8D8E8', '#EEF4FA',
   [['时长', '3 分钟']], '摆放的瓶子：瓶装水 + 水叶草 + 瓢虫 + 白珍珠 合成',
   '小幅提升运气值（影响掉率与稀有事件触发）。'],
  ['LuckPotionGreater', 'greater_luck_potion', '强效幸运药水', 'Greater Luck Potion', 1, '#F0C8D8', '#FBE4EE',
   [['时长', '10 分钟']], '摆放的瓶子：瓶装水 + 水叶草 + 瓢虫 + 粉珍珠 合成',
   '大幅提升运气值，刷稀有掉落前先来一瓶。'],
  ['LesserRestorationPotion', 'lesser_restoration_potion', '弱效恢复药水', 'Lesser Restoration Potion', 1, '#E86060', '#60A0E8',
   [['恢复', '50 生命 + 50 魔力']], '摆放的瓶子：弱效治疗药水 + 弱效魔力药水 合成；地狱暗影箱开出',
   '同时回复生命与魔力的复合药水，法师续航好帮手。'],
  ['PotionOfReturn', 'potion_of_return', '返回药水', 'Potion of Return', 3, '#E88830', '#FFC070',
   [['效果', '传送回家 + 返回传送门']], '摆放的瓶子：回忆药水 + 黑曜石鱼 合成',
   '立即传送回家，并在原地留下一个一分钟后可使用的返回传送门——长途探索的后悔药。'],
  ['RedPotion', 'red_potion', '红药水', 'Red Potion', 3, '#D02020', '#FF6060',
   [['恢复', '150 生命']], '宝箱怪掉落（醉酒世界专属）',
   '“仅献给配得上的人”——喝下回复 150 生命，醉酒世界的彩蛋药水。'],
]

// ---------- 校验 id/名称不冲突 ----------
const itemsSrc = fs.readFileSync('data/items.js', 'utf8')
const existIds = new Set([...itemsSrc.matchAll(/id:"([^"]+)"/g)].map(m => m[1]))
for (const p of POTIONS) {
  if (existIds.has(p[1])) { console.log('id 冲突:', p[1]); process.exit(1) }
}
const ids = POTIONS.map(p => p[1])
if (new Set(ids).size !== ids.length) { console.log('表内 id 重复'); process.exit(1) }

// ---------- 1. 复制图标 ----------
POTIONS.forEach(([f, id]) => {
  const src = ['pkg-cat-1', 'pkg-cat-2', 'pkg-cat-3'].map(v => `pkg-cat-${v.slice(-1)}/assets/${f}.png`).find(p => fs.existsSync(p))
  if (src) fs.copyFileSync(src, 'assets/sprites/' + id + '.png')
  else { console.log('缺图标:', f); process.exit(1) }
})
console.log('图标复制完成:', POTIONS.length)

// ---------- 2. spritemap 追加（精确尾串定位） ----------
let sm = fs.readFileSync('data/spritemap.js', 'utf8')
if (!sm.includes('featherfall_potion:')) {
  const tail = 'amethyst_staff:"png"};'
  if (!sm.includes(tail)) { console.log('spritemap 尾部异常，中止'); process.exit(1) }
  sm = sm.replace(tail, 'amethyst_staff:"png",' + POTIONS.map(p => `${p[1]}:"png"`).join(',') + '};')
  fs.writeFileSync('data/spritemap.js', sm)
  console.log('spritemap 已追加', POTIONS.length, '键')
} else console.log('spritemap 已有，跳过')

// ---------- 3. 像素画（复用 potion 模板换色） ----------
let px = fs.readFileSync('utils/pixelart.js', 'utf8')
if (!px.includes('reg("featherfall_potion"')) {
  const regs = POTIONS.map(([f, id, , , , c1, c2]) => `reg(${JSON.stringify(id)},potion(${JSON.stringify(c1)},${JSON.stringify(c2)}));`).join('')
  px = px.replace('module.exports=', regs + 'module.exports=')
  fs.writeFileSync('utils/pixelart.js', px)
  console.log('像素画已追加', POTIONS.length, '个')
} else console.log('像素画已有，跳过')

// ---------- 4. items.js 追加条目 ----------
if (!itemsSrc.includes('id:"featherfall_potion"')) {
  const entries = POTIONS.map(([f, id, n, en, r, , , stats, ob, desc]) =>
    `{id:${JSON.stringify(id)},name:${JSON.stringify(n)},en:${JSON.stringify(en)},cat:"potion",rarity:${r},art:${JSON.stringify(id)},stats:${JSON.stringify(stats)},obtain:${JSON.stringify(ob)},desc:${JSON.stringify(desc)}}`)
  const i = itemsSrc.lastIndexOf('];')
  let body = itemsSrc.slice(0, i)
  if (body.endsWith('}')) body = body.slice(0, -1) + '},'
  fs.writeFileSync('data/items.js', body + entries.join(',') + '];')
  console.log('items.js 已追加', entries.length, '条药水')
} else console.log('items.js 已有，跳过')

// ---------- 5. 药水入门指南补一节机动/保命药水 ----------
let g = fs.readFileSync('pkgB-guide/data/guide.js', 'utf8')
if (!g.includes('羽落')) {
  const o = '},{t:"药水存放建议"'
  const add = '},{t:"机动与保命药水",d:"羽落（10 分钟免摔伤）、黑曜石皮（岩浆免疫）、水上漂、鱼鳃（水下呼吸）、重力（翻转重力）是探索五大神器；多段跳/翅膀搭配羽落，摔伤几乎绝迹。"},{t:"药水存放建议"'
  if (g.includes(o)) { g = g.replace(o, add); fs.writeFileSync('pkgB-guide/data/guide.js', g); console.log('药水入门指南已补机动保命药水一节') }
  else { console.log('指南锚点未命中'); process.exit(1) }
} else console.log('指南已更新，跳过')
