// 钓鱼助手数据：任务鱼 / 食物鱼 / 工具饰品 / 鱼饵 / 匣子
// biome: forest 森林 / jungle 丛林 / snow 雪原 / desert 沙漠 / ocean 海洋 / cavern 地下 / hell 地狱 / corrupt 腐化 / crimson 猩红 / hallowed 神圣 / mushroom 蘑菇 / sky 天空
// time: any 任意 / day 白天 / night 夜晚
// weather: any 任意 / rain 下雨
// 任务鱼：渔夫任务鱼（未接任务时钓不到，任务鱼只在持有任务时上钩）
const QUEST_FISH = [
  { id: 'q_batfish', name: '蝙蝠鱼', en: 'Batfish', biome: 'cavern', time: 'any', weather: 'any', reward: '渔夫帽', note: '地下任意水域' },
  { id: 'q_bumblebee_tuna', name: '大黄蜂金枪鱼', en: 'Bumblebee Tuna', biome: 'jungle', time: 'any', weather: 'any', reward: '渔夫帽', note: '地表丛林水域' },
  { id: 'q_catfish', name: '鲶鱼', en: 'Catfish', biome: 'jungle', time: 'any', weather: 'rain', reward: '渔夫帽', note: '丛林雨天' },
  { id: 'q_cloudfish', name: '云鱼', en: 'Cloudfish', biome: 'sky', time: 'any', weather: 'any', reward: '渔夫帽', note: '漂浮岛天空湖' },
  { id: 'q_cursedfish', name: '诅咒鱼', en: 'Cursedfish', biome: 'corrupt', time: 'any', weather: 'any', reward: '渔夫帽', note: '腐化之地水域' },
  { id: 'q_damselfish', name: '小丑鱼', en: 'Damselfish', biome: 'sky', time: 'any', weather: 'any', reward: '渔夫服', note: '漂浮岛天空湖' },
  { id: 'q_demonic_hellfish', name: '恶魔地狱鱼', en: 'Demonic Hellfish', biome: 'hell', time: 'any', weather: 'any', reward: '渔夫服', note: '地狱熔岩（需热线鱼钩）' },
  { id: 'q_derpfish', name: '白痴鱼', en: 'Derpfish', biome: 'jungle', time: 'any', weather: 'any', reward: '渔夫帽', note: '丛林水域（含地下丛林）' },
  { id: 'q_dirtfish', name: '泥鱼', en: 'Dirtfish', biome: 'forest', time: 'any', weather: 'any', reward: '渔夫帽', note: '地表任意泥土环境水域' },
  { id: 'q_dynamite_fish', name: '炸药鱼', en: 'Dynamite Fish', biome: 'cavern', time: 'any', weather: 'any', reward: '渔夫帽', note: '地下水域' },
  { id: 'q_eater_of_plankton', name: '浮游生物吞噬者', en: 'Eater of Plankton', biome: 'corrupt', time: 'any', weather: 'any', reward: '渔夫服', note: '腐化之地水域' },
  { id: 'q_eyefish', name: '眼鱼', en: 'Eyefish', biome: 'cavern', time: 'any', weather: 'any', reward: '渔夫帽', note: '地下水域' },
  { id: 'q_fallen_starfish', name: '坠落海星', en: 'Fallen Starfish', biome: 'forest', time: 'night', weather: 'any', reward: '渔夫帽', note: '夜晚地表水域' },
  { id: 'q_fishron', name: '猪龙鱼', en: 'Fishron', biome: 'tundra', time: 'any', weather: 'any', reward: '金钓竿', note: '雪原/地下雪原水域' },
  { id: 'q_foxfish', name: '狐狸鱼', en: 'Fox Fish', biome: 'sky', time: 'any', weather: 'any', reward: '渔夫帽', note: '漂浮岛天空湖' },
  { id: 'q_hungerfish', name: '饥饿鱼', en: 'Hungerfish', biome: 'crimson', time: 'any', weather: 'any', reward: '渔夫帽', note: '猩红之地水域' },
  { id: 'q_ichorfish', name: '灵液鱼', en: 'Ichorfish', biome: 'crimson', time: 'any', weather: 'any', reward: '渔夫服', note: '猩红之地水域' },
  { id: 'q_jewelfish', name: '宝石鱼', en: 'Jewelfish', biome: 'cavern', time: 'any', weather: 'any', reward: '渔夫帽', note: '洞穴层宝石洞附近水域' },
  { id: 'q_mirage_fish', name: '海市蜃楼鱼', en: 'Mirage Fish', biome: 'desert', time: 'any', weather: 'any', reward: '渔夫帽', note: '沙漠水域（含绿洲）' },
  { id: 'q_mudfish', name: '泥鳅', en: 'Mudfish', biome: 'jungle', time: 'any', weather: 'any', reward: '渔夫帽', note: '丛林泥地水域' },
  { id: 'q_mutant_flish', name: '变异飞鱼', en: 'Mutant Flish', biome: 'cavern', time: 'any', weather: 'any', reward: '渔夫帽', note: '地下水域' },
  { id: 'q_penumbra_fish', name: '半影鱼', en: 'Penumbra Fish', biome: 'cavern', time: 'day', weather: 'any', reward: '渔夫服', note: '白天地下水域' },
  { id: 'q_pixiefish', name: '妖精鱼', en: 'Pixiefish', biome: 'hallowed', time: 'any', weather: 'any', reward: '渔夫帽', note: '神圣之地水域' },
  { id: 'q_royal_goldfish', name: '黄金锦鲤', en: 'Royal Goldfish', biome: 'any', time: 'any', weather: 'rain', reward: '渔夫帽', note: '雨天任意水域' },
  { id: 'q_scaly_trout', name: '有鳞鳟鱼', en: 'Scaly Trout', biome: 'snow', time: 'any', weather: 'any', reward: '渔夫帽', note: '雪原水域' },
  { id: 'q_sharkfin', name: '鲨鱼鳍', en: 'Sharkfin', biome: 'ocean', time: 'any', weather: 'any', reward: '渔夫帽', note: '海洋（世界两侧）' },
  { id: 'q_slimefish', name: '史莱姆鱼', en: 'Slimefish', biome: 'forest', time: 'any', weather: 'any', reward: '渔夫帽', note: '地表史莱姆出没水域' },
  { id: 'q_spiderfish', name: '蜘蛛鱼', en: 'Spiderfish', biome: 'cavern', time: 'any', weather: 'any', reward: '渔夫帽', note: '蜘蛛洞附近地下水域' },
  { id: 'q_tropical_barracuda', name: '热带梭鱼', en: 'Tropical Barracuda', biome: 'ocean', time: 'any', weather: 'any', reward: '渔夫帽', note: '海洋' },
  { id: 'q_tundra_trout', name: '苔原鳟鱼', en: 'Tundra Trout', biome: 'snow', time: 'any', weather: 'any', reward: '渔夫帽', note: '雪原水域' },
  { id: 'q_unicorn_fish', name: '独角兽鱼', en: 'Unicorn Fish', biome: 'hallowed', time: 'any', weather: 'any', reward: '渔夫服', note: '神圣之地水域' },
  { id: 'q_vulture_fish', name: '秃鹫鱼', en: 'Vulture Fish', biome: 'desert', time: 'any', weather: 'any', reward: '渔夫帽', note: '沙漠水域' },
  { id: 'q_fish_quest', name: '鱼 (任务)', en: 'Fish (quest)', biome: 'ocean', time: 'any', weather: 'any', reward: '渔夫帽', note: '海洋（双关：渔夫自己也叫"鱼"）' },
  { id: 'q_wyvernkin', name: '翼龙亲族', en: 'Wyvernkin', biome: 'sky', time: 'any', weather: 'any', reward: '渔夫帽', note: '漂浮岛天空湖' }
]

