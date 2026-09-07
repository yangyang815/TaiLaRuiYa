// 条目中文名核对：从 terraria.wiki.gg 英文页面拉取官方中文名（langlinks），与本地数据比对
// 用法：node scripts/verify-names.js            → 输出差异报告到 scripts/name-report.json
//       node scripts/verify-names.js --fix     → 按报告自动修正数据文件
const fs = require('fs')
const path = require('path')
const https = require('https')

const ROOT = path.join(__dirname, '..')
const FIX = process.argv.includes('--fix')

// 数据源清单
const SOURCES = [
  { file: 'data/items.js' },
  { file: 'data/monsters.js' },
  { file: 'data/bosses.js' },
  { file: 'utils/fishing.js', fishing: true }
]

function fetchJson (url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 TerraHandbook/1.0', 'Accept': 'application/json' } }, res => {
      let d = ''
      res.on('data', c => { d += c })
      res.on('end', () => { try { resolve(JSON.parse(d)) } catch (e) { reject(new Error('非JSON: ' + d.slice(0, 60))) } })
    }).on('error', reject)
  }).then(d => new Promise(r => setTimeout(() => r(d), 120)))
}

function collectEntities () {
  const out = []
  for (const src of SOURCES) {
    const mod = require(path.join(ROOT, src.file))
    let pools
    if (src.fishing) {
      const F = require(path.join(ROOT, 'data', 'fishing.js'))
      pools = [F.QUEST_FISH, F.FOOD_FISH, F.GEAR, F.BAITS, F.CRATES]
    } else if (Array.isArray(mod)) {
      pools = [mod]
    } else {
      pools = Object.values(mod).filter(Array.isArray)
    }
    pools.forEach(items => items.forEach(x => {
      if (x && x.en && x.name) out.push({ file: src.file, id: x.id, en: x.en, name: x.name })
    }))
  }
  return out
}

async function main () {
  const entities = collectEntities()
  console.log('待核对实体:', entities.length, '个')

  const uniq = [...new Set(entities.map(e => e.en))]
  console.log('唯一英文标题:', uniq.length, '个，分', Math.ceil(uniq.length / 50), '批查询')

  const zhName = {}
  const notFound = []
  for (let i = 0; i < uniq.length; i += 50) {
    const batch = uniq.slice(i, i + 50)
    const titles = batch.join('|')
    let d
    try {
      d = await fetchJson('https://terraria.wiki.gg/api.php?action=query&titles=' + encodeURIComponent(titles) +
        '&prop=langlinks&lllang=zh&lllimit=max&format=json&redirects=1')
    } catch (e) { console.log('批次失败(', i, '):', e.message); continue }
    const pages = d.query ? d.query.pages : {}
    const redirects = d.query && d.query.redirects ? d.query.redirects : []
    const titleMap = {}
    batch.forEach(t => { titleMap[t] = t })
    ;(redirects || []).forEach(r => { if (titleMap[r.from]) titleMap[r.to] = titleMap[r.from] })
    Object.values(pages).forEach(p => {
      const mapped = titleMap[p.title]
      if (!mapped) return
      if (p.langlinks && p.langlinks[0]) zhName[mapped] = p.langlinks[0]['*']
      else notFound.push(mapped)
    })
  }
  console.log('官方中文名获取成功:', Object.keys(zhName).length, '| 无 zh 页面:', notFound.length)

  // 消歧义过滤：同一个官方名对应多个实体 → 是导航页/消歧义页，不能当物品名
  const usage = {}
  entities.forEach(e => {
    const o = zhName[e.en]
    if (o) usage[o] = (usage[o] || 0) + 1
  })
  const mismatch = []
  const ok = []
  const skipped = []
  entities.forEach(e => {
    let official = zhName[e.en]
    if (!official) return
    // 去掉页面标题的消歧义后缀（游戏内名称不含它）
    const stripped = official.replace(/（[^）]*）$/, '')
    if (usage[official] > 1 || (stripped !== official && usage[stripped] > 1)) {
      skipped.push({ id: e.id, en: e.en, official, now: e.name })
      return
    }
    official = stripped
    if (official !== e.name) mismatch.push({ file: e.file, id: e.id, en: e.en, now: e.name, official })
    else ok.push(e.id)
  })
  console.log('名称一致:', ok.length, '| 不一致:', mismatch.length)
  mismatch.slice(0, 60).forEach(m => console.log('  [' + m.id + '] ' + m.en + ': "' + m.now + '" -> "' + m.official + '"'))

  console.log('消歧义页跳过:', skipped.length, '个（保留原名）')
  skipped.slice(0, 20).forEach(x => console.log('  跳过 [' + x.id + '] ' + x.en + ': "' + x.official + '"'))
  const report = { generated: new Date().toISOString(), mismatch, skipped, notFound, okCount: ok.length }
  fs.writeFileSync(path.join(__dirname, 'name-report.json'), JSON.stringify(report, null, 2))
  console.log('报告已写入 scripts/name-report.json')

  if (FIX) {
    if (!mismatch.length) { console.log('无需修正'); return }
    const byFile = {}
    mismatch.forEach(m => { (byFile[m.file] = byFile[m.file] || []).push(m) })
    for (const file of Object.keys(byFile)) {
      const fp = path.join(ROOT, file)
      let src = fs.readFileSync(fp, 'utf8')
      let fixed = 0
      const lines = src.split('\n')
      byFile[file].forEach(m => {
        const idRe = new RegExp("id:\\s*['\"]" + m.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "['\"]")
        for (let i = 0; i < lines.length; i++) {
          if (!idRe.test(lines[i])) continue
          if (lines[i].includes('name: "' + m.now + '"')) {
            lines[i] = lines[i].replace('name: "' + m.now + '"', 'name: "' + m.official + '"')
            fixed++
            break
          }
          if (lines[i].includes("name: '" + m.now + "'")) {
            lines[i] = lines[i].replace("name: '" + m.now + "'", "name: '" + m.official + "'")
            fixed++
            break
          }
        }
      })
      fs.writeFileSync(fp, lines.join('\n'))
      console.log(file, '修正', fixed, '处')
    }
    console.log('修正完成')
  }
}
main().catch(e => { console.error(e); process.exit(1) })
