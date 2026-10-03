// 用户反馈批次：太空枪配方 / 组织样本 / 暗影鳞片 / 材料分类占位 / 11 套盔甲 df 乱码
// 官方 wiki 1.4.5.8 核对
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

// ---------- 工具 ----------
function patchOb(src, en, newOb, tag) {
  const ai = src.indexOf('"en":"' + en + '"');
  if (ai < 0) { console.log('  跳过(未找到 en):', tag || en); return { s: src, hit: false }; }
  const win = src.slice(ai, ai + 900);
  const m = win.match(/"ob":"[^"]*"/);
  if (!m) { console.log('  跳过(ob 未匹配):', tag || en); return { s: src, hit: false }; }
  if (m[0] === '"ob":"' + newOb + '"') return { s: src, hit: true };
  return { s: src.slice(0, ai + m.index) + '"ob":"' + newOb + '"' + src.slice(ai + m.index + m[0].length), hit: true };
}
function patchDf(src, en, newDf, tag) {
  const ai = src.indexOf('"en":"' + en + '"');
  if (ai < 0) { console.log('  跳过(未找到 en):', tag || en); return { s: src, hit: false }; }
  const win = src.slice(ai, ai + 1400);
  const m = win.match(/"df":"[^"]*"/);
  if (!m) { console.log('  跳过(df 未匹配):', tag || en); return { s: src, hit: false }; }
  if (m[0] === '"df":"' + newDf + '"') return { s: src, hit: true };
  return { s: src.slice(0, ai + m.index) + '"df":"' + newDf + '"' + src.slice(ai + m.index + m[0].length), hit: true };
}

