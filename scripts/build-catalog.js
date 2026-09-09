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
    const req = https.get(url, UA, res => {
      let d = ''
      res.on('data', c => { d += c })
      res.on('end', () => { try { resolve(JSON.parse(d)) } catch (e) { reject(new Error('非JSON: ' + d.slice(0, 60))) } })
    })
    req.on('error', reject)
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('请求超时')) })
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
// 中文映射词典（分类 / 伤害类型 / 制作站）
const CATZH = {
  'craftable items': '可合成物品', 'drop items': '掉落物品', 'Drop items': '掉落物品',
  'plunder items': '战利品', 'Plunder items': '战利品', 'loot items': '战利品', 'Loot items': '战利品',
  'bag loot items': '袋装战利品', 'Bag loot items': '袋装战利品', 'grab bag': '袋装奖励',
  furniture: '家具', vanity: '时装', armor: '盔甲', accessory: '饰品',
  'crafting material': '合成材料', 'storage items': '存储物品', 'Storage items': '存储物品',
  buffs: '增益物品', 'fished items': '钓获物品', 'Fished items': '钓获物品',
  'quest rewards': '任务奖励', 'Quest rewards': '任务奖励', 'developer items': '开发者物品',
  'Developer items': '开发者物品', 'unobtainable items': '未实装物品',
  paints: '涂料', dye: '染料', dyes: '染料', 'hair dye': '染发剂',
  seeds: '种子', tool: '工具', tools: '工具', walls: '墙', wall: '墙', block: '方块', brick: '砖',
  ammunition: '弹药', arrows: '箭', bullets: '子弹', rockets: '火箭', darts: '飞镖', flares: '照明弹',
  'Potion items': '药水', 'Potion ingredients': '药水配料', potions: '药水',
  'minion summon items': '召唤武器', 'sentry summon items': '哨塔召唤物',
  'mount summon': '坐骑召唤', 'item summon': '事件召唤物', 'boss summon': 'Boss 召唤物',
  'event summon': '事件召唤物', 'permanent booster': '永久增益',
  whips: '鞭', Yoyos: '悠悠球', yoyos: '悠悠球', Broadswords: '宽剑', broadswords: '宽剑',
  Shortswords: '短剑', shortswords: '短剑', Bows: '弓', bows: '弓', Repeaters: '连弩',
  Explosives: '爆炸物', explosives: '爆炸物', wands: '魔杖', Wands: '魔杖',
  'magic guns': '魔法枪', 'magic weapons': '魔法武器', 'Magic weapons': '魔法武器',
  spears: '矛', Spears: '矛', flails: '连枷', Flails: '连枷', chainsaws: '电锯', drills: '钻头',
  hammers: '锤', axes: '斧', hamaxes: '斧槌', pickaxes: '镐', 'projectile melee|+': '投射近战',
  'Projectile melee': '投射近战', 'Projectile melee|+': '投射近战',
  instruments: '乐器', Instruments: '乐器', 'minecart track items': '矿车轨道',
  'informational items': '信息物品', 'Informational items': '信息物品',
  'light source': '光源', 'light source items': '光源物品', 'Light source items': '光源物品',
  boots: '鞋', 'Crafting stations': '制作站', 'Crafting station items': '制作站',
  mechanism: '机械', 'Mechanism items': '机械物品', 'spell books': '法书',
  'weapon items': '武器', weapon: '武器', 'wall-piercing weapons': '穿墙武器',
  'Wall-piercing weapons': '穿墙武器', debuffs: '减益物品', 'Treasure Bag loot items': '宝藏袋战利品',
  '其他': '其他'
}
const DTZH = { melee: '近战', ranged: '远程', magic: '魔法', summon: '召唤', 'summon|+': '召唤', thrown: '投掷' }
const STATION = {
  'Work Bench': '工作台', Furnace: '熔炉', Anvil: '铁砧', 'Mythril Anvil': '秘银砧',
  'Adamantite Forge': '精金熔炉', Hellforge: '地狱熔炉', 'Demon Altar': '恶魔祭坛',
  'Crimson Altar': '猩红祭坛', Altar: '祭坛', 'Heavy Work Bench': '重型工作台',
  'Heavy Assembler': '重型装配器', 'Book Case': '书架', 'Crystal Ball': '水晶球',
  Loom: '织布机', 'Cooking Pot': '烹饪锅', Keg: '酒桶', Sawmill: '锯木机',
  'Imbuing Station': '灌注站', 'Dye Vat': '染缸', DyeVat: '染缸',
  "Tinkerer's Workshop": '工匠作坊', 'Water Source': '水源', Sink: '水槽', Honey: '蜂蜜',
  'Ice Machine': '冰雪机', 'Living Loom': '生命织布机', 'Sky Mill': '天空磨坊',
  'Ancient Manipulator': '远古操纵机', 'Blend-o-matic': '搅拌机', 'Meat Grinder': '绞肉机',
  'Solidifier': '固化机', SteampunkerBoiler: '蒸汽锅炉', ByHand: '徒手', 'By Hand': '徒手'
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
  const cat = r => {
    const raw = (r.listcat.split('^').find(Boolean) || r.type.split('^').find(Boolean) || '其他').trim()
    return CATZH[raw] || raw
  }
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

  // 合并中文详情/获得/用途
  const zhdetail = readStage('zhdetail.json', { items: {}, byResult: {}, byIng: {} })
  const zhExtract = readStage('zhextract.json', {})
  entries.forEach(r => {
    const zi = zhdetail.items[r.internal] || zhdetail.items[r.en] || null
    const zhName = zh[r.page] || r.en
    const zhByName = zhdetail.items && Object.keys(zhdetail.items).length ? null : null
    const zName = en => zh[en] || en
    if (zi) {
      if (zi.t) r.tooltip = zi.t
      else if (zhExtract[zhName]) r.tooltip = zhExtract[zhName]
      if (zi.b) r._bonus = zi.b
      if (zi.lc) r.listcat = zi.lc
      if (zi.dt) r.damagetype = zi.dt
      const rec = zhdetail.byResult[r.en]
      if (rec) r._ob = '合成：' + rec.map(rc => rc.i.map(slot => [...new Set(slot)].map(zName).join('/')).join(' + ') + (rc.st ? ' @ ' + (STATION[rc.st] || rc.st) : '')).join('；或 ').slice(0, 180)
      const use = zhdetail.byIng[r.en]
      if (use) r._use = '用于合成：' + use.map(zName).slice(0, 4).join('、') + (use.length > 4 ? ' 等 ' + use.length + ' 项' : '')
    }
    if (!r._ob) {
      const rec2 = zhdetail.byResult[zhName]
      if (rec2) r._ob = '合成：' + rec2.map(rc => rc.i.map(slot => [...new Set(slot)].map(zName).join('/')).join(' + ') + (rc.st ? ' @ ' + (STATION[rc.st] || rc.st) : '')).join('；或 ').slice(0, 180)
    }
    if (!r._use) {
      const use2 = zhdetail.byIng[zhName]
      if (use2) r._use = '用于合成：' + use2.map(zName).slice(0, 4).join('、') + (use2.length > 4 ? ' 等 ' + use2.length + ' 项' : '')
    }
    if (!zh[r.page]) r._zhmiss = true
  })

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
    return Object.entries(cc).sort((a, b) => b[1] - a[1]).filter(x => x[1] >= 2).slice(0, 2).map(x => x[0]).join(' / ') || '综合物品'
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
      c: (() => { const raw = (r.listcat.split('^').find(Boolean) || '其他').trim(); return CATZH[raw] || raw })(),
      d: r.damage, dt: DTZH[r.damagetype] || r.damagetype, df: r.defense, r: normRare(r.rare),
      u: r.usetime, k: r.knockback,
      t: String(r.tooltip || '').slice(0, 160), b: r._bonus || '', s: [r.pick && '镐力 ' + r.pick, r.axe && '斧力 ' + r.axe, r.hammer && '锤力 ' + r.hammer, r.bait && '鱼饵力 ' + r.bait, r.bonus].filter(Boolean).join('；'),
      ob: r._ob || '', use: r._use || '', hm: r.hardmode ? 1 : 0
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

async function zhdata () {
  console.log('== 阶段 2.5：中文 Items 全表 + 配方双向索引 ==')
  // 1) 中文 Items 全表（中文名/中文说明/中文分类/中文伤害类型）
  let zitems = []
  let offset = 0
  while (true) {
    const url = 'https://terraria.wiki.gg/zh/api.php?action=cargoquery&tables=Items&format=json&limit=500&offset=' + offset +
      '&fields=name,internalname,tooltip,bonus,listcat,damagetype'
    let d
    try { d = await fetchJson(url) } catch (e) { console.log('重试 offset=' + offset); d = await fetchJson(url) }
    const rows = (d.cargoquery || []).map(x => x.title)
    zitems = zitems.concat(rows)
    if (rows.length < 500) break
    offset += 500
  }
  const items = {}
  zitems.forEach(r => {
    if (r.internalname) items[r.internalname] = {
      n: cleanWiki(r.name), t: cleanWiki(r.tooltip), b: cleanWiki(r.bonus),
      lc: cleanWiki(r.listcat), dt: cleanWiki(r.damagetype)
    }
  })
  // 2) 中文配方全表 → 双向索引
  let recs = []
  offset = 0
  while (true) {
    const url = 'https://terraria.wiki.gg/zh/api.php?action=cargoquery&tables=Recipes&format=json&limit=500&offset=' + offset +
      '&fields=result,ingredients,station'
    let d
    try { d = await fetchJson(url) } catch (e) { console.log('重试 offset=' + offset); d = await fetchJson(url) }
    const rows = (d.cargoquery || []).map(x => x.title)
    recs = recs.concat(rows)
    if (rows.length < 500) break
    offset += 500
  }
  const byResult = {}
  const byIng = {}
  recs.forEach(r => {
    const res = cleanWiki(r.result)
    const st = cleanWiki(r.station)
    // 格式（zh wiki 实测）：^ 分隔"必备材料槽"，¦ 分隔槽内可替代选项（如 手机 = ¦PDA¦^¦Ice Mirror¦）
    const slots = String(r.ingredients || '').split('^')
      .map(slot => slot.split('¦').map(x => x.trim()).filter(Boolean))
      .filter(slot => slot.length)
    if (res && slots.length) {
      byResult[res] = byResult[res] || []
      if (byResult[res].length < 3) byResult[res].push({ i: slots, st })
      slots.forEach(slot => slot.forEach(ing => {
        byIng[ing] = byIng[ing] || []
        if (byIng[ing].length < 6 && byIng[ing].indexOf(res) < 0) byIng[ing].push(res)
      }))
    }
  })
  writeStage('zhdetail.json', { items, byResult, byIng })
  console.log('中文条目:', Object.keys(items).length, '| 配方:', recs.length, '行')
}

const stage = process.argv[2] || ''
async function zhextract () {
  console.log('== 阶段 2.7：中文页面摘要提取 ==')
  const cached = readStage('zhextract.json', {})
  // 目标：有中文名的条目（zh langlinks 映射的 zh 页标题）
  const raw = readStage('raw.json', [])
  const zh = readStage('zh.json', {})
  const titles = [...new Set(raw.map(r => zh[r.page]).filter(Boolean))]
  const todo = titles.filter(t => !(t in cached))
  console.log('有中文页的条目:', titles.length, '| 已提取:', titles.length - todo.length, '| 待提取:', todo.length)
  // TextExtracts 每请求最多 20 页
  for (let i = 0; i < todo.length; i += 20) {
    const batch = todo.slice(i, i + 20)
    let d
    try {
      d = await fetchJson('https://terraria.wiki.gg/zh/api.php?action=query&format=json&prop=extracts&exintro=1&explaintext=1&exlimit=20&titles=' + encodeURIComponent(batch.join('|')) + '&redirects=1')
    } catch (e) { console.log('  批次失败(' + i + '):', e.message); continue }
    const redirects = (d.query && d.query.redirects) || []
    const titleMap = {}
    batch.forEach(t => { titleMap[t] = t })
    redirects.forEach(r => { if (titleMap[r.from]) titleMap[r.to] = titleMap[r.from] })
    Object.values(d.query.pages || {}).forEach(p => {
      const mapped = titleMap[p.title]
      if (!mapped) return
      const ext = (p.extract || '').replace(/\s+/g, ' ').trim()
      cached[mapped] = ext.slice(0, 200)
    })
    if ((i / 20) % 20 === 0) console.log('  进度:', Math.min(i + 20, todo.length), '/', todo.length)
    writeStage('zhextract.json', cached)
  }
  writeStage('zhextract.json', cached)
  const got = Object.values(cached).filter(Boolean).length
  console.log('中文摘要提取完成:', got, '/', titles.length)
}

const runners = { '--harvest': harvest, '--zh': zh, '--zhdata': zhdata, '--zhextract': zhextract, '--sprites': sprites, '--build': build }
if (runners[stage]) runners[stage]().catch(e => { console.error(e); process.exit(1) })
else console.log('用法: node scripts/build-catalog.js --harvest|--zh|--sprites|--build')
