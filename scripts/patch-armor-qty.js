// 盔甲分类 206 条合成配方数量补全（官方 wiki 1.4.5.8 逐套核对，数量均为当前版本数值）
// 单字段(ob)替换：en 锚点 + 窗口内 ob 替换，obt 表有键则同步
const fs = require('fs');
const R = p => require('path').resolve(__dirname, '..', p);

const ANVIL_P = '铁砧/铅砧';   // 肉前金属砧
const ANVIL_H = '秘银砧/山铜砧'; // 困难模式砧

const FIX = [];
const push = (en, ob) => FIX.push([en, ob]);

// ---------- 木材系（头盔20/胸甲30/护腿25 @ 工作台；阴森 200/300/250） ----------
const woods = [
  ['Wood', '木材'], ['Boreal Wood', '针叶木'], ['Palm Wood', '棕榈木'],
  ['Rich Mahogany', '红木'], ['Ebonwood', '乌木'], ['Shadewood', '暗影木'],
  ['Pearlwood', '珍珠木'], ['Ash Wood', '灰烬木'],
];
woods.forEach(([en, cn]) => {
  push(en + ' Helmet', '合成：' + cn + '×20 @ 工作台');
  push(en + ' Breastplate', '合成：' + cn + '×30 @ 工作台');
  push(en + ' Greaves', '合成：' + cn + '×25 @ 工作台');
});
push('Spooky Helmet', '合成：阴森木×200 @ 工作台');
push('Spooky Breastplate', '合成：阴森木×300 @ 工作台');
push('Spooky Leggings', '合成：阴森木×250 @ 工作台');
push('Cactus Helmet', '合成：仙人掌×20 @ 工作台');
push('Cactus Breastplate', '合成：仙人掌×30 @ 工作台');
push('Cactus Leggings', '合成：仙人掌×25 @ 工作台');
push('Pumpkin Helmet', '合成：南瓜×20 @ 工作台');
push('Pumpkin Breastplate', '合成：南瓜×30 @ 工作台');
push('Pumpkin Leggings', '合成：南瓜×25 @ 工作台');
push('Pumpkin armor', '合成：南瓜×75 @ 工作台（头盔20、胸甲30、护腿25）');

// ---------- 肉前金属系（1.4.1 降价后数值） ----------
// [en前缀, 中文名, 头盔数, 链甲数, 护胫数]
const metals = [
  ['Copper', '铜', 12, 20, 16], ['Tin', '锡', 12, 20, 16],
  ['Iron', '铁', 15, 25, 20], ['Lead', '铅', 15, 25, 20],
  ['Silver', '银', 15, 25, 20], ['Tungsten', '钨', 15, 25, 20],
  ['Gold', '金', 20, 30, 25], ['Platinum', '铂金', 20, 30, 25],
];
metals.forEach(([en, cn, h, c, g]) => {
  push(en + ' Helmet', '由远古' + cn + '头盔在微光中嬗变互换；合成：' + cn + '锭×' + h + ' @ ' + ANVIL_P);
  push(en + ' Chainmail', '合成：' + cn + '锭×' + c + ' @ ' + ANVIL_P);
  push(en + ' Greaves', '合成：' + cn + '锭×' + g + ' @ ' + ANVIL_P);
});

