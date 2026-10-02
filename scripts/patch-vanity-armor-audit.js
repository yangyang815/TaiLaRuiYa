// 图鉴防具/时装分类"开启宝藏袋/可于世界中探索"占位全量修正（对照官方 wiki 1.4.5.8）
// 仅改 pkg-cat-2/data/data-v2.js（本批条目全部在 v2）
const fs = require('fs');
const R = p => 'D:/小程序库/泰拉瑞亚/' + p;

let v2 = fs.readFileSync(R('pkg-cat-2/data/data-v2.js'), 'utf8');

function patchOb(src, en, newOb, tag) {
  const anchor = '"en":"' + en + '"';
  const i = src.indexOf(anchor);
  if (i < 0) throw new Error('未找到 anchor: ' + tag);
  const win = src.slice(i, i + 1100);
  const m = win.match(/"ob":"[^"]*"/);
  if (!m) throw new Error('未找到 ob: ' + tag);
  if (m[0] === '"ob":"' + newOb + '"') { console.log('  跳过(已新值)', tag); return src; }
  return src.slice(0, i + m.index) + '"ob":"' + newOb + '"' + src.slice(i + m.index + m[0].length);
}

// ---------- 通用文案 ----------
const GOODIE = '万圣节期间敌怪掉落的礼袋（1.25% 掉率）中开启获得：礼袋有 66.6% 概率开出随机化装服，此套装为其中之一';
const GIFT = '圣诞节期间敌怪掉落的礼物（7.69% 掉率）中开启获得：经典模式 1.08%、困难模式 1.01%';
const ANTLERS = '圣诞节期间敌怪掉落的礼物（7.69% 掉率）中开启获得：经典模式 2.31%、困难模式 2.15%';
const GOODIE_FAMILY = [ // 万圣节礼袋套装（部件与套装共用文案）
  'Cat Ears','Cat Mask','Cat Pants','Cat set','Cat Shirt',
  'Vampire Mask','Vampire Pants','Vampire set','Vampire Shirt',
  'Wolf Mask','Wolf Pants','Wolf set','Wolf Shirt',
  'Robot Mask','Robot Pants','Robot set','Robot Shirt',
  'Pumpkin Mask','Pumpkin Pants','Pumpkin set','Pumpkin Shirt',
  'Karate Tortoise Mask','Karate Tortoise Pants','Karate Tortoise set','Karate Tortoise Shirt',
  'Fox Mask','Fox Pants','Fox set','Fox Shirt',
  'Ghost Mask','Ghost set','Ghost Shirt',
  'Witch Boots','Witch Dress','Witch Hat','Witch set',
  'Leprechaun Hat','Leprechaun Pants','Leprechaun set','Leprechaun Shirt',
  'Unicorn Mask','Unicorn Pants','Unicorn set','Unicorn Shirt',
  'Space Creature Mask','Space Creature Pants','Space Creature set','Space Creature Shirt',
  'Creeper Mask','Creeper Pants','Creeper set','Creeper Shirt',
  'Bride of Frankenstein Dress','Bride of Frankenstein Mask','Bride of Frankenstein set',
  'Pixie Pants','Pixie set','Pixie Shirt',
  'Princess Dress','Princess Hat','Princess set',
  'Treasure Hunter Pants','Treasure Hunter set','Treasure Hunter Shirt',
  'Reaper Hood','Reaper Robe','Reaper set',
];
const GIFT_FAMILY = ['Tree Mask','Tree set','Tree Shirt','Tree Trunks',
  'Parka Coat','Parka Hood','Parka Pants','Parka set',
  'Mrs. Claus Hat','Mrs. Claus Heels','Mrs. Claus set','Mrs. Claus Shirt',
  'Snow Hat','Ugly Sweater'];

const FIX = [];
GOODIE_FAMILY.forEach(en => FIX.push([en, GOODIE]));
GIFT_FAMILY.forEach(en => FIX.push([en, GIFT]));
FIX.push(['Reindeer Antlers', ANTLERS]);

