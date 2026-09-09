// 全物品图鉴搜索：主包通过 require.async（分包异步化）懒加载两卷数据
// 首次调用触发分包下载（配合 preloadRule WiFi 预下载基本无感），结果在页面间共享缓存
const RCOL = { '-13': '#B57BFF', '-12': '#FF4CE0', '-1': '#B4B4B4', 0: '#FFFFFF', 1: '#9696FF', 2: '#96FF96', 3: '#FFC896', 4: '#FF9696', 5: '#FF96FF', 6: '#D2A0FF', 7: '#96FF0A', 8: '#FFFF32', 9: '#32FFFF', 10: '#FF3232' }
const RLAB = { '-13': '大师', '-12': '专家', '-1': '任务', 0: '白色', 1: '蓝色', 2: '绿色', 3: '橙色', 4: '浅红', 5: '粉色', 6: '浅紫', 7: '青柠', 8: '黄色', 9: '青色', 10: '红色' }

let loader = realLoad
let p = null

function realLoad () {
  try {
    return Promise.all([
      require.async('../pkg-cat-1/data/batch.js'),
      require.async('../pkg-cat-2/data/batch.js')
    ]).then(ms => {
      const out = []
      ms.forEach((m, i) => (m || []).forEach(x => {
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
    }).catch(() => [])
  } catch (e) {
    // 基础库过低不支持分包异步化等异常：静默降级为无结果
    return Promise.resolve([])
  }
}

function load () {
  if (!p) p = Promise.resolve(loader()).catch(() => [])
  return p
}

// 搜索全量图鉴（中文名/英文名）：前缀命中优先，最多 8 条
function search (kw) {
  const k = (kw || '').trim().toLowerCase()
  if (!k) return Promise.resolve([])
  return load().then(all => {
    const hits = all.filter(x =>
      (x.n || '').toLowerCase().indexOf(k) >= 0 || (x.en || '').toLowerCase().indexOf(k) >= 0)
    hits.sort((a, b) => {
      const ap = (a.n || '').toLowerCase().startsWith(k) || (a.en || '').toLowerCase().startsWith(k) ? 0 : 1
      const bp = (b.n || '').toLowerCase().startsWith(k) || (b.en || '').toLowerCase().startsWith(k) ? 0 : 1
      return ap - bp || (a.n || '').length - (b.n || '').length
    })
    return hits.slice(0, 8).map(x => ({
      n: x.n, en: x.en, f: x.f, vol: x.vol, c: x.c || '',
      d: x.d || '', dt: x.dt || '', sprite: x.sprite, rcol: x.rcol, rlab: x.rlab
    }))
  })
}

// 按 id 取完整条目（含说明/获得方式/用途等），供详情弹窗使用
function getById (f) {
  return load().then(all => all.find(x => x.f === f) || null)
}

// 按中文名精确查找（wiki 配料图标/详情用）
function findByName (name) {
  return load().then(all => all.find(x => x.n === name) || null)
}

module.exports = { load, search, getById, findByName, __useLoader: fn => { loader = fn; p = null } }
