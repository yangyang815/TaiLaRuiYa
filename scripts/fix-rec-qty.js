/**
 * rec 表补数量槽：rec 材料英文名 --zh表--> 中文 --匹配--> 现行渲染行
 */
const fs = require('fs');
const R = p => 'D:/小程序库/泰拉瑞亚/' + p;
function extractObj(src, key) {
  const k = '"' + key + '":{';
  const i = src.indexOf(k);
  let depth = 0, end = -1;
  for (let c = i + k.length - 1; c < src.length; c++) {
    if (src[c] === '{') depth++;
    else if (src[c] === '}') { depth--; if (depth === 0) { end = c; break; } }
  }
  return { obj: JSON.parse(src.slice(i + k.length - 1, end + 1)), start: i + k.length - 1, end: end + 1 };
}

const CUR = JSON.parse(fs.readFileSync(R('scripts/current-recipes.json'), 'utf8'));
const CURR = { '电脑版': 1, '主机版': 1, '移动版': 1 };
const zh = require(R('pkg-recipe/data/recipes-wiki.js')).zh;
const en2zh = nm => zh[nm] || nm;

function curRows(en) {
  const rows = CUR[en];
  if (!rows) return null;
  const cur = rows.filter(r => r.plats.length === 0 || r.plats.some(p => CURR[p]));
  return cur.length ? cur : null;
}

let src = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
const recE = extractObj(src, 'rec');
const stats = { rows: 0, skip: 0, unchanged: 0 };
const fails = [];
Object.keys(recE.obj).forEach(en => {
  const rows = curRows(en);
  if (!rows) return;
  recE.obj[en].forEach((row, bi) => {
    if (!row.i || !Array.isArray(row.i)) return;
    const curRow = rows[bi];
    let ok = true;
    const newI = row.i.map(mat => {
      const nm = mat[0];
      const zhN = en2zh(nm);
      let q = null;
      if (curRow) {
        const hit = curRow.mats.find(x => x.n === zhN);
        if (hit) q = hit.q;
      }
      if (q === null) {
        const hits = [];
        rows.forEach(r => { const h = r.mats.find(x => x.n === zhN); if (h) hits.push(h.q); });
        if (hits.length === 1) q = hits[0];
        else if (hits.length && new Set(hits).size === 1) q = hits[0];
        else { ok = false; return mat; }
      }
      return [nm, q];
    });
    if (!ok) { stats.skip++; fails.push([en, bi, JSON.stringify(row.i)]); return; }
    if (JSON.stringify(row.i) !== JSON.stringify(newI)) { row.i = newI; stats.rows++; }
    else stats.unchanged++;
  });
});
src = src.slice(0, recE.start) + JSON.stringify(recE.obj) + src.slice(recE.end);
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), src);
fs.writeFileSync(R('scripts/rec-qty-fails.json'), JSON.stringify(fails, null, 1));
console.log('rec 补数量行:', stats.rows, '| 已正确:', stats.unchanged, '| 跳过:', stats.skip);
