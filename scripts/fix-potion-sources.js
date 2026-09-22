// 药水容器来源全面修正 + 删除已移除物品"弱效恢复药水"
// 官方依据：Lesser Healing Potion / Lesser Restoration Potion wiki 页原文（1.4.5.8）
const fs = require('fs')

// ---------- 1) items.js ----------
const ip = 'data/items.js'
let s = fs.readFileSync(ip, 'utf8')
const obRep = (id, from, to, tag) => {
  const re = new RegExp('(id:"' + id + '"[\\s\\S]{0,600}?obtain:")([^"]*)(")')
  const m = s.match(re)
  if (!m) { console.log('未命中', tag); process.exit(1) }
  if (m[2].includes(to)) { console.log('已应用', tag); return }
  if (!m[2].includes(from)) { console.log('预期不符', tag, JSON.stringify(m[2])); process.exit(1) }
  s = s.replace(re, '$1' + m[2].replace(from, to) + '$3')
  console.log('OK', tag)
}

// 1a) 弱效治疗：配方计数 + 商人购买 + 容器范围扩大（各类生成宝箱/罐子）
obRep('lesser_healing',
  '摆放的瓶子：蘑菇 + 凝胶 + 玻璃瓶；另可从 金箱 50%、木匣/珍珠木匣 16.67% 开启',
  '摆放的瓶子：蘑菇 + 凝胶×2 + 玻璃瓶×2 合成（一次产 2 瓶）；商人 3 银出售（骷髅商人特定月相同价）；肉前罐子与各类生成宝箱 50% 常见、木匣/珍珠木匣 16.67%，多数肉前 Boss 必掉',
  '弱效治疗')

// 1b) 治疗药水：配方计数 + 容器精确化
obRep('healing_potion',
  '摆放的瓶子：弱效治疗药水 + 发光蘑菇 合成；罐子与各类匣子常备，多数 Boss 也会掉落',
  '摆放的瓶子：弱效治疗药水×2 + 发光蘑菇 合成；洞穴金箱 50%、各类匣子 25% 常备，罐子可见；多数肉后 Boss 必掉',
  '治疗药水')

// 1c) 传送药水：容器纠正（官方为洞穴金箱/暗影箱，非水中宝箱）
obRep('teleportation',
  '合成；水中宝箱/水匣钓鱼开出',
  '合成；洞穴金箱 5.56%、暗影箱 8.33% 开出',
  '传送药水')

// 1d) 删除弱效恢复药水（1.4.0.1 已从游戏移除，旧世代专属）
const lr = s.match(/\{id:"lesser_restoration_potion"[\s\S]*?\},/)
if (lr) { s = s.replace(lr[0], ''); console.log('OK 移除弱效恢复药水条目') }
else if (!s.includes('lesser_restoration_potion')) console.log('弱效恢复已移除')
else { console.log('弱效恢复条目定位失败'); process.exit(1) }
fs.writeFileSync(ip, s)

// ---------- 2) spritemap 移除键 ----------
const sp = 'data/spritemap.js'
let sm = fs.readFileSync(sp, 'utf8')
if (sm.includes(',lesser_restoration_potion:"png"')) {
  sm = sm.replace(',lesser_restoration_potion:"png"', '')
  fs.writeFileSync(sp, sm)
  console.log('spritemap -1')
} else console.log('spritemap 无此键')

// ---------- 3) pixelart 移除注册 ----------
const pp = 'utils/pixelart.js'
let px = fs.readFileSync(pp, 'utf8')
const reg = 'reg("lesser_restoration_potion",potion("#E86060","#60A0E8"));'
if (px.includes(reg)) {
  px = px.replace(reg, '')
  fs.writeFileSync(pp, px)
  console.log('pixelart -1')
} else console.log('pixelart 无此注册')

// ---------- 4) 删除图标文件 ----------
const png = 'assets/sprites/lesser_restoration_potion.png'
if (fs.existsSync(png)) { fs.unlinkSync(png); console.log('图标文件已删') }

// ---------- 5) 药水指南事实更新 ----------
const gp = 'pkgB-guide/data/guide.js'
let g = fs.readFileSync(gp, 'utf8')
const oldF = '弱效治疗（蘑菇+凝胶+玻璃瓶）→治疗药水（弱效治疗×2+发光蘑菇）'
const newF = '弱效治疗（蘑菇+凝胶×2+玻璃瓶×2 合成 2 瓶，商人 3 银有售）→治疗药水（弱效治疗×2+发光蘑菇）'
if (g.includes(oldF)) {
  g = g.replace(oldF, newF)
  fs.writeFileSync(gp, g)
  console.log('指南事实更新 OK')
} else console.log('指南锚点未命中（可能已更新）')
