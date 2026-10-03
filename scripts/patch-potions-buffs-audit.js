// 药水增益分类占位全量修正（57 条，官方 wiki 1.4.5.8 逐条核对）
// v3: 药水配料 9 + 药水 4 + 永久增益 1；v2: 增益物品 43
// 匹配策略：en 优先，中文名 n 兜底
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

// ---------- 修正表 [en, 中文名, 新ob] ----------
const FIX = [
  // ---- 药水配料（v3）----
  ['Blinkroot', '闪耀根', '种植在任意泥土上成熟后收割；自然生成于洞穴地层可采集；也可从植物学家处购买的草药袋中开出；敲碎陶罐也有几率获得'],
  ['Crystal Shard', '水晶碎块', '困难模式下自然生长于地下神圣之地的珍珠岩上，用镐采集获得；也可将水晶种子种在珍珠岩上培育'],
  ['Daybloom', '太阳花', '种植在草地上成熟后收割；自然生成于森林草地可采集；也可从植物学家处购买的草药袋中开出；敲碎陶罐也有几率获得'],
  ['Fallen Star', '坠落之星', '夜晚从天空坠落的坠落之星，直接拾取获得（黎明时未拾取的会消失）'],
  ['Fireblossom', '火焰花', '种植在灰烬块上成熟后收割；自然生成于地狱的灰烬块上可采集；也可从植物学家处购买的草药袋中开出；敲碎陶罐也有几率获得'],
  ['Greater Mana Potion', '强效魔力药水', '由巫师出售（5 银）'],
  ['Lesser Mana Potion', '弱效魔力药水', '由商人出售（1 银）'],
  ['Shiverthorn', '寒颤棘', '种植在雪原的冰雪草上成熟后收割；自然生成于雪原生物群系可采集；也可从植物学家处购买的草药袋中开出；敲碎陶罐也有几率获得'],
  ['Waterleaf', '水叶草', '种植在沙块上成熟后收割（开花结种需要下雨或浸水）；自然生成于沙漠可采集；也可从植物学家处购买的草药袋中开出；敲碎陶罐也有几率获得'],
  // ---- 药水（食物，v3）----
  ['Fries', '炸薯条', '由海洋中的飞鱼掉落（1/50，2%）'],
  ['Grapes', '葡萄', '由跳跳兽和巨型飞狐掉落（1/40，2.5%）'],
  ['Milkshake', '奶昔', '由冰雪人鱼和冰雪陆龟掉落（1/75，1.33%）'],
  ['Steak', '牛排', '由不死矿工掉落（1/10，10%），或由攀爬魔掉落（1/100，1%）'],
  // ---- 永久增益（v3）----
  ['Life Crystal', '生命水晶', '地下地层及以下自然生成（地狱和地牢中不会生成），用镐采集；也可从金匣（1/8，12.5%）或钛金匣（19/160，11.88%）中开出'],
  // ---- 增益物品（v2）----
  ['Amber Mosquito', '蚊子琥珀', '将泥沙、雪泥或沙漠化石放入提炼机提炼获得（泥沙/雪泥 0.01%，沙漠化石 0.027%）'],
  ['Beguiling Lyre', '魅惑里拉琴', '从铁匣（4.8%）或秘银匣（4.72%）中开出'],
  ['Bone Rattle', '骨头拨浪鼓', '由克苏鲁之脑掉落（1/20，5%）；专家模式从克苏鲁之脑的宝藏袋中获得（同率）'],
  ['Carrot', '胡萝卜', '典藏版特典物品，随典藏版游戏赠送（正常游戏无法获得）'],
  ['Chillet', '疾旋鼬', '开启巨型龙蛋获得（50% 几率孵出疾旋鼬）；巨型龙蛋稀有生成于洞穴层（小世界 6 个、中世界 9 个、大世界 12 个）'],
  ['Chillet Ignis', '桃旋鼬', '开启巨型龙蛋获得（50% 几率孵出桃旋鼬）；巨型龙蛋稀有生成于洞穴层'],
  ['Crimson Heart', '猩红之心', '在猩红之地敲碎猩红之心（物块）获得；也可从猩红匣或血匣中开出'],
  ['Dog Whistle', '狗哨', '圣诞节事件期间开启礼物获得（肉前 0.24%，困难模式 0.23%）'],
  ["Eater's Bone", '吞噬怪骨头', '由世界吞噬怪掉落（1/20，5%）；专家模式从世界吞噬怪的宝藏袋中获得（同率）'],
  ['Enchanted Pixie Dust', '附魔妖精尘', '击败任一机械 Boss 后，由妖精掉落（1/200，0.5%）'],
  ['Eucalyptus Sap', '桉树汁', '摇晃森林树时有几率掉落（10.0992%）'],
  ['Eye Bone', '眼骨', '由独眼巨鹿掉落（1/3，33.33%）；专家模式从独眼巨鹿的宝藏袋中获得（同率）'],
  ['Faecorn', '仙灵橡实', '摇晃森林树时有几率掉落（10.0993%）；1.4.5 加入'],
  ['Fish', '鱼', '地下雪原生物群系的冰冻箱中找到，或从冰冻匣、针叶木匣中开出'],
  ['Gelatinous Pillion', '明胶女式鞍', '由史莱姆皇后掉落；专家模式从史莱姆皇后的宝藏袋中获得'],
  ['Hardy Saddle', '硬鞍', '从金匣或钛金匣中开出'],
  ['Honeyed Goggles', '涂蜜护目镜', '由蜂王掉落（1/20，5%）；专家模式从蜂王的宝藏袋中获得（1/9，11.11%）'],
  ['Magic Lantern', '魔法灯笼', '由骷髅商人出售（10 金）'],
  ['Bee Minecart', '蜜蜂矿车', '从地下丛林的常春藤箱中开出'],
  ['Demonic Hellcart', '恶魔地狱矿车', '从地狱的暗影箱中开出，或从熔岩钓鱼的狱石匣、黑曜石匣中获得'],
  ['Desert Minecart', '沙漠矿车', '从地下沙漠的沙岩箱中开出'],
  ['Ladybug Minecart', '瓢虫矿车', '从地下丛林的森林树箱中开出'],
  ['Shroom Minecart', '蘑菇矿车', '从发光蘑菇生物群系的蘑菇箱中开出'],
  ['Sunflower Minecart', '向日葵矿车', '从地下丛林的森林树箱中开出'],
  ['Moon Charm', '月光护身符', '由狼人掉落（1/60，1.67%）'],
  ['Nectar', '花蜜', '由蜂王掉落（1/15，6.67%）；专家模式从蜂王的宝藏袋中获得（1/9，11.11%）'],
  ['Ornate Shadow Key', '华丽暗影钥匙', '从地狱的暗影箱中开出（10%），或从熔岩钓鱼的狱石匣、黑曜石匣中获得（各 5%）'],
  ['Seaweed', '海草', '从地下丛林的常春藤箱中开出，或从丛林匣、荆棘匣中获得'],
  ['Seedling', '幼苗', '由世纪之花掉落（1/20，5%）；专家模式从世纪之花的宝藏袋中获得（1/15，6.67%）'],
  ['Shadow Orb', '暗影珠', '在腐化之地敲碎暗影珠（物块）获得；也可从腐化匣或污损匣中开出'],
  ['Shark Bait', '鲨鱼鱼饵', '从水中箱中开出，或从海洋匣、海边匣中获得'],
  ['Shrimpy Truffle', '虾松露', '专家模式从猪龙鱼公爵的宝藏袋中获得（100%）'],
  ['Slice of Cake', '蛋糕块', '派对期间第一个与派对女孩交谈的玩家获得（Celebrationmk10 和 Get fixed boi 世界的开局派对或玩家发起的派对中不会给予）'],
  ['Slice of Hell Cake', '地狱蛋糕块', '从地狱的暗影箱中开出'],
  ['Slimy Saddle', '粘鞍', '由史莱姆王掉落（1/4，25%）；专家模式从史莱姆王的宝藏袋中获得（1/2，50%）'],
  ['Stardrop', '星之果实', '将 Joja 可乐交给树妖净化获得（Joja 可乐可通过钓鱼捞到）'],
  ['Superheated Blood', '过热的血', '从熔岩钓鱼的狱石匣或黑曜石匣中获得（19/100，19%）'],
  ['Unlucky Yarn', '霉运纱线', '万圣节事件期间开启礼袋获得'],
  // 星云强化拾取物（无法作为物品获得）
  ['Damage Booster', '伤害强化焰', '无法作为物品获得：穿着全套星云盔甲攻击敌人时偶尔出现的强化拾取物，拾取给予伤害星云增益（伤害+15%，最多叠加 3 层）'],
  ['Life Booster', '生命强化焰', '无法作为物品获得：穿着全套星云盔甲攻击敌人时偶尔出现的强化拾取物，拾取给予生命星云增益（快速回复生命）'],
  ['Mana Booster', '魔力强化焰', '无法作为物品获得：穿着全套星云盔甲攻击敌人时偶尔出现的强化拾取物，拾取给予魔力星云增益（魔力消耗降低）'],
  // 被诅咒的排笛（en 不确定，双匹配）
  ['Cursed Piper Flute', '被诅咒的排笛', '合成：坚固化石×20 + 琥珀×5 + 坠落之星×5 @ 铁砧/铅砧'],
];

