// 图鉴「其他/杂项」分类占位修正：任务鱼41+祭坛2+提基/弹射器2+团队平台7+杂项9（官方 wiki 1.4.5.8 核对）
// 单字段(ob)替换：每条基于当前 src 重新截窗，避免多字段偏移 bug
const fs = require('fs');
const R = p => require('path').resolve(__dirname, '..', p);

// ---------- 任务鱼 41 条 ----------
const FISH = [
  ['Amanita Fungifin', '发光蘑菇生物群系'],
  ['Angelfish', '太空层的天湖（只能在天空钓到）'],
  ['Batfish', '地下和洞穴层'],
  ['Bloody Manowar', '猩红之地'],
  ['Bonefish', '地下和洞穴层'],
  ['Bumblebee Tuna', '蜂蜜中（唯一从蜂蜜里钓起的任务鱼）'],
  ['Bunnyfish', '地表森林'],
  ["Cap'n Tunabeard", '海洋（困难模式）'],
  ['Catfish', '丛林地表'],
  ['Cloudfish', '太空层的天湖（只能在天空钓到）'],
  ['Clownfish', '海洋'],
  ['Cursedfish', '腐化之地（困难模式）'],
  ['Demonic Hellfish', '洞穴层及以下（只能在洞穴层或更深钓到）'],
  ['Derpfish', '丛林地表（困难模式）'],
  ['Dirtfish', '地表和地下'],
  ['Dynamite Fish', '地表'],
  ['Eater of Plankton', '腐化之地'],
  ['Fallen Starfish', '天湖和地表'],
  ['Fishotron', '洞穴层及以下（只能在洞穴层或更深钓到）'],
  ['Fishron', '地下冰雪生物群系（困难模式）'],
  ['Guide Voodoo Fish', '洞穴层及以下（只能在洞穴层或更深钓到）'],
  ['Harpyfish', '天湖和地表'],
  ['Hungerfish', '洞穴层及以下（困难模式，只能在洞穴层或更深钓到）'],
  ['Ichorfish', '猩红之地（困难模式）'],
  ['Infected Scabbardfish', '腐化之地'],
  ['Jewelfish', '地下和洞穴层'],
  ['Mirage Fish', '地下神圣之地（困难模式）'],
  ['Mudfish', '丛林（任意深度）'],
  ['Mutant Flinxfin', '地下冰雪生物群系'],
  ['Pengfish', '雪原地表'],
  ['Pixiefish', '地表神圣之地（困难模式）'],
  ['Scarab Fish', '沙漠'],
  ['Scorpio Fish', '沙漠'],
  ['Slimefish', '地表森林'],
  ['Spiderfish', '地下和洞穴层'],
  ['The Fish of Cthulhu', '天湖和地表'],
  ['Tropical Barracuda', '丛林地表'],
  ['Tundra Trout', '雪原地表'],
  ['Unicorn Fish', '神圣之地（困难模式）'],
  ['Wyverntail', '天湖（天空）'],
  ['Zombie Fish', '地表森林'],
];
const fishOb = loc => '仅在接受渔夫的对应钓鱼任务当天，于' + loc + '钓鱼获得（每条任务鱼只在任务当天可钓到，物品栏中已有任务鱼时无法拾取第二条）';

// ---------- 祭坛 / 家具 / 平台 ----------
const OTHER = [
  ['Demon Altar', '自然生成于腐化之地的裂隙中及周边，偶尔出现在地下；放置形态无法用镐采集或搬运。1.4.5 起若世界中没有放置的祭坛，克苏鲁之眼会掉落祭坛物品（100%）。困难模式可用 80% 锤力以上的锤（如神锤）摧毁并赐予世界困难模式矿石'],
  ['Crimson Altar', '自然生成于猩红之地的裂隙中及周边，偶尔出现在地下；放置形态无法用镐采集或搬运。1.4.5 起若世界中没有放置的祭坛，克苏鲁之眼会掉落祭坛物品（100%）。困难模式可用 80% 锤力以上的锤（如神锤）摧毁并赐予世界困难模式矿石'],
  ['Giant Tiki', '由身处丛林生物群系的巫医出售（25 银），1.4.5.7 加入的家具'],
  ['Phasic Warp Ejector', '未实现物品：1.3.0.1 引入但从未完成，仅有物品 ID 和贴图，无法获取'],
  ['Blue Team Platform', '由旅商出售（每个 1 银）；旅商每次到访只出售一种颜色的团队平台（与对应团队块），集齐六色需多次购买'],
  ['Green Team Platform', '由旅商出售（每个 1 银）；旅商每次到访只出售一种颜色的团队平台（与对应团队块），集齐六色需多次购买'],
  ['Pink Team Platform', '由旅商出售（每个 1 银）；旅商每次到访只出售一种颜色的团队平台（与对应团队块），集齐六色需多次购买'],
  ['Red Team Platform', '由旅商出售（每个 1 银）；旅商每次到访只出售一种颜色的团队平台（与对应团队块），集齐六色需多次购买'],
  ['White Team Platform', '由旅商出售（每个 1 银）；旅商每次到访只出售一种颜色的团队平台（与对应团队块），集齐六色需多次购买'],
  ['Yellow Team Platform', '由旅商出售（每个 1 银）；旅商每次到访只出售一种颜色的团队平台（与对应团队块），集齐六色需多次购买'],
];

