// DPS 计算器数据层（1.4.4 数值）
// 武器/盔甲/饰品/词条/增益/Boss 目标/预设配装
// 图标全部复用 assets/sprites 官方精灵图

/* ---------- 职业 ---------- */
const CLASSES = [
  { id: 'melee', name: '战士', icon: '⚔️' },
  { id: 'ranged', name: '射手', icon: '🏹' },
  { id: 'magic', name: '法师', icon: '✨' }
]

/* ---------- 武器 ----------
   dmg: 基础伤害  use: 使用时间（帧，越小越快）  crit: 基础暴击%
   stage: pre=肉前 hard=肉后 end=毕业  note: 特殊说明 */
const WEAPONS = [
  // 近战（肉前）
  { id: 'light_bane', cls: 'melee', name: '光之驱逐', dmg: 17, use: 15, crit: 4, stage: 'pre', art: 'light_bane', note: '魔金锭合成，永夜之刃材料' },
  { id: 'muramasa', cls: 'melee', name: '村正', dmg: 19, use: 15, crit: 4, stage: 'pre', art: 'muramasa', note: '地牢金箱开出，攻速极快' },
  { id: 'enchanted_sword', cls: 'melee', name: '附魔剑', dmg: 17, use: 20, crit: 4, stage: 'pre', art: 'enchanted_sword', note: '附魔剑冢遗迹产出' },
  { id: 'bee_keeper', cls: 'melee', name: '蜂王剑', dmg: 17, use: 25, crit: 4, stage: 'pre', art: 'bee_keeper', note: '蜂王掉落，命中放蜂' },
  { id: 'starfury', cls: 'melee', name: '星怒', dmg: 25, use: 20, crit: 4, stage: 'pre', art: 'starfury', note: '空岛星匣产出，天降星剑' },
  { id: 'blade_of_grass', cls: 'melee', name: '草薙剑', dmg: 18, use: 30, crit: 4, stage: 'pre', art: 'blade_of_grass', note: '丛林材料合成，肉前过渡大剑' },
  { id: 'volcano', cls: 'melee', name: '火山', dmg: 36, use: 40, crit: 4, stage: 'pre', art: 'volcano', note: '地狱岩合成，命中起火' },
  { id: 'nights_edge', cls: 'melee', name: '永夜之刃', dmg: 42, use: 27, crit: 4, stage: 'pre', art: 'nights_edge', note: '肉前毕业近战，四剑合一' },
  // 近战（肉后）
  { id: 'excalibur', cls: 'melee', name: '断钢剑', dmg: 66, use: 20, crit: 4, stage: 'hard', art: 'excalibur', note: '神圣锭合成，光剑基材' },
  { id: 'beam_sword', cls: 'melee', name: '光束剑', dmg: 42, use: 20, crit: 4, stage: 'hard', art: 'beam_sword', note: '巨型飞虫掉落，远程光束' },
  { id: 'death_sickle', cls: 'melee', name: '死神镰刀', dmg: 57, use: 25, crit: 4, stage: 'hard', art: 'death_sickle', note: '死神掉落，穿墙镰刀光波' },
  { id: 'seedler', cls: 'melee', name: '播种者', dmg: 45, use: 20, crit: 4, stage: 'hard', art: 'seedler', note: '世纪之花掉落，炸出种子' },
  { id: 'golem_fist', cls: 'melee', name: '石巨人之拳', dmg: 43, use: 20, crit: 4, stage: 'hard', art: 'golem_fist', note: '石巨人掉落，伸缩拳击' },
  { id: 'keybrand', cls: 'melee', name: '键刃', dmg: 95, use: 20, crit: 4, stage: 'hard', art: 'keybrand', note: '地牢腐化宝箱怪掉落' },
  { id: 'true_excalibur', cls: 'melee', name: '真断钢剑', dmg: 105, use: 20, crit: 4, stage: 'hard', art: 'true_excalibur', note: '断钢剑+英雄断剑升级' },
  { id: 'true_nights_edge', cls: 'melee', name: '真永夜之刃', dmg: 105, use: 27, crit: 4, stage: 'hard', art: 'true_nights_edge', note: '永夜+英雄断剑升级，肉后主力' },
  { id: 'paladin_hammer', cls: 'melee', name: '圣骑士之锤', dmg: 90, use: 14, crit: 4, stage: 'hard', art: 'paladin_hammer', note: '地牢圣骑士掉落，可回旋' },
  { id: 'influx_waver', cls: 'melee', name: '流波刃', dmg: 110, use: 20, crit: 4, stage: 'hard', art: 'influx_waver', note: '火星飞碟掉落，三段剑波' },
  // 近战（毕业）
  { id: 'terra_blade', cls: 'melee', name: '泰拉刃', dmg: 190, use: 16, crit: 4, stage: 'end', art: 'terra_blade', note: '近战信仰，光剑合体' },
  { id: 'meowmere', cls: 'melee', name: '喵刃', dmg: 200, use: 16, crit: 4, stage: 'end', art: 'meowmere', note: '月亮领主掉落，猫猫弹射' },
  { id: 'terrarian', cls: 'melee', name: '泰拉悠悠球', dmg: 200, use: 25, crit: 4, stage: 'end', art: 'terrarian', note: '月亮领主掉落，悠悠球之王' },
  { id: 'zenith', cls: 'melee', name: '天顶剑', dmg: 190, use: 30, crit: 4, stage: 'end', art: 'zenith', note: '万物归一，挥出剑雨（实际为多弹道，此为单体估算）' },
  // 远程（肉前）
  { id: 'bees_knees', cls: 'ranged', name: '蜂膝弓', dmg: 27, use: 20, crit: 4, stage: 'pre', art: 'bees_knees', note: '蜂王掉落，蜜蜂箭幕' },
  { id: 'molten_fury', cls: 'ranged', name: '熔火之怒', dmg: 31, use: 30, crit: 4, stage: 'pre', art: 'molten_fury', note: '地狱岩合成，箭矢燃火' },
  { id: 'hellwing_bow', cls: 'ranged', name: '狱翼弓', dmg: 32, use: 25, crit: 4, stage: 'pre', art: 'hellwing_bow', note: '地狱暗影宝箱开出，蝙蝠箭雨' },
  { id: 'minishark', cls: 'ranged', name: '迷你鲨', dmg: 6, use: 8, crit: 4, stage: 'pre', art: 'minishark', note: '开局神器，射速碾压一切' },
  { id: 'daedalus_stormbow', cls: 'ranged', name: '代达罗斯风暴弓', dmg: 43, use: 19, crit: 4, stage: 'pre', art: 'daedalus_stormbow', note: '神圣宝箱怪掉落，天降箭雨' },
  // 远程（肉后）
  { id: 'shotgun', cls: 'ranged', name: '霰弹枪', dmg: 24, use: 35, crit: 4, stage: 'hard', art: 'shotgun', note: '军火商出售，一梭多发' },
  { id: 'clockwork_assault_rifle', cls: 'ranged', name: '发条式突击步枪', dmg: 17, use: 15, crit: 4, stage: 'hard', art: 'clockwork_assault_rifle', note: '神庙宝箱开出，三连发点射' },
  { id: 'uzi', cls: 'ranged', name: '乌兹冲锋枪', dmg: 21, use: 9, crit: 4, stage: 'hard', art: 'uzi', note: '愤怒捕猎者掉落，高速手枪' },
  { id: 'flamethrower', cls: 'ranged', name: '火焰喷射器', dmg: 35, use: 15, crit: 4, stage: 'hard', art: 'flamethrower', note: '机械骷髅王掉落，喷火龙' },
  { id: 'candy_corn_rifle', cls: 'ranged', name: '糖果玉米步枪', dmg: 34, use: 15, crit: 4, stage: 'hard', art: 'candy_corn_rifle', note: '南瓜月掉落，糖果弹跳' },
  { id: 'stake_launcher', cls: 'ranged', name: '木桩发射器', dmg: 60, use: 15, crit: 4, stage: 'hard', art: 'stake_launcher', note: '南瓜月掉落，吸血鬼克星' },
  { id: 'tactical_shotgun', cls: 'ranged', name: '战术霰弹枪', dmg: 29, use: 35, crit: 4, stage: 'hard', art: 'tactical_shotgun', note: '霰弹枪顶配，一梭六发' },
  { id: 'megashark', cls: 'ranged', name: '巨型鲨鱼枪', dmg: 25, use: 7, crit: 4, stage: 'hard', art: 'megashark', note: '机械时代标配机枪' },
  { id: 'shotbow', cls: 'ranged', name: '叶绿连弩', dmg: 34, use: 18, crit: 4, stage: 'hard', art: 'shotbow', note: '一次连射多支叶绿箭' },
  { id: 'chain_gun', cls: 'ranged', name: '链式机枪', dmg: 29, use: 12, crit: 4, stage: 'hard', art: 'chain_gun', note: '圣诞坦克掉落，泼水式输出' },
  { id: 'tsunami', cls: 'ranged', name: '海啸', dmg: 53, use: 30, crit: 4, stage: 'hard', art: 'tsunami', note: '猪龙鱼公爵掉落，五箭齐发' },
  { id: 'razorpine', cls: 'ranged', name: '剃刀松', dmg: 55, use: 10, crit: 4, stage: 'hard', art: 'razorpine', note: '常绿尖叫树掉落，松针弹幕' },
  { id: 'snowman_cannon', cls: 'ranged', name: '雪人炮', dmg: 90, use: 20, crit: 4, stage: 'hard', art: 'snowman_cannon', note: '圣诞坦克掉落，追踪火箭' },
  { id: 'xenopopper', cls: 'ranged', name: '外星泡泡枪', dmg: 55, use: 20, crit: 4, stage: 'hard', art: 'xenopopper', note: '火星暴乱掉落，泡泡爆裂' },
  // 远程（毕业）
  { id: 'sdmg', cls: 'ranged', name: '太空海豚机枪', dmg: 85, use: 10, crit: 4, stage: 'end', art: 'sdmg', note: '月亮领主掉落，机枪天花板' },
  { id: 'vortex_beater', cls: 'ranged', name: '星旋机枪', dmg: 50, use: 14, crit: 4, stage: 'end', art: 'vortex_beater', note: '星旋碎片合成，子弹随缘' },
  { id: 'pulse_bow', cls: 'ranged', name: '脉冲弓', dmg: 46, use: 20, crit: 4, stage: 'end', art: 'pulse_bow', note: '旅商出售，能量矢无限穿' },
  // 魔法（肉前）
  { id: 'water_bolt', cls: 'magic', name: '水矢', dmg: 19, use: 17, crit: 4, stage: 'pre', art: 'water_bolt', note: '地牢书架收集，弹幕折射' },
  { id: 'demon_scythe', cls: 'magic', name: '恶魔镰刀', dmg: 35, use: 20, crit: 4, stage: 'pre', art: 'demon_scythe', note: '地狱恶魔掉落，蓄力镰刀' },
  { id: 'crystal_serpent', cls: 'magic', name: '水晶蛇', dmg: 35, use: 25, crit: 4, stage: 'pre', art: 'crystal_serpent', note: '水晶碎块合成，肉前主力' },
  // 魔法（肉后）
  { id: 'golden_shower', cls: 'magic', name: '黄金雨', dmg: 17, use: 15, crit: 4, stage: 'hard', art: 'golden_shower', note: '神圣钥匙开箱，削弱防御' },
  { id: 'cursed_flames_staff', cls: 'magic', name: '诅咒之焰法杖', dmg: 30, use: 15, crit: 4, stage: 'hard', art: 'cursed_flames_staff', note: '腐化钥匙开箱，诅咒火球' },
  { id: 'crystal_storm', cls: 'magic', name: '水晶风暴', dmg: 25, use: 12, crit: 4, stage: 'hard', art: 'crystal_storm', note: '高频弹幕，低耗蓝' },
  { id: 'flamelash', cls: 'magic', name: '烈焰火鞭', dmg: 36, use: 25, crit: 4, stage: 'hard', art: 'flamelash', note: '地狱暗影宝箱开出，操控火球' },
  { id: 'bat_scepter', cls: 'magic', name: '蝙蝠权杖', dmg: 45, use: 16, crit: 4, stage: 'hard', art: 'bat_scepter', note: '南瓜月掉落，蝙蝠群袭' },
  { id: 'magnet_sphere', cls: 'magic', name: '磁石球', dmg: 44, use: 18, crit: 4, stage: 'hard', art: 'magnet_sphere', note: '地牢宝箱开出，放电球体' },
  { id: 'rainbow_rod', cls: 'magic', name: '彩虹魔杖', dmg: 53, use: 18, crit: 4, stage: 'hard', art: 'rainbow_rod', note: '可控光弹，魔法仪式感' },
  { id: 'bubble_gun', cls: 'magic', name: '泡泡枪', dmg: 70, use: 12, crit: 4, stage: 'hard', art: 'bubble_gun', note: '猪龙鱼公爵掉落，近距离爆发' },
  { id: 'shadowbeam_staff', cls: 'magic', name: '暗影束法杖', dmg: 60, use: 18, crit: 4, stage: 'hard', art: 'shadowbeam_staff', note: '地牢幽魂掉落，弹射光束' },
  { id: 'spectre_staff', cls: 'magic', name: '幽灵法杖', dmg: 105, use: 20, crit: 4, stage: 'hard', art: 'spectre_staff', note: '地牢幽魂掉落，追踪幽灵' },
  { id: 'staff_of_earth', cls: 'magic', name: '大地法杖', dmg: 84, use: 25, crit: 4, stage: 'hard', art: 'staff_of_earth', note: '哥布林召唤师掉落，滚石碾压' },
  { id: 'blizzard_staff', cls: 'magic', name: '暴雪法杖', dmg: 110, use: 10, crit: 4, stage: 'hard', art: 'blizzard_staff', note: '冰雪女王掉落，天降冰锥' },
  { id: 'laser_machinegun', cls: 'magic', name: '激光机枪', dmg: 43, use: 7, crit: 4, stage: 'hard', art: 'laser_machinegun', note: '火星飞碟掉落，越打越快' },
  { id: 'nightglow', cls: 'magic', name: '夜辉', dmg: 68, use: 20, crit: 4, stage: 'hard', art: 'nightglow', note: '光之女皇掉落，发光追踪弹' },
  // 魔法（毕业）
  { id: 'nebula_blaze', cls: 'magic', name: '星云烈焰', dmg: 130, use: 12, crit: 4, stage: 'end', art: 'nebula_blaze', note: '星云碎片合成，追踪弹幕' },
  { id: 'lunar_flare', cls: 'magic', name: '月耀', dmg: 100, use: 10, crit: 4, stage: 'end', art: 'lunar_flare', note: '月亮领主掉落，天降月焰' },
  { id: 'last_prism', cls: 'magic', name: '最后棱镜', dmg: 100, use: 10, crit: 4, stage: 'end', art: 'last_prism', note: '聚焦彩虹射线（实际伤害远超面板）' }
]

