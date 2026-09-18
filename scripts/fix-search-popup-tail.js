// 补上被吞掉的函数收尾 }
const fs = require('fs')
for (const p of ['pages/home/home.js', 'pages/search/search.js']) {
  let s = fs.readFileSync(p, 'utf8')
  const broken = 'wx.switchTab({url:"/pages/codex/codex"}),onCatDetailClose'
  const fixed = 'wx.switchTab({url:"/pages/codex/codex"})},onCatDetailClose'
  if (s.includes(broken)) {
    s = s.replace(broken, fixed)
    fs.writeFileSync(p, s)
    console.log('[OK]', p)
  } else if (s.includes(fixed)) {
    console.log('[已修]', p)
  } else {
    console.log('[未命中!]', p); process.exitCode = 1
  }
}
