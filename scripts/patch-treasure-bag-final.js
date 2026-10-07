// "开启宝藏袋/开启宝箱"占位全量清理（第三批）：146 条对照官方 wiki 1.4.5.8
// 1) v2 工具/染料 20 条  2) v3 鱼饵/种子/钥匙/灵魂/锭矿石/趣味/治疗/减益/开发者物品 ~123 条
// 幂等：en 锚点 + 窗口内 ob 替换，同值跳过
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

const DEV_OB = '困难模式 Boss 的专家模式宝藏袋（史莱姆皇后的除外）有 6.25% 概率开出随机开发者物品；Celebration Mk10 世界为 12.5%';

const V2 = {
  'Anti-Gravity Hook': '由火星暴乱事件中的大部分敌怪掉落（0.13%）',
  'Bat Hook': '万圣节期间开启礼袋获得（0.66%）',
  'Leaf Wand': '自然生成于生命树中的生命木箱内；或摇晃森林树时掉落（1.4.1 起）',
  'Living Wood Wand': '自然生成于生命树中的生命木箱内；或摇晃森林树时掉落（1.4.1 起）',
  'Living Mahogany Wand': '自然生成于地下丛林的生命红木树和丛林神龛中的常春藤箱内；或摇晃丛林树时掉落',
  'Rich Mahogany Leaf Wand': '自然生成于地下丛林的生命红木树和丛林神龛中的常春藤箱内；或摇晃丛林树时掉落',
  'Bug Net': '由商人出售（25 银，1.3.0.1 起降价）',
  'Fiberglass Fishing Pole': '从地下丛林的常春藤箱中找到（6.53%），或从丛林匣、荆棘匣中开出（19%）',
  'Scarab Fishing Rod': '从沙漠钓鱼获得的绿洲匣、幻象匣中开出（各 12.5%）',
  'Hook of Dissonance': '由史莱姆皇后掉落（33.33%，专家 50%）',
  'Candy Cane Hook': '圣诞节期间开启礼物获得（0.63%）',
  'Skeletron Hand': '由骷髅王掉落（12.24%，专家 33.33%）',
  'Slime Hook': '由史莱姆王掉落（33.33%，专家 50%）',
  'Thorn Hook': '由世纪之花掉落（10%）',
  'Web Slinger': '自然生成于蜘蛛洞穴的蛛丝箱中（固定战利品）',
  'Ice Mirror': '自然生成于地下雪原的冰冻箱中',
  'Portal Gun': '由月亮领主掉落（100%）；专家模式从其宝藏袋中获得（物品栏中没有传送枪时）；We don\'t even test for that 秘密世界中亦可在宝箱中找到',
  'Sandcastle Bucket': '随机出现于水中箱（50%）、海洋匣和海边匣（各 10%）',
  'Static Hook': '由蒸汽朋克人出售（50 金）',
  'Prismatic Dye': '由光之女皇掉落（25%，1.4.5 起每次掉落 3 个）；专家模式从其宝藏袋中获得'
};

