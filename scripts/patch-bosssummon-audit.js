// 召唤物修正：明胶水晶/可疑眼球/丛林蜥蜴电池/史莱姆王冠 + 坐骑召唤物归类统一（官方 wiki 1.4.5.8 核对）
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

function fixByEn(src, en, newOb, tag) {
  const anchor = '"en":"' + en + '"';
  let idx = src.indexOf(anchor);
  if (idx < 0) { console.log('  [MISS] ' + tag); return src; }
  const win = src.slice(idx, idx + 1000);
  const m = win.match(/"ob":"[^"]*"/);
  if (!m) { console.log('  [MISS ob] ' + tag); return src; }
  if (m[0] === '"ob":"' + newOb + '"') { console.log('  [SKIP] ' + tag); return src; }
  src = src.slice(0, idx + m.index) + '"ob":"' + newOb + '"' + src.slice(idx + m.index + m[0].length);
  console.log('  [OK] ' + tag);
  return src;
}

let v3 = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');

v3 = fixByEn(v3, 'Gelatin Crystal', '自然生成于地下神圣之地：水晶碎块生成时有 1/50（2%）概率被它替代，发出粉色光芒且蓝粉循环变色，很容易辨认（1.4.4 起可被金属探测器探测）；打破获得后，在神圣之地内使用即可召唤史莱姆皇后（其他生物群系使用无效且不消耗）', '明胶水晶');
v3 = fixByEn(v3, 'Suspicious Looking Eye', '合成：晶状体×6 @ 恶魔祭坛/猩红祭坛；也有 1/5（20%）概率出现在洞穴地层的常春藤箱、金箱以及地牢上锁金箱中；夜晚使用召唤克苏鲁之眼', '可疑眼球');
v3 = fixByEn(v3, 'Lihzahrd Power Cell', '每个丛林神庙中的丛林蜥蜴箱里必定有一个（100%）；神庙内的丛林蜥蜴和飞蛇也有 1/50（2%）概率掉落；在神庙最终房间的丛林蜥蜴祭坛上使用召唤石巨人（需已击败世纪之花，否则使用无效不消耗）', '丛林蜥蜴电池');
v3 = fixByEn(v3, 'Slime Crown', '合成：凝胶×20 + 金冠（或铂金冠）@ 恶魔祭坛/猩红祭坛；将史莱姆王冠丢入微光会立即触发史莱姆雨事件', '史莱姆王冠');

fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3);

// ---------- 坐骑召唤物归类统一：增益物品 → 坐骑召唤 ----------
console.log('--- 坐骑召唤物归类 ---');
// 官方坐骑物品的 f 集合：MountItem 后缀 + OVERRIDE summon 键 + 鞍/特殊坐骑
const SUMMON_F = new Set([
  'Minecart', 'DiggingMoleMinecart', 'HellMinecart', 'MeowmereMinecart', 'FishMinecart',
  'PartyMinecart', 'PigronMinecart', 'ShroomMinecart', 'SteampunkMinecart',
  'BlessedApple', 'ShrimpyTruffle', 'WitchBroom',
  'SlimySaddle', 'HardySaddle', 'HoneyedGoggles', 'QueenSlimeMountSaddle',
  'SuperheatedBlood', 'EucaluptusSap',
]);
function reclass(src, file) {
  let count = 0;
  const out = src.replace(/("n":"[^"]*","en":"[^"]*","f":"([^"]*)","c":")增益物品(")/g, (full, pre, f, post) => {
    if (/MountItem$/.test(f) || SUMMON_F.has(f)) {
      count++;
      return pre + '坐骑召唤' + post;
    }
    return full;
  });
  console.log('  ' + file + ' 重新归类 ' + count + ' 条 → 坐骑召唤');
  return out;
}
let v2 = fs.readFileSync(R('pkg-cat-2/data/data-v2.js'), 'utf8');
v2 = reclass(v2, 'v2');
v3 = reclass(v3, 'v3');
fs.writeFileSync(R('pkg-cat-2/data/data-v2.js'), v2);
fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3);

// ---------- obt 表同步检查 ----------
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
setObt('Gelatin Crystal', '自然生成于地下神圣之地：水晶碎块生成时有 1/50（2%）概率被它替代，发出粉色光芒且蓝粉循环变色，很容易辨认（1.4.4 起可被金属探测器探测）；打破获得后，在神圣之地内使用即可召唤史莱姆皇后（其他生物群系使用无效且不消耗）');
setObt('Suspicious Looking Eye', '合成：晶状体×6 @ 恶魔祭坛/猩红祭坛；也有 1/5（20%）概率出现在洞穴地层的常春藤箱、金箱以及地牢上锁金箱中；夜晚使用召唤克苏鲁之眼');
setObt('Lihzahrd Power Cell', '每个丛林神庙中的丛林蜥蜴箱里必定有一个（100%）；神庙内的丛林蜥蜴和飞蛇也有 1/50（2%）概率掉落；在神庙最终房间的丛林蜥蜴祭坛上使用召唤石巨人（需已击败世纪之花，否则使用无效不消耗）');
setObt('Slime Crown', '合成：凝胶×20 + 金冠（或铂金冠）@ 恶魔祭坛/猩红祭坛；将史莱姆王冠丢入微光会立即触发史莱姆雨事件');
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), rw);
console.log('完成');
