// 概率修正：obtain 中提及的掉落者，其概率对齐官方 Drops 表（经典模式第一档）
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

// 官方表：en → { zh名: 经典概率 }
const official = {}
Object.keys(drops).forEach(item => {
  if (!official[item]) official[item] = {}
  drops[item].forEach(d => {
    const z = zhNpc(d.by) || d.by
    const r = String(d.rate || '').replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2').replace(/<[^>]+>/g, '').trim()
    const first = r.match(/[\d.]+(?:–[\d.]+)?%/)
    if (first && !official[item][z]) official[item][z] = first[0]
  })
})

let text = fs.readFileSync(__dirname + '/../data/items.js', 'utf8')
let rateFixed = 0, skipped = 0
const edits = []
items.forEach(it => {
  if (!it.en || !it.obtain) return
  const off = official[it.en]
  if (!off) return
  let ob = it.obtain
  let changed = false
  Object.keys(off).forEach(z => {
    if (ob.indexOf(z) < 0) return
    const esc = z.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp('(' + esc + '[^\\d%]{0,6})([\\d.]+(?:–[\\d.]+)?%[^））]*)?(?=[^\\d%])')
    // 更精确：匹配 “z 数字%” 模式
    const re2 = new RegExp('(' + esc + '\\s*)([\\d.]+(?:–[\\d.]+)?%)([^\\d])?')
    const m2 = ob.match(re2)
    if (m2 && m2[2] !== off[z]) {
      ob = ob.replace(re2, '$1' + off[z] + '$3')
      changed = true
    }
  })
  if (changed) { edits.push({ id: it.id, ob }); rateFixed++ }
})
console.log('概率修正:', rateFixed, '条')
edits.forEach(e => {
  const start = text.indexOf('id:"' + e.id + '"')
  if (start < 0) return
  const next = text.indexOf('id:"', start + 10)
  const end = next < 0 ? text.length : next
  const slice = text.slice(start, end)
  const re = /obtain:"((?:[^"\\]|\\.)*)"/
  const mm = slice.match(re)
  if (!mm) { skipped++; return }
  const ns = slice.replace(re, 'obtain:' + JSON.stringify(e.ob))
  text = text.slice(0, start) + ns + text.slice(end)
})
if (skipped) console.log('跳过:', skipped)
fs.writeFileSync(__dirname + '/../data/items.js', text)
console.log('已写回')
