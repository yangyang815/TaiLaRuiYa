/** 全量拉取 wiki Items 表 + 1.4.5 新增物品清单 */
const fs = require('fs');
const R = p => 'D:/小程序库/泰拉瑞亚/' + p;
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  // 1. cargo Items 全量（分页 500）
  const all = {};
  let offset = 0;
  while (true) {
    const url = 'https://terraria.wiki.gg/api.php?action=cargoquery&format=json&tables=Items&fields=name,itemid,exclusive&limit=500&offset=' + offset;
    let rows = null;
    for (let r = 0; r < 4 && !rows; r++) {
      try {
        const j = await (await fetch(url)).json();
        if (j.error) { console.log('cargo err', j.error.code, '退避30s'); await sleep(30000); continue; }
        rows = (j.cargoquery || []).map(x => x.title);
      } catch (e) { console.log('网络错误', e.message.slice(0, 30), '退避20s'); await sleep(20000); }
    }
    if (!rows || !rows.length) break;
    rows.forEach(x => { if (x.name) all[x.name] = x.itemid; });
    console.log('cargo 已取:', Object.keys(all).length, '@offset', offset);
    offset += 500;
    if (rows.length < 500) break;
    await sleep(2500);
  }
  fs.writeFileSync(R('scripts/wiki-all-items.json'), JSON.stringify(all, null, 1));
  console.log('cargo Items 总数:', Object.keys(all).length);

  // 2. EN 1.4.5 版本页
  try {
    const j = await (await fetch('https://terraria.wiki.gg/api.php?action=parse&page=1.4.5&format=json&prop=wikitext&redirects=1')).json();
    if (j.parse) {
      const t = j.parse.wikitext['*'];
      fs.writeFileSync(R('scripts/wiki-145.txt'), t);
      console.log('1.4.5 页长度:', t.length);
    } else console.log('1.4.5 页不存在');
  } catch (e) { console.log('1.4.5 页抓取失败', e.message.slice(0, 40)); }
  console.log('完成');
})();
