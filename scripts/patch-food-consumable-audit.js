// 食物消耗分类占位修正 45 条（官方 wiki 1.4.5.8 核对）
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

function fixByEn(src, en, newOb, tag) {
  const anchor = '"en":"' + en + '"';
  let idx = -1, count = 0, changed = 0, skipped = 0;
  while ((idx = src.indexOf(anchor, idx + 1)) >= 0) {
    count++;
    const win = src.slice(idx, idx + 1000);
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

const FIX = [];
// 19 种水果：摇树获得，各长在特定树上（1.4.0.1 加入）
const TREES = [
  ['Apple', '苹果', '森林树'], ['Apricot', '杏', '森林树'], ['Grapefruit', '葡萄柚', '森林树'], ['Lemon', '柠檬', '森林树'], ['Peach', '桃子', '森林树'],
  ['Cherry', '樱桃', '针叶树'], ['Plum', '李子', '针叶树'],
  ['Blackcurrant', '黑醋栗', '乌木树（腐化之地）'], ['Elderberry', '接骨木果', '乌木树（腐化之地）'],
  ['Blood Orange', '血橙', '暗影木树（猩红之地）'], ['Rambutan', '红毛丹', '暗影木树（猩红之地）'],
  ['Mango', '芒果', '红木树（丛林）'], ['Pineapple', '菠萝', '红木树（丛林）'],
  ['Banana', '香蕉', '棕榈树（海洋）'], ['Coconut', '椰子', '棕榈树（海洋）'],
  ['Dragon Fruit', '火龙果', '珍珠木树（神圣之地）'], ['Star Fruit', '杨桃', '珍珠木树（神圣之地）'],
  ['Pomegranate', '石榴', '灰烬树（地狱）'], ['Spicy Pepper', '辣椒', '灰烬树（地狱）'],
];
TREES.forEach(([en, zh, tree]) => FIX.push([en, '在' + tree + '上摇树获得的水果（1.4.0.1 加入），可用于制作果汁、水果沙拉、仙馔密酒等食物']));
// 16 种快餐/烘焙/礼物食物（敌怪掉落类，雕像敌怪不掉食物）
FIX.push(['Apple Pie', '由混沌精、夜明蝙蝠和夜明史莱姆掉落（0.67%）']);
FIX.push(['Banana Split', '由蚁狮、蚁狮马、蚁狮蜂及其巨型变体掉落（2%）']);
FIX.push(['BBQ Ribs', '由地牢的骷髅突击手、骷髅狙击手和骷髅特警掉落（4.76%），或由圣骑士掉落（14.29%）']);
FIX.push(['Carton of Milk', '由各类骷髅敌怪掉落（0.67%）']);
FIX.push(['Chicken Nugget', '由鸟妖掉落（2%）']);
FIX.push(['Chocolate Chip Cookie', '由腹足怪掉落（1.33%）']);
FIX.push(['Coffee', '由骷髅李掉落（10%），或由食人怪、抓人草、愤怒捕手掉落（3.33%）']);
FIX.push(['Cooked Marshmallow', '将棒棒棉花糖放在篝火上烘烤获得']);
FIX.push(['Cream Soda', '由诅咒骷髅头掉落（1.43%），或由巨型诅咒骷髅头掉落（2.86%）']);
FIX.push(['Hotdog', '由骨蛇和红魔鬼掉落（3.33%）']);
FIX.push(['Ice Cream', '由冰雪史莱姆、冰雪蝙蝠和尖刺冰雪史莱姆掉落（0.67%）']);
FIX.push(['Nachos', '由沙鲨和愤怒翻滚怪掉落（3.33%）']);
FIX.push(['Pizza', '由蛇发女妖和装甲步兵掉落（2%）']);
FIX.push(['Potato Chips', '由蝾螈、巨型卷壳怪和龙虾掉落（1.33%）']);
FIX.push(['Shrimp Po\' Boy', '由鲨鱼和螃蟹掉落（2%）']);
FIX.push(['Spaghetti', '由花岗岩巨人和花岗精掉落（2%）']);
// 3 种圣诞礼物食物
FIX.push(['Christmas Pudding', '圣诞节期间开启礼物获得（3.60%）']);
FIX.push(['Gingerbread Cookie', '圣诞节期间开启礼物获得（3.60%）']);
FIX.push(['Sugar Cookie', '圣诞节期间开启礼物获得（3.60%）']);
// 掉落类补概率
FIX.push(['Bacon', '由猪龙掉落（1/15，6.67%，雕像生成的不掉）']);
FIX.push(['Burger', '由猩红之地的猩红喀迈拉和噬魂怪掉落（1/100，1%）']);
FIX.push(['Fried Egg', '由爬墙蜘蛛、黑隐士和沙贼掉落（1/30，3.33%）']);
// 消耗品
FIX.push(['Shucked Oyster', '打开牡蛎时必定获得（牡蛎自然生成于海洋沙滩或通过钓鱼获得）']);
FIX.push(['Chum Bucket', '由血月期间钓鱼生成的敌怪掉落（1/2，50%）：游荡眼球怪鱼和僵尸人鱼每次 4–6 个，血浆哥布林鲨鱼、血鳗鱼和恐惧鹦鹉螺每次 7–10 个；投掷进液体可提升渔力（1 桶 +11，2 桶 +17，3 桶最高 +20）']);
FIX.push(['Rope', '从商人和骷髅商人处以每个 10 铜购买；也可在宝箱和罐子中随机找到，或作为史莱姆的额外掉落获得']);
FIX.push(['Vine Rope', '装备植物纤维绳索宝典后破坏藤蔓即可获得（1.3.0.1 加入）']);

let v3 = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');
FIX.forEach(([en, ob]) => { v3 = fixByEn(v3, en, ob, en); });
fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3);

// obt 表同步（有键的：13 水果 + Rope + Vine Rope）
let rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
const os = rw.indexOf('"obt":{');
function setObt(en, newOb) {
  const ki = rw.indexOf('"' + en + '":"', os);
  if (ki < 0) { console.log('  [obt 无键] ' + en); return; }
  const vs = ki + en.length + 4, ve = rw.indexOf('"', vs);
  if (rw.slice(vs, ve) === newOb) { console.log('  [obt SKIP] ' + en); return; }
  rw = rw.slice(0, vs) + newOb + rw.slice(ve);
  console.log('  [obt OK] ' + en);
}
TREES.forEach(([en]) => setObt(en, '在对应生物群系中摇树获得的水果（1.4.0.1 加入），可用于制作果汁、水果沙拉、仙馔密酒等食物'));
setObt('Rope', '从商人和骷髅商人处以每个 10 铜购买；也可在宝箱和罐子中随机找到，或作为史莱姆的额外掉落获得');
setObt('Vine Rope', '装备植物纤维绳索宝典后破坏藤蔓即可获得（1.3.0.1 加入）');
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), rw);
console.log('完成，共处理 ' + FIX.length + ' 条');
