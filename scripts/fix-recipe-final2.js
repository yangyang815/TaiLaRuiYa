// 第二遍：利用已下载的图标文件 + langlinks 补齐剩余
const fs = require('fs')
const path = require('path')
const https = require('https')
const get = url => new Promise((res, rej) => { https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 TerraHandbook/1.0' } }, r => { if (r.statusCode !== 200) { r.resume(); return rej(new Error('HTTP ' + r.statusCode)) } const chunks = []; r.on('data', c => chunks.push(c)); r.on('end', () => res(Buffer.concat(chunks))) }).on('error', rej) })
const delay = ms => new Promise(r => setTimeout(r, ms))
const cjk = s => /[\u4e00-\u9fa5]/.test(s || '')

const idxPath = path.join(__dirname, '../pkg-recipe/data/recipe-index.js')
const idx = require('../pkg-recipe/data/recipe-index.js')
const targets = idx.filter(r => r.src === 'w' && (!r.spr || !cjk(r.n)))
console.log('处理目标:', targets.length)

// 1) 已下载图标 → spr
let sFix = 0
targets.forEach(r => {
  if (r.spr) return
  const g = r.en.replace(/[^A-Za-z0-9]/g, '')
  if (fs.existsSync(path.join(__dirname, '../pkg-cat-1/assets/' + g + '.png'))) { r.spr = '/pkg-cat-1/assets/' + g + '.png'; sFix++ }
})
console.log('图标回填:', sFix)

// 2) 剩余英文名 → langlinks
const enLeft = [...new Set(targets.filter(r => !cjk(r.n)).map(r => r.en))]
console.log('剩余英文名查询:', enLeft.length)
const zhMap = {}
;(async () => {
  for (let i = 0; i < enLeft.length; i += 20) {
    const batch = enLeft.slice(i, i + 20)
    try {
      const d = JSON.parse((await get('https://terraria.wiki.gg/api.php?action=query&format=json&prop=langlinks&lllang=zh&redirects=1&limit=max&titles=' + encodeURIComponent(batch.join('|')))).toString())
      Object.values(d.query.pages).forEach(p => {
        const ll = p.langlinks && p.langlinks[0] && p.langlinks[0]['*']
        if (ll && cjk(ll)) zhMap[p.title.replace(/_/g, ' ')] = ll
      })
      ;(d.query.redirects || []).forEach(rd => { if (zhMap[rd.to]) zhMap[rd.from.replace(/_/g, ' ')] = zhMap[rd.to] })
    } catch (e) { console.log('batch err', e.message) }
    await delay(500)
  }
  console.log('查到:', Object.keys(zhMap).length, JSON.stringify(zhMap).slice(0, 300))
  let nFix = 0
  targets.forEach(r => {
    const zh = zhMap[r.en]
    if (zh && cjk(zh) && !cjk(r.n)) { r.n = zh; nFix++ }
  })
  fs.writeFileSync(idxPath, '// 自动生成：合成页全量配方索引（勿手改）——内置+wiki全部可合成结果，名称/图标已按当前目录解析\nmodule.exports=' + JSON.stringify(idx) + ';')
  console.log('名称回填:', nFix)

  // 3) recipes-wiki 同步（图标 + 名称）
  const wp = path.join(__dirname, '../pkg-recipe/data/recipes-wiki.js')
  const wiki = require('../pkg-recipe/data/recipes-wiki.js')
  let wI = 0, wN = 0
  targets.forEach(r => {
    const g = r.en.replace(/[^A-Za-z0-9]/g, '')
    if (!wiki.ico[r.en] && fs.existsSync(path.join(__dirname, '../pkg-cat-1/assets/' + g + '.png'))) { wiki.ico[r.en] = [g, 1]; wI++ }
    const zh = zhMap[r.en]
    if (zh && cjk(zh) && !cjk(wiki.zh[r.en])) { wiki.zh[r.en] = zh; wN++ }
    if (r.n && cjk(r.n) && !cjk(wiki.zh[r.en] || '')) { wiki.zh[r.en] = r.n; wN++ } // 索引里已回填的 中文名同步
  })
  fs.writeFileSync(wp, '// 自动生成：wiki全量配方库（zh/ico 已按当前目录增补）\nmodule.exports=' + JSON.stringify(wiki) + ';')
  console.log('recipes-wiki 同步: ico', wI, '| zh', wN)
  // 复核
  const idx2 = JSON.parse(fs.readFileSync(idxPath, 'utf8').replace(/^\/\/[^\n]*\n/, '').replace('module.exports=', '').replace(/;$/, ''))
  console.log('复核: 英文残留', idx2.filter(r => r.src === 'w' && !cjk(r.n)).length, '| 无图标残留', idx2.filter(r => r.src === 'w' && !r.spr).length)
})()
