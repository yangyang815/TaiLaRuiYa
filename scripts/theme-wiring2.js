const fs = require('fs')
const files = []
const walk = dir => {
  fs.readdirSync(dir).forEach(f => {
    const p = dir + '/' + f
    if (fs.statSync(p).isDirectory()) walk(p)
    else if (/\.js$/.test(f)) files.push(p)
  })
}
;['pages', 'pkgA-tool/pages', 'pkgB-guide/pages'].forEach(walk)

let n = 0
files.forEach(f => {
  let s = fs.readFileSync(f, 'utf8')
  const o = s
  // 单引号带空格版（手写页面的写法）
  s = s.split("app.globalData.theme === 'light' ? 'theme-light' : ''").join('app.themeClass()')
  s = s.split("app.globalData.theme === 'light' ?'theme-light': ''").join('app.themeClass()')
  if (s !== o) { fs.writeFileSync(f, s); n++; console.log('OK', f) }
})
console.log('修复文件数:', n)

// 最终残留
let left = 0
files.forEach(f => {
  const m = fs.readFileSync(f, 'utf8').match(/theme-light/g)
  if (m) { left += m.length; console.log('残留:', f, m.length) }
})
console.log('theme-light 总残留:', left)
