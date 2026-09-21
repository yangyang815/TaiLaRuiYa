// 移除弹窗"查看合成"按钮，与图鉴弹窗按钮区一致（仅收藏）
const fs = require('fs')

// ① 组件 wxml 去按钮
let w = fs.readFileSync('components/cat-detail/cat-detail.wxml', 'utf8')
w = w.replace(/\n\s*<view class="btn-gold sh-btn" bindtap="onCraft">查看合成<\/view>/, '')
fs.writeFileSync('components/cat-detail/cat-detail.wxml', w)

// ② 组件 js 去 onCraft
let j = fs.readFileSync('components/cat-detail/cat-detail.js', 'utf8')
j = j.replace(/onCraft\(\)\{this\.triggerEvent\("craft"\)\},/, '')
fs.writeFileSync('components/cat-detail/cat-detail.js', j)

// ③ detail.wxml 去 craft 绑定
let w2 = fs.readFileSync('pages/detail/detail.wxml', 'utf8')
w2 = w2.replace(' bind:craft="onCatDetailCraft"', '')
fs.writeFileSync('pages/detail/detail.wxml', w2)

// ④ detail.js 去 onCatDetailCraft
let js = fs.readFileSync('pages/detail/detail.js', 'utf8')
js = js.replace(/onCatDetailCraft\(\)\{const t=this\.data\.catDetail;if\(!t\|\|!t\.en\)return;this\.setData\(\{catDetail:null\}\);getApp\.globalData\.pendingCraft=t\.en;wx\.switchTab\(\{url:"\/pages\/craft\/craft"\}\)\},/, '')
fs.writeFileSync('pages/detail/detail.js', js)
console.log('查看合成按钮已移除')
