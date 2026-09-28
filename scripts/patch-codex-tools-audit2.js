// 图鉴·工具分类数据修正第二批（对照官方 wiki 1.4.5.8，2026-09-28）
// 修正：熔岩吸收绵获得方式、负重石/非负重石获得方式与描述
const fs = require('fs');
const path = require('path');

// 窗口内按 en 锚点替换字段值（正则匹配到下一个英文双引号前）
function patchField(src, enAnchor, field, newVal) {
  const ai = src.indexOf('"en":"' + enAnchor + '"');
  if (ai < 0) throw new Error('锚点未找到: ' + enAnchor);
  const winLen = 500;
  const win = src.slice(ai, ai + winLen);
  const re = new RegExp('"' + field + '":"[^"]*"');
  const m = win.match(re);
  if (!m) throw new Error('字段未找到: ' + enAnchor + ' -> ' + field);
  const at = ai + m.index;
  return src.slice(0, at) + '"' + field + '":"' + newVal + '"' + src.slice(at + m[0].length);
}

function patchRaw(src, oldVal, newVal) {
  if (src.indexOf(oldVal) < 0) throw new Error('原文未找到: ' + oldVal);
  return src.replace(oldVal, newVal);
}

// ---------- 1. pkg-recipe/data/recipes-wiki.js（获取方式源表） ----------
const rwPath = path.join(__dirname, '..', 'pkg-recipe', 'data', 'recipes-wiki.js');
let rw = fs.readFileSync(rwPath, 'utf8');
rw = patchRaw(rw,
  '"Lava Absorbant Sponge":"可于世界中探索、击败敌怪或参与事件获得"',
  '"Lava Absorbant Sponge":"在熔岩中钓鱼时作为稀有钓获获得","Encumbering Stone":"地下沙漠的沙岩箱中找到（1/7，14.29%）","Uncumbering Stone":"由负重石切换而来：对物品栏中的负重石按打开/激活键切换形态；负重石来自地下沙漠的沙岩箱（14.29%）"'
);
fs.writeFileSync(rwPath, rw);
console.log('recipes-wiki.js OK');

// ---------- 2. pkg-cat-2/data/data-v2.js（图鉴条目展示源） ----------
const v2Path = path.join(__dirname, '..', 'pkg-cat-2', 'data', 'data-v2.js');
let v2 = fs.readFileSync(v2Path, 'utf8');

// 熔岩吸收绵：获得方式
v2 = patchField(v2, 'Lava Absorbant Sponge', 'ob', '在熔岩中钓鱼时作为稀有钓获获得');
// 负重石：获得方式 + 描述
v2 = patchField(v2, 'Encumbering Stone', 'ob', '地下沙漠的沙岩箱中找到（1/7，14.29%）');
v2 = patchField(v2, 'Encumbering Stone', 't',
  '放在物品栏中会阻止玩家拾取任何物品栏物品（钓鱼收获、心和星星、NPC 直接给予的物品除外），适合刷事件或挖地狱电梯时使用。1.4.4 起对它按打开/激活键可切换为非负重石，暂停阻止效果。');
// 非负重石：获得方式 + 描述
v2 = patchField(v2, 'Uncumbering Stone', 'ob',
  '由负重石切换而来：对物品栏中的负重石按打开/激活键切换形态；负重石来自地下沙漠的沙岩箱（14.29%）');
v2 = patchField(v2, 'Uncumbering Stone', 't',
  '负重石的切换形态，放在物品栏中不会阻止拾取物品。对它按打开/激活键可切回负重石。');
fs.writeFileSync(v2Path, v2);
console.log('data-v2.js OK');
console.log('全部补丁完成');
