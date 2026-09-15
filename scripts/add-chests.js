// 向精品图鉴添加全部 77 种箱子（cat:"box"）
// 依据：官方 wiki Chests 页（2026-09 核实）+ GT 官方中文名 + 游戏数据 internal 名
const fs = require('fs')
const path = require('path')

// ---------- 箱子元数据表 ----------
// [internal, id, 中文名, 英文名, obtain, trimG, bodyH, darkD, desc]
const KEY_OB = k => `世纪之花后地牢自然生成，用${k}开启；也可将${k}投入微光获得`
const IRON = '任意铁锭（铁/铅）×2'
const craft = (st, mat, qty) => `${st}：${mat}×${qty || 8} + ${IRON} 合成`
const chestDesc = t => (t ? t + '，' : '') + '可容纳 40 组物品。'

const CHESTS = [
  // ==== 上锁钥匙箱（8）====
  ['GoldChest', 'gold_chest', '金箱', 'Gold Chest', '地下/洞穴自然生成；地牢与神庙中的为上锁状态，用金钥匙开启', '#F0CC6A', '#C8963C', '#8E6422', '最常见的宝藏箱，地上地下都能见到它的身影。'],
  ['ShadowChest', 'shadow_chest', '暗影箱', 'Shadow Chest', '地狱自然生成，用暗影钥匙开启', '#C8A85C', '#4E3E60', '#2E2440', '地狱深处的黑紫色宝箱，锁着地狱的秘密。'],
  ['CorruptionChest', 'corruption_chest', '腐化箱', 'Corruption Chest', KEY_OB('腐化钥匙'), '#A87CC8', '#6E4A8E', '#46305E', '装着腐化专属神器的环境宝箱。'],
  ['CrimsonChest', 'crimson_chest', '猩红箱', 'Crimson Chest', KEY_OB('猩红钥匙'), '#D87A8C', '#A83C4A', '#702230', '装着猩红专属神器的环境宝箱。'],
  ['HallowedChest', 'hallowed_chest', '神圣箱', 'Hallowed Chest', KEY_OB('神圣钥匙'), '#F8D048', '#F0E8C8', '#C4B888', '装着彩虹枪的神圣环境宝箱。'],
  ['FrozenChest', 'frozen_chest', '冰雪箱', 'Ice Chest', KEY_OB('冰冻钥匙'), '#C8ECFC', '#8AC8E8', '#5A94C0', '装着冰雪神器（冰霜核心等）的环境宝箱。'],
  ['JungleChest', 'jungle_chest', '丛林箱', 'Jungle Chest', KEY_OB('丛林钥匙'), '#8AC85C', '#4E7A3C', '#2E5022', '装着食人鱼枪等丛林神器的环境宝箱。'],
  ['DungeonDesertChest', 'dungeon_desert_chest', '沙漠箱', 'Desert Chest', KEY_OB('沙漠钥匙'), '#F0DC8A', '#D8B85C', '#A4883C', '装着沙漠猛虎法杖的沙漠环境宝箱。'],
  // ==== 自然生成（15）====
  ['Chest', 'chest', '宝箱', 'Chest', '地表/地下自然生成；' + craft('工作台', '任意木材'), '#C9A227', '#8B5A2B', '#5C3A1A', '最基础的木制收纳箱。'],
  ['IceChest', 'ice_chest', '冰冻箱', 'Frozen Chest', '雪原生物群系自然生成；' + craft('制冰机', '冰雪块'), '#C8ECFC', '#8AC8E8', '#5A94C0', '冰块砌成的凛冬之箱。'],
  ['IvyChest', 'ivy_chest', '常春藤箱', 'Ivy Chest', '丛林神龛、生命红木树中自然生成（不可合成）', '#8AC85C', '#4E7A3C', '#2E5022', '爬满藤蔓的丛林古箱，丛林神龛里的常客。'],
  ['LihzahrdChest', 'lihzahrd_chest', '丛林蜥蜴箱', 'Lihzahrd Chest', '丛林神庙自然生成；' + craft('丛林蜥蜴熔炉', '丛林蜥蜴砖'), '#D8C85C', '#9C8A3C', '#6E5E22', '神庙风格的鎏金宝箱。'],
  ['LivingWoodChest', 'living_wood_chest', '生命木箱', 'Living Wood Chest', '生命树中自然生成；' + craft('生命织布机', '任意木材'), '#8AC85C', '#5E8A3C', '#3A5E22', '长在生命树里的活体木箱。'],
  ['MushroomChest', 'mushroom_chest', '蘑菇箱', 'Mushroom Chest', '发光蘑菇生物群系自然生成；' + craft('工作台', '发光蘑菇'), '#F0A0B4', '#C84A6A', '#8F2E48', '蘑菇人邻居家的粉红宝箱。'],
  ['RichMahoganyChest', 'rich_mahogany_chest', '红木箱', 'Rich Mahogany Chest', '地下丛林自然生成；' + craft('工作台', '红木'), '#C9A227', '#7A4A2E', '#4E2C1A', '红木打造的丛林风宝箱。'],
  ['DesertChest', 'sandstone_chest', '沙岩箱', 'Sandstone Chest', '地下沙漠自然生成；' + craft('工作台', '光面沙岩'), '#F0DC8A', '#D8B85C', '#A4883C', '沙岩雕成的沙漠宝箱。'],
  ['SkywareChest', 'skyware_chest', '天域箱', 'Skyware Chest', '浮空岛自然生成；' + craft('天磨', '日盘块'), '#B8CCF0', '#6A8AC8', '#40578F', '浮空岛的天蓝色宝箱，常装着星怒等天空好物。'],
  ['WaterChest', 'water_chest', '水中箱', 'Water Chest', '海洋水底自然生成；' + craft('工作台', '水族块'), '#9CD8F0', '#4EA0C8', '#2E6E8E', '沉在海底的宝箱，泛着水光。'],
  ['WebCoveredChest', 'web_covered_chest', '蛛丝箱', 'Web Covered Chest', '蜘蛛洞穴自然生成（不可合成）', '#E8E8E8', '#7E7E7E', '#525252', '缠满蛛网的古旧宝箱，蜘蛛巢穴深处才有。'],
  ['GraniteChest', 'granite_chest', '花岗岩箱', 'Granite Chest', '花岗岩洞穴自然生成；' + craft('工作台', '光面花岗岩块'), '#8F8FBE', '#5E5E8A', '#3C3C5E', '花岗岩洞穴的深蓝宝箱。'],
  ['MarbleChest', 'marble_chest', '大理石箱', 'Marble Chest', '大理石洞穴自然生成；' + craft('工作台', '光面大理石块'), '#EFEFF6', '#C8C8D4', '#9494A4', '大理石洞穴的雅致白箱。'],
  ['GoldenChest', 'golden_chest', '黄金箱', 'Golden Chest', '海盗入侵事件中由荷兰飞盗船掉落（不可合成）', '#F8E88A', '#E8C03C', '#B08A1C', '纯金打制的海盗宝箱，财宝气息扑面而来。'],
  ['DeadMansChest', 'dead_mans_chest', '死人宝箱', "Dead Man's Chest", '地下随机生成，自带大量陷阱机关（不可合成）', '#C8C8D8', '#5E5E6E', '#3C3C48', '机关重重的陷阱宝箱——贪心开箱前先拆陷阱。'],
  // ==== 地牢三色箱（3）====
  ['BlueDungeonChest', 'blue_dungeon_chest', '蓝地牢箱', 'Blue Dungeon Chest', '地牢蓝砖区自然生成；' + craft('骨焊机', '蓝砖'), '#8A9CD8', '#4E5E9C', '#2E3A6E', '地牢蓝砖区的制式宝箱。'],
  ['GreenDungeonChest', 'green_dungeon_chest', '绿地牢箱', 'Green Dungeon Chest', '地牢绿砖区自然生成；' + craft('工作台', '绿砖'), '#8AC8A8', '#4E8A6A', '#2E5E42', '地牢绿砖区的制式宝箱。'],
  ['PinkDungeonChest', 'pink_dungeon_chest', '粉地牢箱', 'Pink Dungeon Chest', '地牢粉砖区自然生成；' + craft('工作台', '粉砖'), '#E8B0C8', '#C86E96', '#9C4468', '地牢粉砖区的制式宝箱。'],
  // ==== 购买（1）====
  ['GolfChest', 'golf_chest', '高尔夫箱', 'Golf Chest', '高尔夫球手出售（3 金，需高尔夫分数超过 500）', '#C9A227', '#5E7A3C', '#3C5222', '高尔夫俱乐部的储物箱，装球杆正合适。'],
  // ==== 仅合成（50）====
  ['EbonwoodChest', 'ebonwood_chest', '乌木箱', 'Ebonwood Chest', craft('工作台', '乌木'), '#9C86C8', '#5E4A78', '#3A2E52', '腐化乌木制成的暗紫宝箱。'],
  ['ShadewoodChest', 'shadewood_chest', '暗影木箱', 'Shadewood Chest', craft('工作台', '暗影木'), '#C86A8A', '#7E3B4E', '#52273A', '猩红暗影木制成的宝箱。'],
  ['PearlwoodChest', 'pearlwood_chest', '珍珠木箱', 'Pearlwood Chest', craft('工作台', '珍珠木'), '#EFD9EE', '#C9A9C8', '#92718F', '神圣珍珠木制成的浅粉宝箱。'],
  ['BorealWoodChest', 'boreal_wood_chest', '针叶木箱', 'Boreal Wood Chest', craft('工作台', '针叶木'), '#C9A227', '#6E4B33', '#46301F', '雪原针叶木制成的宝箱。'],
  ['PalmWoodChest', 'palm_wood_chest', '棕榈木箱', 'Palm Wood Chest', craft('工作台', '棕榈木'), '#C9A227', '#A8763F', '#7A5326', '海滩棕榈木制成的宝箱。'],
  ['BambooChest', 'bamboo_chest', '竹箱', 'Bamboo Chest', craft('工作台', '竹子'), '#E4EEB8', '#A9C25C', '#7A8F3B', '竹子编成的清新宝箱。'],
  ['AshWoodChest', 'ash_wood_chest', '灰烬木箱', 'Ash Wood Chest', craft('工作台', '灰烬木'), '#8B8B9C', '#4A4A55', '#2E2E38', '灰烬木制成的暗色宝箱。'],
  ['DynastyChest', 'dynasty_chest', '王朝箱', 'Dynasty Chest', craft('工作台', '王朝木'), '#E8B04A', '#B0572E', '#7C3A1C', '王朝木制成的东方红漆宝箱。'],
  ['SpookyChest', 'spooky_chest', '阴森箱', 'Spooky Chest', craft('工作台', '阴森木'), '#8A6FA8', '#4E3A5E', '#30213F', '南瓜月阴森木制成的诡异宝箱。'],
  ['PumpkinChest', 'pumpkin_chest', '南瓜箱', 'Pumpkin Chest', craft('工作台', '南瓜'), '#F2B24C', '#D9822B', '#9C5714', '万圣节南瓜雕成的应景宝箱。'],
  ['CactusChest', 'cactus_chest', '仙人掌箱', 'Cactus Chest', craft('工作台', '仙人掌'), '#8FD08F', '#4E8A4E', '#2F5C2F', '仙人掌拼成的带刺宝箱。'],
  ['BoneChest', 'bone_chest', '骨箱', 'Bone Chest', craft('骨焊机', '骨头'), '#F2ECD4', '#D8CFAE', '#A89F7E', '骨头焊成的白骨宝箱。'],
  ['FleshChest', 'flesh_chest', '血肉箱', 'Flesh Chest', craft('血肉克隆槽', '血肉块'), '#D88A90', '#A84A52', '#75282F', '血肉块凝成的猩红宝箱。'],
  ['ObsidianChest', 'obsidian_chest', '黑曜石箱', 'Obsidian Chest', '工作台：黑曜石×6 + 地狱石×2 + ' + IRON + ' 合成', '#8A5CC8', '#3A2E52', '#211A38', '黑曜石打磨的紫曜宝箱。'],
  ['GlassChest', 'glass_chest', '玻璃箱', 'Glass Chest', craft('玻璃窑', '玻璃'), '#DFF4FC', '#A8D8E8', '#6FA8C0', '通体透明的玻璃宝箱，藏不住秘密。'],
  ['HoneyChest', 'honey_chest', '蜂蜜箱', 'Honey Chest', craft('蜂蜜分配器', '蜂蜜块'), '#F8D48A', '#E8A83C', '#B5761C', '蜂蜜浇筑的琥珀色宝箱。'],
  ['SlimeChest', 'slime_chest', '史莱姆箱', 'Slime Chest', craft('固化机', '史莱姆块'), '#8AC8F0', '#4E9CD8', '#2F6EA0', '史莱姆凝成的Q弹宝箱。'],
  ['SteampunkChest', 'steampunk_chest', '蒸汽朋克箱', 'Steampunk Chest', craft('蒸汽朋克锅炉', '齿轮'), '#C8A850', '#8A5E2E', '#5C3A16', '齿轮驱动的蒸汽朋克宝箱。'],
  ['MartianChest', 'martian_chest', '火星箱', 'Martian Chest', craft('工作台', '火星管道护板'), '#8AC8B8', '#4A5E5E', '#2C3A3A', '火星科技风的外星宝箱。'],
  ['MeteoriteChest', 'meteorite_chest', '陨石箱', 'Meteorite Chest', craft('工作台', '陨石砖'), '#E88A5C', '#B04A3C', '#752A22', '陨石砖砌成的灼热宝箱。'],
  ['CrystalChest', 'crystal_chest', '水晶箱', 'Crystal Chest', '工作台：水晶块×20 合成（无需铁锭）', '#F4CCFA', '#D88AE0', '#A05CB0', '水晶砌成的剔透宝箱。'],
  ['SpiderChest', 'spider_chest', '蜘蛛箱', 'Spider Chest', craft('工作台', '蜘蛛窝块'), '#8A8A9C', '#3C3C46', '#232329', '蜘蛛窝块垒成的暗影宝箱。'],
  ['LesionChest', 'lesion_chest', '病变箱', 'Lesion Chest', craft('腐化密室', '病变块'), '#9CC86A', '#5E7A3C', '#3C5222', '病变块长成的病态绿宝箱。'],
  ['BalloonChest', 'balloon_chest', '气球箱', 'Balloon Chest', craft('工作台', '任意气球'), '#F8D0E0', '#E89CB8', '#B56E8C', '气球扎成的轻盈宝箱。'],
  ['CoralChest', 'coral_chest', '珊瑚礁箱', 'Reef Chest', craft('工作台', '珊瑚礁块'), '#F8C8D8', '#E87A9C', '#B54A6E', '珊瑚垒成的海底宝箱。'],
  ['AetheriumChest', 'aetherium_chest', '以太箱', 'Aetherium Chest', craft('工作台', '以太砖'), '#C0F8F4', '#7AE0D8', '#46A89E', '以太砖砌成的微光宝箱。'],
  ['FallenStarChest', 'fallen_star_chest', '坠落之星箱', 'Fallen Star Chest', craft('工作台', '坠落之星块'), '#F8E85C', '#4A6AD8', '#2C4494', '缀着星光的夜空宝箱。'],
  ['FeywoodChest', 'feywood_chest', '仙灵木箱', 'Feywood Chest', craft('生命织布机', '仙灵木'), '#C8F0DC', '#8AC8B0', '#5A9478', '仙灵木织成的精灵宝箱。'],
  ['HallowedFurnitureChest', 'hallowed_furniture_chest', '华丽神圣箱', 'Fancy Hallowed Chest', craft('工作台', '神圣砖'), '#F8F0C8', '#E8D88A', '#B8A45C', '神圣砖砌成的鎏金宝箱。'],
  ['GothicChest', 'gothic_chest', '哥特箱', 'Gothic Chest', craft('骨焊机', '哥特砖'), '#8A7E9C', '#4E4458', '#2E2838', '哥特风格的暗黑宝箱。'],
  ['DemoniteChest', 'demonite_chest', '魔矿箱', 'Demonite Chest', craft('工作台', '魔矿砖'), '#8A8AC8', '#5E5E8E', '#3A3A62', '魔矿砖铸成的幽蓝宝箱。'],
  ['CrimtaneChest', 'crimtane_chest', '猩红矿箱', 'Crimtane Chest', craft('工作台', '猩红矿砖'), '#D87A7A', '#A83C3C', '#702222', '猩红矿砖铸成的血色宝箱。'],
  ['SnowChest', 'snow_chest', '雪箱', 'Snow Chest', craft('制冰机', '雪块'), '#FFFFFF', '#D8E4EC', '#A4B4C0', '雪块堆成的纯白宝箱。'],
  ['FlinxFurChest', 'flinx_fur_chest', '小雪怪皮毛箱', 'Flinx Fur Chest', craft('工作台', '小雪怪皮毛块'), '#EFE6D4', '#C8B89C', '#96886C', '小雪怪皮毛包裹的暖手宝箱。'],
  ['PineChest', 'pine_chest', '松木箱', 'Pine Chest', craft('工作台', '松树块'), '#7AB88C', '#3E6E4A', '#24482E', '圣诞松木制成的节日宝箱。'],
  ['EasterChest', 'easter_chest', '复活节箱', 'Easter Chest', craft('工作台', '复活节块'), '#F8E8F0', '#F0C8D8', '#C490AC', '复活节彩蛋色的粉彩宝箱。'],
  ['StoneChest', 'stone_chest', '石箱', 'Stone Chest', craft('重型装配器', '灰砖'), '#ACACAC', '#7E7E7E', '#525252', '灰砖垒成的敦实石箱。'],
  ['JellyfishChest', 'jellyfish_chest', '水母箱', 'Jellyfish Chest', craft('工作台', '水母块'), '#A8D8F0', '#5E9CD8', '#3A6EA0', '水母块凝成的发光宝箱。'],
  ['HarpyChest', 'harpy_chest', '鸟妖箱', 'Harpy Chest', craft('天磨', '鸟妖块'), '#EDE0C8', '#C8B088', '#96805C', '鸟妖巢材搭成的天空宝箱。'],
  ['CloudChest', 'cloud_chest', '云箱', 'Cloud Chest', craft('天磨', '云'), '#FFFFFF', '#D8E8F4', '#A8C0D8', '云朵絮成的蓬松宝箱。'],
  ['MoonplateChest', 'duskware_chest', '暮色箱', 'Duskware Chest', craft('天磨', '月盘块'), '#A8A8D8', '#6A6A9C', '#43436A', '月盘块砌成的暮色宝箱。'],
  ['LibrarianChest', 'librarian_chest', '书卷箱', 'Librarian Chest', craft('书架', '书卷块'), '#D8B88A', '#8A4E3C', '#5C2E1E', '书卷块装订的学者宝箱。'],
  ['SpikeChest', 'spike_chest', '尖刺箱', 'Spike Chest', craft('工作台', '尖刺块'), '#9C9C9C', '#6E6E6E', '#464646', '尖刺块垒成的带刺宝箱。'],
  ['OfficeChest', 'office_chest', '办公箱', 'Office Chest', craft('工作台', '办公块'), '#9C9CAC', '#5E5E6E', '#3C3C48', '办公室风格的文件箱。'],
  ['ForbiddenChest', 'forbidden_chest', '禁戒箱', 'Forbidden Chest', craft('工作台', '禁戒块'), '#F0DC8A', '#C8A84E', '#94782A', '禁戒块铸成的沙漠秘宝箱。'],
  ['BoulderChest', 'boulder_chest', '巨石箱', 'Boulder Chest', craft('重型装配器', '巨石块'), '#BCA898', '#8A7464', '#5E4E40', '巨石块雕成的滚圆宝箱。'],
  ['SolarChest', 'solar_chest', '日耀箱', 'Solar Chest', craft('远古操纵机', '日耀砖'), '#F8A85C', '#E86428', '#A83E10', '日耀砖铸成的烈焰宝箱。'],
  ['VortexChest', 'vortex_chest', '星旋箱', 'Vortex Chest', craft('远古操纵机', '星旋砖'), '#5CC8A8', '#2E8A6E', '#1A5E48', '星旋砖铸成的旋涡宝箱。'],
  ['NebulaChest', 'nebula_chest', '星云箱', 'Nebula Chest', craft('远古操纵机', '星云砖'), '#F08AF0', '#C84AC8', '#8A2E8A', '星云砖铸成的梦幻宝箱。'],
  ['StardustChest', 'stardust_chest', '星尘箱', 'Stardust Chest', craft('远古操纵机', '星尘砖'), '#7AB0F0', '#3C6EC8', '#22448A', '星尘砖铸成的银河宝箱。'],
].filter(c => c[0]) // 去掉占位行

