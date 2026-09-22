const fs = require('fs')
let t = fs.readFileSync('utils/theme.js', 'utf8')

// 每主题迷你场景预览数据：sky 渐变 / ground 地表 / dot 星点 / orb 大天体
const SCENES = {
  dark: { sky: 'linear-gradient(180deg,#3E2F63 0%,#1A0E2E 75%)', ground: '#120925', dot: '#FFE066', orb: '#FFD700' },
  light: { sky: 'linear-gradient(180deg,#BFE0FF 0%,#FFF3D6 75%)', ground: '#D8C48A', dot: '#FFFFFF', orb: '#FFC94A' },
  jungle: { sky: 'linear-gradient(180deg,#4A7E3A 0%,#1B3317 75%)', ground: '#0B180A', dot: '#B8D44A', orb: '#D8E86A' },
  corruption: { sky: 'linear-gradient(180deg,#3A2058 0%,#170E22 75%)', ground: '#0F0818', dot: '#B86AE0', orb: '#8A45B0' },
  crimson: { sky: 'linear-gradient(180deg,#5E1E28 0%,#260D12 75%)', ground: '#19080C', dot: '#E07050', orb: '#B04830' },
  hallow: { sky: 'linear-gradient(180deg,#E8C8F5 0%,#F5EAF5 75%)', ground: '#D8B8D8', dot: '#B85CA8', orb: '#FFD1F0' },
  lunar: { sky: 'linear-gradient(180deg,#12244A 0%,#06090F 75%)', ground: '#04060B', dot: '#5AD8E8', orb: '#9AE8F5' },
  halloween: { sky: 'linear-gradient(180deg,#5E3A14 0%,#1E140A 75%)', ground: '#140D05', dot: '#FFA030', orb: '#FFC94A' },
}

// 给每条主题注入 scene 字段
let added = 0
for (const [id, sc] of Object.entries(SCENES)) {
  const anchor = '{ id: "' + id + '"'
  if (!t.includes(anchor)) { console.log('未找到主题', id); process.exit(1) }
  if (t.includes('scene: { sky: "' + sc.sky)) { continue }
  const sceneStr = 'scene: { sky: "' + sc.sky + '", ground: "' + sc.ground + '", dot: "' + sc.dot + '", orb: "' + sc.orb + '" }, '
  t = t.replace(anchor + ' ', anchor + ' ' + sceneStr)
  added++
}
fs.writeFileSync('utils/theme.js', t)
console.log('scene 注入', added, '个主题')
