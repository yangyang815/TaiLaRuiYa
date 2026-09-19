// 全量目录 555 盔甲条目中 85 条兜底文案：战斗盔甲全部改为具体来源（官方核实）
const fs = require('fs')

const FIX = {
  Copper_armor: '铁砧：铜锭×48 合成（头盔12+胸甲20+护腿16）',
  Iron_armor: '铁砧：铁锭×60 合成（头盔15+胸甲25+护腿20）',
  Silver_armor: '铁砧：银锭×60 合成（头盔15+胸甲25+护腿20）',
  Gold_armor: '铁砧：金锭×75 合成（头盔20+胸甲30+护腿25）',
  Platinum_armor: '铁砧：铂金锭×75 合成（头盔20+胸甲30+护腿25）',
  Tin_armor: '铁砧：锡锭×48 合成',
  Lead_armor: '铁砧：铅锭×60 合成',
  Tungsten_armor: '铁砧：钨金锭×60 合成',
  Meteor_armor: '铁砧：陨石锭×45 合成（头盔10+胸甲20+护腿15）',
  Molten_armor: '铁砧：狱石锭×45 合成（头盔10+胸甲20+护腿15）',
  Cobalt_armor: '铁砧：钴锭×45 合成（头10+胸20+腿15）',
  Mythril_armor: '秘银/山铜砧：秘银锭×45 合成',
  Palladium_armor: '秘银砧：钯金锭×54 合成（头12+胸24+腿18）',
  Orichalcum_armor: '秘银/山铜砧：山铜锭×54 合成（头12+胸24+腿18）',
  Adamantite_armor: '秘银/山铜砧：精金锭×54 合成（头12+胸24+腿18）',
  Titanium_armor: '秘银/山铜砧：钛金锭×59 合成（头13+胸26+腿20）',
  Hallowed_armor: '秘银/山铜砧：神圣锭×54 合成（头12+胸24+腿18）',
  Ancient_Hallowed_armor: '微光转化：神圣盔甲件放入微光变为远古版；可与神圣件混搭仍触发套装效果',
  Chlorophyte_armor: '秘银/山铜砧：叶绿锭×54 合成（头12+胸24+腿18）',
  Shroomite_armor: '秘银/山铜砧：蘑菇矿锭×54 合成（头12+胸24+腿18）',
  Spectre_armor: '秘银/山铜砧：幽灵锭×54 合成（头12+胸24+腿18）',
  Beetle_armor: '秘银/山铜砧：甲虫外壳×18 + 龟甲套装对应件升级（集齐两胸共26壳）',
  Solar_Flare_armor: '远古操纵机：日耀碎片×45 + 夜明锭×36 合成',
  Vortex_armor: '远古操纵机：星旋碎片×45 + 夜明锭×36 合成',
  Nebula_armor: '远古操纵机：星云碎片×45 + 夜明锭×36 合成',
  Stardust_armor: '远古操纵机：星尘碎片×45 + 夜明锭×36 合成',
  Cactus_armor: '工作台：仙人掌×75 合成（头盔20+胸甲30+护腿25）',
  Bee_armor: '铁砧：蜂蜡×30 合成（头8+胸12+腿10）',
  Obsidian_armor: '地狱熔炉：丝绸×30+黑曜石×60+暗影鳞片/组织样本×20 合成',
  Jungle_armor: '铁砧：丛林孢子×32+毒刺×10+藤蔓×2 合成',
  Necro_armor: '工作台：骨头×150+蛛网×135 合成',
  Ninja_armor: '史莱姆王掉落（兜帽/衣/裤三选一 33.33%）',
  Ancient_Shadow_armor: '腐化之地敌怪（噬魂怪/吞噬怪等）低概率掉落',
  Ancient_Cobalt_armor: '丛林蜂/巨型食人兽低概率掉落',
  Fossil_armor: '提炼机提炼沙漠化石获得坚固化石后合成',
  Rain_armor: '雨天的雨衣史莱姆掉落',
  Frost_armor: '秘银/山铜砧：精金或钛金锭×46+寒霜核心×3 合成',
  Turtle_armor: '秘银/山铜砧：叶绿锭×54+龟壳×3 合成',
  Spooky_armor: '工作台：阴森木×750 合成',
  Tiki_armor: '巫医出售（世纪之花后）',
  Forbidden_armor: '秘银/山铜砧：禁忌碎片×3+精金或钛金锭×46 合成',
  Pumpkin_armor: '工作台：南瓜合成',
  Ash_Wood_armor: '工作台：灰烬木×75 合成',
  Boreal_Wood_armor: '工作台：针叶木×75 合成',
  Ebonwood_armor: '工作台：乌木×75 合成',
  Shadewood_armor: '工作台：暗影木×75 合成',
  Palm_Wood_armor: '工作台：棕榈木×75 合成',
  Pearlwood_armor: '工作台：珍珠木×75 合成',
  Snow_armor: '雪原冰雪箱开启获得',
  Pink_Snow_armor: '雪原冰雪箱开启获得（稀有粉色变体）',
  Crimson_armor: '猩红祭坛：猩红矿锭+组织样本 合成',
  Shadow_armor: '恶魔祭坛：魔矿锭+暗影鳞片 合成',
  Gladiator_armor: '洞穴层骷髅类敌怪（骷髅/不死维京海盗等）低概率掉落',
}

let total = 0
for (const vol of ['pkg-cat-1', 'pkg-cat-2', 'pkg-cat-3']) {
  const p = vol + '/data/data-v' + vol.slice(-1) + '.js'
  let s = fs.readFileSync(p, 'utf8')
  let changed = 0
  for (const [f, ob] of Object.entries(FIX)) {
    const anchor = '"f":"' + f + '"'
    let i = s.indexOf(anchor)
    while (i >= 0) {
      const seg = s.slice(i, i + 1200)
      const oRe = /"ob":"可于世界中探索、击败敌怪或参与事件获得"/
      if (!oRe.test(seg)) { i = s.indexOf(anchor, i + 1); continue }
      const j = seg.search(oRe)
      s = s.slice(0, i + j) + '"ob":"' + ob + '"' + s.slice(i + j + '"ob":"可于世界中探索、击败敌怪或参与事件获得"'.length)
      changed++
      i = s.indexOf(anchor, i + 1)
    }
  }
  if (changed) fs.writeFileSync(p, s)
  console.log(vol, '修正', changed)
  total += changed
}
console.log('总计', total)
