// 敌怪掉落修正：按条目重建 drops 数组（官方 Drops 表 1.4.5 已核实）
const fs = require('fs')
const mon = require('../data/monsters.js')
let text = fs.readFileSync(__dirname + '/../data/monsters.js', 'utf8')

// id → 修改动作
const RATE_FIX = {
  m_demon_eye: { 'black_lens': '1%' },
  m_hornet: { 'stinger': '66.67%' },
  m_man_eater: { 'vine': '50%' },
  m_angry_bones: { 'bone': '97.09%' },
  m_dark_caster: { 'bone': '97.09%' },
  m_cursed_skull: { 'bone': '97.09%' },
  m_shark: { 'shark_fin': '95%' },
  m_ice_tortoise: { 'frozen_turtle_shell': '2%' },
  m_ichor_sticker: { 'ichor': '100%' },
  m_world_feeder: { 'cursed_flame_item': '100%' },
  m_vampire: { 'broken_bat_wing': '2.5%' }
}
const REMOVE = {
  m_man_eater: ['stinger'],
  m_eater_souls: ['adhesive_bandage'],
  m_armored_bones: ['ectoplasm'],
  m_necromancer: ['ectoplasm', 'inferno_fork'],
  m_ragged_caster: ['ectoplasm'],
  m_tactical_skeleton: ['ectoplasm'],
  m_red_devil: ['demon_scythe'],
  m_vampire: ['moon_charm'],
  m_gastropod: ['magnet_sphere'],
  m_drippler: ['lens', 'blood_rain_bow'],
  m_blood_zombie: ['shackle'],
  // 1.4 起碎片只有四柱本体掉落
  m_corite: ['solar_fragment'], m_drakomire: ['solar_fragment'], m_selenian: ['solar_fragment'],
  m_drakomire_rider: ['solar_fragment'], m_drakanian: ['solar_fragment'],
  m_vortexian: ['vortex_fragment'], m_storm_diver: ['vortex_fragment'], m_alien_hornet: ['vortex_fragment'],
  m_predictor: ['nebula_fragment'], m_brain_suckler: ['nebula_fragment'], m_evolution_beast: ['nebula_fragment'],
  m_nebula_floaty: ['nebula_fragment'], m_star_cell: ['stardust_fragment'], m_twinkle_popper: ['stardust_fragment'],
  m_flow_invader: ['stardust_fragment'], m_stargazer: ['stardust_fragment']
}
// 新增
const ADD = {
  m_red_devil: [{ id: 'unholy_trident', name: '邪恶三叉戟', rate: '3.33%' }]
}

let applied = 0
Object.keys(RATE_FIX).concat(Object.keys(REMOVE)).forEach(id => { /* 收集去重 */ })
const ids = Array.from(new Set(Object.keys(RATE_FIX).concat(Object.keys(REMOVE), Object.keys(ADD))))
ids.forEach(id => {
  const m = mon.find(x => x.id === id)
  if (!m) { console.log('[无此条目]', id); return }
  const start = text.indexOf('id:"' + id + '"')
  if (start < 0) { console.log('[文本未找到]', id); return }
  const winEnd = text.indexOf('spawn:', start)
  const oldWin = text.slice(start, winEnd)
  const dropsRe = /drops:\[[^\]]*\]/
  const mm = oldWin.match(dropsRe)
  if (!mm) { console.log('[未定位drops]', id); return }
  let list = (m.drops || []).filter(d => !(REMOVE[id] || []).includes(d.id)).map(d => {
    let rate = d.rate
    if (RATE_FIX[id] && RATE_FIX[id][d.id]) rate = RATE_FIX[id][d.id]
    return { id: d.id, name: d.name, rate: rate }
  })
  ;(ADD[id] || []).forEach(a => { if (!list.some(x => x.id === a.id)) list.push(a) })
  const ser = 'drops:[' + list.map(d => '{id:"' + d.id + '",name:"' + d.name + '",rate:"' + d.rate + '"}').join(',') + ']'
  const newWin = oldWin.replace(dropsRe, ser)
  text = text.replace(oldWin, newWin)
  applied++
})
fs.writeFileSync(__dirname + '/../data/monsters.js', text)
console.log('修正条目:', applied, '/', ids.length)