// ---------- 新文案 ----------
const FIX_V3 = [
  // 用户点名
  ['Space Gun', '合成：陨石锭×20 @ 铁砧/铅砧'],
  ['Tissue Sample', '由飞眼怪掉落（经典 2–5 个 / 66.67%，专家 1–3 个 / 66.67%，大师 1–2 个 / 50%）；专家模式从克苏鲁之脑的宝藏袋中获得（20–40 个）；叶绿提炼机可将暗影鳞片转化为组织样本'],
  ['Shadow Scale', '由世界吞噬怪掉落（击败部位获得）；专家模式从世界吞噬怪的宝藏袋中获得；叶绿提炼机可将组织样本转化为暗影鳞片'],
  // 掉落/容器类（删"开启宝藏袋"错误尾巴，补官方概率）
  ['Bee Wax', '由蜂王掉落（16–26 个，100%）；专家模式从蜂王的宝藏袋中获得（17–29 个）'],
  ['Beetle Husk', '由石巨人掉落（4–8 个，100%）；专家模式从石巨人的宝藏袋中获得（18–23 个）'],
  ['Cursed Flame', '困难模式由腐化之地的吞世怪、腐恶食尸鬼、爬藤怪掉落；也可从钓鱼获得的污损匣中开出'],
  ['Ichor', '困难模式由地下猩红之地的灵液黏黏怪掉落（2–5 个，100%）、猩红地下沙漠的红染食尸鬼掉落（1–3 个，33.3%）；也可从钓鱼获得的血匣中开出（2–5 个，50%）'],
  ['Solar Tablet Fragment', '丛林蜥蜴箱中找到（3–7 个，80%）；或由丛林蜥蜴、飞蛇掉落（1–2 个，14.29%）'],
  // 珍珠（原"开启宝藏袋获得"错误，实为牡蛣）
  ['White Pearl', '打开牡蛣获得（15%）；用于制作弱效幸运药水'],
  ['Black Pearl', '打开牡蛣获得（7.5%）；用于制作幸运药水'],
  ['Pink Pearl', '打开牡蛣获得（2.5%）；用于制作强效幸运药水，或丢入微光嬗变为星系珍珠'],
  // 小动物组（虫网捕捉）
  ['Bird', '使用虫网捕捉获得（森林自然生成的小动物），可用作鱼饵或制成展示笼'],
  ['Blue Jay', '使用虫网捕捉获得（森林自然生成的小动物），可用作鱼饵或制成展示笼'],
  ['Cardinal', '使用虫网捕捉获得（森林自然生成的小动物），可用作鱼饵或制成展示笼'],
  ['Bunny', '使用虫网捕捉获得（森林自然生成的小动物），可用作鱼饵或制成展示笼'],
  ['Duck', '使用虫网捕捉获得（自然生成于水边的小动物），可用作鱼饵或制成展示笼'],
  ['Mallard Duck', '使用虫网捕捉获得（自然生成于水边的小动物），可用作鱼饵或制成展示笼'],
  ['Frog', '使用虫网捕捉获得（自然生成于水边的小动物），可用作鱼饵或制成展示笼'],
  ['Goldfish', '使用虫网捕捉获得（自然生成于水中、雨中也会行走的小动物），可用作鱼饵或制成展示笼'],
  ['Mouse', '使用虫网捕捉获得（地下自然生成的小动物），可用作鱼饵或制成展示笼'],
  ['Owl', '使用虫网捕捉获得（森林自然生成的小动物），可用作鱼饵或制成展示笼'],
  ['Penguin', '使用虫网捕捉获得（雪原生物群系生成的小动物），可用作鱼饵或制成展示笼'],
  ['Rat', '使用虫网捕捉获得（地下自然生成的小动物），可用作鱼饵或制成展示笼'],
  ['Seagull', '使用虫网捕捉获得（海洋自然生成的小动物），可用作鱼饵或制成展示笼'],
  ['Seahorse', '使用虫网捕捉获得（海洋水中生成的小动物），可用作鱼饵或制成展示笼'],
  ['Squirrel', '使用虫网捕捉获得（森林自然生成的小动物），可用作鱼饵或制成展示笼'],
  ['Red Squirrel', '使用虫网捕捉获得（森林自然生成的小动物），可用作鱼饵或制成展示笼'],
  ['Turtle', '使用虫网捕捉获得（丛林水陆两栖小动物），可用作鱼饵或制成展示笼'],
  ['Toucan', '使用虫网捕捉获得（丛林自然生成的小动物），可用作鱼饵或制成展示笼'],
  ['Grebe', '使用虫网捕捉获得（海洋水鸟小动物），可用作鱼饵或制成展示笼'],
  ['Pufferfish', '使用虫网捕捉获得（海洋自然生成的小动物），可用作鱼饵或制成展示笼'],
  ['Pupfish', '使用虫网捕捉获得（沙漠绿洲水域生成的小动物），可用作鱼饵或制成展示笼'],
  ['Blue Macaw', '使用虫网捕捉获得（丛林自然生成的小动物），可用作鱼饵或制成展示笼'],
  ['Scarlet Macaw', '使用虫网捕捉获得（丛林自然生成的小动物），可用作鱼饵或制成展示笼'],
  ['Gray Cockatiel', '使用虫网捕捉获得（沙漠自然生成的小动物），可用作鱼饵或制成展示笼'],
  ['Yellow Cockatiel', '使用虫网捕捉获得（沙漠自然生成的小动物），可用作鱼饵或制成展示笼'],
  ['Blue Fairy', '使用虫网捕捉获得（夜晚自然生成的发光仙灵小动物），可用作鱼饵或制成展示笼'],
  ['Green Fairy', '使用虫网捕捉获得（夜晚自然生成的发光仙灵小动物），可用作鱼饵或制成展示笼'],
  ['Pink Fairy', '使用虫网捕捉获得（夜晚自然生成的发光仙灵小动物），可用作鱼饵或制成展示笼'],
  ['Faeling', '使用虫网捕捉获得（微光湖附近生成的发光小仙灵），可用作鱼饵或制成展示笼'],
  ['Digtoise', '使用虫网捕捉获得（沙漠自然生成的碎岩龟小动物），可用作鱼饵或制成展示笼'],
  ['Jungle Turtle', '使用虫网捕捉获得（丛林自然生成的丛林龟小动物），可用作鱼饵或制成展示笼'],
  // 金变体（0.25%）
  ['Gold Bird', '使用虫网捕捉获得的稀有金变种：以 1/400 (0.25%) 概率取代普通版生成，会发出闪烁特效，可用生命体分析机探测；每只可卖 10 金'],
  ['Gold Bunny', '使用虫网捕捉获得的稀有金变种：以 1/400 (0.25%) 概率取代普通版生成，会发出闪烁特效，可用生命体分析机探测；每只可卖 10 金'],
  ['Gold Frog', '使用虫网捕捉获得的稀有金变种：以 1/400 (0.25%) 概率取代普通版生成，会发出闪烁特效，可用生命体分析机探测；每只可卖 10 金'],
  ['Gold Goldfish', '使用虫网捕捉获得的稀有金变种：以 1/400 (0.25%) 概率取代普通版生成，会发出闪烁特效，可用生命体分析机探测；每只可卖 10 金'],
  ['Gold Mouse', '使用虫网捕捉获得的稀有金变种：以 1/400 (0.25%) 概率取代普通版生成，会发出闪烁特效，可用生命体分析机探测；每只可卖 10 金'],
  ['Gold Seahorse', '使用虫网捕捉获得的稀有金变种：以 1/400 (0.25%) 概率取代普通版生成，会发出闪烁特效，可用生命体分析机探测；每只可卖 10 金'],
  ['Gold Squirrel', '使用虫网捕捉获得的稀有金变种：以 1/400 (0.25%) 概率取代普通版生成，会发出闪烁特效，可用生命体分析机探测；每只可卖 10 金'],
  // 宝石兔兔（洞穴城镇附近）
  ['Amber Bunny', '使用虫网捕捉获得：宝石兔兔在洞穴地层的城镇附近生成，为宝石色的稀有变种'],
  ['Amethyst Bunny', '使用虫网捕捉获得：宝石兔兔在洞穴地层的城镇附近生成，为宝石色的稀有变种'],
  ['Diamond Bunny', '使用虫网捕捉获得：宝石兔兔在洞穴地层的城镇附近生成，为宝石色的稀有变种'],
  ['Emerald Bunny', '使用虫网捕捉获得：宝石兔兔在洞穴地层的城镇附近生成，为宝石色的稀有变种'],
  ['Ruby Bunny', '使用虫网捕捉获得：宝石兔兔在洞穴地层的城镇附近生成，为宝石色的稀有变种'],
  ['Sapphire Bunny', '使用虫网捕捉获得：宝石兔兔在洞穴地层的城镇附近生成，为宝石色的稀有变种'],
  ['Topaz Bunny', '使用虫网捕捉获得：宝石兔兔在洞穴地层的城镇附近生成，为宝石色的稀有变种'],
  ['Amber Squirrel', '使用虫网捕捉获得：宝石松鼠在洞穴地层的城镇附近生成，为宝石色的稀有变种'],
  ['Amethyst Squirrel', '使用虫网捕捉获得：宝石松鼠在洞穴地层的城镇附近生成，为宝石色的稀有变种'],
  ['Diamond Squirrel', '使用虫网捕捉获得：宝石松鼠在洞穴地层的城镇附近生成，为宝石色的稀有变种'],
  ['Emerald Squirrel', '使用虫网捕捉获得：宝石松鼠在洞穴地层的城镇附近生成，为宝石色的稀有变种'],
  ['Ruby Squirrel', '使用虫网捕捉获得：宝石松鼠在洞穴地层的城镇附近生成，为宝石色的稀有变种'],
  ['Sapphire Squirrel', '使用虫网捕捉获得：宝石松鼠在洞穴地层的城镇附近生成，为宝石色的稀有变种'],
  ['Topaz Squirrel', '使用虫网捕捉获得：宝石松鼠在洞穴地层的城镇附近生成，为宝石色的稀有变种'],
  // 停用版统一
  ["Chippy's Cloak (Inactive)", '由激活版物品右键切换而来（非独立获得）'],
  ["Heroicis' Wings (Inactive)", '由激活版物品右键切换而来（非独立获得）'],
];

