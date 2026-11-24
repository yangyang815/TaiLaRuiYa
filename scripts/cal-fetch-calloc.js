// 临时脚本：经 GitHub Contents API 下载 CalamityCN 语言文件（b64 解码存盘），用完即删
const https = require('https')
const fs = require('fs')

function fetchJSON(url) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { 'User-Agent': 'cal-item-builder' } }, r => {
      let d = ''
      r.on('data', c => d += c)
      r.on('end', () => { try { res(JSON.parse(d)) } catch (e) { rej(new Error('bad json: ' + d.slice(0, 120))) } })
    }).on('error', rej)
  })
}

const FILES = [
  'Items.Weapons.Melee', 'Items.Weapons.Ranged', 'Items.Weapons.Magic',
  'Items.Weapons.Summon', 'Items.Weapons.Rogue', 'Items.Weapons.Typeless',
  'Items.Weapons.DraedonsArsenal', 'Items.Accessories', 'Items.Accessories.Wings',
  'Items.Materials', 'Items.Potions', 'Items.SummonItems',
  'Items.Pets', 'Items.Mounts', 'Items.Armor.Vanity', 'Items.Armor.PostMoonLord', 'Items.Armor.Hardmode',
  'Items.Armor.PreHardmode', 'Items.Misc', 'Items.Tools'
]
const LANGS = ['zh-Hans', 'en-US']
const OUT = process.env.TEMP + '/calloc'

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  for (const f of FILES) {
    for (const lang of LANGS) {
      const p = 'Localization/CalamityMod/' + lang + '/Mods.CalamityMod.' + f + '.hjson'
      const out = OUT + '/' + lang + '.' + f + '.hjson'
      if (fs.existsSync(out) && fs.statSync(out).size > 100) { console.log('skip', lang + '.' + f); continue }
      try {
        const j = await fetchJSON('https://api.github.com/repos/Koibumi/CalamityCN/contents/' + encodeURI(p))
        if (j.content && j.encoding === 'base64') {
          fs.writeFileSync(out, Buffer.from(j.content, 'base64'))
          console.log('OK', lang + '.' + f, j.size + 'B')
        } else console.log('NOCONTENT', lang + '.' + f)
      } catch (e) { console.log('FAIL', lang + '.' + f, e.message) }
    }
  }
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1) })
