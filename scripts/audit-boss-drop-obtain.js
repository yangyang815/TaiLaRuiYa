// 审计所有 Boss 掉落物品的获得方式是否与官方掉落源对应
// 逻辑：bosses.js 每条 drop → 解析出物品（精品 id 或 cat: 内部名）→
//   ① drops.json 里该物品的来源列表是否含此 Boss
//   ② 全量目录 ob 文本是否提到该 Boss 的中文名（或物品另有合法来源：合成/事件/宝箱）
const bosses = require('../data/bosses.js')
const D = require('./catalog-stage/drops.json')
const GTN = require('./catalog-stage/gametext-zh.json').NPCName || {}
const ITEMN = require('./catalog-stage/gametext-zh.json').ItemName || {}
const items = require('../data/items.js')

// 加载全量目录
let ALL = []
for (const [vol, f] of [['pkg-cat-1', 'data-v1'], ['pkg-cat-2', 'data-v2'], ['pkg-cat-3', 'data-v3']]) {
  ALL.push(...require('../' + vol + '/data/' + f + '.js'))
}
const byF = {}
ALL.forEach(x => { if (!byF[x.f]) byF[x.f] = x })

// Boss 中文名 + 英文内部名
const bossZh = {}
bosses.forEach(b => { bossZh[b.en] = b.name })

// 事件/宝箱类 Boss 的特殊来源关键词（ob 可能写事件名而非 Boss 名）
const sourceAlias = {
  'Flying Dutchman': ['海盗入侵', '飞盗船', '荷兰'],
  'Dreadnautilus': ['血月', '钓鱼'],
  'Dark Mage': ['撒旦', '黑暗魔法师'],
  'Ogre': ['撒旦', '食人魔'],
  'Betsy': ['撒旦', '双足翼龙'],
  'Mourning Wood': ['南瓜月', '哀木'],
  'Pumpking': ['南瓜月', '南瓜王'],
  'Everscream': ['霜月', '常绿'],
  'Santa-NK1': ['霜月', '圣诞坦克'],
  'Ice Queen': ['霜月', '冰雪女王'],
  'Martian Saucer': ['火星', '飞碟'],
  'Mechdusa': ['机械美杜莎', '美杜莎', '终极世界'],
}

const warns = []
for (const b of bosses) {
  for (const d of (b.drops || [])) {
    let en = null, catEntry = null
    if (d.id.startsWith('cat:')) {
      const f = d.id.slice(4)
      catEntry = byF[f]
      en = catEntry ? (catEntry.en || f) : (ITEMN[f] || f)
      var obText = catEntry ? (catEntry.ob || '') : '(全量目录无此条目!)'
    } else {
      // 精品条目 id
      const it = items.find(x => x.id === d.id)
      en = it ? it.en : d.name
      catEntry = it && byF[it.en] // 精品物品也可能在全量里有自己的条目
      var obText = it ? (it.obtain || '') : '(精品无此id!)'
      if (catEntry && catEntry.ob) obText += ' ‖全量:' + catEntry.ob
    }
    if (!en) { warns.push([b.name, d.name, '?', '无法解析内部名']); continue }

    // ① drops.json 来源校验
    const srcs = (D[en] || []).map(x => x.by)
    if (srcs.length && !srcs.includes(b.en)) {
      warns.push([b.name, d.name + '(' + en + ')', 'drops.json', '官方来源=[' + srcs.join(',') + '] 而非 ' + b.en])
    }
    // ② ob 文本是否提到 Boss
    const aliases = [b.name].concat(sourceAlias[b.en] || [])
    const npcZhName = GTN[b.en.replace(/ /g, '')] || ''
    if (npcZhName) aliases.push(npcZhName)
    const hit = aliases.some(a => obText.includes(a))
    // 掉落物可能有多种合法来源（合成、其他Boss、宝箱）；只要 drops.json 来源对，ob 不提及也可能合法
    if (!hit && srcs.length && srcs.every(s => s === b.en)) {
      warns.push([b.name, d.name + '(' + en + ')', 'ob文本', '该物品唯一来源是' + b.en + ' 但 ob=' + JSON.stringify(obText.slice(0, 60))])
    }
  }
}
console.log('告警数:', warns.length)
warns.forEach(w => console.log(' [' + w[0] + '] ' + w[1] + ' | ' + w[2] + ' | ' + w[3]))
