// 图鉴召唤相关分类占位修正 7 条（官方 wiki 1.4.5.8 核对）
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

function fixByEn(src, en, newOb, tag) {
  const anchor = '"en":"' + en + '"';
  let idx = -1, count = 0, changed = 0, skipped = 0;
  while ((idx = src.indexOf(anchor, idx + 1)) >= 0) {
    count++;
    const win = src.slice(idx, idx + 900);
    const m = win.match(/"ob":"[^"]*"/);
    if (!m) continue;
    if (m[0] === '"ob":"' + newOb + '"') { skipped++; continue; }
    src = src.slice(0, idx + m.index) + '"ob":"' + newOb + '"' + src.slice(idx + m.index + m[0].length);
    changed++;
  }
  if (!count) console.log('  [MISS] ' + tag);
  else if (changed) console.log('  [OK] ' + tag + ' 更新 ' + changed + '/' + count + ' 处');
  else console.log('  [SKIP] ' + tag + ' 已是新值');
  return src;
}

let v3 = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');

v3 = fixByEn(v3, 'Prismatic Lacewing', '击败世纪之花后，于黄昏至午夜（下午 7:30–凌晨 12:00）在神圣之地地表自然生成的小动物，用任意虫网捕捉后可保存或释放；杀死它（需玩家造成伤害）即可召唤光之女皇，在神圣之地外释放会迅速消失', '七彩草蛉');
v3 = fixByEn(v3, 'Truffle Worm', '困难模式期间自然生成于地下（洞穴层及以下）的发光蘑菇生物群系，用任意虫网捕捉（玩家靠近约 1 秒它就会挖洞溜走）；作为鱼饵在海洋中钓鱼即可召唤猪龙鱼公爵（必定消耗）', '松露虫');
v3 = fixByEn(v3, 'Bloody Tear', '由血月期间的非雕像敌怪掉落：血腥僵尸和滴滴怪 1/100（1%）、血鳗鱼/血浆哥布林鲨鱼/游荡眼球怪鱼/僵尸人鱼 1/25（4%）、小丑 1/10（10%）、僵尸新郎和僵尸新娘 1/5（20%，墓地中生成的任何时间都会掉）；恐惧鹦鹉螺掉落 1/2（50%，专家 100%）且不限血月；夜晚使用召唤血月', '血泪');
v3 = fixByEn(v3, 'Pirate Map', '困难模式下由地表海洋生物群系中的大部分敌怪掉落（1/100，1%，雕像生成的敌怪不掉）；鸟妖和飞龙也会掉落；使用后召唤海盗入侵（需玩家最大生命达到 200）', '海盗地图');
v3 = fixByEn(v3, 'Snow Globe', '圣诞节期间开启礼物获得：必须在困难模式世界中打开礼物才有 1/15（6.67%）概率开出；使用后召唤雪人军团（需玩家最大生命达到 200）', '水晶雪球');
v3 = fixByEn(v3, 'Closed Void Bag', '由虚空袋切换而来：对物品栏中的虚空袋按打开/激活键即可在开启/闭合形态间切换；虚空袋配方为骨头×30 + 丛林孢子×15 + 暗影鳞片（腐化世界）或组织样本×30（猩红世界）@ 恶魔祭坛/猩红祭坛', '闭合的虚空袋');
v3 = fixByEn(v3, 'Mechanical Cart', '使用矿车升级包获得（专家模式独有物品），矿车升级包由火星暴乱事件中的火星飞碟掉落（专家模式）；旧版合成配方（矿车+机械车轮片+机械电池片）已随 1.4.4 移除', '机械矿车');

fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3);

// obt 表同步（范围限定）
let rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
const os = rw.indexOf('"obt":{');
function setObt(en, newOb) {
  const ki = rw.indexOf('"' + en + '":"', os);
  if (ki < 0) { console.log('  [obt MISS] ' + en); return; }
  const vs = ki + en.length + 4, ve = rw.indexOf('"', vs);
  if (rw.slice(vs, ve) === newOb) { console.log('  [obt SKIP] ' + en); return; }
  rw = rw.slice(0, vs) + newOb + rw.slice(ve);
  console.log('  [obt OK] ' + en);
}
setObt('Prismatic Lacewing', '击败世纪之花后，于黄昏至午夜（下午 7:30–凌晨 12:00）在神圣之地地表自然生成的小动物，用任意虫网捕捉后可保存或释放；杀死它（需玩家造成伤害）即可召唤光之女皇，在神圣之地外释放会迅速消失');
setObt('Truffle Worm', '困难模式期间自然生成于地下（洞穴层及以下）的发光蘑菇生物群系，用任意虫网捕捉（玩家靠近约 1 秒它就会挖洞溜走）；作为鱼饵在海洋中钓鱼即可召唤猪龙鱼公爵（必定消耗）');
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), rw);
console.log('完成');
