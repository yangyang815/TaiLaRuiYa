// 重新计算图鉴三卷数据文件的内容 hash，生成 utils/cat-data-ver.js（分卷版本对象）
// 用法：每次修改 pkg-cat-N/data/data-vN.js 后运行 node scripts/bump-cat-ver.js
// 注意：改了数据但没跑本脚本 → 用户缓存不失效（看不到新数据），verify-data.js 会拦截此情况
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
process.chdir(path.join(__dirname, '..'))
const vols = require('../utils/cat-vols')
const vers = {}
for (let i = 1; i <= vols; i++) {
  const df = path.join('pkg-cat-' + i, 'data', 'data-v' + i + '.js')
  if (!fs.existsSync(df)) {
    console.error('数据文件不存在: ' + df)
    process.exit(1)
  }
  vers['v' + i] = crypto.createHash('md5').update(fs.readFileSync(df)).digest('hex').slice(0, 10)
}
fs.writeFileSync(
  'utils/cat-data-ver.js',
  '// 自动生成：图鉴数据分卷版本（内容 hash，勿手改；改哪卷失效哪卷缓存）\n' +
    'module.exports = ' + JSON.stringify(vers) + '\n'
)
console.log('cat-data-ver 已更新:', JSON.stringify(vers))