// ---------- 杂项 9 条 ----------
const MISC = [
  ['Binoculars', '由克苏鲁之眼掉落（1/40，2.5%）；专家模式从克苏鲁之眼的宝藏袋中获得（1/30，3.33%）'],
  ['Etherian Mana', '旧日军团（撒旦军队）事件期间由事件敌怪掉落（激活永恒水晶后每波约 20–40 个）；仅用于召唤酒馆老板的哨兵（每个 10 魔力），事件结束后物品栏与地面上的魔力会被清除'],
  ['Heart', '常见生命拾取物：击败敌怪（最近玩家生命未满而魔力已满时 1/12 即 8.33%，魔力也未满时 1/24 即 4.17%）、打破罐子或用心形雕像生成；拾取立即消耗恢复 20 生命；万圣节期间被焦糖苹果替代'],
  ['Candy Apple', '心在万圣节期间的季节性替代形态：击败敌怪、打破罐子或用心形雕像生成（机制同心），拾取立即消耗恢复 20 生命'],
  ['Candy Cane', '心在圣诞节期间的季节性替代形态：击败敌怪、打破罐子或用心形雕像生成（机制同心），拾取立即消耗恢复 20 生命'],
  ['Star', '常见魔力拾取物：任何会掉落钱币的敌怪在附近玩家魔力未满时掉落（综合概率 13/24 即 54.17%，可掉 1–2 个），或用星星雕像生成；雕像生成的敌怪与撒旦军队/月亮事件敌怪永不掉落；拾取立即消耗恢复 100 魔力；万圣节期间被灵魂蛋糕替代'],
  ['Soul Cake', '星星在万圣节期间的季节性替代形态（机制同星星，13/24 即 54.17% 掉落），拾取立即消耗恢复 100 魔力'],
  ['Sugar Plum', '星星在圣诞节期间的季节性替代形态（机制同星星，13/24 即 54.17% 掉落），拾取立即消耗恢复 100 魔力'],
  ['Mana Cloak Star', '无法作为物品获得：装备魔力斗篷后用魔法武器命中敌怪时落下的星光强化物（5 秒冷却，悬停 5 秒后消失），拾取恢复 50 魔力并给予魔力涌动增益（1.4.5.7 加入）'],
];

// ---------- 执行 ----------
let v3 = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');
let ok = 0, skip = 0, miss = 0;

function fixOb(src, en, ob, tag) {
  const anchor = '"en":"' + en + '"';
  const idx = src.indexOf(anchor);
  if (idx < 0) { console.log('  [MISS] ' + tag + ' (' + en + ')'); return [src, 'miss']; }
  const win = src.slice(idx, idx + 900);
  const m = win.match(/"ob":"[^"]*"/);
  if (!m) { console.log('  [MISS ob] ' + tag + ' (' + en + ')'); return [src, 'miss']; }
  const old = m[0];
  if (old === '"ob":"' + ob + '"') return [src, 'skip'];
  const pos = idx + m.index;
  return [src.slice(0, pos) + '"ob":"' + ob + '"' + src.slice(pos + old.length), 'ok'];
}

FISH.forEach(([en, loc]) => {
  const [ns, st] = fixOb(v3, en, fishOb(loc), '任务鱼');
  v3 = ns; st === 'ok' ? ok++ : st === 'skip' ? skip++ : miss++;
});
OTHER.forEach(([en, ob]) => {
  const [ns, st] = fixOb(v3, en, ob, '其他');
  v3 = ns; st === 'ok' ? ok++ : st === 'skip' ? skip++ : miss++;
});
MISC.forEach(([en, ob]) => {
  const [ns, st] = fixOb(v3, en, ob, '杂项');
  v3 = ns; st === 'ok' ? ok++ : st === 'skip' ? skip++ : miss++;
});

fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3);
console.log('ob 更新 ' + ok + ' 条，跳过(已同值) ' + skip + ' 条，未命中 ' + miss + ' 条（共 ' + (FISH.length + OTHER.length + MISC.length) + ' 条）');

// ---------- 校验 ----------
delete require.cache[require.resolve(R('pkg-cat-3/data/data-v3.js'))];
require(R('pkg-cat-3/data/data-v3.js'));
require(R('utils/dex.js'));
console.log('v3/dex 语法 OK');
