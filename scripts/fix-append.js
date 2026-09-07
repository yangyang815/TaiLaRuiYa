// 2026-09 图鉴补全区块管理（幂等）：重建缺失条目 + 压缩新精灵图
const fs = require('fs')
const path = require('path')
const { LIST } = require('./expand-items')
const itemsPath = path.join(__dirname, '..', 'data', 'items.js')
const spritesDir = path.join(__dirname, '..', 'assets', 'sprites')
const MARKER = '  /* ================= 2026-09 图鉴补全（对照 wiki） ================= */'

function fmt (e) {
  const o = { id: e.id, name: e.name, en: e.en, cat: e.cat, sub: e.sub || '', rarity: e.rarity, art: e.id, stats: e.stats, obtain: e.obtain }
  return '  ' + JSON.stringify(o).replace(/"([a-z_]+)":/g, '$1: ') + ','
}

function main () {
  let src = fs.readFileSync(itemsPath, 'utf8')
  const hasMarker = src.indexOf(MARKER) >= 0

  // 原始区段（单引号 id）= 追加区块之前的所有内容
  const headSrc = hasMarker ? src.slice(0, src.indexOf(MARKER)) : src.slice(0, src.lastIndexOf(']'))
  const originalIds = new Set()
  const re = /\bid:\s*'([a-z_0-9]+)'/g
  let m
  while ((m = re.exec(headSrc))) originalIds.add(m[1])

  // 保证头区以逗号结尾（原数组最后一项可能没有尾逗号）
  let head = headSrc
  if (!/,\s*$/.test(head.trimEnd())) head = head.trimEnd().replace(/\}$/, '},') + '\n\n'

  // 需要追加的条目：非原始区段已有 + 精灵图已在本地
  const lines = []
  const added = []
  for (const x of LIST) {
    if (originalIds.has(x.id)) continue
    if (!fs.existsSync(path.join(spritesDir, x.id + '.png'))) continue
    lines.push(fmt(x))
    added.push(x.name)
  }

  const out = head + MARKER + '\n' + lines.join('\n') + '\n' + ']'
  fs.writeFileSync(itemsPath, out)
  console.log('补全区块条目:', lines.length, '| 新增:', added.join(', ') || '（无变化，幂等）')
}
main()
