/** 抓取 37 条疑似纯合成药水的 EN 全文，提取所有来源句 */
const fs = require('fs');
const R = p => 'D:/小程序库/泰拉瑞亚/' + p;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const items = require(R('data/items.js'));
const pots = items.filter(i => i.cat === 'potion' && !/箱|罐|掉落|出售|钓|卖|宝藏袋|开出/.test(i.obtain || ''));
const ENS = [...new Set(pots.map(i => i.en).filter(Boolean))];
console.log('待抓全文 en 数:', ENS.length);

(async () => {
  const out = {};
  const BATCH = 10;
  for (let i = 0; i < ENS.length; i += BATCH) {
    const batch = ENS.slice(i, i + BATCH);
    try {
      const url = 'https://terraria.wiki.gg/api.php?action=query&format=json&prop=revisions&rvslots=main&rvprop=content&redirects=1&titles=' + encodeURIComponent(batch.join('|'));
      const j = await (await fetch(url)).json();
      if (j.error) { console.log('批' + i, 'err', j.error.code); await sleep(20000); continue; }
      const pages = j.query.pages || {};
      for (const id of Object.keys(pages)) {
        const p = pages[id];
        let t = p.revisions && p.revisions[0] && p.revisions[0].slots && p.revisions[0].slots.main ? p.revisions[0].slots.main['*'] : null;
        if (!t) { out[p.title] = '(NOCONTENT)'; continue; }
        // 去 infobox
        let depth = 0, end = -1;
        for (let c = 0; c < t.length; c++) {
          if (t[c] === '{' && t[c + 1] === '{') { depth++; c++; }
          else if (t[c] === '}' && t[c + 1] === '}') { depth--; c++; if (depth === 0) { end = c; break; } }
        }
        let body = end > 0 ? t.slice(end + 1) : t;
        body = body.replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, '').replace(/<ref[^/]*\/>/g, '');
        // 来源句提取
        const flat = body.replace(/\n+/g, ' ');
        const sents = flat.split(/(?<=[.!?])\s+/).filter(s =>
          /found (?:in|on)|in .*chests|chests? (?:located|in|found)|drops? from|dropped by|sold by|purchas|can also be|in addition to being crafted|obtained from|rarely (?:found|spawn)|in (?:Gold|Shadow|Ivy|Ice|Water|Sand|Web|Jungle|Corrupt|Crimson|Hallowed|Locked|Lihzahrd|Storage|Blue|Biome|Pearlwood|Wooden|Boreal|Palm|Rich Mahogany|Ebonwood|Shadewood|Cactus|Fishing|Bramble|Defender|Oasis|Scarab) /i.test(s)
        );
        out[p.title] = sents.map(s => s.replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, '$2').replace(/\{\{[^}]*\}\}/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300));
      }
    } catch (e) { console.log('批' + i, 'err', e.message.slice(0, 40)); await sleep(20000); continue; }
    console.log('进度:', Math.min(i + BATCH, ENS.length), '/', ENS.length);
    await sleep(4000);
  }
  fs.writeFileSync(R('scripts/potion-sources.json'), JSON.stringify(out, null, 1));
  console.log('完成', Object.keys(out).length);
})();
