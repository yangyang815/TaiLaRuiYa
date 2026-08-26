// 武器与饰品重铸词条图鉴（哥布林工匠重铸系统）
// cat: best=毕业词条 common=通用词条 bad=负面词条 acc=饰品词条
const PREFIXES = [
  {
    id: 'px_legendary', name: '传说', en: 'Legendary', cat: 'best', cls: 'melee', art: 'terra_blade',
    stats: [['伤害', '+15%'], ['攻速', '+15%'], ['暴击', '+10%'], ['体积', '+10%'], ['击退', '+15%']],
    note: '近战武器的终极词条，五项属性全拉满。天顶剑配传说就是毕业的仪式感。',
    detail: '近战专属词条池的顶点：伤害、攻速、暴击、武器体积、击退全部获得最高档加成。剑、矛、悠悠球、鞭子等近战武器都以此为目标。体积+10%会扩大攻击判定范围，实战中比面板更值钱。'
  },
  {
    id: 'px_unreal', name: '虚幻', en: 'Unreal', cat: 'best', cls: 'ranged', art: 'megashark',
    stats: [['伤害', '+15%'], ['攻速', '+10%'], ['暴击', '+10%'], ['弹速', '+10%'], ['击退', '+15%']],
    note: '远程武器毕业词条。弹速加成让子弹飞得更直更快。',
    detail: '远程专属的终极词条。弹速+10%常被忽视：子弹飞得更快意味着弹道下坠更少、远距离命中更稳，对机枪/连弩类武器是质变。迷你鲨刷出虚幻的那一刻就是远程成型的标志。'
  },
  {
    id: 'px_mythical', name: '神话', en: 'Mythical', cat: 'best', cls: 'magic', art: 'crystal_storm',
    stats: [['伤害', '+15%'], ['攻速', '+10%'], ['暴击', '+10%'], ['魔耗', '-20%'], ['击退', '+15%']],
    note: '魔法武器毕业词条。魔耗-20%对高频法术省下一大瓶蓝药。',
    detail: '魔法专属的终极词条。魔力消耗-20%是法师的命根子：高频弹幕法术（如水晶风暴）长时间开火时，魔耗降低直接等于续航翻倍。五项加成全为正且都在最高档。'
  },
  {
    id: 'px_ruthless', name: '无情', en: 'Ruthless', cat: 'best', cls: 'summon', art: 'stardust_dragon',
    stats: [['伤害', '+18%'], ['击退', '-10%']],
    note: '召唤武器理论最优：召唤物不吃攻速/暴击，18%伤害是全词条最高。',
    detail: '召唤武器吃不到攻速与暴击（召唤物的攻击频率和暴击由自身AI决定），因此伤害+18%的无情是召唤法杖的理论毕业词条。代价是击退-10%，但召唤流大多靠数量压制，击退影响有限。'
  },
  {
    id: 'px_godly', name: '神圣', en: 'Godly', cat: 'common', cls: 'all', art: 'ankh_shield',
    stats: [['伤害', '+15%'], ['暴击', '+10%'], ['击退', '+15%']],
    note: '三系通用的强力词条，不能刷传说/虚幻/神话的武器用它兜底。',
    detail: '近战/远程/魔法词条池共享的高伤词条：伤害与暴击都是最高档，但没有攻速加成。部分特殊武器（无攻速概念的投掷/召唤类）刷不出本系毕业词条时，神圣就是事实上的毕业选择。'
  },
  {
    id: 'px_demonic', name: '恶魔', en: 'Demonic', cat: 'common', cls: 'all', art: 'ankh_shield',
    stats: [['伤害', '+15%'], ['暴击', '+10%']],
    note: '纯输出向通用词条：伤害暴击双最高档，无击退加成。',
    detail: '与神圣同档的输出词条，差异只在没有击退加成。对自带强击退或不需要击退的武器（如持续弹幕类），恶魔与神圣实战等价，出哪个用哪个。'
  },
  {
    id: 'px_deadly', name: '致命', en: 'Deadly', cat: 'common', cls: 'all', art: 'ankh_shield',
    stats: [['伤害', '+10%'], ['攻速', '+10%']],
    note: '攻速手感党的过渡选择，伤害攻速双+10%。',
    detail: '全武器通用的均衡词条：输出提升约21%（乘算），且攻速加成改善手感。重铸路上刷到致命可以先凑合用，等钱包鼓了再追毕业词条。'
  },
  {
    id: 'px_quick', name: '轻快', en: 'Quick', cat: 'common', cls: 'all', art: 'ankh_shield',
    stats: [['攻速', '+10%']],
    note: '通用攻速词条，依赖攻击频率的武器前期可用。',
    detail: '只加攻速不加伤害的通用词条。对断钢剑这类靠攻速吃饭的武器前期价值不低，但作为过渡词条，重铸预算充足时值得继续往上刷。'
  },
  {
    id: 'px_broken', name: '破碎', en: 'Broken', cat: 'bad', cls: 'all', art: 'molten_pick',
    stats: [['伤害', '-30%'], ['攻速', '-20%'], ['击退', '-20%']],
    note: '全词条最差：三围齐砍，拿到立刻重铸或扔商店。',
    detail: '负面词条垫底档：伤害直接砍三成，攻速与击退同步下滑。新手期金币紧张时宁可裸装也别用破碎武器开荒——输出效率还不如上一把无词条的旧武器。'
  },
  {
    id: 'px_damaged', name: '损坏', en: 'Damaged', cat: 'bad', cls: 'all', art: 'molten_pick',
    stats: [['伤害', '-15%'], ['攻速', '-10%'], ['击退', '-10%']],
    note: '中档负面词条，同样是白给都不要的水平。',
    detail: '破碎的缩水版：伤害-15%依旧是实打实的输出缺口。开箱捡到带损坏词条的武器时，先对比手里的裸装再决定要不要换。'
  },
  {
    id: 'px_shoddy', name: '粗劣', en: 'Shoddy', cat: 'bad', cls: 'all', art: 'molten_pick',
    stats: [['伤害', '-10%'], ['攻速', '-10%'], ['击退', '-10%']],
    note: '负面词条里的"轻伤"，但依然是负收益。',
    detail: '负面档位里最轻的一档，三项各-10%。即便如此也是纯负收益，除非过渡期没得选，否则一律重铸掉。'
  },
  {
    id: 'px_sluggish', name: '迟缓', en: 'Sluggish', cat: 'bad', cls: 'all', art: 'molten_pick',
    stats: [['攻速', '-20%']],
    note: '攻速毁灭者：高频武器手感直接报废。',
    detail: '攻速类负面词条：攻速-20%对连弩、链条刀这类依赖频率的武器是毁灭性打击，DPS与手感双双崩盘。看到"迟缓/缓慢/懒惰"一族请直接重铸。'
  },
  {
    id: 'px_annoying', name: '烦人', en: 'Annoying', cat: 'bad', cls: 'all', art: 'molten_pick',
    stats: [['击退', '-20%']],
    note: '击退类负面：控场型武器最怕它。',
    detail: '击退-20%对大剑、锤类靠击退保命控场的武器是硬伤——怪贴脸打不退。输出数值虽然没变，但生存压力显著上升，控场武器务必刷掉。'
  }
]

