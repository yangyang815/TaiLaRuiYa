// 最终名称规范化：GT 官方名优先恢复（修复被泛化重定向覆盖的名称）+ 盔甲套官方材质名
const fs = require('fs')
const path = require('path')
const catGroups = require('../utils/cat-groups')

const idxPath = path.join(__dirname, '../pkg-recipe/data/recipe-index.js')
const idx = require('../pkg-recipe/data/recipe-index.js')
const cjk = s => /[\u4e00-\u9fa5]/.test(s || '')
let GT = {}
try { GT = JSON.parse(fs.readFileSync(path.join(__dirname, 'catalog-stage/gametext-zh.json'), 'utf8')).ItemName || {} } catch (e) {}
const guessInternal = en => en.replace(/[^A-Za-z0-9]/g, '')
const CAT_LABEL = { weapon: '武器', tool: '工具', armor: '盔甲', accessory: '饰品', potion: '药水', material: '材料', mount: '坐骑', pet: '宠物', other: '其他' }
const lab = cat => CAT_LABEL[cat] || (catGroups.GROUPS.find(g => g.k === cat) || {}).n || cat || '其他'

// 盔甲套官方译名（游戏内材质名 + 盔甲）
const ARMOR = { Cactus: '仙人掌', Copper: '铜', Iron: '铁', Silver: '银', Gold: '金', Platinum: '铂金', Meteor: '陨石', Jungle: '丛林', Bee: '蜜蜂', Obsidian: '黑曜石', Cobalt: '钴', Palladium: '钯金', Orichalcum: '山铜', Adamantite: '精金', Titanium: '钛金', Shroomite: '蘑菇矿', Spectre: '幽灵' }

let gtFix = 0, armorFix = 0
idx.forEach(r => {
  if (r.src !== 'w') return
  const iv = guessInternal(r.en)
  // 1) GT 官方名恢复（覆盖被重定向泛化的名称）
  if (GT[iv] && cjk(GT[iv]) && r.n !== GT[iv]) { r.n = GT[iv]; gtFix++ }
  // 2) 盔甲套：材质+盔甲
  const m = (r.en || '').match(/^(\w+) Armor$/)
  if (m && ARMOR[m[1]] && !cjk(r.n)) { r.n = ARMOR[m[1]] + '盔甲'; armorFix++ }
  r.cl = lab(r.cat)
})
fs.writeFileSync(idxPath, '// 自动生成：合成页全量配方索引（勿手改）——内置+wiki全部可合成结果，名称/图标已按当前目录解析\nmodule.exports=' + JSON.stringify(idx) + ';')

// 复核
const cjkAll = idx.filter(r => r.src === 'w' && !cjk(r.n))
const dups = {}
idx.forEach(r => { dups[r.n] = (dups[r.n] || 0) + 1 })
const dupList = Object.entries(dups).filter(e => e[1] > 1)
console.log('GT 恢复:', gtFix, '| 盔甲套修正:', armorFix)
console.log('英文残留:', cjkAll.length, '→', cjkAll.map(r => r.en).join(', '))
console.log('重名:', dupList.length, dupList.slice(0, 6).map(e => e[0] + 'x' + e[1]).join(', '))
console.log('无图标(含内置像素图行):', idx.filter(r => !r.spr && !r.art).length)
