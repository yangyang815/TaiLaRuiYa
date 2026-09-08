// 图鉴索引：合并物品/敌怪/Boss/攻略，提供检索、热门、详情解析、合成树
const { ARTS, RARITY } = require('./arts')
const items = require('../data/items')
const monsters = require('../data/monsters')
const bosses = require('../data/bosses')
const strats = require('../data/strategies')
const seeds = require('../data/seeds')
const R = require('../data/recipes')

/* ---------- 标签体系（自动派生 + 手工补充，供搜索与展示） ---------- */
// 物品职业流派：武器细分 → 职业
const SUB_TAGS = { melee: '战士', ranged: '射手', magic: '法师', summon: '召唤师' }
// 物品分类 → 标签
const CAT_TAGS = {
  weapon: '武器', tool: '工具', armor: '盔甲', accessory: '饰品', material: '材料',
  potion: '药水', mount: '坐骑', pet: '宠物', npc: 'NPC'
}
// 阶段 → 标签（Boss/敌怪通用）
const TIER_TAGS = { pre: '困难模式前', mech: '机械三王', post: '困难模式', lunar: '月亮事件', event: '事件' }
// 手工标签：标志性毕业装备 / 高频检索需求
const EXTRA_TAGS = {
  zenith: ['毕业'], sdmg: ['毕业'], last_prism: ['毕业'], terraprisma: ['毕业'],
  terraspark_boots: ['毕业'], ankh_shield: ['毕业'], cell_phone: ['毕业'],
  moon_lord: ['毕业'], duke_fishron: ['毕业'], empress_of_light: ['毕业'],
  solar_armor: ['毕业', '战士'], nebula_armor: ['毕业', '法师'], vortex_armor: ['毕业', '射手'], stardust_armor: ['毕业', '召唤师'],
  molten_armor: ['肉前', '战士'], necro_armor: ['肉前', '射手'], jungle_armor_set: ['肉前', '法师'], bee_armor: ['肉前', '召唤师'],
  nights_edge: ['肉前'], molten_pick: ['肉前']
}

// 为单条索引派生标签数组
function deriveTags (type, raw, name) {
  const t = []
  if (type === 'item' || type === 'npc') {
    if (CAT_TAGS[raw.cat]) t.push(CAT_TAGS[raw.cat])
    if (SUB_TAGS[raw.sub]) t.push(SUB_TAGS[raw.sub])
    if (/翼$|之翼|翅膀/.test(name)) t.push('翅膀')
  } else if (type === 'mon') {
    t.push('敌怪')
    if (TIER_TAGS[raw.tier]) t.push(TIER_TAGS[raw.tier])
    if (raw.tier === 'pre') t.push('肉前')
    if (raw.tier === 'post') t.push('肉后')
  } else if (type === 'boss') {
    t.push('Boss')
    if (TIER_TAGS[raw.tier]) t.push(TIER_TAGS[raw.tier])
    if (raw.tier === 'pre') t.push('肉前')
    if (raw.tier === 'post') t.push('肉后')
  } else if (type === 'seed') {
    t.push('种子')
  }
  if (EXTRA_TAGS[raw.id]) EXTRA_TAGS[raw.id].forEach(x => { if (!t.includes(x)) t.push(x) })
  return t
}

/* ---------- 统一索引 ---------- */
// type: item | mon | boss | seed | npc
const ALL = []
items.forEach(i => ALL.push({
  id: i.id, name: i.name, en: i.en || '', type: i.cat === 'npc' ? 'npc' : 'item', cat: i.cat, sub: i.sub || '',
  rarity: i.rarity || 0, artId: i.art || 'stone', art: ARTS[i.art] || ARTS.stone, glow: RARITY[i.rarity || 0], raw: i,
  tags: deriveTags(i.cat === 'npc' ? 'npc' : 'item', i, i.name)
}))
monsters.forEach(m => ALL.push({
  id: m.id, name: m.name, en: m.en || '', type: 'mon', cat: 'monster', sub: m.biome || '',
  rarity: m.rarity || 0, artId: m.art || 'stone', art: ARTS[m.art] || ARTS.stone, glow: RARITY[m.rarity || 0], raw: m,
  tags: deriveTags('mon', m, m.name)
}))
bosses.forEach(b => ALL.push({
  id: b.id, name: b.name, en: b.en || '', type: 'boss', cat: 'boss', sub: b.tier || '',
  rarity: 8, artId: b.art || 'stone', art: ARTS[b.art] || ARTS.stone, glow: b.color || '#FFD700', raw: b,
  tags: deriveTags('boss', b, b.name)
}))
seeds.forEach(s => ALL.push({
  id: s.id, name: s.name, en: s.en || '', type: 'seed', cat: 'seed', sub: s.tag || '',
  rarity: 6, artId: s.art || 'stone', art: ARTS[s.art] || ARTS.stone, glow: s.color || '#7BE0D6', raw: s,
  tags: deriveTags('seed', s, s.name)
}))

