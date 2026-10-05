// rec 表盔甲配方数量补全 + slotLabel 数量渲染（配合 patch-armor-qty.js 的 ob 文本）
const fs = require('fs');
const R = p => require('path').resolve(__dirname, '..', p);

// 每件部件的材料数量（en 材料名 → 数量），全部来自官方 wiki 1.4.5.8 核对
const QTYS = {};
const q = (en, mat, n) => { (QTYS[en] = QTYS[en] || {})[mat] = n; };

// 木材系
[['Wood', '木材'], ['Boreal Wood', '针叶木'], ['Palm Wood', '棕榈木'], ['Rich Mahogany', '红木'],
 ['Ebonwood', '乌木'], ['Shadewood', '暗影木'], ['Pearlwood', '珍珠木'], ['Ash Wood', '灰烬木']]
.forEach(([en]) => {
  q(en + ' Helmet', en, 20); q(en + ' Breastplate', en, 30); q(en + ' Greaves', en, 25);
});
q('Spooky Helmet', 'Spooky Wood', 200); q('Spooky Breastplate', 'Spooky Wood', 300); q('Spooky Leggings', 'Spooky Wood', 250);
q('Cactus Helmet', 'Cactus', 20); q('Cactus Breastplate', 'Cactus', 30); q('Cactus Leggings', 'Cactus', 25);
q('Pumpkin Helmet', 'Pumpkin', 20); q('Pumpkin Breastplate', 'Pumpkin', 30); q('Pumpkin Leggings', 'Pumpkin', 25);

// 肉前金属
[['Copper', 12, 20, 16], ['Tin', 12, 20, 16], ['Iron', 15, 25, 20], ['Lead', 15, 25, 20],
 ['Silver', 15, 25, 20], ['Tungsten', 15, 25, 20], ['Gold', 20, 30, 25], ['Platinum', 20, 30, 25]]
.forEach(([ore, h, c, g]) => {
  q(ore + ' Helmet', ore + ' Bar', h); q(ore + ' Chainmail', ore + ' Bar', c); q(ore + ' Greaves', ore + ' Bar', g);
});
q('Meteor Helmet', 'Meteorite Bar', 10); q('Meteor Suit', 'Meteorite Bar', 20); q('Meteor Leggings', 'Meteorite Bar', 15);
q('Molten Helmet', 'Hellstone Bar', 10); q('Molten Breastplate', 'Hellstone Bar', 20); q('Molten Greaves', 'Hellstone Bar', 15);
q('Shadow Helmet', 'Demonite Bar', 15); q('Shadow Helmet', 'Shadow Scale', 10);
q('Shadow Scalemail', 'Demonite Bar', 25); q('Shadow Scalemail', 'Shadow Scale', 20);
q('Shadow Greaves', 'Demonite Bar', 20); q('Shadow Greaves', 'Shadow Scale', 15);
q('Crimson Helmet', 'Crimtane Bar', 15); q('Crimson Helmet', 'Tissue Sample', 10);
q('Crimson Scalemail', 'Crimtane Bar', 25); q('Crimson Scalemail', 'Tissue Sample', 20);
q('Crimson Greaves', 'Crimtane Bar', 20); q('Crimson Greaves', 'Tissue Sample', 15);
q('Fossil Helmet', 'Sturdy Fossil', 15); q('Fossil Plate', 'Sturdy Fossil', 25); q('Fossil Greaves', 'Sturdy Fossil', 20);
q('Necro Helmet', 'Bone', 40); q('Necro Helmet', 'Cobweb', 40);
q('Necro Breastplate', 'Bone', 60); q('Necro Breastplate', 'Cobweb', 50);
q('Necro Greaves', 'Bone', 50); q('Necro Greaves', 'Cobweb', 45);
q('Bee Headgear', 'Bee Wax', 8); q('Bee Breastplate', 'Bee Wax', 12); q('Bee Greaves', 'Bee Wax', 10);
q('Spider Mask', 'Spider Fang', 8); q('Spider Breastplate', 'Spider Fang', 16); q('Spider Greaves', 'Spider Fang', 12);
q('Jungle Hat', 'Jungle Spores', 8);
q('Jungle Shirt', 'Jungle Spores', 16); q('Jungle Shirt', 'Stinger', 10);
q('Jungle Pants', 'Jungle Spores', 8); q('Jungle Pants', 'Vine', 2);
q('Obsidian Outlaw Hat', 'Silk', 10); q('Obsidian Outlaw Hat', 'Obsidian', 20);
q('Obsidian Outlaw Hat', 'Shadow Scale', 5); q('Obsidian Outlaw Hat', 'Tissue Sample', 5);
q('Obsidian Longcoat', 'Silk', 10); q('Obsidian Longcoat', 'Obsidian', 20);
q('Obsidian Longcoat', 'Shadow Scale', 10); q('Obsidian Longcoat', 'Tissue Sample', 10);
q('Obsidian Pants', 'Silk', 10); q('Obsidian Pants', 'Obsidian', 20);
q('Obsidian Pants', 'Shadow Scale', 5); q('Obsidian Pants', 'Tissue Sample', 5);
q('Flinx Fur Coat', 'Silk', 10); q('Flinx Fur Coat', 'Flinx Fur', 8);
q('Flinx Fur Coat', 'Gold Bar', 8); q('Flinx Fur Coat', 'Platinum Bar', 8);
q('Goggles', 'Lens', 2);

