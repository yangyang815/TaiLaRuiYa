// 修复历次 obt 同步误伤 zh 表的问题 + 真正更新 obt 表
// 结构：module.exports={"zh":{...@50},"rec":{...@99750},"ico":{...@362661},"obt":{...@523372}}
const fs = require('fs');
const R = p => 'D:/小程序库/泰拉瑞亚/' + p;

let s = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
const obtStart = s.indexOf('"obt":{');
if (obtStart < 0) throw new Error('obt 表未找到');
const obtEnd = s.indexOf('}}', obtStart); // obt 是最后一个顶层表（按此前探测）
const obtZone = [obtStart, obtEnd > obtStart ? obtEnd : s.length];
console.log('obt 表范围:', obtZone[0], '~', obtZone[1]);

// ---------- 1. 恢复 zh 表 37 键中文名 ----------
const ZH_FIX = {
  'Amber': '琥珀',
  'Angler Earring': '渔夫耳环',
  "Fisherman's Pocket Guide": '渔民袖珍宝典',
  'Flying Carpet': '飞毯',
  'Guide to Old World Parkour': '旧世界跑酷指南',
  'High Test Fishing Line': '优质钓鱼线',
  "Neptune's Shell": '海神贝壳',
  'Panic Necklace': '恐慌项链',
  'Sextant': '六分仪',
  'Tackle Box': '钓具箱',
  'Weather Radio': '天气收音机',
  'Whoopie Cushion': '整蛊坐垫',
  'Lucky Horseshoe': '幸运马掌',
  'Snapping Stone': '碎裂之石',
  'Wicked Armlet': '邪恶臂环',
  'Honey Comb': '蜂窝',
  'Star Cloak': '星星斗篷',
  'Cloud in a Bottle': '云朵瓶',
  'Poison Barb': '淬毒倒刺',
  "Philosopher's Stone": '点金石',
  'Celestial Magnet': '天界磁石',
  'Sun Stone': '太阳石',
  'Band of Regeneration': '再生手环',
  'Cross Necklace': '十字项链',
  'Eye of the Golem': '石巨人之眼',
  'Flipper': '脚蹼',
  'Snake Band': '蛇形手环',
  'Ancient Chisel': '远古凿子',
  'Treasure Magnet': '宝藏磁石',
  'Step Stool': '梯凳',
  'Lavaproof Fishing Hook': '防熔岩钓钩',
  'Aglet': '鞋带束头',
  'Magic Quiver': '魔法箭袋',
  'Titan Glove': '泰坦手套',
  'Heavy Sling': '重型投石索',
  'Tsunami in a Bottle': '海啸瓶',
  'Silver Bracer': '银护腕',
};
const zhStart = s.indexOf('"zh":{'), zhEnd = s.indexOf('"rec":{');
let zhFixed = 0;
Object.entries(ZH_FIX).forEach(([en, cn]) => {
  // 仅在 zh 范围内替换
  const zone = s.slice(zhStart, zhEnd);
  const re = new RegExp('"' + en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '":"[^"]*"');
  const m = zone.match(re);
  if (!m) { console.log('  zh 无键:', en); return; }
  if (m[0] === '"' + en + '":"' + cn + '"') return;
  const abs = zhStart + m.index;
  s = s.slice(0, abs) + '"' + en + '":"' + cn + '"' + s.slice(abs + m[0].length);
  zhFixed++;
});
console.log('1) zh 恢复', zhFixed, '键 OK');

// ---------- 2. obt 表统一同步为 v2/v3 现行 ob ----------
const v2 = require('../pkg-cat-2/data/data-v2.js');
const v3 = require('../pkg-cat-3/data/data-v3.js');
let obtFixed = 0, obtMissing = [];
Object.keys(ZH_FIX).forEach(en => {
  const e = v2.find(x => x.en === en) || v3.find(x => x.en === en);
  if (!e || !e.ob) { obtMissing.push(en); return; }
  // 仅在 obt 范围内替换
  const zone = s.slice(obtZone[0], obtZone[1]);
  const re = new RegExp('"' + en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '":"[^"]*"');
  const m = zone.match(re);
  if (!m) { obtMissing.push(en + '(obt无键)'); return; }
  if (m[0] === '"' + en + '":"' + e.ob + '"') return;
  const abs = obtZone[0] + m.index;
  s = s.slice(0, abs) + '"' + en + '":"' + e.ob + '"' + s.slice(abs + m[0].length);
  obtFixed++;
});
console.log('2) obt 更新', obtFixed, '键 OK；缺失:', obtMissing.join('、') || '无');

fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), s);
console.log('写入完成');
