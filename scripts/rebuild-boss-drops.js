// 全量重建 30 个 Boss 的掉落表（依据官方 wiki 逐页核实，2026-09-15）
// 同时修正：真剑配方展示（1.4.4 起用断裂英雄剑）、闪电胡萝卜获得方式
const fs = require('fs')
const path = require('path')
const STAGE = path.join(__dirname, 'catalog-stage')
const readJSON = n => JSON.parse(fs.readFileSync(path.join(STAGE, n), 'utf8'))

// ---------- 解析词典 ----------
const gt = readJSON('gametext-zh.json')
const GTN = gt.ItemName || {}
const items = require('../data/items.js')
const dexEn = {}
items.forEach(x => { if (x.en && !dexEn[x.en]) dexEn[x.en] = { id: x.id, name: x.name } })
let nm2in = {}
try {
  const s = fs.readFileSync(path.join(STAGE, 'iteminfo-zh.txt'), 'utf8')
  const i1 = s.indexOf('[=====['), i2 = s.indexOf(']=====')
  const blob = JSON.parse(s.slice(i1 + 7, i2))
  Object.values(blob).forEach(it => { if (it && it.name && it.internalName && !nm2in[it.name]) nm2in[it.name] = it.internalName })
} catch (e) { console.log('iteminfo 解析失败', e.message) }
try { readJSON('raw.json').forEach(x => { if (x.en && x.internal && !nm2in[x.en]) nm2in[x.en] = x.internal }) } catch (e) {}
let volsEn = {}
for (const [vol, f] of [['pkg-cat-1', 'data/data-v1.js'], ['pkg-cat-2', 'data/data-v2.js'], ['pkg-cat-3', 'data/data-v3.js']]) {
  try { require('../' + vol + '/' + f).forEach(x => { if (x.en && !volsEn[x.en]) volsEn[x.en] = { f: x.f, n: x.n } }) } catch (e) {}
}

const misses = []
// entry: [en, fallbackZh, rate, explicitInternal?]
function mk (e) {
  const [en, fbZh, rate, explicit] = e
  const internal = explicit || nm2in[en]
  if (!internal) misses.push(en)
  const dex = dexEn[en]
  const vol = volsEn[en]
  let zh = (internal && GTN[internal]) || (vol && vol.n) || fbZh
  if (fbZh && fbZh.includes('×') && !/面具|纪念章|圣物/.test(fbZh)) zh = fbZh // 带数量的自定义名优先
  const id = dex ? dex.id : (internal ? 'cat:' + internal : '')
  return `{id:${JSON.stringify(id)},name:${JSON.stringify(zh)},rate:${JSON.stringify(rate)}}`
}

