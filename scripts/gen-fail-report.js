// 生成失败条目对照报告：en / 当前 ob / wiki 缓存行 / 差异
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);
function load(p) { let s = fs.readFileSync(p, 'utf8'); s = s.slice(s.indexOf('[')).replace(/;\s*$/, ''); return JSON.parse(s); }

const recipes = JSON.parse(fs.readFileSync(__dirname + '/recipes-qty-cache.json', 'utf8'));
const files = [
  ['v3', 'pkg-cat-3/data/data-v3.js', __dirname + '/qty-fail.json'],
  ['v1', 'pkg-cat-1/data/data-v1.js', __dirname + '/qty-fail-v1.json'],
  ['v2', 'pkg-cat-2/data/data-v2.js', __dirname + '/qty-fail-v2.json'],
];

let out = [];
for (const [tag, dataFile, failFile] of files) {
  const arr = load(R(dataFile));
  const fails = JSON.parse(fs.readFileSync(failFile, 'utf8'));
  out.push('\n########## ' + tag + '（' + fails.length + ' 条）##########');
  for (const row of fails) {
    const n = row[0];
    const en = row.length >= 3 ? row[1] : '';
    const reason = row[row.length - 1];
    const it = arr.find(i => i.n === n && (!en || i.en === en));
    const ob = it ? it.ob : '(条目未找到: en=' + (it ? it.en : '?') + ')';
    out.push('\n【' + n + '】en=' + (it ? it.en : en) + ' | 原因: ' + reason);
    out.push('  ob: ' + ob);
    const list = recipes[en];
    if (!list) { out.push('  wiki: (缓存无配方)'); continue; }
    list.forEach((r, ri) => {
      const wikiMats = r.mats.map(m => m.n + (m.q > 1 ? '×' + m.q : '')).join(' + ');
      out.push('  wiki行' + (ri + 1) + ': ' + wikiMats + ' @ ' + '(站略)');
    });
    // 逐分支差异
    if (list && ob.startsWith('合成：')) {
      const parts = ob.slice(3).split('；或 ');
      parts.forEach((part, pi) => {
        const at = part.lastIndexOf(' @ ');
        if (at < 0) { out.push('  分支' + (pi + 1) + ': 无站点分隔'); return; }
        const matsZh = part.slice(0, at).split(' + ').map(x => x.trim()).filter(Boolean);
        const cand = list.find(r => r.mats.map(m => m.n).sort().join('|') === matsZh.slice().sort().join('|'));
        if (cand) out.push('  分支' + (pi + 1) + ': ✓可匹配(数量 ' + cand.mats.map(m => m.q).join(',') + ')');
        else {
          // 找最接近的行（材料数相同）
          const near = list.filter(r => r.mats.length === matsZh.length);
          out.push('  分支' + (pi + 1) + ': ✗ ob材料=[' + matsZh.join(',') + ']');
          if (near.length) near.slice(0, 2).forEach(r => out.push('      近似行: [' + r.mats.map(m => m.n).join(',') + '] 数量[' + r.mats.map(m => m.q).join(',') + ']'));
          else out.push('      (无同材料数的行, 共 ' + list.length + ' 行)');
        }
      });
    }
  }
}
fs.writeFileSync(__dirname + '/fail-report.txt', out.join('\n'));
console.log('报告已生成 fail-report.txt，行数:', out.join('\n').split('\n').length);
