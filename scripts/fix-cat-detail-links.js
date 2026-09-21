// 修复详情页弹窗：①补上缺失的 require ②弹窗内获得方式/用途做链接化
const fs = require('fs')

// ① detail.js 补 require（上次因误判 'catalog-search' 字样已存在而跳过）
let js = fs.readFileSync('pages/detail/detail.js', 'utf8')
if (!js.includes('const catSearch=require')) {
  js = js.replace('const acq=require("../../utils/acq");', 'const acq=require("../../utils/acq");const catSearch=require("../../utils/catalog-search");const wikiCraft=require("../../utils/wiki-craft");')
  fs.writeFileSync('pages/detail/detail.js', js)
  console.log('detail.js require 补齐')
} else console.log('require 已存在')

// ② showCatDetail 里为弹窗构建链接分段（dex 已在作用域内）
let s = fs.readFileSync('pages/detail/detail.js', 'utf8')
const aOld = 'wx.hideLoading();this.setData({catDetail:entry});'
const aNew = 'wx.hideLoading();entry.obtainLinks=dex.linkify(entry.ob);entry.useLinks=entry.use?dex.linkify(entry.use):[];this.setData({catDetail:entry});'
if (!s.includes(aOld)) { console.log('showCatDetail 锚未命中'); process.exit(1) }
s = s.replace(aOld, aNew)
fs.writeFileSync('pages/detail/detail.js', s)
console.log('showCatDetail 链接化 OK')

// ③ cat-detail 组件 wxml：ob/use 渲染链接分段
let w = fs.readFileSync('components/cat-detail/cat-detail.wxml', 'utf8')
w = w.replace('<view class="cd-row" wx:if="{{item.ob}}"><text class="cd-k">获得方式</text><text class="flex-1">{{item.ob}}</text></view>',
  '<view class="cd-row" wx:if="{{item.ob}}"><text class="cd-k">获得方式</text><view class="flex-1 cd-text"><block wx:for="{{item.obtainLinks}}" wx:key="index"><text wx:if="{{!item.ref}}">{{item.s}}</text><text wx:else class="cd-lnk">{{item.s}}</text></block></view></view>')
w = w.replace('<view class="cd-row" wx:if="{{item.use}}"><text class="cd-k">用途</text><text class="flex-1">{{item.use}}</text></view>',
  '<view class="cd-row" wx:if="{{item.use}}"><text class="cd-k">用途</text><view class="flex-1 cd-text"><block wx:for="{{item.useLinks}}" wx:key="index"><text wx:if="{{!item.ref}}">{{item.s}}</text><text wx:else class="cd-lnk">{{item.s}}</text></block></view></view>')
fs.writeFileSync('components/cat-detail/cat-detail.wxml', w)
console.log('cat-detail.wxml OK')

// ④ 组件 wxss 补样式
let c = fs.readFileSync('components/cat-detail/cat-detail.wxss', 'utf8')
if (!c.includes('.cd-lnk')) {
  c += '\n.cd-text { display: block; }\n.cd-lnk { color: #4CE0E0; text-decoration: underline; }\n'
  fs.writeFileSync('components/cat-detail/cat-detail.wxss', c)
  console.log('cat-detail.wxss OK')
} else console.log('wxss 已有')
