const fs = require('fs')
let p = fs.readFileSync('pages/theme/theme.js', 'utf8')
// 移除误插进 setData 的调用
p = p.split('\n    // 角标：看过主题页即不再提示\n    theme.markThemeSeen(),').join('')
// 在 render() 的 setData 块结束后调用
if (!p.includes('theme.markThemeSeen()')) {
  const anchor = "    lockedLeft: lockedLeft,\n    })"
  if (!p.includes(anchor)) {
    // 打印实际片段辅助定位
    const i = p.indexOf('lockedLeft')
    console.log('上下文:', JSON.stringify(p.slice(i - 40, i + 80)))
    process.exit(1)
  }
  p = p.replace(anchor, anchor + "\n    theme.markThemeSeen()")
}
fs.writeFileSync('pages/theme/theme.js', p)
console.log('修正 OK')
