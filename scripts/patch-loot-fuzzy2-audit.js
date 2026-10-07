// 掉落战利品分类模糊条目修正（第二轮：钓鱼具体化 + 小动物捕捉具体化 + 未实装/已移除物品说明）
// 依据官方 wiki 1.4.5.8 逐条核对（Fishing catches / Crates / Bait / Butterflies / Dragonflies / Critters / Unobtainable features / Biome Keys）
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

function fixByEn(src, en, newOb, tag) {
  const anchor = '"en":"' + en + '"';
  let idx = -1, count = 0, changed = 0, skipped = 0;
  while ((idx = src.indexOf(anchor, idx + 1)) >= 0) {
    count++;
    const win = src.slice(idx, idx + 900);
    const m = win.match(/"ob":"[^"]*"/);
    if (!m) continue;
    if (m[0] === '"ob":"' + newOb + '"') { skipped++; continue; }
    src = src.slice(0, idx + m.index) + '"ob":"' + newOb + '"' + src.slice(idx + m.index + m[0].length);
    changed++;
  }
  if (!count) console.log('  [MISS] ' + tag);
  else if (changed) console.log('  [OK] ' + tag);
  else console.log('  [SKIP] ' + tag);
  return src;
}

// ============ 钓获物品：具体钓鱼环境/条件/稀有度 ============
const FIX = [];
FIX.push(['Advanced Combat Techniques', '仅在血月期间钓鱼钓获（50% 渔力时约 1/360，100% 渔力时约 1/180，未使用匣子药水与诱饵发射器时）；每世界限用一次，首次使用前可重复钓到']);
FIX.push(['Armored Cavefish', '在地下、洞穴或地狱层的任意生物群系（沙漠除外）钓鱼钓获，不常见，渔力越高概率越高']);
FIX.push(['Atlantic Cod', '在雪原生物群系任意层钓鱼钓获，常见，渔力越高概率越高']);
FIX.push(['Azure Crate', '困难模式中在太空层（如浮空湖）钓鱼钓获，稀有；内含标准匣子物品并必定附带一件天宝箱物品（天空匣的困难模式版本）']);
FIX.push(['Balloon Pufferfish', '在任意生物群系钓鱼钓获的饰品，功能与闪亮红气球相同（跳跃高度提升约 75%，水下跳跃高度略降）']);
FIX.push(['Barnacle Staff', '困难模式中在丛林生物群系任意层钓鱼钓获，稀有；召唤悬浮哨兵藤壶，向敌人发射毒液']);
FIX.push(['Bass', '在除海洋和沙漠外的任意生物群系任意层钓鱼钓获，非常常见，渔力越高概率越高']);
FIX.push(['Boreal Crate', '困难模式中在雪原与冰雪生物群系钓鱼钓获，稀有；内含标准匣子物品并必定附带一件冰冻箱物品（冰冻匣的困难模式版本）']);
FIX.push(['Bottomless Lava Bucket', '在熔岩中钓鱼钓获；可无限倾倒熔岩，倾倒速度略快于普通熔岩桶']);
FIX.push(['Bramble Crate', '困难模式中在丛林生物群系钓鱼钓获，稀有；内含标准匣子物品并必定附带一件常春藤箱物品（丛林匣的困难模式版本）']);
FIX.push(['Chaos Fish', '在地下神圣之地钓鱼钓获，稀有，渔力越高概率越高；可用于合成传送药水']);
FIX.push(['Crimson Tigerfish', '在猩红之地任意层钓鱼钓获，常见，渔力越高概率越高']);
FIX.push(['Damselfish', '在纯净生物群系的太空层钓鱼钓获，不常见，渔力越高概率越高']);
FIX.push(['Defiled Crate', '困难模式中在腐化之地钓鱼钓获，稀有；内含标准匣子物品并必定附带一件暗影珠物品（腐化匣的困难模式版本）']);
FIX.push(['Demon Conch', '在熔岩中钓鱼钓获，稀有；使用后立即传送至地狱中心，可无限次使用']);
FIX.push(['Divine Crate', '困难模式中在神圣之地钓鱼钓获，稀有；内含标准匣子物品，并有概率额外掉落碎魔晶或光明之魂（神圣匣的困难模式版本）']);
FIX.push(['Double Cod', '在丛林生物群系的天空或地表层钓鱼钓获，不常见，渔力越高概率越高']);
FIX.push(['Ebonkoi', '在腐化之地任意层钓鱼钓获，不常见，渔力越高概率越高']);
FIX.push(['Flarefin Koi', '在任意生物群系的熔岩中钓鱼钓获，非常稀有，渔力越高概率越高']);
FIX.push(['Flounder', '在沙漠生物群系钓鱼钓获，非常常见，渔力越高概率越高']);
FIX.push(['Frog Leg', '在任意可钓鱼的水域中钓获的饰品（提升跳跃高度与跳跃速度）']);
FIX.push(['Frost Daggerfish', '在雪原生物群系的湖泊中钓鱼钓获（单次可钓 7 至 137 条，取决于渔力）；投掷后如飞镖般飞出并碎裂']);
FIX.push(['Frost Minnow', '在雪原生物群系任意层钓鱼钓获，不常见，渔力越高概率越高']);
FIX.push(['Golden Carp', '在地下、洞穴或地狱层的任意生物群系（沙漠除外）钓鱼钓获，极其稀有，渔力越高概率越高']);
FIX.push(['Hellstone Crate', '困难模式中在熔岩中钓鱼钓获；打开狱石匣与黑曜石匣是获得黑曜石锁盒的唯一途径（黑曜石匣的困难模式版本）']);
FIX.push(['Hematic Crate', '困难模式中在猩红之地钓鱼钓获，稀有；内含标准匣子物品并必定附带一颗猩红之心物品（猩红匣的困难模式版本）']);
FIX.push(['Hemopiranha', '在猩红之地任意层钓鱼钓获，不常见，渔力越高概率越高']);
FIX.push(['Honeyfin', '在蜂蜜中钓鱼钓获；使用后立即恢复 120 生命并触发药水疾病，也可用于合成海鲜大餐']);
FIX.push(['Joja Cola', '钓鱼时有 1/8（12.5%）概率替代垃圾物品钓上；使用后获得吃饱了增益']);
FIX.push(['Old Shoe', '钓鱼条件不利（渔力过低或水体过小）时钓上的垃圾物品；可用提取机转换为低级鱼饵']);
FIX.push(['Tin Can', '钓鱼条件不利（渔力过低或水体过小）时钓上的垃圾物品；可用提取机转换为低级鱼饵']);
FIX.push(['Mirage Crate', '困难模式中在沙漠生物群系钓鱼钓获，稀有；内含标准匣子物品并必定附带一件砂岩箱物品（绿洲匣的困难模式版本）']);
FIX.push(['Mythril Crate', '困难模式中在任意生物群系任意高度钓鱼钓获；标准匣子的中间档位（铁匣的困难模式版本）']);
FIX.push(['Neon Tetra', '在丛林生物群系任意层钓鱼钓获，常见，渔力越高概率越高']);
FIX.push(['Obsidifish', '在任意生物群系的熔岩中钓鱼钓获，稀有，渔力越高概率越高']);
FIX.push(['Oyster', '在沙漠生物群系钓鱼钓获；打开必得剥壳牡蛎，并有 1/4 概率额外掉出白珍珠、黑珍珠或粉珍珠（越稀有的珍珠概率越低）']);
FIX.push(['Pearlwood Crate', '困难模式中在任意生物群系任意高度钓鱼钓获；标准匣子的最低档位（木匣的困难模式版本）']);
FIX.push(['Princess Fish', '在神圣之地任意层钓鱼钓获，不常见（仅困难模式），渔力越高概率越高']);
FIX.push(['Prismite', '在神圣之地任意层钓鱼钓获，稀有（仅困难模式），渔力越高概率越高']);
FIX.push(['Red Snapper', '在海洋生物群系的天空或地表层钓鱼钓获，常见，渔力越高概率越高']);
FIX.push(['Rock Lobster', '在沙漠生物群系钓鱼钓获，非常常见，渔力越高概率越高']);
FIX.push(['Rockfish', '在地下层任意生物群系钓鱼钓获的前困难模式锤子（锤力与工具速度和熔火锤斧相同）']);
FIX.push(['Salmon', '在森林生物群系的天空或地表层钓鱼钓获，非常常见；需大于 1000 格的水体，渔力越高概率越高']);
FIX.push(['Scaly Truffle', '困难模式中在冰雪生物群系与神圣、腐化或猩红重叠的洞穴层钓鱼钓获；召唤猪龙坐骑']);
FIX.push(['Seaside Crate', '困难模式中在海洋生物群系钓鱼钓获，稀有；内含标准匣子物品并必定附带一件水箱物品（海洋匣的困难模式版本）']);
FIX.push(['Shrimp', '在海洋生物群系的天空或地表层钓鱼钓获，不常见，渔力越高概率越高']);
FIX.push(['Specular Fish', '在森林或雪原生物群系的地下、洞穴或地狱层钓鱼钓获，常见，渔力越高概率越高']);
FIX.push(['Stinkfish', '在地下层及以下的任意生物群系（腐化、神圣与沙漠除外）钓鱼钓获，稀有，渔力越高概率越高']);
FIX.push(['Stockade Crate', '困难模式中击败骷髅王后在地牢钓鱼钓获，稀有；打开围栏匣与地牢匣是获得金锁盒的唯一途径（地牢匣的困难模式版本）']);
FIX.push(['Titanium Crate', '困难模式中在任意生物群系任意高度钓鱼钓获；标准匣子的最高档位（金匣的困难模式版本）']);
FIX.push(['Toxikarp', '困难模式中在腐化之地任意层钓鱼钓获，极其稀有；发射成束的毒弹']);
FIX.push(['Trout', '在海洋生物群系的天空或地表层钓鱼钓获，非常常见，渔力越高概率越高']);
FIX.push(['Tuna', '在海洋生物群系的天空或地表层钓鱼钓获，常见，渔力越高概率越高']);
FIX.push(['Variegated Lardfish', '在地下丛林钓鱼钓获，不常见，渔力越高概率越高']);
FIX.push(['Zephyr Fish', '在任意水域钓鱼钓获，稀有（50% 渔力时约 2/3125，100% 渔力时约 4/3125）；召唤和风鱼宠物']);

