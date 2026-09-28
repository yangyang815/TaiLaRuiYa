// 图鉴·工具分类数据修正（对照官方 wiki 1.4.5.8，2026-09-28）
// 修正：魔法海螺获得方式、占卜球配方数量、蠕虫钩/肌腱钩宝箱怪来源细化、幸运四叶草获得方式与用途
const fs = require('fs');
const path = require('path');

function patchEntry(src, enAnchor, oldVal, newVal, windowLen) {
  const ai = src.indexOf('"en":"' + enAnchor + '"');
  if (ai < 0) throw new Error('锚点未找到: ' + enAnchor);
  const win = src.slice(ai, ai + (windowLen || 400));
  const oi = win.indexOf(oldVal);
  if (oi < 0) throw new Error('字段未找到: ' + enAnchor + ' -> ' + oldVal);
  const at = ai + oi;
  return src.slice(0, at) + newVal + src.slice(at + oldVal.length);
}

function patchRaw(src, oldVal, newVal) {
  if (src.indexOf(oldVal) < 0) throw new Error('原文未找到: ' + oldVal);
  return src.replace(oldVal, newVal);
}

// ---------- 1. pkg-recipe/data/recipes-wiki.js（获取方式源表） ----------
const rwPath = path.join(__dirname, '..', 'pkg-recipe', 'data', 'recipes-wiki.js');
let rw = fs.readFileSync(rwPath, 'utf8');
const rwBefore = rw.length;

rw = patchRaw(rw,
  '"Magic Conch":"开启宝藏袋获得"',
  '"Magic Conch":"地下沙漠的沙岩箱中有 25% 概率找到，或钓鱼开绿洲匣、幻象匣各以 12.5% 概率获得","Worm Hook":"困难模式下由腐化宝箱怪掉落（20%）","Tendon Hook":"困难模式下由猩红宝箱怪掉落（20%）"'
);
rw = patchRaw(rw, '"Scrying Orb":"合成：任意魔镜 + 晶状体 + 虫洞药水 @ 工作台"',
  '"Scrying Orb":"合成：任意魔镜 + 晶状体×2 + 虫洞药水×4 @ 工作台"');
rw = patchRaw(rw, '"Lucky Clover":"可于世界中探索、击败敌怪或参与事件获得"',
  '"Lucky Clover":"破坏高茎草植物（非花）时每格有 0.1% 概率掉落；放在物品栏中提供 +0.03 运气"');
rw = patchRaw(rw, '"Wilted Clover":"合成：幸运四叶草 @ 微光"',
  '"Wilted Clover":"微光嬗变：将幸运四叶草丢入微光获得；放在物品栏中降低 0.1 运气"');
rw = patchRaw(rw, '"Any Magic Mirror":"Any Magic Mirror"', '"Any Magic Mirror":"任意魔镜"');
fs.writeFileSync(rwPath, rw);
console.log('recipes-wiki.js OK (len', rwBefore, '->', rw.length + ')');

// ---------- 2. pkg-cat-2/data/data-v2.js（图鉴条目展示源） ----------
const v2Path = path.join(__dirname, '..', 'pkg-cat-2', 'data', 'data-v2.js');
let v2 = fs.readFileSync(v2Path, 'utf8');
const v2Before = v2.length;

// 魔法海螺
v2 = patchEntry(v2, 'Magic Conch', '"ob":"开启宝藏袋获得"',
  '"ob":"地下沙漠的沙岩箱中有 25% 概率找到，或钓鱼开绿洲匣、幻象匣各以 12.5% 概率获得"');
// 占卜球：配方数量 + 补描述
v2 = patchEntry(v2, 'Scrying Orb', '"ob":"合成：任意魔镜 + 晶状体 + 虫洞药水 @ 工作台"',
  '"ob":"合成：任意魔镜 + 晶状体×2 + 虫洞药水×4 @ 工作台"');
v2 = patchEntry(v2, 'Scrying Orb', '"t":"","b":""',
  '"t":"占卜球是一种允许玩家以其他玩家的视角观察世界的物品（多人模式）。","b":""');
// 幸运四叶草：获得方式 + 用途 + 补描述
v2 = patchEntry(v2, 'Lucky Clover', '"ob":"可于世界中探索、击败敌怪或参与事件获得"',
  '"ob":"破坏高茎草植物（非花）时每格有 0.1% 概率掉落；放在物品栏中提供 +0.03 运气"');
v2 = patchEntry(v2, 'Lucky Clover', '"use":"可用于合成：枯萎四叶草"',
  '"use":"微光嬗变：丢入微光可嬗变为枯萎四叶草；放在物品栏提供 +0.03 运气（多个不叠加）"');
v2 = patchEntry(v2, 'Lucky Clover', '"t":"","b":""', '"t":"魔法般美味！请勿食用。","b":""');
// 枯萎四叶草：获得方式 + 补描述
v2 = patchEntry(v2, 'Wilted Clover', '"ob":"合成：幸运四叶草 @ 微光"',
  '"ob":"微光嬗变：将幸运四叶草丢入微光获得；放在物品栏中降低 0.1 运气"');
v2 = patchEntry(v2, 'Wilted Clover', '"t":"","b":""',
  '"t":"用微光浇灌这个幸运符可能不是最好的主意……","b":""');
// 蠕虫钩 / 肌腱钩：宝箱怪来源细化
v2 = patchEntry(v2, 'Worm Hook', '"ob":"由 宝箱怪 掉落"',
  '"ob":"困难模式下由腐化宝箱怪掉落（20%）"');
v2 = patchEntry(v2, 'Tendon Hook', '"ob":"由 宝箱怪 掉落"',
  '"ob":"困难模式下由猩红宝箱怪掉落（20%）"');
fs.writeFileSync(v2Path, v2);
console.log('data-v2.js OK (len', v2Before, '->', v2.length + ')');
console.log('全部补丁完成');
