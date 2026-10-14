/**
 * 全量重抓现行配方（zh wiki 渲染，带平台标记）
 * 输出 scripts/current-recipes.json: { en: [{mats:[{n,q}],plats:[..],station:".."}] }
 * 幂等：按批断点续传（progress 存 scripts/current-recipes.progress.json）
 */
const fs = require('fs');
const R = p => 'D:/小程序库/泰拉瑞亚/' + p;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function loadV(p) { let s = fs.readFileSync(R(p), 'utf8'); s = s.slice(s.indexOf('[')).replace(/;\s*$/, ''); return JSON.parse(s); }

function parseRows(html) {
  const trs = html.split('<tr ').slice(1);
  const rows = [];
  let lastStation = '';
  trs.forEach(tr => {
    // 站点（可能 rowspan 共享）
    const st = tr.match(/<td[^>]*class="station"[^>]*>([\s\S]*?)<\/td>/);
    if (st) {
      let txt = st[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      txt = txt.replace(/&amp;/g, '&').replace(/\s*或\s*/g, '或');
      if (txt) lastStation = txt;
    }
    const ing = tr.match(/<td class="ingredients">([\s\S]*?)<\/td>/);
    if (!ing) return;
    const mats = [];
    let ok = true;
    ing[1].split('<li>').slice(1).forEach(li => {
      li = li.split('</li>')[0];
      const am = li.match(/<a [^>]*>([^<]+)<\/a>/);
      if (!am) { ok = false; return; }
      const n = am[1].replace(/\(Desktop[^)]*\)/g, '').trim();
      const q = (li.match(/<span class="am">(\d+)<\/span>/) || [])[1];
      mats.push({ n, q: q ? Number(q) : 1 });
    });
    if (!ok || !mats.length) return;
    // 平台标记：version-note div 内的 img alt
    const vn = tr.match(/<div class="version-note[^"]*">([\s\S]*?)<\/div>/);
    const plats = vn ? [...vn[1].matchAll(/<img alt="([^"]+)"/g)].map(m => m[1]) : [];
    rows.push({ mats, plats, station: lastStation });
  });
  return rows;
}

(async () => {
  // 1. 收集全部成品 en：缓存 ∪ v3/items/obt 中的合成条目
  const cache = JSON.parse(fs.readFileSync(R('scripts/recipes-qty-cache.json'), 'utf8'));
  const ens = new Set(Object.keys(cache));
  const v3 = loadV('pkg-cat-3/data/data-v3.js');
  v3.forEach(it => { if ((it.ob || '').startsWith('合成：') && it.en) ens.add(it.en); });
  const itemsSrc = fs.readFileSync(R('data/items.js'), 'utf8');
  // items.js 无 en 与中文名直接对应的索引，先跳过（由 v3 覆盖，items 与 v3 同名对应）
  const rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
  const oi = rw.indexOf('"obt":{');
  const obSeg = rw.slice(oi, rw.indexOf('"zh"', oi) > 0 ? rw.indexOf('"zh"', oi) : rw.length);
  let m;
  const obtRe = /"([A-Za-z0-9 .'\-()!]+)":"合成：/g;
  while ((m = obtRe.exec(obSeg))) ens.add(m[1]);
  const list = [...ens];
  console.log('成品总数:', list.length);

  const out = fs.existsSync(R('scripts/current-recipes.json')) ? JSON.parse(fs.readFileSync(R('scripts/current-recipes.json'), 'utf8')) : {};
  const prog = fs.existsSync(R('scripts/current-recipes.progress.json')) ? JSON.parse(fs.readFileSync(R('scripts/current-recipes.progress.json'), 'utf8')) : { done: [] };
  const doneSet = new Set(prog.done);

  const BATCH = 25;
  for (let i = 0; i < list.length; i += BATCH) {
    const batch = list.slice(i, i + BATCH).filter(en => !doneSet.has(en));
    if (!batch.length) continue;
    const text = batch.map((en, bi) => '<div id="Q' + bi + '"></div>{{recipes|result=' + en.replace(/ /g, ' ') + '}}').join('\n');
    const url = 'https://terraria.wiki.gg/zh/api.php?action=parse&format=json&prop=text&contentmodel=wikitext&variant=zh-cn&text=' + encodeURIComponent(text);
    let html = '';
    let ok = false;
    for (let retry = 0; retry < 3 && !ok; retry++) {
      try {
        const j = await (await fetch(url)).json();
        if (j.error && j.error.code === 'ratelimited') { console.log('限流，退避 20s @批', i); await sleep(20000); continue; }
        if (j.error) { console.log('批', i, '错误:', j.error.code); break; }
        html = j.parse.text['*'];
        ok = true;
      } catch (e) { console.log('批', i, '网络错误:', e.message.slice(0, 60), '退避 10s'); await sleep(10000); }
    }
    if (!ok) { console.log('批', i, '跳过'); continue; }
    const segs = html.split(/<div id="Q\d+"><\/div>/).slice(1);
    batch.forEach((en, bi) => {
      const seg = segs[bi] || '';
      const rows = parseRows(seg);
      if (rows.length) out[en] = rows;
    });
    batch.forEach(en => doneSet.add(en));
    if ((i / BATCH) % 10 === 0) {
      console.log('进度:', Math.min(i + BATCH, list.length), '/', list.length, '已存成品:', Object.keys(out).length);
    }
    // 每批写盘（断点续传）
    fs.writeFileSync(R('scripts/current-recipes.json'), JSON.stringify(out));
    fs.writeFileSync(R('scripts/current-recipes.progress.json'), JSON.stringify({ done: [...doneSet] }));
    await sleep(1200);
  }
  console.log('完成。成品覆盖:', Object.keys(out).length, '/', list.length);
})();
