const R = (p) => 'D:/小程序库/泰拉瑞亚/' + p;
const fs = require('fs');
let total = 0;

// ============ 1. obt 表四键 ============
let rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
const OBT = {
  'Nazar': '诅咒锤 / 猩红斧 / 诅咒骷髅头 / 附魔剑(怪) / 巨型诅咒骷髅头 掉落（普通约 1%，专家大师约 2%）；微光嬗变：与扩音器互转',
  'Megaphone': '妖精 / 绿水母 / 暗黑木乃伊 / 腐化史莱姆等掉落（普通约 1%，专家大师约 2%）；微光嬗变：与邪眼互转',
  'Blindfold': '腐化史莱姆 / 猩红史莱姆 / 木乃伊 / 小史莱姆 / 恶翅史莱姆 掉落（普通约 1%，专家大师约 2%）；微光嬗变：与袖珍镜互转',
  'Pocket Mirror': '大理石洞蛇发女妖掉落（普通 2.5%，专家大师 5%）；微光嬗变：与蒙眼布互转'
};
Object.keys(OBT).forEach(en => {
  const anchor = '"' + en + '":"';
  const i = rw.indexOf('"obt":{');
  const j = rw.indexOf(anchor, i);
  if (j < 0) { console.log('!! obt 缺键 ' + en); return; }
  const vStart = j + anchor.length;
  const vEnd = rw.indexOf('"', vStart);
  const old = rw.slice(vStart, vEnd);
  rw = rw.slice(0, vStart) + OBT[en] + rw.slice(vEnd);
  total++;
  console.log('[obt ' + en + '] ' + old.slice(0, 30) + ' → ' + OBT[en].slice(0, 40));
});
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), rw);

// ============ 2. 主包 items.js（name:" 锚点） ============
let it = fs.readFileSync(R('data/items.js'), 'utf8');
function fixMain(name, field, nu) {
  const anchor = 'name:"' + name + '"';
  const i = it.indexOf(anchor);
  if (i < 0) { console.log('!! 主包缺 ' + name); return; }
  const segEnd = it.indexOf('},{', i) > 0 ? it.indexOf('},{', i) : it.length;
  const seg = it.slice(i, segEnd);
  const fm = seg.match(new RegExp(field + ':"[^"]*"'));
  if (!fm) { console.log('!! ' + name + ' 无 ' + field + ' 字段'); return; }
  const oldV = fm[0].slice(field.length + 2, -1);
  it = it.slice(0, i) + seg.replace(fm[0], field + ':"' + nu + '"') + it.slice(segEnd);
  total++;
  console.log('[主包 ' + name + '.' + field + '] ' + oldV.slice(0, 36) + ' → ' + nu.slice(0, 40));
}
fixMain('邪眼', 'use', '用于合成反诅咒咒语；可与扩音器在微光中互相转化');
fixMain('邪眼', 'obtain', '诅咒锤 / 猩红斧 / 诅咒骷髅头 / 附魔剑(怪) / 巨型诅咒骷髅头 掉落（普通约 1%，专家大师约 2%）');
fixMain('蒙眼布', 'use', '用于合成反光墨镜；可与袖珍镜在微光中互相转化');
fixMain('蒙眼布', 'obtain', '腐化史莱姆 / 猩红史莱姆 / 木乃伊 / 小史莱姆 / 恶翅史莱姆 掉落（普通约 1%，专家大师约 2%）');
fixMain('袖珍镜', 'use', '用于合成反光墨镜；可与蒙眼布在微光中互相转化');
fixMain('袖珍镜', 'obtain', '大理石洞蛇发女妖掉落（普通 2.5%，专家大师 5%）');
fixMain('反诅咒咒语', 'obtain', '工匠作坊：扩音器 + 邪眼');
fixMain('反光墨镜', 'obtain', '工匠作坊：蒙眼布 + 袖珍镜');
fs.writeFileSync(R('data/items.js'), it);

// ============ 3. v2 六条（"en":" 锚点） ============
let v2 = fs.readFileSync(R('pkg-cat-2/data/data-v2.js'), 'utf8');
function fixV2(en, field, nu) {
  const anchor = '"en":"' + en + '"';
  const i = v2.indexOf(anchor);
  if (i < 0) { console.log('!! v2 缺 ' + en); return; }
  const segEnd = v2.indexOf('},{"n":"', i) > 0 ? v2.indexOf('},{"n":"', i) : v2.length;
  const seg = v2.slice(i, segEnd);
  const fm = seg.match(new RegExp('"' + field + '":"[^"]*"'));
  if (!fm) { console.log('!! v2 ' + en + ' 无 ' + field); return; }
  const oldV = fm[0].slice(field.length + 4, -1);
  v2 = v2.slice(0, i) + seg.replace(fm[0], '"' + field + '":"' + nu + '"') + v2.slice(segEnd);
  total++;
  console.log('[v2 ' + en + '.' + field + '] ' + oldV.slice(0, 36) + ' → ' + nu.slice(0, 40));
}
fixV2('Nazar', 'use', '用于合成反诅咒咒语；可与扩音器在微光中互相转化');
fixV2('Nazar', 'ob', '诅咒锤 / 猩红斧 / 诅咒骷髅头 / 附魔剑(怪) / 巨型诅咒骷髅头 掉落（普通约 1%，专家大师约 2%）');
fixV2('Megaphone', 'use', '用于合成反诅咒咒语；可与邪眼在微光中互相转化');
fixV2('Megaphone', 'ob', '妖精 / 绿水母 / 暗黑木乃伊 / 腐化史莱姆等掉落（普通约 1%，专家大师约 2%）；微光嬗变：与邪眼互转');
fixV2('Blindfold', 'use', '用于合成反光墨镜；可与袖珍镜在微光中互相转化');
fixV2('Blindfold', 'ob', '腐化史莱姆 / 猩红史莱姆 / 木乃伊 / 小史莱姆 / 恶翅史莱姆 掉落（普通约 1%，专家大师约 2%）');
fixV2('Pocket Mirror', 'use', '用于合成反光墨镜；可与蒙眼布在微光中互相转化');
fixV2('Pocket Mirror', 'ob', '大理石洞蛇发女妖掉落（普通 2.5%，专家大师 5%）');
fs.writeFileSync(R('pkg-cat-2/data/data-v2.js'), v2);

// ============ 4. acquisition.js 袖珍镜概率 ============
let acq = fs.readFileSync(R('data/acquisition.js'), 'utf8');
const pmOld = 'pocket_mirror:[{t:"drop",from:"蛇发女妖（大理石洞）",rate:"2%"}]';
if (acq.includes(pmOld)) {
  acq = acq.replace(pmOld, 'pocket_mirror:[{t:"drop",from:"蛇发女妖（大理石洞）",rate:"2.5%（专家大师 5%）"}]');
  total++;
  console.log('[acq 袖珍镜] 2% → 2.5%（专家大师 5%）');
} else console.log('!! acq pocket_mirror 锚点未命中');
fs.writeFileSync(R('data/acquisition.js'), acq);

console.log('\n总修改处数:', total);
