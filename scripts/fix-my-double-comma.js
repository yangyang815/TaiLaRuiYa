const fs = require('fs')
let m = fs.readFileSync('pages/my/my.js', 'utf8')
const broken = '})},,buildCompact'
if (m.includes(broken)) {
  m = m.split(broken).join('})},buildCompact')
  fs.writeFileSync('pages/my/my.js', m)
  console.log('双逗号修复 OK')
} else if (m.includes('}),buildCompact')) {
  console.log('已是正常状态')
} else {
  console.log('未找到模式，检查上下文')
  const i = m.indexOf('goTheme')
  console.log(JSON.stringify(m.slice(i, i + 120)))
}
