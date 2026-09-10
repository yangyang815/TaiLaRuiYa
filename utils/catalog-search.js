// 全物品图鉴搜索：主包通过 require.async（分包异步化）懒加载两卷数据
// 首次调用触发分包下载（配合 preloadRule WiFi 预下载基本无感），结果在页面间共享缓存
const RCOL = { '-13': '#B57BFF', '-12': '#FF4CE0', '-1': '#B4B4B4', 0: '#FFFFFF', 1: '#9696FF', 2: '#96FF96', 3: '#FFC896', 4: '#FF9696', 5: '#FF96FF', 6: '#D2A0FF', 7: '#96FF0A', 8: '#FFFF32', 9: '#32FFFF', 10: '#FF3232' }
const RLAB = { '-13': '大师', '-12': '专家', '-1': '任务', 0: '白色', 1: '蓝色', 2: '绿色', 3: '橙色', 4: '浅红', 5: '粉色', 6: '浅紫', 7: '青柠', 8: '黄色', 9: '青色', 10: '红色' }

let loader = realLoad
let p = null

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

function realLoad () {
  // 动态适配卷数（缺卷静默跳过，require.async 失败不阻断其它卷）
  const vols = [1, 2, 3, 4]
  return Promise.all(vols.map(i =>
    new Promise(res => {
      try {
        require.async('../pkg-cat-' + i + '/data/batch.js').then(m => res(m || []), () => res([]))
      } catch (e) { res([]) }
    })
  )).then(ms => {
    const out = []
    ms.forEach((m, i) => (m || []).forEach(x => {
      if (!x || !x.f) return
      const r = Number(x.r)
      out.push({
        ...x,
        vol: i + 1,
        sprite: '/pkg-cat-' + (i + 1) + '/assets/' + x.f + '.png',
        rcol: RCOL[r] || '#FFFFFF',
        rlab: RLAB[r] || ''
      })
    }))
    return out
  })
}

function load () {
  if (!p) p = Promise.resolve(loader()).catch(() => [])
  return p
}

// 搜索全量图鉴（中文名/英文名/俗称别名）：前缀命中优先；limit 可调（默认 8，传大值查全量）
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

module.exports = { load, search, searchTotal, getById, findByName, __useLoader: fn => { loader = fn; p = null } }
