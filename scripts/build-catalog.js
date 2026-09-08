// 全物品图鉴构建管道（对照 terraria.wiki.gg Cargo 表，全量 6336 条）
// 阶段：--harvest 采集结构化数据 | --zh 官方中文名 | --sprites 下载精灵图 | --build 组包生成
// 全部阶段可断点续跑
const fs = require('fs')
const path = require('path')
const https = require('https')

const ROOT = path.join(__dirname, '..')
const STAGE_DIR = path.join(__dirname, 'catalog-stage')
const API = 'https://terraria.wiki.gg/api.php'
const IMG = 'https://terraria.wiki.gg/images/'
const UA = { headers: { 'User-Agent': 'Mozilla/5.0 TerraHandbook/1.0', 'Accept': 'application/json' } }

function fetchJson (url) {
  return new Promise((resolve, reject) => {
    https.get(url, UA, res => {
      let d = ''
      res.on('data', c => { d += c })
      res.on('end', () => { try { resolve(JSON.parse(d)) } catch (e) { reject(new Error('非JSON: ' + d.slice(0, 60))) } })
    }).on('error', reject)
  }).then(d => new Promise(r => setTimeout(() => r(d), 120)))
}
function sleep (ms) { return new Promise(r => setTimeout(r, ms)) }
function download (url, dest) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 TerraHandbook/1.0' } }, res => {
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)) }
      const ws = fs.createWriteStream(dest)
      res.pipe(ws)
      ws.on('finish', () => ws.close(resolve))
      ws.on('error', reject)
    })
    req.on('error', reject)
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')) })
  })
}
function readStage (name, def) {
  const p = path.join(STAGE_DIR, name)
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'))
  return def
}
function writeStage (name, data) {
  fs.mkdirSync(STAGE_DIR, { recursive: true })
  fs.writeFileSync(path.join(STAGE_DIR, name), JSON.stringify(data))
}
function normRare (raw) {
  const str = String(raw == null ? '' : raw)
  if (/quest/i.test(str)) return -1
  const m = str.match(/(-?\d+)/)
  return m ? Number(m[1]) : null
}
const cleanWiki = s => String(s || '')
  .replace(/<[^>]+>/g, '')
  .replace(/\[\[([^|\]]*\|)?([^\]]*)\]\]/g, '$2')
  .replace(/'''?/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&[a-z]+;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim()

async function harvest () {
  console.log('== 阶段 1：Cargo 全量采集 ==')
  const LIMIT = 500
  let all = []
  let offset = 0
  while (true) {
    const url = API + '?action=cargoquery&tables=Items&format=json&limit=' + LIMIT + '&offset=' + offset +
      '&fields=_pageTitle,name,internalname,imagefile,type,listcat,damage,damagetype,defense,rare,tooltip,hardmode,unobtainable,pick,axe,hammer,bait,bonus,usetime,knockback'
    let d
    try { d = await fetchJson(url) } catch (e) { console.log('批次失败(offset=' + offset + ')，重试一次'); d = await fetchJson(url) }
    const rows = ((d.cargoquery || []).map(x => x.title))
    all = all.concat(rows)
    console.log('  offset ' + offset + ' -> ' + rows.length + ' 行（累计 ' + all.length + '）')
    if (rows.length < LIMIT) break
    offset += LIMIT
  }
  // 过滤：无名称 / unobtainable
  const list = all.filter(r => r.name && r._pageTitle && r.unobtainable !== 'true')
    .map(r => ({
      en: r.name,
      page: r._pageTitle,
      internal: r.internalname || '',
      imagefile: r.imagefile || (r.name + '.png'),
      type: r.type || '',
      listcat: r.listcat || '',
      damage: cleanWiki(r.damage),
      damagetype: r.damagetype || '',
      defense: cleanWiki(r.defense),
      rare: r.rare || '',
      tooltip: cleanWiki(r.tooltip).slice(0, 120),
      hardmode: r.hardmode === 'true',
      pick: cleanWiki(r.pick), axe: cleanWiki(r.axe), hammer: cleanWiki(r.hammer),
      bait: r.bait || '', bonus: cleanWiki(r.bonus).slice(0, 80),
      usetime: cleanWiki(r.usetime), knockback: cleanWiki(r.knockback)
    }))
  writeStage('raw.json', list)
  console.log('采集完成:', list.length, '条（已剔除无名称/不可获得）')
}

async function zh () {
  console.log('== 阶段 2：官方中文名（langlinks） ==')
  const raw = readStage('raw.json', [])
  const titles = [...new Set(raw.map(r => r.page))]
  const cached = readStage('zh.json', {})
  const todo = titles.filter(t => !(t in cached))
  console.log('标题:', titles.length, '| 已缓存:', titles.length - todo.length, '| 待查:', todo.length)
  for (let i = 0; i < todo.length; i += 50) {
    const batch = todo.slice(i, i + 50)
    let d
    try {
      d = await fetchJson(API + '?action=query&titles=' + encodeURIComponent(batch.join('|')) +
        '&prop=langlinks&lllang=zh&lllimit=max&format=json&redirects=1')
    } catch (e) { console.log('  批次失败(' + i + '):', e.message); continue }
    const redirects = (d.query && d.query.redirects) || []
    const titleMap = {}
    batch.forEach(t => { titleMap[t] = t })
    redirects.forEach(r => { if (titleMap[r.from]) titleMap[r.to] = titleMap[r.from] })
    Object.values(d.query.pages).forEach(p => {
      const mapped = titleMap[p.title]
      if (!mapped) return
      if (p.langlinks && p.langlinks[0]) cached[mapped] = p.langlinks[0]['*']
      else if (p.missing !== undefined) cached[mapped] = ''
    })
    if ((i / 50) % 10 === 0) console.log('  进度:', Math.min(i + 50, todo.length), '/', todo.length)
    writeStage('zh.json', cached)
  }
  writeStage('zh.json', cached)
  const named = Object.values(cached).filter(Boolean).length
  console.log('中文名获取完成:', named, '/', titles.length)
}

async function sprites () {
  console.log('== 阶段 3：精灵图下载（可断点续跑） ==')
  const raw = readStage('raw.json', [])
  const zh = readStage('zh.json', {})
  const existing = new Set(require(path.join(ROOT, 'data', 'items')).map(i => (i.en || '').toLowerCase()))
  const stageDir = path.join(STAGE_DIR, 'sprites')
  fs.mkdirSync(stageDir, { recursive: true })
  // 目录扁平哈希避免单目录上万文件
  const targets = raw.filter(r => !existing.has(r.en.toLowerCase()))
  console.log('目标精灵图:', targets.length, '张（跳过已收录', raw.length - targets.length, '条）')
  let ok = 0, skip = 0, fail = 0, idx = 0
  const CONC = 5
  async function worker () {
    while (idx < targets.length) {
      const r = targets[idx++]
      const safeId = r.internal || r.en
      const h = require('crypto').createHash('md5').update(safeId).digest('hex').slice(0, 2)
      const dest = path.join(stageDir, h, safeId.replace(/[\\/:"*?<>|]/g, '_') + '.png')
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      if (fs.existsSync(dest)) { ok++; continue }
      try {
        // wiki.gg 规则：空格必须转下划线（%20 会 404），其余字符正常编码
        const url = IMG + encodeURIComponent(r.imagefile.replace(/ /g, '_'))
        await download(url, dest)
        ok++
      } catch (e) {
        fail++
        if (fail < 15) console.log('  下载失败:', r.en, e.message)
      }
      await sleep(40)
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker))
  console.log('下载完成: 成功 ' + ok + ' | 失败 ' + fail + '（失败条目不进入图鉴）')
}

function packVolumes (entries) {
  // 按主分类聚合 → 贪心装箱（每卷 ≤1.6MB，含数据估算 + 精灵图实测）
  const cat = r => (r.listcat.split('^').find(Boolean) || r.type.split('^').find(Boolean) || '其他').trim()
  const groups = {}
  entries.forEach(r => {
    const c = cat(r)
    ;(groups[c] = groups[c] || []).push(r)
  })
  // 记录每卷的分类计数（供标题取主导分类）
  const bySize = Object.keys(groups).map(c => ({
    cat: c,
    size: groups[c].reduce((a, r) => a + 260 + r._spriteSize, 0),
    items: groups[c]
  })).sort((a, b) => b.size - a.size)
  const MAX = 1600 * 1024
  const volumes = []
  const volCatCount = []
  for (const g of bySize) {
    if (g.size <= MAX && volumes.length) {
      const last = volumes[volumes.length - 1]
      const lastSize = last.items.reduce((a, r) => a + 260 + r._spriteSize, 0)
      if (lastSize + g.size <= MAX) {
        last.items = last.items.concat(g.items)
        last.cats.push(g.cat)
        volCatCount[volumes.length - 1] = volCatCount[volumes.length - 1] || {}
        volCatCount[volumes.length - 1][g.cat] = (volCatCount[volumes.length - 1][g.cat] || 0) + g.items.length
        continue
      }
    }
    if (g.size <= MAX) {
      volumes.push({ cats: [g.cat], items: g.items.slice() })
      volCatCount.push({ [g.cat]: g.items.length })
      continue
    }
    // 单分类超限 → 切片
    let chunk = []
    let sz = 0
    g.items.forEach(r => {
      const s = 260 + r._spriteSize
      if (sz + s > MAX && chunk.length) {
        volumes.push({ cats: [g.cat], items: chunk })
        volCatCount.push({ [g.cat]: chunk.length })
        chunk = []; sz = 0
      }
      chunk.push(r); sz += s
    })
    if (chunk.length) {
      volumes.push({ cats: [g.cat], items: chunk })
      volCatCount.push({ [g.cat]: chunk.length })
    }
  }
  return { volumes, groups, volCatCount }
}

async function build () {
  console.log('== 阶段 4：组包生成 ==')
  const raw = readStage('raw.json', [])
  const zh = readStage('zh.json', {})
  const existing = new Set(require(path.join(ROOT, 'data', 'items')).map(i => (i.en || '').toLowerCase()))
  const stageDir = path.join(STAGE_DIR, 'sprites')
  const h2 = s => require('crypto').createHash('md5').update(s).digest('hex').slice(0, 2)

  // 汇总可用条目（精灵图存在）
  const entries = []
  raw.forEach(r => {
    if (existing.has(r.en.toLowerCase())) return
    const safeId = (r.internal || r.en).replace(/[\\/:"*?<>|]/g, '_')
    const sp = path.join(stageDir, h2(safeId), safeId + '.png')
    if (!fs.existsSync(sp)) return
    entries.push({ ...r, _spritePath: sp, _spriteSize: fs.statSync(sp).size, _safeId: safeId })
  })
  console.log('可用条目:', entries.length)

  const { volumes, volCatCount } = packVolumes(entries)
  console.log('分卷数:', volumes.length)

  // 清理旧 catalog 包
  for (const d of fs.readdirSync(ROOT)) {
    if (d.startsWith('pkg-cat-')) fs.rmSync(path.join(ROOT, d), { recursive: true, force: true })
  }

  // 生成各卷
  const appJsonPath = path.join(ROOT, 'app.json')
  const app = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'))
  app.subpackages = (app.subpackages || []).filter(sp => !sp.root.startsWith('pkg-cat-'))

  const PAGE_JS = fs.readFileSync(path.join(__dirname, 'catalog-page.js.txt'), 'utf8')
  const PAGE_WXML = fs.readFileSync(path.join(__dirname, 'catalog-page.wxml.txt'), 'utf8')
  const PAGE_WXSS = fs.readFileSync(path.join(__dirname, 'catalog-page.wxss.txt'), 'utf8')
  const PAGE_JSON = JSON.stringify({ usingComponents: {}, navigationBarTitleText: '全物品图鉴' })

  const topCats = vi => {
    const cc = volCatCount[vi] || {}
    return Object.entries(cc).sort((a, b) => b[1] - a[1]).slice(0, 2).map(x => x[0]).join(' / ') || '综合'
  }
  const navList = volumes.map((v, i) => ({ root: 'pkg-cat-' + (i + 1), vol: i + 1, cats: topCats(i) }))
  volumes.forEach((vol, vi) => {
    const root = 'pkg-cat-' + (vi + 1)
    const pkgDir = path.join(ROOT, root)
    // 数据
    const dataDir = path.join(pkgDir, 'data')
    fs.mkdirSync(dataDir, { recursive: true })
    const compact = vol.items.map(r => ({
      n: zh[r.page] || r.en, en: r.en, f: r._safeId,
      c: (r.listcat.split('^').find(Boolean) || '其他').trim(),
      d: r.damage, dt: r.damagetype, df: r.defense, r: normRare(r.rare),
      u: r.usetime, k: r.knockback,
      t: r.tooltip, s: [r.pick && '镐力 ' + r.pick, r.axe && '斧力 ' + r.axe, r.hammer && '锤力 ' + r.hammer, r.bait && '鱼饵力 ' + r.bait, r.bonus].filter(Boolean).join('；'),
      hm: r.hardmode ? 1 : 0
    }))
    fs.writeFileSync(path.join(dataDir, 'batch.js'),
      '// 自动生成：全物品图鉴数据卷 ' + (vi + 1) + '（勿手改）\nmodule.exports = ' + JSON.stringify(compact) + '\n')
    // 精灵图
    const assetDir = path.join(pkgDir, 'assets')
    fs.mkdirSync(assetDir, { recursive: true })
    vol.items.forEach(r => fs.copyFileSync(r._spritePath, path.join(assetDir, r._safeId + '.png')))
    // 页面
    const pageDir = path.join(pkgDir, 'pages', 'index')
    fs.mkdirSync(pageDir, { recursive: true })
    const cats = topCats(vi)
    fs.writeFileSync(path.join(pageDir, 'index.js'),
      PAGE_JS.replace(/__VOL__/g, String(vi + 1)).replace(/__CATS__/g, cats).replace(/__TOTAL__/g, String(compact.length))
        .replace('__NAV__', JSON.stringify(navList)).replace('__ROOT__', root))
    fs.writeFileSync(path.join(pageDir, 'index.wxml'), PAGE_WXML)
    fs.writeFileSync(path.join(pageDir, 'index.wxss'), PAGE_WXSS)
    fs.writeFileSync(path.join(pageDir, 'index.json'), PAGE_JSON)
    // app.json
    app.subpackages.push({ root, name: 'cat' + (vi + 1), pages: ['pages/index/index'] })
    console.log('  卷 ' + (vi + 1) + ': ' + root + ' | ' + compact.length + ' 条 | ' + vol.cats.join('/'))
  })

  fs.writeFileSync(appJsonPath, JSON.stringify(app, null, 2) + '\n')
  console.log('app.json 已注册 ' + volumes.length + ' 个数据分包')
}

const stage = process.argv[2] || ''
const runners = { '--harvest': harvest, '--zh': zh, '--sprites': sprites, '--build': build }
if (runners[stage]) runners[stage]().catch(e => { console.error(e); process.exit(1) })
else console.log('用法: node scripts/build-catalog.js --harvest|--zh|--sprites|--build')
