// 修复莫比乌斯带获得方式：石巨人 16.67% 掉落（官方 wiki 核实）
const fs = require('fs')
let v = fs.readFileSync('pkg-cat-2/data/data-v2.js', 'utf8')
const m = v.match(/\{"n":"莫比乌斯带"[^}]*"ob":"[^"]*"[^}]*\}/)
if (!m) { console.log('未找到莫比乌斯带条目'); process.exit(1) }
console.log('原文:', m[0])
const fixed = m[0].replace(/"ob":"[^"]*"/, '"ob":"由 石巨人 掉落"')
  .replace(/"t":"[^"]*"/, '"t":"召唤标记效果上限+1，鞭类武器范围+10%"')
v = v.replace(m[0], fixed)
fs.writeFileSync('pkg-cat-2/data/data-v2.js', v)
console.log('修正:', fixed)