const byId = {}
ALL.forEach(e => { byId[e.id] = e })

/* ---------- 物品分类（图鉴筛选用） ---------- */
const CATS = {
  item: [
    { k: '', n: '全部' }, { k: 'weapon', n: '武器' }, { k: 'tool', n: '工具' },
    { k: 'armor', n: '盔甲' }, { k: 'accessory', n: '饰品' }, { k: 'material', n: '材料' },
    { k: 'potion', n: '药水' }, { k: 'mount', n: '坐骑' }, { k: 'pet', n: '宠物' },
  ],
  mon: [{ k: '', n: '全部' }, { k: 'pre', n: '困难前' }, { k: 'post', n: '困难模式' }, { k: 'event', n: '事件' }],
  boss: [
    { k: '', n: '全部' }, { k: 'pre', n: '困难前' }, { k: 'mech', n: '机械三王' },
    { k: 'post', n: '世纪之花后' }, { k: 'lunar', n: '月亮事件' }, { k: 'event', n: '事件' }
  ],
  seed: [
    { k: '', n: '全部' }, { k: 'hard', n: '挑战向' }, { k: 'casual', n: '休闲向' },
    { k: 'visual', n: '趣味视觉' }
  ],
  npc: [
    { k: '', n: '全部' }, { k: 'svc', n: '服务型' }, { k: 'shop', n: '肉前入住' },
    { k: 'post', n: '肉后入住' }, { k: 'evt', n: '特殊到访' }
  ]
}

/* ---------- 搜索（模糊 + 拼音 + 别名打分） ---------- */
const { py } = require('./pinyin-mini')

// 物品基础属性：材料/宝石等无战斗数值的物品兜底展示
const CAT_NAMES = { weapon: '武器', tool: '工具', armor: '盔甲', accessory: '饰品', material: '合成材料', potion: '药水', mount: '坐骑', pet: '宠物', npc: 'NPC' }
const RARITY_NAMES = ['白色·普通', '蓝色·优良', '绿色·优秀', '橙色·稀有', '浅红·史诗', '粉色·传说', '浅紫·珍品', '石青·专家', '紫罗兰·大师', '炽红·任务']
function itemBaseStats (raw) {
  const st = []
  if (raw.cat) st.push(['类别', CAT_NAMES[raw.cat] || raw.cat])
  if (raw.sub) st.push(['细分', raw.sub])
  st.push(['稀有度', RARITY_NAMES[raw.rarity || 0] || '白色·普通'])
  st.push(['堆叠', '999（多数材料可堆叠）'])
  return st
}

