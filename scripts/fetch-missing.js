/**
 * 补抓缺失的 v3 合成条目：先试普通模板（result=），空则试微光模板（special=Shimmer）
 */
const fs = require('fs');
const R = p => 'D:/小程序库/泰拉瑞亚/' + p;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function parseRows(html) {
  const trs = html.split('<tr ').slice(1);
  const rows = [];
  let lastStation = '';
  trs.forEach(tr => {
    const st = tr.match(/<td[^>]*class="station"[^>]*>([\s\S]*?)<\/td>/);
    if (st) {
      let txt = st[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().replace(/&amp;/g, '&').replace(/\s*或\s*/g, '或');
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
    const vn = tr.match(/<div class="version-note[^"]*">([\s\S]*?)<\/div>/);
    const plats = vn ? [...vn[1].matchAll(/<img alt="([^"]+)"/g)].map(m => m[1]) : [];
    rows.push({ mats, plats, station: lastStation });
  });
  return rows;
}

async function render(text) {
  const url = 'https://terraria.wiki.gg/zh/api.php?action=parse&format=json&prop=text&contentmodel=wikitext&variant=zh-cn&text=' + encodeURIComponent(text);
  for (let retry = 0; retry < 5; retry++) {
    try {
      const j = await (await fetch(url)).json();
      if (j.error && j.error.code === 'ratelimited') { await sleep(30000); continue; }
      if (j.error) return null;
      return j.parse.text['*'];
    } catch (e) { await sleep(15000); }
  }
  return null;
}

(async () => {
  const missing = JSON.parse(fs.readFileSync(R('scripts/missing-ens.json'), 'utf8'));
  const cur = JSON.parse(fs.readFileSync(R('scripts/current-recipes.json'), 'utf8'));
  const v3map = {};
  // v3 名映射（en -> 中文名，供微光行"输出===目标"过滤）
  let s = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');
  s = s.slice(s.indexOf('[')).replace(/;\s*$/, '');
  JSON.parse(s).forEach(it => { v3map[it.en] = it; });
  console.log('待补抓:', missing.length);
  const BATCH = 12;
  for (let i = 0; i < missing.length; i += BATCH) {
    const batch = missing.slice(i, i + BATCH).filter(en => !cur[en]);
    if (!batch.length) continue;
    // 普通模板
    const text1 = batch.map((en, bi) => '<div id="Q' + bi + '"></div>{{recipes|result=' + en + '}}').join('\n');
    const html1 = await render(text1);
    if (html1) {
      const segs = html1.split(/<div id="Q\d+"><\/div>/).slice(1);
      batch.forEach((en, bi) => {
        const rows = parseRows(segs[bi] || '');
        if (rows.length) cur[en] = rows;
      });
    }
    // 微光模板（补普通模板为空的）
    const needShim = batch.filter(en => !cur[en]);
    if (needShim.length) {
      const text2 = needShim.map((en, bi) => '<div id="S' + bi + '"></div>{{recipes|special=Shimmer|resultoringredient=' + en + '|transitionJAN2026=yes}}').join('\n');
      const html2 = await render(text2);
      if (html2) {
        const segs2 = html2.split(/<div id="S\d+"><\/div>/).slice(1);
        needShim.forEach((en, bi) => {
          const seg = segs2[bi] || '';
          const it = v3map[en];
          if (!it) return;
          // 微光表：无 station 列，每行 tr = 输出 td + 输入 td，双向行需按"输出===目标"过滤
          const trs = seg.split('<tr ').slice(1);
          const rows = [];
          trs.forEach(tr => {
            const res = tr.match(/<td class="result"[^>]*>[\s\S]*?<a [^>]*>([^<]+)<\/a>/);
            if (!res || res[1] !== it.n) return;
            const ing = tr.match(/<td class="ingredients">([\s\S]*?)<\/td>/);
            if (!ing) return;
            const mats = [];
            let ok = true;
            ing[1].split('<li>').slice(1).forEach(li => {
              li = li.split('</li>')[0];
              const am = li.match(/<a [^>]*>([^<]+)<\/a>/);
              if (!am) { ok = false; return; }
              const q = (li.match(/<span class="am">(\d+)<\/span>/) || [])[1];
              mats.push({ n: am[1].trim(), q: q ? Number(q) : 1 });
            });
            if (ok && mats.length) rows.push({ mats, plats: [], station: '微光' });
          });
          if (rows.length) cur[en] = rows;
        });
      }
    }
    fs.writeFileSync(R('scripts/current-recipes.json'), JSON.stringify(cur));
    console.log('进度:', Math.min(i + BATCH, missing.length), '/', missing.length);
    await sleep(2500);
  }
  // 统计
  const still = missing.filter(en => !cur[en]);
  console.log('补抓完成，仍缺失:', still.length, still.slice(0, 12).join(', '));
})();
