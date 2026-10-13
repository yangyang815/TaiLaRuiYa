// 对比 aec4994（上一提交）与当前 v1/v2/v3 的 ob 变化，检测错位污染
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);
function loadStr(s) { let t = s.slice(s.indexOf('[')).replace(/;\s*$/, ''); return JSON.parse(t); }

['pkg-cat-1/data/data-v1.js', 'pkg-cat-2/data/data-v2.js', 'pkg-cat-3/data/data-v3.js'].forEach(rel => {
  const oldS = execSync('git show aec4994:' + rel, { maxBuffer: 200 * 1024 * 1024 }).toString();
  const newS = fs.readFileSync(R(rel), 'utf8');
  const A = loadStr(oldS), B = loadStr(newS);
  const Bm = new Map(B.map(i => [i.n + '|' + i.en + '|' + i.c, i]));
  let changed = [], unexpected = 0;
  for (const a of A) {
    const b = Bm.get(a.n + '|' + a.en + '|' + a.c);
    if (!b) { changed.push([a.n, a.en, a.c, '条目消失', a.ob, '']); continue; }
    if (a.ob !== b.ob) {
      // 变化是否合理：新 ob 应以 合成： 开头且包含 × 或 各材料
      const reasonable = b.ob.startsWith('合成：') && (b.ob.includes('×') || b.ob.includes('各材料 1 个') || a.ob.startsWith('合成：'));
      if (!reasonable) unexpected++;
      changed.push([a.n, a.en, a.c, reasonable ? 'OK' : 'SUSPECT', a.ob, b.ob]);
    }
  }
  console.log('\n===== ' + rel + ' 变化 ' + changed.length + ' 条, 可疑 ' + unexpected + ' 条 =====');
  changed.filter(c => c[3] !== 'OK').slice(0, 20).forEach(c => {
    console.log('[' + c[2] + '] ' + c[0] + ' (' + c[1] + ') ' + c[3]);
    console.log('  旧: ' + (c[4] || '').slice(0, 90));
    console.log('  新: ' + (c[5] || '').slice(0, 90));
  });
});
