// 武器与饰品重铸词条图鉴（哥布林工匠重铸系统）——对照官方 Wiki 1.4.5 逐条核对
// cat: best=毕业词条 common=通用词条 bad=负面词条 acc=饰品词条
const PREFIXES = [
  {
    id: 'px_legendary', name: '传奇', en: 'Legendary', cat: 'best', cls: 'melee', art: 'terra_blade',
    stats: [['伤害', '+15%'], ['攻速', '+10%'], ['暴击', '+5%'], ['体积', '+10%'], ['击退', '+15%']],
    note: '阔剑与短剑（含天顶剑）的终极词条，也适用于鞭子。',
    detail: '近战词缀池的顶点：伤害、攻速、暴击、武器体积、击退五项全涨。注意它在武器中只出现在从头顶挥舞的阔剑和短剑上，天顶剑还能刷到专属强化版传奇；斧头、锤子等工具也能刷出传奇（纯采集用途推荐轻，两者工具速度相同，但传奇还额外提供伤害、暴击、体积、击退加成）。矛、连枷、悠悠球等近战武器无法获得传奇，它们的毕业词条是神级。体积+10%会扩大攻击判定范围，实战中比面板更值钱。'
  },
  {
    id: 'px_unreal', name: '虚幻', en: 'Unreal', cat: 'best', cls: 'ranged', art: 'megashark',
    stats: [['伤害', '+15%'], ['攻速', '+10%'], ['暴击', '+5%'], ['弹速', '+10%'], ['击退', '+15%']],
    note: '远程武器毕业词条。弹速加成让子弹飞得更直更快。',
    detail: '远程池的终极词条：伤害、攻速、暴击、弹速、击退全部获得加成。弹速+10%常被忽视：子弹飞得更快意味着弹道下坠更少、远距离命中更稳，对机枪/连弩类武器是质变。迷你鲨等无击退的远程拿不到虚幻，它们的目标是恶魔。'
  },
  {
    id: 'px_mythical', name: '神话', en: 'Mythical', cat: 'best', cls: 'magic', art: 'crystal_storm',
    stats: [['伤害', '+15%'], ['攻速', '+10%'], ['暴击', '+5%'], ['魔耗', '-10%'], ['击退', '+15%']],
    note: '魔法武器毕业词条。魔耗-10%对高频法术省下一大瓶蓝药。',
    detail: '魔法池的终极词条：伤害、攻速、暴击、击退全涨，还省 10% 魔力消耗。魔力上限偏低的玩家会觉得神话比裸伤害词缀更顺手；雨云魔棒这类无击退魔法拿不到神话，它们的目标是恶魔。'
  },
  {
    id: 'px_fabled', name: '传说', en: 'Fabled', cat: 'best', cls: 'summon', art: 'imp_staff',
    stats: [['伤害', '+15%'], ['穿透', '+10'], ['标记伤害', '+3'], ['击退', '+15%']],
    note: '召唤武器毕业词条（1.4.5 新增召唤专属池；1.4.4 及以下版本无此词条，请用无情）。',
    detail: '1.4.5 起召唤武器有了专属词条池，传说是其中的顶点：伤害+15%，还附带 +10 盔甲穿透与 +3 召唤标记伤害（标记伤害配合鞭子收益极高）。仅在 1.4.5 及以上版本出现，1.4.4 及以下的老版本没有召唤专属池、更刷不出它，请改刷无情。鞭子本身吃近战池，目标是传奇；基础伤害极高的召唤武器（弩箭法杖、满星尘龙、沙漠虎）用无情的理论输出会更高。'
  },
  {
    id: 'px_ruthless', name: '无情', en: 'Ruthless', cat: 'common', cls: 'all', art: 'stardust_dragon',
    stats: [['伤害', '+18%'], ['击退', '-10%']],
    note: '全游戏伤害加成最高的通用词条，代价是击退下降。',
    detail: '通用池的伤害天花板：+18% 伤害远超其他通用词缀，代价是击退-10%。1.4.5 之前曾是召唤玩家的毕业选择；现在召唤有了专属池首选传说，无击退武器首选恶魔——但基础伤害极高的召唤（弩箭法杖、星尘龙、沙漠虎）用无情的实际输出会反超，长效弹幕类魔法武器（水晶之刺、磁球等）的最佳词条也是它。'
  },
  {
    id: 'px_godly', name: '神级', en: 'Godly', cat: 'common', cls: 'all', art: 'ankh_shield',
    stats: [['伤害', '+15%'], ['暴击', '+5%'], ['击退', '+15%']],
    note: '矛、连枷、悠悠球等近战的实用毕业，短剑之外的近战首选。',
    detail: '通用池的三件套词条：伤害、暴击、击退全有。传奇只出现在阔剑和短剑上，所以挥舞轨迹特殊的近战（矛、连枷、悠悠球、腐化灾兵等）都以神级为毕业目标；不追求击退的话恶魔也是同级选择。'
  },
  {
    id: 'px_demonic', name: '恶魔', en: 'Demonic', cat: 'common', cls: 'all', art: 'ankh_shield',
    stats: [['伤害', '+15%'], ['暴击', '+5%']],
    note: '无击退武器的毕业词条。',
    detail: '通用池里舍弃击退的纯输出词条。迷你鲨、雨云魔棒这类打不出击退的武器拿不到带击退加成的词条（加了也没用），恶魔就是它们的毕业目标：+15% 伤害与 +5% 暴击一分不少。'
  },
  {
    id: 'px_deadly', name: '致命', en: 'Deadly', cat: 'common', cls: 'all', art: 'megashark',
    stats: [['伤害', '+10%'], ['攻速', '+10%']],
    note: '均衡型公共词条，伤害攻速双 +10%。',
    detail: '公共池（近战/远程/魔法共享）里少见的双加成词条，伤害与攻速各 +10%，整体收益可观。没有击退加成，适合本身击退够用或希望怪物不被推走的玩家。注意远程武器另有同名但数值不同的致命词条。'
  },
  {
    id: 'px_quick', name: '迅捷', en: 'Quick', cat: 'common', cls: 'all', art: 'megashark',
    stats: [['攻速', '+10%']],
    note: '纯攻速词条，手感提升立竿见影。',
    detail: '公共池的攻速专精词条：+10% 攻速，不改伤害面板。对攻速阈值敏感的武器（连枷、悠悠球、磨刀石叠加流）收益明显，也适合过渡期凑合用。'
  },
  {
    id: 'px_superior', name: '高端', en: 'Superior', cat: 'common', cls: 'all', art: 'ankh_shield',
    stats: [['伤害', '+10%'], ['暴击', '+3%'], ['击退', '+10%']],
    note: '通用池里攻守最均衡的过渡词条。',
    detail: '伤害、暴击、击退三项齐涨，整体价值在通用池中数一数二。刷不到神级/恶魔时的优秀过渡选择。'
  },
  {
    id: 'px_zealous', name: '狂热', en: 'Zealous', cat: 'common', cls: 'all', art: 'ankh_shield',
    stats: [['暴击', '+5%']],
    note: '纯暴击词条，走暴击流的过渡用。',
    detail: '通用池的暴击专精词条：+5% 暴击，不改其他面板。适合搭配高基础暴击的武器走暴击流。'
  },
  {
    id: 'px_murderous', name: '残暴', en: 'Murderous', cat: 'common', cls: 'all', art: 'megashark',
    stats: [['伤害', '+7%'], ['攻速', '+6%'], ['暴击', '+3%']],
    note: '公共池的三项全能词条，小加成叠出大收益。',
    detail: '近战/远程/魔法共享池里少有的三属性词条：伤害、攻速、暴击各涨一截，综合收益仅次于致命。适合追求均衡的玩家。'
  },
  {
    id: 'px_agile', name: '灵活', en: 'Agile', cat: 'common', cls: 'all', art: 'megashark',
    stats: [['攻速', '+10%'], ['暴击', '+3%']],
    note: '攻速带一点暴击的公共词条。',
    detail: '公共池的速度向词条：+10% 攻速外加 +3% 暴击，比纯迅捷多一点输出，过渡期好用。'
  },
  {
    id: 'px_savage', name: '凶残', en: 'Savage', cat: 'common', cls: 'melee', art: 'terra_blade',
    stats: [['伤害', '+10%'], ['体积', '+10%'], ['击退', '+10%']],
    note: '近战池的均衡型词条，三项 +10%。',
    detail: '近战池里少有的三属性词条：伤害、武器体积、击退全部 +10%。刷不到神级时的稳定过渡，体积加成还能扩大判定。'
  },
  {
    id: 'px_sharp', name: '锋利', en: 'Sharp', cat: 'common', cls: 'melee', art: 'terra_blade',
    stats: [['伤害', '+15%']],
    note: '纯伤害词条，数值与神级的伤害档持平。',
    detail: '近战池的伤害专精：+15% 伤害，其他属性不动。适合已经满意武器速度和击退、只想拉伤害的玩家。'
  },
  {
    id: 'px_dangerous', name: '危险', en: 'Dangerous', cat: 'common', cls: 'melee', art: 'terra_blade',
    stats: [['伤害', '+5%'], ['暴击', '+2%'], ['体积', '+5%']],
    note: '三项小加成的温和过渡词条。',
    detail: '近战池的低配全能：伤害、暴击、体积各小幅上涨。前期随便刷刷就有，中期尽快换掉。'
  },
  {
    id: 'px_rapid', name: '迅速', en: 'Rapid', cat: 'common', cls: 'ranged', art: 'megashark',
    stats: [['攻速', '+15%'], ['弹速', '+10%']],
    note: '链式机枪的专属毕业词条。',
    detail: '远程池的速度顶点：+15% 攻速外加 +10% 弹速。链式机枪因为射速太快刷不到提速类词条，迅速是它的毕业选择；其他高射速武器也常拿它当过渡虚幻。'
  },
  {
    id: 'px_sighted', name: '精准', en: 'Sighted', cat: 'common', cls: 'ranged', art: 'megashark',
    stats: [['伤害', '+10%'], ['暴击', '+3%']],
    note: '远程池的伤害暴击双加成过渡。',
    detail: '远程池里攻暴双涨的实用词条，虚幻之前的稳定过渡选择。'
  },
  {
    id: 'px_staunch', name: '可靠', en: 'Staunch', cat: 'common', cls: 'ranged', art: 'megashark',
    stats: [['伤害', '+10%'], ['击退', '+15%']],
    note: '远程池的伤害击退双加成。',
    detail: '远程池里伤害与击退齐涨的词条，+15% 击退能显著改善控制感，适合喜欢把怪推开的玩家。'
  },
  {
    id: 'px_mystic', name: '神秘', en: 'Mystic', cat: 'common', cls: 'magic', art: 'crystal_storm',
    stats: [['伤害', '+10%'], ['魔耗', '-15%']],
    note: '省蓝流魔法武器过渡词条。',
    detail: '魔法池里伤害与魔耗双优的词条：+10% 伤害还省 15% 魔力。魔力上限吃紧的前中期非常实用。'
  },
  {
    id: 'px_masterful', name: '精湛', en: 'Masterful', cat: 'common', cls: 'magic', art: 'crystal_storm',
    stats: [['伤害', '+15%'], ['魔耗', '-15%'], ['击退', '+5%']],
    note: '神话之下的魔法全能词条。',
    detail: '魔法池里伤害与神话持平（+15%）、还省 15% 魔力的强力词条，只是暴击和击退加成略逊。魔力上限偏低的法师刷出精湛可以先用到毕业。'
  },
  {
    id: 'px_eager', name: '热切', en: 'Eager', cat: 'common', cls: 'summon', art: 'imp_staff',
    stats: [['穿透', '+25']],
    note: '纯穿透词条，不依赖鞭子的召唤流优选。',
    detail: '召唤专属池的穿透顶点：+25 盔甲穿透，无视敌方防御直接增伤。不常用鞭子（用不上标记伤害）的玩家，热切的实战伤害常常比传说更稳；对防御不高的敌人也表现优秀。'
  },
  {
    id: 'px_loyal', name: '忠诚', en: 'Loyal', cat: 'common', cls: 'summon', art: 'imp_staff',
    stats: [['伤害', '+10%'], ['穿透', '+5'], ['标记伤害', '+3'], ['击退', '+5%']],
    note: '召唤池的均衡型过渡词条。',
    detail: '召唤池里四项小加成齐全的词条：伤害、穿透、标记伤害、击退全有。刷不到传说时的靠谱过渡。'
  },
  {
    id: 'px_broken', name: '碎裂', en: 'Broken', cat: 'bad', cls: 'all', art: 'terra_blade',
    stats: [['伤害', '-30%'], ['击退', '-20%']],
    note: '伤害与击退双砍的负面词条。',
    detail: '重铸的常见坑：伤害直降 30%，击退也砍 20%，但攻速不受影响。捡到碎裂武器先看裸装数据，过渡能用就用，否则直接卖商店换重铸资金。'
  },
  {
    id: 'px_damaged', name: '破损', en: 'Damaged', cat: 'bad', cls: 'all', art: 'terra_blade',
    stats: [['伤害', '-15%']],
    note: '纯伤害惩罚的轻度负面词条。',
    detail: '只砍 15% 伤害、不碰其他属性的负面词条，在负面词条里算温和的。过渡期勉强能用，重铸一次大概率更好。'
  },
  {
    id: 'px_shoddy', name: '粗劣', en: 'Shoddy', cat: 'bad', cls: 'all', art: 'terra_blade',
    stats: [['伤害', '-10%'], ['击退', '-15%']],
    note: '伤害与击退双降的负面词条。',
    detail: '伤害 -10%、击退 -15%，攻速不受影响。比碎裂轻一点，思路相同：对比裸装数据，不值得留就卖掉。'
  },
  {
    id: 'px_sluggish', name: '迟钝', en: 'Sluggish', cat: 'bad', cls: 'all', art: 'megashark',
    stats: [['攻速', '-20%']],
    note: '攻速大砍的负面词条，手感明显变差。',
    detail: '公共池的负面词条：攻速直降 20%，不碰伤害。对依赖攻速的武器（连枷、悠悠球）是灾难，优先重铸掉。'
  },
  {
    id: 'px_annoying', name: '惹恼', en: 'Annoying', cat: 'bad', cls: 'all', art: 'megashark',
    stats: [['伤害', '-20%'], ['攻速', '-15%']],
    note: '伤害攻速双砍，负面词条里的重灾区。',
    detail: '伤害 -20%、攻速 -15%，双项全砍非常伤。捡到惹恼的装备建议直接重铸或卖商店。'
  }
]

