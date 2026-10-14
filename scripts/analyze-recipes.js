/**
 * 分析：现行配方（current-recipes.json，已过滤现行平台）vs 四源
 * 输出 scripts/analyze-report.txt
 */
const fs = require('fs');
const R = p => 'D:/小程序库/泰拉瑞亚/' + p;
function loadV(p) { let s = fs.readFileSync(R(p), 'utf8'); s = s.slice(s.indexOf('[')).replace(/;\s*$/, ''); return JSON.parse(s); }

const CUR = JSON.parse(fs.readFileSync(R('scripts/current-recipes.json'), 'utf8'));
const CURR = { '电脑版': 1, '主机版': 1, '移动版': 1 };

function fmtMats(mats) { return mats.map(m => m.q > 1 ? m.n + '×' + m.q : m.n).join(' + '); }

// 期望合成文案（v3/obt 格式）
function expectedOb(rows) {
  const parts = rows.map(r => fmtMats(r.mats) + ' @ ' + r.station);
  return '合成：' + parts.join('；或 ');
}
// 期望详情页文案（单行：站点：材料；多行：站点：材料（或 站点：材料））
function expectedDetail(rows) {
  const parts = rows.map(r => r.station + '：' + fmtMats(r.mats));
  return parts.length === 1 ? parts[0] : parts.join('；或 ');
}

function matKey(str) {
  // "毒刺×12 + 丛林孢子×15" -> 排序键
  return str.split(' + ').map(x => x.replace(/×\d+$/, '').trim()).sort().join(',');
}
function qtyKey(str) {
  return str.split(' + ').map(x => x.trim()).sort().join(',');
}

const v3 = loadV('pkg-cat-3/data/data-v3.js');
const v3map = new Map(v3.map(i => [i.en, i]));
const itemsSrc = fs.readFileSync(R('data/items.js'), 'utf8');
const rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
// 括号配对提取整表（正则会被嵌套数组截断）
function extractObj(src, key) {
  const k = '"' + key + '":{';
  const i = src.indexOf(k);
  let depth = 0, end = -1;
  for (let c = i + k.length - 1; c < src.length; c++) {
    if (src[c] === '{') depth++;
    else if (src[c] === '}') { depth--; if (depth === 0) { end = c; break; } }
  }
  return JSON.parse(src.slice(i + k.length - 1, end + 1));
}
const obt = extractObj(rw, 'obt');
const rec = extractObj(rw, 'rec');

const rep = [];
const stats = { v3_total: 0, v3_ok: 0, v3_vermix: 0, v3_qty: 0, v3_mat: 0, v3_tails: 0, items_total: 0, items_ok: 0, items_bad: 0, obt_total: 0, obt_noqty: 0, obt_bad: 0, rec_rows: 0, rec_noqty: 0 };

// ---------- v3 ----------
const v3Issues = [];
v3.forEach(it => {
  const ob = it.ob || '';
  if (!ob.startsWith('合成：')) return;
  stats.v3_total++;
  const rows = CUR[it.en];
  if (!rows) return;
  // 过滤现行平台行
  const cur = rows.filter(r => r.plats.length === 0 || r.plats.some(p => CURR[p]));
  if (!cur.length) return;
  const exp = expectedOb(cur);
  // 分离现有 ob 的合成分支与尾缀
  const branches = ob.slice(3).split('；或 ');
  const synB = branches.filter(b => b.includes(' @ '));
  const tails = branches.filter(b => !b.includes(' @ '));
  if (tails.length) stats.v3_tails++;
  const curOb = '合成：' + synB.join('；或 ') + (tails.length ? '；或 ' + tails.join('；或 ') : '');
  if (curOb === exp) { stats.v3_ok++; return; }
  // 分类
  const expKeys = cur.map(r => matKey(fmtMats(r.mats))).sort().join('|');
  const curKeys = synB.map(b => matKey(b.split(' @ ')[0])).sort().join('|');
  if (expKeys !== curKeys) {
    // 材料集合不同：是被过滤掉的旧行混入，还是现行行材料变了？
    const oldRows = rows.filter(r => !(r.plats.length === 0 || r.plats.some(p => CURR[p])));
    const oldKeys = oldRows.map(r => matKey(fmtMats(r.mats))).sort().join('|');
    const isVermix = oldKeys === curKeys; // 现有分支恰好是被淘汰的旧平台行
    if (isVermix) { stats.v3_vermix++; v3Issues.push({ t: 'vermix', en: it.en, n: it.n, cur: ob, exp }); }
    else { stats.v3_mat++; v3Issues.push({ t: 'mat', en: it.en, n: it.n, cur: ob, exp, curRows: JSON.stringify(cur.map(r => r.mats.map(m => m.n))) }); }
  } else {
    stats.v3_qty++;
    v3Issues.push({ t: 'qty', en: it.en, n: it.n, cur: ob, exp });
  }
});

