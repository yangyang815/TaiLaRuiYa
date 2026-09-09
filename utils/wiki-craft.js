// wiki 配方递归合成树：纯逻辑，无 wx 依赖（可无头测试）
// data = pkg-recipe/data/recipes-wiki.js 的导出 { zh, rec, ico, dexArt, obt }

// 把整包数据加工成带展示信息的索引
function buildIndex (data) {
  const d = data || {}
  return {
    zh: d.zh || {},
    rec: d.rec || {},
    ico: d.ico || {},
    dexArt: d.dexArt || {},
    obt: d.obt || {}
  }
}

// 节点图标：cat 卷精灵图（含 f/vol 供详情跳转）→ 精品 artId → null
function iconOf (idx, en) {
  const ic = idx.ico[en]
  if (ic) return { sprite: '/pkg-cat-' + ic[1] + '/assets/' + ic[0] + '.png', f: ic[0], vol: ic[1] }
  if (idx.dexArt[en]) return { artId: idx.dexArt[en] }
  return null
}

// 叶子/任意节点的获取方式文本
function obtOf (idx, en) {
  return idx.obt[en] || ''
}

// 槽选项展示名（可替代项用 / 连接）
function slotLabel (idx, slot) {
  return (slot || []).map(a => idx.zh[a] || a).join(' / ')
}

// 槽内第一个可继续合成的选项（展开用）
function craftableAlt (idx, slot) {
  return (slot || []).find(a => !!idx.rec[a]) || null
}

/**
 * 生成树形行数组（配合展开状态集合渲染）
 * idx: buildIndex 产物
 * rootEn: 目标 EN 名
 * openSet: Set<key> 已展开节点（key 为路径唯一键）
 * 返回行：{ key, depth, label, en, expandable, open, cyclic, icon, station, obt }
 */
function rows (idx, rootEn, openSet, variantIdx) {
  const out = []
  const seen = openSet || new Set()
  const rootRec = idx.rec[rootEn]
  if (!rootRec || !rootRec.length) return out
  const v = rootRec[Math.min(variantIdx || 0, rootRec.length - 1)]

  const walk = (en, depth, path, keyPrefix) => {
    if (depth > 12) return // 深度保险
    const rec = idx.rec[en]
    const v2 = rec && rec[0]
    if (!v2) return
    ;(v2.i || []).forEach((slot, si) => {
      const key = keyPrefix + '/' + si
      const alt = craftableAlt(idx, slot)
      const inPath = alt && path.indexOf(alt) >= 0
      const expandable = !!alt && !inPath
      const open = expandable && seen.has(key)
      const icon = iconOf(idx, alt || slot[0])
      const isLeaf = !expandable
      out.push({
        key,
        depth,
        label: slotLabel(idx, slot),
        en: alt || slot[0],
        expandable,
        open,
        cyclic: !!inPath,
        icon,
        station: v2.s || '',
        // 叶子行显示获取方式；精灵图行携带 f/vol 供详情跳转
        obtTxt: isLeaf ? leafObt(idx, alt || slot[0]) : '',
        f: (icon && icon.f) || '',
        vol: (icon && icon.vol) || '',
        artId: (icon && icon.artId) || ''
      })
      if (open) walk(alt, depth + 1, path.concat(alt), key)
    })
    // 无槽配方（异常数据兜底）：显示占位
    if (!(v2.i || []).length) {
      out.push({ key: keyPrefix + '/e', depth, label: '（配方数据缺失）', en: '', expandable: false, open: false, cyclic: false, icon: null, station: v2.s || '' })
    }
  }

  walk(rootEn, 0, [], 'r')
  return out
}

// 目标根节点信息（卡片用）
function rootInfo (idx, rootEn) {
  const rec = idx.rec[rootEn]
  if (!rec || !rec.length) return null
  const v = rec[0]
  return {
    en: rootEn,
    name: idx.zh[rootEn] || rootEn,
    station: v.s || '',
    sprite: (iconOf(idx, rootEn) || {}).sprite || '',
    artId: (iconOf(idx, rootEn) || {}).artId || '',
    varN: rec.length
  }
}

// 叶子获取方式（优先索引 obt，回退空）
function leafObt (idx, en) {
  return idx.obt[en] || '非合成物品 · 通过掉落 / 购买 / 采集获得'
}

// 懒加载配方索引（供首页/搜索页判断物品是否有 wiki 配方）
let _dataP = null
function dataPromise () {
  if (!_dataP) {
    try { _dataP = require.async('../pkg-recipe/data/recipes-wiki.js').catch(() => null) }
    catch (e) { _dataP = Promise.resolve(null) }
  }
  return _dataP
}
function hasCraft (en) {
  if (!en) return Promise.resolve(false)
  return dataPromise().then(d => !!(d && d.rec && d.rec[en]))
}

module.exports = { buildIndex, rows, rootInfo, iconOf, obtOf, leafObt, slotLabel, hasCraft }
