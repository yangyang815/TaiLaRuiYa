// 临时脚本：下载 Buffs.hjson + 药水效果用增益描述填充（用完即删）
const https = require('https')
const fs = require('fs')

function fetchJSON(url) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { 'User-Agent': 'cal' } }, r => {
      let d = ''
      r.on('data', c => d += c)
      r.on('end', () => { try { res(JSON.parse(d)) } catch (e) { rej(new Error(d.slice(0, 80))) } })
    }).on('error', rej)
  })
}

function parseHjson(f) {
  const s = fs.readFileSync(f, 'utf8')
  const out = {}
  const re = /^([A-Za-z0-9_]+): \{([\s\S]*?)^\}/gm
  let m
  while ((m = re.exec(s))) {
    const dnM = m[2].match(/\tDisplayName: (.+)/)
    const tipM = m[2].match(/\tTooltip:\n\t\t'''\n([\s\S]*?)\n\t\t'''/)
    if (dnM) {
      let tip = ''
      if (tipM) tip = tipM[1].split('\n').map(x => x.replace(/^\t\t/, '').trim()).filter(Boolean).join('\n')
      out[m[1]] = { dn: dnM[1].trim(), tip: tip }
    }
  }
  return out
}

function esc(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') }

async function main() {
  const j = await fetchJSON('https://api.github.com/repos/Koibumi/CalamityCN/contents/Localization/CalamityMod/zh-Hans/Mods.CalamityMod.Buffs.hjson')
  fs.writeFileSync(process.env.TEMP + '/calloc/zh-Hans.Buffs.hjson', Buffer.from(j.content, 'base64'))
  console.log('Buffs.hjson OK', j.size + 'B')

  const buffs = parseHjson(process.env.TEMP + '/calloc/zh-Hans.Buffs.hjson')
  const buffByDn = {}
  Object.keys(buffs).forEach(k => { buffByDn[buffs[k].dn] = buffs[k].tip })

  const cal = require('../pkg-cal/data/calamity-items')
  let filled = 0
  const miss = []
  cal.items.filter(i => i.cat === 'potion' && !i.tip).forEach(i => {
    const stem = i.n.replace(/药水$/, '')
    const bt = buffByDn[stem] || buffByDn[stem + '增益'] || buffByDn[i.n]
    if (bt) {
      i.tip = bt.replace(/\{\$[^}]+\}/g, '')
      filled++
    } else miss.push(i.n)
  })
  console.log('药水增益填充:', filled, '| 仍缺:', miss.join('、') || '无')

  const lines = cal.items.map(e => {
    return '    { id:"' + e.id + '", n:"' + esc(e.n) + '", en:"' + esc(e.en || '') + '", cat:"' + e.cat + '"' +
      (e.cls ? ', cls:"' + e.cls + '"' : '') +
      (e.stg ? ', stg:"' + e.stg + '"' : '') +
      (e.boss ? ', boss:"' + e.boss + '"' : '') +
      (e.rate ? ', rate:"' + esc(e.rate) + '"' : '') +
      ', tip:"' + esc(e.tip || '') + '" }'
  })
  fs.writeFileSync('pkg-cal/data/calamity-items.js',
    '// 灾厄物品图鉴 · 批次1（Boss 掉落武器/饰品/药水/召唤物）\n' +
    '// 名称与效果取自灾厄官方汉化包（github Koibumi/CalamityCN），药水效果由增益描述填充；掉落来源 2026-11-22 对维基全量核对\n' +
    '// ver: 2026-11-24\n' +
    'module.exports={\n  ver:"2026-11-24",\n  items:[\n' + lines.join(',\n') + '\n  ]\n}\n')
  console.log('数据集已回写 | 仍无提示条目:', cal.items.filter(i => !i.tip).length)
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1) })