/* ---------- 武器词条 ----------
   dmg: 伤害%  spd: 攻速%  crit: 暴击%  cls: 适用职业（all=通用） */
const WPREFIX = [
  { id: 'none', name: '无词条', cls: 'all', dmg: 0, spd: 0, crit: 0 },
  { id: 'deadly', name: '致命', cls: 'all', dmg: 10, spd: 10, crit: 0 },
  { id: 'demonic', name: '恶魔', cls: 'all', dmg: 15, spd: 0, crit: 10 },
  { id: 'godly', name: '神圣', cls: 'all', dmg: 15, spd: 0, crit: 10 },
  { id: 'legendary', name: '传说', cls: 'melee', dmg: 15, spd: 15, crit: 10 },
  { id: 'unreal', name: '虚幻', cls: 'ranged', dmg: 15, spd: 10, crit: 10 },
  { id: 'mythical', name: '神话', cls: 'magic', dmg: 15, spd: 10, crit: 10 }
]

/* ---------- 盔甲（按职业给加成，未匹配职业时不生效） ---------- */
const ARMORS = [
  { id: 'none', name: '无护甲', cls: 'all', dmg: 0, crit: 0, spd: 0, note: '裸装基准' },
  // 近战
  { id: 'molten_armor', name: '熔岩套', cls: 'melee', dmg: 17, crit: 0, spd: 0, note: '肉前近战毕业，地狱石打造' },
  { id: 'cobalt_armor', name: '钴蓝套（近战头）', cls: 'melee', dmg: 8, crit: 0, spd: 10, note: '肉后入门，攻速加成' },
  { id: 'palladium_armor', name: '钯金套（近战头）', cls: 'melee', dmg: 14, crit: 0, spd: 0, note: '套装回血，站撸优选' },
  { id: 'orichalcum_armor', name: '山铜套（近战头）', cls: 'melee', dmg: 18, crit: 0, spd: 0, note: '花瓣自动攻击' },
  { id: 'titanium_armor', name: '钛金套（近战头）', cls: 'melee', dmg: 21, crit: 0, spd: 0, note: '闪避护盾，保命与输出兼备' },
  { id: 'chlorophyte_armor', name: '叶绿套（近战头）', cls: 'melee', dmg: 21, crit: 0, spd: 0, note: '世纪之花后主力，叶绿锭合成' },
  { id: 'hallowed_armor_m', name: '神圣套（近战头）', cls: 'melee', dmg: 12, crit: 8, spd: 0, note: '神圣锭合成，圣域护盾' },
  { id: 'beetle_armor', name: '甲虫套（进攻）', cls: 'melee', dmg: 14, crit: 0, spd: 6, note: '甲虫鳞甲，越打越猛' },
  { id: 'solar_armor', name: '耀斑套', cls: 'melee', dmg: 22, crit: 17, spd: 0, note: '日耀碎片，近战终极' },
  // 远程
  { id: 'necro_armor', name: '死神套', cls: 'ranged', dmg: 15, crit: 0, spd: 0, note: '骨头+蛛网，肉前远程' },
  { id: 'cobalt_armor_r', name: '钴蓝套（远程头）', cls: 'ranged', dmg: 8, crit: 0, spd: 10, note: '肉后入门，攻速加成' },
  { id: 'palladium_armor_r', name: '钯金套（远程头）', cls: 'ranged', dmg: 14, crit: 0, spd: 0, note: '套装回血，站撸优选' },
  { id: 'orichalcum_armor_r', name: '山铜套（远程头）', cls: 'ranged', dmg: 18, crit: 0, spd: 0, note: '花瓣自动攻击' },
  { id: 'titanium_armor_r', name: '钛金套（远程头）', cls: 'ranged', dmg: 21, crit: 0, spd: 0, note: '闪避护盾，保命与输出兼备' },
  { id: 'chlorophyte_armor_r', name: '叶绿套（远程头）', cls: 'ranged', dmg: 16, crit: 8, spd: 0, note: '世纪之花后主力，叶绿锭合成' },
  { id: 'hallowed_armor_r', name: '神圣套（远程头）', cls: 'ranged', dmg: 12, crit: 8, spd: 0, note: '神圣锭合成，圣域护盾' },
  { id: 'shroomite_armor', name: '蘑菇矿套', cls: 'ranged', dmg: 15, crit: 15, spd: 0, note: '发光蘑菇，远程肉后主力' },
  { id: 'vortex_armor', name: '星旋套', cls: 'ranged', dmg: 22, crit: 12, spd: 0, note: '星旋碎片，隐身爆发' },
  // 魔法
  { id: 'jungle_armor', name: '丛林套', cls: 'magic', dmg: 6, crit: 0, spd: 0, note: '丛林孢子，法师入门' },
  { id: 'meteor_armor', name: '陨石套', cls: 'magic', dmg: 21, crit: 0, spd: 0, note: '套装让太空枪零耗蓝' },
  { id: 'cobalt_armor_g', name: '钴蓝套（魔法头）', cls: 'magic', dmg: 8, crit: 0, spd: 10, note: '肉后入门，攻速加成' },
  { id: 'palladium_armor_g', name: '钯金套（魔法头）', cls: 'magic', dmg: 14, crit: 0, spd: 0, note: '套装回血，站撸优选' },
  { id: 'orichalcum_armor_g', name: '山铜套（魔法头）', cls: 'magic', dmg: 18, crit: 0, spd: 0, note: '花瓣自动攻击' },
  { id: 'titanium_armor_g', name: '钛金套（魔法头）', cls: 'magic', dmg: 21, crit: 0, spd: 0, note: '闪避护盾，保命与输出兼备' },
  { id: 'hallowed_armor_g', name: '神圣套（魔法头）', cls: 'magic', dmg: 12, crit: 10, spd: 0, note: '神圣锭合成，圣域护盾' },
  { id: 'forbidden_armor', name: '禁忌套', cls: 'magic', dmg: 15, crit: 0, spd: 0, note: '魔法+召唤双修，风暴召唤' },
  { id: 'spectre_armor', name: '幽灵套', cls: 'magic', dmg: 18, crit: 0, spd: 0, note: '幽灵锭，击杀回蓝/回血' },
  { id: 'nebula_armor', name: '星云套', cls: 'magic', dmg: 26, crit: 9, spd: 0, note: '星云碎片，叠层增益' }
]