// 饰品词条：四条成长线 × 四档（Warding/Menacing/Quick/Lucky 为各线毕业）
const ACCESSORY_LINES = [
  {
    key: 'dmg', name: '伤害系', best: '凶残', icon: 'terra_blade',
    desc: '每一档提升 1%~4% 全伤害，输出流毕业选择。',
    tiers: [
      { name: '锯齿', en: 'Jagged', val: '+1%' },
      { name: '尖刺', en: 'Spiked', val: '+2%' },
      { name: '愤怒', en: 'Angry', val: '+3%' },
      { name: '凶残', en: 'Menacing', val: '+4%', best: true }
    ]
  },
  {
    key: 'crit', name: '暴击系', best: '幸运', icon: 'megashark',
    desc: '提升 1%~4% 暴击率，与高基础暴击武器配合收益最高。',
    tiers: [
      { name: '敏锐', en: 'Keen', val: '+1%' },
      { name: '热忱', en: 'Zealous', val: '+2%' },
      { name: '精准', en: 'Precise', val: '+3%' },
      { name: '幸运', en: 'Lucky', val: '+4%', best: true }
    ]
  },
  {
    key: 'def', name: '防御系', best: '庇护', icon: 'ankh_shield',
    desc: '每一档 +1~+4 点防御，肉度流与大师范毕业选择。',
    tiers: [
      { name: '坚硬', en: 'Hard', val: '+1' },
      { name: '守护', en: 'Guarding', val: '+2' },
      { name: '护甲', en: 'Armored', val: '+3' },
      { name: '庇护', en: 'Warding', val: '+4', best: true }
    ]
  },
  {
    key: 'spd', name: '移速系', best: '迅捷', icon: 'hermes_boots',
    desc: '提升 1%~4% 移动速度，走位流与风筝流毕业选择。',
    tiers: [
      { name: '轻快', en: 'Brisk', val: '+1%' },
      { name: '疾行', en: 'Fleeting', val: '+2%' },
      { name: '急速', en: 'Hasty', val: '+3%' },
      { name: '迅捷', en: 'Quick', val: '+4%', best: true }
    ]
  }
]

const TIPS = [
  { t: '重铸在哪做', d: '哥布林工匠提供重铸服务：击败哥布林入侵军队后，去洞穴层解救"被绑住的哥布林工匠"，入住后把武器/饰品放进重铸栏即可刷新词条。' },
  { t: '费用规律', d: '重铸费用与物品价值成正比：前期铁器几十银一次，毕业武器刷一次可达数铂金。金币别存着——词条提升是实打实的战力。' },
  { t: '毕业词条概率低', d: '传说/虚幻/神话在各自词条池里权重不高，平均要刷几十次才能出货。心态放平，把重铸当成装备养成的最后一环。' },
  { t: '饰品词条按流派选', d: '输出流全凶残(+4%伤害)、生存流全庇护(+4防御)、风筝流全迅捷(+4%移速)、暴击流全幸运(+4%暴击)。混搭亦可：近战贴脸流常见"半凶残半庇护"。' },
  { t: '召唤与特殊武器', d: '召唤法杖吃不到攻速/暴击，无情(+18%伤害)是理论最优；悠悠球与鞭子属于近战池，可以刷传说。' },
  { t: '负面词条处理', d: '破碎/损坏/迟缓/烦人等词条纯负收益：捡到的带词条装备先对比裸装数据，过渡可用则用，否则直接卖商店换重铸资金。' }
]

module.exports = { PREFIXES, ACCESSORY_LINES, TIPS }
