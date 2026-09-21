// detail 页 cat: 链接改为页内弹窗（复用 cat-detail 组件），不再跳图鉴 tab
const fs = require('fs')

// ① detail.json 注册组件
let j = JSON.parse(fs.readFileSync('pages/detail/detail.json', 'utf8'))
j.usingComponents['cat-detail'] = '/components/cat-detail/cat-detail'
fs.writeFileSync('pages/detail/detail.json', JSON.stringify(j, null, 2))
console.log('detail.json OK')

// ② detail.js：新增依赖 + 两处 cat: 分支改页内弹窗 + 新增方法
let js = fs.readFileSync('pages/detail/detail.js', 'utf8')
if (!js.includes('catalog-search')) {
  js = js.replace('const acq=require("../../utils/acq");', 'const acq=require("../../utils/acq");const catSearch=require("../../utils/catalog-search");const wikiCraft=require("../../utils/wiki-craft");')
}
const branchA = 'if(id.indexOf("cat:")===0){const app=getApp();app.globalData.pendingCatSheet=id;wx.switchTab({url:"/pages/codex/codex"});return}'
const branchB = 'if(id&&id.indexOf("cat:")===0){const app=getApp();app.globalData.pendingCatSheet=id;wx.switchTab({url:"/pages/codex/codex"});return}'
if (!js.includes(branchA) || !js.includes(branchB)) { console.log('cat: 分支锚未命中'); process.exit(1) }
js = js.split(branchA).join('if(id.indexOf("cat:")===0){this.showCatDetail(id.slice(4));return}')
js = js.split(branchB).join('if(id&&id.indexOf("cat:")===0){this.showCatDetail(id.slice(4));return}')
// 方法追加到 toggleFav 前
const methods = 'showCatDetail(f){catSearch.getById(f).then(entry=>{if(!entry)return;this.setData({catDetail:entry});wikiCraft.hasCraft(entry.en).then(v=>{if(v&&this.data.catDetail&&this.data.catDetail.en===entry.en){this.setData({"catDetail.hasCraft":v})}})})},onCatDetailClose(){this.setData({catDetail:null})},onCatDetailCraft(){const t=this.data.catDetail;if(!t||!t.en)return;this.setData({catDetail:null});getApp().globalData.pendingCraft=t.en;wx.switchTab({url:"/pages/craft/craft"})},'
const tf = js.indexOf('toggleFav(){')
if (tf < 0) { console.log('toggleFav 未命中'); process.exit(1) }
js = js.slice(0, tf) + methods + js.slice(tf)
fs.writeFileSync('pages/detail/detail.js', js)
console.log('detail.js OK')

// ③ detail.wxml 挂组件
let w = fs.readFileSync('pages/detail/detail.wxml', 'utf8')
if (!w.includes('cat-detail')) {
  w = w.replace('<back-top show="{{showBackTop}}" />', '<back-top show="{{showBackTop}}" />\n\n<cat-detail item="{{catDetail}}" bind:close="onCatDetailClose" bind:craft="onCatDetailCraft" />')
  fs.writeFileSync('pages/detail/detail.wxml', w)
  console.log('detail.wxml OK')
} else console.log('wxml 已有 cat-detail')