/* ---------- 饰品（最多5个，职业不匹配时加成不生效） ----------
   dmgAll/dmgMelee/dmgRanged/dmgMagic: 伤害%  critAll: 暴击%
   spdAll: 攻速%  override: 被同组覆盖不叠加 */
const ACCESSORIES = [
  { id: 'warrior_emblem', name: '战士徽章', art: 'warrior_emblem', dmgMelee: 15 },
  { id: 'ranger_emblem', name: '射手徽章', art: 'ranger_emblem', dmgRanged: 15 },
  { id: 'sorcerer_emblem', name: '巫师徽章', art: 'sorcerer_emblem', dmgMagic: 15 },
  { id: 'avenger_emblem', name: '复仇者徽章', art: 'avenger_emblem', dmgAll: 12 },
  { id: 'destroyer_emblem', name: '毁灭者徽章', art: 'destroyer_emblem', dmgAll: 10, critAll: 8 },
  { id: 'mechanical_glove', name: '机械手套', art: 'mechanical_glove', dmgMelee: 12, spdAll: 12, grp: 'glove' },
  { id: 'power_glove', name: '力量手套', art: 'power_glove', dmgMelee: 12, spdAll: 12, grp: 'glove' },
  { id: 'celestial_stone', name: '天界石', art: 'celestial_stone', dmgAll: 10, spdAll: 10, critAll: 2 },
  { id: 'celestial_shell', name: '天界壳', art: 'celestial_shell', dmgAll: 10, spdAll: 10, critAll: 2 },
  { id: 'moon_stone', name: '月亮石', art: 'moon_stone', dmgAll: 5, spdAll: 5, critAll: 1 },
  { id: 'sun_stone', name: '太阳石', art: 'sun_stone', dmgAll: 5, spdAll: 5, critAll: 1 },
  { id: 'molten_quiver', name: '熔火箭袋', art: 'molten_quiver', dmgRanged: 10 },
  { id: 'magic_quiver', name: '魔法箭袋', art: 'magic_quiver', dmgRanged: 10 },
  { id: 'putrid_scent', name: '腐臭囊', art: 'putrid_scent', dmgAll: 5, critAll: 5 },
  { id: 'mana_flower', name: '魔力花', art: 'mana_flower', dmgMagic: 5 }
]

