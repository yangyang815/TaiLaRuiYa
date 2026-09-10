// 修复精灵图 404 的条目：反查页面真实图片名（pageimages）→ 拆分 imagefile 候选 → 逐个尝试下载
// 用法: node scripts/fix-missing-sprites.js
const fs = require('fs')
const path = require('path')
const https = require('https')
const crypto = require('crypto')

const STAGE_DIR = path.join(__dirname, 'catalog-stage')
const API = 'https://terraria.wiki.gg/api.php'
const IMG = 'https://terraria.wiki.gg/images/'
const UA = { headers: { 'User-Agent': 'Mozilla/5.0 TerraHandbook/1.0' } }

function fetchJson (url) {
  return new Promise((resolve, reject) => {
    https.get(url, UA, res => {
      let d = ''
      res.on('data', c => { d += c })
      res.on('end', () => { try { resolve(JSON.parse(d)) } catch (e) { reject(new Error('非JSON')) } })
    }).on('error', reject).setTimeout(20000, function () { this.destroy(); reject(new Error('超时')) })
  }).then(d => new Promise(r => setTimeout(() => r(d), 120)))
}
function download (url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, UA, res => {
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)) }
      const ws = fs.createWriteStream(dest)
      res.pipe(ws)
      ws.on('finish', () => ws.close(resolve))
      ws.on('error', reject)
    }).on('error', reject).setTimeout(15000, function () { this.destroy(); reject(new Error('timeout')) })
  })
}
const h2 = s => crypto.createHash('md5').update(s).digest('hex').slice(0, 2)
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function main () {
  const missing = JSON.parse(fs.readFileSync(path.join(STAGE_DIR, 'missing-sprites.json'), 'utf8'))
  console.log('待修复:', missing.length)
  let ok = 0, fail = 0
  for (const m of missing) {
    const safeId = (m.en).replace(/[\\/:"*?<>|]/g, '_')
    const dest = path.join(STAGE_DIR, 'sprites', h2(safeId), safeId + '.png')
    if (fs.existsSync(dest)) { ok++; continue }
    const candidates = []
    // 1) pageimages 反查真实文件名
    try {
      const d = await fetchJson(API + '?action=query&format=json&prop=pageimages&piprop=original&titles=' + encodeURIComponent(m.page) + '&redirects=1')
      const pages = Object.values((d.query || {}).pages || {})
      const orig = pages[0] && pages[0].original && pages[0].original.name
      if (orig) candidates.push(orig)
    } catch (e) { /* 忽略，走候选名 */ }
    // 2) imagefile 可能含多个候选（"A.png / B.png"）
    String(m.imagefile || '').split('/').forEach(x => { const t = x.trim(); if (t) candidates.push(t) })
    // 3) 物品名兜底
    candidates.push(m.en + '.png')
    let done = false
    for (const c of [...new Set(candidates)]) {
      const url = IMG + encodeURIComponent(c.replace(/ /g, '_'))
      try {
        fs.mkdirSync(path.dirname(dest), { recursive: true })
        await download(url, dest)
        console.log('OK', m.en, '<-', c)
        ok++; done = true; break
      } catch (e) { /* 下一个候选 */ }
      await sleep(40)
    }
    if (!done) { fail++; console.log('FAIL', m.en) }
  }
  console.log('修复完成: 成功 ' + ok + ' | 仍失败 ' + fail)
}

main().catch(e => { console.error(e); process.exit(1) })
