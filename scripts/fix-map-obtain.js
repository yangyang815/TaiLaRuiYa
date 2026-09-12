// 地图获取类物品来源修复：真错误手修 + 官方掉落者补全（自动，NPC名走官方译名库）
const fs = require('fs')
const path = require('path')
const items = require('../data/items.js')
const drops = require('./catalog-stage/drops.json')
const dex = require('../utils/dex')

const clean = s => String(s || '').replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()

// 掉落者中文名：dex（怪/Boss/NPC）+ GameText NPCName
let GT = {}
try { GT = JSON.parse(fs.readFileSync(path.join(__dirname, 'catalog-stage/gametext-zh.json'), 'utf8')).NPCName || {} } catch (e) {}
const npcZh = {}
try { require('../data/monsters.js').forEach(m => { if (m.en && m.name) npcZh[m.en] = m.name }) } catch (e) {}
try { require('../data/bosses.js').forEach(m => { if (m.en && m.name) npcZh[m.en] = m.name }) } catch (e) {}
try { require('../data/npcs.js').forEach(m => { if (m.en && m.name) npcZh[m.en] = m.name }) } catch (e) {}
const CHEST = { 'Gold Chest': '金箱', 'Golden Lock Box': '金锁箱', 'Shadow Chest': '暗影箱', 'Obsidian Lock Box': '黑曜石匣', 'Frozen Chest': '冰雪箱', 'Ivy Chest': '常春藤箱', 'Jungle Crate': '丛林匣', 'Wooden Crate': '木匣', 'Iron Crate': '铁匣', 'Golden Crate': '黄金匣', 'Pearlwood Crate': '珍珠木匣', 'Bramble Crate': '荆棘匣', 'Hematic Crate': '血腥匣', 'Defiled Crate': '腐化匣', 'Corrupt Crate': '腐化匣', 'Sky Mill': '天空磨坊', 'Skeleton Archer': '骷髅弓箭手', 'Shadow Orb': '暗影珠', 'Crimson Heart': '猩红之心', 'Chests': '各类宝箱', 'Goodie Bag': '礼物袋', 'Celestial Pillars': '天界塔', 'Mimics': '宝箱怪', 'Mummies': '木乃伊', 'Ghouls': '食尸鬼', 'Slimes': '各类史莱姆', 'Sand Sharks': '沙鲨', 'Zombie': '僵尸', 'Water Bolt Mimic': '水矢宝箱怪', 'Martian Saucer': '火星飞碟', 'Flying Dutchman': '荷兰飞盗船', 'Pirate Captain': '海盗船长' }
function zhNpc (en) {
  if (npcZh[en]) return npcZh[en]
  const iv = en.replace(/[^A-Za-z0-9]/g, '')
  if (GT[iv]) return GT[iv]
  if (CHEST[en]) return CHEST[en]
  return null
}

// 官方掉落者整理（去重、经典模式概率）
function officials (en) {
  const list = drops[en]
  if (!list) return null
  const m = []
  list.forEach(d => {
    const rate = clean(d.rate).match(/[\d.]+(?:–[\d.]+)?%/)
    const rr = rate ? rate[0] : ''
    if (!m[d.by]) m[d.by] = { by: d.by, rates: [] }
    if (rr && m[d.by].rates.indexOf(rr) < 0) m[d.by].rates.push(rr)
  })
  return m
}

// 真错误：显式修正表（en → 新 obtain 全文）
const OVERRIDE = {
  daedalus_stormbow: '神圣宝箱怪 20% 掉落（击败任一机械 Boss 后出现）',
  kraken: '猪龙鱼公爵 14.29% 掉落',
  grenade_launcher: '世纪之花 12.5% 掉落',
  rocket_launcher: '骷髅特警 5.56% 掉落，或 机器侠出售（世纪之花后）',
  bone_sword: '地牢骷髅 0.5% 掉落',
  keybrand: '世纪之花后地牢：蓝甲/地狱甲/锈甲骷髅 0.5% 掉落',
  death_sickle: '日食死神 2.5% 掉落',
  tactical_shotgun: '骷髅特警 8.33% 掉落（世纪之花后地牢）',
  uzi: '愤怒捕手 1% 掉落（丛林）',
  bone_pickaxe: '地下矿工 5% 掉落（洞穴层）',
  moon_charm: '满月夜狼人 1.67% 掉落',
  laser_drill: '火星暴乱事件敌怪 0.13% 掉落'
}