// NPC 出售组
FIX.push(["Archaeologist's Hat", '由稀有敌怪骷髅博士掉落（100%）']);
FIX.push(["Archaeologist's set", '考古帽由稀有敌怪骷髅博士掉落（100%）；考古夹克与考古裤由皮革×15 @ 工作台合成']);
FIX.push(["Clothier's set", '红帽由服装商死亡时掉落（100%）；服装商夹克与服装商裤在万圣节期间由服装商出售（各 3 金）']);
FIX.push(['Red Hat', '由服装商 NPC 死亡时掉落（100%）']);
FIX.push(['Cultist set', '击败拜月教邪教徒后由服装商出售（全套 20 金；日耀版白天、月亮版夜晚出售）']);
FIX.push(["Gentleman's set", '绅士胡子由发型师出售（5 金），佩戴后生长升级为长胡子/大胡子；绅士马甲与绅士裤子由丝绸×20 @ 织布机合成']);
FIX.push(['Blue Graduation set', '残月期间由服装商出售（全套 20 金）']);
FIX.push(['Maroon Graduation set', '娥眉月期间由服装商出售（全套 20 金）']);
FIX.push(["Plumber's Hat", '由地狱的火焰小鬼掉落（1/250，0.4%）']);
FIX.push(["Plumber's set", '管道工帽由火焰小鬼掉落（1/250，0.4%）；管道工衣与管道工背带裤在满月期间由服装商出售（各 25 金）']);
FIX.push(['Magic Hat', '旅商出售（3 金）']);

// Boss/敌怪掉落组
FIX.push(['Eyebrella', '由独眼巨鹿掉落（33%）']);
FIX.push(["Dizzy's Rare Gecko Chester", '由独眼巨鹿掉落（7.14%）；1.4.4 加入']);
FIX.push(['Wizard Hat', '由稀有敌怪蒂姆必定掉落（100%）']);
FIX.push(['Ninja Hood', '由史莱姆王掉落（每件 1/3，33.33%）；专家模式从史莱姆王的宝藏袋中获得（每袋掉两件）']);
FIX.push(['Ninja Pants', '由史莱姆王掉落（每件 1/3，33.33%）；专家模式从史莱姆王的宝藏袋中获得（每袋掉两件）']);
FIX.push(['Ninja Shirt', '由史莱姆王掉落（每件 1/3，33.33%）；专家模式从史莱姆王的宝藏袋中获得（每袋掉两件）']);
FIX.push(['Crystal Assassin Hood', '由史莱姆皇后掉落（每次击杀必掉一件，各部件 1/3，33.33%）；专家模式从史莱姆皇后的宝藏袋中获得（必掉两件）']);
FIX.push(['Crystal Assassin Pants', '由史莱姆皇后掉落（每次击杀必掉一件，各部件 1/3，33.33%）；专家模式从史莱姆皇后的宝藏袋中获得（必掉两件）']);
FIX.push(['Crystal Assassin Shirt', '由史莱姆皇后掉落（每次击杀必掉一件，各部件 1/3，33.33%）；专家模式从史莱姆皇后的宝藏袋中获得（必掉两件）']);
FIX.push(['Crystal Assassin armor', '由史莱姆皇后掉落（每次击杀必掉一件，各部件 1/3，33.33%）；专家模式从史莱姆皇后的宝藏袋中获得（必掉两件）']);