// 食物鱼：无任务要求，随时可钓，用于食物/药水材料
const FOOD_FISH = [
  { id: 'f_armored_carp', name: '装甲鲤鱼', en: 'Armored Carp', biome: 'cavern', time: 'any', weather: 'any', power: 30, note: '地下' },
  { id: 'f_bass', name: '鲈鱼', en: 'Bass', biome: 'forest', time: 'any', weather: 'any', power: 20, note: '森林/任意地表' },
  { id: 'f_blue_jellyfish', name: '蓝水母', en: 'Blue Jellyfish (bait)', biome: 'ocean', time: 'night', weather: 'any', power: 20, note: '夜晚海洋（钓到的可作鱼饵）' },
  { id: 'f_cod', name: '鳕鱼', en: 'Cod', biome: 'forest', time: 'any', weather: 'any', power: 20, note: '森林/任意地表' },
  { id: 'f_damselfish_food', name: '小丑鱼（食用）', en: 'Damselfish', biome: 'sky', time: 'any', weather: 'any', power: 20, note: '漂浮岛天空湖' },
  { id: 'f_double_cod', name: '双鳍鳕鱼', en: 'Double Cod', biome: 'jungle', time: 'any', weather: 'any', power: 30, note: '丛林' },
  { id: 'f_frost_minnow', name: '霜米诺鱼', en: 'Frost Minnow', biome: 'snow', time: 'any', weather: 'any', power: 30, note: '雪原（钓鱼药水材料）' },
  { id: 'f_green_jellyfish', name: '绿水母', en: 'Green Jellyfish (bait)', biome: 'cavern', time: 'night', weather: 'any', power: 20, note: '夜晚地下' },
  { id: 'f_honeyfish', name: '蜂蜜鱼', en: 'Honeyfish', biome: 'honey', time: 'any', weather: 'any', power: 20, note: '蜂蜜池' },
  { id: 'f_luminfish', name: '夜光鱼', en: 'Luminfish', biome: 'mushroom', time: 'any', weather: 'any', power: 20, note: '发光蘑菇地' },
  { id: 'f_mirage_fish', name: '幻影鱼', en: 'Mirage Fish', biome: 'desert', time: 'any', weather: 'any', power: 30, note: '沙漠（绿洲更新后）' },
  { id: 'f_mountain_bass', name: '山地鲈鱼', en: 'Mountain Bass', biome: 'sky', time: 'any', weather: 'any', power: 20, note: '漂浮岛天空湖' },
  { id: 'f_neon_tetra', name: '霓虹灯鱼', en: 'Neon Tetra', biome: 'sky', time: 'any', weather: 'any', power: 20, note: '漂浮岛天空湖' },
  { id: 'f_pink_jellyfish', name: '粉水母', en: 'Pink Jellyfish (bait)', biome: 'ocean', time: 'any', weather: 'any', power: 30, note: '海洋（钓到的可作鱼饵）' },
  { id: 'f_red_snapper', name: '红鲷鱼', en: 'Red Snapper', biome: 'ocean', time: 'any', weather: 'any', power: 30, note: '海洋' },
  { id: 'f_salmon', name: '鲑鱼', en: 'Salmon', biome: 'snow', time: 'any', weather: 'any', power: 20, note: '雪原' },
  { id: 'f_shrimp', name: '虾', en: 'Shrimp', biome: 'ocean', time: 'any', weather: 'any', power: 20, note: '海洋' },
  { id: 'f_snail_fish', name: '蜗牛鱼', en: 'Snail Fish', biome: 'cavern', time: 'any', weather: 'any', power: 20, note: '地下' },
  { id: 'f_specular_fish', name: '镜面鱼', en: 'Specular Fish', biome: 'hallowed', time: 'any', weather: 'any', power: 30, note: '神圣之地（多种药水材料）' },
  { id: 'f_trout', name: '鳟鱼', en: 'Trout', biome: 'forest', time: 'any', weather: 'any', power: 20, note: '森林/任意地表' },
  { id: 'f_variegated_lardfish', name: '杂色猪油鱼', en: 'Variegated Lardfish', biome: 'jungle', time: 'any', weather: 'any', power: 30, note: '丛林' },
  { id: 'f_zephyr_fish_food', name: '微风鱼（宠物）', en: 'Zephyr Fish', biome: 'hallowed', time: 'any', weather: 'any', power: 0, note: '神圣极稀有宠物鱼' }
]

