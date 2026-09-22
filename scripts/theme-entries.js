// 主题入口：首页右上角图标 + 我的页入口 + 角标逻辑
const fs = require('fs')

// 1) app.json 注册页面
let ap = fs.readFileSync('app.json', 'utf8')
if (!ap.includes('pages/theme/theme')) {
  ap = ap.replace('"pages/catalog/catalog",', '"pages/catalog/catalog",\n    "pages/theme/theme",')
  fs.writeFileSync('app.json', ap)
  console.log('app.json 注册主题页 OK')
} else console.log('app.json 已注册')

// 2) 首页右上角图标（消息中心旁）+ goTheme
let hw = fs.readFileSync('pages/home/home.wxml', 'utf8')
if (!hw.includes('goTheme')) {
  const anchor = '<view class="q-btn tappable" bindtap="goMsgs" aria-label="消息中心">'
  const add = '<view class="q-btn tappable" bindtap="goTheme" aria-label="主题皮肤">\n          <text class="q-ico">🎨</text>\n          <view class="q-dot" wx:if="{{themeBadge}}" />\n        </view>\n        '
  if (!hw.includes(anchor)) { console.log('home.wxml 锚点未命中'); process.exit(1) }
  hw = hw.replace(anchor, add + anchor)
  fs.writeFileSync('pages/home/home.wxml', hw)
  console.log('home.wxml 主题图标 OK')
} else console.log('home.wxml 已有')

let h = fs.readFileSync('pages/home/home.js', 'utf8')
if (!h.includes('goTheme')) {
  // badge 计算：存在未解锁主题且未访问过主题页
  const badgeFn = ',refreshThemeBadge(){let b=false;try{if(!wx.getStorageSync("terr_theme_seen")){const th=require("../../utils/theme");b=th.THEMES.some(t=>t.locked&&th.getUnlocked().indexOf(t.id)<0)}}catch(e){}this.setData({themeBadge:b})}'
  const anchor2 = 'loadTopBadges(){'
  if (!h.includes(anchor2)) { console.log('home.js loadTopBadges 锚点未命中'); process.exit(1) }
  h = h.replace(anchor2, 'refreshThemeBadge(){let b=false;try{if(!wx.getStorageSync("terr_theme_seen")){const th=require("../../utils/theme");b=th.THEMES.some(t=>t.locked&&th.getUnlocked().indexOf(t.id)<0)}}catch(e){}this.setData({themeBadge:b})},' + anchor2)
  // onShow 与 onLoad 里调用
  h = h.replace('this.loadTopBadges()},buildRecents', 'this.loadTopBadges();this.refreshThemeBadge()},buildRecents')
  h = h.replace('this.setData({recents:this.buildRecents()})},onSearchKw', 'this.setData({recents:this.buildRecents()});this.refreshThemeBadge()},onSearchKw')
  // 跳转
  h = h.replace('goMsgs(){wx.navigateTo({url:"/pages/messages/messages"})},', 'goMsgs(){wx.navigateTo({url:"/pages/messages/messages"})},goTheme(){wx.navigateTo({url:"/pages/theme/theme"})},')
  fs.writeFileSync('pages/home/home.js', h)
  console.log('home.js 入口+角标 OK')
} else console.log('home.js 已有')

// 3) 我的页：夜间模式开关 → 主题皮肤入口
let mw = fs.readFileSync('pages/my/my.wxml', 'utf8')
if (!mw.includes('goTheme')) {
  const old = '    <view class="m-row">\n      <text class="m-icon">🌙</text>\n      <text class="m-n flex-1">夜间模式</text>\n      <switch checked="{{dark}}" bindchange="onTheme" color="#FFD700" />\n    </view>'
  const neo = '    <view class="m-row tappable" bindtap="goTheme">\n      <text class="m-icon">🎨</text>\n      <text class="m-n flex-1">主题皮肤</text>\n      <text class="m-arrow">›</text>\n    </view>'
  if (!mw.includes(old)) { console.log('my.wxml 开关行锚点未命中'); process.exit(1) }
  mw = mw.replace(old, neo)
  fs.writeFileSync('pages/my/my.wxml', mw)
  console.log('my.wxml 主题入口 OK')
} else console.log('my.wxml 已有')

let m = fs.readFileSync('pages/my/my.js', 'utf8')
if (!m.includes('goTheme')) {
  // onTheme 整体替换为 goTheme
  const o1 = m.indexOf('onTheme(e){')
  if (o1 < 0) { console.log('my.js onTheme 未找到'); process.exit(1) }
  // 找到该方法的结束（下一个 },方法名 的模式）
  const segEnd = m.indexOf('},buildCompact(data)', o1)
  if (segEnd < 0) { console.log('my.js onTheme 结束未找到'); process.exit(1) }
  m = m.slice(0, o1) + 'goTheme(){wx.navigateTo({url:"/pages/theme/theme"})},' + m.slice(segEnd + 1)
  fs.writeFileSync('pages/my/my.js', m)
  console.log('my.js goTheme OK')
} else console.log('my.js 已有')