// ============ 鱼饵小动物：生成环境/捕捉方式/鱼饵力 ============
// 蝴蝶：白天、非雨天、地表、非墓地、风速低于 20 mph 生成
FIX.push(['Monarch Butterfly', '白天在地表生成的小动物（雨天与大风天不出现），用虫网捕捉；为普通蝴蝶中最常见的外观（生成权重约 25%），鱼饵力 5%']);
FIX.push(['Purple Emperor Butterfly', '白天在地表生成的小动物（雨天与大风天不出现），用虫网捕捉；为普通蝴蝶中较稀有的外观（生成权重约 2%），鱼饵力 35%']);
FIX.push(['Red Admiral Butterfly', '白天在地表生成的小动物（雨天与大风天不出现），用虫网捕捉；为普通蝴蝶中较少见的外观（生成权重约 6%），鱼饵力 30%']);
FIX.push(['Sulphur Butterfly', '白天在地表生成的小动物（雨天与大风天不出现），用虫网捕捉；为普通蝴蝶中较常见的外观（生成权重约 22%），鱼饵力 10%']);
FIX.push(['Tree Nymph Butterfly', '白天在地表生成的小动物（雨天与大风天不出现），用虫网捕捉；为普通蝴蝶中最稀有的外观（生成权重约 1%），鱼饵力 50%']);
FIX.push(['Ulysses Butterfly', '白天在地表生成的小动物（雨天与大风天不出现），用虫网捕捉；为普通蝴蝶中较少见的外观（生成权重约 15%），鱼饵力 20%']);
FIX.push(['Zebra Swallowtail Butterfly', '白天在地表生成的小动物（雨天与大风天不出现），用虫网捕捉；为普通蝴蝶中较常见的外观（生成权重约 19%），鱼饵力 15%']);
FIX.push(['Julia Butterfly', '白天在地表生成的小动物（雨天与大风天不出现），用虫网捕捉；为普通蝴蝶中较常见的外观（生成权重约 10%），鱼饵力 25%']);
FIX.push(['Gold Butterfly', '极稀有的金色小动物（以 1/400 概率替代普通蝴蝶生成），白天在地表（雨天与大风天不出现）用虫网捕捉，鱼饵力 50%']);
FIX.push(['Hell Butterfly', '地狱白天生成的小动物，也会从摇晃灰烬树或破坏灰烬草时出现；需用防熔岩虫网或金虫网捕捉，可在熔岩中钓鱼，鱼饵力 15%']);
// 蜻蜓：白天、风速低于 20 mph；黑橙黄在沙漠，蓝绿红在森林
FIX.push(['Black Dragonfly', '白天地表生成（风速低于 20 mph）的稀有蜻蜓，主要出现在沙漠附近的水域，用虫网捕捉，鱼饵力 20%']);
FIX.push(['Orange Dragonfly', '白天地表生成（风速低于 20 mph）的稀有蜻蜓，主要出现在沙漠附近的水域，用虫网捕捉，鱼饵力 20%']);
FIX.push(['Yellow Dragonfly', '白天地表生成（风速低于 20 mph）的稀有蜻蜓，主要出现在沙漠附近的水域，用虫网捕捉，鱼饵力 20%']);
FIX.push(['Blue Dragonfly', '白天地表生成（风速低于 20 mph）的稀有蜻蜓，主要出现在森林附近的水域，用虫网捕捉，鱼饵力 20%']);
FIX.push(['Green Dragonfly', '白天地表生成（风速低于 20 mph）的稀有蜻蜓，主要出现在森林附近的水域，用虫网捕捉，鱼饵力 20%']);
FIX.push(['Red Dragonfly', '白天地表生成（风速低于 20 mph）的稀有蜻蜓，主要出现在森林附近的水域，用虫网捕捉，鱼饵力 20%']);
FIX.push(['Gold Dragonfly', '极稀有的金色小动物（以 1/400 概率替代普通蜻蜓生成），白天在地表（森林或沙漠水域附近、风速低于 20 mph）用虫网捕捉，鱼饵力 50%']);
// 摇草/丛林组
FIX.push(['Grasshopper', '破坏地表草丛植物时出现的小动物，用虫网捕捉，鱼饵力 10%；金蚱蜢会以 1/400 概率替代其生成']);
FIX.push(['Gold Grasshopper', '极稀有的金色小动物（以 1/400 概率替代普通蚱蜢生成），破坏地表草丛植物时出现，用虫网捕捉，鱼饵力 50%']);
FIX.push(['Buggy', '在丛林或地下丛林破坏野生植物时偶尔出现的小动物（蚜虫、蛆虫、鼻涕虫三种丛林鱼饵中最稀有），用虫网捕捉，鱼饵力 40%']);
FIX.push(['Grubby', '在丛林或地下丛林破坏野生植物时偶尔出现的小动物（三种丛林鱼饵中最常见），用虫网捕捉，鱼饵力 15%']);
FIX.push(['Sluggy', '在丛林或地下丛林破坏野生植物时偶尔出现的小动物（三种丛林鱼饵中较稀有），用虫网捕捉，鱼饵力 25%']);
// 夜间/环境组
FIX.push(['Firefly', '夜晚在地表草地附近生成的小动物（雨天不出现，每夜生成量随机、新月夜最多），用虫网捕捉，鱼饵力 20%']);
FIX.push(['Lightning Bug', '困难模式中夜晚在神圣草方块上生成的小动物，会发出微光，用虫网捕捉，鱼饵力 35%']);
FIX.push(['Glowing Snail', '仅在地表或地下发光蘑菇生物群系生成的小动物，会发光，用虫网捕捉，鱼饵力 15%']);
FIX.push(['Snail', '在地下与洞穴层生成的小动物（冰雪、猩红、腐化与神圣之地除外），用虫网捕捉，鱼饵力 10%']);
FIX.push(['Lavafly', '地狱夜晚生成的小动物，也会从摇晃灰烬树或破坏灰烬草时出现；需用防熔岩虫网或金虫网捕捉，可在熔岩中钓鱼，鱼饵力 25%']);
FIX.push(['Magma Snail', '地狱生成的小动物，也会从摇晃灰烬树时出现；需用防熔岩虫网或金虫网捕捉，可在熔岩中钓鱼，鱼饵力 35%']);
FIX.push(['Ladybug', '森林地表白天且风速不低于 20 mph 时生成的小动物（城镇附近更常见），用虫网捕捉，鱼饵力 17%；将其用作鱼饵会带来坏运气但增加下雨概率']);
FIX.push(['Gold Ladybug', '极稀有的金色小动物（以 1/400 概率替代普通瓢虫生成），森林地表白天且风速不低于 20 mph 时生成，用虫网捕捉，鱼饵力 50%']);
FIX.push(['Water Strider', '白天地表水域上生成的小动物（沙滩或丛林草附近、海洋除外，非雨天且风速低于 22.5 mph），用虫网捕捉，鱼饵力 17%']);
FIX.push(['Gold Water Strider', '极稀有的金色小动物（以 1/400 概率替代普通水黾生成），白天地表水域上生成（非雨天），用虫网捕捉，鱼饵力 50%']);
FIX.push(['Black Scorpion', '沙漠地表生成的小动物（较稀有），用虫网捕捉，鱼饵力 15%']);
FIX.push(['Scorpion', '沙漠地表生成的小动物，用虫网捕捉，鱼饵力 10%']);
FIX.push(['Stinkbug', '地表生成的小动物（生成量每天随机，与蝴蝶同天互斥出现），用虫网捕捉，鱼饵力 10%']);
FIX.push(['Maggot', '在墓碑群系中替代蚯蚓生成，或由蛆虫丧尸死后掉落，用虫网捕捉，鱼饵力 22%']);
// 水母鱼饵：钓鱼钓获而非虫网捕捉
FIX.push(['Blue Jellyfish', '在地下或洞穴层的水体中钓鱼钓获，稀有；属于钓鱼鱼饵，与虫网捕捉无关，鱼饵力 20%']);
FIX.push(['Green Jellyfish', '困难模式中在地下或洞穴层的水体中钓鱼钓获；困难模式下在地下及以下钓到的水母鱼饵有一半概率为绿色，鱼饵力 20%']);
FIX.push(['Pink Jellyfish', '在海洋生物群系钓鱼钓获，稀有；属于钓鱼鱼饵，与虫网捕捉无关，鱼饵力 20%']);

