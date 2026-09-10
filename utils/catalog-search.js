// 全物品图鉴搜索：逐卷渐进式加载（分包异步化 require.async）
// 设计目标：单卷失败/挂起不阻塞其它卷；每卷成功即落盘本地缓存，之后秒读
// 主包页面通过 require.async 跨分包读数据（分包异步化，基础库 ≥2.17.3）
const RCOL = { '-13': '#B57BFF', '-12': '#FF4CE0', '-1': '#B4B4B4', 0: '#FFFFFF', 1: '#9696FF', 2: '#96FF96', 3: '#FFC896', 4: '#FF9696', 5: '#FF96FF', 6: '#D2A0FF', 7: '#96FF0A', 8: '#FFFF32', 9: '#32FFFF', 10: '#FF3232' }
const RLAB = { '-13': '大师', '-12': '专家', '-1': '任务', 0: '白色', 1: '蓝色', 2: '绿色', 3: '橙色', 4: '浅红', 5: '粉色', 6: '浅紫', 7: '青柠', 8: '黄色', 9: '青色', 10: '红色' }

let loader = null
const hasWx = typeof wx !== 'undefined' && !!wx.getStorageSync

// 常用俗称 → 官方译名（搜索时同时匹配，提升命中率）
const ALIAS = {
  '地狱花': '火焰花',
  '黑曜石药水': '黑曜石皮药水',
  '红心': '生命水晶',
  '蓝心': '魔力水晶',
  '肉山': '血肉墙',
  '蜂王': '蜂后',
  '世界吞噬者': '世界吞噬怪',
  '克苏鲁之脑': '克苏鲁之脑'
}

// 最近一次分卷加载统计（诊断用）：v1..v4 = 各卷条数，-1 = 加载失败
let _lastStats = {}
function lastStats () { return _lastStats }

/* ---------- 单卷原始加载 ---------- */
function rawVol (i) {
  if (loader) {
    // 测试注入：从全量结果中筛出该卷
    return Promise.resolve(loader()).then(all => (all || []).filter(x => (x.vol || i) === i))
  }
  _lastStats = _lastStats || {}
  console.log('[图鉴] v' + i + ' require.async 发起')
  return new Promise(res => {
    try {
      require.async('../pkg-cat-' + i + '/data/batch.js')
        .then(m => {
          _lastStats['v' + i] = (m || []).length
          console.log('[图鉴] v' + i + ' 加载成功:', _lastStats['v' + i], '条')
          res(m || [])
        }, () => {
          _lastStats['v' + i] = -1
          console.log('[图鉴] v' + i + ' 加载失败(reject)')
          res([])
        })
    } catch (e) {
      _lastStats['v' + i] = -1
      console.log('[图鉴] v' + i + ' 加载异常:', e && e.message)
      res([])
    }
  })
}

// 单卷 12s 超时保护：挂起不再拖死整页
function volWithTimeout (i) {
  return Promise.race([
    rawVol(i),
    new Promise(res => setTimeout(() => {
      if (_lastStats) _lastStats['v' + i] = -1
      console.log('[图鉴] v' + i + ' 12s 超时，放弃等待')
      res([])
    }, 12000))
  ])
}

/* ---------- 每卷本地缓存 ---------- */
function saveVol (i, rows) {
  if (!hasWx) return
  try { wx.setStorageSync('terr_catv' + i, rows) } catch (e) { /* 存储满静默忽略 */ }
}
function loadVolStorage (i) {
  if (!hasWx) return []
  try {
    const v = wx.getStorageSync('terr_catv' + i)
    return v && v.length ? v : []
  } catch (e) { return [] }
}

/* ---------- 单卷加载：分包 → 失败回退该卷缓存（失败不缓存，允许重试） ---------- */
const volP = {}
function loadVol (i, force) {
  if (force) delete volP[i]
  if (!volP[i]) {
    volP[i] = volWithTimeout(i).then(m => {
      if (m && m.length) { saveVol(i, m); return m }
      delete volP[i]
      return loadVolStorage(i)
    })
  }
  return volP[i]
}
// 丢弃所有挂起/失败的卷加载（手动重试时强制重新发起）
function resetVols () { Object.keys(volP).forEach(k => { delete volP[k] }) }

