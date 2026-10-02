// 搜索"类别词"命中修复（2026-10-02）
// 问题：搜"法杖"只命中名字含"法杖"二字的条目，"沙漠虎杖/猩红魔杖/爆炸烈焰哨兵召唤物"等搜不到。
// 方案：新增类别词→英文词干匹配层（法杖→Staff、魔杖→Wand、弓→Bow…），主包 dex 与分包 catalog 搜索共用。
const fs = require('fs');
const path = require('path');
const R = (p) => path.join(__dirname, '..', p);

// ---------- 1. utils/dex.js ----------
let d = fs.readFileSync(R('utils/dex.js'), 'utf8');
const rep = (src, oldS, newS, tag) => {
  if (src.indexOf(newS) >= 0) { console.log(tag, '已是新版，跳过'); return src; }
  if (src.indexOf(oldS) < 0) throw new Error('未找到: ' + tag);
  return src.replace(oldS, newS);
};
d = rep(d, 'const{ARTS:ARTS,RARITY:RARITY}=require("./arts");',
  'const{ARTS:ARTS,RARITY:RARITY}=require("./arts");const STEMS=require("./search-stems");', 'dex require');
d = rep(d, 'function search(kw){kw=(kw||"").trim().toLowerCase();if(!kw)return[];const idx=pyIndex();',
  'function search(kw){kw=(kw||"").trim().toLowerCase();if(!kw)return[];const stem=STEMS.stemOf(kw);const idx=pyIndex();', 'dex search 开头');
d = rep(d, 'if(tsc>sc)sc=tsc}if(sc)scored.push([sc,e])}',
  'if(tsc>sc)sc=tsc}if((!sc||sc<60)&&stem&&p.en.indexOf(stem)>=0)sc=60;if(sc)scored.push([sc,e])}', 'dex 词干匹配');
fs.writeFileSync(R('utils/dex.js'), d);
console.log('dex.js OK');

// ---------- 2. utils/catalog-search.js ----------
let c = fs.readFileSync(R('utils/catalog-search.js'), 'utf8');
const head = c.slice(0, 300);
if (head.indexOf('search-stems') < 0) {
  const firstReq = c.indexOf('require(');
  const lineStart = c.lastIndexOf('\n', firstReq) + 1;
  c = c.slice(0, lineStart) + 'const stems=require("./search-stems");' + c.slice(lineStart);
  console.log('catalog require OK');
} else { console.log('catalog require 已存在，跳过'); }
c = rep(c, 'const hits=all.filter(x=>terms.some(t=>inX(x,t)));',
  'const stem=stems.stemOf(kw);const hits=all.filter(x=>terms.some(t=>inX(x,t))||(stem&&(x.en||"").toLowerCase().indexOf(stem)>=0));', 'catalog 词干匹配');
fs.writeFileSync(R('utils/catalog-search.js'), c);
console.log('catalog-search.js OK');

// ---------- 3. pages/search/search.js：显示条数放宽 ----------
let sp = fs.readFileSync(R('pages/search/search.js'), 'utf8');
sp = rep(sp, 'const results=dex.search(kw).slice(0,12)', 'const results=dex.search(kw).slice(0,20)', '主包结果 12→20');
sp = rep(sp, 'catSearch.search(kw,50)', 'catSearch.search(kw,80)', '分包结果 50→80');
fs.writeFileSync(R('pages/search/search.js'), sp);
console.log('search.js OK');
