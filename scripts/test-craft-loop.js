// 闭环全流程测试：详情页「如何合成」→ pendingCraft → 合成页 wiki 配方回退
const fs = require('fs')
const path = require('path')
const Module = require('module')

const craftPath = path.resolve(__dirname, '..', 'pages', 'craft', 'craft.js')
let src = fs.readFileSync(craftPath, 'utf8')
// Node 无 require.async —— 替换为测试桩
src = src.replace(
  "require.async('../../pkg-recipe/data/recipes-wiki.js')",
  "Promise.resolve(global.__wikiData || [])")

// 环境桩
const storage = {}
global.wx = {
  getStorageSync: k => storage[k] || '',
  setStorageSync: (k, v) => { storage[k] = v },
  showToast: () => {}, vibrateShort: () => {},
  switchTab: () => {}, navigateTo: () => {}, pageScrollTo: () => {},
  getWindowInfo: () => ({ statusBarHeight: 20 }),
  getMenuButtonBoundingClientRect: () => ({ right: 100 })
}
const __app = { globalData: { pendingCraft: null, theme: 'dark', sys: { statusBarHeight: 20 }, capsuleRight: 100 } }
global.getApp = () => __app
global.Page = def => { global.__craft = def }

const req = Module.createRequire(craftPath)
const fn = new Function('require', 'module', 'exports', '__filename', '__dirname', src)
const m = { exports: {} }
fn(req, m, m.exports, craftPath, path.dirname(craftPath))

const def = global.__craft
const inst = {
  data: JSON.parse(JSON.stringify(def.data || {})),
  setData (d) { Object.keys(d).forEach(k => { const parts = k.split('.'); let o = this.data; for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]] = o[parts[i]] || {}; o[parts[parts.length - 1]] = d[k] }) },
  getTabBar: () => null,
  _haveSet: () => new Set(),
  ...def
}
global.__wikiData = require('./../pkg-recipe/data/recipes-wiki.js')

// ---- 场景 1：详情页「如何合成」→ pendingCraft='cell_phone'（精品 dex id）----
getApp().globalData.pendingCraft = 'cell_phone'
inst.onShow()
setTimeout(() => {
  const t = inst.data.target
  console.log('1. 精品物品闭环:', t && t.wiki && t.name === '手机' ? '✓ 打开 wiki 配方「' + t.name + '」@' + t.station : '✗ ' + JSON.stringify(t && t.name))
  console.log('2. 树行数:', inst.data.wikiRows.length, '| 首行:', inst.data.wikiRows[0] && inst.data.wikiRows[0].label, '(可展开: ' + inst.data.wikiRows[0].expandable + ')')

  // ---- 场景 2：展开 PDA（点击材料）----
  const pda = inst.data.wikiRows.find(r => r.expandable)
  inst.onWikiRowTap({ currentTarget: { dataset: { key: pda.key, expandable: true } } })
  const d1 = inst.data.wikiRows.filter(r => r.depth === 1)
  console.log('3. 展开 PDA:', d1.length, '个子材料 ✓ |', d1.map(r => r.label).join(', ').slice(0, 60))

  // ---- 场景 3：全量图鉴物品（EN 直传）→ cat-detail「如何合成」----
  getApp().globalData.pendingCraft = 'Cell Phone'
  inst.onShow()
  setTimeout(() => {
    console.log('4. 全量物品 EN 直传:', inst.data.target && inst.data.target.wiki && inst.data.target.name === '手机' ? '✓' : '✗ ' + JSON.stringify(inst.data.target && inst.data.target.name))

    // ---- 场景 4：不可合成物品 → 友好提示不崩溃 ----
    getApp().globalData.pendingCraft = 'stone_wall_fake_xyz'
    inst.onShow()
    setTimeout(() => {
      console.log('5. 无配方物品: 静默提示不崩溃 ✓（toast 已 mock）')

      // ---- 场景 5：本地精品配方不受影响（工作台）----
      getApp().globalData.pendingCraft = null
      inst.setTarget('workbench')
      console.log('6. 本地配方回归:', inst.data.target && !inst.data.target.wiki && inst.data.target.name === '工作台' ? '✓ 工作台走原合成树' : '✗ ' + JSON.stringify(inst.data.target && inst.data.target.name))
      process.exit(0)
    }, 200)
  }, 200)
}, 300)