// 宝石长袍
[['Amethyst Robe', 'Amethyst'], ['Topaz Robe', 'Topaz'], ['Sapphire Robe', 'Sapphire'],
 ['Emerald Robe', 'Emerald'], ['Ruby Robe', 'Ruby'], ['Amber Robe', 'Amber'], ['Diamond Robe', 'Diamond']]
.forEach(([en, gem]) => { q(en, 'Robe', 1); q(en, gem, 10); });

// 困难模式矿甲
const hmo = [
  [['Cobalt Helmet', 'Cobalt Hat', 'Cobalt Mask'], 'Cobalt Breastplate', 'Cobalt Leggings', 'Cobalt Bar', 10, 20, 15],
  [['Palladium Helmet', 'Palladium Headgear', 'Palladium Mask'], 'Palladium Breastplate', 'Palladium Leggings', 'Palladium Bar', 12, 24, 18],
  [['Mythril Helmet', 'Mythril Hat', 'Mythril Hood'], 'Mythril Chainmail', 'Mythril Greaves', 'Mythril Bar', 10, 20, 15],
  [['Orichalcum Helmet', 'Orichalcum Headgear', 'Orichalcum Mask'], 'Orichalcum Breastplate', 'Orichalcum Leggings', 'Orichalcum Bar', 12, 24, 18],
  [['Adamantite Helmet', 'Adamantite Headgear', 'Adamantite Mask'], 'Adamantite Breastplate', 'Adamantite Leggings', 'Adamantite Bar', 12, 24, 18],
  [['Titanium Helmet', 'Titanium Headgear', 'Titanium Mask'], 'Titanium Breastplate', 'Titanium Leggings', 'Titanium Bar', 13, 26, 20],
];
hmo.forEach(([heads, chest, legs, bar, h, c, l]) => {
  heads.forEach(hn => q(hn, bar, h));
  q(chest, bar, c); q(legs, bar, l);
});

// 神圣/远古神圣/叶绿/蘑菇矿/幽灵
['Hallowed Helmet', 'Hallowed Headgear', 'Hallowed Hood', 'Hallowed Mask',
 'Ancient Hallowed Helmet', 'Ancient Hallowed Headgear', 'Ancient Hallowed Hood', 'Ancient Hallowed Mask',
 'Chlorophyte Helmet', 'Chlorophyte Headgear', 'Chlorophyte Mask', 'Chlorophyte Visor',
 'Shroomite Helmet', 'Shroomite Headgear', 'Shroomite Mask', 'Spectre Hood', 'Spectre Mask']
