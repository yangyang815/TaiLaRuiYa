// DPS 计算器逻辑层：遵循泰拉瑞亚伤害计算流程
// 1.基础伤害 × 词条(乘算) → 2.×伤害加成(加算区:盔甲/饰品/增益)
// 3.-防御减伤(难度系数) → 4.±15%浮动 → 5.暴击期望(×2)
// DPS = 期望伤害 × 60 / 实际使用时间
const D = require('../../data/dps')

function find (list, id) { return list.find(x => x.id === id) }

/* 计算主入口
   s: {cls, weaponId, prefixId, armorId, accs:[{id,ap}×5], buffs:[id], targetId, mode, customDef} */
function calc (s) {
  const w = find(D.WEAPONS, s.weaponId) || D.WEAPONS[0]
  const cls = s.cls || w.cls
  const px = find(D.WPREFIX, s.prefixId) || D.WPREFIX[0]
  const armor = find(D.ARMORS, s.armorId) || D.ARMORS[0]
  const target = find(D.TARGETS, s.targetId) || D.TARGETS[0]
  const mode = find(D.MODES, s.mode) || D.MODES[0]

  /* ---- 加算区汇总 ---- */
  let dmgPct = 0   // 伤害加成%
  let critPct = 0  // 暴击加成%
  let spdPct = 0   // 攻速加成%
  let pen = 0      // 护甲穿透

  // 盔甲：职业不匹配时加成不生效（如熔岩套近战加成对枪械无效）
  if (armor.cls === 'all' || armor.cls === cls) {
    dmgPct += armor.dmg; critPct += armor.crit; spdPct += armor.spd
  }

  // 饰品：先收集，处理 glove 覆盖（机械手套覆盖力量手套，不叠加）
  const accIds = (s.accs || []).map(a => a.id).filter(Boolean)
  const hasMech = accIds.indexOf('mechanical_glove') >= 0
  const seen = new Set()
  ;(s.accs || []).forEach((slot, i) => {
    const a = find(D.ACCESSORIES, slot.id)
    if (!a || seen.has(a.id)) return
    // 机械手套在场时，力量手套被覆盖
    if (hasMech && a.id === 'power_glove') return
    seen.add(a.id)
    // 职业加成（不匹配则该项为 0，天然不生效）
    dmgPct += (a.dmgAll || 0) + (a.dmgMelee || 0) + (a.dmgRanged || 0) + (a.dmgMagic || 0)
    // 全职业攻速（天界石/手套类）对任意武器生效
    spdPct += a.spdAll || 0
    critPct += a.critAll || 0
    // 饰品重铸词条
    const ap = find(D.APREFIX, slot.ap) || D.APREFIX[0]
    dmgPct += ap.dmg; critPct += ap.crit
  })

  // 增益
  ;(s.buffs || []).forEach(id => {
    const b = find(D.BUFFS, id)
    if (!b) return
    dmgPct += (b.dmgAll || 0) + (b.dmgMagic || 0)
    critPct += b.critAll || 0
    // 磨刀：仅近战享受穿透
    if (b.pen && cls === 'melee') pen += b.pen
  })

  // 职业伤害加成过滤：徽章类只对对应职业生效
  // （上面直接累加了对应职业字段，跨职业字段为 0，无需额外处理）

  /* ---- 武器词条 ---- */
  // 词条需匹配职业（传说仅近战可用）；不匹配按无词条算
  const pxOk = px.cls === 'all' || px.cls === cls ? px : D.WPREFIX[0]

  /* ---- 逐步计算 ---- */
  const step1 = w.dmg * (1 + pxOk.dmg / 100)          // 词条后伤害
  const step2 = step1 * (1 + dmgPct / 100)            // 加成后伤害

  // 防御减伤（自定义目标取 customDef）
  const targetDef = target.id === 'custom' ? (Number(s.customDef) || 0) : target.def
  const effDef = Math.max(0, targetDef - pen)
  const dr = effDef * mode.factor
  const hit = Math.max(1, step2 - dr)                 // 防御后单发伤害（浮动前）

  // 暴击：基础 + 词条 + 加成，封顶 100
  const crit = Math.min(100, w.crit + pxOk.crit + critPct)

  // 暴击期望伤害（暴击 ×2 → 期望 = hit × (1 + crit%)
  const avgHit = hit * (1 + crit / 100)

  // 攻速：使用时间被攻速加成缩短
  const effUse = Math.max(1, w.use / (1 + (pxOk.spd + spdPct) / 100))
  const aps = 60 / effUse                             // 每秒攻击次数

  const dps = avgHit * aps

  /* ---- 伤害分解（供页面展示） ---- */
  const breakdown = [
    { label: '基础伤害', val: w.dmg, suf: '' },
    { label: '武器词条', val: pxOk.dmg, suf: '%' },
    { label: '装备/增益加成', val: Math.round(dmgPct), suf: '%' },
    { label: '防御减免', val: -Math.round(dr), suf: '' },
    { label: '最终单发（浮动前）', val: Math.round(hit), suf: '' }
  ]

  return {
    weapon: w,
    cls,
    dps: Math.round(dps),
    dpsMin: Math.round(dps * 0.85),
    dpsMax: Math.round(dps * 1.15),
    hit: Math.round(hit),
    hitMin: Math.max(1, Math.round(hit * 0.85)),
    hitMax: Math.round(hit * 1.15),
    crit: Math.round(crit),
    aps: Math.round(aps * 100) / 100,
    useTime: Math.round(effUse * 10) / 10,
    rawUse: w.use,
    pen,
    effDef,
    dr: Math.round(dr),
    dmgPct: Math.round(dmgPct),
    spdPct: Math.round(pxOk.spd + spdPct),
    breakdown
  }
}

/* 预设方案应用：返回完整 state（供页面直接 setData） */
function presetState (presetId) {
  const p = find(D.PRESETS, presetId)
  if (!p) return null
  return JSON.parse(JSON.stringify(p.state))
}

/* 默认配装状态 */
function defaultState () {
  return {
    cls: 'melee', weaponId: 'terra_blade', prefixId: 'legendary', armorId: 'molten_armor',
    accs: [
      { id: 'warrior_emblem', ap: 'menacing' }, { id: 'avenger_emblem', ap: 'menacing' },
      { id: '', ap: 'none' }, { id: '', ap: 'none' }, { id: '', ap: 'none' }
    ],
    buffs: ['well_fed'], targetId: 'moon_lord', mode: 'classic', customDef: 0
  }
}

module.exports = { calc, presetState, defaultState }