const V3 = {
  'Apprentice Bait': '完成渔夫钓鱼任务的随机奖励，或从各类宝匣中开出',
  'Journeyman Bait': '完成渔夫钓鱼任务的随机奖励，或从各类宝匣中开出',
  'Gold Worm': '极稀有的蠕虫变体：摇晃森林树或摧毁背景物体时以极低几率取代普通蠕虫生成；也可从蠕虫罐头中开出（5%）；生命体分析机可探测',
  'Worm': '摇晃森林树或摧毁草丛、土堆和岩石堆等背景物体时获得；也可从蠕虫罐头中开出（必出 5–8 只）',
  'Acorn': '摇晃森林树、灰烬树、珍珠木树或针叶树时掉落（1–2 个，约 14%）；也可从树妖处以 10 铜购买',
  'Candy Cane Pickaxe': '圣诞节期间开启礼物获得（0.634%，困难模式 0.592%）',
  'Radar': '在地表宝箱中找到（9.09%）；或从钓鱼获得的木匣、珍珠木匣中开出（各 0.83%）；盈凸月期间由骷髅商人出售（2 金 50 银）',
  'Beach Ball': '由派对女孩出售（20 铜）',
  'Kwad Racer Drone': '由机器侠出售（10 金，世纪之花后）',
  'Slime Gun': '由史莱姆王掉落（66.67%）；专家模式从其宝藏袋中获得（50%）',
  'Sparkle Slime Balloon': '由史莱姆皇后掉落（100%，25–75 个）；Celebration Mk10 和终极世界中亦由丛林宝箱怪掉落（33.33%）',
  'Hallowed Bar': '由三个机械 Boss（毁灭者、双子魔眼、机械骷髅王）掉落（100%）；专家模式从其宝藏袋中额外获得',
  'Luminite': '由月亮领主掉落（100%，经典 70–90 个）；专家模式从其宝藏袋中获得（90–110 个）',
  'Cobalt Shield': '在地牢的上锁金箱中找到（14.29%）',
  'Shadow Key': '在地牢的金箱中找到（用于打开地狱中的暗影箱）',
  'Temple Key': '由世纪之花掉落（100%，每次击败必定掉落一个）',
  'Soul of Fright': '由机械骷髅王掉落（100%，25–40 个）；专家模式从其宝藏袋中额外获得',
  'Soul of Might': '由毁灭者掉落（100%，25–40 个）；专家模式从其宝藏袋中额外获得',
  'Soul of Sight': '由双子魔眼掉落（100%，25–40 个）；专家模式从其宝藏袋中额外获得',
  'Soul of Light': '由地下神圣之地（洞穴层）的敌怪掉落（1/5，20%）；或从天赐匣中获得（2–5 个，50%）',
  'Soul of Night': '由地下腐化或猩红之地（洞穴层）的敌怪掉落（1/5，20%）；或从污损匣、血匣中获得（2–5 个，50%）',
  'Eggnog': '圣诞节期间开启礼物获得（8.101%，困难模式 7.561%）',
  'Brain of Confusion': '专家模式中击败克苏鲁之脑后，从其宝藏袋中必定获得（100%）',
  'Corrupt Seeds': '由树妖在血月期间出售（5 银）；或由克苏鲁之眼掉落（腐化世界）',
  'Crimson Seeds': '由树妖在血月期间出售（5 银）；或由克苏鲁之眼掉落（猩红世界）'
};
['Blinkroot Seeds', 'Daybloom Seeds', 'Deathweed Seeds', 'Fireblossom Seeds', 'Moonglow Seeds', 'Shiverthorn Seeds', 'Waterleaf Seeds'].forEach(en => {
  V3[en] = '对应草药成熟收割时获得（1–3 个种子）；也可从植物学家处购买的草药袋中开出（21.698%）；敲碎陶罐偶有获得';
});

function fixByEn(src, en, newOb, tag) {
  const anchor = '"en":"' + en + '"';
  const idx = src.indexOf(anchor);
  if (idx < 0) { console.log('[MISS]', tag, en); return src; }
  const win = src.slice(idx, idx + 1200);
  const m = win.match(/"ob":"([^"]*)"/);
  if (!m) { console.log('[NO OB]', tag, en); return src; }
  if (m[1] === newOb) return src; // 已同值
  return src.slice(0, idx + m.index) + '"ob":"' + newOb + '"' + src.slice(idx + m.index + m[0].length);
}

// ---------- v2 ----------
let v2src = fs.readFileSync(R('pkg-cat-2/data/data-v2.js'), 'utf8');
let ok2 = 0;
Object.keys(V2).forEach(en => {
  const before = v2src;
  v2src = fixByEn(v2src, en, V2[en], 'v2');
  if (v2src !== before) ok2++;
});
fs.writeFileSync(R('pkg-cat-2/data/data-v2.js'), v2src);
console.log('1) v2 更新', ok2, '/', Object.keys(V2).length);

// ---------- v3 ----------
const v3 = require(R('pkg-cat-3/data/data-v3.js'));
// 开发者物品清单（ob 恰为占位的）
const devEns = v3.filter(e => e.c === '开发者物品' && e.ob === '开启宝藏袋获得').map(e => e.en);
devEns.forEach(en => { if (!(en in V3)) V3[en] = DEV_OB; });
// 大师诱饵特殊：保留匣子文案替换尾巴
let v3src = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');
let ok3 = 0;
Object.keys(V3).forEach(en => {
  const before = v3src;
  v3src = fixByEn(v3src, en, V3[en], 'v3');
  if (v3src !== before) ok3++;
});
// 大师诱饵尾巴替换（旧 ob 非纯占位）
const mbOld = '由 天蓝匣、针叶木匣、荆棘匣 等 25 种来源 掉落；开启宝藏袋获得';
const mbNew = '由 天蓝匣、针叶木匣、荆棘匣 等 25 种来源 掉落；亦可作为渔夫钓鱼任务的随机奖励获得；丛林宝箱怪亦会掉落';
if (v3src.includes(mbOld)) { v3src = v3src.split(mbOld).join(mbNew); ok3++; console.log('  大师诱饵尾巴替换 OK'); }
fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3src);
console.log('2) v3 更新', ok3, '条（含开发者物品', devEns.length, '条）');
