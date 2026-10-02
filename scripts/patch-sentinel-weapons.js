// 哨兵召唤武器 12 件 + 冰川之牙 获取方式修正（官方 wiki 1.4.5.8 核对）
// v3 ob 字段 + obt 表同步（范围限定替换，防 zh 表误伤）
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

// ---------- 新文案 ----------
// 冰川之牙（Glacier Fang, 1.4.5.7）
const glacierFang = '冰雪生物群系的冰冻箱中找到（14.29%），或从雪原钓鱼获得的冰冻匣、针叶木匣中开出；也可将雪球炮或冰雪刃丢入微光获得';

// 12 件哨兵武器：酒馆老板出售 + 微光互嬗（保留原有微光来源对应关系）
// [en, 级别文案, 原微光来源中文名]
const SENTINEL = [
  ['Ballista Rod', 'magic', '爆炸烈焰魔杖'],
  ['Ballista Cane', 'cane', '爆炸烈焰手杖'],
  ['Ballista Staff', 'staff', '爆炸烈焰法杖'],
  ['Explosive Trap Rod', 'magic', '弩车魔杖'],
  ['Explosive Trap Cane', 'cane', '弩车手杖'],
  ['Explosive Trap Staff', 'staff', '弩车法杖'],
  ['Flameburst Rod', 'magic', '闪电光环魔杖'],
  ['Flameburst Cane', 'cane', '闪电光环手杖'],
  ['Flameburst Staff', 'staff', '闪电光环法杖'],
  ['Lightning Aura Rod', 'magic', '爆炸陷阱魔杖'],
  ['Lightning Aura Cane', 'cane', '爆炸陷阱手杖'],
  ['Lightning Aura Staff', 'staff', '爆炸陷阱法杖'],
];
const LEVEL_TEXT = {
  // 魔杖级"一直有售"，实际门槛是酒馆老板出现（击败世吞/克脑）
  magic: '由酒馆老板出售（5 护卫奖章，一直有售；酒馆老板需击败世界吞噬怪或克苏鲁之脑后才会以昏迷男子形式出现，护卫奖章通过撒旦军队事件获得）',
  cane: '由酒馆老板出售（15 护卫奖章，需击败至少一个机械 Boss 后解锁）',
  staff: '由酒馆老板出售（60 护卫奖章，需击败石巨人后解锁）',
};

// ---------- 1) v3 ob 更新 ----------
let v3 = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');
let ok = 0, skip = 0;

function patchEntry(src, en, newOb, tag) {
  const ai = src.indexOf('"en":"' + en + '"');
  if (ai < 0) { console.log('  跳过(未找到 en):', tag); return null; }
  const win = src.slice(ai, ai + 900);
  const m = win.match(/"ob":"[^"]*"/);
  if (!m) { console.log('  跳过(ob 未匹配):', tag); return null; }
  if (m[0] === '"ob":"' + newOb + '"') { skip++; return src; }
  return src.slice(0, ai + m.index) + '"ob":"' + newOb + '"' + src.slice(ai + m.index + m[0].length);
}

v3 = patchEntry(v3, 'Glacier Fang', glacierFang, '冰川之牙') || v3;
ok++;
SENTINEL.forEach(([en, lv]) => {
  const prev = SENTINEL.find(x => x[0] === en); // 光源名
  const shimmer = SENTINEL.find(x => x[2] && false); // noop
  const src = SENTINEL.find(s => s[0] === en);
  const fromZh = src[2];
  const newOb = LEVEL_TEXT[lv] + '；也可将' + fromZh + '丢入微光获得（四种同级哨兵武器可互嬗）';
  const nv = patchEntry(v3, en, newOb, en);
  if (nv) { v3 = nv; ok++; }
});
fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3);
console.log('1) v3 更新', ok, '条，跳过(已同值)', skip, '条');

// ---------- 2) obt 表同步（范围限定） ----------
let rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
const obtStart = rw.indexOf('"obt":{');
if (obtStart < 0) throw new Error('obt 表未找到');
let obtOk = 0;
function patchObt(en, newOb) {
  const rel = rw.indexOf('"' + en + '":"', obtStart);
  if (rel < 0) { console.log('  obt 无键:', en); return; }
  const vs = rel + en.length + 4;
  const ve = rw.indexOf('"', vs);
  if (rw.slice(vs, ve) === newOb) return;
  rw = rw.slice(0, vs) + newOb + rw.slice(ve);
  obtOk++;
}
patchObt('Glacier Fang', glacierFang);
SENTINEL.forEach(([en, lv]) => {
  const src = SENTINEL.find(s => s[0] === en);
  const newOb = LEVEL_TEXT[lv] + '；也可将' + src[2] + '丢入微光获得（四种同级哨兵武器可互嬗）';
  patchObt(en, newOb);
});
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), rw);
console.log('2) obt 表同步', obtOk, '键');
console.log('DONE');