// ---------- 官方掉落数据（30 Boss）----------
const D = {
  king_slime: [
    ['Solidifier', '固化机', '100%'],
    ['Slimy Saddle', '粘鞍', '25%（专家 50%）'],
    ['Ninja Hood', '忍者头巾', '33.33%（三选一）'],
    ['Ninja Shirt', '忍者衣', '33.33%（三选一）'],
    ['Ninja Pants', '忍者裤', '33.33%（三选一）'],
    ['Slime Hook', '史莱姆钩', '33.33%（与史莱姆枪二选一）'],
    ['Slime Gun', '史莱姆枪', '66.67%（与史莱姆钩二选一）'],
    ['Lesser Healing Potion', '次级治疗药水×5~15', '100%'],
    ['King Slime Mask', '', '14.29%'],
    ['King Slime Trophy', '', '10%'],
    ['Slime Staff', '史莱姆法杖', '3.33%'],
    ['Royal Gel', '', '100%（专家宝藏袋）'],
    ['Royal Delight', '', '25%（大师）'],
    ['King Slime Relic', '', '100%（大师）'],
  ],
  eye_of_cthulhu: [
    ['Unholy Arrow', '邪恶箭×20~50', '100%'],
    ['Demonite Ore', '魔矿×30~90', '100%（腐化世界）'],
    ['Corrupt Seeds', '腐化种子×1~3', '100%（腐化世界）'],
    ['Crimtane Ore', '猩红矿×30~90', '100%（猩红世界）'],
    ['Crimson Seeds', '猩红种子×1~3', '100%（猩红世界）'],
    ['Lesser Healing Potion', '次级治疗药水×5~15', '100%'],
    ['Eye of Cthulhu Mask', '', '14.29%'],
    ['Eye of Cthulhu Trophy', '', '10%'],
    ['Binoculars', '双筒望远镜', '2.5%（专家 3.33%）'],
    ['Badger Hat', '獾帽', '100%（与血肉墙同一天击败）'],
    ['Shield of Cthulhu', '', '100%（专家宝藏袋）'],
    ['0x33 Aviators', '0x33的墨镜', '100%（大师）'],
    ['Suspicious Grinning Eye', '', '25%（大师）'],
    ['Eye of Cthulhu Relic', '', '100%（大师）'],
  ],
  eater_of_worlds: [
    ['Shadow Scale', '暗影鳞片×若干', '100%'],
    ['Demonite Ore', '魔矿×若干', '100%'],
    ['Lesser Healing Potion', '次级治疗药水×5~15', '100%'],
    ['Eater of Worlds Mask', '', '14.29%'],
    ['Eater of Worlds Trophy', '', '10%'],
    ["Eater's Bone", '吞噬者骨头', '5%'],
    ['Worm Scarf', '蠕虫围巾', '100%（专家宝藏袋）'],
    ['Writhing Remains', '蠕动残骸', '25%（大师）'],
    ['Eater of Worlds Relic', '', '100%（大师）'],
  ],
  brain_of_cthulhu: [
    ['Crimtane Ore', '猩红矿×40~90', '100%'],
    ['Lesser Healing Potion', '次级治疗药水×5~15', '100%'],
    ['Brain of Cthulhu Mask', '', '14.29%'],
    ['Brain of Cthulhu Trophy', '', '10%'],
    ['Bone Rattle', '骨头摇铃', '5%'],
    ['Brain of Confusion', '混乱之脑', '100%（专家宝藏袋）'],
    ['Brain in a Jar', '罐中之脑', '25%（大师）'],
    ['Brain of Cthulhu Relic', '', '100%（大师）'],
  ],
  queen_bee: [
    ['Bee Gun', '蜂枪', '33%（三选一）'],
    ['Bee Keeper', '养蜂人', '33%（三选一）'],
    ["The Bee's Knees", '蜂膝弓', '33%（三选一）'],
    ['Hive Wand', '蜂巢魔杖', '33%'],
    ['Bee Hat', '蜂帽', '11%'],
    ['Bee Shirt', '蜂衣', '11%'],
    ['Bee Pants', '蜂裤', '11%'],
    ['Honey Comb', '蜂巢', '33%'],
    ['Nectar', '花蜜', '6.7%（专家 11%）'],
    ['Queen of Bees', '蜂之女王', '6.67%（专家 11%）'],
    ['Honeyed Goggles', '蜂蜜护目镜', '5%（专家 11%）'],
    ['Beenade', '蜂手榴弹×10~30', '75%'],
    ['Bee Wax', '蜂蜡×16~26', '100%'],
    ['Bottled Honey', '瓶装蜂蜜×5~15', '100%'],
    ['Queen Bee Mask', '', '14.29%'],
    ['Queen Bee Trophy', '', '10%'],
    ['Hive Pack', '蜂巢背包', '100%（专家宝藏袋）'],
    ['Sparkling Honey', '闪光蜂蜜', '25%（大师）'],
    ['Queen Bee Relic', '', '100%（大师）'],
  ],
  skeletron: [
    ['Healing Potion', '治疗药水×5~15', '100%'],
    ['Bone Glove', '骨头手套', '100%'],
    ['Skeletron Mask', '', '14.29%'],
    ['Skeletron Hand', '', '12.24%'],
    ['Book of Skulls', '', '10.5%'],
    ["Chippy's Couch", '奇皮的沙发', '14.29%'],
    ['Skeletron Trophy', '', '10%'],
    ['Hellforge', '地狱熔炉', '100%（世界中无地狱熔炉时）'],
    ['Possessed Skull', '被附身的头骨', '25%（大师）'],
    ['Skeletron Relic', '', '100%（大师）'],
  ],
  deerclops: [
    ['Eye Bone', '骨眼', '33%'],
    ['Eyebrella', '眼球伞', '33%'],
    ['Radio Thing', '收音机', '33%'],
    ["Dizzy's Rare Gecko Chester", '迪兹的稀有壁虎帽', '7.14%'],
    ['Pew-matic Horn', '气喇叭', '25%（四选一）'],
    ['Weather Pain', '天候棒', '25%（四选一）'],
    ['Houndius Shootius', '眼球激光塔', '25%（四选一）'],
    ['Lucy the Axe', '露西斧', '25%（四选一）'],
    ['Healing Potion', '治疗药水×5~15', '100%'],
    ['Deerclops Mask', '', '14.29%'],
    ['Deerclops Trophy', '', '10%'],
    ['Bone Helm', '骨头头盔', '100%（专家宝藏袋）'],
    ['Deerclops Eyeball', '独眼巨鹿眼球', '25%（大师）'],
    ['Deerclops Relic', '', '100%（大师）'],
  ],
  wall_of_flesh: [
    ['Pwnhammer', '神锤', '100%'],
    ['Healing Potion', '治疗药水×5~15', '100%'],
    ['Breaker Blade', '破晓之刃', '25%（四选一）'],
    ['Clockwork Assault Rifle', '发条突击步枪', '25%（四选一）'],
    ['Laser Rifle', '激光步枪', '25%（四选一）'],
    ['Firecracker', '鞭炮', '25%（四选一）'],
    ['Warrior Emblem', '战士徽章', '25%（四选一）'],
    ['Ranger Emblem', '游侠徽章', '25%（四选一）'],
    ['Sorcerer Emblem', '巫师徽章', '25%（四选一）'],
    ['Summoner Emblem', '召唤徽章', '25%（四选一）'],
    ['Wall of Flesh Mask', '', '14.29%'],
    ['Wall of Flesh Trophy', '', '10%'],
    ['Demon Heart', '恶魔之心', '100%（专家宝藏袋）'],
    ['Goat Skull', '山羊头骨', '25%（大师，坐骑）'],
    ['Wall of Flesh Relic', '', '100%（大师）'],
  ],
  queen_slime: [
    ['Sparkle Slime Balloon', '闪亮史莱姆气球×25~75', '100%'],
    ['Crystal Assassin Hood', '水晶刺客兜帽', '33.33%（三选一）'],
    ['Crystal Assassin Shirt', '水晶刺客上衣', '33.33%（三选一）'],
    ['Crystal Assassin Pants', '水晶刺客裤', '33.33%（三选一）'],
    ['Blade Staff', '刃杖', '25%（专家 33.33%）'],
    ['Gelatinous Pillion', '明胶女式鞍', '25%（专家 50%）'],
    ['Hook of Dissonance', '游离之钩', '33.33%（专家 50%）'],
    ['Greater Healing Potion', '强效治疗药水×5~15', '100%'],
    ['Queen Slime Mask', '', '14.29%'],
    ['Queen Slime Trophy', '', '10%'],
    ['Volatile Gelatin', '挥发性凝胶', '100%（专家宝藏袋）'],
    ['Regal Delicacy', '皇家美食', '25%（大师）'],
    ['Queen Slime Relic', '', '100%（大师）'],
  ],
  twins: [
    ['Soul of Sight', '视域之魂×25~40', '100%'],
    ['Hallowed Bar', '神圣锭×15~30', '100%（专家 20~35）'],
    ['Greater Healing Potion', '强效治疗药水×5~15', '100%'],
    ['Twins Mask', '', '14.29%'],
    ['Retinazer Trophy', '魔眼纪念章', '10%（击杀激光眼）'],
    ['Spazmatism Trophy', '火焰魔眼纪念章', '10%（击杀魔焰眼）'],
    ['Mechanical Wheel Piece', '机械车轮部件', '100%（专家宝藏袋）'],
    ['Twins Relic', '', '100%（大师）'],
    ['Pair of Eyeballs', '一对眼球', '25%（大师）'],
  ],
  destroyer: [
    ['Soul of Might', '力量之魂×25~40', '100%'],
    ['Hallowed Bar', '神圣锭×15~30', '100%（专家 20~35）'],
    ['Greater Healing Potion', '强效治疗药水×5~15', '100%'],
    ['Destroyer Mask', '', '14.29%'],
    ['Destroyer Trophy', '', '10%'],
    ['Mechanical Wagon Piece', '机械货车部件', '100%（专家宝藏袋）'],
    ['Destroyer Relic', '', '100%（大师）'],
    ['Deactivated Probe', '失活的探测器', '25%（大师）'],
  ],
  skeletron_prime: [
    ['Soul of Fright', '恐惧之魂×25~40', '100%'],
    ['Hallowed Bar', '神圣锭×15~30', '100%（专家 20~35）'],
    ['Greater Healing Potion', '强效治疗药水×5~15', '100%'],
    ['Skeletron Prime Mask', '', '14.29%'],
    ['Skeletron Prime Trophy', '', '10%'],
    ['Mechanical Battery Piece', '机械电池部件', '100%（专家宝藏袋）'],
    ['Skeletron Prime Relic', '', '100%（大师）'],
    ['Robotic Skull', '机械骷髅头', '25%（大师）'],
  ],
  plantera: [
    ['Temple Key', '神庙钥匙', '100%'],
    ['Greater Healing Potion', '强效治疗药水×5~15', '100%'],
    ['Seedler', '种子弯刀', '12.5%（八选一）'],
    ['Grenade Launcher', '榴弹发射器', '12.5%（八选一，附带火箭 I×50~149）'],
    ['Venus Magnum', '维纳斯马格南', '12.5%（八选一）'],
    ['Nettle Burst', '荨麻爆发', '12.5%（八选一）'],
    ['Leaf Blower', '吹叶机', '12.5%（八选一）'],
    ['Flower Pow', '花之力', '12.5%（八选一）'],
    ['Wasp Gun', '胡蜂枪', '12.5%（八选一）'],
    ['Vulgar Display of Flower', '花之粗鄙展示', '12.5%（八选一）'],
    ['Pygmy Staff', '矮人法杖', '25%（专家 50%）'],
    ['Plantera Mask', '', '14.29%'],
    ['Thorn Hook', '荆棘钩', '10%'],
    ['Plantera Trophy', '', '10%'],
    ['Seedling', '幼苗', '5%（专家 6.67%）'],
    ['The Axe', '吉他斧', '2%（专家 5%）'],
    ['Spore Sac', '孢子囊', '100%（专家宝藏袋）'],
    ['Plantera Seedling', '世纪之花幼苗', '25%（大师）'],
    ['Plantera Relic', '', '100%（大师）'],
  ],
  golem: [
    ['Beetle Husk', '甲虫外壳×4~8', '100%（专家 18~23）'],
    ['Picksaw', '锯刃镐', '25%（专家 33.33%）'],
    ['Stynger', '刺钉枪', '14.29%（七选一，附带刺钉弹×60~99）'],
    ['Possessed Hatchet', '鬼魅手斧', '14.29%（七选一）'],
    ['Sun Stone', '太阳石', '14.29%（七选一）'],
    ['Eye of the Golem', '石巨人之眼', '14.29%（七选一）'],
    ['Heat Ray', '热射线', '14.29%（七选一）'],
    ['Staff of Earth', '大地法杖', '14.29%（七选一）'],
    ['Golem Fist', '石巨人之拳', '14.29%（七选一）'],
    ['Mobius Strip', '莫比乌斯带', '16.67%'],
    ['Greater Healing Potion', '强效治疗药水×5~15', '100%'],
    ['Golem Mask', '', '14.29%'],
    ['Golem Trophy', '', '10%'],
    ['Shiny Stone', '闪亮石', '100%（专家宝藏袋）'],
    ['Guardian Golem', '守护石巨人', '25%（大师）'],
    ['Golem Relic', '', '100%（大师）'],
  ],
  duke_fishron: [
    ['Tsunami', '海啸弓', '14.29%（七选一）'],
    ['Flairon', '猪鲨链球', '14.29%（七选一）'],
    ['Bubble Gun', '气泡枪', '14.29%（七选一）'],
    ['Razorblade Typhoon', '利刃台风', '14.29%（七选一）'],
    ['Tempest Staff', '暴风法杖', '14.29%（七选一）'],
    ['Electric Eel', '电鳗', '14.29%（七选一）'],
    ['Kraken', '克拉肯球', '14.29%（七选一）'],
    ['Fishron Wings', '猪龙鱼之翼', '6.67%（专家 10%）'],
    ['Greater Healing Potion', '强效治疗药水×5~15', '100%'],
    ['Duke Fishron Mask', '', '14.29%'],
    ['Duke Fishron Trophy', '', '10%'],
    ['Shrimpy Truffle', '虾松露', '100%（专家宝藏袋）'],
    ['Pork of the Sea', '海之猪', '25%（大师）'],
    ['Duke Fishron Relic', '', '100%（大师）'],
  ],
  empress_of_light: [
    ['Nightglow', '夜光', '25%（四选一）'],
    ['Starlight', '星光', '25%（四选一）'],
    ['Kaleidoscope', '万花筒', '25%（四选一）'],
    ['Eventide', '日暮', '25%（四选一）'],
    ['Terraprisma', '泰拉棱镜', '100%（白天全程无伤击败）'],
    ['Greater Healing Potion', '强效治疗药水×5~15', '100%'],
    ['Empress Wings', '女皇之翼', '6.67%（专家 10%）'],
    ['Prismatic Dye', '棱镜染料×3', '25%'],
    ['Empress of Light Mask', '', '14.29%'],
    ['Stellar Tune', '星辰之曲', '2%（专家 5%）'],
    ['Rainbow Cursor', '彩虹光标', '5%'],
    ['Empress of Light Trophy', '', '10%'],
    ['Soaring Insignia', '翱翔徽章', '100%（专家宝藏袋）'],
    ['Jewel of Light', '光之宝石', '25%（大师）'],
    ['Empress of Light Relic', '', '100%（大师）'],
  ],
  lunatic_cultist: [
    ['Ancient Manipulator', '远古操纵机', '100%'],
    ['Greater Healing Potion', '强效治疗药水×5~15', '100%'],
    ['Lunatic Cultist Mask', '', '14.29%'],
    ['Lunatic Cultist Trophy', '', '10%'],
    ['Tablet Fragment', '石板残片', '25%（大师）'],
    ['Lunatic Cultist Relic', '', '100%（大师）'],
  ],
  moon_lord: [
    ['Portal Gun', '传送枪', '100%'],
    ['Luminite', '夜明矿×70~90', '100%（专家 90~110）'],
    ['Super Healing Potion', '超级治疗药水×5~15', '100%'],
    ['Moon Lord Mask', '', '14.29%'],
    ['Moon Lord Trophy', '', '10%'],
    ['Meowmere Minecart', '喵喵矿车', '10%'],
    ['Meowmere', '彩虹猫之刃', '20%（十选二）'],
    ['Terrarian', '泰拉悠悠球', '20%（十选二）'],
    ['Star Wrath', '狂星之怒', '20%（十选二）'],
    ['S.D.M.G.', '太空海豚机枪', '20%（十选二）'],
    ['Celebration Mk2', '庆典 Mk2', '20%（十选二）'],
    ['Last Prism', '终极棱镜', '20%（十选二）'],
    ['Lunar Flare', '月耀', '20%（十选二）'],
    ['Rainbow Crystal Staff', '彩虹水晶法杖', '20%（十选二）'],
    ['Lunar Portal Staff', '月相传送门法杖', '20%（十选二）'],
    ['Possession', '附身', '20%（十选二）'],
    ['Gravity Globe', '重力球', '100%（专家宝藏袋）'],
    ['Suspicious Looking Tentacle', '可疑的触手', '100%（专家宝藏袋）'],
    ['Celestial Starboard', '星界踏板', '100%（专家宝藏袋）'],
    ['Piece of Moon Squid', '月亮鱿鱼切片', '25%（大师）'],
    ['Moon Lord Relic', '', '100%（大师）'],
  ],
  flying_dutchman: [
    ['Coin Gun', '金币枪', '2%'],
    ['Barrel Launcher', '炮桶发射器', '10%'],
    ['Cutlass', '短弯刀', '10%'],
    ['Lucky Coin', '幸运币', '6.67%'],
    ['Discount Card', '优惠卡', '6.67%'],
    ['Pirate Staff', '海盗法杖', '6.67%'],
    ['Gold Ring', '金戒指', '6.67%'],
    ['The Dutchman', '荷兰人号矿车', '5%'],
    ['Golden Chair', '金质家具（随机一件）', '100%'],
    ['Flying Dutchman Trophy', '', '10%'],
    ['The Black Spot', '黑斑', '25%（大师）'],
    ['Flying Dutchman Relic', '', '100%（大师）'],
  ],
  dreadnautilus: [
    ['Chum Bucket', '鱼饵桶×7~10', '50%'],
    ['Sanguine Staff', '血色法杖', '50%（专家 100%）'],
    ['Blood Moon Monolith', '血月碑', '10%'],
    ['Bloody Tear', '血腥之泪', '50%（专家 100%）'],
  ],
  dark_mage: [
    ["Squire's Shield", '侍从盾', '25%（T1）/8.33%（T3）·专家翻倍，二选一'],
    ["Apprentice's Scarf", '学徒围巾', '25%（T1）/8.33%（T3）·专家翻倍，二选一'],
    ['War Table', '战争桌', '50%（T1）/12.5%（T3）·专家翻倍'],
    ['War Table Banner', '战争桌旗×4', '50%（T1）/12.5%（T3）·专家翻倍'],
    ['Dragon Egg', '龙蛋', '16.67%（T1）/8.33%（T3）·专家 25%，二选一'],
    ['Gato Egg', '加托蛋', '16.67%（T1）/8.33%（T3）·专家 25%，二选一'],
    ['Dark Mage Mask', '', '14.29%（T1）/7.14%（T3）'],
    ['Dark Mage Trophy', '', '10%'],
    ["Dark Mage's Tome", '黑暗魔法师之书', '25%（大师）'],
    ['Dark Mage Relic', '', '100%（大师）'],
  ],
  ogre: [
    ["Huntress's Buckler", '猎手小圆盾', '16.66%（T2）/8.33%（T3）·专家翻倍，二选一'],
    ["Monk's Belt", '僧人腰带', '16.66%（T2）/8.33%（T3）·专家翻倍，二选一'],
    ['Tome of Infinite Wisdom', '无限智慧法典', '10%（T2）/5%（T3）·专家 20%，五选一'],
    ['Phantom Phoenix', '幽灵凤凰', '10%（T2）/5%（T3）·专家 20%，五选一'],
    ['Brand of the Inferno', '炼狱烙印', '10%（T2）/5%（T3）·专家 20%，五选一'],
    ['Sleepy Octopod', '昏睡章鱼', '10%（T2）/5%（T3）·专家 20%，五选一'],
    ['Ghastly Glaive', '幽灵长戟', '10%（T2）/5%（T3）·专家 20%，五选一'],
    ['War Table', '战争桌', '25%（T2）/12.5%（T3）·专家翻倍'],
    ['War Table Banner', '战争桌旗×4', '25%（T2）/12.5%（T3）·专家翻倍'],
    ['Creeper Egg', '爬行者蛋', '20%（T2）/10%（T3）·专家 25%'],
    ['Ogre Mask', '', '14.29%（T2）/7.14%（T3）'],
    ['Ogre Trophy', '', '10%'],
    ["Ogre's Club", '食人魔之棒', '25%（大师，仅 T3）'],
    ['Ogre Relic', '', '100%（大师）'],
  ],
  betsy: [
    ['Aerial Bane', '空中祸害', '25%（四选一）'],
    ["Sky Dragon's Fury", '天龙之怒', '25%（四选一）'],
    ["Betsy's Wrath", '贝茜之怒', '25%（四选一）'],
    ['Flying Dragon', '飞龙', '25%（四选一）'],
    ["Betsy's Wings", '贝茜之翼', '25%'],
    ['Betsy Mask', '', '14.29%'],
    ['Betsy Trophy', '', '10%'],
    ['Defender Medal', '守护者勋章×30~49', '100%（专家宝藏袋）'],
    ["Betsy's Egg", '贝茜的蛋', '25%（大师）'],
    ['Betsy Relic', '', '100%（大师）'],
  ],
  mourning_wood: [
    ['Spooky Wood', '阴森木×15~30', '100%'],
    ['Spooky Hook', '阴森钩', '2.86~20%（随波数，15波必掉）'],
    ['Spooky Twig', '阴森枝', '2.86~20%（随波数，15波必掉）'],
    ['Stake Launcher', '木桩发射器', '2.86~20%（随波数，附带木桩×30~60）'],
    ['Cursed Sapling', '诅咒树苗', '2.86~20%（随波数）'],
    ['Necromantic Scroll', '死灵卷轴', '2.86~20%（随波数）'],
    ['Mourning Wood Trophy', '', '8.33~50%（15波起）'],
    ["Witch's Broom", '女巫扫帚', '5~20%（专家）'],
    ['Hexxed Branch', '施咒树枝', '6.25~25%（大师）'],
    ['Mourning Wood Relic', '', '25~100%（大师）'],
  ],
  pumpking: [
    ['Candy Corn Rifle', '糖果玉米步枪', '2.5~12.5%（随波数，附带糖果玉米×50~100）'],
    ["Jack 'O Lantern Launcher", '南瓜灯发射器', '2.5~12.5%（随波数，附带爆炸南瓜灯×25~50）'],
    ["The Horseman's Blade", '无头骑士剑', '2.5~12.5%（随波数）'],
    ['Bat Scepter', '蝙蝠权杖', '2.5~12.5%（随波数）'],
    ['Raven Staff', '渡鸦法杖', '2.5~12.5%（随波数）'],
    ['Dark Harvest', '暗黑收割', '2.5~12.5%（随波数）'],
    ['Black Fairy Dust', '黑仙尘', '2.5~12.5%（随波数）'],
    ['Spider Egg', '蜘蛛蛋', '2.5~12.5%（随波数）'],
    ['Pumpking Trophy', '', '8.33~50%（15波起）'],
    ['Pumpkin Scented Candle', '南瓜味蜡烛', '12.5~25%（大师）'],
    ['Pumpking Relic', '', '50~100%（大师）'],
  ],
  everscream: [
    ['Christmas Tree Sword', '圣诞树剑', '3.46~10.37%（随波数，14波必掉）'],
    ['Christmas Hook', '圣诞钩爪', '3.46~10.37%（随波数，14波必掉）'],
    ['Razorpine', '剃刀松', '3.46~10.37%（随波数，14波必掉）'],
    ['Festive Wings', '节日之翼', '0.74~2.22%（随波数；专家 1.33~6.67%）'],
    ['Everscream Trophy', '', '5~16.67%（15波起）'],
    ['Shrub Star', '灌木之星', '5~25%（大师）'],
    ['Everscream Relic', '', '20~100%（大师）'],
  ],
  santa_nk1: [
    ['Elf Melter', '精灵熔枪', '6.25~16.67%（随波数，14波必掉；专家 12.5~50%）'],
    ['Chain Gun', '链枪', '6.25~16.67%（随波数，14波必掉；专家 12.5~50%）'],
    ['Santa-NK1 Trophy', '', '5~16.67%（15波起）'],
    ['Toy Tank', '玩具坦克', '6.25~25%（大师）'],
    ['Santa-NK1 Relic', '', '25~100%（大师）'],
  ],
  ice_queen: [
    ['Blizzard Staff', '暴雪法杖', '5.19~10.37%（随波数，14波必掉；专家 15.56~31.11%）'],
    ['Snowman Cannon', '雪人加农炮', '5.19~10.37%（随波数，14波必掉；专家 15.56~31.11%）'],
    ['North Pole', '北极', '5.19~10.37%（随波数，14波必掉；专家 15.56~31.11%）'],
    ["Baby Grinch's Mischief Whistle", '小气鬼恶作剧哨', '1.11~2.22%（随波数；专家 3.33~6.67%）'],
    ['Ice Queen Trophy', '', '5~16.67%（15波起）'],
    ['Reindeer Bells', '驯鹿铃', '1.33~2.22%（大师；专家 6.67%）'],
    ['Frozen Crown', '冰冻王冠', '12.5~25%（大师）'],
    ['Ice Queen Relic', '', '50~100%（大师）'],
  ],
  martian_saucer: [
    ['Xenopopper', '异星泡泡枪', '16.66%（六选一）'],
    ['Xeno Staff', '异星法杖', '16.66%（六选一）'],
    ['Laser Machinegun', '激光机枪', '16.66%（六选一）'],
    ['Electrosphere Launcher', '电球发射器', '16.66%（六选一）'],
    ['Influx Waver', '波涌之刃', '16.66%（六选一）'],
    ['Cosmic Car Key', '宇宙车钥匙', '16.66%（六选一）'],
    ['Greater Healing Potion', '强效治疗药水×5~15', '100%'],
    ['Martian Saucer Trophy', '', '10%'],
    ['Arc Surge', '电弧涌升', '2%'],
    ['Cosmic Skateboard', '宇宙滑板', '25%（大师）'],
    ['Martian Saucer Relic', '', '100%（大师）'],
  ],
  mechdusa: [
    ["Waffle's Iron", '华夫饼铁（三机械Boss各自掉落照常）', '100%'],
  ],
}