// 工具/饰品/特殊
const GEAR = [
  { id: 'wood_fishing_rod', name: '木钓竿', en: 'Wood Fishing Rod', power: 5, source: '工作台：木材×8', tier: '开局' },
  { id: 'reinforced_fishing_rod', name: '强化钓竿', en: 'Reinforced Fishing Rod', power: 15, source: '铁砧：铁锭×8+木材×3', tier: '开局' },
  { id: 'soul_fishing_rod', name: '灵魂钓手', en: 'Fisher of Souls', power: 20, source: '铁砧：魔矿锭×8', tier: '开局' },
  { id: 'fiberglass_fishing_pole', name: '玻璃钢钓竿', en: 'Fiberglass Fishing Pole', power: 30, source: '丛林常春藤箱/丛林匣', tier: '开局' },
  { id: 'mechanic_fishing_rod', name: '机械钓竿', en: 'Scarab Fishing Rod', power: 25, source: '机械师出售（沙漠）', tier: '开局' },
  { id: 'golden_fishing_rod', name: '金钓竿', power: 50, source: '渔夫任务75次奖励', tier: '毕业' },
  { id: 'hotline_fishing_hook', name: '热线鱼钩', en: 'Hotline Fishing Hook', power: 45, source: '渔夫任务25次后小概率', tier: '岩浆钓' },
  { id: 'fishing_potion', name: '钓鱼药水', power: 15, source: '瓶子：瓶装水+波浪叶+蠕虫', tier: '药水' },
  { id: 'sonar_potion', name: '声呐药水', power: 0, source: '瓶子：瓶装水+水叶草+蠕虫', tier: '药水' },
  { id: 'crate_potion', name: '宝匣药水', power: 0, source: '瓶子：瓶装水+月光草+死亡草', tier: '药水' },
  { id: 'fishing_accessory', name: '渔夫配饰', power: 10, source: '渔夫任务奖励（链条）', tier: '配饰' },
  { id: 'tackle_box', name: '钓具箱', power: 0, source: '渔夫任务奖励', tier: '配饰' },
  { id: 'angling_woofer', name: '钓鱼耳机', power: 0, source: '渔夫任务奖励', tier: '配饰' }
]

