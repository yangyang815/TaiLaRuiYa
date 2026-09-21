const fs = require('fs')
const rp = 'data/recipes.js'
let r = fs.readFileSync(rp, 'utf8')
if (r.includes('imbuing')) { console.log('已有 imbuing') } else {
  const old = 'bottle:"摆放的瓶子"'
  if (!r.includes(old)) { console.log('锚点未命中'); process.exit(1) }
  r = r.replace(old, old + ',imbuing:"灌注站"')
  fs.writeFileSync(rp, r)
  console.log('STATIONS 增加 imbuing OK')
}
const R = require('../data/recipes.js')
console.log('验证:', R.STATIONS.imbuing)
