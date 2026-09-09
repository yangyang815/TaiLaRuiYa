// 全物品图鉴搜索：主包通过 require.async（分包异步化）懒加载两卷数据
// 首次调用触发分包下载（配合 preloadRule WiFi 预下载基本无感），结果在页面间共享缓存
let loader = realLoad
let p = null

function realLoad () {
  try {
    return Promise.all([
      require.async('../pkg-cat-1/data/batch.js'),
      require.async('../pkg-cat-2/data/batch.js')
    ]).then(ms => {
      const out = []
      ms.forEach((m, i) => (m || []).forEach(x => out.push({ ...x, vol: i + 1 })))
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

// 搜索全量图鉴（中文名 / 英文名），返回 Promise<hits[]>
function search (kw) {
  const k = (kw || '').trim().toLowerCase()
  if (!k) return Promise.resolve([])
  return load().then(all => all
    .filter(x => (x.n || '').toLowerCase().indexOf(k) >= 0 || (x.en || '').toLowerCase().indexOf(k) >= 0)
    .slice(0, 6)
    .map(x => ({ n: x.n, en: x.en, f: x.f, vol: x.vol, c: x.c || '', d: x.d || '' })))
}

module.exports = { load, search, __useLoader: fn => { loader = fn; p = null } }
