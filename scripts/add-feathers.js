// 新增精品材料：羽毛/骨之羽/冰雪羽/火羽/巨型鸟妖之羽（翼类合成材料）
// 修复：获取方式页翼类配方材料图标缺失/点击无反应（原依赖 R.EXTRA 兜底无图标不可跳转）
const fs = require('fs')

const ITEMS = [
  ['feather', '羽毛', 'Feather', 0, '鸟妖身上飘落的白色羽毛。', '鸟妖 50% 掉落', '可作材料合成：天使之翼、恶魔之翼。'],
  ['bone_feather', '骨之羽', 'Bone Feather', 5, '装甲骷髅遗落的白骨之羽。', '地牢装甲骷髅（蓝/地狱/生锈）各 0.33% 掉落', '可作材料合成：骨之翼。'],
  ['ice_feather', '冰雪羽', 'Ice Feather', 5, '冰雪巨人凝成的冰晶羽毛。', '冰雪巨人 33.3% 掉落', '可作材料合成：冰冻之翼。'],
  ['fire_feather', '火羽', 'Fire Feather', 5, '红魔鬼尾端燃烧的烈焰之羽。', '红魔鬼 2% 掉落', '可作材料合成：烈焰之翼。'],
  ['giant_harpy_feather', '巨型鸟妖之羽', 'Giant Harpy Feather', 5, '鸟妖族巨大的翎羽。', '鸟妖 0.67% 掉落', '可作材料合成：鸟人之翼。'],
]

// 1) items.js 追加
const ip = 'data/items.js'
let s = fs.readFileSync(ip, 'utf8')
if (s.includes('id:"bone_feather"')) {
  console.log('items.js 已含羽毛类，跳过')
} else {
  const entries = ITEMS.map(([id, name, en, r, desc, ob, use]) =>
    `{id:"${id}",name:"${name}",en:"${en}",cat:"material",rarity:${r},art:"${id}",desc:"${desc}",obtain:"${ob}",use:"${use}"}`).join(',')
  s = s.replace(/\];\s*$/, ',' + entries + '];')
  fs.writeFileSync(ip, s)
  console.log('items.js +5')
}

// 2) spritemap 追加
const sp = 'data/spritemap.js'
let sm = fs.readFileSync(sp, 'utf8')
if (!sm.includes('bone_feather')) {
  const add = ITEMS.map(([id]) => `${id}:"png"`).join(',')
  const i = sm.lastIndexOf('};')
  sm = sm.slice(0, i) + ',' + add + '};'
  fs.writeFileSync(sp, sm)
  console.log('spritemap +5')
} else console.log('spritemap 已有')

// 3) 官方精灵图复制
for (const [id, , en] of ITEMS) {
  const src = 'pkg-cat-3/assets/' + en.replace(/ /g, '') + '.png'
  const dst = 'assets/sprites/' + id + '.png'
  if (fs.existsSync(src) && !fs.existsSync(dst)) fs.copyFileSync(src, dst)
}
console.log('精灵图就绪')

// 4) pixelart 追加羽毛像素画
const pp = 'utils/pixelart.js'
let px = fs.readFileSync(pp, 'utf8')
if (!px.includes('reg("bone_feather"')) {
  const rows = JSON.stringify([
    '............',
    '.........ff.',
    '........fff.',
    '.......ffff.',
    '......ffff..',
    '.....ffff...',
    '....ffff....',
    '...ffff.....',
    '..ffff......',
    '.lff........',
    'll..........',
    'l...........',
  ]).replace(/"/g, '\\"')
  const pals = {
    feather: ['#F2F2F2', '#9A9A9A'],
    bone_feather: ['#EDE7D4', '#A89F88'],
    ice_feather: ['#C8E8FF', '#5FA8DC'],
    fire_feather: ['#FF8A3C', '#C93A1A'],
    giant_harpy_feather: ['#C9A87C', '#7A5C3A'],
  }
  const regs = ITEMS.map(([id]) => `reg("${id}",A(12,12,{f:"${pals[id][0]}",l:"${pals[id][1]}"},[${rows.slice(1, -1).replace(/\\"/g, '"')}]))`).join(';')
  const anchor = 'module.exports='
  const i = px.lastIndexOf(anchor)
  px = px.slice(0, i) + regs + ';' + px.slice(i)
  fs.writeFileSync(pp, px)
  console.log('pixelart +5')
} else console.log('pixelart 已有')

// 5) acquisition.js 加掉落条目（让获取方式页可点击进入）
const ap = 'data/acquisition.js'
let a = fs.readFileSync(ap, 'utf8')
if (!a.includes('bone_feather:[')) {
  const DROPS = {
    feather: { from: '鸟妖', rate: '50%' },
    bone_feather: { from: '地牢装甲骷髅（蓝/地狱/生锈）', rate: '0.33%' },
    ice_feather: { from: '冰雪巨人', rate: '33.3%' },
    fire_feather: { from: '红魔鬼', rate: '2%' },
    giant_harpy_feather: { from: '鸟妖', rate: '0.67%' },
  }
  const entries = ITEMS.map(([id]) => {
    const d = DROPS[id]
    return `${id}:[{t:"drop",from:"${d.from}",rate:"${d.rate}"}]`
  }).join(',')
  a = a.replace('const DATA={', 'const DATA={' + entries + ',')
  fs.writeFileSync(ap, a)
  console.log('acquisition +5')
} else console.log('acquisition 已有')