// ---------- 微光互换专用（远古系/角斗士/挖矿） ----------
push('Ancient Gold Helmet', '微光嬗变：将金头盔丢入微光获得（两者可互换）');
push('Ancient Iron Helmet', '微光嬗变：将铁头盔丢入微光获得（两者可互换）');
push('Ancient Necro Helmet', '微光嬗变：将死灵头盔丢入微光获得（两者可互换）');
push('Ancient Cobalt Helmet', '微光嬗变：将丛林帽丢入微光获得（两者可互换）');
push('Ancient Cobalt Breastplate', '微光嬗变：将丛林衣丢入微光获得（两者可互换）');
push('Ancient Cobalt Leggings', '微光嬗变：将丛林裤丢入微光获得（两者可互换）');
push('Ancient Shadow Helmet', '微光嬗变：将暗影头盔丢入微光获得（两者可互换）');
push('Ancient Shadow Scalemail', '微光嬗变：将暗影鳞甲丢入微光获得（两者可互换）');
push('Ancient Shadow Greaves', '微光嬗变：将暗影护胫丢入微光获得（两者可互换）');
push('Gladiator Helmet', '微光嬗变：将角斗士护腿丢入微光获得（三件部件在微光中循环互换）');
push('Gladiator Breastplate', '微光嬗变：将角斗士头盔丢入微光获得（三件部件在微光中循环互换）');
push('Gladiator Leggings', '微光嬗变：将角斗士胸甲丢入微光获得（三件部件在微光中循环互换）');
push('Mining Shirt', '微光嬗变：将挖矿裤丢入微光获得（两者可互换）');
push('Mining Pants', '微光嬗变：将挖矿衣丢入微光获得（两者可互换）');

// ---------- 肉后 Boss 前特殊套 ----------
push('Meteor Helmet', '合成：陨石锭×10 @ ' + ANVIL_P);
push('Meteor Suit', '合成：陨石锭×20 @ ' + ANVIL_P);
push('Meteor Leggings', '合成：陨石锭×15 @ ' + ANVIL_P);
push('Molten Helmet', '合成：狱石锭×10 @ ' + ANVIL_P);
push('Molten Breastplate', '合成：狱石锭×20 @ ' + ANVIL_P);
push('Molten Greaves', '合成：狱石锭×15 @ ' + ANVIL_P);
push('Shadow Helmet', '由远古暗影头盔在微光中嬗变互换；合成：魔矿锭×15 + 暗影鳞片×10 @ ' + ANVIL_P);
push('Shadow Scalemail', '由远古暗影鳞甲在微光中嬗变互换；合成：魔矿锭×25 + 暗影鳞片×20 @ ' + ANVIL_P);
push('Shadow Greaves', '由远古暗影护胫在微光中嬗变互换；合成：魔矿锭×20 + 暗影鳞片×15 @ ' + ANVIL_P);
push('Shadow armor', '合成：魔矿锭×60 + 暗影鳞片×45 @ ' + ANVIL_P + '（头盔15锭+10鳞、鳞甲25+20、护胫20+15）');
push('Crimson Helmet', '合成：猩红矿锭×15 + 组织样本×10 @ ' + ANVIL_P);
push('Crimson Scalemail', '合成：猩红矿锭×25 + 组织样本×20 @ ' + ANVIL_P);
push('Crimson Greaves', '合成：猩红矿锭×20 + 组织样本×15 @ ' + ANVIL_P);
push('Crimson armor', '合成：猩红矿锭×60 + 组织样本×45 @ ' + ANVIL_P + '（头盔15锭+10样本、鳞甲25+20、护胫20+15）');
push('Fossil Helmet', '合成：坚固化石×15 @ ' + ANVIL_P);
push('Fossil Plate', '合成：坚固化石×25 @ ' + ANVIL_P);
push('Fossil Greaves', '合成：坚固化石×20 @ ' + ANVIL_P);
push('Fossil armor', '合成：坚固化石×60 @ ' + ANVIL_P + '（头盔15、板甲25、护胫20）');
push('Necro Helmet', '由远古死灵头盔在微光中嬗变互换；合成：骨头×40 + 蛛网×40 @ 工作台');
push('Necro Breastplate', '合成：骨头×60 + 蛛网×50 @ 工作台');
push('Necro Greaves', '合成：骨头×50 + 蛛网×45 @ 工作台');
push('Bee Headgear', '合成：蜂蜡×8 @ ' + ANVIL_P);
push('Bee Breastplate', '合成：蜂蜡×12 @ ' + ANVIL_P);
push('Bee Greaves', '合成：蜂蜡×10 @ ' + ANVIL_P);
push('Spider Mask', '合成：蜘蛛牙×8 @ ' + ANVIL_H);
push('Spider Breastplate', '合成：蜘蛛牙×16 @ ' + ANVIL_H);
push('Spider Greaves', '合成：蜘蛛牙×12 @ ' + ANVIL_H);
push('Jungle Hat', '由远古钴头盔在微光中嬗变互换；合成：丛林孢子×8 @ ' + ANVIL_P);
push('Jungle Shirt', '由远古钴胸甲在微光中嬗变互换；合成：丛林孢子×16 + 毒刺×10 @ ' + ANVIL_P);
push('Jungle Pants', '由远古钴护腿在微光中嬗变互换；合成：丛林孢子×8 + 藤蔓×2 @ ' + ANVIL_P);
push('Obsidian Outlaw Hat', '合成：丝绸×10 + 黑曜石×20 + 暗影鳞片×5（或组织样本×5）@ 地狱熔炉');
push('Obsidian Longcoat', '合成：丝绸×10 + 黑曜石×20 + 暗影鳞片×10（或组织样本×10）@ 地狱熔炉');
push('Obsidian Pants', '合成：丝绸×10 + 黑曜石×20 + 暗影鳞片×5（或组织样本×5）@ 地狱熔炉');
push('Flinx Fur Coat', '合成：丝绸×10 + 小雪怪皮毛×8 + 金锭×8（或铂金锭×8）@ 织布机');
push('Goggles', '合成：晶状体×2 @ 工作台');
push('Ultrabright Helmet', '合成：挖矿头盔×1 + 夜视头盔×1 @ 工匠作坊');

