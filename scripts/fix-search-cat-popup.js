// 首页/搜索页的目录物品点击 → 改为跳转图鉴 tab 并复用图鉴页弹窗（pendingCatSheet 机制）
const fs = require('fs')

function patch(p, oldStr, newStr, label) {
  let s = fs.readFileSync(p, 'utf8')
  if (s.includes(newStr)) { console.log('[已修]', label); return }
  if (!s.includes(oldStr)) { console.log('[未命中!]', label); process.exitCode = 1; return }
  s = s.replace(oldStr, newStr)
  fs.writeFileSync(p, s)
  console.log('[OK]', label)
}

// ① 首页搜索面板：目录物品
patch(
  'pages/home/home.js',
  'this._closePanel();catSearch.getById(f).then(entry=>{if(!entry)return;this.setData({catDetail:entry});wikiCraft.hasCraft(entry.en).then(v=>{if(v&&this.data.catDetail&&this.data.catDetail.en===entry.en){this.setData({"catDetail.hasCraft":v})}})})}',
  'this._closePanel();getApp().globalData.pendingCatSheet="cat:"+f;wx.switchTab({url:"/pages/codex/codex"})',
  'home.onPanelCatalog'
)

// ② 独立搜索页：目录物品
patch(
  'pages/search/search.js',
  'catSearch.getById(e.currentTarget.dataset.f).then(entry=>{if(!entry)return;this.setData({catDetail:entry});wikiCraft.hasCraft(entry.en).then(v=>{if(v&&this.data.catDetail&&this.data.catDetail.en===entry.en){this.setData({"catDetail.hasCraft":v})}})})}',
  'getApp().globalData.pendingCatSheet="cat:"+e.currentTarget.dataset.f;wx.switchTab({url:"/pages/codex/codex"})',
  'search.onCatalog'
)
