// 上传前检查清单：一次跑完所有上传前校验，有 FAIL 时退出码非 0
// 用法：node scripts/verify-data.js
// 检查项：数据完整性 / 搜索 / 精灵图映射 / app.json 路由 / 存储键合法性 / 引用图标有效性 / 体积红线
const fs = require('fs')
const path = require('path')
process.chdir(path.join(__dirname, '..'))

const fails = []
const warns = []
const oks = []
const ok = msg => oks.push(msg)
const fail = msg => fails.push(msg)
const warn = msg => warns.push(msg)
const sec = t => console.log('\n== ' + t + ' ==')

/* ========== 1. 数据完整性 ========== */
sec('1. 数据完整性')
let items, monsters, bosses, seeds, strats, SPRITES, dex, acq, fishData
try {
  items = require('../data/items')
  monsters = require('../data/monsters')
  bosses = require('../data/bosses')
  seeds = require('../data/seeds')
  strats = require('../data/strategies')
  SPRITES = require('../data/spritemap')
  dex = require('../utils/dex')
  acq = require('../utils/acq')
  fishData = require('../data/fishing')
  ok('语法加载: items=' + items.length + ' monsters=' + monsters.length + ' bosses=' + bosses.length + ' seeds=' + seeds.length)
} catch (e) {
  fail('数据模块加载失败: ' + e.message)
}

const entities = [...(items || []), ...(monsters || []), ...(bosses || []), ...(seeds || [])]

// id 唯一性
if (items) {
  const ids = new Set()
  let dup = 0
  entities.forEach(e => { if (ids.has(e.id)) { dup++; console.log('  [DUP]', e.id) } ids.add(e.id) })
  dup === 0 ? ok('id 无重复') : fail('重复 id: ' + dup)
}

// 搜索冒烟
if (dex) {
  const probes = ['南瓜王', '火星', '雨云魔杖', '奥术花', 'ny', 'hp']
  const bad = probes.filter(kw => dex.search(kw).length === 0)
  bad.length ? fail('搜索无结果: ' + bad.join(', ')) : ok('搜索冒烟 ' + probes.length + ' 关键词全部命中')
  ok('dex.ALL 总条目: ' + (dex.ALL || []).length)
}

/* ========== 2. 精灵图映射完整性（双向） ========== */
sec('2. 精灵图映射完整性')
const spriteDir = 'assets/sprites'
const diskSprites = new Set()
fs.readdirSync(spriteDir).forEach(f => {
  const m = f.match(/^(.+)\.(png|gif)$/i)
  if (m) diskSprites.add(m[1])
})
const mapKeys = new Set(Object.keys(SPRITES))
const notOnDisk = [...mapKeys].filter(k => !diskSprites.has(k))
const orphans = [...diskSprites].filter(k => !mapKeys.has(k))
notOnDisk.length === 0 ? ok('映射 → 磁盘: ' + mapKeys.size + ' 张全部存在') : fail('映射指向缺失文件 ' + notOnDisk.length + ' 张: ' + notOnDisk.slice(0, 8).join(', '))
orphans.length === 0 ? ok('磁盘 → 映射: 无孤儿文件') : warn('磁盘存在未映射孤儿文件 ' + orphans.length + ' 张: ' + orphans.slice(0, 8).join(', '))

// 条目 art 命中
let miss = 0
const missList = []
entities.forEach(e => {
  if (!e.art) return
  if (!SPRITES[e.art]) { miss++; missList.push(e.id + '->' + e.art) }
})
miss === 0 ? ok('条目精灵图 100% 命中') : fail('条目精灵图未命中 ' + miss + ' 条: ' + missList.slice(0, 8).join(', '))

/* ========== 3. art 引用有效性（数据 + 页面模板） ========== */
sec('3. art 引用有效性')
const ARTS = (() => { try { return require('../utils/pixelart').ARTS } catch (e) { return {} } })()
const refs = new Set()
const refScan = (dir, exts) => {
  ;(function walk (d) {
    fs.readdirSync(d).forEach(f => {
      const p = path.join(d, f)
      if (fs.statSync(p).isDirectory()) return walk(p)
      if (!exts.includes(path.extname(f))) return
      const s = fs.readFileSync(p, 'utf8')
      let m
      const re1 = /(?<![a-zA-Z])art:\s*'([^']+)'/g
      while ((m = re1.exec(s))) refs.add(m[1])
      const re2 = /art-id:\s*"([^"]+)"/g
      while ((m = re2.exec(s))) refs.add(m[1])
    })
  })(dir)
}
refScan('data', ['.js'])
refScan('pages', ['.wxml', '.js'])
refScan('components', ['.wxml', '.js'])
const badRefs = [...refs].filter(k => !SPRITES[k] && !ARTS[k] && !k.startsWith('{{'))
badRefs.length === 0 ? ok('art 引用 ' + refs.size + ' 个全部有效（精灵图或像素画）') : warn('无效 art 引用 ' + badRefs.length + ' 个（将回退石块图标）: ' + badRefs.slice(0, 8).join(', '))