const ACCESSORY_LINES = [
  {
    key: 'dmg', name: '伤害系', best: '险恶', icon: 'terra_blade',
    desc: '每一档提升 1%~4% 全伤害，输出流毕业选择。',
    tiers: [
      { name: '锯齿', en: 'Jagged', val: '+1%' },
      { name: '尖刺', en: 'Spiked', val: '+2%' },
      { name: '愤怒', en: 'Angry', val: '+3%' },
      { name: '险恶', en: 'Menacing', val: '+4%', best: true }
    ]
  },
  {
    key: 'crit', name: '暴击系', best: '幸运', icon: 'megashark',
    desc: '只有两档：+2% 与 +4% 暴击率，直接刷到幸运为止。',
    tiers: [
      { name: '精确', en: 'Precise', val: '+2%' },
      { name: '幸运', en: 'Lucky', val: '+4%', best: true }
    ]
  },
  {
    key: 'def', name: '防御系', best: '护佑', icon: 'ankh_shield',
    desc: '每一档 +1~+4 点防御，肉度流与大师范毕业选择。',
    tiers: [
      { name: '坚硬', en: 'Hard', val: '+1' },
      { name: '守护', en: 'Guarding', val: '+2' },
      { name: '装甲', en: 'Armored', val: '+3' },
      { name: '护佑', en: 'Warding', val: '+4', best: true }
    ]
  },
  {
    key: 'spd', name: '移速系', best: '迅捷', icon: 'hermes_boots',
    desc: '提升 1%~4% 移动速度，走位流与风筝流毕业选择。',
    tiers: [
      { name: '轻快', en: 'Brisk', val: '+1%' },
      { name: '快速', en: 'Fleeting', val: '+2%' },
      { name: '急速', en: 'Hasty', val: '+3%' },
      { name: '迅捷', en: 'Quick', val: '+4%', best: true }
    ]
  },
  {
    key: 'mspd', name: '近战速度系', best: '暴力', icon: 'terra_blade',
    desc: '提升 1%~4% 近战挥舞速度，影响近战武器与鞭子。',
    tiers: [
      { name: '狂野', en: 'Wild', val: '+1%' },
      { name: '鲁莽', en: 'Rash', val: '+2%' },
      { name: '勇猛', en: 'Intrepid', val: '+3%' },
      { name: '暴力', en: 'Violent', val: '+4%', best: true }
    ]
  },
  {
    key: 'mana', name: '魔力系', best: '奥秘', icon: 'crystal_storm',
    desc: '唯一档位：+20 最大魔力，前期法系续航过渡可用。',
    tiers: [
      { name: '奥秘', en: 'Arcane', val: '+20', best: true }
    ]
  }
]

