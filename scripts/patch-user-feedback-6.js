// 用户反馈 6 项修正（对照官方 wiki 1.4.5.8）
// 海神贝壳/琥珀/毁灭者徽章/渔夫三件套/信息三件套 补正；淬毒倒刺、凤凰箭袋经查数据正确不改
const fs = require('fs');
const R = p => 'D:/小程序库/泰拉瑞亚/' + p;

function patchOb(src, anchor, newOb, tag, obKey = '"ob"') {
  const i = src.indexOf(anchor);
  if (i < 0) throw new Error('未找到 anchor: ' + tag);
  const win = src.slice(i, i + 1100);
  const re = new RegExp(obKey + ':"[^"]*"');
  const m = win.match(re);
  if (!m) throw new Error('未找到 ob 字段: ' + tag);
  if (m[0] === obKey + ':"' + newOb + '"') { console.log('  跳过(已新值)', tag); return src; }
  return src.slice(0, i + m.index) + obKey + ':"' + newOb + '"' + src.slice(i + m.index + m[0].length);
}

// ---------- 1. v2：海神贝壳 + 渔夫三件套 ----------
let v2 = fs.readFileSync(R('pkg-cat-2/data/data-v2.js'), 'utf8');
v2 = patchOb(v2, '"en":"Neptune\'s Shell"',
  '困难模式下由日食中的水月怪掉落（经典 1/50，2%；专家 3.96%）；旧版合成配方已于 1.3.0.1 移除',
  "海神贝壳");
const FISH = '完成渔夫钓鱼任务的随机奖励（1/40，2.5%）；三件套（优质钓鱼线/钓具箱/渔夫耳环）可在微光中互相嬗变';
v2 = patchOb(v2, '"en":"High Test Fishing Line"', FISH, '优质钓鱼线');
v2 = patchOb(v2, '"en":"Tackle Box"', FISH, '钓具箱');
v2 = patchOb(v2, '"en":"Angler Earring"', FISH, '渔夫耳环');
fs.writeFileSync(R('pkg-cat-2/data/data-v2.js'), v2);
console.log('1) v2 海神贝壳+渔夫三件套 OK');

// ---------- 2. v3：琥珀 + 信息三件套 ----------
let v3 = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');
v3 = patchOb(v3, '"en":"Amber"',
  '提炼机提炼泥沙、雪泥或沙漠化石获得；晶洞掉落（2/7，28.57%，掉 3~6 个）；砍伐琥珀宝石树；挖掘自然生成于地下沙漠的放置形式；也可将琥珀兔兔/琥珀松鼠丢入微光嬗变获得',
  '琥珀');
const INFO = '完成渔夫钓鱼任务的随机奖励（1/30，3.33%）；三件套（渔民袖珍宝典/天气收音机/六分仪）可在微光中互相嬗变';
v3 = patchOb(v3, '"en":"Fisherman\'s Pocket Guide"', INFO, '渔民袖珍宝典');
v3 = patchOb(v3, '"en":"Sextant"', INFO, '六分仪');
v3 = patchOb(v3, '"en":"Weather Radio"', INFO, '天气收音机');
fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3);
console.log('2) v3 琥珀+信息三件套 OK');

// ---------- 3. obt 源表 7 键同步 ----------
let rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
const OBT = [
  ["Neptune's Shell", '困难模式下由日食中的水月怪掉落（经典 1/50，2%；专家 3.96%）；旧版合成配方已于 1.3.0.1 移除'],
  ['Amber', '提炼机提炼泥沙、雪泥或沙漠化石获得；晶洞掉落（2/7，28.57%，掉 3~6 个）；砍伐琥珀宝石树；挖掘自然生成于地下沙漠的放置形式；也可将琥珀兔兔/琥珀松鼠丢入微光嬗变获得'],
  ['High Test Fishing Line', '完成渔夫钓鱼任务的随机奖励（1/40，2.5%）；三件套（优质钓鱼线/钓具箱/渔夫耳环）可在微光中互相嬗变'],
  ['Tackle Box', '完成渔夫钓鱼任务的随机奖励（1/40，2.5%）；三件套（优质钓鱼线/钓具箱/渔夫耳环）可在微光中互相嬗变'],
  ['Angler Earring', '完成渔夫钓鱼任务的随机奖励（1/40，2.5%）；三件套（优质钓鱼线/钓具箱/渔夫耳环）可在微光中互相嬗变'],
  ["Fisherman's Pocket Guide", '完成渔夫钓鱼任务的随机奖励（1/30，3.33%）；三件套（渔民袖珍宝典/天气收音机/六分仪）可在微光中互相嬗变'],
  ['Sextant', '完成渔夫钓鱼任务的随机奖励（1/30，3.33%）；三件套（渔民袖珍宝典/天气收音机/六分仪）可在微光中互相嬗变'],
  ['Weather Radio', '完成渔夫钓鱼任务的随机奖励（1/30，3.33%）；三件套（渔民袖珍宝典/天气收音机/六分仪）可在微光中互相嬗变'],
];
let ok = 0;
OBT.forEach(([en, ob]) => {
  const re = new RegExp('"' + en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '":"[^"]*"');
  const m = rw.match(re);
  if (!m) { console.log('  obt 无键跳过:', en); return; }
  rw = rw.replace(m[0], '"' + en + '":"' + ob + '"');
  ok++;
});
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), rw);
console.log('3) obt 同步', ok, '键 OK');

// ---------- 4. items.js：海神贝壳/琥珀/毁灭者徽章 ----------
let it = fs.readFileSync(R('data/items.js'), 'utf8');
it = patchOb(it, 'name:"海神贝壳"',
  '困难模式下由日食中的水月怪掉落（经典 1/50，2%；专家 3.96%）；旧版合成配方已于 1.3.0.1 移除',
  '海神贝壳', 'obtain');
it = patchOb(it, 'name:"琥珀"',
  '提炼机提炼泥沙、雪泥或沙漠化石获得；晶洞掉落（2/7，28.57%）；砍伐琥珀宝石树；挖掘地下沙漠自然生成的放置形式；琥珀兔兔/琥珀松鼠可微光嬗变回琥珀',
  '琥珀', 'obtain');
it = patchOb(it, 'name:"毁灭者徽章"',
  '工匠作坊：复仇者徽章+石巨人之眼（石巨人后）',
  '毁灭者徽章', 'obtain');
fs.writeFileSync(R('data/items.js'), it);
console.log('4) items.js 3 条 OK');

console.log('全部补丁执行完成');