// 高频俗称 / 简称 → 条目 id
const ALIAS = [
  ['史莱姆钩', 'slime_hook'],
  ['环境改造机', 'clentaminator'],
  ['绿溶液', 'green_solution'],
  ['空桶', 'empty_bucket'],
  ['音乐盒', 'music_box'],
  ['天云磁石', 'celestial_magnet'],
  ['幼雏之翼', 'fledgling_wings'],
  ['冰鞋', 'ice_skates'],
  ['冰雪镜', 'ice_mirror'],
  ['风之脚镯', 'anklet_of_wind'],
  ['金属鞋尖', 'aglet'],
  ['航鱼靴', 'amphibian_boots'],
  ['熔岩护符', 'lava_charm'],
  ['火焰护手', 'fire_gauntlet'],
  ['肉指虎', 'flesh_knuckles'],
  ['分趾袜', 'tabi'],
  ['虎爪装备', 'tiger_climbing_gear'],
  ['蜂蜜梳', 'honey_comb'],
  ['骨手套', 'bone_glove'],
  ['无底箭袋', 'endless_quiver'],
  ['无底火药袋', 'endless_musket_pouch'],
  ['渔民袖珍指南', 'fishermans_pocket_guide'],
  ['DPS 计', 'dps_meter'],
  ['GPS', 'gps'],
  ['乌龟壳', 'turtle_shell'],
  ['腐烂块', 'rotten_chunk'],
  ['神圣钥匙', 'hallowed_key'],
  ['泥土块', 'dirt_block'],
  ['冰块', 'ice_block'],
  ['黏土块', 'clay_block'],
  ['淤泥块', 'silt_block'],
  ['绳索', 'rope'],
  ['锁链', 'chain'],
  ['云朵', 'cloud'],
  ['铜矿石', 'copper_ore'],
  ['锡矿石', 'tin_ore'],
  ['铁矿石', 'iron_ore'],
  ['铅矿石', 'lead_ore'],
  ['银矿石', 'silver_ore'],
  ['钨矿石', 'tungsten_ore'],
  ['金矿石', 'gold_ore'],
  ['铂金矿石', 'platinum_ore'],
  ['黑曜石皮肤药水', 'obsidian_skin'],
  ['猎手药水', 'hunter'],
  ['发光药水', 'shine'],
  ['隐形药水', 'invisibility'],
  ['魔力药水', 'magic_power'],
  ['狂暴药水', 'rage'],
  ['愤怒药水', 'wrath'],
  ['温暖药水', 'warmth'],
  ['心脏抵达药水', 'heartreach'],
  ['板条箱药水', 'crate'],
  ['危险感知药水', 'dangersense'],
  ['生物群系视域药水', 'biome_sight'],
  ['烈火药水', 'inferno'],
  ['性别转换药水', 'gender_change'],
  ['火焰瓶', 'flask_fire'],
  ['毒素瓶', 'flask_poison'],
  ['金瓶', 'flask_gold'],
  ['派对瓶', 'flask_party'],
  ['诅咒火焰瓶', 'flask_cursed'],
  ['灵液瓶', 'flask_ichor'],
  ['毒液瓶', 'flask_venom'],
  ['凝胶鞍座', 'gelatinous_pillion'],
  ['过热血液', 'superheated_blood'],
  ['皇家镀金鞍', 'royal_gilded_saddle'],
  ['不幸毛线', 'unlucky_yarn'],
  ['琥珀蚊子', 'amber_mosquito'],
  ['皇家甜点', 'royal_delight'],
  ['月亮鱿鱼块', 'piece_of_moon_squid'],
  ['鹿角怪眼球', 'deerclops_eyeball'],
  ['吹箭筒', 'blowpipe'],
  ['弯刀', 'cutlass'],
  ['血屠刀', 'blood_butcherer'],
  ['叶列特', 'yelets'],
  ['腐化之灾', 'scourge_corruptor'],
  ['木桩发射器', 'stake_launcher'],
  ['暗影光束法书', 'shadowbeam_staff'],
  ['贝茜之怒', 'betsys_wrath'],
  ['风暴法杖', 'tempest_staff'],
  ['异星法杖', 'xeno_staff'],
  ['滴血压制者', 'drippler_crippler'],
  ['烈焰爆发法杖', 'flameburst_staff'],
  ['蜘蛛皇后法杖', 'queen_spider_staff'],
  ['彩虹水晶法杖', 'rainbow_crystal_staff'],
  ['折扣卡', 'discount_card'],
  ['反重力钩爪', 'anti_gravity_hook'],
  ['雨云法杖', 'nimbus_rod'],
  ['冰雪法杖', 'frost_staff'],
  ['炼狱叉', 'inferno_fork'],
  ['剧毒法杖', 'venom_staff'],
  ['天空裂痕', 'sky_fracture'],
  ['黑暗收割', 'dark_harvest'],
  ['薄暮弓', 'eventide'],
  ['黑曜石爆破枪', 'onyx_blaster'],
  ['猎鹰之刃', 'falcon_blade'],
  ['野性之爪', 'feral_claws'],
  ['粉水母', 'm_pink_jellyfish'],
  ['爬墙蛛', 'm_wall_creeper'],
  ['跳跳兽', 'm_herpling'],
  ['暗黑木乃伊', 'm_dark_mummy'],
  ['哥布林召唤师', 'm_goblin_summoner'],
  ['被附身者', 'm_possessed'],
  ['血鳗', 'm_blood_eel'],
  ['钉子头', 'm_nailhead'],
  ['深渊生物', 'm_creature_deep'],
  ['海盗甲板水手', 'm_pirate_deckhand'],
  ['海盗私掠者', 'm_pirate_corsair'],
  ['海盗神枪手', 'm_pirate_deadeye'],
  ['火星无人机', 'm_martian_drone'],
  ['射线枪手', 'm_ray_gunner'],
  ['千兆电击怪', 'm_gigazapper'],
  ['以太哥布林', 'm_etherian_goblin'],
  ['以太标枪手', 'm_etherian_javelin'],
  ['狗头人', 'm_kobold'],
  ['滑翔狗头人', 'm_kobold_glider'],
  ['德拉金', 'm_drakin'],
  ['塞勒尼安', 'm_selenian'],
  ['科里特', 'm_corite'],
  ['德拉科迈尔', 'm_drakomire'],
  ['德拉科迈尔骑手', 'm_drakomire_rider'],
  ['德拉卡尼亚', 'm_drakanian'],
  ['旋涡人', 'm_vortexian'],
  ['风暴潜水员', 'm_storm_diver'],
  ['异形黄蜂', 'm_alien_hornet'],
  ['预言者', 'm_predictor'],
  ['吸脑者', 'm_brain_suckler'],
  ['进化野兽', 'm_evolution_beast'],
  ['星星细胞', 'm_star_cell'],
  ['闪耀扑翼怪', 'm_twinkle_popper'],
  ['流动入侵者', 'm_flow_invader'],
  ['观星者', 'm_stargazer'],
  ['碎木怪', 'm_splinterling'],
  ['恶作剧鬼', 'm_poltergeist'],
  ['胡桃夹子', 'm_nutcracker'],
  ['弗洛科', 'm_flocko'],
  ['雪怪', 'm_yeti'],
  ['地精', 'm_gnome'],
  ['花岗岩元素', 'm_granite_elemental'],
  ['黑寡妇', 'm_black_recluse'],
  ['符文法师', 'm_rune_wizard'],
  ['冰雪傀儡', 'm_ice_golem'],
  ['沙元素', 'm_sand_elemental'],
  ['荷兰人号', 'flying_dutchman'],
  ['双足翼龙贝茜', 'betsy'],
  ['圣诞坦克NK1', 'santa_nk1'],
  ['霜米诺鱼', 'f_frost_minnow'],
  ['绿水母', 'f_green_jellyfish'],
  ['霓虹灯鱼', 'f_neon_tetra'],
  ['鲑鱼', 'f_salmon'],
  ['杂色猪油鱼', 'f_variegated_lardfish'],
  ['新手鱼饵', 'b_apprentice_bait'],
  ['月总', 'moon_lord'], ['月亮领主', 'moon_lord'], ['猪鲨', 'duke_fishron'], ['公爵', 'duke_fishron'],
  ['世花', 'plantera'], ['花后', 'plantera'], ['光女', 'empress_of_light'], ['女皇', 'empress_of_light'],
  ['克眼', 'eye_of_cthulhu'], ['克脑', 'brain_of_cthulhu'], ['吴克', 'skeletron'], ['骷髅王', 'skeletron'],
  ['肉山', 'wall_of_flesh'], ['血肉之墙', 'wall_of_flesh'], ['眼球', 'eye_of_cthulhu'], ['大眼珠', 'eye_of_cthulhu'],
  ['脑子', 'brain_of_cthulhu'], ['世吞', 'eater_of_worlds'], ['黑长直', 'eater_of_worlds'],
  ['铁长直', 'destroyer'], ['毁灭者', 'destroyer'], ['双子', 'twins'], ['机械骷髅', 'skeletron_prime'],
  ['猪龙鱼公爵', 'duke_fishron'], ['光之皇后', 'empress_of_light'], ['拜月教主', 'lunatic_cultist'],
  ['独眼巨鹿', 'deerclops'], ['鹿角怪', 'deerclops'], ['巨鹿', 'deerclops'],
  ['蜂王', 'queen_bee'], ['蜂后', 'queen_bee'], ['血肉墙', 'wall_of_flesh'], ['血墙', 'wall_of_flesh'],
  ['石巨人', 'golem'], ['天顶', 'zenith'], ['毕业剑', 'zenith'], ['终极剑', 'zenith'],
  ['泰拉剑', 'terra_blade'], ['猫剑', 'meowmere'], ['喵剑', 'meowmere'], ['彩虹猫', 'meowmere'],
  ['迷你鲨', 'megashark'], ['鲨鱼枪', 'megashark'], ['十字章', 'ankh_shield'],
  ['棱镜', 'last_prism'], ['最终棱镜', 'last_prism'], ['终极棱镜', 'last_prism'], ['蘑菇矿', 'shroomite_bar'],
  ['叶绿', 'chlorophyte_bar'], ['星旋', 'vortex_armor'], ['星云', 'nebula_armor'],
  ['星尘', 'stardust_armor'], ['日耀', 'solar_armor'],
  ['醉酒', 'seed_drunk'], ['喝醉', 'seed_drunk'], ['双邪恶', 'seed_drunk'],
  ['机械美杜莎', 'mechdusa'], ['美杜莎', 'mechdusa'], ['mechdusa', 'mechdusa'],
  ['奥克拉姆', 'mechdusa'], ['奥克拉姆之刃', 'mechdusa'], ['奥库瑞姆', 'mechdusa'], ['奥库瑞姆剃刀', 'mechdusa'], ['华夫饼', 'mechdusa'], ['三王合体', 'mechdusa'],
  ['05162020', 'seed_drunk'], ['5162020', 'seed_drunk'], ['20200516', 'seed_drunk'],
  ['饥荒', 'seed_constant'], ['挨饿', 'seed_constant'], ['黑暗种子', 'seed_constant'],
  ['蜜蜂世界', 'seed_bees'], ['蜂巢世界', 'seed_bees'], ['全是蜜蜂', 'seed_bees'],
  ['ftw', 'seed_ftw'], ['勇者', 'seed_ftw'], ['值得', 'seed_ftw'], ['强化世界', 'seed_ftw'],
  ['天顶种子', 'seed_zenith'], ['终极种子', 'seed_zenith'], ['getfixedboi', 'seed_zenith'],
  ['大杂烩', 'seed_zenith'], ['全特性', 'seed_zenith'],
  ['庆典', 'seed_party'], ['十周年', 'seed_party'], ['派对世界', 'seed_party'], ['celebrationmk10', 'seed_party'],
  ['无陷阱', 'seed_notraps'], ['安全世界', 'seed_notraps'], ['新手世界', 'seed_notraps'], ['no traps', 'seed_notraps'],
  ['别挖地', 'seed_dontdigup'], ['地狱开局', 'seed_dontdigup'], ['反转世界', 'seed_dontdigup'], ['dontdigup', 'seed_dontdigup'], ['向上爬', 'seed_dontdigup'],
  ['特殊种子', 'seed_drunk'], ['秘密种子', 'seed_drunk'], ['彩蛋种子', 'seed_drunk'],
  // 坐骑本体名 → 召唤物（名称错位，玩家常按坐骑名搜索）
  ['独角兽', 'blessed_apple'], ['ufo', 'cosmic_car_key'], ['兔子', 'fuzzy_carrot'],
  ['海龟', 'hardy_saddle'], ['蛇怪', 'ancient_horn'], ['海盗船', 'the_black_spot'],
  ['熔岩鲨鱼', 'superheated_blood'], ['扫帚', 'witch_broom'], ['驯鹿', 'reindeer_bells'],
  ['猪龙', 'scaly_truffle'], ['猪龙鱼', 'shrimpy_truffle'], ['蜜蜂坐骑', 'honeyed_goggles'],
  ['史莱姆坐骑', 'slime_mount'], ['有翼史莱姆', 'gelatinous_pillion'], ['钻头坐骑', 'drill_mount'],
  ['彩绘骏马', 'dusty_rawhide_saddle'], ['威严骏马', 'royal_gilded_saddle'], ['黑色骏马', 'black_studded_saddle'],
  ['鲁道夫', 'reindeer_bells'], ['海盗船坐骑', 'the_black_spot'],
  // 事件 Boss 俗称
  ['幽灵船', 'flying_dutchman'], ['荷兰人', 'flying_dutchman'],
  ['飞碟', 'martian_saucer'], ['UFO老板', 'martian_saucer'],
  ['冰女王', 'ice_queen'], ['雪女王', 'ice_queen'],
  ['圣诞坦克', 'santa_nk1'], ['哀悼木', 'mourning_wood'],
  ['双足翼龙', 'betsy'], ['鹦鹉螺', 'dreadnautilus'], ['海螺', 'dreadnautilus'],
]