// ---------- 1) v3 ob 更新 ----------
let v3 = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');
let ok = 0, miss = 0;
FIX_V3.forEach(([en, ob]) => {
  const r = patchOb(v3, en, ob, en);
  v3 = r.s;
  if (r.hit) ok++; else miss++;
});
fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3);
console.log('1) v3 ob 更新', ok, '条，未命中', miss, '条');

// ---------- 2) v2 盔甲 df 乱码清理 ----------
const ARMOR_DF = [
  ['Ancient Hallowed armor', '面具 50 / 头盔 35 / 头饰 31 / 兜帽 27（随所选头盔）'],
  ['Hallowed armor', '面具 50 / 头盔 35 / 头饰 31 / 兜帽 27（随所选头盔）'],
  ['Chlorophyte armor', '面具 51 / 头盔 44 / 头饰 38 / 面罩 33（随所选头盔）'],
  ['Beetle armor', '铠甲版 61 / 壳版 73（随所选胸甲）'],
  ['Adamantite armor', '近战 50 / 远程 36 / 魔法 32（随所选头盔）'],
  ['Cobalt armor', '近战 32 / 远程 23 / 魔法 21（随所选头盔）'],
  ['Mythril armor', '近战 37 / 远程 27 / 魔法 24（随所选头盔）'],
  ['Orichalcum armor', '近战 42 / 远程 30 / 魔法 27（随所选头盔）'],
  ['Palladium armor', '近战 32 / 远程 23 / 魔法 21（随所选头盔）'],
  ['Titanium armor', '近战 49 / 远程 34 / 魔法 30（随所选头盔）'],
  ['Spectre armor', '面具版 42 / 兜帽版 30（随所选头盔）'],
];
let v2 = fs.readFileSync(R('pkg-cat-2/data/data-v2.js'), 'utf8');
ok = 0; miss = 0;
ARMOR_DF.forEach(([en, df]) => {
  const r = patchDf(v2, en, df, en);
  v2 = r.s;
  if (r.hit) ok++; else miss++;
});
fs.writeFileSync(R('pkg-cat-2/data/data-v2.js'), v2);
console.log('2) v2 df 更新', ok, '条，未命中', miss, '条');

