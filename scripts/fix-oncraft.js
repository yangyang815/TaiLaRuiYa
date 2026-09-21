// 清理残留的 onCraft 方法（带空格格式）
const fs = require('fs')
let j = fs.readFileSync('components/cat-detail/cat-detail.js', 'utf8')
const before = j.length
j = j.replace(/,?\s*onCraft\(\)\s*\{\s*this\.triggerEvent\("craft"\)\s*\}/, '')
fs.writeFileSync('components/cat-detail/cat-detail.js', j)
console.log('长度', before, '→', j.length, '| onCraft 残留:', j.includes('onCraft') ? 1 : 0)