let _pyIdx = null
function pyIndex () {
  if (_pyIdx) return _pyIdx
  _pyIdx = new Map()
  ALL.forEach(e => {
    const p = py(e.name)
    const tp = py(e.tags.join(''))
    _pyIdx.set(e, { full: p.full, init: p.init, en: (e.en || '').toLowerCase(), tags: e.tags.join(' '), tagFull: tp.full, tagInit: tp.init })
  })
  return _pyIdx
}

// 别名拼音索引（俗称/坐骑名的全拼与首字母也可搜索）
let _aliasIdx = null
function aliasIdx () {
  if (_aliasIdx) return _aliasIdx
  _aliasIdx = ALIAS.map(pair => {
    const p = py(pair[0])
    return { a: pair[0], id: pair[1], full: p.full, init: p.init }
  })
  return _aliasIdx
}

// 子序列：kw 各字符按顺序出现在 s 中
function isSubseq (kw, s) {
  let i = 0
  for (const c of s) { if (c === kw[i]) { i++; if (i === kw.length) return true } }
  return false
}
// 无序包含：kw 每个字符都在 s 中出现
function hasAll (kw, s) {
  for (const c of kw) if (!s.includes(c)) return false
  return true
}

function search (kw) {
  kw = (kw || '').trim().toLowerCase()
  if (!kw) return []
  const idx = pyIndex()
  const scored = []
  ALL.forEach(e => {
    const p = idx.get(e)
    let sc = 0
    if (e.name.startsWith(kw)) sc = 100
    else if (e.name.includes(kw)) sc = 88
    else if (p.en === kw) sc = 84
    else if (p.en.startsWith(kw)) sc = 82
    else if (p.en.includes(kw)) sc = 72
    else if (p.full === kw) sc = 80
    else if (p.full.startsWith(kw)) sc = 74
    else if (p.full.includes(kw)) sc = 62
    else if (p.init === kw) sc = 70
    else if (kw.length >= 2 && p.init.startsWith(kw)) sc = 56
    else if (kw.length >= 2 && isSubseq(kw, e.name)) sc = 38
    else if (kw.length >= 3 && isSubseq(kw, p.en)) sc = 32
    else if (kw.length >= 2 && kw.length <= 6 && hasAll(kw, e.name)) sc = 25
    // 标签命中：搜"战士/法师/材料/翅膀/肉后"等标签词，整批条目按标签得分
    if (!sc || sc < 78) {
      let tsc = 0
      if (p.tags.includes(kw)) tsc = p.tags.split(' ').some(t => t === kw) ? 78 : 66
      else if (kw.length >= 2 && p.tagFull === kw) tsc = 72
      else if (kw.length >= 2 && p.tagFull.startsWith(kw)) tsc = 64
      else if (kw.length >= 2 && p.tagFull.includes(kw)) tsc = 58
      else if (kw.length >= 2 && p.tagInit === kw) tsc = 62
      else if (kw.length >= 2 && p.tagInit.startsWith(kw)) tsc = 54
      else if (kw.length >= 2 && p.tagInit.includes(kw)) tsc = 50
      if (tsc > sc) sc = tsc
    }
    if (sc) scored.push([sc, e])
  })
  // 别名 / 俗称命中（文字或拼音：关键词包含别名、别名包含关键词、全拼、首字母）：已有分数则提升；精确等于给最高
  aliasIdx().forEach(t => {
    const e = byId[t.id]
    if (!e) return
    let sc = 0
    if (t.a === kw) sc = 98
    else if (kw.includes(t.a) || t.a.includes(kw)) sc = 95
    else if (t.full === kw) sc = 80
    else if (t.full.startsWith(kw)) sc = 74
    else if (t.full.includes(kw)) sc = 62
    else if (kw.length >= 2 && t.init === kw) sc = 70
    else if (kw.length >= 2 && t.init.startsWith(kw)) sc = 56
    if (!sc) return
    const hit = scored.find(s => s[1] === e)
    if (hit) hit[0] = Math.max(hit[0], sc)
    else scored.push([sc, e])
  })
  scored.sort((a, b) => b[0] - a[0])
  return scored.slice(0, 30).map(s => s[1])
}

