// 残差最终轮：剥已有数量 + 任意→任何+去括号注释 + 单材料分支保留 + 逐条重写
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);
function load(p) { let s = fs.readFileSync(p, 'utf8'); s = s.slice(s.indexOf('[')).replace(/;\s*$/, ''); return JSON.parse(s); }

const CACHE = __dirname + '/recipes-qty-cache.json';
const recipes = JSON.parse(fs.readFileSync(CACHE, 'utf8'));

function normName(m) {
  let x = m.replace(/×\d+$/g, '').trim();               // 剥已有数量
  x = x.replace(/（[^）]*）/g, '');                      // 去中文括号注释
  if (/^任意/.test(x)) x = x.replace(/^任意/, '任何');    // 任意→任何
  if (/^远古(.+)墙$/.test(m)) x = m.replace(/^远古/, ''); // 远古蓝砖墙→蓝砖墙（尊重 ob，对齐 wiki 行）
  return x.trim();
}

const FILES = [
  ['v3', 'pkg-cat-3/data/data-v3.js', __dirname + '/qty-fail.json'],
  ['v1', 'pkg-cat-1/data/data-v1.js', __dirname + '/qty-fail-v1.json'],
  ['v2', 'pkg-cat-2/data/data-v2.js', __dirname + '/qty-fail-v2.json'],
];
let totalPatched = 0, okNoChange = 0;
const still = [];
for (const [tag, rel, ff] of FILES) {
  const arr = load(R(rel));
  const fails = JSON.parse(fs.readFileSync(ff, 'utf8'));
  let raw = fs.readFileSync(R(rel), 'utf8');
  let dirty = false;
  for (const row of fails) {
    const n = row[0];
    const it = arr.find(i => i.n === n);
    if (!it || !it.en) { still.push([tag, n, '条目或 en 缺失']); continue; }
    const en = it.en;
    const list = recipes[en];
    if (!list) { still.push([tag, n, '仍无配方数据']); continue; }
    const ob = it.ob;
    const parts = ob.slice(3).split('；或 ');
    const newParts = [];
    let allOk = true;
    for (const part of parts) {
      const at = part.lastIndexOf(' @ ');
      if (at < 0) { allOk = false; break; }
      const matsZh = part.slice(0, at).split(' + ').map(x => x.trim()).filter(Boolean);
      const station = part.slice(at + 3);
      const want = matsZh.map(normName).sort().join('|');
      const cand = list.find(r => r.mats.map(m => normName(m.n)).sort().join('|') === want);
      if (!cand) {
        // 单材料分支：1:1 转换，数量 1，保留原样
        if (matsZh.length === 1) { newParts.push(part); continue; }
        allOk = false;
        still.push([tag, n, '匹配失败: ob=[' + matsZh.join(',') + '] wiki=[' + list.map(r => r.mats.map(m => m.n).join(',')).join('] [') + ']']);
        break;
      }
      const newMats = matsZh.map(m => {
        const nk = normName(m);
        const hit = cand.mats.find(x => normName(x.n) === nk);
        return (hit && hit.q > 1) ? (m.replace(/×\d+$/g, '') + '×' + hit.q) : m.replace(/×\d+$/g, '');
      }).join(' + ');
      newParts.push(newMats + ' @ ' + station);
    }
    if (!allOk) continue;
    const newOb = '合成：' + newParts.join('；或 ');
    if (newOb === ob) { okNoChange++; continue; }
    const anchor = '"en":"' + en + '"';
    let idx = -1, done = false;
    while ((idx = raw.indexOf(anchor, idx + 1)) >= 0) {
      let end = raw.indexOf('},{"n":"', idx);
      if (end < 0) end = raw.length;
      const win = raw.slice(idx, end);
      const m = win.match(/"ob":"[^"]*"/);
      if (!m) continue;
      raw = raw.slice(0, idx + m.index) + '"ob":"' + newOb + '"' + raw.slice(idx + m.index + m[0].length);
      done = true;
      break;
    }
    if (done) { totalPatched++; dirty = true; }
    else still.push([tag, n, '锚点未命中']);
  }
  if (dirty) fs.writeFileSync(R(rel), raw);
}
console.log('本轮真正修正:', totalPatched, '条 | 文案本已正确/保留:', okNoChange, '条 | 仍需人工:', still.length, '条');
fs.writeFileSync(__dirname + '/still-fail3.json', JSON.stringify(still, null, 1));
const byReason = {};
still.forEach(s => { const r = s[2].split(':')[0]; byReason[r] = (byReason[r] || 0) + 1; });
console.log('残差原因分布:', JSON.stringify(byReason));
const stillMatch = still.filter(s => s[2].startsWith('匹配失败'));
stillMatch.slice(0, 25).forEach(s => console.log('  [' + s[0] + '] ' + s[1] + ' :: ' + s[2].slice(0, 160)));
