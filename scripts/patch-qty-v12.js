// v1（家具）+ v2（装备类）全量合成文案数量补全
// 复用 v3 管线与 recipes-qty-cache.json 缓存
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

function load(p) { let s = fs.readFileSync(p, 'utf8'); s = s.slice(s.indexOf('[')).replace(/;\s*$/, ''); return JSON.parse(s); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
const CACHE = __dirname + '/recipes-qty-cache.json';
const recipes = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};

function fixOb(src, en, newOb, tag) {
  const anchor = '"en":"' + en + '"';
  let idx = -1, changed = 0;
  while ((idx = src.indexOf(anchor, idx + 1)) >= 0) {
    let end = src.indexOf('},{"n":"', idx);
    if (end < 0) end = src.length;
    const win = src.slice(idx, end);
    const m = win.match(/"ob":"[^"]*"/);
    if (!m) continue;
    if (m[0] === '"ob":"' + newOb + '"') continue;
    src = src.slice(0, idx + m.index) + '"ob":"' + newOb + '"' + src.slice(idx + m.index + m[0].length);
    changed++;
  }
  return changed > 0 ? src : null;
}

async function fetchRecipes(ens) {
  const pending = ens.filter(en => !recipes[en]);
  console.log('  唯一成品:', ens.length, '| 缓存命中:', ens.length - pending.length, '| 需抓取:', pending.length);
  const BATCH = 25;
  for (let i = 0; i < pending.length; i += BATCH) {
    const batch = pending.slice(i, i + BATCH);
    const text = batch.map((en, bi) => `<div id="Q${bi}"></div>{{recipes|result=${en}}}`).join('\n');
    const url = 'https://terraria.wiki.gg/zh/api.php?action=parse&format=json&prop=text&contentmodel=wikitext&variant=zh-cn&text=' + encodeURIComponent(text);
    let html = '', ok = false;
    for (let attempt = 0; attempt < 4 && !ok; attempt++) {
      try {
        const j = await (await fetch(url)).json();
        if (j.error) {
          if (/ratelimit/i.test(j.error.code || '')) { console.log('  batch', i, 'ratelimited, backoff 25s'); await sleep(25000); continue; }
          console.log('  batch', i, 'ERR', j.error.code); break;
        }
        html = j.parse.text['*']; ok = true;
      } catch (e) { console.log('  batch', i, 'FETCH FAIL', e.message); await sleep(10000); }
    }
    if (!ok) continue;
    const segs = html.split(/<div id="Q\d+"><\/div>/).slice(1);
    batch.forEach((en, bi) => {
      const seg = segs[bi] || '';
      const trs = seg.split('<tr').filter(s => s.includes('<li'));
      const list = [];
      trs.forEach(tr => {
        const lis = tr.split('<li>').slice(1).map(x => x.split('</li>')[0]);
        const mats = [];
        let ok2 = true;
        lis.forEach(li => {
          const am = li.match(/<a [^>]*>([^<]+)<\/a>/);
          if (!am) { ok2 = false; return; }
          const name = am[1].replace(/\(Desktop[^)]*\)/g, '').trim();
          const txt = li.replace(/<[^>]+>/g, '').trim();
          const qm = txt.match(/(\d+)\s*$/);
          mats.push({ n: name, q: qm ? Number(qm[1]) : 1 });
        });
        if (ok2 && mats.length) list.push({ mats });
      });
      if (list.length) recipes[en] = list;
    });
    fs.writeFileSync(CACHE, JSON.stringify(recipes));
    if ((i / BATCH) % 10 === 0) console.log('  抓取进度:', Math.min(i + BATCH, pending.length), '/', pending.length);
    await sleep(1200);
  }
}

async function processFile(rel, tag) {
  console.log('\n===== ' + tag + ' =====');
  const arr = load(R(rel));
  let raw = fs.readFileSync(R(rel), 'utf8');
  const targets = arr.filter(it => (it.ob || '').startsWith('合成：') && !/[0-9]/.test((it.ob || '').split('@')[0]) && it.en);
  const ens = [...new Set(targets.map(t => t.en))];
  console.log('待补条目:', targets.length, '唯一成品:', ens.length);
  await fetchRecipes(ens);

  let patched = 0, failed = [];
  for (const it of targets) {
    const list = recipes[it.en];
    if (!list) { failed.push([it.n, it.en, '无配方数据']); continue; }
    const body = it.ob.slice(3);
    const parts = body.split('；或 ');
    const newParts = [];
    let allOk = true;
    for (const part of parts) {
      const at = part.lastIndexOf(' @ ');
      if (at < 0) { allOk = false; break; }
      const matsZh = part.slice(0, at).split(' + ').map(x => x.trim()).filter(Boolean);
      const station = part.slice(at + 3);
      const want = matsZh.slice().sort().join('|');
      const cand = list.find(r => r.mats.map(m => m.n).sort().join('|') === want);
      if (!cand) { allOk = false; break; }
      const newMats = matsZh.map(m => {
        const hit = cand.mats.find(x => x.n === m);
        return (hit && hit.q > 1) ? (m + '×' + hit.q) : m;
      }).join(' + ');
      newParts.push(newMats + ' @ ' + station);
    }
    if (!allOk || !newParts.length) { failed.push([it.n, it.en, '分支匹配失败']); continue; }
    const newOb = '合成：' + newParts.join('；或 ');
    const after = fixOb(raw, it.en, newOb, it.en);
    if (after !== null && after !== raw) { raw = after; patched++; }
  }
  fs.writeFileSync(R(rel), raw);
  console.log(tag + ' 完成: 更新 ' + patched + ' 处; 失败 ' + failed.length + ' 条');
  if (failed.length) fs.writeFileSync(__dirname + '/qty-fail-' + tag + '.json', JSON.stringify(failed, null, 1));
  return failed.length;
}

(async () => {
  let total = 0;
  total += await processFile('pkg-cat-1/data/data-v1.js', 'v1');
  total += await processFile('pkg-cat-2/data/data-v2.js', 'v2');
  console.log('\n总计更新:', total, '处');
})().catch(e => { console.error(e); process.exit(1); });
