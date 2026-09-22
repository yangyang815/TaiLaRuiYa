// 全局接入：app.js themeClass 方法 + 各页面 ternary 替换为 app.themeClass()
const fs = require('fs')

// 1) app.js 增加 themeClass 方法
let ap = fs.readFileSync('app.js', 'utf8')
if (!ap.includes('themeClass()')) {
  const anchor = 'setVersion(v){this.globalData.version=v;store.setVersion(v)}'
  if (!ap.includes(anchor)) { console.log('app.js 锚点未命中'); process.exit(1) }
  ap = ap.replace(anchor, anchor + ',themeClass(){const t=this.globalData.theme||"dark";return t==="dark"?"":"theme-"+t}')
  fs.writeFileSync('app.js', ap)
  console.log('app.js themeClass OK')
} else console.log('app.js 已有 themeClass')

// 2) 全部页面 ternary → app.themeClass()
const files = []
const walk = dir => {
  fs.readdirSync(dir).forEach(f => {
    const p = dir + '/' + f
    if (fs.statSync(p).isDirectory()) walk(p)
    else if (/\.js$/.test(f)) files.push(p)
  })
}
;['pages', 'pkgA-tool/pages', 'pkgB-guide/pages'].forEach(walk)

let n1 = 0, n2 = 0, touched = []
files.forEach(f => {
  let s = fs.readFileSync(f, 'utf8')
  let o = s
  s = s.split('app.globalData.theme==="light"?"theme-light":""').join('app.themeClass()')
  s = s.split('app.globalData.theme === "light" ? "theme-light" : ""').join('app.themeClass()')
  if (s !== o) {
    fs.writeFileSync(f, s)
    touched.push(f)
    if (s.includes('app.globalData.theme==="light"')) n1++
    n2++
  }
})
console.log('替换文件数:', n2)
touched.forEach(f => console.log('  ', f))

// 3) 残留检查
let left = 0
files.forEach(f => {
  const s = fs.readFileSync(f, 'utf8')
  const m = s.match(/theme-light/g)
  if (m) { left += m.length; console.log('残留 theme-light:', f, m.length) }
})
console.log('theme-light 残留总数:', left, '（my.js 的导入恢复/页面主题数据除外属正常）')
