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
  // 补充翻译（图鉴页全量分类 chips 需要全中文）
  food: '食物', miscellaneous: '杂项', 'Ranged weapons': '远程武器', 'Melee weapons': '近战武器',
  'novelty items': '趣味物品', 'Novelty items': '趣味物品', bait: '鱼饵', potion: '药水',
  bar: '锭', ore: '矿石', gem: '宝石', coins: '钱币', sands: '沙', 'background object': '背景物体',
  key: '钥匙', consumable: '消耗品', 'healing items': '治疗物品', shield: '盾', Scope: '瞄准镜',
  'ammunition items': '弹药', 'Accessory items': '饰品', 'Furniture items': '家具',
  'summon weapons': '召唤武器', 'Summon weapons': '召唤武器', Whips: '鞭', souls: '灵魂',
  launchers: '发射器', Launchers: '发射器', Boomerangs: '回旋镖', boomerangs: '回旋镖',
  guns: '枪', Guns: '枪', '射弹近战': '投射近战',
  'potion ingredients': '药水配料', 'projectile melee': '投射近战',
  'Minion summon items': '召唤武器', Souls: '灵魂'
}
const DTZH = { melee: '近战', ranged: '远程', magic: '魔法', summon: '召唤', 'summon|+': '召唤', thrown: '投掷', Melee: '近战', Ranged: '远程', Magic: '魔法', Summon: '召唤', Thrown: '投掷', 'Melee attack': '近战', 'Ranged attack': '远程', 'Magic attack': '魔法', 'Summon attack': '召唤' }
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
  'Solidifier': '固化机', SteampunkerBoiler: '蒸汽锅炉', ByHand: '徒手', 'By Hand': '徒手',
  'Iron Anvil': '铁砧', 'Lead Anvil': '铅砧', Shimmer: '微光'
}
// 泛型桶（分类筛选时跳过，取更具体的分类）
const GENERIC_CAT = {
  'craftable items': 1, 'drop items': 1, 'Drop items': 1, 'plunder items': 1, 'Plunder items': 1,
  'loot items': 1, 'Loot items': 1, 'bag loot items': 1, 'Bag loot items': 1,
  'grab bag': 1, 'Treasure Bag loot items': 1, 'quest rewards': 1, 'Quest rewards': 1
}
// 细分类：listcat 链中第一个非泛型分类（全链皆泛型则回退首值）；'|' 为子类分隔（souls|Fright → souls）
function fineCat (r) {
  const chain = String(r.listcat || '').split('^').map(x => x.split('|')[0].trim()).filter(Boolean)
    .concat(String(r.type || '').split('^').map(x => x.split('|')[0].trim()).filter(Boolean))
  if (!chain.length) return '其他'
  for (let i = 0; i < chain.length; i++) {
    if (!GENERIC_CAT[chain[i]]) return CATZH[chain[i]] || chain[i]
  }
  return CATZH[chain[0]] || chain[0]
}
// 游戏价值（铜币）→ 中文售价串（售价 = 价值 / 5）
function priceZh (v) {
  if (!v || v <= 0) return ''
  const j = Math.floor(v / 10000), y = Math.floor(v % 10000 / 100), t = v % 100
  const p = []
  if (j) p.push(j + '金')
  if (y) p.push(y + '银')
  if (t || !p.length) p.push(t + '铜')
  return p.join('')
}

