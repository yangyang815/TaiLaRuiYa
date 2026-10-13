// 失败条目逐条修正：补抓微光行 + 译名规范化 + 重新匹配重写
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);
const sleep = ms => new Promise(r => setTimeout(r, ms));
function load(p) { let s = fs.readFileSync(p, 'utf8'); s = s.slice(s.indexOf('[')).replace(/;\s*$/, ''); return JSON.parse(s); }

const CACHE = __dirname + '/recipes-qty-cache.json';
const recipes = JSON.parse(fs.readFileSync(CACHE, 'utf8'));

// 旧译名/错名 → wiki 现行名
const NAME_FIX = {
  '火山': '火焰大剑',
};
function fixName(m) {
  if (NAME_FIX[m]) return NAME_FIX[m];
  const wm = m.match(/^远古(.+)砖墙$/);
  if (wm) return wm[1] + '墙';
  return m;
}

async function renderBatch(text) {
  const url = 'https://terraria.wiki.gg/zh/api.php?action=parse&format=json&prop=text&contentmodel=wikitext&variant=zh-cn&text=' + encodeURIComponent(text);
  for (let a = 0; a < 4; a++) {
    try {
      const j = await (await fetch(url)).json();
      if (j.error) {
        if (/ratelimit/i.test(j.error.code || '')) { console.log('  ratelimited, backoff 25s'); await sleep(25000); continue; }
        return null;
      }
      return j.parse.text['*'];
    } catch (e) { await sleep(10000); }
  }
  return null;
}
function parseRows(html) {
  const trs = html.split('<tr').filter(s => s.includes('<li'));
  const list = [];
  trs.forEach(tr => {
    const lis = tr.split('<li>').slice(1).map(x => x.split('</li>')[0]);
    const firstA = tr.match(/<a [^>]*>([^<]+)<\/a>/);
    const result = firstA ? firstA[1].replace(/\(Desktop[^)]*\)/g, '').trim() : '';
    const mats = [];
    let ok = true;
    lis.forEach(li => {
      const am = li.match(/<a [^>]*>([^<]+)<\/a>/);
      if (!am) { ok = false; return; }
      const name = am[1].replace(/\(Desktop[^)]*\)/g, '').trim();
      const txt = li.replace(/<[^>]+>/g, '').trim();
      const qm = txt.match(/(\d+)\s*$/);
      mats.push({ n: name, q: qm ? Number(qm[1]) : 1 });
    });
    if (ok && mats.length) list.push({ result, mats });
  });
  return list;
}