/* ========== 4. app.json 路由有效性 ========== */
sec('4. app.json 路由有效性')
let appJson
try {
  appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'))
  ok('app.json JSON 合法')
} catch (e) {
  fail('app.json 解析失败: ' + e.message)
}
if (appJson) {
  const pageSet = new Set()
  // 主包 + 分包页面统一校验
  const pkgList = [{ root: '', pages: appJson.pages || [] }].concat(appJson.subpackages || [])
  let pageFail = 0
  let pageTotal = 0
  pkgList.forEach(pkg => {
    (pkg.pages || []).forEach(pg => {
      pageTotal++
      const full = pkg.root ? pkg.root + '/' + pg : pg
      pageSet.add(full)
      ;['.js', '.wxml', '.json'].forEach(ext => {
        if (!fs.existsSync(full + ext)) { pageFail++; console.log('  [缺文件]', full + ext) }
      })
      if (!fs.existsSync(full + '.wxss')) warn('页面无样式文件: ' + full + '.wxss')
    })
  })
  pageFail === 0 ? ok('全部 ' + pageTotal + ' 个页面文件齐全（主包 ' + (appJson.pages || []).length + ' + 分包 ' + (pageTotal - (appJson.pages || []).length) + '）') : fail(pageFail + ' 个页面文件缺失')
  const tb = (appJson.tabBar && appJson.tabBar.list) || []
  const tbFail = tb.filter(t => !pageSet.has(t.pagePath))
  tbFail.length === 0 ? ok('tabBar ' + tb.length + ' 个页面均在路由表内') : fail('tabBar 引用未注册页面: ' + tbFail.map(t => t.pagePath).join(', '))
  // 自定义 tabBar 组件文件
  if (appJson.tabBar && appJson.tabBar.custom) {
    const cbOk = ['js', 'json', 'wxml', 'wxss'].every(ext => fs.existsSync('custom-tab-bar/index.' + ext))
    cbOk ? ok('custom-tab-bar 文件齐全') : fail('custom-tab-bar 文件缺失')
  }
  // 全项目相对引用可解析（含分包嵌套模块；分包内文件可跳出分包引用主包）
  let reqFail = 0, reqTotal = 0
  const checkFile = fp => {
    const src = fs.readFileSync(fp, 'utf8')
    const re = /require\('((?:\.+\/)[^']+)'\)/g
    let m
    while ((m = re.exec(src))) {
      reqTotal++
      const resolved = path.resolve(__dirname, '..', path.dirname(fp), m[1])
      if (!fs.existsSync(resolved) && !fs.existsSync(resolved + '.js') && !fs.existsSync(path.join(resolved, 'index.js'))) {
        reqFail++; console.log('  [引用失效]', fp.split(path.sep).join('/') + ' -> ' + m[1])
      }
    }
  }
  const roots = ['pages', 'components', 'utils', 'custom-tab-bar', 'data', 'app.js'].concat((appJson.subpackages || []).map(sp => sp.root))
  const walkReq = d => {
    fs.readdirSync(d).forEach(f => {
      const fp = path.join(d, f)
      if (fs.statSync(fp).isDirectory()) return walkReq(fp)
      if (!f.endsWith('.js')) return
      checkFile(fp)
    })
  }
  const walkReqSingle = fp => { if (fp.endsWith('.js')) checkFile(fp) }
  roots.forEach(rt => { const p = path.join(__dirname, '..', rt); if (!fs.existsSync(p)) return; if (fs.statSync(p).isFile()) walkReqSingle(p); else walkReq(p) })
  reqFail === 0 ? ok('全项目 ' + reqTotal + ' 处相对 require 全部可解析（含分包嵌套）') : fail(reqFail + ' 处相对引用失效（分包层级变化未适配）')
}

