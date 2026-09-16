// 狂星之怒使用官方独立图标（此前误用星怒图标）
const fs = require('fs')

// 1. 复制官方精灵图到主包
fs.copyFileSync('pkg-cat-3/assets/StarWrath.png', 'assets/sprites/star_wrath.png')
console.log('图标已复制 assets/sprites/star_wrath.png')

// 2. spritemap 追加键
let sm = fs.readFileSync('data/spritemap.js', 'utf8')
if (!sm.includes('star_wrath:')) {
  sm = sm.replace('};', 'star_wrath:"png"};')
  fs.writeFileSync('data/spritemap.js', sm)
  console.log('spritemap 已追加 star_wrath')
} else console.log('spritemap 已有 star_wrath')

// 3. 像素画：复用 sword 模板，改为狂星之怒的紫色系配色（星怒为金色 sword("#FFF6A0","#FFD700")）
let px = fs.readFileSync('utils/pixelart.js', 'utf8')
if (!px.includes('reg("star_wrath"')) {
  const reg = 'reg("star_wrath",sword("#F0C8FF","#8A5CC8"));'
  px = px.replace('module.exports=', reg + 'module.exports=')
  fs.writeFileSync('utils/pixelart.js', px)
  console.log('像素画已追加 star_wrath（sword 模板·紫色系）')
} else console.log('像素画已有 star_wrath')

// 4. items.js 狂星之怒改 art
let it = fs.readFileSync('data/items.js', 'utf8')
const o = 'id:"star_wrath",name:"狂星之怒",en:"Star Wrath",cat:"weapon",sub:"melee",rarity:10,art:"starfury"'
const n = 'id:"star_wrath",name:"狂星之怒",en:"Star Wrath",cat:"weapon",sub:"melee",rarity:10,art:"star_wrath"'
if (it.includes(o)) {
  it = it.replace(o, n)
  fs.writeFileSync('data/items.js', it)
  console.log('items.js 狂星之怒 art 已改为 star_wrath')
} else console.log('items.js 未匹配!')
