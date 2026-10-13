// 扫描 items.js 材料数量 vs wiki 缓存
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

const zhTable = require(R('pkg-recipe/data/recipes-wiki.js')).zh;
const enByZh = {};
Object.entries(zhTable).forEach(([en, zh]) => { if (!enByZh[zh]) enByZh[zh] = en; });
const cache = JSON.parse(fs.readFileSync(__dirname + '/recipes-qty-cache.json', 'utf8'));

let s = fs.readFileSync(R('data/items.js'), 'utf8');
const arr = require(R('data/items.js'));
console.log('条目总数:', arr.length);

const mismatch = [];
arr.forEach(it => {
  const ob = it.obtain || '';
  const m = ob.match(/^(熔炉|铁砧|铅砧|秘银砧|山铜砧|工匠作坊|工作台|自动锤炼机|晶体送入)：(.+)$/);
  if (!m) return;
  const mats = m[2].split(' + ').map(x => x.trim()).filter(Boolean);
  const en = it.en;
  const list = cache[en];
  if (!list) return;
  const want = mats.map(x => x.replace(/×\d+$/g, '')).sort().join('|');
  const cand = list.find(r => r.mats.map(mm => (enByZh[mm.n] || mm.n)).sort().join('|') === want);
  if (!cand) return;
  cand.mats.forEach(mm => {
    const zhN = enByZh[mm.n] || mm.n;
    const obMat = mats.find(x => x.replace(/×\d+$/g, '') === zhN);
    if (!obMat) return;
    const obQ = obMat.includes('×') ? Number(obMat.split('×')[1]) : 1;
    if (obQ !== mm.q) mismatch.push([it.name, it.en, obMat, zhN + '×' + mm.q]);
  });
});
console.log('详情页数量与 wiki 不一致:', mismatch.length, '条');
mismatch.forEach(x => console.log('  [' + x[0] + '] ' + x[2] + ' → 应为 ' + x[3]));
fs.writeFileSync(__dirname + '/obtain-qty-mismatch.json', JSON.stringify(mismatch, null, 1));
