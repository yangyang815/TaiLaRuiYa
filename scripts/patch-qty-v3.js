// v3 全量合成文案数量补全 + 五条指定武器文案修正
// 数据源：terraria.wiki.gg/zh 渲染 {{recipes|result=EN}} 模板（variant=zh-cn）
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

function load(p) { let s = fs.readFileSync(p, 'utf8'); s = s.slice(s.indexOf('[')).replace(/;\s*$/, ''); return JSON.parse(s); }
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const v3 = load(R('pkg-cat-3/data/data-v3.js'));
  let raw = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');

  // ---------- 1. 收集待补条目（"合成：" 且 @ 前无数字） ----------
  const targets = v3.filter(it => (it.ob || '').startsWith('合成：') && !/[0-9]/.test(it.ob.split('@')[0]) && it.en && it.en !== '');
  const ens = [...new Set(targets.map(t => t.en))];
  console.log('待补条目:', targets.length, '唯一成品:', ens.length);

  // ---------- 2. 批量渲染配方表（带缓存续传 + 限流退避） ----------
  const CACHE = __dirname + '/recipes-qty-cache.json';
  const recipes = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
  const pending = ens.filter(en => !recipes[en]);
  console.log('缓存已有:', Object.keys(recipes).length, '待抓取:', pending.length);
  const BATCH = 25;
  for (let i = 0; i < pending.length; i += BATCH) {
    const batch = pending.slice(i, i + BATCH);
    const text = batch.map((en, bi) => `<div id="Q${bi}"></div>{{recipes|result=${en}}}`).join('\n');
    const url = 'https://terraria.wiki.gg/zh/api.php?action=parse&format=json&prop=text&contentmodel=wikitext&variant=zh-cn&text=' + encodeURIComponent(text);
    let html = '', ok = false;
    for (let attempt = 0; attempt < 3 && !ok; attempt++) {
      try {
        const j = await (await fetch(url)).json();
        if (j.error) {
          if (/ratelimit/i.test(j.error.code || '')) { console.log('batch', i, 'ratelimited, backoff 20s'); await sleep(20000); continue; }
          console.log('batch', i, 'ERR', j.error.code); break;
        }
        html = j.parse.text['*']; ok = true;
      } catch (e) { console.log('batch', i, 'FETCH FAIL', e.message); await sleep(8000); }
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
    if ((i / BATCH) % 8 === 0) console.log('进度:', Math.min(i + BATCH, pending.length), '/', pending.length);
    await sleep(1200);
  }
  console.log('配方抓取完成:', Object.keys(recipes).length, '/', ens.length, '个成品');
  fs.writeFileSync(__dirname + '/recipes-qty-cache.json', JSON.stringify(recipes, null, 1));

  // ---------- 3. 应用数量到 ob ----------
  const key = arr => arr.map(m => m.n).sort().join('|');
  const recipeIdx = {}; // en -> [matsKey]
  for (const [en, list] of Object.entries(recipes)) recipeIdx[en] = list;

  let patched = 0, failed = [];
  const failBy = {};
  const newObMap = {}; // en -> newOb（同 en 的多条目共用）
  for (const it of targets) {
    const list = recipes[it.en];
    if (!list) { failed.push([it.n, '无配方数据']); continue; }
    // 解析 ob 分支
    const ob = it.ob;
    const body = ob.slice(3); // 去掉 "合成："
    const parts = body.split('；或 ');
    const newParts = [];
    let allOk = true;
    for (const part of parts) {
      const at = part.lastIndexOf(' @ ');
      if (at < 0) { allOk = false; break; }
      const matsZh = part.slice(0, at).split(' + ').map(x => x.trim()).filter(Boolean);
      const station = part.slice(at + 3);
      // 找匹配配方（材料中文名集合相等）
      const want = matsZh.slice().sort().join('|');
      const cand = list.find(r => r.mats.map(m => m.n).sort().join('|') === want);
      if (!cand) { allOk = false; break; }
      // 数量映射
      const qmap = {}; cand.mats.forEach(m => { qmap[m.n] = m.q; });
      const newMats = matsZh.map(m => {
        const zhN = cand.mats.find(x => x.n === m);
        return (zhN && zhN.q > 1) ? (m + '×' + zhN.q) : m;
      }).join(' + ');
      newParts.push(newMats + ' @ ' + station);
    }
    if (!allOk || !newParts.length) { failed.push([it.n, '分支匹配失败']); failBy[it.c] = (failBy[it.c] || 0) + 1; continue; }
    newObMap[it.en] = '合成：' + newParts.join('；或 ');
  }

  // ---------- 4. 写回（字符串级替换，锚点 "en":"X" 条目边界内 "ob":"..."） ----------
  function fixOb(src, en, newOb, tag) {
    const anchor = '"en":"' + en + '"';
    let idx = -1, count = 0, changed = 0;
    while ((idx = src.indexOf(anchor, idx + 1)) >= 0) {
      count++;
      let end = src.indexOf('},{"n":"', idx);
      if (end < 0) end = src.length;
      const win = src.slice(idx, end);
      const m = win.match(/"ob":"[^"]*"/);
      if (!m) continue;
      if (m[0] === '"ob":"' + newOb + '"') continue;
      src = src.slice(0, idx + m.index) + '"ob":"' + newOb + '"' + src.slice(idx + m.index + m[0].length);
      changed++;
    }
    if (!count) console.log('  [MISS] ' + tag);
    else if (changed) console.log('  [OK] ' + tag);
    else console.log('  [SKIP] ' + tag);
    return src;
  }

  // 4a. 批量数量补全
  Object.entries(newObMap).forEach(([en, newOb]) => { const before = raw; raw = fixOb(raw, en, newOb, en); if (raw !== before) patched++; });

  // 4b. 五条定制修正（锚点为数据文件中的 en 字段）
  const FIX = [];
  FIX.push(['Killing Deck', '困难模式中的血月期间由巫师出售（20 金）；1.4.5 新增魔法武器，发射可在 5 秒后返回并无限穿透的致命卡牌，返回时造成 150% 伤害']);
  FIX.push(['Finch Staff', '有 1/3 概率在生命树中的生命木箱内找到；新创建的旅行模式角色会自带一把；也可将生命木魔棒丢入微光转换获得']);
  FIX.push(['Flinx Staff', '合成：小雪怪皮毛×6 + 金锭×10 @ 工作台；或 小雪怪皮毛×6 + 铂金锭×10 @ 工作台；小雪怪皮毛由冰雪生物群系的敌怪小雪怪掉落（1–2 个）']);
  FIX.push(['Gatligator', '困难模式中由旅商出售（35 金，随机库存）；射速与巨兽鲨相同，并有 50% 几率不消耗弹药']);
  FIX.forEach(([en2, ob]) => { const before = raw; raw = fixOb(raw, en2, ob, en2); if (raw !== before) patched++; });

  fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), raw);
  console.log('\n完成: 更新 ' + patched + ' 处; 批量匹配失败 ' + failed.length + ' 条');
  if (failed.length) {
    console.log('失败分布(按分类):', JSON.stringify(failBy));
    fs.writeFileSync(__dirname + '/qty-fail.json', JSON.stringify(failed, null, 1));
    failed.slice(0, 25).forEach(f => console.log('  [FAIL] ' + f[0] + ' :: ' + f[1]));
  }
})().catch(e => { console.error(e); process.exit(1); });