// ---------- 宝石长袍（长袍 + 宝石×10 @ 织布机） ----------
const robes = [
  ['Amethyst Robe', '紫晶'], ['Topaz Robe', '黄玉'], ['Sapphire Robe', '蓝玉'],
  ['Emerald Robe', '翡翠'], ['Ruby Robe', '红玉'], ['Amber Robe', '琥珀'], ['Diamond Robe', '钻石'],
];
robes.forEach(([en, cn]) => push(en, '合成：长袍×1 + ' + cn + '×10 @ 织布机'));

// ---------- 困难模式矿甲 ----------
// [en头部件×3, 胸, 腿, 中文名, 头数量, 胸数量, 腿数量, 制作站]
const hm = [
  [['Cobalt Helmet', 'Cobalt Hat', 'Cobalt Mask'], 'Cobalt Breastplate', 'Cobalt Leggings', '钴', 10, 20, 15, ANVIL_P],
  [['Palladium Helmet', 'Palladium Headgear', 'Palladium Mask'], 'Palladium Breastplate', 'Palladium Leggings', '钯金', 12, 24, 18, ANVIL_P],
  [['Mythril Helmet', 'Mythril Hat', 'Mythril Hood'], 'Mythril Chainmail', 'Mythril Greaves', '秘银', 10, 20, 15, ANVIL_H],
  [['Orichalcum Helmet', 'Orichalcum Headgear', 'Orichalcum Mask'], 'Orichalcum Breastplate', 'Orichalcum Leggings', '山铜', 12, 24, 18, ANVIL_H],
  [['Adamantite Helmet', 'Adamantite Headgear', 'Adamantite Mask'], 'Adamantite Breastplate', 'Adamantite Leggings', '精金', 12, 24, 18, ANVIL_H],
  [['Titanium Helmet', 'Titanium Headgear', 'Titanium Mask'], 'Titanium Breastplate', 'Titanium Leggings', '钛金', 13, 26, 20, ANVIL_H],
];
hm.forEach(([heads, chest, legs, cn, h, c, l, st]) => {
  heads.forEach(hn => push(hn, '合成：' + cn + '锭×' + h + ' @ ' + st));
  push(chest, '合成：' + cn + '锭×' + c + ' @ ' + st);
  push(legs, '合成：' + cn + '锭×' + l + ' @ ' + st);
});