// wiki 购买价格文本 → 中文（10 SC / 2 Gold&#32;50 Silver / 20 Copper / 45 Defender Medals）
function priceTag (s) {
  if (!s) return ''
  let t = String(s).replace(/&#\d+;/g, ' ')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\bPC\b/gi, '铂金').replace(/\bGC\b/gi, '金').replace(/\bSC\b/gi, '银').replace(/\bCC\b/gi, '铜')
    .replace(/Defender Medals/gi, '防御者勋章')
    .replace(/Platinum/gi, '铂金').replace(/Gold/gi, '金').replace(/Silver/gi, '银').replace(/Copper/gi, '铜')
    .replace(/\s+/g, ' ').trim()
  return t
}

function normRare (raw) {  const str = String(raw == null ? '' : raw)
  if (/quest/i.test(str)) return -1
  const m = str.match(/(-?\d+)/)
  return m ? Number(m[1]) : null
}
const cleanWiki = s => String(s || '')
  .replace(/#i:[\w:]+/g, '')
  .replace(/<[^>]+>/g, '')
  .replace(/\[\[([^|\]]*\|)?([^\]]*)\]\]/g, '$2')
  .replace(/'''?/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&[a-z]+;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim()

// Cargo 缺失值：internalname 为 None/空的行（套装总览页）回退用英文名做 id
const validInternal = i => (i && i !== 'None' ? i : '')

async function harvest () {
  console.log('== 阶段 1：Cargo 全量采集 ==')
  const LIMIT = 500
  let all = []
  let offset = 0
  while (true) {
    const url = API + '?action=cargoquery&tables=Items&format=json&limit=' + LIMIT + '&offset=' + offset +
      '&fields=_pageTitle,name,internalname,imagefile,type,listcat,damage,damagetype,defense,rare,tooltip,hardmode,unobtainable,pick,axe,hammer,bait,bonus,usetime,knockback,tag,buy,hheal,mheal'
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
      usetime: cleanWiki(r.usetime), knockback: cleanWiki(r.knockback),
      tag: r.tag || '', buy: cleanWiki(r.buy), hheal: cleanWiki(r.hheal), mheal: cleanWiki(r.mheal)
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
  const stageDir = path.join(STAGE_DIR, 'sprites')
  fs.mkdirSync(stageDir, { recursive: true })
  // 全量下载（含精品图鉴已收录条目）：全物品图鉴必须是真全量，否则这些物品在图鉴/全局搜索里消失
  const targets = raw.slice()
  console.log('目标精灵图:', targets.length, '张')
  let ok = 0, skip = 0, fail = 0, idx = 0
  const CONC = 5
  async function worker () {
    while (idx < targets.length) {
      const r = targets[idx++]
      // 哈希必须基于净化后的 id（与 build 阶段查找路径一致）
      const safeId = (validInternal(r.internal) || r.en).replace(/[^A-Za-z0-9_]/g, '_')
      const h = require('crypto').createHash('md5').update(safeId).digest('hex').slice(0, 2)
      const dest = path.join(stageDir, h, safeId + '.png')
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
  const cat = r => fineCat(r)
  const groups = {}
  entries.forEach(r => {
    const c = cat(r)
    ;(groups[c] = groups[c] || []).push(r)
  })
  // 记录每卷的分类计数（供标题取主导分类）
  const bySize = Object.keys(groups).map(c => ({
    cat: c,
    size: groups[c].reduce((a, r) => a + 480 + r._spriteSize, 0),
    items: groups[c]
  })).sort((a, b) => b.size - a.size)
  const MAX = 1600 * 1024
  const volumes = []
  const volCatCount = []
  for (const g of bySize) {
    if (g.size <= MAX && volumes.length) {
      const last = volumes[volumes.length - 1]
      const lastSize = last.items.reduce((a, r) => a + 480 + r._spriteSize, 0)
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

// 圣物（大师模式 Boss 战利品）中文命名：zh wiki 未翻译，按 Boss 官方名硬编码
const RELIC_ZH = {
  'Betsy Relic': '贝蒂圣物', 'Brain of Cthulhu Relic': '克苏鲁之脑圣物', 'Dark Mage Relic': '黑暗魔法师圣物',
  'Deerclops Relic': '独眼巨鹿圣物', 'Destroyer Relic': '毁灭者圣物', 'Duke Fishron Relic': '猪龙鱼公爵圣物',
  'Eater of Worlds Relic': '世界吞噬怪圣物', 'Empress of Light Relic': '光之女皇圣物', 'Everscream Relic': '常绿尖叫怪圣物',
  'Eye of Cthulhu Relic': '克苏鲁之眼圣物', 'Flying Dutchman Relic': '飞翔荷兰人圣物', 'Golem Relic': '石巨人圣物',
  'Ice Queen Relic': '冰雪女皇圣物', 'King Slime Relic': '史莱姆王圣物', 'Lunatic Cultist Relic': '拜月教邪教徒圣物',
  'Martian Saucer Relic': '火星飞碟圣物', 'Moon Lord Relic': '月亮领主圣物', 'Mourning Wood Relic': '哀木圣物',
  'Ogre Relic': '食人魔圣物', 'Plantera Relic': '世纪之花圣物', 'Pumpking Relic': '南瓜王圣物',
  'Queen Bee Relic': '蜂后圣物', 'Queen Slime Relic': '史莱姆女王圣物', 'Santa-NK1 Relic': '圣诞坦克圣物',
  'Skeletron Prime Relic': '机械骷髅王圣物', 'Skeletron Relic': '骷髅王圣物', 'Twins Relic': '双子魔眼圣物',
  'Wall of Flesh Relic': '血肉墙圣物'
}

async function build () {
  console.log('== 阶段 4：组包生成 ==')
  const raw = readStage('raw.json', [])
  const zh = readStage('zh.json', {})
  const stageDir = path.join(STAGE_DIR, 'sprites')
  const h2 = s => require('crypto').createHash('md5').update(s).digest('hex').slice(0, 2)

  // 汇总可用条目（精灵图存在；不排除精品图鉴条目，保证全物品图鉴完整；按 safeId 去重）
  const entries = []
  const seenIds = new Set()
  raw.forEach(r => {
    const safeId = (validInternal(r.internal) || r.en).replace(/[^A-Za-z0-9_]/g, '_')
    if (seenIds.has(safeId)) return
    const sp = path.join(stageDir, h2(safeId), safeId + '.png')
    if (!fs.existsSync(sp)) return
    seenIds.add(safeId)
    entries.push({ ...r, _spritePath: sp, _spriteSize: fs.statSync(sp).size, _safeId: safeId })
  })
  console.log('可用条目:', entries.length)

  // 合并中文详情/获得/用途
  const zhdetail = readStage('zhdetail.json', { items: {}, byResult: {}, byIng: {} })
  const zhExtract = readStage('zhextract.json', {})
  // 游戏官方中文文本（GameText）：ItemName/NPCName 按 internalname
  let GT = {}, GTN = {}
  try { GT = JSON.parse(fs.readFileSync(path.join(STAGE_DIR, 'gametext-zh.json'), 'utf8')).ItemName || {} } catch (e) {}
  try { GTN = JSON.parse(fs.readFileSync(path.join(STAGE_DIR, 'gametext-zh.json'), 'utf8')).NPCName || {} } catch (e) {}
  // 游戏数值库（Iteminfo）：internalName → damage/defense/useTime/knockBack/value
  let II = null
  try {
    const s = fs.readFileSync(path.join(STAGE_DIR, 'iteminfo-zh.txt'), 'utf8')
    const i1 = s.indexOf('[=====['), i2 = s.indexOf(']=====')
    const blob = JSON.parse(s.slice(i1 + 7, i2))
    II = {}
    Object.keys(blob).forEach(id => { const it = blob[id]; if (it && it.internalName && !II[it.internalName]) II[it.internalName] = it })
  } catch (e) { console.log('  Iteminfo 解析失败（数值补全跳过）:', e.message); II = null }
  // 掉落来源表
  let DROPS = null
  try { DROPS = readStage('drops.json', {}) } catch (e) { DROPS = null }
  if (DROPS && !Object.keys(DROPS).length) DROPS = null
  // NPC/来源页中文名：精品怪物/Boss + 旗帜 tooltip 反推
  const npcZh = {}
  try { require('../data/monsters.js').forEach(m => { if (m.en && m.name) npcZh[m.en] = m.name }) } catch (e) {}
  try { require('../data/bosses.js').forEach(m => { if (m.en && m.name) npcZh[m.en] = m.name }) } catch (e) {}
  try { require('../utils/dex').ALL.filter(e => e.type === 'npc').forEach(n => { if (n.en && n.name) npcZh[n.en] = n.name }) } catch (e) {}
  Object.values(zhdetail.items).forEach(z => {
    if (z && z.t && /加成：/.test(z.t) && / Banner$/i.test(z.n || '')) {
      const m = z.t.match(/加成：([^（。；]+)/)
      if (m) npcZh[(z.n || '').replace(/ Banner$/i, '')] = m[1]
    }
  })
  // en 物品名 → internalname（供 GameText 查询）
  const nm2in = {}
  raw.forEach(x => { const iv = validInternal(x.internal); if (x.name && iv && !nm2in[x.name]) nm2in[x.name] = iv })
  let dexZhMap = null
  entries.forEach(r => {
    const vi = validInternal(r.internal)
    const zi = (vi && zhdetail.items[vi]) || zhdetail.items[r.en] || null
    const zhName = zh[r.page] || r.en
    // 配料翻译链：zh Items 表（internalname）→ 精品图鉴 → langlinks → 原文
    if (!dexZhMap) {
      dexZhMap = {}
      try { require('../data/items.js').forEach(x => { if (x.en && x.name && !dexZhMap[x.en]) dexZhMap[x.en] = x.name }) } catch (e) { /* 缺失跳过 */ }
    }
    const WILD = { 'Any Iron Bar': '任意铁锭（铁/铅）', 'Any Silver Bar': '任意银锭（银/钨）', 'Any Gold Bar': '任意金锭（金/铂）', 'Any Copper Bar': '任意铜锭（铜/锡）', 'Any Cobalt Bar': '任意钴锭（钴/钯金）', 'Any Mythril Bar': '任意秘银锭（秘银/山铜）', 'Any Adamantite Bar': '任意精金锭（精金/钛金）', 'Any Evil Bar': '任意邪恶金属锭', 'Any Wood': '任意木材', 'Any Stone Block': '任意石块', 'Any Torch': '火把', 'Any Balloon': '任意气球', 'Any Fruit': '任意水果', 'Any Bird': '任意鸟', 'Any Butterfly': '任意蝴蝶', 'Any Snail': '任意蜗牛', 'Any Firefly': '任意萤火虫', 'Any Pylon': '任意晶塔' }
    const zName = en => WILD[en] || (nm2in[en] && GT[nm2in[en]]) || (zhdetail.items[en] && /[\u4e00-\u9fa5]/.test(zhdetail.items[en].n) && zhdetail.items[en].n) || dexZhMap[en] || (zh[en] && /[\u4e00-\u9fa5]/.test(zh[en]) && zh[en]) || en
    // 配方查找：EN 键优先（Cargo byResult 键为 EN），回退 zh 名；不被 zi 门控
    const rec = zhdetail.byResult[r.en] || zhdetail.byResult[zhName] || null
    const use = zhdetail.byIng[r.en] || zhdetail.byIng[zhName] || null
    if (zi) {
      if (zi.t) r.tooltip = zi.t
      else if (zhExtract[zhName]) r.tooltip = zhExtract[zhName]
      if (zi.b) r._bonus = zi.b
      if (zi.lc) r.listcat = zi.lc
      if (zi.dt) r.damagetype = zi.dt
    }
    if (rec) r._ob = '合成：' + rec.map(rc => rc.i.map(slot => [...new Set(slot)].map(zName).join('/')).join(' + ') + (rc.st ? ' @ ' + (STATION[rc.st] || rc.st) : '')).join('；或 ').slice(0, 180)
    if (use && use.length) {
      const rs = [...new Set(use.map(zName))]
      r._use = rs.length ? '可用于合成：' + rs.slice(0, 3).join('、') + (rs.length > 3 ? ' 等 ' + rs.length + ' 种' : '') : ''
    } else r._use = ''
    // 获得方式：合成详情优先；否则按 wiki tag 分类（vendor/drop/loot/fished/plunder）组合生成
    if (!rec) {
      const tags = String(r.tag || '').split('^').map(x => x.trim()).filter(Boolean)
      const vendors = [...new Set(tags.filter(t => t.indexOf('vendor:') === 0).map(t => t.slice(7)))]
      const isDrop = tags.some(t => /^drop/i.test(t))
      const isLoot = tags.some(t => /loot/i.test(t))
      const isFish = tags.some(t => /fish/i.test(t))
      const isPlunder = tags.some(t => /plunder/i.test(t))
      const isCraft = tags.some(t => /craftable/i.test(t))
      const parts = []
      if (vendors.length) {
        const vn = [...new Set(vendors.map(v => npcZh[v] || (zh[v] && /[\u4e00-\u9fa5]/.test(zh[v]) && zh[v]) || v))].slice(0, 2)
        parts.push('由 ' + vn.join('、') + ' 出售' + (r.buy ? '（' + priceTag(r.buy) + '）' : ''))
      }
      if (isDrop) {
        if (DROPS && DROPS[r.en] && DROPS[r.en].length) {
          const dps = [...new Set(DROPS[r.en].map(d => npcZh[d.by] || (zh[d.by] && /[\u4e00-\u9fa5]/.test(zh[d.by]) && zh[d.by]) || d.by))]
          parts.push('由 ' + dps.slice(0, 3).join('、') + (dps.length > 3 ? ' 等 ' + dps.length + ' 种来源' : '') + ' 掉落')
        } else parts.push('击败敌怪掉落')
      }
      if (isLoot) parts.push(/bag loot/i.test(r.tag || '') ? '开启宝藏袋获得' : '开启宝箱获得')
      if (isFish) parts.push('钓鱼获得')
      if (isPlunder) parts.push('敲碎陶罐 / 探索获得')
      if (/quest/i.test(r.tag || '')) parts.push('完成任务获得')
      if (/^Music Box/i.test(r.en)) parts.push('用空白音乐盒录制获得')
      if (!parts.length && isCraft) parts.push('通过合成获得')
      if (!parts.length) parts.push('可于世界中探索、击败敌怪或参与事件获得')
      if (parts.length) r._ob = parts.join('；')
    }
    // 游戏数值补全（wiki Cargo 缺失时用 Iteminfo 官方数据）
    const ii = vi && II && II[vi]
    if (ii) {
      if (r.damage === undefined || r.damage === '') r.damage = ii.damage || ''
      if (!r.defense) r.defense = ii.defense || ''
      if (!r.usetime) r.usetime = ii.useTime || ''
      if (!r.knockback && ii.knockBack !== undefined) r.knockback = ii.knockBack
      if ((r.rare === undefined || r.rare === '') && ii.rare !== undefined) r.rare = ii.rare
      r._value = ii.value || 0
    }
    if (!zh[r.page]) r._zhmiss = true
    // 用户要求除英文名外全中文：无中文说明 → 置空（隐藏行，不展示英文）
    if (r.tooltip && !/[\u4e00-\u9fa5]/.test(r.tooltip)) r.tooltip = ''
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

  // 图鉴统一入口为主包 pages/catalog/catalog（读三卷数据），分包仅承载数据与精灵图
  volumes.forEach((vol, vi) => {
    const root = 'pkg-cat-' + (vi + 1)
    const pkgDir = path.join(ROOT, root)
    // 数据
    const dataDir = path.join(pkgDir, 'data')
    fs.mkdirSync(dataDir, { recursive: true })
    const compact = vol.items.map(r => {
      const rin = validInternal(r.internal)
      // 名称解析链：游戏官方译名（GameText）→ zh Items 表 → langlinks（page===en 直用 / banner 加“旗”）→ 圣物硬编码 → 英文
      const n = (rin && GT[rin]) ||
        (rin && zhdetail.items[rin] && /[\u4e00-\u9fa5]/.test(zhdetail.items[rin].n) && zhdetail.items[rin].n) ||
        (zh[r.page] && /[\u4e00-\u9fa5]/.test(zh[r.page]) && (r.page === r.en ? zh[r.page] : (/ Banner$/i.test(r.en) ? zh[r.page] + '旗' : ''))) ||
        RELIC_ZH[r.en] || r.en
      return {
      n, en: r.en, f: r._safeId,
      c: fineCat(r),
      d: r.damage, dt: DTZH[r.damagetype] || r.damagetype, df: r.defense, r: normRare(r.rare),
      u: r.usetime, k: r.knockback,
      t: String(r.tooltip || '').slice(0, 160), b: r._bonus || '', s: [r.pick && '镐力 ' + r.pick, r.axe && '斧力 ' + r.axe, r.hammer && '锤力 ' + r.hammer, r.bait && '鱼饵力 ' + r.bait, r.hheal && '恢复 ' + r.hheal + ' 生命', r.mheal && '恢复 ' + r.mheal + ' 魔力', r.bonus, r._value ? '售价 ' + priceZh(Math.round(r._value / 5)) : ''].filter(Boolean).join('；'),
      ob: r._ob || '', use: r._use || '', hm: r.hardmode ? 1 : 0
      }
    })
    fs.writeFileSync(path.join(dataDir, 'data-v' + (vi + 1) + '.js'),
      '// 自动生成：全物品图鉴数据卷 ' + (vi + 1) + '（勿手改）\nmodule.exports = ' + JSON.stringify(compact) + '\n')
    // 精灵图
    const assetDir = path.join(pkgDir, 'assets')
    fs.mkdirSync(assetDir, { recursive: true })
    vol.items.forEach(r => fs.copyFileSync(r._spritePath, path.join(assetDir, r._safeId + '.png')))
    // 兼容页（占位 + 旧链接重定向：开发者工具要求分包 pages 不能为空；旧分享链接指向本路径）
    const pageDir = path.join(pkgDir, 'pages', 'index')
    fs.mkdirSync(pageDir, { recursive: true })
    const stub = [
      '// 兼容页 + 数据装载器：同步 require 本卷数据写入 globalData（主包经 globalData 读取，100% 兼容所有环境）',
      "const batch = require('../../data/data-v" + (vi + 1) + ".js')",
      'Page({',
      '  data: { n: (batch || []).length },',
      '  onLoad (q) {',
      "    try { const app = getApp(); if (app) app.globalData['catVol' + " + (vi + 1) + "] = batch } catch (e) {}",
      '    if (q && q.loader) {',
      '      // 装载模式：由图鉴页导航而来，写完数据即返回',
      '      setTimeout(() => wx.navigateBack({ fail: () => wx.switchTab({ url: "/pages/codex/codex" }) }), 500)',
      '      return',
      '    }',
      '    const qs = q && Object.keys(q).length',
      "      ? '?' + Object.keys(q).map(k => k + '=' + encodeURIComponent(q[k])).join('&')",
      "      : ''",
      "    wx.redirectTo({ url: '/pages/catalog/catalog' + qs })",
      '  }',
      '})',
      ''
    ].join('\n')
    fs.writeFileSync(path.join(pageDir, 'index.js'), stub)
    fs.writeFileSync(path.join(pageDir, 'index.wxml'), '<view />\n')
    fs.writeFileSync(path.join(pageDir, 'index.json'), '{}\n')
    fs.writeFileSync(path.join(pageDir, 'index.wxss'), '/* 重定向兼容页 */\n')
    // blank 占位页：开发者工具预编译缓存会永久记住历史注册过的页面，所有页面路径必须长期保留（否则预览 ENOENT）
    const blankDir = path.join(pkgDir, 'pages', 'blank')
    fs.mkdirSync(blankDir, { recursive: true })
    fs.writeFileSync(path.join(blankDir, 'blank.js'), 'Page({})\n')
    fs.writeFileSync(path.join(blankDir, 'blank.wxml'),
      '<view style="padding:60rpx 40rpx;text-align:center;color:#8E7FA6;font-size:26rpx;">物品图鉴数据卷 ' + (vi + 1) + '（纯资源页，请从「全物品图鉴」入口访问）</view>\n')
    fs.writeFileSync(path.join(blankDir, 'blank.json'), '{}\n')
    fs.writeFileSync(path.join(blankDir, 'blank.wxss'), '/* 占位页 */\n')
    // app.json（数据卷；入口统一在主包 pages/catalog/catalog；历史页面路径永久保留）
    app.subpackages.push({ root, name: 'cat' + (vi + 1), pages: ['pages/index/index', 'pages/blank/blank'] })
    console.log('  卷 ' + (vi + 1) + ': ' + root + ' | ' + compact.length + ' 条 | ' + vol.cats.slice(0, 4).join('/'))
  })

  fs.writeFileSync(appJsonPath, JSON.stringify(app, null, 2) + '\n')
  // 卷数常量（运行时按此探测，避免探测不存在的卷）
  fs.writeFileSync(path.join(ROOT, 'utils', 'cat-vols.js'),
    '// 自动生成：全物品图鉴数据卷数（勿手改）\nmodule.exports = ' + volumes.length + '\n')
  console.log('app.json 已注册 ' + volumes.length + ' 个数据分包')
}

async function gametext () {
  console.log('== 阶段 2.7：游戏官方中文文本（Module:GameText/db-zh.json） ==')
  const dest = path.join(STAGE_DIR, 'gametext-zh.json')
  if (fs.existsSync(dest) && fs.statSync(dest).size > 100000) { console.log('已存在，跳过'); return }
  const d = await fetchJson('https://terraria.wiki.gg/zh/index.php?title=Module:GameText/db-zh.json&action=raw')
  fs.writeFileSync(dest, JSON.stringify(d))
  console.log('ItemName:', Object.keys(d.ItemName || {}).length, '| NPCName:', Object.keys(d.NPCName || {}).length)
}

async function iteminfo () {
  console.log('== 阶段 2.8：游戏数值库（Module:Iteminfo/data） ==')
  const dest = path.join(STAGE_DIR, 'iteminfo-zh.txt')
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000000) { console.log('已存在，跳过'); return }
  const raw = await new Promise((res, rej) => {
    https.get('https://terraria.wiki.gg/zh/index.php?title=Module:Iteminfo/data&action=raw', { headers: { 'User-Agent': 'Mozilla/5.0 TerraHandbook/1.0' } }, r => {
      if (r.statusCode !== 200) { r.resume(); return rej(new Error('HTTP ' + r.statusCode)) }
      let s = ''
      r.on('data', c => { s += c })
      r.on('end', () => res(s))
      r.on('error', rej)
    }).on('error', rej)
  })
  fs.writeFileSync(dest, raw)
  console.log('大小:', Math.round(raw.length / 1024) + 'KB')
}

async function drops () {
  console.log('== 阶段 2.9：掉落来源表（en Drops） ==')
  const out = {}
  let offset = 0
  while (true) {
    const url = 'https://terraria.wiki.gg/api.php?action=cargoquery&tables=Drops&format=json&limit=500&offset=' + offset + '&fields=item,_pageName,rate'
    let d
    try { d = await fetchJson(url) } catch (e) { console.log('重试 offset=' + offset); d = await fetchJson(url) }
    const rows = (d.cargoquery || []).map(x => x.title)
    rows.forEach(r => {
      if (!r.item || !r._pageName) return
      ;(out[r.item] = out[r.item] || []).push({ by: r._pageName, rate: r.rate || '' })
    })
    if (rows.length < 500) break
    offset += 500
  }
  writeStage('drops.json', out)
  console.log('有掉落来源的物品:', Object.keys(out).length)
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
  // EN Recipes 全表补缺（zh 表不含部分配方，如部分家具；EN 键为英文名，翻译在展示层做）
  let erecs = []
  offset = 0
  while (true) {
    const url = 'https://terraria.wiki.gg/api.php?action=cargoquery&tables=Recipes&format=json&limit=500&offset=' + offset +
      '&fields=result,ingredients,station'
    let d
    try { d = await fetchJson(url) } catch (e) { console.log('EN 重试 offset=' + offset); d = await fetchJson(url) }
    const rows = (d.cargoquery || []).map(x => x.title)
    erecs = erecs.concat(rows)
    if (rows.length < 500) break
    offset += 500
  }
  let added = 0
  erecs.forEach(r => {
    const res = cleanWiki(r.result)
    if (!res || byResult[res]) return // zh 已有的优先
    const st = cleanWiki(r.station)
    const slots = String(r.ingredients || '').split('^')
      .map(slot => slot.split('¦').map(x => x.trim()).filter(Boolean))
      .filter(slot => slot.length)
    if (!slots.length) return
    byResult[res] = [{ i: slots, st }]
    added++
    slots.forEach(slot => slot.forEach(ing => {
      byIng[ing] = byIng[ing] || []
      if (byIng[ing].length < 6 && byIng[ing].indexOf(res) < 0) byIng[ing].push(res)
    }))
  })
  writeStage('zhdetail.json', { items, byResult, byIng })
  console.log('中文条目:', Object.keys(items).length, '| 配方:', recs.length, '行 | EN 补缺:', added, '（总结果', Object.keys(byResult).length + '）')
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

const runners = { '--harvest': harvest, '--zh': zh, '--zhdata': zhdata, '--zhextract': zhextract, '--gametext': gametext, '--iteminfo': iteminfo, '--drops': drops, '--sprites': sprites, '--build': build }
if (runners[stage]) runners[stage]().catch(e => { console.error(e); process.exit(1) })
else console.log('用法: node scripts/build-catalog.js --harvest|--zh|--zhdata|--zhextract|--gametext|--iteminfo|--drops|--sprites|--build')
