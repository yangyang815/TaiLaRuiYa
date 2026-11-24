// 灾厄物品图标下载管线（常驻脚本）
// 来源：calamitymod.wiki.gg 官方英文 Wiki（Special:FilePath/<英文名>.png，curl 可直连）
// 流程：串行下载（0.6s 间隔防限流）→ PIL 量化 256 色 PNG（_py_cal_icon_quantize.py）→ pkg-cal/assets/item/<id>.png
// 输出：pkg-cal/data/calamity-item-icons.js（id → 本地图标路径 清单；未列入的条目在页面回退为文字块图标）
// 用法：node scripts/build-cal-item-icons.js [--only=id1,id2,...]
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const items = require('../pkg-cal/data/calamity-items').items
const onlyArg = process.argv.find(a => a.startsWith('--only='))
const retryArg = process.argv.includes('--retry')
const delayArg = process.argv.find(a => a.startsWith('--delay='))
const only = onlyArg ? onlyArg.split('=')[1].split(',') : null
const OUT_DIR = path.join(__dirname, '..', 'pkg-cal', 'assets', 'item')
const TMP_DIR = process.env.TEMP + '\\cal-item-icons'
const PY = 'C:/Users/19909/.workbuddy/binaries/python/versions/3.13.12/python.exe'

// wiki.gg 文件名与游戏内英文显示名不一致的条目在此补充
const NAME_FIX = {
  bloodworm_item: 'Bloodworm'
}

fs.mkdirSync(OUT_DIR, { recursive: true })
fs.mkdirSync(TMP_DIR, { recursive: true })

const targets = items.filter(i => i.en && (!only || only.indexOf(i.id) >= 0) && (!retryArg || !fs.existsSync(path.join(OUT_DIR, i.id + '.png'))))
console.log('待下载图标:', targets.length, '/', items.length)

let ok = 0
const miss = []
let idx = 0

function downloadOne(item) {
  const en = NAME_FIX[item.id] || item.en
  const url = 'https://calamitymod.wiki.gg/wiki/Special:FilePath/' + encodeURIComponent(en).replace(/%20/g, '%20') + '.png'
  const raw = path.join(TMP_DIR, item.id + '.raw.png')
  try {
    execSync('curl -sL --max-time 25 -A "TerrariaGuideBot/1.0 (mini-program dev)" -o "' + raw + '" "' + url + '"', { stdio: 'ignore' })
    const head = fs.readFileSync(raw).slice(0, 8)
    if (!(head[0] === 0x89 && head[1] === 0x50)) return false // 非 PNG（404 HTML 等）
    return true
  } catch (e) {
    return false
  }
}

function run() {
  const next = targets[idx]
  if (!next) { finish(); return }
  if (downloadOne(next)) ok++
  else miss.push(next.id + '(' + next.en + ')')
  idx++
  if (idx % 20 === 0) console.log('进度', idx + '/' + targets.length, '成功', ok)
  setTimeout(run, delayArg ? Number(delayArg.split('=')[1]) : 600)
}

function finish() {
  execSync('"' + PY + '" "' + path.join(__dirname, '_py_cal_icon_quantize.py') + '" "' + TMP_DIR + '" "' + OUT_DIR + '"', { stdio: 'inherit' })
  const icons = {}
  fs.readdirSync(OUT_DIR).forEach(f => {
    if (f.endsWith('.png')) icons[f.slice(0, -4)] = '/pkg-cal/assets/item/' + f
  })
  fs.writeFileSync(path.join(__dirname, '..', 'pkg-cal', 'data', 'calamity-item-icons.js'),
    '// 灾厄物品图标清单（由 scripts/build-cal-item-icons.js 生成，勿手改；未列入的条目在页面回退为文字块图标）\n' +
    'module.exports=' + JSON.stringify(icons) + '\n')
  console.log('完成：成功 ' + ok + ' | 缺失 ' + miss.length + ' | 清单 ' + Object.keys(icons).length + ' 条')
  if (miss.length) console.log('缺失清单：\n' + miss.join('\n'))
}

run()