// 鱼饵（饵力）
const BAITS = [
  { id: 'b_master_bait', name: '大师鱼饵', en: 'Master Bait', power: 50, source: '任务奖励/匣子' },
  { id: 'b_journeyman_bait', name: '学徒鱼饵', en: 'Journeyman Bait', power: 30, source: '任务奖励/匣子' },
  { id: 'b_apprentice_bait', name: '新手鱼饵', en: 'Apprentice Bait', power: 15, source: '任务奖励' },
  { id: 'b_bug', name: '臭虫', power: 10, source: '草地/花朵采集' },
  { id: 'b_worm', name: '蠕虫', power: 25, source: '雨天草地挖掘' },
  { id: 'b_golden_worm', name: '金蠕虫', power: 50, source: '稀有刷新' },
  { id: 'b_glowing_butterfly', name: '发光蝴蝶', power: 15, source: '夜晚采集' },
  { id: 'b_black_scorpion', name: '黑蝎子', power: 15, source: '沙漠挖掘' },
  { id: 'b_scorpion', name: '蝎子', power: 15, source: '沙漠挖掘' },
  { id: 'b_jellyfish_bait', name: '水母（饵）', power: 20, source: '钓鱼钓到水母转化' },
  { id: 'b_snail', name: '蜗牛', power: 10, source: '雨天草地采集' },
  { id: 'b_firefly', name: '萤火虫', power: 10, source: '夜晚采集' },
  { id: 'b_ladybug', power: 10, name: '瓢虫', source: '白天草地采集' },
  { id: 'b_catterpillar', name: '毛毛虫', power: 10, source: '任意时间草地' }
]

// 宝匣
const CRATES = [
  { id: 'c_wooden', name: '木匣', en: 'Wooden Crate', tier: 'pre', loot: '铁矿/药水/鱼饵/饰品（低级）' },
  { id: 'c_iron', name: '铁匣', en: 'Iron Crate', tier: 'pre', loot: '银矿/药水/鱼饵/饰品（中级）' },
  { id: 'c_golden', name: '金匣', en: 'Golden Crate', tier: 'pre', loot: '金矿/强效药水/大师鱼饵（高级）' },
  { id: 'c_jungle', name: '丛林匣', en: 'Jungle Crate', tier: 'pre', loot: '丛林材料（肉后含叶绿矿）' },
  { id: 'c_corrupt', name: '腐化匣', en: 'Corrupt Crate', tier: 'pre', loot: '暗影珠材料/诅咒箭' },
  { id: 'c_crimson', name: '猩红匣', en: 'Crimson Crate', tier: 'pre', loot: '猩红材料' },
  { id: 'c_frozen', name: '冰冻匣', en: 'Frozen Crate', tier: 'pre', loot: '冰雪材料' },
  { id: 'c_oasis', name: '绿洲匣', en: 'Oasis Crate', tier: 'pre', loot: '沙漠材料' },
  { id: 'c_hallowed', name: '神圣匣', en: 'Hallowed Crate', tier: 'post', loot: '神圣材料（肉后）' },
  { id: 'c_dungeon', name: '地牢匣', en: 'Dungeon Crate', tier: 'pre', loot: '地牢材料/金钥匙' },
  { id: 'c_lava', name: '熔岩匣', en: 'Lava Crate', tier: 'post', loot: '狱石/地狱材料（热线鱼钩）' },
  { id: 'c_celestial', name: '天界匣', en: 'Celestial Crate', tier: 'post', loot: '月亮碎片（月亮事件后）' }
]

// 地形中文名
const BIOME_N = {
  forest: '森林', jungle: '丛林', snow: '雪原', tundra: '雪原', desert: '沙漠', ocean: '海洋',
  cavern: '地下', hell: '地狱', corrupt: '腐化', crimson: '猩红', hallowed: '神圣',
  mushroom: '蘑菇', sky: '天空', honey: '蜂蜜', any: '任意'
}
const TIME_N = { any: '任意时间', day: '白天', night: '夜晚' }
const WEATHER_N = { any: '任意天气', rain: '雨天限定' }

module.exports = { QUEST_FISH, FOOD_FISH, GEAR, BAITS, CRATES, BIOME_N, TIME_N, WEATHER_N }
