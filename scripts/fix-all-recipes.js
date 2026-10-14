/**
 * 配方数据总清算：按现行渲染（current-recipes.json，过滤现行平台行）重写四源
 * 1) v3 图鉴 ob  2) items.js 详情页 obtain  3) obt 表  4) rec 表数量槽
 * 特殊条目（上轮手写反转的真断钢剑/真永夜刃、永夜刃压缩写法）单独定制
 */
const fs = require('fs');
const R = p => 'D:/小程序库/泰拉瑞亚/' + p;
fs.mkdirSync(R('scripts/backup'), { recursive: true });

function loadV(p) { let s = fs.readFileSync(R(p), 'utf8'); s = s.slice(s.indexOf('[')).replace(/;\s*$/, ''); return JSON.parse(s); }
function extractObj(src, key) {
  const k = '"' + key + '":{';
  const i = src.indexOf(k);
  if (i < 0) return null;
  let depth = 0, end = -1;
  for (let c = i + k.length - 1; c < src.length; c++) {
    if (src[c] === '{') depth++;
    else if (src[c] === '}') { depth--; if (depth === 0) { end = c; break; } }
  }
  return { obj: JSON.parse(src.slice(i + k.length - 1, end + 1)), start: i + k.length - 1, end: end + 1 };
}

const CUR = JSON.parse(fs.readFileSync(R('scripts/current-recipes.json'), 'utf8'));
const CURR = { '电脑版': 1, '主机版': 1, '移动版': 1 };
const SKIP_EN = new Set(['Shellphone (Home)', 'Shellphone (Ocean)', 'Shellphone (Spawn)', 'Shellphone (Underworld)']);
// 现行行
function curRows(en) {
  const rows = CUR[en];
  if (!rows) return null;
  const cur = rows.filter(r => r.plats.length === 0 || r.plats.some(p => CURR[p]));
  return cur.length ? cur : null;
}
function fmtMats(mats) { return mats.map(m => m.q > 1 ? m.n + '×' + m.q : m.n).join(' + '); }
function expectedOb(rows) { return '合成：' + rows.map(r => fmtMats(r.mats) + ' @ ' + r.station).join('；或 '); }
function expectedDetail(rows) { return rows.map(r => r.station + '：' + fmtMats(r.mats)).join('；或 '); }

// 特殊定制（覆盖 expected）
const SPECIAL = {
  'True Excalibur': { ob: '合成：断钢剑 + 叶绿锭×24 @ 秘银砧或山铜砧' },
  "True Night's Edge": { ob: '合成：永夜刃 + 恐惧之魂×20 + 力量之魂×20 + 视域之魂×20 @ 秘银砧或山铜砧' },
  "Night's Edge": { ob: '合成：魔光剑（腐化世界）+ 村正 + 草剑 + 火山 @ 恶魔祭坛或猩红祭坛（各材料 1 个）；或 血腥屠刀（猩红世界）+ 村正 + 草剑 + 火山 @ 恶魔祭坛或猩红祭坛（各材料 1 个）' },
};
function finalOb(en, rows) { return SPECIAL[en] ? SPECIAL[en].ob : expectedOb(rows); }
function finalDetail(en, rows) {
  if (SPECIAL[en]) {
    // 从 ob 定制转详情页格式：把"合成："去掉、分支拆开
    return SPECIAL[en].ob.slice(3).split('；或 ').map(b => {
      const i = b.indexOf(' @ ');
      let mats = b.slice(0, i), st = b.slice(i + 3);
      const t = st.indexOf('（');
      if (t > 0) st = st.slice(0, t);
      // 去掉"（各材料 1 个）"后缀已在 st 截断中处理
      return st + '：' + mats;
    }).join('；或 ');
  }
  return expectedDetail(rows);
}

const stats = { v3: 0, v3_skip: 0, items: 0, obt: 0, obt_skip: 0, rec_rows: 0, rec_skip: 0 };
const fails = [];

// ============ 1. v3 ============
const v3 = loadV('pkg-cat-3/data/data-v3.js');
v3.forEach(it => {
  const ob = it.ob || '';
  if (!ob.startsWith('合成：') || SKIP_EN.has(it.en)) return;
  const rows = curRows(it.en);
  if (!rows) { stats.v3_skip++; return; }
  // 保留非合成尾缀分支
  const tails = ob.slice(3).split('；或 ').filter(b => !b.includes(' @ '));
  let nu = finalOb(it.en, rows);
  if (tails.length) nu += '；或 ' + tails.join('；或 ');
  if (nu !== ob) { it.ob = nu; stats.v3++; }
});
// 写回 v3（保留前缀）
{
  const src = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');
  const prefix = src.slice(0, src.indexOf('['));
  fs.copyFileSync(R('pkg-cat-3/data/data-v3.js'), R('scripts/backup/data-v3.js'));
  fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), prefix + JSON.stringify(v3) + ';');
  console.log('v3 写回: 修正', stats.v3, '跳过(无现行数据)', stats.v3_skip);
}