.forEach(en => q(en, en.match(/^Spectre/) ? 'Spectre Bar' : (en.match(/^Ancient/) ? 'Hallowed Bar' : (en.match(/^Chlorophyte/) ? 'Chlorophyte Bar' : (en.match(/^Shroomite/) ? 'Shroomite Bar' : 'Hallowed Bar'))), 12));
['Ancient Hallowed Plate Mail', 'Hallowed Plate Mail'].forEach(en => q(en, 'Hallowed Bar', 24));
['Ancient Hallowed Greaves', 'Hallowed Greaves'].forEach(en => q(en, 'Hallowed Bar', 18));
q('Chlorophyte Plate Mail', 'Chlorophyte Bar', 24); q('Chlorophyte Greaves', 'Chlorophyte Bar', 18);
q('Shroomite Breastplate', 'Shroomite Bar', 24); q('Shroomite Leggings', 'Shroomite Bar', 18);
q('Spectre Robe', 'Spectre Bar', 24); q('Spectre Pants', 'Spectre Bar', 18);
q('Turtle Helmet', 'Chlorophyte Bar', 12); q('Turtle Helmet', 'Turtle Shell', 1);
q('Turtle Scale Mail', 'Chlorophyte Bar', 24); q('Turtle Scale Mail', 'Turtle Shell', 1);
q('Turtle Leggings', 'Chlorophyte Bar', 18); q('Turtle Leggings', 'Turtle Shell', 1);
q('Beetle Helmet', 'Beetle Husk', 4); q('Beetle Helmet', 'Turtle Helmet', 1);
q('Beetle Scale Mail', 'Beetle Husk', 8); q('Beetle Scale Mail', 'Turtle Scale Mail', 1);
q('Beetle Shell', 'Beetle Husk', 8); q('Beetle Shell', 'Turtle Scale Mail', 1);
q('Beetle Leggings', 'Beetle Husk', 6); q('Beetle Leggings', 'Turtle Leggings', 1);

// 四柱
[['Solar Flare', 'Solar Fragment'], ['Nebula', 'Nebula Fragment'], ['Vortex', 'Vortex Fragment'], ['Stardust', 'Stardust Fragment']]
.forEach(([pre, frag]) => {
  q(pre + ' Helmet', frag, 10); q(pre + ' Helmet', 'Luminite Bar', 8);
  q(pre + ' Breastplate', frag, 20); q(pre + ' Breastplate', 'Luminite Bar', 16);
  q(pre + ' Plate', frag, 20); q(pre + ' Plate', 'Luminite Bar', 16);
  q(pre + ' Leggings', frag, 15); q(pre + ' Leggings', 'Luminite Bar', 12);
  q(pre + ' Greaves', frag, 15); q(pre + ' Greaves', 'Luminite Bar', 12);
});

// 禁戒/寒霜
q('Forbidden Mask', 'Any Adamantite Bar', 10); q('Forbidden Mask', 'Forbidden Fragment', 1);
q('Forbidden Robes', 'Any Adamantite Bar', 20); q('Forbidden Robes', 'Forbidden Fragment', 1);
q('Forbidden Treads', 'Any Adamantite Bar', 16); q('Forbidden Treads', 'Forbidden Fragment', 1);
q('Frost Helmet', 'Any Adamantite Bar', 10); q('Frost Helmet', 'Frost Core', 1);
q('Frost Breastplate', 'Any Adamantite Bar', 20); q('Frost Breastplate', 'Frost Core', 1);
q('Frost Leggings', 'Any Adamantite Bar', 16); q('Frost Leggings', 'Frost Core', 1);

// 船长/勘探者/粉色防雪
q('Captain Hat', 'Angler Hat', 1); q('Captain Hat', 'Any Mythril Bar', 10);
q('Captain Vest', 'Angler Vest', 1); q('Captain Vest', 'Any Mythril Bar', 10);
q('Captain Pants', 'Angler Pants', 1); q('Captain Pants', 'Any Mythril Bar', 10);
q('Prospector Helmet', 'Mining Helmet', 1); q('Prospector Helmet', 'Any Mythril Bar', 10);
q('Prospector Shirt', 'Mining Shirt', 1); q('Prospector Shirt', 'Any Mythril Bar', 10);
q('Prospector Pants', 'Mining Pants', 1); q('Prospector Pants', 'Any Mythril Bar', 10);
q('Pink Snow Hood', 'Snow Hood', 1); q('Pink Snow Hood', 'Pink Thread', 3);
q('Pink Snow Coat', 'Snow Coat', 1); q('Pink Snow Coat', 'Pink Thread', 3);
q('Pink Snow Pants', 'Snow Pants', 1); q('Pink Snow Pants', 'Pink Thread', 3);