function patchOb(src, en, name, newOb, tag) {
  let ai = src.indexOf('"en":"' + en + '"');
  if (ai < 0 && name) ai = src.indexOf('"n":"' + name + '"');
  if (ai < 0) return { s: src, hit: false };
  const win = src.slice(ai, ai + 1000);
  const m = win.match(/"ob":"[^"]*"/);
  if (!m) return { s: src, hit: false };
  if (m[0] === '"ob":"' + newOb + '"') return { s: src, hit: true };
  return { s: src.slice(0, ai + m.index) + '"ob":"' + newOb + '"' + src.slice(ai + m.index + m[0].length), hit: true };
}

// ---------- 1) v3 ----------
let v3 = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');
let ok3 = 0, miss3 = [];
FIX.forEach(([en, n, ob]) => {
  const r = patchOb(v3, en, n, ob, en);
  v3 = r.s;
  if (r.hit) ok3++; else miss3.push(en + '/' + n);
});
fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3);
console.log('1) v3 更新', ok3, '条；未命中:', miss3.length ? miss3.join('、') : '无');

// ---------- 2) v2 ----------
let v2 = fs.readFileSync(R('pkg-cat-2/data/data-v2.js'), 'utf8');
let ok2 = 0, miss2 = [];
FIX.forEach(([en, n, ob]) => {
  const r = patchOb(v2, en, n, ob, en);
  v2 = r.s;
  if (r.hit) ok2++; else miss2.push(en + '/' + n);
});
fs.writeFileSync(R('pkg-cat-2/data/data-v2.js'), v2);
console.log('2) v2 更新', ok2, '条；未命中:', miss2.length ? miss2.join('、') : '无');

