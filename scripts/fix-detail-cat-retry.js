// showCatDetail 增加加载反馈+重试：数据未装载完时不再静默失败
const fs = require('fs')
let js = fs.readFileSync('pages/detail/detail.js', 'utf8')
const oldFn = 'showCatDetail(f){catSearch.getById(f).then(entry=>{if(!entry)return;this.setData({catDetail:entry});wikiCraft.hasCraft(entry.en).then(v=>{if(v&&this.data.catDetail&&this.data.catDetail.en===entry.en){this.setData({"catDetail.hasCraft":v})}})})}'
if (!js.includes(oldFn)) { console.log('showCatDetail 锚未命中'); process.exit(1) }
const newFn = 'showCatDetail(f,retry){retry=retry||0;if(retry===0)wx.showLoading({title:"加载中",mask:true});catSearch.getById(f).then(entry=>{if(!entry){if(retry<12){setTimeout(()=>this.showCatDetail(f,retry+1),1000);return}wx.hideLoading();wx.showToast({title:"未找到该物品",icon:"none"});return}wx.hideLoading();this.setData({catDetail:entry});wikiCraft.hasCraft(entry.en).then(v=>{if(v&&this.data.catDetail&&this.data.catDetail.en===entry.en){this.setData({"catDetail.hasCraft":v})}})}).catch(()=>{if(retry<12){setTimeout(()=>this.showCatDetail(f,retry+1),1000);return}wx.hideLoading();wx.showToast({title:"加载失败，请重试",icon:"none"})})}'
js = js.replace(oldFn, newFn)
fs.writeFileSync('pages/detail/detail.js', js)
console.log('showCatDetail 已升级')
