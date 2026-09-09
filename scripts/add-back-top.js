// 批量为长页面接入返回顶部（Behavior + 组件）
const fs = require('fs')
const path = require('path')

const PAGES = [
  'pages/codex/codex', 'pages/craft/craft', 'pages/detail/detail', 'pages/strategy/strategy',
  'pages/list/list', 'pages/search/search',
  'pkgA-tool/pages/fishing/fishing', 'pkgA-tool/pages/career/career',
  'pkgA-tool/pages/careerlib/careerlib', 'pkgA-tool/pages/careerpath/careerpath',
  'pkgA-tool/pages/build/detail',
  'pkgB-guide/pages/guide/guide', 'pkgB-guide/pages/achv/achv', 'pkgB-guide/pages/gameachv/gameachv',
  'pkgB-guide/pages/secrets/secrets', 'pkgB-guide/pages/worldseeds/worldseeds',
  'pkgB-guide/pages/biomes/biomes', 'pkgB-guide/pages/prefixes/prefixes',
  'pkgB-guide/pages/bossguide/detail',
  'pkg-cat-1/pages/index/index', 'pkg-cat-2/pages/index/index'
]

let ok = 0
PAGES.forEach(pg => {
  const js = pg + '.js', wxml = pg + '.wxml', json = pg + '.json'
  if (!fs.existsSync(js) || !fs.existsSync(wxml) || !fs.existsSync(json)) {
    console.log('跳过（文件缺失）:', pg)
    return
  }
  const depth = pg.split('/').length - 1 // pages/x → 2, pkgA-tool/pages/x → 3
  const prefix = '../'.repeat(depth)
  const rel = prefix + 'utils/back-top-behavior'

  // 1. JS：require + behaviors
  let s = fs.readFileSync(js, 'utf8')
  if (!s.includes('back-top-behavior')) {
    if (!s.includes('Page({')) { console.log('跳过（非 Page 结构）:', pg); return }
    s = 'const BT = require(\'' + rel + '\')\n' + s
    s = s.replace('Page({', 'Page({\n  behaviors: [BT],')
    fs.writeFileSync(js, s)
  }

  // 2. WXML：尾部挂组件
  let w = fs.readFileSync(wxml, 'utf8')
  if (!w.includes('<back-top')) {
    w = w.rstrip ? w : w
    w = w.replace(/\s*$/, '') + '\n\n<back-top show="{{showBackTop}}" />\n'
    fs.writeFileSync(wxml, w)
  }

  // 3. JSON：注册组件
  const conf = JSON.parse(fs.readFileSync(json, 'utf8'))
  conf.usingComponents = conf.usingComponents || {}
  conf.usingComponents['back-top'] = '/components/back-top/back-top'
  fs.writeFileSync(json, JSON.stringify(conf, null, 2) + '\n')

  ok++
  console.log('✓', pg)
})
console.log('完成:', ok, '/', PAGES.length, '页')
