// 临时脚本：解析灾厄汉化包 hjson → 匹配 Boss 掉落 → 生成物品候选集（用完即删）
const fs = require('fs')
const path = require('path')
const CALLOC = process.env.TEMP + '/calloc'

// ---------- hjson 解析 ----------
function parseHjson(file) {
  const s = fs.readFileSync(file, 'utf8')
  const out = {}
  const re = /^([A-Za-z0-9_]+): \{([\s\S]*?)^\}/gm
  let m
  while ((m = re.exec(s))) {
    const key = m[1]
    const body = m[2]
    let dn = ''
    const dnM = body.match(/\tDisplayName: (.+)/)
    if (dnM) dn = dnM[1].trim()
    let tip = ''
    const tipM = body.match(/\tTooltip:\n\t\t'''\n([\s\S]*?)\n\t\t'''/)
    if (tipM) tip = tipM[1].split('\n').map(x => x.replace(/^\t\t/, '').trim()).filter(Boolean).join('\n')
    else {
      const t1 = body.match(/\tTooltip: (.+)/)
      if (t1) tip = t1[1].trim().replace(/^"|"$/g, '')
    }
    if (dn) out[key] = { dn: dn, tip: tip }
  }
  return out
}

function cleanTip(t) {
  if (!t) return ''
  return t
    .replace(/\{\$[^}]+\}/g, '')
    .replace(/\{\{[^}]+\}\}/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .split('\n').map(x => x.trim()).filter(Boolean).join('\n')
}

// ---------- 分类文件清单 ----------
const CATS = [
  ['weapon', 'Items.Weapons.Melee', 'melee'],
  ['weapon', 'Items.Weapons.Ranged', 'ranged'],
  ['weapon', 'Items.Weapons.Magic', 'magic'],
  ['weapon', 'Items.Weapons.Summon', 'summon'],
  ['weapon', 'Items.Weapons.Rogue', 'rogue'],
  ['weapon', 'Items.Weapons.Typeless', 'none'],
  ['weapon', 'Items.Weapons.DraedonsArsenal', 'arsenal'],
  ['accessory', 'Items.Accessories', null],
  ['accessory', 'Items.Accessories.Wings', null],
  ['armor', 'Items.Armor.Vanity', null],
  ['armor', 'Items.Armor.PostMoonLord', null],
  ['armor', 'Items.Armor.Hardmode', null],
  ['armor', 'Items.Armor.PreHardmode', null],
  ['material', 'Items.Materials', null],
  ['potion', 'Items.Potions', null],
  ['summon', 'Items.SummonItems', null],
  ['pet', 'Items.Pets', null],
  ['mount', 'Items.Mounts', null],
  ['misc', 'Items.Misc', null],
  ['tool', 'Items.Tools', null]
]

// 全局 zh 索引（同名先到先得，但记录所有来源便于排查）
const zhDB = {}
CATS.forEach(([cat, file, cls]) => {
  const db = parseHjson(path.join(CALLOC, 'zh-Hans.' + file + '.hjson'))
  Object.keys(db).forEach(k => {
    const dn = db[k].dn
    if (!zhDB[dn]) zhDB[dn] = { key: k, tip: db[k].tip, cat: cat, cls: cls, file: file }
  })
})
const enDB = {}
CATS.forEach(([cat, file, cls]) => {
  const db = parseHjson(path.join(CALLOC, 'en-US.' + file + '.hjson'))
  Object.keys(db).forEach(k => { enDB[k] = db[k].dn })
})

// ---------- 武器匹配（来自已核对的 Boss 掉落） ----------
const weapons = JSON.parse(fs.readFileSync(process.env.TEMP + '/cal_weapons.json', 'utf8'))
  .filter(w => w.zh !== '突变松露')
const EXO_CLS = { '光子撕裂者': 'ranged', '星耦狱锁': 'ranged', '阿瑞斯外骨骼': 'summon', '煌晖御流炮': 'magic', '微元劫裂者': 'magic', '擎天军用信标': 'summon', '塔纳托斯的脊柱': 'melee', '衍曜旋刃': 'rogue' }