// ---------- 重建 bosses.js drops ----------
let src = fs.readFileSync('data/bosses.js', 'utf8')
let rebuilt = 0
for (const [bid, list] of Object.entries(D)) {
  const anchor = 'id:"' + bid + '"'
  const ai = src.indexOf(anchor)
  if (ai < 0) { misses.push('BOSS ' + bid); continue }
  const di = src.indexOf('drops:[', ai)
  const pi = src.indexOf('],phases:', di)
  if (di < 0 || pi < 0) { misses.push('SPAN ' + bid); continue }
  const entries = list.map(mk).join(',')
  src = src.slice(0, di) + 'drops:[' + entries + ']' + src.slice(pi + 1)
  rebuilt++
}
fs.writeFileSync('data/bosses.js', src)
console.log('重建 Boss 掉落:', rebuilt, '个')

// ---------- 修正闪电胡萝卜获得方式 ----------
let itemsSrc = fs.readFileSync('data/items.js', 'utf8')
const oC = 'obtain:"大师模式 光之女皇 25% 掉落"'
if (itemsSrc.includes(oC)) {
  itemsSrc = itemsSrc.replace(oC, 'obtain:"动物学家出售（50 金，图鉴完成度达 50% 后解锁）"')
  fs.writeFileSync('data/items.js', itemsSrc)
  console.log('闪电胡萝卜获得方式已修正')
} else console.log('闪电胡萝卜未匹配（可能已修正）')