// ---------- 执行：给 rec 槽位末尾追加数量数字 ----------
let rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');

// 1) 反序列化当前 rec（通过 require 后再序列化会破坏格式，改用 require 检查 + 文本正则处理太复杂；
//    采用：require 拿到对象 → 在内存中给槽位追加数字 → 用 JSON 序列化整个模块数据并重写文件）
delete require.cache[require.resolve(R('pkg-recipe/data/recipes-wiki.js'))];
const DATA = require(R('pkg-recipe/data/recipes-wiki.js'));

let nSlots = 0, nItems = 0;
Object.keys(QTYS).forEach(en => {
  const variants = DATA.rec[en];
  if (!variants) return;
  nItems++;
  variants.forEach(v => {
    (v.i || []).forEach(slot => {
      const nameEls = slot.filter(a => typeof a === 'string');
      const numEls = slot.filter(a => typeof a === 'number');
      if (numEls.length) return; // 已有数量
      const mat = nameEls.find(a => QTYS[en][a] !== undefined);
      if (mat === undefined) return;
      slot.push(QTYS[en][mat]);
      nSlots++;
    });
  });
});

// 2) 补充 Any 锭的 zh 中文名
if (DATA.zh['Any Adamantite Bar'] === undefined) DATA.zh['Any Adamantite Bar'] = '任意精金锭（精金/钛金）';
if (DATA.zh['Any Mythril Bar'] === undefined) DATA.zh['Any Mythril Bar'] = '任意秘银锭（秘银/山铜）';

// 3) 重写文件（保持 module.exports 结构）
const out = 'module.exports=' + JSON.stringify(DATA) + ';';
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), out);
console.log('rec 数量槽位追加 ' + nSlots + ' 个（覆盖 ' + nItems + ' 件盔甲）；zh 补 Any 锭中文名');

// ---------- 4) slotLabel 支持末尾数量 ----------
let wc = fs.readFileSync(R('utils/wiki-craft.js'), 'utf8');
const oldLabel = 'function slotLabel(idx,slot){return(slot||[]).map(a=>idx.zh[a]||a).join(" / ")}';
const newLabel = 'function slotLabel(idx,slot){const a=(slot||[]).slice();let n=null;if(a.length&&typeof a[a.length-1]==="number")n=a.pop();const t=a.map(x=>idx.zh[x]||x).join(" / ");return n!=null?t+"×"+n:t}';
if (wc.includes(oldLabel)) { wc = wc.split(oldLabel).join(newLabel); fs.writeFileSync(R('utils/wiki-craft.js'), wc); console.log('slotLabel 数量渲染 OK'); }
else if (wc.includes('typeof a[a.length-1]==="number"')) console.log('slotLabel 已是新版，跳过');
else { console.log('slotLabel 锚点未命中！'); process.exit(1); }

// ---------- 校验 ----------
delete require.cache[require.resolve(R('pkg-recipe/data/recipes-wiki.js'))];
const D2 = require(R('pkg-recipe/data/recipes-wiki.js'));
console.log('--- 校验 ---');
console.log('rec[Adamantite Breastplate]:', JSON.stringify(D2.rec['Adamantite Breastplate']));
console.log('rec[Necro Helmet]:', JSON.stringify(D2.rec['Necro Helmet']));
console.log('rec[Frost Helmet]:', JSON.stringify(D2.rec['Frost Helmet']));
console.log('rec[Turtle Helmet]:', JSON.stringify(D2.rec['Turtle Helmet']));
console.log('zh[Any Mythril Bar]:', D2.zh['Any Mythril Bar']);
global.wx = { getStorageSync: () => 0, setStorageSync: () => {} };
require(R('utils/wiki-craft.js'));
require(R('utils/dex.js'));
console.log('语法 OK');