(async () => {
  // zh 表：en -> 中文名（用于过滤 shimmer 行的结果归属）
  const zhTable = require(R('pkg-recipe/data/recipes-wiki.js')).zh;

  const FILES = [
    ['v3', 'pkg-cat-3/data/data-v3.js', __dirname + '/qty-fail.json'],
    ['v1', 'pkg-cat-1/data/data-v1.js', __dirname + '/qty-fail-v1.json'],
    ['v2', 'pkg-cat-2/data/data-v2.js', __dirname + '/qty-fail-v2.json'],
  ];
  // 1. 收集全部失败条目 + 无配方 en
  const allFails = [];
  for (const [tag, rel, ff] of FILES) {
    JSON.parse(fs.readFileSync(ff, 'utf8')).forEach(row => {
      allFails.push({ tag, rel, n: row[0], en: row.length >= 3 ? row[1] : null });
    });
  }
  // 用数据文件修正 en（v3 清单是两元）
  for (const f of allFails) {
    const it = load(R(f.rel)).find(i => i.n === f.n);
    if (it) f.en = it.en;
  }
  const noDataEns = [...new Set(allFails.filter(f => !recipes[f.en]).map(f => f.en))];
  console.log('失败条目:', allFails.length, '| 无配方成品:', noDataEns.length);

  // 2. 补抓：普通 + shimmer
  const BATCH = 20;
  for (let i = 0; i < noDataEns.length; i += BATCH) {
    const batch = noDataEns.slice(i, i + BATCH);
    const text = batch.map((en, bi) =>
      `<div id="Q${bi}"></div>{{recipes|result=${en}}}\n<div id="S${bi}"></div>{{recipes|special=Shimmer|resultoringredient=${en}|transitionJAN2026=yes}}`
    ).join('\n');
    const html = await renderBatch(text);
    if (!html) { console.log('batch', i, '渲染失败'); continue; }
    batch.forEach((en, bi) => {
      const zhN = zhTable[en] || '';
      const seg = html.split(new RegExp('<div id="(?:Q|S)' + bi + '"><\\/div>')).slice(1).join('');
      const qPart = seg.split(new RegExp('<div id="S' + bi + '"><\\/div>'))[0];
      const sPart = seg.split(new RegExp('<div id="S' + bi + '"><\\/div>'))[1] || '';
      const merged = [];
      parseRows(qPart).forEach(r => { merged.push({ mats: r.mats }); });
      parseRows(sPart).forEach(r => { if (r.result === zhN && !merged.some(m => m.mats.map(x => x.n).join() === r.mats.map(x => x.n).join())) merged.push({ mats: r.mats }); });
      if (merged.length) recipes[en] = merged;
    });
    fs.writeFileSync(CACHE, JSON.stringify(recipes));
    if ((i / BATCH) % 4 === 0) console.log('补抓进度:', Math.min(i + BATCH, noDataEns.length), '/', noDataEns.length);
    await sleep(1300);
  }
  console.log('补抓后缓存:', Object.keys(recipes).length);

  // 3. 重新匹配重写
  const report = [];
  let totalPatched = 0, stillFail = [];
  for (const f of allFails) {
    const arr = load(R(f.rel));
    const it = arr.find(i => i.n === f.n);
    if (!it) { stillFail.push([f.tag, f.n, '条目未找到']); continue; }
    const list = recipes[f.en];
    if (!list) { stillFail.push([f.tag, f.n, '仍无配方数据']); continue; }
    const ob = it.ob;
    const parts = ob.slice(3).split('；或 ');
    const newParts = [];
    let allOk = true;
    for (const part of parts) {
      const at = part.lastIndexOf(' @ ');
      if (at < 0) { allOk = false; break; }
      const rawMats = part.slice(0, at).split(' + ').map(x => x.trim()).filter(Boolean);
      const station = part.slice(at + 3);
      const fixed = rawMats.map(fixName);
      const want = fixed.slice().sort().join('|');
      const cand = list.find(r => r.mats.map(m => m.n).sort().join('|') === want);
      if (!cand) { allOk = false; report.push('【' + f.tag + '/' + f.n + '】分支 ✗ ob=[' + fixed.join(',') + '] wiki行=[' + list.map(r => r.mats.map(m => m.n).join(',')).join('] [') + ']'); break; }
      const qmap = {}; cand.mats.forEach(m => { qmap[m.n] = m.q; });
      newParts.push(fixed.map(m => (qmap[m] > 1 ? m + '×' + qmap[m] : m)).join(' + ') + ' @ ' + station);
    }
    if (!allOk || !newParts.length) { stillFail.push([f.tag, f.n, '匹配失败']); continue; }
    const newOb = '合成：' + newParts.join('；或 ');
    if (newOb === ob) { stillFail.push([f.tag, f.n, '文案无变化']); continue; }
    // 写回
    let src = fs.readFileSync(R(f.rel), 'utf8');
    const anchor = '"en":"' + f.en + '"';
    let idx = -1, done = false;
    while ((idx = src.indexOf(anchor, idx + 1)) >= 0) {
      let end = src.indexOf('},{"n":"', idx);
      if (end < 0) end = src.length;
      const win = src.slice(idx, end);
      const m = win.match(/"ob":"[^"]*"/);
      if (!m) continue;
      if (m[0] === '"ob":"' + newOb + '"') { done = true; break; }
      src = src.slice(0, idx + m.index) + '"ob":"' + newOb + '"' + src.slice(idx + m.index + m[0].length);
      done = true;
      break;
    }
    if (done) { fs.writeFileSync(R(f.rel), src); totalPatched++; }
    else stillFail.push([f.tag, f.n, '锚点未命中']);
  }
  console.log('\n本轮修正:', totalPatched, '条; 仍失败:', stillFail.length, '条');
  fs.writeFileSync(__dirname + '/still-fail.json', JSON.stringify(stillFail, null, 1));
  fs.writeFileSync(__dirname + '/fail-report2.txt', report.join('\n'));
  const byTag = {};
  stillFail.forEach(s => byTag[s[0]] = (byTag[s[0]] || 0) + 1);
  console.log('残差分布:', JSON.stringify(byTag));
  stillFail.slice(0, 40).forEach(s => console.log('  [' + s[0] + '] ' + s[1] + ' :: ' + s[2]));
})().catch(e => { console.error(e); process.exit(1); });
