// 批量修正 Boss 掉落物品在全量目录中的获得方式（ob）
// 全部经官方 wiki / drops.json 核实
const fs = require('fs')

const FIX = {
  // —— 专家宝藏袋专属：写明是谁的袋子 ——
  RoyalGel: '开启 史莱姆王的宝藏袋 获得（专家）',
  EoCShield: '开启 克苏鲁之眼的宝藏袋 获得（专家）',
  BoneHelm: '开启 独眼巨鹿的宝藏袋 获得（专家）',
  DemonHeart: '开启 血肉墙的宝藏袋 获得（专家）',
  VolatileGelatin: '开启 史莱姆皇后的宝藏袋 获得（专家）',
  MechanicalWheelPiece: '开启 双子魔眼的宝藏袋 获得（专家）',
  MechanicalWagonPiece: '开启 毁灭者的宝藏袋 获得（专家）',
  MechanicalBatteryPiece: '开启 机械骷髅王的宝藏袋 获得（专家）',
  SporeSac: '开启 世纪之花的宝藏袋 获得（专家）',
  ShinyStone: '开启 石巨人的宝藏袋 获得（专家）',
  GravityGlobe: '开启 月亮领主的宝藏袋 获得（专家）',
  SuspiciousLookingTentacle: '开启 月亮领主的宝藏袋 获得（专家）',
  LongRainbowTrailWings: '开启 月亮领主的宝藏袋 获得（专家）',
  // —— 大师直接掉落（不走宝藏袋） ——
  AviatorSunglasses: '击败克苏鲁之眼获得（大师模式）',
  // —— 掉落物兜底文案错误 → 写明来源 ——
  BeeHat: '由 蜂王 掉落（11%，专家 33%）',
  BeeShirt: '由 蜂王 掉落（11%，专家 33%）',
  BeePants: '由 蜂王 掉落（11%，专家 33%）',
  QueenOfBees: '由 蜂王 掉落（6.67%，专家 11%）',
  FlowerWhip: '由 世纪之花 掉落（八选一 12.5%）',
  ElectricEel: '由 猪龙鱼公爵 掉落（七选一 14.29%）',
  MoonLordWhip: '由 月亮领主 掉落（十选二 20%）',
  BloodMoonMonolith: '由 恐惧鹦鹉螺 掉落（10%）',
  FestiveWings: '由 常绿尖叫怪 掉落（0.74~2.22%，随波数）',
  RainbowWings: '由 光之女皇 掉落（6.67%，专家 10%）',
  BetsyWings: '由 双足翼龙 掉落（25%）',
  // —— 来源/用途混淆 ——
  ShadowScale: '由 世界吞噬怪 掉落',
  UnholyArrow: '克苏鲁之眼 100% 掉落；也可合成：木箭 + 椎骨 / 蠕虫毒牙 @ 铁砧',
  Beenade: '由 蜂王 掉落（75%）；也可合成：手榴弹 + 蜂蜡 @ 铁砧',
}

// 按 f 内部名定位卷文件
const volOf = {}
for (const [vol, v] of [['pkg-cat-1', 'v1'], ['pkg-cat-2', 'v2'], ['pkg-cat-3', 'v3']]) {
  const arr = require('../' + vol + '/data/data-' + v + '.js')
  arr.forEach(x => { volOf[x.f] = volOf[x.f] || { dir: vol, v } })
}

let ok = 0, miss = []
for (const [f, ob] of Object.entries(FIX)) {
  const loc = volOf[f]
  if (!loc) { miss.push(f); continue }
  const p = loc.dir + '/data/data-' + loc.v + '.js'
  let s = fs.readFileSync(p, 'utf8')
  const re = new RegExp('("f":"' + f + '"(?:(?!\\}\\]).)*?"ob":")([^"]*)(")', '')
  const m = s.match(re)
  if (!m) { miss.push(f + '@' + vol); continue }
  if (m[2] === ob) { ok++; continue }
  s = s.replace(re, '$1' + ob + '$3')
  fs.writeFileSync(p, s)
  ok++
  console.log('[OK]', f, '→', ob)
}
console.log('完成', ok, '未命中:', miss.length ? miss.join(',') : '无')
