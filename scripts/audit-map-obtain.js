// 审计：精品图鉴“非合成（地图获取）”物品来源 vs 官方 Drops 表（译名比对版）
const fs = require('fs')
const path = require('path')
const items = require('../data/items.js')
const drops = require('./catalog-stage/drops.json')
let GT = {}
try { GT = JSON.parse(fs.readFileSync(path.join(__dirname, 'catalog-stage/gametext-zh.json'), 'utf8')).NPCName || {} } catch (e) {}
const npcZh = {}
try { require('../data/monsters.js').forEach(m => { if (m.en && m.name) npcZh[m.en] = m.name }) } catch (e) {}
try { require('../data/bosses.js').forEach(m => { if (m.en && m.name) npcZh[m.en] = m.name }) } catch (e) {}
try { require('../data/npcs.js').forEach(m => { if (m.en && m.name) npcZh[m.en] = m.name }) } catch (e) {}
const CHEST = { 'Gold Chest': '金箱', 'Golden Lock Box': '金锁箱', 'Shadow Chest': '暗影箱', 'Obsidian Lock Box': '黑曜石匣', 'Frozen Chest': '冰雪箱', 'Ivy Chest': '常春藤箱', 'Jungle Crate': '丛林匣', 'Wooden Crate': '木匣', 'Iron Crate': '铁匣', 'Golden Crate': '黄金匣', 'Pearlwood Crate': '珍珠木匣', 'Bramble Crate': '荆棘匣', 'Hematic Crate': '血腥匣', 'Defiled Crate': '腐化匣', 'Corrupt Crate': '腐化匣', 'Sky Mill': '天空磨坊', 'Skeleton Archer': '骷髅弓箭手', 'Shadow Orb': '暗影珠', 'Crimson Heart': '猩红之心', 'Chests': '各类宝箱', 'Goodie Bag': '礼物袋', 'Celestial Pillars': '天界塔', 'Mimics': '宝箱怪', 'Mummies': '木乃伊', 'Ghouls': '食尸鬼', 'Slimes': '各类史莱姆', 'Sand Sharks': '沙鲨', 'Water Bolt Mimic': '水矢宝箱怪', 'Martian Saucer': '火星飞碟', 'Flying Dutchman': '荷兰飞盗船', 'Pirate Captain': '海盗船长' }
const zhNpc = en => npcZh[en] || GT[en.replace(/[^A-Za-z0-9]/g, '')] || CHEST[en] || null
const clean = s => String(s || '').replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
const isCraftOb = ob => /合成|砧|祭坛|熔炉/.test(ob || '')

// 官方：item → [掉落者zh(含概率)]
const byItem = {}
Object.keys(drops).forEach(item => {
  const m = {}
  drops[item].forEach(d => {
    if (!m[d.by]) m[d.by] = []
    const r = clean(d.rate).match(/[\d.]+(?:–[\d.]+)?%/)
    if (r && m[d.by].indexOf(r[0]) < 0) m[d.by].push(r[0])
  })
  byItem[item] = Object.entries(m).map(([by, rates]) => {
    const z = zhNpc(by) || by
    return z + (rates.length ? ' ' + rates.join('/') : '')
  })
})

let checked = 0
const flags = []
items.forEach(it => {
  if (!it.en) return
  const ob = it.obtain || ''
  if (!ob) { flags.push('[无obtain] ' + it.name + '(' + it.en + ')'); return }
  if (isCraftOb(ob)) return
  const official = byItem[it.en]
  if (!official) return
  checked++
  const obL = ob.toLowerCase()
  const missing = official.filter(entry => {
    const name = entry.split(/ \d/)[0].toLowerCase() // 掉落者名（去掉概率部分）
    if (obL.indexOf(name) < 0) {
      // 箱/匣/钓鱼类泛称兜底
      if (/箱|匣|宝箱/.test(ob) && /chest|crate|lock box/i.test(name)) return false
      if (/钓鱼|钓获/.test(ob) && /crate|fishing/i.test(name)) return false
      return true
    }
    return false
  })
  if (missing.length) {
    flags.push('[来源不全] ' + it.name + '(' + it.en + ')\n    写: ' + ob.slice(0, 80) + '\n    官方: ' + official.join('；').slice(0, 110))
  }
})
console.log('非合成可核对条目:', checked)
console.log('真实残留:', flags.length)
flags.forEach(f => console.log(f))
fs.writeFileSync(__dirname + '/audit-map-obtain.json', JSON.stringify(flags, null, 1))