/* ========== 5. 存储 key 合法性 ========== */
sec('5. 存储 key 合法性')
let storeSrc
try { storeSrc = fs.readFileSync('utils/store.js', 'utf8') } catch (e) { storeSrc = '' }
const terrKeys = [...new Set((storeSrc.match(/terr_[a-z_0-9]+/g) || []))]
const badPrefix = terrKeys.filter(k => !/^terr_[a-z_0-9]+$/.test(k) || k.endsWith('_'))
terrKeys.length >= 16 && badPrefix.length === 0 ? ok('存储键 ' + terrKeys.length + ' 个，命名规范（terr_ 前缀）') : warn('存储键异常: ' + (badPrefix.join(', ') || '数量少于 16'))
const dupKeys = terrKeys.filter((k, i) => terrKeys.indexOf(k) !== i)
dupKeys.length === 0 ? ok('存储键无重复') : fail('存储键重复: ' + dupKeys.join(', '))
// 越过 store 直接操作 storage 的散落调用（pages/components 内不允许出现 terr_ 字面量）
let rogue = []
;['pages', 'components'].forEach(dir => {
  ;(function walk (d) {
    fs.readdirSync(d).forEach(f => {
      const p = path.join(d, f)
      if (fs.statSync(p).isDirectory()) return walk(p)
      if (!f.endsWith('.js')) return
      const s = fs.readFileSync(p, 'utf8')
      const found = s.match(/terr_[a-z_0-9]+/g)
      if (found) rogue.push(p + ': ' + found.join(', '))
    })
  })(dir)
})
rogue.length === 0 ? ok('页面/组件无绕过 store 的直接存储访问') : fail('发现绕过 store 的直接存储访问: ' + rogue.join(' | '))

/* ========== 6. 体积红线 ========== */
sec('6. 包体积红线')
let total = 0
const skipDirs = new Set(['.git', '.workbuddy', 'node_modules', 'scripts'])
;((appJson && appJson.subpackages) || []).forEach(sp => skipDirs.add(sp.root))
let packIgnore = []
try {
  const pc = JSON.parse(fs.readFileSync('project.config.json', 'utf8'))
  ;((pc.packOptions && pc.packOptions.ignore) || []).forEach(r => {
    if (r.type === 'folder') { skipDirs.add(r.value); return }
    if (r.type === 'regexp') packIgnore.push(new RegExp(r.value))
  })
} catch (e) { /* 配置缺失则忽略 */ }
  ;(function walk (d) {
    fs.readdirSync(d).forEach(f => {
      const p = path.join(d, f)
      if (fs.statSync(p).isDirectory()) {
        if (!skipDirs.has(f)) walk(p)
        return
      }
      if (packIgnore.some(re => re.test(p.replace(/^\.\//, '').replace(/\\/g, '/')))) return
      total += fs.statSync(p).size
    })
  })('.')
const kb = Math.round(total / 1024)
if (kb > 2048) fail('主包体积 ' + kb + 'KB，超过 2048KB 上限，无法上传！')
else if (kb > 1900) warn('主包体积 ' + kb + 'KB，接近 2048KB 上限（余量 ' + (2048 - kb) + 'KB），暂缓新增大资源')
else ok('主包体积 ' + kb + 'KB / 2048KB，余量 ' + (2048 - kb) + 'KB')
// 分包体积（独立 2MB 额度）
const pkgSizes = {}
;((appJson && appJson.subpackages) || []).forEach(sp => {
  let sz = 0
  ;(function w (d) {
    fs.readdirSync(d).forEach(f => {
      const fp = path.join(d, f)
      fs.statSync(fp).isDirectory() ? w(fp) : sz += fs.statSync(fp).size
    })
  })(sp.root)
  pkgSizes[sp.root] = Math.round(sz / 1024)
  if (Math.round(sz / 1024) > 2048) fail('分包 ' + sp.root + ' 体积 ' + Math.round(sz / 1024) + 'KB 超 2048KB')
})
Object.keys(pkgSizes).forEach(k => ok('分包 ' + k + ': ' + pkgSizes[k] + 'KB / 2048KB'))

/* ========== 汇总 ========== */
console.log('\n========== 检查结果 ==========')
oks.forEach(m => console.log('  [PASS] ' + m))
warns.forEach(m => console.log('  [WARN] ' + m))
fails.forEach(m => console.log('  [FAIL] ' + m))
console.log('------------------------------')
console.log('通过 ' + oks.length + ' | 警告 ' + warns.length + ' | 失败 ' + fails.length)
if (fails.length) {
  console.log('❌ 存在失败项，请修复后再上传')
  process.exit(1)
}
console.log(warns.length ? '⚠️ 有警告项，可上传但建议关注' : '✅ 全部通过，可以上传')
