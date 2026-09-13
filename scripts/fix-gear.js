// 钓鱼装备修正 + 补齐钓竿
const fs = require('fs')
let f = require('../data/fishing.js')
let log = []

// 1) 金钓竿：30 次必给（75 次后 0.4%）
const go = f.GEAR.find(g => g.id === 'golden_fishing_rod')
if (go) { go.source = '渔夫第 30 次任务必给（此后 0.4% 概率）'; log.push('金钓竿来源修正') }

// 2) 拆分"机械钓竿"混淆：改为甲虫钓竿 + 新增机械钓竿
const mech = f.GEAR.find(g => g.id === 'mechanic_fishing_rod')
if (mech) {
  mech.name = '甲虫钓竿'
  mech.en = 'Scarab Fishing Rod'
  mech.power = 30
  mech.source = '绿洲匣 / 海市蜃楼匣开出（1/8）'
  mech.tier = '开局'
  log.push('甲虫钓竿(30%,绿洲/海市蜃楼匣)修正')
  // 新增机械钓竿
  f.GEAR.splice(f.GEAR.indexOf(mech) + 1, 0, { id: 'mechanics_rod', name: '机械钓竿', en: "Mechanic's Rod", power: 35, source: '机械师出售（20金，需渔夫已入住）', tier: '开局' })
  log.push('新增机械钓竿(35%)')
}

// 3) 新增冤大头钓竿与血肉钓手
if (!f.GEAR.some(g => g.en === "Sitting Duck's Fishing Pole")) {
  f.GEAR.splice(f.GEAR.findIndex(g => g.id === 'golden_fishing_rod'), 0, { id: 'sitting_ducks_fishing_pole', name: '冤大头钓竿', en: "Sitting Duck's Fishing Pole", power: 40, source: '旅商出售（35金，需击败骷髅王）', tier: '进阶' })
  log.push('新增冤大头钓竿(40%)')
}
if (!f.GEAR.some(g => g.en === 'Fleshcatcher')) {
  const fof = f.GEAR.find(g => g.en === 'Fisher of Souls')
  f.GEAR.splice(f.GEAR.indexOf(fof) + 1, 0, { id: 'fleshcatcher', name: '血肉钓手', en: 'Fleshcatcher', power: 22, source: '铁砧：猩红矿锭×8', tier: '开局' })
  log.push('新增血肉钓手(22%,猩红版)')
}

fs.writeFileSync('data/fishing.js', 'module.exports=' + JSON.stringify(f, null, 1))
log.forEach(x => console.log(x))
console.log('钓竿总数:', f.GEAR.filter(g => /钓竿/.test(g.name)).length)
