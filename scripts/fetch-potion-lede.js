/** 批量抓取药水 EN wiki 首段，提取非合成来源 */
const fs = require('fs');
const R = p => 'D:/小程序库/泰拉瑞亚/' + p;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const items = require(R('data/items.js'));
const pots = items.filter(i => i.cat === 'potion');
const ENS = [...new Set(pots.map(i => i.en).filter(Boolean))];
console.log('药水成品 en 数:', ENS.length);

(async () => {
  const out = fs.existsSync(R('scripts/potion-lede.json')) ? JSON.parse(fs.readFileSync(R('scripts/potion-lede.json'), 'utf8')) : {};
  const BATCH = 10;
  for (let i = 0; i < ENS.length; i += BATCH) {
    const batch = ENS.slice(i, i + BATCH).filter(en => !out[en]);
    if (!batch.length) continue;
    let html = '';
    try {
      const url = 'https://terraria.wiki.gg/api.php?action=query&format=json&prop=revisions&rvslots=main&rvprop=content&redirects=1&titles=' + encodeURIComponent(batch.join('|'));
      const j = await (await fetch(url)).json();
      if (j.error) { console.log('批' + i, 'err', j.error.code); await sleep(25000); continue; }
      const pages = j.query.pages || {};
      for (const id of Object.keys(pages)) {
        const p = pages[id];
        let t = p.revisions && p.revisions[0] && p.revisions[0].slots && p.revisions[0].slots.main ? p.revisions[0].slots.main['*'] : null;
        if (!t) continue;
        // 跳过 infobox（括号配对）
        let depth = 0, end = -1;
        for (let c = 0; c < t.length; c++) {
          if (t[c] === '{' && t[c + 1] === '{') { depth++; c++; }
          else if (t[c] === '}' && t[c + 1] === '}') { depth--; c++; if (depth === 0) { end = c; break; } }
        }
        let body = end > 0 ? t.slice(end + 1) : t;
        body = body.replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, '').replace(/<ref[^/]*\/>/g, '');
        const paras = body.split(/\n\n+/).map(x => x.trim()).filter(x => x && !x.startsWith('{') && !x.startsWith('#') && !x.startsWith('|'));
        out[p.title] = (paras[0] || '').slice(0, 1500);
      }
    } catch (e) { console.log('批' + i, '网络错误', e.message.slice(0, 40), '退避25s'); await sleep(25000); continue; }
    fs.writeFileSync(R('scripts/potion-lede.json'), JSON.stringify(out, null, 1));
    console.log('进度:', Math.min(i + BATCH, ENS.length), '/', ENS.length, '已存:', Object.keys(out).length);
    await sleep(5000);
  }
  console.log('完成。覆盖:', Object.keys(out).length, '/', ENS.length);
})();