function searchStrats (kw) {
  kw = (kw || '').trim().toLowerCase()
  if (!kw) return []
  const scored = []
  strats.forEach(s => {
    const t = s.title.toLowerCase()
    let sc = 0
    if (t.startsWith(kw)) sc = 90
    else if (t.includes(kw)) sc = 78
    else if (s.summary && s.summary.toLowerCase().includes(kw)) sc = 55
    else if (kw.length >= 2 && hasAll(kw, s.title)) sc = 35
    if (sc) scored.push([sc, s])
  })
  scored.sort((a, b) => b[0] - a[0])
  return scored.slice(0, 8).map(s => s[1])
}

/* ---------- 今日热门（候选池 + 日期种子每日轮换，点击跳详情） ---------- */
const HOT_POOL = [
  // Boss
  'moon_lord', 'duke_fishron', 'empress_of_light', 'plantera', 'golem', 'skeletron_prime',
  'twins', 'destroyer', 'eye_of_cthulhu', 'brain_of_cthulhu', 'skeletron', 'queen_bee',
  'wall_of_flesh', 'king_slime', 'queen_slime', 'lunatic_cultist', 'deerclops', 'mechdusa',
  // 毕业武器 / 传说装备
  'zenith', 'terra_blade', 'meowmere', 'terraprisma', 'last_prism', 'megashark', 'sdmg',
  'celebration_mk2', 'tsunami', 'kaleidoscope', 'ankh_shield', 'terraspark_boots',
  'fishron_wings', 'solar_armor', 'nebula_armor', 'stardust_armor', 'vortex_armor',
  'molten_armor', 'picksaw', 'slime_staff'
].map(id => byId[id]).filter(Boolean)

