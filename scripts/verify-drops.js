// 向 en wiki cargo Drops 表核实存疑物品的真实掉落者/概率
const https = require('https')
const get = url => new Promise((res, rej) => { https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 TerraHandbook/1.0' } }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)) } catch (e) { res({}) } }); }).on('error', rej); })
const clean = s => String(s || '').replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
const ITEMS = ['Black Lens', 'Stinger', 'Bee Wax', 'Vine', 'Adhesive Bandage', 'Bone', 'Lens', 'Shackle', 'Cursed Flame', 'Ichor', 'Shark Fin', 'Frozen Turtle Shell', 'Ectoplasm', 'Demon Scythe', 'Moon Charm', 'Solar Fragment', 'Vortex Fragment', 'Nebula Fragment', 'Stardust Fragment', 'Gel', 'Trifold Map', 'Megaphone', 'Glowstick', 'Water Candle']
;(async () => {
  for (const item of ITEMS) {
    const q = await get('https://terraria.wiki.gg/api.php?action=cargoquery&tables=Drops&format=json&limit=30&fields=npc,rate&where=item%3D%22' + encodeURIComponent(item) + '%22')
    const rows = (q.cargoquery || []).map(x => x.title)
    console.log('== ' + item + ' ==')
    rows.slice(0, 12).forEach(r => console.log('   ', r.npc, '→', clean(r.rate)))
  }
})()
