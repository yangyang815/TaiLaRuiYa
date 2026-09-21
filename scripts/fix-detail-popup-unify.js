// detail 侧适配新版 cat-detail 组件（组件自建视图模型）
const fs = require('fs')

// ① showCatDetail：去掉旧的 obtainLinks 预构建（组件内部 linkify）
let js = fs.readFileSync('pages/detail/detail.js', 'utf8')
const oldLine = 'wx.hideLoading();entry.obtainLinks=dex.linkify(entry.ob);entry.useLinks=entry.use?dex.linkify(entry.use):[];this.setData({catDetail:entry});'
if (js.includes(oldLine)) {
  js = js.replace(oldLine, 'wx.hideLoading();this.setData({catDetail:entry});')
  console.log('showCatDetail 精简 OK')
} else console.log('showCatDetail 已是新形态')

// ② onCatGo：弹窗内点击精品条目链接
if (!js.includes('onCatGo(e)')) {
  const tf = js.indexOf('toggleFav(){')
  js = js.slice(0, tf) + 'onCatGo(e){const id=e.detail.id;const en=id&&dex.byId[id];if(!en)return;store.pushRecent(id,en.type);dex.go(id)},' + js.slice(tf)
  console.log('onCatGo 已加')
}
fs.writeFileSync('pages/detail/detail.js', js)

// ③ wxml：传 theme + go 事件
let w = fs.readFileSync('pages/detail/detail.wxml', 'utf8')
w = w.replace('<cat-detail item="{{catDetail}}" bind:close="onCatDetailClose" bind:craft="onCatDetailCraft" />',
  '<cat-detail item="{{catDetail}}" theme="{{themeClass === \'theme-light\' ? \'light\' : \'dark\'}}" bind:close="onCatDetailClose" bind:go="onCatGo" />')
fs.writeFileSync('pages/detail/detail.wxml', w)
console.log('detail.wxml OK')