const matched = [], unmatched = []
const seenKeys = new Set()
weapons.forEach(w => {
  let rec = zhDB[w.zh]
  if (!rec) {
    // 全局兜底：找包含关键字的条目
    if (w.zh.indexOf('锚') >= 0) rec = zhDB[Object.keys(zhDB).find(k => k.indexOf('锚') >= 0 && zhDB[k].cat === 'weapon')] || null
    if (w.zh.indexOf('饲料') >= 0) rec = zhDB[Object.keys(zhDB).find(k => k.indexOf('饲料') >= 0)] || null
  }
  if (!rec) { unmatched.push(w); return }
  if (seenKeys.has(rec.key)) return
  seenKeys.add(rec.key)
  let cls = rec.cls
  if (cls === 'arsenal') cls = EXO_CLS[w.zh] || null
  matched.push({
    key: rec.key, zh: w.zh, en: enDB[rec.key] || '', boss: w.boss, stg: w.stg, rate: w.rate,
    cat: rec.cat === 'weapon' ? 'weapon' : rec.cat, cls: cls, tip: rec.tip
  })
})

// ---------- 饰品匹配（Boss 掉落反查，全局索引兜底） ----------
const DROP_ACC = ['沙尘披风','海波项链','污秽手套','腐烂之脑','腐烂眼球','血染手套','血蠕虫之牙','血管碎块','魔能谐振仪','电磁凝胶包','冰川之拥','极寒之魂','腐蚀脊椎','海之烧灼','海波纹章','玫瑰石','舐火甲壳','焦灼残偶','再生护符','混乱石','灾厄兜帽','灾厄长袍','灾劫虚空','魅惑珍珠','踏星靴','星光能量核心','瘟疫呼机','孔雀翎','毒疫之心','血契','血肉图腾','地狱之血','星神隐壳','极乐之翼','极乐之庇护','普罗维登斯神印','弧光指环','进化者','幽灵披风','灾劫之尖啸','突变松露','星云之核','涅槃龙翼','亚利姆水晶','金拱门炸鸡块','嘉登之心','星流之盒','灾厄饰品']
const accMatched = [], accUnmatched = []
DROP_ACC.forEach(zh => {
  const rec = zhDB[zh]
  if (!rec) { accUnmatched.push(zh); return }
  if (seenKeys.has(rec.key)) return
  seenKeys.add(rec.key)
  accMatched.push({ key: rec.key, zh: zh, en: enDB[rec.key] || '', tip: rec.tip, cat: rec.cat, file: rec.file })
})

// ---------- 材料（全量收录 Materials 文件） ----------
const zhMat = parseHjson(path.join(CALLOC, 'zh-Hans.Items.Materials.hjson'))
const enMat = parseHjson(path.join(CALLOC, 'en-US.Items.Materials.hjson'))
const materials = Object.keys(zhMat)
  .map(k => ({ key: k, zh: zhMat[k].dn, en: enMat[k] ? enMat[k].dn : '', tip: cleanTip(zhMat[k].tip), cat: 'material' }))

// ---------- 药水 / 召唤物（全量收录） ----------
const zhPot = parseHjson(path.join(CALLOC, 'zh-Hans.Items.Potions.hjson'))
const enPot = parseHjson(path.join(CALLOC, 'en-US.Items.Potions.hjson'))
const potions = Object.keys(zhPot)
  .map(k => ({ key: k, zh: zhPot[k].dn, en: enPot[k] ? enPot[k].dn : '', tip: cleanTip(zhPot[k].tip), cat: 'potion' }))
const zhSum = parseHjson(path.join(CALLOC, 'zh-Hans.Items.SummonItems.hjson'))
const enSum = parseHjson(path.join(CALLOC, 'en-US.Items.SummonItems.hjson'))
const summons = Object.keys(zhSum)
  .map(k => ({ key: k, zh: zhSum[k].dn, en: enSum[k] ? enSum[k].dn : '', tip: cleanTip(zhSum[k].tip), cat: 'summon' }))

// ---------- 汇总 ----------
const result = { matched, unmatched, accMatched, accUnmatched, materials, potions, summons }
fs.writeFileSync(process.env.TEMP + '/cal_items_candidates.json', JSON.stringify(result, null, 1))
console.log('武器匹配:', matched.length, '| 未匹配:', unmatched.map(x => x.zh).join('、') || '无')
console.log('饰品匹配:', accMatched.length, '| 未匹配:', accUnmatched.join('、') || '无')
console.log('材料:', materials.length, '| 药水:', potions.length, '| 召唤物:', summons.length)
console.log('材料明细:', materials.map(x => x.zh).join('、'))