let text = fs.readFileSync(__dirname + '/../data/items.js', 'utf8')
let fixedOverride = 0, appended = 0, filled = 0
const edits = []

items.forEach(it => {
  if (!it.en) return
  const officialMap = officials(it.en)
  const offDroppers = officialMap ? Object.keys(officialMap) : []
  const offSummary = offDroppers.map(d => {
    const z = zhNpc(d) || d
    const rs = officialMap[d].rates.slice(0, 1)
    return z + (rs.length ? ' ' + rs[0] : '')
  })
  let newOb = null
  // 1) 显式修正
  if (OVERRIDE[it.id]) { newOb = OVERRIDE[it.id] }
  else {
    const ob = it.obtain || ''
    const isCraft = /合成|砧|祭坛|熔炉/.test(ob)
    if (officialMap) {
      // 缺失的官方掉落者（ob 未提及、且不是纯箱子泛述）
      const obL = ob.toLowerCase()
      const missing = offDroppers.filter(d => {
        const z = zhNpc(d) || d
        const dl = d.toLowerCase()
        if (/chest|crate|mimic/i.test(dl) && /箱|匣|宝箱怪/.test(ob)) return false
        return obL.indexOf(d.toLowerCase()) < 0 && obL.indexOf(z.toLowerCase()) < 0 && obL.indexOf('宝箱') < 0 && obL.indexOf('敌怪掉落') < 0 && obL.indexOf('掉落') < 0
      })
      // 仅当“完全没提掉落来源”时补全（避免破坏手写语境）
      if (!isCraft && !/掉落|开启|宝箱|钓鱼|购买|出售|互动|挖掘|生成/.test(ob) && offDroppers.length) {
        const shown = offSummary.slice(0, 4)
        newOb = (ob ? ob + '；' : '') + '由 ' + shown.join('、') + (offDroppers.length > 4 ? ' 等 ' + offDroppers.length + ' 处来源' : '') + ' 掉落'
      } else if (missing.length && offDroppers.length <= 4) {
        const shown = missing.map(d => {
          const z = zhNpc(d) || d
          const rs = officialMap[d].rates.slice(0, 1)
          return (z === d ? z : z) + (rs.length ? ' ' + rs[0] : '')
        }).slice(0, 3)
        newOb = ob + '；另有 ' + shown.join('、')
      }
    }
  }
  if (newOb && newOb !== it.obtain) {
    edits.push({ id: it.id, newOb })
  }
})
console.log('计划修改:', edits.length, '条')
// 2) 应用（按条目切片，obtain:"..." 值替换）
edits.forEach(e => {
  const it = items.find(x => x.id === e.id)
  const start = text.indexOf('id:"' + e.id + '"')
  if (start < 0) { console.log('[未找到]', e.id); return }
  const next = text.indexOf('id:"', start + 10)
  const end = next < 0 ? text.length : next
  const slice = text.slice(start, end)
  const re = /obtain:"((?:[^"\\]|\\.)*)"/
  const mm = slice.match(re)
  if (!mm) { console.log('[无obtain]', e.id); return }
  const ns = slice.replace(re, 'obtain:' + JSON.stringify(e.newOb))
  text = text.slice(0, start) + ns + text.slice(end)
  if (mm[1] !== JSON.stringify(e.newOb).slice(1, -1)) fixedOverride += e.newOb === (OVERRIDE[e.id] || '') ? 0 : 1
  appended++
})
fs.writeFileSync(__dirname + '/../data/items.js', text)
console.log('应用修改:', appended, '条')
