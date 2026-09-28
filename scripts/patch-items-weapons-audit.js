// data/items.js 获取方式修正（详情页数据源，与 v3 图鉴数据对齐，对照官方 wiki 1.4.5.8，2026-09-28）
// 注意：items.js 为 JS 对象字面量风格，键名无引号
const fs = require('fs');
const path = require('path');

// 按 id 锚点在窗口内正则替换 obtain 字段
function patchObtain(src, idAnchor, newVal) {
  const ai = src.indexOf('id:"' + idAnchor + '"');
  if (ai < 0) throw new Error('锚点未找到: ' + idAnchor);
  const win = src.slice(ai, ai + 800);
  const m = win.match(/obtain:"[^"]*"/);
  if (!m) throw new Error('obtain 未找到: ' + idAnchor);
  const at = ai + m.index;
  return src.slice(0, at) + 'obtain:"' + newVal + '"' + src.slice(at + m[0].length);
}

const p = path.join(__dirname, '..', 'data', 'items.js');
let s = fs.readFileSync(p, 'utf8');

// 沙漠虎法杖 / 沙漠猛虎法杖（两条重复条目统一为官方文案）
s = patchObtain(s, 'desert_tiger',
  '地牢的沙漠箱中必定找到（100%）；沙漠箱需在击败世纪之花后用沙漠钥匙开启，钥匙在沙漠生物群系击败敌怪有 1/2500 概率掉落');
s = patchObtain(s, 'desert_tiger_staff',
  '地牢的沙漠箱中必定找到（100%）；沙漠箱需在击败世纪之花后用沙漠钥匙开启，钥匙在沙漠生物群系击败敌怪有 1/2500 概率掉落');
// 冰霜九头蛇法杖（两条；其中一条原为错误的"酒馆老板兑换"）
s = patchObtain(s, 'frost_hydra',
  '地牢的冰雪箱中必定找到（100%）；冰雪箱需在击败世纪之花后用冰冻钥匙开启，钥匙在雪原生物群系击败敌怪有 1/2500 概率掉落');
s = patchObtain(s, 'frost_hydra_staff',
  '地牢的冰雪箱中必定找到（100%）；冰雪箱需在击败世纪之花后用冰冻钥匙开启，钥匙在雪原生物群系击败敌怪有 1/2500 概率掉落');
// 腐化者之戟
s = patchObtain(s, 'scourge_corruptor',
  '地牢的腐化箱中必定找到（100%）；腐化箱需在击败世纪之花后用腐化钥匙开启，钥匙在腐化生物群系击败敌怪有 1/2500 概率掉落');
// 毒液法杖（原"毒液杖"名称错误，应为剧毒法杖）
s = patchObtain(s, 'venom_staff', '秘银/山铜砧：剧毒法杖 + 叶绿锭×14 合成');
// 星云奥秘
s = patchObtain(s, 'nebula_arcanum', '远古操纵机：星云碎片×18 合成');

fs.writeFileSync(p, s);
console.log('items.js 补丁完成');