// ---------- 3) obt 表同步（范围限定） ----------
const OBT_SYNC = [
  ['Space Gun', '合成：陨石锭×20 @ 铁砧/铅砧'],
  ['Tissue Sample', '由飞眼怪掉落（经典 2–5 个 / 66.67%，专家 1–3 个 / 66.67%，大师 1–2 个 / 50%）；专家模式从克苏鲁之脑的宝藏袋中获得（20–40 个）；叶绿提炼机可将暗影鳞片转化为组织样本'],
  ['Shadow Scale', '由世界吞噬怪掉落（击败部位获得）；专家模式从世界吞噬怪的宝藏袋中获得；叶绿提炼机可将组织样本转化为暗影鳞片'],
  ['Bee Wax', '由蜂王掉落（16–26 个，100%）；专家模式从蜂王的宝藏袋中获得（17–29 个）'],
  ['Beetle Husk', '由石巨人掉落（4–8 个，100%）；专家模式从石巨人的宝藏袋中获得（18–23 个）'],
  ['Cursed Flame', '困难模式由腐化之地的吞世怪、腐恶食尸鬼、爬藤怪掉落；也可从钓鱼获得的污损匣中开出'],
  ['Ichor', '困难模式由地下猩红之地的灵液黏黏怪掉落（2–5 个，100%）、猩红地下沙漠的红染食尸鬼掉落（1–3 个，33.3%）；也可从钓鱼获得的血匣中开出（2–5 个，50%）'],
  ['Solar Tablet Fragment', '丛林蜥蜴箱中找到（3–7 个，80%）；或由丛林蜥蜴、飞蛇掉落（1–2 个，14.29%）'],
  ['White Pearl', '打开牡蛣获得（15%）；用于制作弱效幸运药水'],
  ['Black Pearl', '打开牡蛣获得（7.5%）；用于制作幸运药水'],
  ['Pink Pearl', '打开牡蛣获得（2.5%）；用于制作强效幸运药水，或丢入微光嬗变为星系珍珠'],
];
let rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
const obtStart = rw.indexOf('"obt":{');
if (obtStart < 0) throw new Error('obt 表未找到');
let obtOk = 0, obtMiss = 0;
OBT_SYNC.forEach(([en, ob]) => {
  const rel = rw.indexOf('"' + en + '":"', obtStart);
  if (rel < 0) { obtMiss++; console.log('  obt 无键:', en); return; }
  const vs = rel + en.length + 4;
  const ve = rw.indexOf('"', vs);
  if (rw.slice(vs, ve) === ob) return;
  rw = rw.slice(0, vs) + ob + rw.slice(ve);
  obtOk++;
});
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), rw);
console.log('3) obt 表同步', obtOk, '键，无键', obtMiss, '键');
console.log('DONE');