// 当日种子（本地时区）：同一天内结果稳定，次日自动换一批
function hotDate () {
  const d = new Date()
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
}

// 线性同余洗牌，按日确定性抽取 count 个
function hotToday (count) {
  count = count || 10
  const pool = HOT_POOL.slice()
  let seed = hotDate()
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 }
  const picked = []
  while (picked.length < count && pool.length) {
    picked.push(pool.splice(Math.floor(rand() * pool.length), 1)[0])
  }
  return picked
}

/* 今日热门：按分类过滤（all | item | boss | strategy） */
// 热门搜索词：编辑推荐 + 今日热榜条目名/攻略名（每日轮换，两处搜索入口共用）
// 安全获取：hotWords 异常/未定义时回退静态热词（防基础库/缓存差异导致页面崩溃）
function hotWordsSafe () {
  try { return typeof hotWords === 'function' ? hotWords() : HOT_WORDS.slice(0, 14) }
  catch (e) { return HOT_WORDS.slice(0, 14) }
}

function hotWords (n) {
  const out = HOT_WORDS.slice()
  hotByCat(6).forEach(h => { if (out.indexOf(h.name) < 0) out.push(h.name) })
  hotStrats(3).forEach(s => { if (out.indexOf(s.title) < 0) out.push(s.title) })
  return out.slice(0, n || 14)
}

function hotByCat (count, cat) {
  if (!cat || cat === 'all') return hotToday(count)
  if (cat === 'strategy') return [] // 攻略类走 hotStrats
  return hotToday(999).filter(e => e.type === cat).slice(0, count)
}