/* 饰品重铸词条（每槽位独立） */
const APREFIX = [
  { id: 'none', name: '无', dmg: 0, crit: 0 },
  { id: 'menacing', name: '威逼', dmg: 4, crit: 0 },
  { id: 'lucky', name: '幸运', dmg: 0, crit: 4 }
]

/* ---------- 增益 ---------- */
const BUFFS = [
  { id: 'well_fed', name: '吃得好', dmgAll: 10, critAll: 2, note: '食物类Buff' },
  { id: 'wrath', name: '暴怒药水', dmgAll: 10, critAll: 0, note: '伤害+10%' },
  { id: 'rage', name: '怒气药水', dmgAll: 0, critAll: 10, note: '暴击+10%' },
  { id: 'clairvoyance', name: '预知（水晶球）', dmgAll: 0, critAll: 0, dmgMagic: 5, note: '魔法伤害+5%' },
  { id: 'sharpened', name: '磨刀', dmgAll: 0, critAll: 0, pen: 8, note: '近战穿透+8' }
]

/* ---------- 目标（Boss 防御力，取输出窗口常见值） ---------- */
const TARGETS = [
  { id: 'dummy', name: '木桩（0 防御）', def: 0 },
  { id: 'king_slime', name: '史莱姆王', def: 10 },
  { id: 'eye_of_cthulhu', name: '克苏鲁之眼', def: 12 },
  { id: 'queen_bee', name: '蜂王', def: 8 },
  { id: 'skeletron', name: '骷髅王（头部）', def: 10 },
  { id: 'wall_of_flesh', name: '血肉墙', def: 12 },
  { id: 'destroyer', name: '毁灭者', def: 20 },
  { id: 'skeletron_prime', name: '机械骷髅王', def: 24 },
  { id: 'plantera', name: '世纪之花', def: 20 },
  { id: 'golem', name: '石巨人（本体）', def: 30 },
  { id: 'duke_fishron', name: '猪龙鱼公爵', def: 50 },
  { id: 'empress_of_light', name: '光之女皇', def: 50 },
  { id: 'moon_lord', name: '月亮领主', def: 50 },
  { id: 'custom', name: '自定义防御', def: 0 }
]