// ---------- 全量目录真剑配方标注（现行配方优先） ----------
let v3 = fs.readFileSync('pkg-cat-3/data/data-v3.js', 'utf8')
const o1 = '合成：断钢剑 + 断裂英雄剑 @ 秘银砧；或 断钢剑 + 叶绿锭 @ 秘银砧'
const n1 = '合成：断钢剑 + 断裂英雄剑 @ 秘银砧（1.4.4 起现行配方；旧版为 断钢剑 + 叶绿锭）'
if (v3.includes(o1)) v3 = v3.replace(o1, n1)
const o2 = '合成：永夜刃 + 断裂英雄剑 @ 秘银砧；或 永夜刃 + 恐惧之魂 + 力量之魂 + 视域之魂 @ 秘银砧'
const n2 = '合成：永夜刃 + 断裂英雄剑 @ 秘银砧（1.4.4 起现行配方；旧版为 永夜刃 + 三种机械魂）'
if (v3.includes(o2)) v3 = v3.replace(o2, n2)
fs.writeFileSync('pkg-cat-3/data/data-v3.js', v3)
// zhdetail 源头同步排序（现行配方放首位）
const zdPath = path.join(STAGE, 'zhdetail.json')
const zd = JSON.parse(fs.readFileSync(zdPath, 'utf8'))
if (zd.byResult['True Excalibur'] && zd.byResult['True Excalibur'].length > 1) {
  zd.byResult['True Excalibur'].sort((a, b) => (a.i[1] && a.i[1].includes('Broken Hero Sword') ? -1 : 1) - (b.i[1] && b.i[1].includes('Broken Hero Sword') ? -1 : 1))
  zd.byResult["True Night's Edge"].sort((a, b) => (a.i[1] && a.i[1].includes('Broken Hero Sword') ? -1 : 1) - (b.i[1] && b.i[1].includes('Broken Hero Sword') ? -1 : 1))
  fs.writeFileSync(zdPath, JSON.stringify(zd))
  console.log('zhdetail 真剑配方已排序')
}
console.log('完成')
if (misses.length) { console.log('未解析（需人工核对）:', misses.join(' , ')) }
