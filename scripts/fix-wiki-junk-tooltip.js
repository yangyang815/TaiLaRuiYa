// 清理 wiki 图标模板残渣（"12x9px|link=电脑版版本历史|..."）：
// 27 个匣 + 礼物/礼袋 + 混沌传送杖，data-v1/v2/v3 成品 + zhdetail.json 源头同步修
const fs = require('fs')

const OPEN = '电脑版按右键、主机版按对应按键、移动版双击即可打开，随机开出物品'
const FIX = {
  Present: '电脑版按右键、主机版按对应按键、移动版双击打开；放置后按上/下键可切换放置样式',
  GoodieBag: '电脑版按右键、主机版按对应按键、移动版双击即可打开，随机开出万圣节物品',
  RodofDiscord: '将你传送至光标所在位置，并导致混沌状态',
}
// 其余全部视为匣类
const crateF = ['FloatingIslandFishingCrateHard','FrozenCrateHard','JungleFishingCrateHard','CorruptFishingCrate','CrimsonFishingCrate','CorruptFishingCrateHard','HallowedFishingCrateHard','DungeonFishingCrate','FrozenCrate','GoldenCrate','HallowedFishingCrate','LavaCrateHard','CrimsonFishingCrateHard','IronCrate','JungleFishingCrate','OasisCrateHard','IronCrateHard','OasisCrate','LavaCrate','OceanCrate','WoodenCrateHard','OceanCrateHard','FloatingIslandFishingCrate','DungeonFishingCrateHard','GoldenCrateHard','WoodenCrate']
crateF.forEach(f => { FIX[f] = OPEN })

// ① data-v 成品
let n = 0
for (const vol of ['pkg-cat-1', 'pkg-cat-2', 'pkg-cat-3']) {
  const p = vol + '/data/data-v' + vol.slice(-1) + '.js'
  let s = fs.readFileSync(p, 'utf8')
  let changed = false
  for (const [f, t] of Object.entries(FIX)) {
    const re = new RegExp('("f":"' + f + '"(?:(?!\\}\\]).)*?"t":")([^"]*)(")')
    const m = s.match(re)
    if (m && /px\|link|class=|12px|15x11px/.test(m[2])) {
      s = s.replace(re, '$1' + t + '$3')
      changed = true
      n++
    }
  }
  if (changed) fs.writeFileSync(p, s)
}
console.log('成品修正:', n)

// ② zhdetail.json 源头
const zp = 'scripts/catalog-stage/zhdetail.json'
const z = JSON.parse(fs.readFileSync(zp, 'utf8'))
let zn = 0
for (const [f, t] of Object.entries(FIX)) {
  const it = z.items[f]
  if (it && /px\|link|class=|12px|15x11px/.test(it.t || '')) {
    it.t = t
    zn++
  }
}
fs.writeFileSync(zp, JSON.stringify(z))
console.log('zhdetail 修正:', zn)

// 复查
let left = 0
for (const vol of ['pkg-cat-1', 'pkg-cat-2', 'pkg-cat-3']) {
  const arr = JSON.parse(fs.readFileSync(vol + '/data/data-v' + vol.slice(-1) + '.js', 'utf8').replace(/^[\s\S]*?module\.exports\s*=\s*/, '').replace(/;\s*$/, ''))
  arr.forEach(x => { if (/px\|link|class=|15x11px/.test(x.t || '')) { left++; console.log('残留:', vol, x.f) } })
}
console.log('残留:', left)