// ---------- 校验 ----------
const itemsSrc = fs.readFileSync('data/items.js', 'utf8')
const existIds = new Set([...itemsSrc.matchAll(/id:"([^"]+)"/g)].map(m => m[1]))
const dup = CHESTS.filter(c => existIds.has(c[1]))
if (dup.length) { console.log('id 冲突:', dup.map(c => c[1]).join(',')); process.exit(1) }
const ids = CHESTS.map(c => c[1])
if (new Set(ids).size !== ids.length) { console.log('表内 id 重复'); process.exit(1) }
console.log('箱子总数:', CHESTS.length)
if (CHESTS.length !== 77) { console.log('警告：应为 77 种'); }

// ---------- 1. 复制图标 ----------
let copied = 0
CHESTS.forEach(([f, id]) => {
  const src = path.join('pkg-cat-1/assets', f + '.png')
  const dst = path.join('assets/sprites', id + '.png')
  if (fs.existsSync(src)) { fs.copyFileSync(src, dst); copied++ }
  else console.log('缺图标:', f)
})
console.log('图标复制:', copied)

// ---------- 2. spritemap.js 追加 ----------
let sm = fs.readFileSync('data/spritemap.js', 'utf8')
const smAdd = CHESTS.map(c => `${c[1]}:"png"`).join(',')
if (!sm.includes('gold_chest:"png"')) {
  const i = sm.lastIndexOf('};')
  sm = sm.slice(0, i) + ',' + smAdd + sm.slice(i)
  fs.writeFileSync('data/spritemap.js', sm)
  console.log('spritemap 已追加', CHESTS.length, '键')
} else console.log('spritemap 已存在，跳过')

// ---------- 3. pixelart.js 追加像素画（复用 CHEST 模板换色） ----------
let px = fs.readFileSync('utils/pixelart.js', 'utf8')
if (!px.includes('reg("gold_chest"')) {
  const regs = CHESTS.map(([, id, , , , G, h, d]) =>
    `reg(${JSON.stringify(id)},A(12,12,{G:${JSON.stringify(G)},h:${JSON.stringify(h)},d:${JSON.stringify(d)}},CHEST.rows));`).join('')
  const i = px.lastIndexOf('module.exports=')
  px = px.slice(0, i) + regs + px.slice(i)
  fs.writeFileSync('utils/pixelart.js', px)
  console.log('pixelart 已追加', CHESTS.length, '个像素画')
} else console.log('pixelart 已存在，跳过')

// ---------- 4. data/items.js 追加条目 ----------
if (!itemsSrc.includes('cat:"box"')) {
  const entries = CHESTS.map(([f, id, n, en, ob, G, h, d, desc]) =>
    `{id:${JSON.stringify(id)},name:${JSON.stringify(n)},en:${JSON.stringify(en)},cat:"box",rarity:0,art:${JSON.stringify(id)},stats:[["容量","40 组物品"]],desc:${JSON.stringify(desc)},obtain:${JSON.stringify(ob)}}`)
  const i = itemsSrc.lastIndexOf('];')
  let src = itemsSrc
  // 上一条目结尾是 "}]";需要变成 "},{...},...]"
  let body = itemsSrc.slice(0, i)
  if (body.endsWith('}')) body = body.slice(0, -1) + '},'
  src = body + entries.join(',') + '];'
  fs.writeFileSync('data/items.js', src)
  console.log('items.js 已追加', entries.length, '条')
} else console.log('items.js 已有 box 条目，跳过')

// ---------- 5. dex.js 注册分类 ----------
let dex = fs.readFileSync('utils/dex.js', 'utf8')
let changed = false
if (!dex.includes('{k:"box",n:"箱匣"}')) {
  dex = dex.replace('{k:"material",n:"材料"}', '{k:"material",n:"材料"},{k:"box",n:"箱匣"}')
  changed = true
}
if (!dex.includes('box:"箱匣"')) {
  dex = dex.replace('material:"合成材料"', 'material:"合成材料",box:"箱匣"')
  changed = true
}
if (changed) { fs.writeFileSync('utils/dex.js', dex); console.log('dex.js 分类已注册') } else console.log('dex.js 已存在，跳过')
console.log('完成')
