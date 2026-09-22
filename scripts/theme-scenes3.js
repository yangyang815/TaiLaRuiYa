const fs = require('fs')
let t = fs.readFileSync('utils/theme.js', 'utf8')
const SCENES = {
  light: { sky: 'linear-gradient(180deg,#BFE0FF 0%,#FFF3D6 75%)', ground: '#D8C48A', dot: '#FFFFFF', orb: '#FFC94A' },
  jungle: { sky: 'linear-gradient(180deg,#4A7E3A 0%,#1B3317 75%)', ground: '#0B180A', dot: '#B8D44A', orb: '#D8E86A' },
  corruption: { sky: 'linear-gradient(180deg,#3A2058 0%,#170E22 75%)', ground: '#0F0818', dot: '#B86AE0', orb: '#8A45B0' },
  crimson: { sky: 'linear-gradient(180deg,#5E1E28 0%,#260D12 75%)', ground: '#19080C', dot: '#E07050', orb: '#B04830' },
  hallow: { sky: 'linear-gradient(180deg,#E8C8F5 0%,#F5EAF5 75%)', ground: '#D8B8D8', dot: '#B85CA8', orb: '#FFD1F0' },
  lunar: { sky: 'linear-gradient(180deg,#12244A 0%,#06090F 75%)', ground: '#04060B', dot: '#5AD8E8', orb: '#9AE8F5' },
  halloween: { sky: 'linear-gradient(180deg,#5E3A14 0%,#1E140A 75%)', ground: '#140D05', dot: '#FFA030', orb: '#FFC94A' },
}
let ok = 0
for (const [id, sc] of Object.entries(SCENES)) {
  const anchor = '{ id: "' + id + '",'
  if (t.includes(anchor + ' scene:')) { ok++; continue }
  const before = t.length
  t = t.replace(anchor, anchor + ' scene: ' + JSON.stringify(sc) + ',')
  if (t.length === before) { console.log('replace 未生效', id); process.exit(1) }
  ok++
}
fs.writeFileSync('utils/theme.js', t)
console.log('补齐:', ok, '/ 7')