// ---------- 3) obt 表同步（范围限定） ----------
let rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
const obtStart = rw.indexOf('"obt":{');
if (obtStart < 0) throw new Error('obt 表未找到');
let obtOk = 0, obtMiss = [];
FIX.forEach(([en, n, ob]) => {
  const rel = rw.indexOf('"' + en + '":"', obtStart);
  if (rel < 0) { obtMiss.push(en); return; }
  const vs = rel + en.length + 4;
  const ve = rw.indexOf('"', vs);
  if (rw.slice(vs, ve) === ob) return;
  rw = rw.slice(0, vs) + ob + rw.slice(ve);
  obtOk++;
});
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), rw);
console.log('3) obt 同步', obtOk, '键；无键跳过', obtMiss.length, '个');

// ---------- 4) items.js 详情页同步检查 ----------
let it = fs.readFileSync(R('data/items.js'), 'utf8');
let itOk = 0, itMiss = [];
FIX.forEach(([en, n, ob]) => {
  // items.js 用 name 字段（JS 字面量，键可能带引号也可能不带）
  let ni = it.indexOf('name:"' + n + '"');
  if (ni < 0) ni = it.indexOf('name: "' + n + '"');
  if (ni < 0) { itMiss.push(n); return; }
  const win = it.slice(ni, ni + 900);
  const m = win.match(/obtain:"[^"]*"/);
  if (!m) { itMiss.push(n + '(无obtain)'); return; }
  if (m[0] === 'obtain:"' + ob + '"') return;
  it = it.slice(0, ni + m.index) + 'obtain:"' + ob + '"' + it.slice(ni + m.index + m[0].length);
  itOk++;
});
if (itOk > 0) fs.writeFileSync(R('data/items.js'), it);
console.log('4) items.js 同步', itOk, '条；无条目跳过', itMiss.length, '个');
console.log('DONE');