/* ---------- 条目映射 ---------- */
function mapEntries (rows, vol) {
  const out = []
  ;(rows || []).forEach(x => {
    if (!x || !x.f) return
    const r = Number(x.r)
    out.push({
      ...x,
      vol,
      sprite: '/pkg-cat-' + vol + '/assets/' + x.f + '.png',
      rcol: RCOL[r] || '#FFFFFF',
      rlab: RLAB[r] || ''
    })
  })
  return out
}

/* ---------- 全量加载（等全部卷就绪；搜索/详情用） ---------- */
function load () {
  return Promise.all([1, 2, 3, 4].map(i => loadVol(i))).then(ms => {
    const out = []
    ms.forEach((m, i) => out.push(...mapEntries(m, i + 1)))
    return out
  })
}

/* ---------- 渐进式加载（图鉴页用）：三卷并行，各自就绪立即回调，互不阻塞 ---------- */
function loadProgressive (onPart) {
  return Promise.all([1, 2, 3, 4].map(i =>
    loadVol(i).then(rows => {
      if (rows && rows.length) {
        try { onPart(mapEntries(rows, i), i) } catch (e) { console.error('[图鉴] 上屏异常:', e && e.message) }
      }
    })
  ))
}

/* ---------- 搜索（中文名/英文名/俗称别名）：前缀命中优先；limit 可调 ---------- */
function search (kw, limit) {
  const k = (kw || '').trim().toLowerCase()
  if (!k) return Promise.resolve([])
  const max = limit || 8
  const terms = [k]
  const aliased = ALIAS[(kw || '').trim()]
  if (aliased) terms.push(aliased.toLowerCase())
  return load().then(all => {
    const inX = (x, t) => (x.n || '').toLowerCase().indexOf(t) >= 0 || (x.en || '').toLowerCase().indexOf(t) >= 0
    const hits = all.filter(x => terms.some(t => inX(x, t)))
    hits.sort((a, b) => {
      const ap = terms.some(t => ((a.n || '').toLowerCase().startsWith(t) || (a.en || '').toLowerCase().startsWith(t))) ? 0 : 1
      const bp = terms.some(t => ((b.n || '').toLowerCase().startsWith(t) || (b.en || '').toLowerCase().startsWith(t))) ? 0 : 1
      return ap - bp || (a.n || '').length - (b.n || '').length
    })
    return hits.slice(0, max).map(x => ({
      n: x.n, en: x.en, f: x.f, vol: x.vol, c: x.c || '',
      d: x.d || '', dt: x.dt || '', sprite: x.sprite, rcol: x.rcol, rlab: x.rlab
    }))
  })
}

// 命中总数（不限条数），供结果页显示"共 N 条"
function searchTotal (kw) {
  const k = (kw || '').trim().toLowerCase()
  if (!k) return Promise.resolve(0)
  const terms = [k]
  const aliased = ALIAS[(kw || '').trim()]
  if (aliased) terms.push(aliased.toLowerCase())
  return load().then(all => all.filter(x => terms.some(t =>
    (x.n || '').toLowerCase().indexOf(t) >= 0 || (x.en || '').toLowerCase().indexOf(t) >= 0)).length)
}

// 按 id 取完整条目（含说明/获得方式/用途等），供详情弹窗使用
function getById (f) {
  return load().then(all => all.find(x => x.f === f) || null)
}

// 按中文名精确查找（wiki 配料图标/详情用）
function findByName (name) {
  return load().then(all => all.find(x => x.n === name) || null)
}

module.exports = { load, loadVol, loadProgressive, resetVols, search, searchTotal, getById, findByName, lastStats, ALIAS, __useLoader: fn => { loader = fn } }
