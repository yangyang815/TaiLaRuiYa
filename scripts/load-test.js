// 全项目模块加载测试：逐个 require 所有页面/组件/工具/数据，捕获模块级错误
const fs = require('fs')
const path = require('path')

const storage = {}
global.wx = {
  getStorageSync: k => storage[k] || '',
  setStorageSync: (k, v) => { storage[k] = v },
  removeStorageSync: k => { delete storage[k] },
  getWindowInfo: () => ({ pixelRatio: 2, windowWidth: 375, statusBarHeight: 20 }),
  getSystemInfoSync: () => ({ pixelRatio: 2, windowWidth: 375, statusBarHeight: 20 }),
  cloud: { init () {}, database: () => ({ collection: () => ({ orderBy: () => ({ limit: () => ({ get: () => Promise.resolve({ data: [] }) }) }) }) }) },
  request: () => {},
  getClipboardData: () => {}, setClipboardData: () => {}, showToast: () => {}, showModal: () => {},
  navigateTo: () => {}, switchTab: () => {}, scanCode: () => {}, vibrateShort: () => {}
}
global.Component = def => { if (global._lastC) throw new Error('组件重名: ' + (global._lastC.__file || '?')); def.__file = global.__cur; global._lastC = def }
global.Page = def => { def.__file = global.__cur; global.__pages[global.__cur] = def }
global.Behavior = def => ({ __behavior: true })
global.getApp = () => ({ globalData: { sys: { statusBarHeight: 20 }, navTop: 64, capsuleRight: 100, theme: 'dark', pendingCodex: null }, setTheme () {}, setVersion () {} })
global.__pages = {}

const errors = []
let count = 0
function walk (dir) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f)
    if (fs.statSync(p).isDirectory()) {
      if (!/node_modules|\.git|\.workbuddy|scripts|catalog-stage/.test(p)) walk(p)
      return
    }
    if (!f.endsWith('.js')) return
    count++
    global.__cur = p.replace(/\\/g, '/')
    global._lastC = null
    try {
      require(p)
    } catch (e) {
      errors.push(p + '\n    ' + (e.message || e).toString().slice(0, 200))
    }
  })
}

// 从项目根开始（覆盖 utils/data/pages/components/custom-tab-bar/pkg*）
walk(process.cwd())

console.log('加载 JS 文件:', count, '个')
console.log('App 注册页面:', Object.keys(global.__pages).length, '个')
if (errors.length) {
  console.log('\n❌ 模块加载错误 ' + errors.length + ' 个:')
  errors.forEach(e => console.log('  - ' + e))
  process.exit(1)
}
console.log('✅ 全部模块加载无错误')
