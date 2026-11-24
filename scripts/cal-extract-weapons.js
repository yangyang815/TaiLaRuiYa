// 临时脚本：从 Boss 掉落数据提取 Boss 专属武器候选名单（用完即删）
const fs = require('fs')
const cal = require('../pkg-cal/data/calamity-bosses')

const weapons = []
const seen = new Set()

function addWeapon(zh, boss, rate) {
  if (!zh || zh.length < 2 || zh.length > 14) return
  if (seen.has(zh)) return
  seen.add(zh)
  weapons.push({ zh: zh, boss: boss.id, bossName: boss.n, stg: boss.stage, rate: rate })
}

cal.bosses.forEach(b => {
  b.drops.forEach(line => {
    // N选一武器行：名称在"："之后，按 、 分隔
    const m = line.match(/(?:选一武器必掉其一|选一必掉其一)（[^）]*）：(.+)$/)
    if (m) {
      // 可能带分号追加段（如"；深海之锚 10%"），先切掉分号后的部分
      let seg = m[1].split('；')[0]
      seg.split('、').forEach(raw => {
        const name = raw.trim().replace(/（[^）]*）$/, '').trim()
        addWeapon(name, b, '25%/33.3%')
      })
      // 分号后的概率掉落武器（可能顿号分隔多个，如"维苏威阿斯 10%、憎恶血刃 5%"）
      m[1].split('；').slice(1).forEach(seg2 => {
        seg2.split('、').forEach(seg3 => {
          const mm = seg3.trim().match(/^([\u4e00-\u9fa5A-Za-z0-9·”]{2,14})\s+(\d+(?:\.\d+)?)%$/)
          if (mm) addWeapon(mm[1], b, mm[2] + '%')
        })
      })
      return
    }
    // 星流巨械：按机甲分组，真武器名在各组括号内（光子撕裂者/星耦狱锁/...）
    const exo = line.match(/必掉专属武器（100%）：(.+)$/)
    if (exo) {
      const names = []
      const re = /（([^）]+)）/g
      let g
      while ((g = re.exec(exo[1]))) g[1].split('/').forEach(x => names.push(x.trim()))
      names.forEach(nm => addWeapon(nm, b, '100%'))
      return
    }
    // 独立概率掉落武器行（如"沙尘披风 25%"）——只收明确标注为武器概率掉的，此处按行首名称+纯概率模式
    const sp = line.match(/^([\u4e00-\u9fa5A-Za-z0-9·”]{2,14})\s+(10%|5%)\s*$/)
    if (sp) addWeapon(sp[1], b, sp[2])
  })
})

// 星流巨械那行是顿号分隔在括号里，特殊处理已覆盖；输出清单
fs.writeFileSync(process.env.TEMP + '/cal_weapons.json', JSON.stringify(weapons, null, 1))
console.log('提取 Boss 专属武器:', weapons.length, '件')
weapons.forEach(w => console.log(w.stg.padEnd(3) + ' | ' + w.bossName + ' | ' + w.zh + ' (' + w.rate + ')'))