// ---------- items.js 详情页 ----------
const itemIssues = [];
// 逐条抓 name:"X" obtain:"Y"
const itRe = /name:"([^"]+)"[\s\S]{0,900}?obtain:"([^"]*)"/g;
let mm;
const idx = {};
let p = 0;
while ((mm = itRe.exec(itemsSrc))) {
  const name = mm[1];
  if (!idx[name]) idx[name] = [];
  idx[name].push({ obtain: mm[1], val: mm[2], pos: mm.index });
}
// items.js 与 v3 同名对应（v3.n == items.name）
v3.forEach(it => {
  const ob = it.ob || '';
  if (!ob.startsWith('合成：')) return;
  const rows = CUR[it.en];
  if (!rows) return;
  const cur = rows.filter(r => r.plats.length === 0 || r.plats.some(p => CURR[p]));
  if (!cur.length) return;
  // items.js 里同名条目（可能有多个，取第一个有 obtain 的）
  const cand = idx[it.n];
  if (!cand || !cand.length) return;
  stats.items_total++;
  const val = cand[0].val;
  if (!val || !val.includes('：')) { itemIssues.push({ en: it.en, n: it.n, cur: val, exp: expectedDetail(cur) }); stats.items_bad++; return; }
  // 解析 "站点：材料"（可能多分支 "；或 "）
  const curBranches = val.split('；或 ').map(b => { const i2 = b.indexOf('：'); return { st: b.slice(0, i2), mats: b.slice(i2 + 1) }; });
  const expOb = expectedDetail(cur);
  const expKey = cur.map(r => matKey(fmtMats(r.mats))).sort().join('|');
  const curKey = curBranches.map(b => matKey(b.mats)).sort().join('|');
  const expQty = cur.map(r => qtyKey(fmtMats(r.mats))).sort().join('|');
  const curQty = curBranches.map(b => qtyKey(b.mats)).sort().join('|');
  if (expKey === curKey && expQty === curQty) { stats.items_ok++; return; }
  stats.items_bad++;
  itemIssues.push({ en: it.en, n: it.n, cur: val, exp: expOb, t: expKey !== curKey ? 'mat' : 'qty' });
});

// ---------- obt 表 ----------
const obtIssues = [];
Object.keys(obt).forEach(en => {
  const val = obt[en];
  if (!val.startsWith('合成：')) return;
  stats.obt_total++;
  const rows = CUR[en];
  if (!rows) return;
  const cur = rows.filter(r => r.plats.length === 0 || r.plats.some(p => CURR[p]));
  if (!cur.length) return;
  const exp = expectedOb(cur);
  if (!/[×]\d/.test(val.split('@')[0])) { stats.obt_noqty++; obtIssues.push({ en, cur: val, exp, t: 'noqty' }); }
  else if (val !== exp) { stats.obt_bad++; obtIssues.push({ en, cur: val, exp, t: 'mismatch' }); }
});

// ---------- rec 表数量槽 ----------
const recIssues = [];
Object.keys(rec).forEach(en => {
  const rows = CUR[en];
  if (!rows) return;
  const cur = rows.filter(r => r.plats.length === 0 || r.plats.some(p => CURR[p]));
  if (!cur.length) return;
  const parsed = rec[en];
  stats.rec_rows += parsed.length;
  parsed.forEach((row, bi) => {
    const curRow = cur[bi];
    if (!curRow) return;
    const hasQty = row.i && row.i.some(m => m.length > 1 && typeof m[1] === 'number');
    if (!hasQty) { stats.rec_noqty++; recIssues.push({ en, bi, mats: JSON.stringify(row.i), curRow: JSON.stringify(curRow.mats) }); }
  });
});

// ---------- 输出 ----------
let out = [];
out.push('== 统计 ==');
out.push(JSON.stringify(stats, null, 1));
out.push('\n== v3 版本混排（混入旧平台行）' + stats.v3_vermix + ' 条 ==');
v3Issues.filter(x => x.t === 'vermix').slice(0, 30).forEach(x => out.push('【' + x.n + '】现:' + x.cur.slice(0, 100) + '\n  期望:' + x.exp.slice(0, 110)));
out.push('\n== v3 材料集合差异 ' + stats.v3_mat + ' 条 ==');
v3Issues.filter(x => x.t === 'mat').slice(0, 30).forEach(x => out.push('【' + x.n + '】现:' + x.cur.slice(0, 100) + '\n  期望:' + x.exp.slice(0, 110) + '\n  现行行材料:' + x.curRows));
out.push('\n== v3 仅数量差异 ' + stats.v3_qty + ' 条 ==');
v3Issues.filter(x => x.t === 'qty').slice(0, 15).forEach(x => out.push('【' + x.n + '】现:' + x.cur.slice(0, 90) + '\n  期望:' + x.exp.slice(0, 100)));
out.push('\n== v3 含非合成尾缀 ' + stats.v3_tails + ' 条（重写时需保留尾缀）==');
v3.forEach(it => {
  const ob = it.ob || '';
  if (!ob.startsWith('合成：')) return;
  const tails = ob.slice(3).split('；或 ').filter(b => !b.includes(' @ '));
  if (tails.length) out.push('  ' + it.n + ' :: ' + tails[0].slice(0, 60));
});
out.push('\n== items.js 差异 ' + stats.items_bad + '/' + stats.items_total + ' ==');
itemIssues.slice(0, 40).forEach(x => out.push('【' + x.n + '(' + x.t + ')】现:' + (x.cur || '').slice(0, 90) + '\n  期望:' + x.exp.slice(0, 100)));
out.push('\n== obt 无数量 ' + stats.obt_noqty + ' / 不匹配 ' + stats.obt_bad + '（总 ' + stats.obt_total + '）==');
obtIssues.slice(0, 20).forEach(x => out.push('[' + x.en + '] 现:' + x.cur.slice(0, 90) + '\n  期望:' + x.exp.slice(0, 100)));
out.push('\n== rec 行无数量槽 ' + stats.rec_noqty + '/' + stats.rec_rows + ' ==');
recIssues.slice(0, 15).forEach(x => out.push('[' + x.en + '#' + x.bi + '] ' + x.mats.slice(0, 90) + ' <- ' + x.curRow));

fs.writeFileSync(R('scripts/analyze-report.txt'), out.join('\n'));
console.log('分析完成: ' + JSON.stringify(stats));