// ============ 钥匙 ============
FIX.push(['Desert Key', '困难模式中由沙漠或地下沙漠内任意会掉落钱币的敌怪掉落（1/2500，0.04%）；击败世纪之花后可开启地牢中的沙漠圣所']);

// ============ 未实装 / 已移除 ============
const UNIMPL = '未实装物品：从未在正式游戏中开放获取，仅存在于游戏数据中，正常途径无法获得（只能通过外部工具修改获取）';
const REMOVED = '已移除物品：曾在旧版本中开放获取，现已从游戏中移除，正常途径无法获得（只能通过外部工具修改获取）';
[
  ['Apple Pie Slice', UNIMPL], ['Sleeping Icon', UNIMPL], ['Bejeweled Staff', UNIMPL],
  ['Boring Bow', UNIMPL], ['Enchanted Timer', UNIMPL], ['Etherian Javelin', UNIMPL],
  ['First Fractal', UNIMPL], ['Goblin Bomber Cap', UNIMPL],
  ['Goblin Mask', UNIMPL],
  ['Kobold Dynamite Backpack', UNIMPL], ['Nebula Axe', UNIMPL], ['Solar Flare Axe', UNIMPL],
  ['Stardust Axe', UNIMPL], ['Vortex Axe', UNIMPL], ['Nebula Chainsaw', UNIMPL],
  ['Solar Flare Chainsaw', UNIMPL], ['Stardust Chainsaw', UNIMPL], ['Nebula Hammer', UNIMPL],
  ['Solar Flare Hammer', UNIMPL], ['Stardust Hammer', UNIMPL], ['Vortex Hammer', UNIMPL],
  ['Ogre Mask', UNIMPL], ['Razortip', UNIMPL], ['The Imploder', UNIMPL],
  ['Fake_newchest1', UNIMPL], ['Fake_newchest2', UNIMPL],
  ['Icemourne', REMOVED], ['Scythe', REMOVED], ['Soul Scythe', REMOVED],
  ['Firecracker (mobile)', REMOVED], ['Rainbow Piece', REMOVED], ['Golden Seaweed', REMOVED],
  ['Mysterious Package', REMOVED], ['Shiny Black Slab', REMOVED],
  ['Blue Present', REMOVED], ['Green Present', REMOVED], ['Yellow Present', REMOVED],
].forEach(([en, ob]) => FIX.push([en, ob]));

// ============ 应用 ============
let v3 = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');
FIX.forEach(([en, ob]) => { v3 = fixByEn(v3, en, ob, en); });
fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3);
console.log('done. total fixes:', FIX.length);