// ============ 2. items.js 详情页 ============
{
  let src = fs.readFileSync(R('data/items.js'), 'utf8');
  fs.copyFileSync(R('data/items.js'), R('scripts/backup/items.js'));
  const v3byN = new Map(v3.map(i => [i.n, i]));
  const nameRe = /name:"([^"]+)"/g;
  let m;
  const anchors = [];
  while ((m = nameRe.exec(src))) anchors.push({ n: m[1], pos: m.index });
  anchors.forEach((a, idx) => {
    const end = idx + 1 < anchors.length ? anchors[idx + 1].pos : src.length;
    const it = v3byN.get(a.n);
    if (!it) return;
    const ob = it.ob || '';
    if (!ob.startsWith('合成：') || SKIP_EN.has(it.en)) return;
    const rows = curRows(it.en);
    if (!rows) return;
    const win = src.slice(a.pos, end);
    const om = win.match(/obtain:"([^"]*)"/);
    if (!om) return;
    const nu = finalDetail(it.en, rows);
    if (nu === om[1]) return;
    src = src.slice(0, a.pos + om.index) + 'obtain:"' + nu + '"' + src.slice(a.pos + om.index + om[0].length);
    // 锚点位置失效：因长度变化，重算所有后续锚点
    const delta = nu.length - om[1].length;
    for (let k = idx + 1; k < anchors.length; k++) anchors[k].pos += delta;
    stats.items++;
  });
  fs.writeFileSync(R('data/items.js'), src);
  console.log('items.js 写回: 修正', stats.items);
}

// ============ 3. obt 表 ============
{
  let src = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
  fs.copyFileSync(R('pkg-recipe/data/recipes-wiki.js'), R('scripts/backup/recipes-wiki.js'));
  const e = extractObj(src, 'obt');
  Object.keys(e.obj).forEach(en => {
    const val = e.obj[en];
    if (!val.startsWith('合成：') || SKIP_EN.has(en)) return;
    const rows = curRows(en);
    if (!rows) { stats.obt_skip++; return; }
    const tails = val.slice(3).split('；或 ').filter(b => !b.includes(' @ '));
    let nu = finalOb(en, rows);
    if (tails.length) nu += '；或 ' + tails.join('；或 ');
    if (nu !== val) { e.obj[en] = nu; stats.obt++; }
  });
  src = src.slice(0, e.start) + JSON.stringify(e.obj) + src.slice(e.end);
  // ============ 4. rec 表数量槽 ============
  const recE = extractObj(src, 'rec');
  Object.keys(recE.obj).forEach(en => {
    const rows = curRows(en);
    if (!rows) return;
    const recRows = recE.obj[en];
    recRows.forEach((row, bi) => {
      if (!row.i || !Array.isArray(row.i)) return;
      // 优先同行对齐，其次跨行唯一匹配
      const curRow = rows[bi];
      let ok = true;
      const newI = row.i.map(mat => {
        const nm = mat[0];
        let q = null;
        if (curRow) {
          const hit = curRow.mats.find(x => x.n === nm);
          if (hit) q = hit.q;
        }
        if (q === null) {
          const hits = [];
          rows.forEach(r => { const h = r.mats.find(x => x.n === nm); if (h) hits.push(h.q); });
          if (hits.length === 1) q = hits[0];
          else if (new Set(hits).size === 1) q = hits[0];
          else { ok = false; return mat; }
        }
        return [nm, q];
      });
      if (!ok) { stats.rec_skip++; fails.push([en, bi, JSON.stringify(row.i)]); return; }
      const before = JSON.stringify(row.i);
      const after = JSON.stringify(newI);
      if (before !== after) { row.i = newI; stats.rec_rows++; }
    });
  });
  src = src.slice(0, recE.start) + JSON.stringify(recE.obj) + src.slice(recE.end);
  fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), src);
  console.log('obt 写回: 修正', stats.obt, '跳过', stats.obt_skip, '| rec 行补数量:', stats.rec_rows, '跳过', stats.rec_skip);
}

fs.writeFileSync(R('scripts/rec-qty-fails.json'), JSON.stringify(fails, null, 1));
console.log('全部完成', JSON.stringify(stats));
