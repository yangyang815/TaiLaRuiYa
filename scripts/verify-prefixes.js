const R = (p) => 'D:/小程序库/泰拉瑞亚/' + p;
const fs = require('fs');
const P = require(R('pkgB-guide/data/prefixes.js'));
const WIKI = JSON.parse(fs.readFileSync(R('scripts/prefix-wiki.json'), 'utf8'));
const sm = require(R('data/spritemap.js'));

// 1. 图标有效性
let iconBad = [];
const allArts = [];
P.PREFIXES.forEach(p => allArts.push(p.art));
P.ACCESSORY_LINES.forEach(l => allArts.push(l.icon));
allArts.forEach(a => { if (!sm[a]) iconBad.push(a); });
console.log('图标检查:', iconBad.length ? '✗ 缺失 ' + iconBad.join(',') : '全部有效 ✓');

// 2. 核心数值对照（wiki 单元格 → 期望值）
function expect(pool, en, col) {
  const row = WIKI[pool].find(r => r.en === en);
  if (!row) return null;
  const cells = row.cells;
  const header = WIKI[pool][0] ? WIKI[pool][0].cells : [];
  // header 第一格是列名行本身；用表头列名匹配
  const hrow = WIKI[pool][0];
  const idx = hrow.cells.indexOf(col);
  if (idx < 0) return null;
  // 行内 idx 对应 cells[idx]（cells[0] 是名字）
  return cells[idx] || '-';
}
const checks = [
  ['近战池·传奇', '近战', 'Legendary', '伤害', '+15%'],
  ['近战池·传奇攻速', '近战', 'Legendary', '速度', '+10%'],
  ['近战池·传奇暴击', '近战', 'Legendary', '暴击率', '+5%'],
  ['近战池·传奇体积', '近战', 'Legendary', '大小', '+10%'],
  ['近战池·传奇击退', '近战', 'Legendary', '击退', '+15%'],
  ['远程池·虚幻', '远程', 'Unreal', '伤害', '+15%'],
  ['远程池·虚幻暴击', '远程', 'Unreal', '暴击率', '+5%'],
  ['远程池·虚幻弹速', '远程', 'Unreal', '射弹速度', '+10%'],
  ['魔法池·神话', '魔法', 'Mythical', '伤害', '+15%'],
  ['魔法池·神话暴击', '魔法', 'Mythical', '暴击率', '+5%'],
  ['魔法池·神话魔耗', '魔法', 'Mythical', '魔力消耗', '−10%'],
  ['通用池·神级', '通用', 'Godly', '伤害', '+15%'],
  ['通用池·神级暴击', '通用', 'Godly', '暴击率', '+5%'],
  ['通用池·神级击退', '通用', 'Godly', '击退', '+15%'],
  ['通用池·恶魔暴击', '通用', 'Demonic', '暴击率', '+5%'],
  ['通用池·无情伤害', '通用', 'Ruthless', '伤害', '+18%'],
  ['通用池·无情击退', '通用', 'Ruthless', '击退', '−10%'],
  ['通用池·碎裂伤害', '通用', 'Broken', '伤害', '−30%'],
  ['通用池·碎裂击退', '通用', 'Broken', '击退', '−20%'],
  ['通用池·破损伤害', '通用', 'Damaged', '伤害', '−15%'],
  ['通用池·粗劣伤害', '通用', 'Shoddy', '伤害', '−10%'],
  ['通用池·粗劣击退', '通用', 'Shoddy', '击退', '−15%'],
  ['公共池·致命伤害', '公共', 'Deadly2', '伤害', '+10%'],
  ['公共池·致命速度', '公共', 'Deadly2', '速度', '+10%'],
  ['公共池·迅捷速度', '公共', 'Quick', '速度', '+10%'],
  ['公共池·迟钝速度', '公共', 'Sluggish', '速度', '−20%'],
  ['公共池·惹恼伤害', '公共', 'Annoying', '伤害', '−20%'],
  ['公共池·惹恼速度', '公共', 'Annoying', '速度', '−15%'],
  ['召唤池·传说伤害', '召唤', 'Fabled', '伤害', '+15%'],
  ['召唤池·传说穿透', '召唤', 'Fabled', '盔甲穿透', '+10'],
  ['召唤池·传说标记', '召唤', 'Fabled', '召唤标记伤害', '+3'],
  ['召唤池·传说击退', '召唤', 'Fabled', '击退', '+15%']
];
let fail = 0;
checks.forEach(([label, pool, en, col, want]) => {
  const got = expect(pool, en, col);
  const norm = (x) => String(x == null ? '' : x).replace('−', '-').trim();
  if (norm(got) !== norm(want)) { console.log('✗ ' + label + ': wiki=' + got + ' 期望=' + want); fail++; }
});
console.log('wiki 数值交叉验证:', fail ? fail + ' 处不一致' : checks.length + ' 项全部一致 ✓');

// 3. 库内数据断言（职业匹配+无旧错误残留）
const byId = {};
P.PREFIXES.forEach(p => byId[p.id] = p);
const asserts = [
  ['传奇数值', byId.px_legendary.stats.map(x => x.join('')).join(','), '伤害+15%,攻速+10%,暴击+5%,体积+10%,击退+15%'],
  ['虚幻暴击', byId.px_unreal.stats.find(x => x[0] === '暴击')[1], '+5%'],
  ['神话魔耗', byId.px_mythical.stats.find(x => x[0] === '魔耗')[1], '-10%'],
  ['无情分类', byId.px_ruthless.cat + '/' + byId.px_ruthless.cls, 'common/all'],
  ['神级名', byId.px_godly.name, '神级'],
  ['神级暴击', byId.px_godly.stats.find(x => x[0] === '暴击')[1], '+5%'],
  ['恶魔暴击', byId.px_demonic.stats.find(x => x[0] === '暴击')[1], '+5%'],
  ['碎裂无攻速', byId.px_broken.stats.some(x => x[0] === '攻速'), false],
  ['破损仅伤害', byId.px_damaged.stats.length, 1],
  ['惹恼双砍', byId.px_annoying.stats.map(x => x[0]).join(','), '伤害,攻速'],
  ['Fabled 分类', byId.px_fabled.cat + '/' + byId.px_fabled.cls, 'best/summon'],
  ['暴击系档数', P.ACCESSORY_LINES.find(l => l.key === 'crit').tiers.length, 2],
  ['饰品 best 险恶', P.ACCESSORY_LINES.find(l => l.key === 'dmg').best, '险恶'],
  ['饰品 best 护佑', P.ACCESSORY_LINES.find(l => l.key === 'def').best, '护佑'],
  ['近战速度系存在', P.ACCESSORY_LINES.some(l => l.key === 'mspd'), true],
  ['魔力系存在', P.ACCESSORY_LINES.some(l => l.key === 'mana'), true]
];
let aFail = 0;
asserts.forEach(([label, got, want]) => {
  const g = typeof got === 'string' ? got : String(got);
  const w = typeof want === 'string' ? want : String(want);
  if (g !== w) { console.log('✗ ' + label + ': 实际=' + g + ' 期望=' + w); aFail++; }
});
console.log('库内断言:', aFail ? aFail + ' 项失败' : asserts.length + ' 项全部通过 ✓');
console.log('词条总数:', P.PREFIXES.length, '| 饰品系:', P.ACCESSORY_LINES.length, '| TIPS:', P.TIPS.length);