// 合成组
FIX.push(['Ancient set', '合成：丝绸×15+远古布匹×5 @ 织布机（每件部件）']);
FIX.push(["Firestarter's set", '合成：丝绸×20 @ 织布机（每件）；1.4.3 饥荒联动']);
FIX.push(['Floret Protector set', '合成：头盔=玻璃×20+土块×10+太阳花，衬衫/裤子=丝绸×20+土块×15，均 @ 织布机；1.4.1 时装竞赛']);
FIX.push(["Hero's set", '合成：丝绸×20+绿线×3 @ 织布机（每件）']);
FIX.push(['Maid set', '合成：丝绸×20+黑线×3 @ 织布机（每件）']);
FIX.push(['Pink Maid set', '合成：丝绸×20+粉线×3 @ 织布机（每件）']);
FIX.push(['Tuxedo set', '高顶礼帽由僵尸新郎掉落（90%）；西装衣与西装裤由丝绸×20+黑线×3 @ 织布机合成']);
FIX.push(['Blue Bikini set', '合成：丝绸×20 @ 织布机（每件）；1.4.5 新增']);
FIX.push(['Capricorn Hooves', '1.4.1 时装竞赛套装，合成获得：头盔=珊瑚×15+坠落之星×5；护胸/兽蹄/尾巴=丝绸×20+坠落之星×5+银染料 @ 织布机（兽蹄与尾巴右键切换）']);
FIX.push(["The Beheaded's set", '1.4.5 死亡细胞联动，合成获得：头部=暗影之魂×10+暗影蜡烛+腐肉×10或椎骨×10 @ 恶魔祭坛/猩红祭坛；胸甲=远古布匹×5+镣铐，长裤=远古布匹×5+破布×5 @ 织布机']);
["Heroicis' Coat","Heroicis' Hat","Heroicis' Pants","Heroicis' set"].forEach(en =>
  FIX.push([en, '开发者物品：困难模式 Boss 的宝藏袋（史莱姆皇后除外）以 6.25% 概率开出随机开发者物品；1.4.5 新增']));

// 宝箱组
['Mushroom Hat','Mushroom Pants','Mushroom set','Mushroom Vest'].forEach(en =>
  FIX.push([en, '发光蘑菇生物群系的蘑菇箱中找到']));
FIX.push(["Pharaoh's set", '金字塔内的宝箱中找到；可将飞毯/沙暴瓶丢入微光，嬗变为法老长袍/法老面具']);
FIX.push(["Dead Man's Sweater", '地牢的死人宝箱中找到（1/3，33.33%）']);
FIX.push(['Moon Lord Legs', '醉酒世界（05162020）中任意类型的宝箱以 1/15（6.67%）概率包含它']);
FIX.push(['Moon Lord Torso', 'For the Worthy 与终极世界独有：地牢锁住的金箱和生物群系宝箱（沙漠箱除外）以 1/5（20%）作为次要战利品出现；地牢钓鱼的金锁盒同率；1.4.5 新增']);

// 盔甲升级组
FIX.push(['Captain armor', '渔夫盔甲的升级版：船长帽/背心/裤 = 渔夫帽/渔夫背心/渔夫裤 + 任何秘银锭×10 @ 秘银砧/山铜砧（渔夫盔甲来自渔夫任务奖励）；1.4.5 新增']);
FIX.push(['Prospector armor', '挖矿盔甲的升级版：各部件 = 挖矿头盔/挖矿衣/挖矿裤 + 任何秘银锭×10 @ 秘银砧/山铜砧（挖矿盔甲来自渔夫任务奖励）；1.4.5 新增']);

// 未实装组
['Mythical Lion Mask','Mythical Robe','Mythical set'].forEach(en =>
  FIX.push([en, '未实装物品：原计划由中国新年事件中的神龙掉落，但神龙从未实装，官方认定无法获取']));

// 补漏
["Chippy's Helmet","Chippy's Chestplate","Chippy's Greaves","Chippy's set"].forEach(en =>
  FIX.push([en, '使用 Chippy 的沙发召唤红帽骷髅王并击败，必定掉落；1.4.5 新增']));
FIX.push(['Superhero set', '合成：丝绸×20+绿线×3 @ 织布机（每件）']);

let n = 0;
FIX.forEach(([en, ob]) => { v2 = patchOb(v2, en, ob, en); n++; });
fs.writeFileSync(R('pkg-cat-2/data/data-v2.js'), v2);
console.log('共修正', n, '条，写入完成');