const TIPS = [
  { t: '重铸在哪做', d: '哥布林工匠提供重铸服务：击败哥布林入侵军队后，被绑住的哥布林工匠会开始稀有地生成在洞穴层的开放区域，与他对话解救即可（解救后若死亡会重新生成）；入住后把武器/饰品放进重铸栏刷新词条。' },
  { t: '费用规律', d: '重铸费用与物品价值成正比：前期铁器几十银一次，毕业武器刷一次可达数铂金。金币别存着——词条提升是实打实的战力。' },
  { t: '毕业词条概率低', d: '传奇/虚幻/神话在各自词条池里权重不高，平均要刷几十次才能出货。心态放平，把重铸当成装备养成的最后一环。' },
  { t: '饰品词条按流派选', d: '输出流全险恶(+4%伤害)、生存流全护佑(+4防御)、风筝流全迅捷(+4%移速)、暴击流全幸运(+4%暴击)。混搭亦可：近战贴脸流常见"半险恶半护佑"。' },
  { t: '召唤与特殊武器', d: '1.4.5 起召唤武器有专属词条池，毕业是传说(+15%伤害+10穿透+3标记伤害)；1.4.4 及以下版本没有该池，毕业用无情(+18%伤害)。鞭子吃近战池刷传奇。无情在弩箭法杖、星尘龙、沙漠虎这类高基础伤害召唤上理论输出更高。' },
  { t: '负面词条处理', d: '碎裂/破损/迟钝/惹恼等词条纯负收益：捡到的带词条装备先对比裸装数据，过渡可用则用，否则直接卖商店换重铸资金。' }
]

module.exports = { PREFIXES, ACCESSORY_LINES, TIPS }
