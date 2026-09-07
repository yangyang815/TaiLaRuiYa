// 物品图鉴补全脚本：从 terraria.wiki.gg 拉取缺失物品的官方精灵图并追加条目
// 用法：node scripts/expand-items.js [--dry]
const fs = require('fs')
const path = require('path')
const https = require('https')

const itemsPath = path.join(__dirname, '..', 'data', 'items.js')
const spritesDir = path.join(__dirname, '..', 'assets', 'sprites')
const API = 'https://terraria.wiki.gg/api.php'

/* ---------- 补全清单（en 为 wiki 页面/文件名，id 为 kebab-case） ---------- */
const E = (id, name, en, cat, sub, rarity, stats, obtain) => ({ id, name, en, cat, sub, rarity, stats, obtain })

const LIST = [
  /* ===== 魔法武器 ===== */
  E('nimbus_rod', '雨云法杖', 'Nimbus Rod', 'weapon', 'magic', 4,
    [['伤害', '35'], ['特性', '召唤雨云持续降雨']], '愤怒雨云怪掉落（困难模式雨天）'),
  E('frost_staff', '冰雪法杖', 'Frost Staff', 'weapon', 'magic', 3,
    [['伤害', '38'], ['特性', '发射冰霜弹幕']], '冰雪巨人掉落（困难模式雪原）'),
  E('flower_of_frost', '寒霜之花', 'Flower of Frost', 'weapon', 'magic', 4,
    [['伤害', '45'], ['特性', '冰霜弹幕可穿墙']], '冰雪巨人掉落'),
  E('rainbow_rod', '彩虹魔杖', 'Rainbow Rod', 'weapon', 'magic', 5,
    [['伤害', '53'], ['特性', '可控彩虹光束']], '秘银砧：独角兽角/精灵尘/彩虹砖等合成'),
  E('unholy_trident', '邪恶三叉戟', 'Unholy Trident', 'weapon', 'magic', 5,
    [['伤害', '35×3'], ['特性', '三叉暗影投射物']], '日食事件掉落'),
  E('inferno_fork', '炼狱叉', 'Inferno Fork', 'weapon', 'magic', 5,
    [['伤害', '55'], ['特性', '爆炸火球']], '日食·红恶魔掉落'),
  E('shadowbeam_staff', '暗影束法杖', 'Shadowbeam Staff', 'weapon', 'magic', 5,
    [['伤害', '45'], ['特性', '光束可弹射穿墙']], '地牢（世纪之花后）法师怪掉落'),
  E('bat_scepter', '蝙蝠权杖', 'Bat Scepter', 'weapon', 'magic', 5,
    [['伤害', '42'], ['特性', '追踪蝙蝠弹幕']], '地牢（世纪之花后）法师怪掉落'),
  E('venom_staff', '剧毒法杖', 'Venom Staff', 'weapon', 'magic', 5,
    [['伤害', '44'], ['特性', '附加剧毒减益']], '地牢（世纪之花后）法师怪掉落'),
  E('crystal_storm', '水晶风暴', 'Crystal Storm', 'weapon', 'magic', 4,
    [['伤害', '32'], ['特性', '快速弹幕可穿墙']], '秘银砧：水晶碎块×30'),
  E('cursed_flames', '诅咒之火', 'Cursed Flames', 'weapon', 'magic', 4,
    [['伤害', '35'], ['特性', '附加诅咒地狱火']], '秘银砧：诅咒火焰×20（腐化世界）'),
  E('golden_shower', '黄金喷泉', 'Golden Shower', 'weapon', 'magic', 4,
    [['伤害', '28'], ['特性', '降低敌怪防御']], '秘银砧：灵液×20（猩红世界）'),
  E('water_bolt', '水矢', 'Water Bolt', 'weapon', 'magic', 2,
    [['伤害', '19'], ['特性', '弹幕可弹射']], '地牢书架'),
  E('demon_scythe', '恶魔镰刀', 'Demon Scythe', 'weapon', 'magic', 3,
    [['伤害', '35'], ['特性', '越飞越快的镰刀弹幕']], '地狱恶魔掉落 / 地牢书架'),
  E('flamelash', '火焰鞭笞', 'Flamelash', 'weapon', 'magic', 3,
    [['伤害', '35'], ['特性', '可控追踪火球']], '地牢书架'),
  E('crystal_serpent', '水晶蛇', 'Crystal Serpent', 'weapon', 'magic', 4,
    [['伤害', '43'], ['特性', '爆裂水晶弹幕']], '钓鱼：神圣之地水域（困难模式）'),
  E('sky_fracture', '天空裂痕', 'Sky Fracture', 'weapon', 'magic', 4,
    [['伤害', '30'], ['特性', '挥砍附加天裂光刃']], '秘银砧：附魔剑+精灵尘+独角兽角'),
  E('staff_of_earth', '大地法杖', 'Staff of Earth', 'weapon', 'magic', 4,
    [['伤害', '52'], ['特性', '投掷巨石']], '石巨人掉落'),
  E('razorpine', '剃刀松', 'Razorpine', 'weapon', 'magic', 5,
    [['伤害', '43'], ['特性', '越用越快的松针扇']], '霜月·常绿尖叫怪掉落'),
  E('blizzard_staff', '暴雪法杖', 'Blizzard Staff', 'weapon', 'magic', 8,
    [['伤害', '67'], ['特性', '暴雪弹幕倾泻']], '霜月·冰雪女王掉落'),
  E('lunar_flare', '月耀', 'Lunar Flare', 'weapon', 'magic', 10,
    [['伤害', '100'], ['特性', '天降月尘爆炸']], '月亮领主掉落'),
  E('nebula_arcanum', '星云奥秘', 'Nebula Arcanum', 'weapon', 'magic', 10,
    [['伤害', '130'], ['特性', '可控星云漩涡']], '月亮事件·星云柱'),
  E('bubble_gun', '泡泡枪', 'Bubble Gun', 'weapon', 'magic', 8,
    [['伤害', '70'], ['特性', '喷吐气泡群']], '猪龙鱼公爵掉落'),
  E('arcane_flower', '奥术花', 'Arcane Flower', 'weapon', 'magic', 3,
    [['效果', '法术自动索敌 + 魔耗降低']], '工匠作坊：魔力花升级合成'),
  /* ===== 召唤武器 ===== */
  E('slime_staff', '史莱姆法杖', 'Slime Staff', 'weapon', 'summon', 2,
    [['伤害', '8'], ['召唤物', '宝宝史莱姆']], '史莱姆极低概率掉落（粉史莱姆相对较高）'),
  E('imp_staff', '小鬼法杖', 'Imp Staff', 'weapon', 'summon', 3,
    [['伤害', '17'], ['召唤物', '火焰小鬼']], '铁砧：黑曜石 + 狱石锭'),
  E('hornet_staff', '黄蜂法杖', 'Hornet Staff', 'weapon', 'summon', 2,
    [['伤害', '9'], ['召唤物', '黄蜂']], '蜂王掉落'),
  E('spider_staff', '蜘蛛法杖', 'Spider Staff', 'weapon', 'summon', 4,
    [['伤害', '25'], ['召唤物', '蜘蛛']], '铁砧：蜘蛛牙×16'),
  E('optic_staff', '双子魔眼法杖', 'Optic Staff', 'weapon', 'summon', 5,
    [['伤害', '25'], ['召唤物', '双子魔眼小分队']], '秘银砧：黑暗之魂×20 + 晶状体×3'),
  E('pygmy_staff', '侏儒法杖', 'Pygmy Staff', 'weapon', 'summon', 6,
    [['伤害', '34'], ['召唤物', '侏儒标枪手']], '世纪之花掉落'),
  E('raven_staff', '渡鸦法杖', 'Raven Staff', 'weapon', 'summon', 8,
    [['伤害', '44'], ['召唤物', '渡鸦']], '南瓜月·哀木掉落'),
  E('deadly_sphere_staff', '致命球法杖', 'Deadly Sphere Staff', 'weapon', 'summon', 8,
    [['伤害', '40'], ['召唤物', '致命球']], '日食·致命球掉落'),
  E('desert_tiger_staff', '沙漠猛虎法杖', 'Desert Tiger Staff', 'weapon', 'summon', 8,
    [['伤害', '55'], ['召唤物', '跳跃猛虎']], '沙暴事件·沙元素掉落'),
  E('frost_hydra_staff', '冰霜九头蛇法杖', 'Staff of the Frost Hydra', 'weapon', 'summon', 8,
    [['伤害', '68'], ['召唤物', '冰霜哨塔']], '霜月·冰雪女王掉落'),
  E('blade_staff', '刀刃法杖', 'Blade Staff', 'weapon', 'summon', 6,
    [['伤害', '6（配合鞭子极高）'], ['召唤物', '利刃小仙灵']], '史莱姆女皇掉落'),
  E('morning_star', '晨星鞭', 'Morning Star', 'weapon', 'summon', 6,
    [['伤害', '55'], ['特性', '长鞭·高暴击']], '地牢（世纪之花后）敌怪掉落'),
  E('dark_harvest', '黑暗收割', 'Dark Harvest', 'weapon', 'summon', 8,
    [['伤害', '100'], ['特性', '短鞭·收割斩波']], '日食·死神掉落'),
  E('tempest_staff', '风暴法杖', 'Tempest Staff', 'weapon', 'summon', 8,
    [['伤害', '50'], ['召唤物', '风暴鲨旋']], '海盗入侵·飞行荷兰人掉落'),
  E('sanguine_staff', '血腥法杖', 'Sanguine Staff', 'weapon', 'summon', 6,
    [['伤害', '30'], ['召唤物', '吸血蝙蝠']], '血月·血腥鹦鹉螺掉落'),
  E('xeno_staff', '异星法杖', 'Xeno Staff', 'weapon', 'summon', 8,
    [['伤害', '36'], ['召唤物', '异星幼虫']], '火星暴乱·火星飞碟掉落'),
  E('lunar_portal_staff', '月亮传送门法杖', 'Lunar Portal Staff', 'weapon', 'summon', 10,
    [['伤害', '60'], ['召唤物', '月亮传送门哨塔']], '月亮事件·星尘柱'),
  /* ===== 远程武器 ===== */
  E('bees_knees', '蜂膝弓', "Bee's Knees", 'weapon', 'ranged', 3,
    [['伤害', '23'], ['特性', '箭矢化蜂群']], '蜂王掉落'),
  E('hellwing_bow', '地狱翼弓', 'Hellwing Bow', 'weapon', 'ranged', 3,
    [['伤害', '31'], ['特性', '木箭化地狱蝙蝠']], '地牢金锁箱'),
  E('tsunami', '海啸弓', 'Tsunami', 'weapon', 'ranged', 8,
    [['伤害', '53'], ['特性', '一次五箭']], '丛林常春藤箱 / 丛林匣'),
  E('eventide', '薄暮弓', 'Eventide', 'weapon', 'ranged', 8,
    [['伤害', '60'], ['特性', '四箭齐发·烈焰箭强化']], '南瓜月掉落'),
  E('phantasm', '幻影弓', 'Phantasm', 'weapon', 'ranged', 10,
    [['伤害', '50'], ['特性', '连射加速+幻影箭']], '月亮事件·漩涡柱'),
  E('sdmg', '海豚机枪', 'S.D.M.G.', 'weapon', 'ranged', 10,
    [['伤害', '85'], ['特性', '超高射速']], '月亮领主掉落'),
  E('xenopopper', '异星爆弹枪', 'Xenopopper', 'weapon', 'ranged', 8,
    [['伤害', '45'], ['特性', '气泡爆裂弹幕']], '火星暴乱·火星飞碟掉落'),
  E('onyx_blaster', '黑曜石爆破枪', 'Onyx Blaster', 'weapon', 'ranged', 4,
    [['伤害', '24 + 暗黑能量球'], ['特性', '散弹+爆破']], '秘银砧：暗黑碎块 + 铁锭 + 灵魂'),
  E('shotgun', '霰弹枪', 'Shotgun', 'weapon', 'ranged', 4,
    [['伤害', '24'], ['特性', '一次三至五弹']], '旅商出售'),
  E('tactical_shotgun', '战术霰弹枪', 'Tactical Shotgun', 'weapon', 'ranged', 8,
    [['伤害', '29'], ['特性', '一次六弹']], '地牢（世纪之花后）战术骷髅掉落'),
  E('star_cannon', '星星炮', 'Star Cannon', 'weapon', 'ranged', 2,
    [['伤害', '100（耗星）'], ['特性', '发射坠落之星']], '铁砧：坠落之星 + 铁锭 + 木材'),
  E('chain_gun', '链式机枪', 'Chain Gun', 'weapon', 'ranged', 8,
    [['伤害', '40'], ['特性', '全游戏最快射速之一']], '火星暴乱·火星飞碟掉落'),
  E('grenade_launcher', '榴弹发射器', 'Grenade Launcher', 'weapon', 'ranged', 6,
    [['伤害', '38'], ['弹药', '榴弹']], '困难模式军火商出售'),
  E('flamethrower', '火焰喷射器', 'Flamethrower', 'weapon', 'ranged', 5,
    [['伤害', '27'], ['弹药', '凝胶']], '机械师出售（世纪之花后）'),
  E('snowman_cannon', '雪人炮', 'Snowman Cannon', 'weapon', 'ranged', 8,
    [['伤害', '62'], ['特性', '追踪雪球弹']], '霜月·圣诞坦克掉落'),
  /* ===== 近战武器 ===== */
  E('falcon_blade', '猎鹰之刃', 'Falcon Blade', 'weapon', 'melee', 2,
    [['伤害', '19'], ['特性', '快速挥砍']], '骷髅商人出售'),
  E('blood_butcherer', '血腥屠刀', 'Blood Butcherer', 'weapon', 'melee', 2,
    [['伤害', '20'], ['特性', '猩红系宽剑']], '铁砧：猩红锭'),
  E('light_bane', '光之驱逐', "Light's Bane", 'weapon', 'melee', 2,
    [['伤害', '17'], ['特性', '腐化系短剑']], '铁砧：魔金锭'),
  E('volcano', '火山', 'Volcano', 'weapon', 'melee', 3,
    [['伤害', '28'], ['特性', '命中附加着火']], '铁砧：狱石锭×20'),
  E('blade_of_grass', '草薙剑', 'Blade of Grass', 'weapon', 'melee', 3,
    [['伤害', '27'], ['特性', '附加中毒']], '铁砧：丛林孢子 + 蜂刺 + 毒刺'),
  E('bee_keeper', '养蜂人', 'Bee Keeper', 'weapon', 'melee', 2,
    [['伤害', '18'], ['特性', '击中释放蜂群']], '蜂王掉落'),
  E('muramasa', '村正', 'Muramasa', 'weapon', 'melee', 2,
    [['伤害', '19'], ['特性', '极快攻速·自动连击']], '地牢金锁箱'),
  E('starfury', '星怒', 'Starfury', 'weapon', 'melee', 2,
    [['伤害', '25'], ['特性', '召唤天降之星']], '空岛天堂宝箱'),
  E('terrarian', '泰拉悠悠球', 'The Terrarian', 'weapon', 'melee', 10,
    [['伤害', '190'], ['特性', '全游戏最强悠悠球']], '月亮领主掉落'),
  E('amarok', '阿玛洛克', 'Amarok', 'weapon', 'melee', 4,
    [['伤害', '44'], ['特性', '冰冻减益悠悠球']], '困难模式冰雪生态敌怪掉落'),
  /* ===== 配饰 ===== */
  E('feral_claws', '野性之爪', 'Feral Claws', 'accessory', '', 3,
    [['效果', '近战攻速 +12%']], '丛林神龛 / 常春藤箱'),
  E('titan_glove', '泰坦手套', 'Titan Glove', 'accessory', '', 3,
    [['效果', '近战击退翻倍 + 伤害小幅提升']], '猩红暗影珠'),
  E('fire_gauntlet', '火焰手套', 'Fire Gauntlet', 'accessory', '', 8,
    [['效果', '近战伤害+攻速+点燃']], '石巨人掉落'),
  E('mechanical_glove', '机械手套', 'Mechanical Glove', 'accessory', '', 7,
    [['效果', '近战击退+伤害+攻速']], '秘银砧：泰坦手套 + 复仇者徽章'),
  E('master_ninja_gear', '主忍者装备', 'Master Ninja Gear', 'accessory', '', 8,
    [['效果', '冲刺+攀墙+概率闪避']], '秘银砧：黑腰带 + 忍者足袋'),
  E('tabi', '忍者足袋', 'Tabi', 'accessory', '', 7,
    [['效果', '忍者冲刺']], '地牢（世纪之花后）敌怪掉落'),
  E('black_belt', '黑腰带', 'Black Belt', 'accessory', '', 7,
    [['效果', '概率格挡近战伤害']], '地牢（世纪之花后）敌怪掉落'),
  E('cross_necklace', '十字项链', 'Cross Necklace', 'accessory', '', 5,
    [['效果', '受伤无敌时间翻倍']], '地牢金锁箱'),
  E('pocket_mirror', '便携镜', 'Pocket Mirror', 'accessory', '', 2,
    [['效果', '免疫石化']], '猩红暗影珠'),
  E('avenger_emblem', '复仇者徽章', 'Avenger Emblem', 'accessory', '', 5,
    [['效果', '全伤害 +12%']], '秘银砧：任意职业徽章 + 复仇之魂'),
  E('destroyer_emblem', '毁灭者徽章', 'Destroyer Emblem', 'accessory', '', 8,
    [['效果', '全伤害+暴击提升']], '秘银砧：复仇者徽章 + 毁灭者之魂'),
  E('ranger_emblem', '射手徽章', 'Ranger Emblem', 'accessory', '', 5,
    [['效果', '远程伤害 +15%']], '血肉墙掉落'),
  E('sorcerer_emblem', '法师徽章', 'Sorcerer Emblem', 'accessory', '', 5,
    [['效果', '魔法伤害 +15%']], '血肉墙掉落'),
  E('mana_flower', '魔力花', 'Mana Flower', 'accessory', '', 3,
    [['效果', '魔耗 -8% + 自动喝魔力药水']], '秘银砧：魔力再生药水 + 丛林孢子'),
  E('magnet_flower', '磁花', 'Magnet Flower', 'accessory', '', 5,
    [['效果', '魔力吸取 + 魔耗降低']], '秘银砧：魔力花 + 磁球'),
  /* ===== 材料 ===== */
  E('soul_of_night', '暗影之魂', 'Soul of Night', 'material', '', 3,
    [['用途', '困难模式合成材料']], '腐化之地地下敌怪掉落'),
  E('soul_of_light', '光明之魂', 'Soul of Light', 'material', '', 3,
    [['用途', '困难模式合成材料']], '神圣之地地下敌怪掉落'),
  E('beetle_husk', '甲虫外壳', 'Beetle Husk', 'material', '', 8,
    [['用途', '甲虫盔甲等合成']], '石巨人掉落'),
  E('shroomite_bar', '蘑菇矿锭', 'Shroomite Bar', 'material', '', 8,
    [['用途', '蘑菇矿盔甲等合成']], '自动锻造机：叶绿锭 + 发光蘑菇'),
  E('luminite_bar', '夜明锭', 'Luminite Bar', 'material', '', 10,
    [['用途', '最终装备合成']], '远古操纵机：夜明矿×4'),
  E('solar_fragment', '日耀碎片', 'Solar Fragment', 'material', '', 10,
    [['用途', '耀斑套/日耀武器合成']], '月亮事件·日耀柱'),
  E('vortex_fragment', '星旋碎片', 'Vortex Fragment', 'material', '', 10,
    [['用途', '星旋套/星旋武器合成']], '月亮事件·漩涡柱'),
  E('nebula_fragment', '星云碎片', 'Nebula Fragment', 'material', '', 10,
    [['用途', '星云套/星云武器合成']], '月亮事件·星云柱'),
  E('stardust_fragment', '星尘碎片', 'Stardust Fragment', 'material', '', 10,
    [['用途', '星尘套/星尘召唤物合成']], '月亮事件·星尘柱'),
  E('unicorn_horn', '独角兽角', 'Unicorn Horn', 'material', '', 3,
    [['用途', '多种武器合成材料']], '困难模式独角兽掉落'),
  E('pixie_dust', '精灵尘', 'Pixie Dust', 'material', '', 3,
    [['用途', '神圣系合成材料']], '神圣之地妖精掉落'),
  E('ichor_mat', '灵液', 'Ichor', 'material', '', 3,
    [['用途', '灵液箭/灵液法杖等合成']], '猩红之地敌怪掉落'),
  E('cursed_flame_mat', '诅咒火焰', 'Cursed Flame', 'material', '', 3,
    [['用途', '诅咒系合成材料']], '腐化之地敌怪掉落'),
  /* ===== 药水 ===== */
  E('iron_skin_potion', '铁皮药水', 'Ironskin Potion', 'potion', '', 1,
    [['效果', '防御 +8（5 分钟）']], '摆放的瓶子：瓶装水 + 太阳花 + 铁/铅矿'),
  E('summoning_potion', '召唤药水', 'Summoning Potion', 'potion', '', 1,
    [['效果', '召唤栏位 +1（5 分钟）']], '摆放的瓶子：瓶装水 + 死亡草 + 腐肉/椎骨'),
  E('battle_potion', '战斗药水', 'Battle Potion', 'potion', '', 1,
    [['效果', '敌怪生成率翻倍（刷怪/刷宝匣）']], '摆放的瓶子：瓶装水 + 死亡草 + 腐肉/椎骨'),
  E('greater_healing_potion', '强效治疗药水', 'Greater Healing Potion', 'potion', '', 5,
    [['效果', '恢复 150 生命']], '摆放的瓶子：瓶装水 + 水晶碎块等合成'),
  E('greater_mana_potion', '强效魔力药水', 'Greater Mana Potion', 'potion', '', 5,
    [['效果', '恢复 300 魔力']], '摆放的瓶子：瓶装水 + 坠落之星 + 水晶碎块')
]