/* 攻略热门：从攻略池按日确定性抽取 */
function hotStrats (count) {
  const pool = strats.filter(s => s.id && s.title).map(s => ({ id: s.id, title: s.title, cover: s.cover, cat: s.cat }))
  let seed = hotDate()
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 }
  const picked = []
  while (picked.length < count && pool.length) {
    picked.push(pool.splice(Math.floor(rand() * pool.length), 1)[0])
  }
  return picked
}

/* 热度趋势：昨日排名 vs 今日排名 → up / down / flat（当日抽取顺序即名次） */
function hotTrend (id) {
  const today = hotToday(999).findIndex(e => e.id === id)
  if (today < 0) return 'new'
  const ySeed = (hotDate() - 1) * 0 + yesterdaySeed()
  const pool = HOT_POOL.slice()
  let seed = ySeed
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 }
  const order = []
  while (pool.length) {
    order.push(pool.splice(Math.floor(rand() * pool.length), 1)[0])
  }
  const yest = order.findIndex(e => e.id === id)
  if (yest < 0) return 'new'
  if (yest > today) return 'up'
  if (yest < today) return 'down'
  return 'flat'
}
// 昨日种子：日期回退一天再取 yyyyMMdd
function yesterdaySeed () {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
}

/* 攻略热度趋势：昨日攻略榜 vs 今日攻略榜 → up / down / flat / new */
function hotStratTrend (id) {
  const today = hotStrats(999).findIndex(e => e.id === id)
  if (today < 0) return 'new'
  const pool = strats.filter(s => s.id && s.title).map(s => s.id)
  let seed = yesterdaySeed()
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 }
  const order = []
  while (pool.length) {
    order.push(pool.splice(Math.floor(rand() * pool.length), 1)[0])
  }
  const yest = order.indexOf(id)
  if (yest < 0) return 'new'
  if (yest > today) return 'up'
  if (yest < today) return 'down'
  return 'flat'
}

// id → 玩家俗称（取别名表第一条，无则返回空）
function aliasOf (id) {
  for (let i = 0; i < ALIAS.length; i++) {
    if (ALIAS[i][1] === id) return ALIAS[i][0]
  }
  return ''
}

/* ---------- 文本实体链接化（获取方式/出现地点等描述 → 可跳转片段） ---------- */
// 首次调用时构建"名称 → id"匹配表（条目名 + 玩家俗称，长名优先），缓存正则
let _linkIdx = null
function linkIndex () {
  if (_linkIdx) return _linkIdx
  const names = []
  ALL.forEach(e => { if (e.name && e.name.length >= 2) names.push([e.name, e.id]) })
  ALIAS.forEach(p => { if (p[0].length >= 2 && byId[p[1]]) names.push([p[0], p[1]]) })
  const seen = {}
  const uniq = []
  names.forEach(p => { if (!seen[p[0]]) { seen[p[0]] = 1; uniq.push(p) } })
  // 长名优先：保证"克苏鲁之眼"优先于"眼球"等短别名命中
  uniq.sort((a, b) => b[0].length - a[0].length)
  const map = {}
  uniq.forEach(p => { map[p[0]] = p[1] })
  const re = new RegExp('(' + uniq.map(p => p[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'g')
  _linkIdx = { re, map }
  return _linkIdx
}

// 文本 → 片段数组：[{ref:false, s:'纯文本'}, {ref:true, s:'克苏鲁之眼', id:'eye_of_cthulhu'}]
// selfId：当前条目自身，命中时按纯文本渲染（避免自我跳转）
function linkify (text, selfId) {
  const out = []
  if (!text) return out
  const s = String(text)
  const { re, map } = linkIndex()
  let last = 0
  let m
  re.lastIndex = 0
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) out.push({ ref: false, s: s.slice(last, m.index) })
    const id = map[m[0]]
    if (!id || id === selfId) out.push({ ref: false, s: m[0] })
    else out.push({ ref: true, s: m[0], id })
    last = m.index + m[0].length
  }
  if (last < s.length) out.push({ ref: false, s: s.slice(last) })
  return out
}

const HOT_WORDS = ['天顶剑', '肉山', '月亮领主', '猪鲨', '泰拉刃', '战士', '翅膀', '机械三王', '十字章护盾', '毕业', '永夜刃', '法师']

/* ---------- 武器排行（取 stats 首格数字排序） ---------- */
function weaponRank (sub) {
  const list = ALL.filter(e => e.type === 'item' && e.raw.cat === 'weapon' && (!sub || e.raw.sub === sub))
  return list.map(e => {
    const m = (e.raw.stats.find(s => s[0] === '伤害') || ['', ''])[1].match(/(\d+)/)
    return { ...e, dmgNum: m ? +m[1] : 0 }
  }).sort((a, b) => b.dmgNum - a.dmgNum)
}

