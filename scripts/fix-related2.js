// 新手指南 related 断链修复
const fs = require('fs')
let s = fs.readFileSync('data/strategies.js', 'utf8')
const old = '{id:\\"workbench\\",type:\\"recipe\\"}'
if (!s.includes(old)) { console.log('未找到'); process.exit(1) }
s = s.replace(old, '{id:\\"torch\\",type:\\"item\\"}')
fs.writeFileSync('data/strategies.js', s)
console.log('已替换为 torch')