/* ---------- 工具 ---------- */
function fetchJson (url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 TerraHandbook/1.0', 'Accept': 'application/json' } }, res => {
      let d = ''
      res.on('data', c => { d += c })
      res.on('end', () => {
        try { resolve(JSON.parse(d)) } catch (e) { reject(new Error('非 JSON 响应: ' + d.slice(0, 80))) }
      })
    }).on('error', reject)
  })
}
function download (url, dest) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 TerraHandbook/1.0' } }, res => {
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)) }
      const ws = fs.createWriteStream(dest)
      res.pipe(ws)
      ws.on('finish', () => ws.close(resolve))
      ws.on('error', reject)
    })
    req.on('error', reject)
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('timeout')) })
  })
}

async function main () {
  const items = require(itemsPath)
  const existing = new Set(items.map(i => i.id))
  const list = LIST.filter(x => !existing.has(x.id))
  console.log('清单:', list.length, '条（去重后）')

  // 1. 批量查询精灵图直链（50 个一批）
  const fileOf = x => 'File:' + x.en + '.png'
  const urlMap = {} // id -> url
  for (let i = 0; i < list.length; i += 50) {
    const batch = list.slice(i, i + 50)
    const titles = batch.map(x => fileOf(x)).map(encodeURIComponent).join('|')
    const url = `${API}?action=query&titles=${titles}&prop=imageinfo&iiprop=url&format=json`
    const d = await fetchJson(url)
    Object.values(d.query.pages).forEach(p => {
      const t = (p.title || '').replace(/^File:/, '').replace(/\.png$/i, '')
      const hit = batch.find(x => x.en === t)
      if (hit && p.imageinfo && p.imageinfo[0]) urlMap[hit.id] = p.imageinfo[0].url.split('?')[0]
    })
  }
  console.log('精灵图直链解析成功:', Object.keys(urlMap).length, '/', list.length)
  list.filter(x => !urlMap[x.id]).forEach(x => console.log('  未找到图:', x.en))

  // 2. 下载精灵图
  let dl = 0, fail = []
  for (const x of list) {
    if (!urlMap[x.id]) { fail.push(x); continue }
    try {
      await download(urlMap[x.id], path.join(spritesDir, x.id + '.png'))
      dl++
    } catch (e) {
      console.log('  下载失败:', x.en, e.message)
      fail.push(x)
    }
  }
  console.log('精灵图下载成功:', dl)

  // 3. 追加条目（成功的才入库；无 desc 保持与旧条目兼容）
  const ok = list.filter(x => !fail.includes(x))
  const lines = ok.map(x => {
    const e = {
      id: x.id, name: x.name, en: x.en, cat: x.cat, sub: x.sub, rarity: x.rarity, art: x.id,
      stats: x.stats, obtain: x.obtain
    }
    return '  ' + JSON.stringify(e).replace(/"([a-z]+)":/g, '$1: ').replace(/,(?=[a-z]+:)/g, ',') + ' },'
  })
  const src = fs.readFileSync(itemsPath, 'utf8')
  const idx = src.lastIndexOf(']')
  const out = src.slice(0, idx).replace(/,\s*$/, ',') + '\n' +
    '  /* ================= 2026-09 图鉴补全（对照 wiki） ================= */\n' +
    lines.join('\n') + '\n' + src.slice(idx)
  fs.writeFileSync(itemsPath, out)
  console.log('条目追加完成:', ok.length)

  // 4. 报告失败清单（可后续人工补充）
  if (fail.length) {
    fs.writeFileSync(path.join(__dirname, 'expand-failed.json'), JSON.stringify(fail, null, 2))
    console.log('未入库（精灵图缺失）:', fail.map(f => f.en).join(', '))
  }
}

module.exports = { LIST }
if (require.main === module) main().catch(e => { console.error(e); process.exit(1) })
