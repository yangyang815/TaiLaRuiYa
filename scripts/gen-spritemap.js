// 临时脚本：根据 assets/sprites 目录重建 data/spritemap.js
const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, '..', 'assets', 'sprites')
const files = fs.readdirSync(dir).filter(f => /\.(png|gif)$/i.test(f))
const entries = files.map(f => {
  const ext = path.extname(f).slice(1).toLowerCase()
  return JSON.stringify(path.basename(f, path.extname(f))) + ':"' + ext + '"'
}).sort()

const out = '// 官方精灵图清单（由下载脚本生成）：存在即使用 assets/sprites/{artId}.{ext}\nmodule.exports = {' + entries.join(',') + '}\n'
fs.writeFileSync(path.join(__dirname, '..', 'data', 'spritemap.js'), out)
console.log('registered:', entries.length)