// ---------- 神圣/远古神圣/叶绿/海龟/甲虫/蘑菇矿/幽灵 ----------
['Hallowed Helmet', 'Hallowed Headgear', 'Hallowed Hood', 'Hallowed Mask'].forEach(en =>
  push(en, '合成：神圣锭×12 @ ' + ANVIL_H));
push('Hallowed Plate Mail', '合成：神圣锭×24 @ ' + ANVIL_H);
push('Hallowed Greaves', '合成：神圣锭×18 @ ' + ANVIL_H);
['Ancient Hallowed Helmet', 'Ancient Hallowed Headgear', 'Ancient Hallowed Hood', 'Ancient Hallowed Mask'].forEach(en =>
  push(en, '合成：神圣锭×12 @ 恶魔祭坛/猩红祭坛'));
push('Ancient Hallowed Plate Mail', '合成：神圣锭×24 @ 恶魔祭坛/猩红祭坛');
push('Ancient Hallowed Greaves', '合成：神圣锭×18 @ 恶魔祭坛/猩红祭坛');
['Chlorophyte Helmet', 'Chlorophyte Headgear', 'Chlorophyte Mask', 'Chlorophyte Visor'].forEach(en =>
  push(en, '合成：叶绿锭×12 @ ' + ANVIL_H));
push('Chlorophyte Plate Mail', '合成：叶绿锭×24 @ ' + ANVIL_H);
push('Chlorophyte Greaves', '合成：叶绿锭×18 @ ' + ANVIL_H);
push('Turtle Helmet', '合成：叶绿锭×12 + 海龟壳×1 @ ' + ANVIL_H);
push('Turtle Scale Mail', '合成：叶绿锭×24 + 海龟壳×1 @ ' + ANVIL_H);
push('Turtle Leggings', '合成：叶绿锭×18 + 海龟壳×1 @ ' + ANVIL_H);
push('Beetle Helmet', '合成：甲虫外壳×4 + 海龟头盔×1 @ ' + ANVIL_H);
push('Beetle Scale Mail', '合成：甲虫外壳×8 + 海龟铠甲×1 @ ' + ANVIL_H);
push('Beetle Shell', '合成：甲虫外壳×8 + 海龟铠甲×1 @ ' + ANVIL_H);
push('Beetle Leggings', '合成：甲虫外壳×6 + 海龟护腿×1 @ ' + ANVIL_H);
['Shroomite Helmet', 'Shroomite Headgear', 'Shroomite Mask'].forEach(en =>
  push(en, '合成：蘑菇矿锭×12 @ ' + ANVIL_H));
push('Shroomite Breastplate', '合成：蘑菇矿锭×24 @ ' + ANVIL_H);
push('Shroomite Leggings', '合成：蘑菇矿锭×18 @ ' + ANVIL_H);
['Spectre Hood', 'Spectre Mask'].forEach(en =>
  push(en, '合成：幽灵锭×12 @ ' + ANVIL_H));
push('Spectre Robe', '合成：幽灵锭×24 @ ' + ANVIL_H);
push('Spectre Pants', '合成：幽灵锭×18 @ ' + ANVIL_H);

// ---------- 四柱盔甲 ----------
const pillars = [
  ['Solar Flare', '日耀碎片'], ['Nebula', '星云碎片'],
  ['Vortex', '星旋碎片'], ['Stardust', '星尘碎片'],
];
pillars.forEach(([en, frag]) => {
  push(en + ' Helmet', '合成：' + frag + '×10 + 夜明锭×8 @ 远古操纵机');
  push(en + ' Breastplate', '合成：' + frag + '×20 + 夜明锭×16 @ 远古操纵机');
  push(en + ' Plate', '合成：' + frag + '×20 + 夜明锭×16 @ 远古操纵机');
  push(en + ' Leggings', '合成：' + frag + '×15 + 夜明锭×12 @ 远古操纵机');
  push(en + ' Greaves', '合成：' + frag + '×15 + 夜明锭×12 @ 远古操纵机');
});

