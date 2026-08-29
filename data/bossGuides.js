// Boss 攻略清单：召唤方式 / 准备清单（可打勾）/ 战后收获
// order: 推荐挑战顺序（0 = 事件/特殊，不编号）；required: 击败后才推进度
// prep 条目: { id, cat(分类), icon, name, desc, link(可选，跳图鉴) }
const CATS = { '场地': '🛠', '战士': '⚔️', '射手': '🏹', '法师': '🔮', '召唤师': '🪄', '盔甲': '🛡', '饰品': '💍', '药水': '🧪', '技巧': '📌' }

module.exports = {
  CATS,
  GUIDES: {
    /* ================= 困难模式前 ================= */
    king_slime: {
      order: 1, required: false,
      summon: {
        condition: '史莱姆雨事件击杀 150 只史莱姆后出现；稀有自然生成',
        material: '史莱姆王冠（凝胶×20 + 金冠/铂金冠 @祭坛）主动召唤',
        tip: '史莱姆雨是最简单的触发方式，下雨天蹲守即可'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '搭两层平台', desc: '上层平台他传送不上来，基本无伤' },
        { id: 'w1', cat: '战士', icon: '⚔️', name: '金/铂金剑 + 火枪', desc: '近战站脸输出即可', link: 'gold_broadsword' },
        { id: 'w2', cat: '射手', icon: '🏹', name: '金弓 + 小丑之箭', desc: '放风筝最安全', link: 'iron_bow' },
        { id: 'w3', cat: '法师', icon: '🔮', name: '宝石法杖（紫晶/黄玉）', desc: '远程消耗即可' },
        { id: 'ar', cat: '盔甲', icon: '🛡', name: '金/铂金盔甲', desc: '过渡期防御足够', link: 'gold_armor_set' },
        { id: 'p1', cat: '药水', icon: '🧪', name: '铁皮药水 + 再生药水', desc: '提升容错率', link: 'iron_skin' },
        { id: 't1', cat: '技巧', icon: '📌', name: '躲开大跳落点', desc: '落地有冲击波，注意跳跃节奏' }
      ],
      post: {
        unlocks: ['坐骑史莱姆鞍（概率掉落）'],
        next: '属性碾压即可通过，接着挑战克苏鲁之眼', nextId: 'eye_of_cthulhu'
      }
    },

    eye_of_cthulhu: {
      order: 2, required: false,
      summon: {
        condition: '夜晚 19.5% 概率自然生成（HP≥200 且防御≥10）',
        material: '可疑眼球（晶状体×6 @恶魔祭坛）主动召唤',
        tip: '⚠️ 只在夜晚出现，黎明后会直接消失'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '搭 200 格以上长平台', desc: '一阶段横向跑动躲冲撞' },
        { id: 'w1', cat: '战士', icon: '⚔️', name: '金剑 / 火枪', desc: '冲撞间隙贴脸输出', link: 'gold_broadsword' },
        { id: 'w2', cat: '射手', icon: '🏹', name: '金弓 + 燃烧箭', desc: '最稳健的打法', link: 'iron_bow' },
        { id: 'ar', cat: '盔甲', icon: '🛡', name: '金/铂金盔甲', desc: '或沙漠化石套（射手）', link: 'gold_armor_set' },
        { id: 's1', cat: '饰品', icon: '💍', name: '云朵瓶（二段跳）', desc: '二阶段垂直躲避冲撞', link: 'cloud_bottle' },
        { id: 'p1', cat: '药水', icon: '🧪', name: '铁皮 + 再生 + 敏捷药水', desc: '三件套大幅提升容错', link: 'swiftness' },
        { id: 't1', cat: '技巧', icon: '📌', name: '二阶段垂直跳躲冲撞', desc: '他冲撞前会后退蓄力，垂直跳最稳' }
      ],
      post: {
        unlocks: ['魔矿/猩红矿（做邪恶套装）', '专家模式：克苏鲁护盾（冲刺饰品）'],
        next: '用掉落的魔矿/猩红矿做邪恶套装，挑战世界吞噬怪/克苏鲁之脑', nextId: 'eater_of_worlds'
      }
    },

    eater_of_worlds: {
      order: 3, required: false,
      summon: {
        condition: '腐化之地裂谷敲碎 3 颗暗影珠',
        material: '蠕虫诱饵（魔粉×15 + 腐肉×30）召唤（仅腐化世界）',
        tip: '⚠️ 敲第三颗暗影珠时世界吞噬怪直接降临，提前做好准备'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '裂谷搭绳索 + 底部封闭小屋', desc: '把虫子引到封闭空间打' },
        { id: 'w1', cat: '战士', icon: '⚔️', name: '链球 / 阳炎之怒', desc: '穿透武器是蠕虫天敌', link: 'volcano' },
        { id: 'w2', cat: '射手', icon: '🏹', name: '火枪 + 流星弹', desc: '流星弹穿透多节身体', link: 'musket' },
        { id: 'w3', cat: '法师', icon: '🔮', name: '宝石法杖', desc: '远程清理身体节段' },
        { id: 'ar', cat: '盔甲', icon: '🛡', name: '金/铂金盔甲', desc: '打完就能换暗影套', link: 'gold_armor_set' },
        { id: 'p1', cat: '药水', icon: '🧪', name: '铁皮 + 再生药水', desc: '虫子贴脸伤害不低', link: 'iron_skin' },
        { id: 't1', cat: '技巧', icon: '📌', name: '攻击头部可一击全灭', desc: '头部防御为 0，杀死头部全虫即死' },
        { id: 't2', cat: '技巧', icon: '📌', name: '斩断身体会分裂', desc: '别贪刀把虫子切碎，越切越多' }
      ],
      post: {
        unlocks: ['暗影套装（魔矿+暗影鳞片）', '梦魇镐（挖地狱矿必备）'],
        next: '做暗影套+梦魇镐，下地狱挖狱石，挑战骷髅王', nextId: 'skeletron'
      }
    },

    brain_of_cthulhu: {
      order: 3, required: false,
      summon: {
        condition: '猩红之地敲碎 3 颗猩红之心',
        material: '血腥脊椎（椎骨×15 + 毒粉×30）召唤（仅猩红世界）',
        tip: '⚠️ 敲第三颗猩红之心时克苏鲁之脑直接降临'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '猩红洞穴挖大空间', desc: '一阶段环绕弹幕需要空间' },
        { id: 'w1', cat: '战士', icon: '⚔️', name: '链刃 / 荆棘刃', desc: '一阶段清爬行者效率优先', link: 'blade_of_grass' },
        { id: 'w2', cat: '射手', icon: '🏹', name: '火枪 + 流星弹', desc: '穿透清理爬行者', link: 'musket' },
        { id: 'ar', cat: '盔甲', icon: '🛡', name: '金/铂金盔甲', desc: '打完换猩红套', link: 'gold_armor_set' },
        { id: 's1', cat: '饰品', icon: '💍', name: '克苏鲁护盾（专家）', desc: '冲刺躲二阶段冲撞', link: 'eye_of_cthulhu' },
        { id: 'p1', cat: '药水', icon: '🧪', name: '铁皮 + 再生药水', desc: '标准配置', link: 'iron_skin' },
        { id: 't1', cat: '技巧', icon: '📌', name: '二阶段盯紧真身', desc: '真身受击会短暂变色，幻象不造成伤害' }
      ],
      post: {
        unlocks: ['猩红套装（猩红矿+组织样本）', '死亡代言人镐（挖地狱矿）'],
        next: '做猩红套装，下地狱挖狱石，挑战骷髅王', nextId: 'skeletron'
      }
    },

    queen_bee: {
      order: 4, required: false,
      summon: {
        condition: '地下丛林蜂巢中破坏蜂王幼虫',
        material: '憎恶之蜂（蜂蜜块+毒刺+蜂巢块+瓶装蜂蜜 @铁砧）主动召唤',
        tip: '蜂巢里自带蜂蜜池，泡蜂蜜有生命再生buff但移动迟缓'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '蜂巢内就地搭平台', desc: '把蜂巢掏空搭 2-3 层' },
        { id: 'w1', cat: '战士', icon: '⚔️', name: '邪恶套装级近战武器', desc: '三连冲撞间隙输出', link: 'light_bane' },
        { id: 'w2', cat: '射手', icon: '🏹', name: '金弓 + 邪箭', desc: '远距离打毒刺弹幕间隙', link: 'iron_bow' },
        { id: 'w3', cat: '召唤师', icon: '🪄', name: '蜂王套 + 史莱姆法杖', desc: '蜂蜡可合成蜂王盔甲', link: 'bee_armor' },
        { id: 'p1', cat: '药水', icon: '🧪', name: '铁皮 + 再生药水', desc: '蜂巢内空间小，容错优先', link: 'iron_skin' },
        { id: 't1', cat: '技巧', icon: '📌', name: '左右横移躲毒刺', desc: '毒刺弹幕有固定节奏' },
        { id: 't2', cat: '技巧', icon: '📌', name: '别在蜂蜜里硬拼', desc: '蜂蜜里移速大幅下降，容易被撞' }
      ],
      post: {
        unlocks: ['养蜂人（丛林期神武）', '蜂王盔甲（召唤师肉前毕业）'],
        next: '非必需Boss，打完接着推骷髅王', nextId: 'skeletron'
      }
    },

    skeletron: {
      order: 5, required: true,
      summon: {
        condition: '夜晚与地牢门口的"老人"对话召唤',
        material: '无需材料，对话即可（每晚一次）',
        tip: '⚠️ 必须在天亮前击败，否则黎明时你会被秒杀！'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '地牢门口沙漠/草地搭长平台', desc: '两层以上平台应对旋转头' },
        { id: 'w1', cat: '战士', icon: '⚔️', name: '暗影/猩红套武器 + 狱岩石武器', desc: '熔岩武器是当前版本最优', link: 'volcano' },
        { id: 'w2', cat: '射手', icon: '🏹', name: '蜂膝弓 / 战弓 + 邪箭', desc: '蜜蜂弹幕干扰他的攻击', link: 'bees_knees' },
        { id: 'w3', cat: '法师', icon: '🔮', name: '水矢（地牢书架）', desc: '弹射水矢打头效率极高', link: 'water_bolt' },
        { id: 'ar', cat: '盔甲', icon: '🛡', name: '熔岩盔甲（狱石套装）', desc: '肉前近战毕业', link: 'molten_armor' },
        { id: 's1', cat: '饰品', icon: '💍', name: '克苏鲁护盾 + 云朵瓶', desc: '冲刺+二段跳必备', link: 'cloud_bottle' },
        { id: 'p1', cat: '药水', icon: '🧪', name: '铁皮 + 再生 + 敏捷药水', desc: '标准三件套', link: 'swiftness' },
        { id: 't1', cat: '技巧', icon: '📌', name: '优先打掉两只手', desc: '手被毁后只剩头转圈，威胁大减' },
        { id: 't2', cat: '技巧', icon: '📌', name: '头旋转时拉开距离', desc: '旋转撞击防御减半但伤害高' }
      ],
      post: {
        unlocks: ['地牢全面开放（暗影珠/水矢/骨制装备）', '机械骷髅王召唤材料来源之一'],
        next: '搜刮地牢后下地狱，准备决战血肉墙', nextId: 'wall_of_flesh'
      }
    },

    deerclops: {
      order: 6, required: false,
      summon: {
        condition: '雪原生物群系夜晚自然生成（1/3 概率每晚）',
        material: '鹿之物事（雪原相关材料合成）在雪原使用',
        tip: '只能在雪原召唤，跑到别处会消失'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '雪原搭长平台', desc: '应对他的冰霜弹幕' },
        { id: 'w1', cat: '战士', icon: '⚔️', name: '熔岩级近战武器', desc: '近战站撸即可', link: 'volcano' },
        { id: 'w2', cat: '射手', icon: '🏹', name: '蜂膝弓 / 战弓', desc: '保持距离打', link: 'bees_knees' },
        { id: 'ar', cat: '盔甲', icon: '🛡', name: '熔岩/暗影/猩红套', desc: '肉前毕业装', link: 'molten_armor' },
        { id: 's1', cat: '饰品', icon: '💍', name: '克苏鲁护盾', desc: '冲刺躲跳跃砸地', link: 'eye_of_cthulhu' },
        { id: 't1', cat: '技巧', icon: '📌', name: '躲开影子砸地点', desc: '跳跃砸地前地上会出现影子' },
        { id: 't2', cat: '技巧', icon: '📌', name: '移动躲冰弹幕', desc: '冰锥呈扇形发射，横移躲避' }
      ],
      post: {
        unlocks: ['眼球伞（专家坐骑）', '鹿角怪掉落物'],
        next: '非必需Boss，打完即可决战血肉墙', nextId: 'wall_of_flesh'
      }
    },

    wall_of_flesh: {
      order: 7, required: true,
      summon: {
        condition: '将向导巫毒娃娃扔进地狱的熔岩中',
        material: '向导巫毒娃娃（地狱的巫毒恶魔掉落）',
        tip: '⚠️ 扔进熔岩前请确保向导存活！否则Boss不会生成'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '地狱修建 1000 格实体平台跑道', desc: '肉山从一侧推到另一侧，需要长距离移动' },
        { id: 'a2', cat: '场地', icon: '🛠', name: '清理跑道障碍物', desc: '拆掉沿路建筑和多余方块，避免战斗中卡住' },
        { id: 'w1', cat: '战士', icon: '⚔️', name: '永夜之刃 / 暗黑长矛', desc: '近战攻击力高，适合肉山', link: 'nights_edge' },
        { id: 'w2', cat: '射手', icon: '🏹', name: '凤凰爆破枪（流星弹）/ 地狱之翼弓', desc: '远程输出稳定安全', link: 'phoenix_blaster' },
        { id: 'w3', cat: '法师', icon: '🔮', name: '恶魔锄刀 / 水矢', desc: '魔法伤害高，但需注意魔力', link: 'demon_scythe' },
        { id: 'w4', cat: '召唤师', icon: '🪄', name: '小鬼法杖（召唤小鬼）', desc: '召唤师专属选择', link: 'imp_staff' },
        { id: 'ar', cat: '盔甲', icon: '🛡', name: '熔岩 / 暗影 / 死灵盔甲', desc: '不同职业选择不同盔甲', link: 'necro_armor' },
        { id: 's1', cat: '饰品', icon: '💍', name: '克苏鲁之盾 + 云朵瓶 + 熔岩护身符', desc: '冲刺、二段跳、防岩浆三件套', link: 'lava_charm' },
        { id: 'p1', cat: '药水', icon: '🧪', name: '铁皮 + 再生 + 敏捷 + 箭术药水', desc: '大幅提升容错率', link: 'archery' },
        { id: 't1', cat: '技巧', icon: '📌', name: '不要回头，一直向前', desc: '战斗开始后边后退边输出，肉山会把你往世界边缘推' }
      ],
      post: {
        unlocks: ['困难模式开启', '新三矿生成（钴蓝/钯金、秘银/山铜、精金/钛金）', '职业徽章掉落'],
        next: '优先用神锤砸恶魔/猩红祭坛，再挖新三矿做盔甲 → 机械三王', nextId: 'twins'
      }
    },

    /* ================= 机械三王 ================= */
    queen_slime: {
      order: 8, required: false,
      summon: {
        condition: '在神圣之地（地表）使用明胶水晶',
        material: '明胶水晶（地下神圣之地采集，紫色水晶）',
        tip: '明胶水晶在珍珠石洞里发紫光，注意和水晶碎块区分'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '神圣之地搭长平台', desc: '应对她的传送和弹跳' },
        { id: 'w1', cat: '射手', icon: '🏹', name: '代达罗斯风暴弓 + 圣箭', desc: '机械期最强输出组合', link: 'daedalus_stormbow' },
        { id: 'w2', cat: '战士', icon: '⚔️', name: '钴蓝/钯金级武器', desc: '贴身打水晶史莱姆', link: 'cobalt_naginata' },
        { id: 'ar', cat: '盔甲', icon: '🛡', name: '钴蓝/钯金盔甲', desc: '新三矿第一梯队', link: 'cobalt_armor' },
        { id: 's1', cat: '饰品', icon: '💍', name: '翅膀（必须）', desc: '肉后第一件事就是做翅膀', link: 'leaf_wings' },
        { id: 't1', cat: '技巧', icon: '📌', name: '优先清小史莱姆', desc: '水晶史莱姆弹幕很烦，顺手清掉' }
      ],
      post: {
        unlocks: ['水晶刺客套装（过渡护甲）', '黏鞍坐骑（掉落）'],
        next: '非必需Boss，接着打机械三王', nextId: 'twins'
      }
    },

    twins: {
      order: 9, required: true,
      summon: {
        condition: '夜晚使用机械魔眼召唤',
        material: '机械魔眼（晶状体×3 + 铁锭×5 + 光明之魂×3 @秘银砧）',
        tip: '⚠️ 只在夜晚战斗，黎明后消失（视为失败）'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '搭 3 层以上大型平台', desc: '应对激光和火焰弹幕' },
        { id: 'w1', cat: '射手', icon: '🏹', name: '代达罗斯风暴弓 + 圣箭', desc: '垂直落箭安全高效', link: 'daedalus_stormbow' },
        { id: 'w2', cat: '战士', icon: '⚔️', name: '精金/钛金剑', desc: '注意二阶段激光', link: 'adamantite_glaive' },
        { id: 'w3', cat: '法师', icon: '🔮', name: '水晶蛇 / 流星法杖', desc: '钓鱼可得水晶蛇', link: 'crystal_serpent' },
        { id: 'w4', cat: '召唤师', icon: '🪄', name: '刀刃法杖 / 蜘蛛法杖', desc: '刀刃法杖忽视部分防御', link: 'blade_staff' },
        { id: 'ar', cat: '盔甲', icon: '🛡', name: '精金/钛金盔甲', desc: '或神圣盔甲（圣魂合成）', link: 'adamantite_armor' },
        { id: 's1', cat: '饰品', icon: '💍', name: '翅膀 + 克苏鲁护盾', desc: '垂直机动躲激光', link: 'demon_wings' },
        { id: 'p1', cat: '药水', icon: '🧪', name: '铁皮 + 再生 + 箭术/魔力药水', desc: '按职业选攻击药水', link: 'archery' },
        { id: 't1', cat: '技巧', icon: '📌', name: '先集火一只眼', desc: '视网膜激光眼威胁大，先杀激光眼' },
        { id: 't2', cat: '技巧', icon: '📌', name: '二阶段拉开距离', desc: '两只眼狂暴后速度加快' }
      ],
      post: {
        unlocks: ['神圣锭（做神圣装备）', '机械Boss魂（合成道具）'],
        next: '集齐三王后世纪之花球茎才会出现 → 毁灭者', nextId: 'destroyer'
      }
    },

    destroyer: {
      order: 10, required: true,
      summon: {
        condition: '夜晚使用机械蠕虫召唤',
        material: '机械蠕虫（腐肉/椎骨×6 + 铁锭×5 + 暗影之魂×3 @秘银砧）',
        tip: '身体极长，全程穿透武器输出，探针会掉落红心'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '大范围单层长平台', desc: '他贴地爬行，平台要够长' },
        { id: 'w1', cat: '射手', icon: '🏹', name: '代达罗斯风暴弓 + 圣箭', desc: '穿透多节身体，伤害爆炸', link: 'daedalus_stormbow' },
        { id: 'w2', cat: '战士', icon: '⚔️', name: '暗影焰刀 / 精金剑', desc: '穿透型近战优先', link: 'adamantite_glaive' },
        { id: 'w3', cat: '法师', icon: '🔮', name: '恶魔锄刀 / 水矢', desc: '穿透弹幕清理身体', link: 'demon_scythe' },
        { id: 'ar', cat: '盔甲', icon: '🛡', name: '精金/钛金/神圣盔甲', desc: '标准配置', link: 'adamantite_armor' },
        { id: 's1', cat: '饰品', icon: '💍', name: '翅膀 + 任意冲刺饰品', desc: '他钻地时飞起来', link: 'demon_wings' },
        { id: 't1', cat: '技巧', icon: '📌', name: '打探针回血', desc: '探针掉落红心，是补给来源' },
        { id: 't2', cat: '技巧', icon: '📌', name: '头部防御为 0', desc: '瞄准头部输出最高' }
      ],
      post: {
        unlocks: ['神圣锭 + 力量之魂', '机械Boss魂'],
        next: '三王最后一个 → 机械骷髅王', nextId: 'skeletron_prime'
      }
    },

    skeletron_prime: {
      order: 11, required: true,
      summon: {
        condition: '夜晚使用机械骷髅头召唤',
        material: '机械骷髅头（骨头×30 + 铁锭×5 + 光明之魂×3 + 暗影之魂×3 @秘银砧）',
        tip: '⚠️ 黎明前未击败他会直接消失'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '多层大平台', desc: '应对锯子/钳子/激光/炮四条手臂' },
        { id: 'w1', cat: '射手', icon: '🏹', name: '代达罗斯风暴弓 + 圣箭', desc: '机械期通用解', link: 'daedalus_stormbow' },
        { id: 'w2', cat: '战士', icon: '⚔️', name: '精金/钛金剑', desc: '优先拆手臂', link: 'adamantite_glaive' },
        { id: 'w3', cat: '法师', icon: '🔮', name: '水晶蛇 / 黄金淋浴', desc: '减防+持续输出', link: 'crystal_serpent' },
        { id: 'ar', cat: '盔甲', icon: '🛡', name: '精金/钛金/神圣盔甲', desc: '标准配置', link: 'adamantite_armor' },
        { id: 's1', cat: '饰品', icon: '💍', name: '翅膀 + 冲刺饰品', desc: '躲旋转冲撞', link: 'demon_wings' },
        { id: 't1', cat: '技巧', icon: '📌', name: '头旋转时拉远', desc: '旋转攻击伤害极高，别硬抗' },
        { id: 't2', cat: '技巧', icon: '📌', name: '可以只打头', desc: '手臂不用全拆，直接rush头部也行' }
      ],
      post: {
        unlocks: ['神圣锭 + 视界之魂', '机械三王全部击败后世纪之花出现'],
        next: '三王通关！去地下丛林找世纪之花球茎', nextId: 'plantera'
      }
    },

    mechdusa: {
      order: 0, required: false,
      summon: {
        condition: '仅在"万物"（GetFixedBoi/zz fix）种子世界，击败机械三王后',
        material: '同时使用三个机械召唤物之一召唤',
        tip: '旧主机版Boss奥克拉姆的致敬彩蛋，相当于机械三王合体'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '机械三王通用场地', desc: '多层大平台' },
        { id: 'w1', cat: '射手', icon: '🏹', name: '代达罗斯风暴弓 + 圣箭', desc: '机械期毕业装即可', link: 'daedalus_stormbow' },
        { id: 'ar', cat: '盔甲', icon: '🛡', name: '神圣/精金盔甲', desc: '战斗强度约等于三王连战', link: 'hallowed_armor' },
        { id: 't1', cat: '技巧', icon: '📌', name: '当成三王连战打', desc: '熟悉三王各自的机制即可' }
      ],
      post: {
        unlocks: ['旧主机版彩蛋物品（奥库瑞姆剃刀等）'],
        next: '特殊种子专属Boss，不影响主线进度', nextId: ''
      }
    },

    /* ================= 世纪之花后 ================= */
    plantera: {
      order: 12, required: true,
      summon: {
        condition: '击败全部机械三王后，地下丛林刷新世纪之花球茎，破坏后召唤',
        material: '世纪之花球茎（地下丛林自然生成，地图上可见）',
        tip: '⚠️ 别把她引到地表！离开地下丛林她会狂暴化'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '找到球茎后就地挖大空间', desc: '清理出 80×80 左右的战斗空间 + 两层平台' },
        { id: 'a2', cat: '场地', icon: '🛠', name: '提前规划逃跑路线', desc: '二阶段藤蔓追人时需要绕圈跑' },
        { id: 'w1', cat: '射手', icon: '🏹', name: '巨兽鲨 + 诅咒弹 / 战术霰弹枪', desc: '持续输出最稳', link: 'megashark' },
        { id: 'w2', cat: '战士', icon: '⚔️', name: '真断钢剑 / 死神镰刀（日食）', desc: '日食掉落的死神镰刀很好用', link: 'true_excalibur' },
        { id: 'w3', cat: '法师', icon: '🔮', name: '彩虹魔杖 / 毒牙法杖', desc: '高DPS法术弹幕', link: 'rainbow_rod' },
        { id: 'w4', cat: '召唤师', icon: '🪄', name: '刀刃法杖 + 蜘蛛套', desc: '召唤师机械期毕业', link: 'blade_staff' },
        { id: 'ar', cat: '盔甲', icon: '🛡', name: '神圣盔甲 / 叶绿盔甲', desc: '叶绿矿机械三王后可挖', link: 'chlorophyte_armor' },
        { id: 's1', cat: '饰品', icon: '💍', name: '翅膀 + 黑腰带', desc: '黑腰带可闪避攻击（地牢）', link: 'black_belt' },
        { id: 'p1', cat: '药水', icon: '🧪', name: '生命强制 + 铁皮 + 攻击药水', desc: '生命强制药水提供爆发回复', link: 'lifeforce' },
        { id: 't1', cat: '技巧', icon: '📌', name: '一阶段躲刺球', desc: '刺球有追踪弹道，别贴墙跑' },
        { id: 't2', cat: '技巧', icon: '📌', name: '二阶段绕圈跑', desc: '藤蔓伸长时贴着场地边缘绕大圈' }
      ],
      post: {
        unlocks: ['地下丛林神庙钥匙（开神庙门）', '世纪之花球茎掉落神庙钥匙', '地牢新增敌人/幽魂套装材料'],
        next: '拿神庙钥匙进神庙 → 石巨人', nextId: 'golem'
      }
    },

    golem: {
      order: 13, required: true,
      summon: {
        condition: '神庙最深处房间，用蜥蜴能量组件激活蜥蜴祭坛',
        material: '蜥蜴能量组件（神庙蜥蜴/飞蛇掉落，或神庙箱子里拿）',
        tip: '祭坛房间较小，可以先去神庙门口外面打'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '神庙祭坛房外搭平台', desc: '祭坛房间外搭两层平台更好打' },
        { id: 'w1', cat: '射手', icon: '🏹', name: '巨兽鲨 + 叶绿弹', desc: '叶绿弹自动追踪', link: 'megashark' },
        { id: 'w2', cat: '战士', icon: '⚔️', name: '无头骑士剑 / 真永夜之刃', desc: '南瓜月武器性能强', link: 'horseman' },
        { id: 'w3', cat: '法师', icon: '🔮', name: '彩虹魔杖 / 裂法杖', desc: '裂法杖（地牢幽魂）输出高', link: 'rainbow_rod' },
        { id: 'w4', cat: '召唤师', icon: '🪄', name: 'Terraprisma? 用乌鸦法杖/刃杖', desc: '石巨人前毕业召唤武器', link: 'raven_staff' },
        { id: 'ar', cat: '盔甲', icon: '🛡', name: '叶绿盔甲 / 幽魂盔甲', desc: '幽魂套（地牢幽魂）法师毕业', link: 'spectre_armor' },
        { id: 's1', cat: '饰品', icon: '💍', name: '翅膀 + 十字章护盾', desc: '十字章盾提供大量免疫', link: 'ankh_shield' },
        { id: 't1', cat: '技巧', icon: '📌', name: '躲拳头和跳跃', desc: '拳头伸出有前摇，跳跃砸地注意闪避' },
        { id: 't2', cat: '技巧', icon: '📌', name: '头部脱离身体后', desc: '二阶段头部飞行撞击，身体还会继续攻击' }
      ],
      post: {
        unlocks: ['拜月教徒事件触发条件', '石巨人掉落 HOTEU? 掉落甲虫壳? 掉落龟壳? 石巨人套装材料'],
        next: '击败后去地牢入口触发拜月教徒剧情', nextId: 'lunatic_cultist'
      }
    },

    duke_fishron: {
      order: 14, required: false,
      summon: {
        condition: '在海洋生物群系用松露虫钓鱼',
        material: '松露虫（地下发光蘑菇生物群落抓取，需虫网）',
        tip: '松露虫碰到玩家会被吃掉，用虫网从侧面快速抓'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '海洋旁搭超长平台', desc: '他的冲刺范围极大，场地越长越好' },
        { id: 'w1', cat: '射手', icon: '🏹', name: '巨兽鲨 + 叶绿弹 / 战术霰弹枪', desc: '花后毕业远程', link: 'megashark' },
        { id: 'w2', cat: '战士', icon: '⚔️', name: '真永夜 / 无头骑士剑', desc: '注意他冲出屏幕的时机', link: 'horseman' },
        { id: 'ar', cat: '盔甲', icon: '🛡', name: '叶绿 / 幽魂 / 甲虫盔甲', desc: '花后毕业套装', link: 'beetle_armor' },
        { id: 's1', cat: '饰品', icon: '💍', name: '翅膀 + 十字章护盾', desc: '机动性是存活关键', link: 'ankh_shield' },
        { id: 'p1', cat: '药水', icon: '🧪', name: '生命强制 + 攻击药水', desc: '他伤害极高，续航药水必备', link: 'lifeforce' },
        { id: 't1', cat: '技巧', icon: '📌', name: '一阶段躲气泡弹幕', desc: '气泡会追踪，保持横向移动' },
        { id: 't2', cat: '技巧', icon: '📌', name: '二阶段躲避冲刺', desc: '他会冲出屏幕再回撞，听音效提前跳' },
        { id: 't3', cat: '技巧', icon: '📌', name: '专家模式传送逃课', desc: '利用传送机关躲避最难阶段的连段' }
      ],
      post: {
        unlocks: ['猪龙鱼公爵掉落武器（海啸弓/泡泡枪等毕业级）'],
        next: '非必需但武器超值，接着推光之女皇/拜月教徒', nextId: 'empress_of_light'
      }
    },

    empress_of_light: {
      order: 15, required: false,
      summon: {
        condition: '夜晚在神圣之地击杀七彩草蛉',
        material: '七彩草蛉（夜晚神圣之地自然生成，稀有）',
        tip: '⚠️ 白天击杀她掉落泰拉棱镜（最强召唤武器），但白天战斗难度极高'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '神圣之地超大型多层平台', desc: '她的弹幕覆盖范围极大' },
        { id: 'w1', cat: '射手', icon: '🏹', name: '巨兽鲨+叶绿弹 / 海啸弓', desc: '高机动持续输出', link: 'megashark' },
        { id: 'w2', cat: '战士', icon: '⚔️', name: '真永夜 / 无头骑士剑', desc: '贴身风险高，注意闪避', link: 'horseman' },
        { id: 'ar', cat: '盔甲', icon: '🛡', name: '甲虫 / 幽魂 / 蘑菇矿盔甲', desc: '花后毕业套装', link: 'shroomite_armor' },
        { id: 's1', cat: '饰品', icon: '💍', name: '翅膀 + 十字章护盾 + 黑腰带', desc: '最大程度提升容错', link: 'ankh_shield' },
        { id: 't1', cat: '技巧', icon: '📌', name: '弹幕有固定图案', desc: '每种弹幕都有安全位，背板是关键' },
        { id: 't2', cat: '技巧', icon: '📌', name: '白天挑战需无伤', desc: '白天她的攻击全部秒杀，量力而行' }
      ],
      post: {
        unlocks: ['夜光套装材料', '泰拉棱镜（白天击杀限定）'],
        next: '非必需Boss，接着触发拜月教徒', nextId: 'lunatic_cultist'
      }
    },

    /* ================= 月亮事件 ================= */
    lunatic_cultist: {
      order: 16, required: true,
      summon: {
        condition: '击败石巨人后，前往地牢入口触发拜月教徒剧情（击杀教徒）',
        material: '无需材料，剧情触发',
        tip: '击杀蓝教徒后Boss出现，注意别打错分身'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '地牢入口前整平场地', desc: '他漂浮范围大，门口空地要平整' },
        { id: 'w1', cat: '射手', icon: '🏹', name: '海啸弓 / 巨兽鲨+叶绿弹', desc: '持续输出', link: 'megashark' },
        { id: 'w2', cat: '战士', icon: '⚔️', name: '无头骑士剑 / 泰拉刃', desc: '泰拉刃此时可合成', link: 'terra_blade' },
        { id: 'w3', cat: '法师', icon: '🔮', name: '彩虹魔杖 / 裂法杖', desc: '注意躲冰球', link: 'rainbow_rod' },
        { id: 'ar', cat: '盔甲', icon: '🛡', name: '甲虫 / 幽魂 / 蘑菇矿套', desc: '毕业级套装', link: 'beetle_armor' },
        { id: 's1', cat: '饰品', icon: '💍', name: '翅膀 + 十字章护盾', desc: '标准毕业配装', link: 'ankh_shield' },
        { id: 't1', cat: '技巧', icon: '📌', name: '别打分身！', desc: '分身阶段打错本体，会召唤幻影龙惩罚' },
        { id: 't2', cat: '技巧', icon: '📌', name: '躲避火球和冰球', desc: '弹幕速度不快，保持移动即可' }
      ],
      post: {
        unlocks: ['月亮事件开启（四柱降临）'],
        next: '击败四柱（日耀/星旋/星云/星尘）→ 月亮领主', nextId: 'moon_lord'
      }
    },

    moon_lord: {
      order: 17, required: true,
      summon: {
        condition: '击败全部四柱后 60 秒自然出现 / 使用天界符',
        material: '天界符（四柱碎片合成）主动召唤',
        tip: '最终Boss！战斗前把复活点设置在附近，摔死也是战术'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '大型多层平台 + 篝火 + 红心雕像', desc: '持续回复是持久战关键' },
        { id: 'a2', cat: '场地', icon: '🛠', name: '护士NPC搬到附近', desc: '经典逃课：残血传送回家找护士秒回' },
        { id: 'w1', cat: '射手', icon: '🏹', name: '幻象弓（星旋塔掉落）', desc: '攻速叠加机制伤害爆炸', link: 'vortex_beater' },
        { id: 'w2', cat: '战士', icon: '⚔️', name: '日耀喷发剑（日耀塔掉落）', desc: '穿透真眼范围输出', link: 'solar_armor' },
        { id: 'w3', cat: '法师', icon: '🔮', name: '星云烈焰（星云塔掉落）', desc: '自动追踪弹幕', link: 'nebula_blaze' },
        { id: 'w4', cat: '召唤师', icon: '🪄', name: '星尘之龙法杖（星尘塔）', desc: '龙会自动索敌', link: 'stardust_dragon' },
        { id: 'ar', cat: '盔甲', icon: '🛡', name: '日耀/星旋/星云/星尘毕业套', desc: '四塔碎片合成对应职业套', link: 'solar_armor' },
        { id: 's1', cat: '饰品', icon: '💍', name: '毕业饰品 + 复活雕像逃课', desc: '扑翅滑翔? 用悬浮板/女皇翅膀', link: 'celestial_shell' },
        { id: 'p1', cat: '药水', icon: '🧪', name: '生命强制 + 全攻击药水', desc: '最终决战全力输出', link: 'lifeforce' },
        { id: 't1', cat: '技巧', icon: '📌', name: '先打三只手', desc: '手部核心被毁后开真眼阶段' },
        { id: 't2', cat: '技巧', icon: '📌', name: '真眼激光贴地绕圈', desc: '月闪激光只在同水平面扫射，绕圈跑就行' }
      ],
      post: {
        unlocks: ['毕业！天顶剑组件、最终棱镜、彩虹猫之刃等毕业武器'],
        next: '恭喜通关！接下来可以刷事件Boss、成就、钓鱼收藏', nextId: ''
      }
    },

    /* ================= 事件Boss ================= */
    flying_dutchman: {
      order: 0, required: false,
      summon: {
        condition: '海盗入侵事件进行到中后期刷新',
        material: '海盗地图（海边怪物掉落）触发海盗入侵',
        tip: '一次入侵可能刷多艘，普通模式即可出现'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '铺两层平台 + 篝火', desc: '方便清理海盗小怪' },
        { id: 'w1', cat: '射手', icon: '🏹', name: '肉前/肉后过渡武器', desc: '代达罗斯风暴弓等穿透武器', link: 'daedalus_stormbow' },
        { id: 't1', cat: '技巧', icon: '📌', name: '优先拆四座炮台', desc: '炮台全拆后它只能冲撞，威胁大减' },
        { id: 't2', cat: '技巧', icon: '📌', name: '掉率虽低但可多刷', desc: '金戒指/好运币/折扣卡/海盗法杖', link: 'pirate_staff' }
      ],
      post: {
        unlocks: ['海盗NPC入住（击退入侵后）', '海盗四件套掉落'],
        next: '事件Boss，不影响主线', nextId: ''
      }
    },

    dreadnautilus: {
      order: 0, required: false,
      summon: {
        condition: '血月期间在海边钓鱼（概率触发）',
        material: '血月 + 钓鱼（用血肉诱饵提高概率）',
        tip: '血月钓鱼还能钓上血鳗等其他敌怪，注意备好武器'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '海边搭钓鱼平台', desc: '离水面有高度，怪上不来' },
        { id: 'w1', cat: '射手', icon: '🏹', name: '代达罗斯风暴弓', desc: '远程清理触手', link: 'daedalus_stormbow' },
        { id: 't1', cat: '技巧', icon: '📌', name: '血珠弹幕可被打掉', desc: '追踪血珠可以提前击破' }
      ],
      post: {
        unlocks: ['血腥鱼饵桶（提高血月钓鱼触发）'],
        next: '事件Boss，不影响主线', nextId: ''
      }
    },

    dark_mage: {
      order: 0, required: false,
      summon: {
        condition: '撒旦军队事件第 5 波（T1）/ 第 ? 波（T2）出现',
        material: '埃特尼亚水晶 + 埃特尼亚水晶座（酒馆老板NPC购买）',
        tip: '酒馆老板在击败世界吞噬怪/克苏鲁之脑后出现'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '水晶座周围铺平台', desc: '保护水晶是首要任务' },
        { id: 'w1', cat: '战士', icon: '⚔️', name: '邪恶/熔岩级武器', desc: '他本体很脆', link: 'light_bane' },
        { id: 't1', cat: '技巧', icon: '📌', name: '优先清亡灵德鲁伊', desc: '小怪会打水晶，别只盯Boss' },
        { id: 't2', cat: '技巧', icon: '📌', name: '掉落守家事件奖励', desc: '护卫奖章可换酒馆老板装备' }
      ],
      post: {
        unlocks: ['酒馆老板装备（守家套/水晶法杖等）'],
        next: '事件Boss，不影响主线', nextId: ''
      }
    },

    ogre: {
      order: 0, required: false,
      summon: {
        condition: '撒旦军队 T2 第 7 波出现',
        material: '高级埃特尼亚水晶（击败任意机械Boss后酒馆老板出售）',
        tip: '击杀掉落食人魔法杖和守家装备升级材料'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '守家标准布局', desc: '城墙+平台+哨兵召唤物' },
        { id: 'w1', cat: '战士', icon: '⚔️', name: '肉后近战武器', desc: '注意他的大锤震地', link: 'excalibur' },
        { id: 't1', cat: '技巧', icon: '📌', name: '躲开污泥喷吐', desc: '中距离喷吐范围大，近身反而安全' }
      ],
      post: {
        unlocks: ['食人魔法杖', '守家装备升级材料'],
        next: '事件Boss，不影响主线', nextId: ''
      }
    },

    betsy: {
      order: 0, required: false,
      summon: {
        condition: '撒旦军队 T3 最终波出现',
        material: '高级埃特尼亚水晶',
        tip: '双足翼龙贝茜会飞会喷火，是守家事件最终Boss'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '大型守家布局', desc: '多层平台应对飞行Boss' },
        { id: 'w1', cat: '射手', icon: '🏹', name: '肉后毕业远程武器', desc: '对空输出为主', link: 'tactical_shotgun' },
        { id: 't1', cat: '技巧', icon: '📌', name: '躲火焰吐息', desc: '扇形火焰覆盖面大，横向拉开' },
        { id: 't2', cat: '技巧', icon: '📌', name: '掉落龙之套装? 掉双足翼龙装备', desc: '贝茜的愤怒（法师武器）等', link: 'betsys_wrath' }
      ],
      post: {
        unlocks: ['贝茜的愤怒', '双足翼龙套装（守家毕业）'],
        next: '事件Boss，不影响主线', nextId: ''
      }
    },

    mourning_wood: {
      order: 0, required: false,
      summon: {
        condition: '南瓜月事件第 4 波起出现',
        material: '南瓜月奖章（南瓜×10 + 灵气? 南瓜+星魂 @祭坛）触发',
        tip: '南瓜月波次越高Boss越多，冲波是核心玩法'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '搭 5 层以上高塔平台', desc: '冲波效率决定掉落数量' },
        { id: 'w1', cat: '射手', icon: '🏹', name: '巨兽鲨 + 叶绿弹', desc: '清怪最快的组合', link: 'megashark' },
        { id: 't1', cat: '技巧', icon: '📌', name: '别贪Boss，清怪优先', desc: '击杀数决定下一波刷新，Boss刷了顺手打' },
        { id: 't2', cat: '技巧', icon: '📌', name: '躲避火焰弹', desc: '哀木的火焰弹幕呈扇形' }
      ],
      post: {
        unlocks: ['哀木掉落女巫扫帚? 掉稻草人套装/幽灵套升级材料'],
        next: '事件Boss，不影响主线', nextId: ''
      }
    },

    pumpking: {
      order: 0, required: false,
      summon: {
        condition: '南瓜月事件第 7 波起出现',
        material: '南瓜月奖章触发',
        tip: '南瓜王是南瓜月最终Boss，高波次会同时刷多个'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '南瓜月标准高塔', desc: '和哀木共用场地' },
        { id: 'w1', cat: '射手', icon: '🏹', name: '巨兽鲨 + 叶绿弹', desc: '对Boss持续输出', link: 'megashark' },
        { id: 't1', cat: '技巧', icon: '📌', name: '躲镰刀弹幕', desc: '镰刀有固定图案，贴层间安全位' },
        { id: 't2', cat: '技巧', icon: '📌', name: '掉落无头骑士剑', desc: '战士毕业级武器，多刷必得', link: 'horseman' }
      ],
      post: {
        unlocks: ['无头骑士剑（战士毕业武器）', '糖果玉米步枪等事件武器'],
        next: '事件Boss，不影响主线', nextId: ''
      }
    },

    everscream: {
      order: 0, required: false,
      summon: {
        condition: '霜月事件第 4 波起出现',
        material: '调皮礼物（丝绸×20 + 灵气? 丝绸+腐肉+恐惧之魂 @祭坛）触发',
        tip: '霜月整体难度高于南瓜月，准备要更充分'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '霜月高塔平台', desc: '和南瓜月场地可共用' },
        { id: 'w1', cat: '射手', icon: '🏹', name: '巨兽鲨+叶绿弹 / 海啸弓', desc: '霜月需要更高DPS', link: 'megashark' },
        { id: 't1', cat: '技巧', icon: '📌', name: '躲松针弹幕', desc: '松针呈环形扩散，保持距离' }
      ],
      post: {
        unlocks: ['常绿尖叫怪掉落链条炮? 掉霜月武器'],
        next: '事件Boss，不影响主线', nextId: ''
      }
    },

    santa_nk1: {
      order: 0, required: false,
      summon: {
        condition: '霜月事件第 7 波起出现',
        material: '调皮礼物触发',
        tip: '圣诞坦克会发射礼物弹幕和子弹，注意走位'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '霜月标准高塔', desc: '多层平台躲弹幕' },
        { id: 'w1', cat: '射手', icon: '🏹', name: '霜月毕业级远程武器', desc: '高波次小怪压力更大', link: 'chain_gun' },
        { id: 't1', cat: '技巧', icon: '📌', name: '拆炮管? 躲开礼物雨', desc: '礼物落地爆炸，注意脚下' }
      ],
      post: {
        unlocks: ['链机枪（射手毕业武器）', '精灵熔枪等霜月武器'],
        next: '事件Boss，不影响主线', nextId: ''
      }
    },

    ice_queen: {
      order: 0, required: false,
      summon: {
        condition: '霜月事件最终波出现',
        material: '调皮礼物触发',
        tip: '冰雪女王是霜月最终Boss，冰锥弹幕密集'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '霜月最高波次场地', desc: '她的弹幕覆盖全场，需要持续移动' },
        { id: 'w1', cat: '射手', icon: '🏹', name: '海啸弓 / 链机枪', desc: '对空持续输出', link: 'megashark' },
        { id: 't1', cat: '技巧', icon: '📌', name: '躲追踪冰锥', desc: '冰锥会追踪，横向绕圈甩开' },
        { id: 't2', cat: '技巧', icon: '📌', name: '掉落暴雪法杖', desc: '法师毕业武器之一', link: 'blizzard_staff' }
      ],
      post: {
        unlocks: ['暴雪法杖（法师毕业）', '冰雪女王其他掉落'],
        next: '事件Boss，不影响主线', nextId: ''
      }
    },

    martian_saucer: {
      order: 0, required: false,
      summon: {
        condition: '火星暴乱事件（火星探测器被玩家吓跑后触发）',
        material: '无需材料：让火星探测器扫描到你并逃走即可',
        tip: '火星探测器在地图左右边缘生成，看到它别打死，让它跑'
      },
      prep: [
        { id: 'a1', cat: '场地', icon: '🛠', name: '平整大场地', desc: '飞碟悬停高度大，场地要开阔' },
        { id: 'w1', cat: '射手', icon: '🏹', name: '巨兽鲨 + 叶绿弹', desc: '对空输出主力', link: 'megashark' },
        { id: 't1', cat: '技巧', icon: '📌', name: '拆炮塔', desc: '飞碟四周炮塔可单独摧毁，全拆后只能撞人' },
        { id: 't2', cat: '技巧', icon: '📌', name: '躲避激光扫射', desc: '死亡射线前有预警，及时位移' },
        { id: 't3', cat: '技巧', icon: '📌', name: '掉落外星系列毕业武器', desc: '异星法杖/宇宙车钥匙（UFO坐骑）', link: 'xeno_staff' }
      ],
      post: {
        unlocks: ['宇宙车钥匙（UFO无限飞坐骑）', '外星黄蜂法杖/异星霰弹枪'],
        next: '事件Boss，不影响主线', nextId: ''
      }
    }
  }
}