/* ---------- 难度（防御减伤系数） ---------- */
const MODES = [
  { id: 'classic', name: '经典', factor: 0.5 },
  { id: 'expert', name: '专家', factor: 0.75 },
  { id: 'master', name: '大师', factor: 1.0 }
]

/* ---------- 预设配装方案（一键应用） ---------- */
const PRESETS = [
  {
    id: 'melee_end', name: '战士毕业装', icon: '⚔️',
    desc: '天顶剑 + 耀斑套，伤害拉满',
    state: {
      cls: 'melee', weaponId: 'zenith', prefixId: 'legendary', armorId: 'solar_armor',
      accs: [
        { id: 'avenger_emblem', ap: 'menacing' }, { id: 'destroyer_emblem', ap: 'menacing' },
        { id: 'mechanical_glove', ap: 'menacing' }, { id: 'celestial_stone', ap: 'menacing' },
        { id: 'celestial_shell', ap: 'menacing' }
      ],
      buffs: ['well_fed', 'wrath', 'rage', 'sharpened'], targetId: 'moon_lord', mode: 'classic', customDef: 0
    }
  },
  {
    id: 'ranged_end', name: '射手毕业装', icon: '🏹',
    desc: '星旋机枪 + 星旋套，弹幕风暴',
    state: {
      cls: 'ranged', weaponId: 'vortex_beater', prefixId: 'unreal', armorId: 'vortex_armor',
      accs: [
        { id: 'ranger_emblem', ap: 'menacing' }, { id: 'avenger_emblem', ap: 'menacing' },
        { id: 'destroyer_emblem', ap: 'menacing' }, { id: 'celestial_stone', ap: 'menacing' },
        { id: 'celestial_shell', ap: 'menacing' }
      ],
      buffs: ['well_fed', 'wrath', 'rage'], targetId: 'moon_lord', mode: 'classic', customDef: 0
    }
  },
  {
    id: 'magic_end', name: '法师毕业装', icon: '✨',
    desc: '星云烈焰 + 星云套，星云叠层',
    state: {
      cls: 'magic', weaponId: 'nebula_blaze', prefixId: 'mythical', armorId: 'nebula_armor',
      accs: [
        { id: 'sorcerer_emblem', ap: 'menacing' }, { id: 'avenger_emblem', ap: 'menacing' },
        { id: 'destroyer_emblem', ap: 'menacing' }, { id: 'celestial_stone', ap: 'menacing' },
        { id: 'celestial_shell', ap: 'menacing' }
      ],
      buffs: ['well_fed', 'wrath', 'rage', 'clairvoyance'], targetId: 'moon_lord', mode: 'classic', customDef: 0
    }
  },
  {
    id: 'melee_pre', name: '战士肉前装', icon: '🗡️',
    desc: '真永夜 + 熔岩套，开荒打肉墙',
    state: {
      cls: 'melee', weaponId: 'true_nights_edge', prefixId: 'legendary', armorId: 'molten_armor',
      accs: [
        { id: 'warrior_emblem', ap: 'menacing' }, { id: 'avenger_emblem', ap: 'menacing' },
        { id: 'power_glove', ap: 'menacing' }, { id: '', ap: 'none' }, { id: '', ap: 'none' }
      ],
      buffs: ['well_fed', 'wrath', 'rage'], targetId: 'wall_of_flesh', mode: 'classic', customDef: 0
    }
  },
  {
    id: 'ranged_pre', name: '射手肉前装', icon: '🎯',
    desc: '风暴弓 + 死神套，肉墙速刷',
    state: {
      cls: 'ranged', weaponId: 'daedalus_stormbow', prefixId: 'unreal', armorId: 'necro_armor',
      accs: [
        { id: 'ranger_emblem', ap: 'menacing' }, { id: 'avenger_emblem', ap: 'menacing' },
        { id: 'magic_quiver', ap: 'menacing' }, { id: '', ap: 'none' }, { id: '', ap: 'none' }
      ],
      buffs: ['well_fed', 'wrath', 'rage'], targetId: 'wall_of_flesh', mode: 'classic', customDef: 0
    }
  }
]

/* 阶段名 */
const STAGE_N = { pre: '肉前', hard: '肉后', end: '毕业' }

module.exports = {
  CLASSES, WEAPONS, WPREFIX, ARMORS, ACCESSORIES, APREFIX,
  BUFFS, TARGETS, MODES, PRESETS, STAGE_N
}