/* ---------- 详情跳转 ---------- */
function go (id, type) {
  const e = byId[id]
  const t = type || (e ? e.type : '')
  if (t === 'boss' || t === 'mon' || t === 'item' || t === 'seed' || t === 'npc') {
    wx.navigateTo({ url: '/pages/detail/detail?type=' + t + '&id=' + id })
  } else if (t === 'recipe') {
    wx.switchTab({ url: '/pages/craft/craft' })
    const app = getApp()
    app.globalData.pendingCraft = id
  } else if (t === 'strategy') {
    wx.navigateTo({ url: '/pages/strategy/strategy?id=' + id })
  }
}

/* ---------- 合成树 ---------- */
// 解析单个 id → {id, name, art, obtain, craftable}
function lookup (id) {
  if (R.byId[id]) return { id, name: R.byId[id].name, artId: R.byId[id].art || 'stone', art: ARTS[R.byId[id].art] || ARTS.stone, obtain: '', craftable: true }
  if (byId[id]) return { id, name: byId[id].name, artId: byId[id].artId, art: byId[id].art, obtain: byId[id].raw.obtain || byId[id].raw.spawn || '', craftable: false }
  if (R.EXTRA[id]) return { id, name: R.EXTRA[id].name, artId: R.EXTRA[id].art || 'stone', art: ARTS[R.EXTRA[id].art] || ARTS.stone, obtain: R.EXTRA[id].obtain, craftable: false }
  return { id, name: id, artId: 'stone', art: ARTS.stone, obtain: '未知来源', craftable: false }
}

// 构建可折叠合成树；have 为 Set（拥有材料 id）
function buildTree (id, have, depth) {
  depth = depth || 0
  const info = lookup(id)
  const rec = R.byId[id]
  const node = {
    id, name: info.name, artId: info.artId, art: info.art, count: 1, obtain: info.obtain,
    craftable: !!rec, station: rec ? R.STATIONS[rec.station] : '',
    kids: [], folded: depth >= 2, // 深层默认折叠
    status: have ? (have.has(id) ? 'have' : 'lack') : '' // have=绿 lack=红
  }
  if (rec && depth < 6) {
    node.kids = rec.ingredients.map(g => {
      const k = buildTree(g.id, have, depth + 1)
      k.count = g.count
      k.needCount = have && !have.has(g.id)
      return k
    })
  }
  return node
}

// 统计整树缺失的基础材料清单（去重）
function missingList (node, have, out, seen) {
  out = out || []; seen = seen || {}
  if (have && !have.has(node.id)) {
    if (!node.craftable || (node.kids || []).length === 0) {
      const key = node.id
      if (!seen[key]) { seen[key] = 1; out.push({ id: node.id, name: node.name, artId: node.artId, art: node.art, obtain: node.obtain }) }
    }
  }
  (node.kids || []).forEach(k => missingList(k, have, out, seen))
  return out
}

// 配方名称联想（模糊：名称/拼音/英文/别名）
function recipeSearch (kw) {
  kw = (kw || '').trim().toLowerCase()
  if (!kw) return R.QUICK.map(q => ({ id: q.id, name: q.name, artId: (R.byId[q.id] && R.byId[q.id].art) || 'stone', art: (R.byId[q.id] && ARTS[R.byId[q.id].art]) || ARTS.stone }))
  const scored = []
  R.RECIPES.forEach(r => {
    const e = byId[r.result]
    const name = r.name || (e && e.name) || ''
    let sc = 0
    const p = e ? pyIndex().get(e) : null
    if (name.startsWith(kw)) sc = 100
    else if (name.includes(kw)) sc = 85
    else if (p) {
      if (p.en.startsWith(kw)) sc = 80
      else if (p.en.includes(kw)) sc = 70
      else if (p.full.startsWith(kw)) sc = 72
      else if (p.full.includes(kw)) sc = 60
      else if (kw.length >= 2 && p.init.startsWith(kw)) sc = 55
      else if (kw.length >= 2 && hasAll(kw, name)) sc = 30
    }
    if (sc) scored.push([sc, r])
  })
  ALIAS.forEach(pair => {
    const a = pair[0], r = R.byId[pair[1]]
    if (!r || !(kw.includes(a) || a.includes(kw))) return
    const hit = scored.find(s => s[1] === r)
    if (hit) hit[0] = Math.max(hit[0], 90)
    else scored.push([90, r])
  })
  scored.sort((x, y) => y[0] - x[0])
  return scored.slice(0, 10).map(s => {
    const r = s[1]
    return { id: r.result, name: r.name, artId: r.art || 'stone', art: ARTS[r.art] || ARTS.stone, en: '' }
  })
}

module.exports = {
  ALL, byId, CATS, strats, BANNERS: strats.BANNERS,
  search, searchStrats, hotToday, hotDate, hotByCat, hotStrats, hotTrend, hotStratTrend,
  HOT_WORDS, weaponRank, aliasOf, linkify, hotWords, hotWordsSafe,
  go, lookup, buildTree, missingList, recipeSearch,
  RARITY, ARTS, R, itemBaseStats, SUB_TAGS
}
