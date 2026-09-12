// 终极补齐：为配方索引中缺译名/缺图标的条目从 wiki 拉取官方中文名与图标
const fs = require('fs')
const path = require('path')
const https = require('https')
const get = url => new Promise((res, rej) => { https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 TerraHandbook/1.0' } }, r => { if (r.statusCode !== 200) { r.resume(); return rej(new Error('HTTP ' + r.statusCode)) } const chunks = []; r.on('data', c => chunks.push(c)); r.on('end', () => res(Buffer.concat(chunks))) }).on('error', rej) })
const delay = ms => new Promise(r => setTimeout(r, ms))

const idxPath = path.join(__dirname, '../pkg-recipe/data/recipe-index.js')
const idx = require('../pkg-recipe/data/recipe-index.js')
const cjk = s => /[\u4e00-\u9fa5]/.test(s || '')

// 需要处理的行：src=w 且（无图标 或 名称为英文）
const targets = idx.filter(r => r.src === 'w' && (!r.spr || !cjk(r.n)))
console.log('待补齐条目:', targets.length)
const enList = [...new Set(targets.map(r => r.en))]

;(async () => {
  const zhMap = {}, imgMap = {}
  // 1) 官方中文名（langlinks）
  for (let i = 0; i < enList.length; i += 40) {
    const batch = enList.slice(i, i + 40)
    try {
      const d = JSON.parse((await get('https://terraria.wiki.gg/api.php?action=query&format=json&prop=langlinks&lllang=zh&redirects=1&limit=max&titles=' + encodeURIComponent(batch.join('|')))).toString())
      Object.values(d.query.pages).forEach(p => {
        const ll = p.langlinks && p.langlinks[0] && p.langlinks[0]['*']
        if (ll && cjk(ll)) zhMap[p.title.replace(/_/g, ' ')] = ll
      })
    } catch (e) { console.log('langlinks batch err', e.message) }
    await delay(400)
  }
  // 2) 图标 URL（imageinfo）
  for (let i = 0; i < enList.length; i += 40) {
    const batch = enList.slice(i, i + 40).map(t => 'File:' + t.replace(/ /g, '_') + '.png')
    try {
      const d = JSON.parse((await get('https://terraria.wiki.gg/api.php?action=query&format=json&prop=imageinfo&iiprop=url&limit=max&titles=' + encodeURIComponent(batch.join('|')))).toString())
      Object.values(d.query.pages).forEach(p => {
        if (p.imageinfo && p.imageinfo[0] && p.imageinfo[0].url) imgMap[p.title.replace(/_/g, ' ').replace(/^File:/, '')] = p.imageinfo[0].url
      })
    } catch (e) { console.log('imageinfo batch err', e.message) }
    await delay(400)
  }
  console.log('查到中文名:', Object.keys(zhMap).length, '| 图标URL:', Object.keys(imgMap).length)

  // 3) 下载图标到 pkg-cat-1/assets/
  let dl = 0
  for (const [en, url] of Object.entries(imgMap)) {
    const g = en.replace(/[^A-Za-z0-9]/g, '')
    const dest = path.join(__dirname, '../pkg-cat-1/assets/' + g + '.png')
    if (fs.existsSync(dest)) continue
    try {
      const buf = await get(url)
      fs.writeFileSync(dest, buf)
      dl++
    } catch (e) { console.log('下载失败', en, e.message) }
    await delay(150)
  }
  console.log('图标下载完成:', dl, '张')

  // 4) 回写 recipe-index
  let fixedN = 0, fixedS = 0
  targets.forEach(r => {
    const zh = zhMap[r.en]
    if (zh && cjk(zh) && !cjk(r.n)) { r.n = zh; fixedN++ }
    const g = r.en.replace(/[^A-Za-z0-9]/g, '')
    if (!r.spr && (imgMap[r.en] || fs.existsSync(path.join(__dirname, '../pkg-cat-1/assets/' + g + '.png')))) { r.spr = '/pkg-cat-1/assets/' + g + '.png'; fixedS++ }
  })
  fs.writeFileSync(idxPath, '// 自动生成：合成页全量配方索引（勿手改）——内置+wiki全部可合成结果，名称/图标已按当前目录解析\nmodule.exports=' + JSON.stringify(idx) + ';')

  // 5) 同步增补 recipes-wiki 的 zh/ico（详情页与材料名共用）
  const wp = path.join(__dirname, '../pkg-recipe/data/recipes-wiki.js')
  const wiki = require('../pkg-recipe/data/recipes-wiki.js')
  let wN = 0, wI = 0
  const cjk2 = s => /[\u4e00-\u9fa5]/.test(s || '')
  targets.forEach(r => {
    const zh = zhMap[r.en]
    if (zh && cjk2(zh) && !cjk2(wiki.zh[r.en])) { wiki.zh[r.en] = zh; wN++ }
    const g = r.en.replace(/[^A-Za-z0-9]/g, '')
    if (!wiki.ico[r.en] && fs.existsSync(path.join(__dirname, '../pkg-cat-1/assets/' + g + '.png'))) { wiki.ico[r.en] = [g, 1]; wI++ }
  })
  fs.writeFileSync(wp, '// 自动生成：wiki全量配方库（zh/ico 已按当前目录增补）\nmodule.exports=' + JSON.stringify(wiki) + ';')
  console.log('索引回写: 中文名', fixedN, '| 图标', fixedS, '| recipes-wiki 增补: zh', wN, 'ico', wI)
  // 复核
  const idx2 = JSON.parse(fs.readFileSync(idxPath, 'utf8').replace(/^\/\/[^\n]*\n/, '').replace('module.exports=', '').replace(/;$/, ''))
  const enLeft = idx2.filter(r => r.src === 'w' && !cjk(r.n)).length
  const sprLeft = idx2.filter(r => r.src === 'w' && !r.spr).length
  console.log('复核: 英文残留', enLeft, '| 无图标残留', sprLeft)
})()
