// 临时脚本：生成 pkg-cal/data/calamity-items.js（灾厄物品图鉴数据集批次1），用完即删
// 数据来源链：Boss 掉落（11-22 对 Wiki 全量核对）+ 灾厄官方汉化包（Koibumi/CalamityCN）官方简中工具提示
const fs = require('fs')
const cand = JSON.parse(fs.readFileSync(process.env.TEMP + '/cal_items_candidates.json', 'utf8'))

function snake(en) {
  return en.replace(/([^A-Z])([A-Z])/g, '$1_$2').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase()
}
function cleanTip(t) {
  if (!t) return ''
  return t.replace(/\{\$[^}]+\}/g, '').replace(/\{\{[^}]+\}\}/g, '').replace(/\[[^\]]*\]/g, '')
    .split('\n').map(x => x.trim()).filter(Boolean).join('\n')
}
function esc(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') }

// ---------- 1. 武器（Boss 掉落已核对） ----------
const weapons = cand.matched.map(w => ({
  key: w.key, zh: w.zh, en: w.en || '', cat: w.cat, cls: w.cls || null,
  stg: w.stg, boss: w.boss, rate: w.rate, tip: cleanTip(w.tip)
}))

// ---------- 2. 饰品 / 盔甲（Boss 掉落反查，来源与概率手工对齐掉落清单） ----------
const ACC_META = {
  '沙尘披风': { boss: 'cal_desert_scourge', rate: '25%' },
  '海波项链': { boss: 'cal_desert_scourge', rate: '100%（专家）' },
  '污秽手套': { boss: 'cal_hive_mind', rate: '25%' },
  '腐烂之脑': { boss: 'cal_hive_mind', rate: '100%（专家）' },
  '血染手套': { boss: 'cal_perforators', rate: '25%' },
  '血蠕虫之牙': { boss: 'cal_perforators', rate: '100%（专家）' },
  '魔能谐振仪': { boss: 'cal_slime_god', rate: '100%（专家）' },
  '冰川之拥': { boss: 'cal_cryogen', rate: '10%' },
  '极寒之魂': { boss: 'cal_cryogen', rate: '100%（专家）' },
  '腐蚀脊椎': { boss: 'cal_aquatic_scourge', rate: '25%' },
  '海之烧灼': { boss: 'cal_aquatic_scourge', rate: '10%' },
  '海波纹章': { boss: 'cal_aquatic_scourge', rate: '100%（专家）' },
  '玫瑰石': { boss: 'cal_brimstone', rate: '25%' },
  '舐火甲壳': { boss: 'cal_brimstone', rate: '100%（专家）' },
  '再生护符': { boss: 'cal_calamitas_clone', rate: '25%' },
  '混乱石': { boss: 'cal_calamitas_clone', rate: '25%' },
  '灾厄兜帽': { boss: 'cal_calamitas_clone', rate: '10%' },
  '灾厄长袍': { boss: 'cal_calamitas_clone', rate: '10%' },
  '灾劫虚空': { boss: 'cal_calamitas_clone', rate: '100%（专家宝袋）' },
  '魅惑珍珠': { boss: 'cal_leviathan', rate: '25%' },
  '踏星靴': { boss: 'cal_astrum_aureus', rate: '100%（专家）' },
  '星光能量核心': { boss: 'cal_astrum_aureus', rate: '100%（复仇）' },
  '瘟疫呼机': { boss: 'cal_pbg', rate: '10%' },
  '孔雀翎': { boss: 'cal_pbg', rate: '10%' },
  '毒疫之心': { boss: 'cal_pbg', rate: '100%（专家宝袋）' },
  '血契': { boss: 'cal_ravager', rate: '100%（专家）' },
  '血肉图腾': { boss: 'cal_ravager', rate: '33%' },
  '地狱之血': { boss: 'cal_ravager', rate: '100%（复仇）' },
  '星神隐壳': { boss: 'cal_astrum_deus', rate: '100%（专家宝袋）' },
  '痴愚金龙干细胞': { boss: 'cal_dragonfolly', rate: '100%（专家）' },
  '纯元怒焰': { boss: 'cal_providence', rate: '10%' },
  '极乐之翼': { boss: 'cal_providence', rate: '100%' },
  '极乐之庇护': { boss: 'cal_providence', rate: '100%' },
  '弧光指环': { boss: 'cal_storm_weaver', rate: '100%（专家）' },
  '进化者': { boss: 'cal_ceaseless_void', rate: '100%（专家）' },
  '幽灵披风': { boss: 'cal_signus', rate: '100%（专家）' },
  '灾劫之尖啸': { boss: 'cal_polterghast', rate: '100%（专家宝袋）' },
  '突变松露': { boss: 'cal_old_duke', rate: '25%' },
  '星云之核': { boss: 'cal_devourer', rate: '100%（专家）' },
  '涅槃龙翼': { boss: 'cal_yharon', rate: '100%' },
  '金拱门炸鸡块': { boss: 'cal_yharon', rate: '10%' },
  '嘉登之心': { boss: 'cal_exo_mechs', rate: '100%（专家）' },
  '星流之盒': { boss: 'cal_exo_mechs', rate: '100%' },
  '腐烂眼球': { boss: 'cal_hive_mind', rate: '10%' },
  '血管碎块': { boss: 'cal_perforators', rate: '10%' },
  '焦灼残偶': { boss: 'cal_brimstone', rate: '100%（复仇）' },
  '瘟疫呼机': { boss: 'cal_pbg', rate: '10%' },
  '金拱门炸鸡块': { boss: 'cal_yharon', rate: '10%' }
}
const accessories = cand.accMatched.filter(a => ACC_META[a.zh]).map(a => {
  const meta = ACC_META[a.zh]
  const bossStage = { cal_desert_scourge: 'pre', cal_hive_mind: 'pre', cal_perforators: 'pre', cal_slime_god: 'pre', cal_crabulon: 'pre', cal_cryogen: 'hm', cal_aquatic_scourge: 'hm', cal_brimstone: 'hm', cal_calamitas_clone: 'hm', cal_leviathan: 'hm', cal_astrum_aureus: 'hm', cal_pbg: 'hm', cal_ravager: 'hm', cal_astrum_deus: 'hm', cal_dragonfolly: 'ml', cal_providence: 'ml', cal_storm_weaver: 'ml', cal_ceaseless_void: 'ml', cal_signus: 'ml', cal_polterghast: 'ml', cal_old_duke: 'ml', cal_devourer: 'ml', cal_yharon: 'ml', cal_exo_mechs: 'ml' }
  return {
    key: a.key, zh: a.zh, en: a.en || '', cat: a.cat, cls: null,
    stg: bossStage[meta.boss] || null, boss: meta.boss, rate: meta.rate, tip: cleanTip(a.tip)
  }
})

// ---------- 3. 复仇模式永久升级药水（4 条，官方描述来自 Wiki 硬编码说明） ----------
const revengePotions = [
  { key: 'ElectrolyteGelPack', zh: '电磁凝胶包', en: 'Electrolyte Gel Pack', cat: 'potion', stg: 'pre', boss: 'cal_slime_god', rate: '100%（复仇）', tip: '永久增加肾上腺素20%伤害和5%伤害减免\n复仇模式专属\n强化肾上腺素的物品共三个，这是正常流程能获得的第一个，只能使用一次' },
  { key: 'StarlightFuelCell', zh: '星光能量核心', en: 'Starlight Fuel Cell', cat: 'potion', stg: 'hm', boss: 'cal_astrum_aureus', rate: '100%（复仇）', tip: '永久增加肾上腺素20%伤害和5%伤害减免\n复仇模式专属\n强化肾上腺素的物品共三个，这是正常流程能获得的第二个，只能使用一次' },
  { key: 'InfernalBlood', zh: '地狱之血', en: 'Infernal Blood', cat: 'potion', stg: 'hm', boss: 'cal_ravager', rate: '100%（复仇）', tip: '永久增加暴怒模式的持续时间1秒\n复仇模式专属\n提高怒气模式伤害的物品共三个，这是正常流程能获得的第二个，只能使用一次' },
  { key: 'RedLightningContainer', zh: '电刑之容', en: 'Red Lightning Container', cat: 'potion', stg: 'ml', boss: 'cal_dragonfolly', rate: '100%（复仇）', tip: '永久增加暴怒（怒气）模式的持续时间1秒\n复仇模式专属\n从痴愚金龙的宝藏袋中获得，只能使用一次' }
]

// ---------- 4. 药水（汉化包全量） + 召唤物 ----------
const potionEntries = cand.potions.map(p => ({
  key: p.key, zh: p.zh, en: p.en || '', cat: 'potion', cls: null,
  stg: null, boss: null, rate: null, tip: p.tip
}))
const summonEntries = cand.summons.map(s => ({
  key: s.key, zh: s.zh === '{$NPCs.BloodwormNormal.DisplayName}' ? '血蠕虫' : s.zh,
  en: s.zh === '{$NPCs.BloodwormNormal.DisplayName}' ? 'Bloodworm' : (s.en || ''),
  cat: 'summon', cls: null, stg: null, boss: null, rate: null, tip: s.tip
}))

// ---------- 合并去重（key 冲突时跳过后者） ----------
const all = []
const used = new Set()
weapons.concat(accessories, revengePotions, potionEntries, summonEntries).forEach(e => {
  let id = snake(e.key)
  if (used.has(id)) return
  used.add(id)
  all.push({
    id: id, n: e.zh, en: e.en || '', cat: e.cat, cls: e.cls || null,
    stg: e.stg || null, boss: e.boss || null, rate: e.rate || null, tip: e.tip || ''
  })
})

// ---------- 输出数据文件 ----------
const lines = all.map(e => {
  return '    { id:"' + e.id + '", n:"' + esc(e.n) + '", en:"' + esc(e.en) + '", cat:"' + e.cat + '"' +
    (e.cls ? ', cls:"' + e.cls + '"' : '') +
    (e.stg ? ', stg:"' + e.stg + '"' : '') +
    (e.boss ? ', boss:"' + e.boss + '"' : '') +
    (e.rate ? ', rate:"' + esc(e.rate) + '"' : '') +
    ', tip:"' + esc(e.tip) + '" }'
})
const out = '// 灾厄物品图鉴 · 批次1（Boss 掉落武器/饰品/药水/召唤物，' + all.length + ' 条）\n' +
  '// 数据来源：Boss 掉落取自 2026-11-22 对灾厄中文维基的全量核对；名称与效果取自灾厄官方汉化包（github Koibumi/CalamityCN）\n' +
  '// 字段：id/n 中文名/en 英文名/cat 分类(weapon weapon accessory accessory armor armor potion potion summon summon)/cls 职业仅武器/stg 阶段/boss 掉落来源/rate 掉率/tip 官方工具提示\n' +
  '// ver: 2026-11-24\n' +
  'module.exports={\n  ver:"2026-11-24",\n  items:[\n' + lines.join(',\n') + '\n  ]\n}\n'
fs.writeFileSync('pkg-cal/data/calamity-items.js', out)

// 统计
const byCat = {}
all.forEach(e => { byCat[e.cat] = (byCat[e.cat] || 0) + 1 })
const noTip = all.filter(e => !e.tip).length
console.log('数据集已生成:', all.length, '条')
console.log('分类分布:', JSON.stringify(byCat))
console.log('无工具提示条目:', noTip)
console.log('文件大小:', Math.round(fs.statSync('pkg-cal/data/calamity-items.js').size / 1024) + 'KB')