// ---------- 禁戒/寒霜/船长/勘探者/粉色防雪 ----------
push('Forbidden Mask', '合成：精金锭或钛金锭×10 + 禁戒碎片×1 @ ' + ANVIL_H);
push('Forbidden Robes', '合成：精金锭或钛金锭×20 + 禁戒碎片×1 @ ' + ANVIL_H);
push('Forbidden Treads', '合成：精金锭或钛金锭×16 + 禁戒碎片×1 @ ' + ANVIL_H);
push('Frost Helmet', '合成：精金锭或钛金锭×10 + 寒霜核×1 @ ' + ANVIL_H);
push('Frost Breastplate', '合成：精金锭或钛金锭×20 + 寒霜核×1 @ ' + ANVIL_H);
push('Frost Leggings', '合成：精金锭或钛金锭×16 + 寒霜核×1 @ ' + ANVIL_H);
push('Captain Hat', '合成：渔夫帽×1 + 任意秘银锭×10 @ ' + ANVIL_H);
push('Captain Vest', '合成：渔夫背心×1 + 任意秘银锭×10 @ ' + ANVIL_H);
push('Captain Pants', '合成：渔夫裤×1 + 任意秘银锭×10 @ ' + ANVIL_H);
push('Prospector Helmet', '合成：挖矿头盔×1 + 任意秘银锭×10 @ ' + ANVIL_H);
push('Prospector Shirt', '合成：挖矿衣×1 + 任意秘银锭×10 @ ' + ANVIL_H);
push('Prospector Pants', '合成：挖矿裤×1 + 任意秘银锭×10 @ ' + ANVIL_H);
push('Pink Snow Hood', '合成：防雪兜帽×1 + 粉线×3 @ 工作台');
push('Pink Snow Coat', '合成：防雪大衣×1 + 粉线×3 @ 工作台');
push('Pink Snow Pants', '合成：防雪裤×1 + 粉线×3 @ 工作台');

// ---------- 执行（全部在 v2） ----------
let v2 = fs.readFileSync(R('pkg-cat-2/data/data-v2.js'), 'utf8');
let ok = 0, skip = 0, miss = 0;
FIX.forEach(([en, ob]) => {
  const anchor = '"en":"' + en + '"';
  const idx = v2.indexOf(anchor);
  if (idx < 0) { console.log('  [MISS] ' + en); miss++; return; }
  const win = v2.slice(idx, idx + 900);
  const m = win.match(/"ob":"[^"]*"/);
  if (!m) { console.log('  [MISS ob] ' + en); miss++; return; }
  if (m[0] === '"ob":"' + ob + '"') { skip++; return; }
  const pos = idx + m.index;
  v2 = v2.slice(0, pos) + '"ob":"' + ob + '"' + v2.slice(pos + m[0].length);
  ok++;
});
fs.writeFileSync(R('pkg-cat-2/data/data-v2.js'), v2);

// ---------- obt 表有键的同步 ----------
let rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
const os = rw.indexOf('"obt":{');
let nObt = 0;
FIX.forEach(([en, ob]) => {
  const ki = rw.indexOf('"' + en + '":"', os);
  if (ki < 0) return;
  const vs = ki + en.length + 4, ve = rw.indexOf('"', vs);
  if (rw.slice(vs, ve) !== ob) { rw = rw.slice(0, vs) + ob + rw.slice(ve); nObt++; }
});
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), rw);

console.log('ob 更新 ' + ok + ' 条，跳过 ' + skip + ' 条，未命中 ' + miss + ' 条（共 ' + FIX.length + ' 条）；obt 同步 ' + nObt + ' 键');

delete require.cache[require.resolve(R('pkg-cat-2/data/data-v2.js'))];
require(R('pkg-cat-2/data/data-v2.js'));
require(R('utils/dex.js'));
console.log('v2/dex 语法 OK');
